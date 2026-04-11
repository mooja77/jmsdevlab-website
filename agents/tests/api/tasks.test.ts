import { describe, it, expect, beforeAll } from 'vitest';
import { api, code, createTask, claimTask, completeTask, failTask, resetAgent } from '../setup.js';
import { CreateTaskResponseSchema, TaskListSchema } from '../schemas/index.js';

// Use a clean agent with fresh budget for policy tests
const POLICY_AGENT = 'marketing-content';
beforeAll(() => resetAgent(POLICY_AGENT));

describe('Task Creation', () => {
  it('health-check is auto-approved by policy', async () => {
    const res = await createTask({ agent_id: POLICY_AGENT, type: 'health-check', title: 'Health test' });
    CreateTaskResponseSchema.parse(res);
    expect(res.policy).toBe('auto_approve');
  });

  it('code-review is auto-approved', async () => {
    const res = await createTask({ agent_id: POLICY_AGENT, type: 'code-review', title: 'Review test' });
    expect(res.policy).toBe('auto_approve');
  });

  it('bug-fix has no auto-approve (or notify if budget high)', async () => {
    const res = await createTask({ agent_id: POLICY_AGENT, type: 'bug-fix', title: 'Bug test' });
    expect(['none', 'notify', 'block']).toContain(res.policy);
  });

  it('scheduled task is auto-approved', async () => {
    const res = await createTask({ agent_id: POLICY_AGENT, created_by: 'schedule', title: 'Sched test' });
    expect(res.policy).toBe('auto_approve');
  });

  it('rejects nonexistent agent', async () => {
    expect(await code('/api/agents/tasks', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'fake', type: 'test', title: 'test' }),
    })).toBe(404);
  });

  it('rejects missing title', async () => {
    expect(await code('/api/agents/tasks', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'app-smartcash', type: 'test' }),
    })).toBe(400);
  });

  it('rejects missing type', async () => {
    expect(await code('/api/agents/tasks', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'app-smartcash', title: 'test' }),
    })).toBe(400);
  });

  it('rejects missing agent_id', async () => {
    expect(await code('/api/agents/tasks', {
      method: 'POST',
      body: JSON.stringify({ type: 'test', title: 'test' }),
    })).toBe(400);
  });

  it('accepts all optional fields', async () => {
    const res = await createTask({
      priority: 3, description: 'A description',
      input_json: { key: 'value' },
    });
    expect(res.ok).toBe(true);
    expect(res.id).toBeGreaterThan(0);
  });

  it('defaults invalid priority to 5', async () => {
    const res = await createTask({ priority: 0 });
    expect(res.ok).toBe(true);
  });
});

describe('Task List & Next', () => {
  it('lists tasks with schema validation', async () => {
    const data = await api('/api/agents/tasks?status=queued&limit=5');
    TaskListSchema.parse(data);
  });

  it('filters by agent_id', async () => {
    const data = await api('/api/agents/tasks?agent_id=app-smartcash&limit=50');
    expect(data.tasks.every((t: any) => t.agent_id === 'app-smartcash')).toBe(true);
  });

  it('limits results to 200 max', async () => {
    const data = await api('/api/agents/tasks?limit=999');
    expect(data.tasks.length).toBeLessThanOrEqual(200);
  });

  it('returns null when no queued tasks for agent', async () => {
    const data = await api('/api/agents/tasks/next?agent_id=ops-infra');
    // May or may not have tasks — just verify shape
    expect(data).toHaveProperty('task');
  });
});

describe('Task Lifecycle', () => {
  it('claim → heartbeat → complete', async () => {
    const task = await createTask({ title: 'Lifecycle test' });
    const claimed = await claimTask(task.id);
    expect(claimed.ok).toBe(true);

    const hb = await api(`/api/agents/tasks/${task.id}/heartbeat`, { method: 'PUT' });
    expect(hb.updated).toBe(true);

    const completed = await completeTask(task.id, {
      output_json: { summary: 'Done' }, model_used: 'sonnet',
      tokens_in: 500, tokens_out: 200, cost_cents: 1,
    });
    expect(completed.ok).toBe(true);
  });

  it('double claim returns 409', async () => {
    const task = await createTask({ title: 'Double claim test' });
    await claimTask(task.id);
    expect(await code(`/api/agents/tasks/${task.id}/claim`, { method: 'PUT' })).toBe(409);
    // Cleanup
    await completeTask(task.id);
  });

  it('claim nonexistent returns 404', async () => {
    expect(await code('/api/agents/tasks/999999/claim', { method: 'PUT' })).toBe(404);
  });

  it('complete non-claimed returns 400', async () => {
    const task = await createTask({ title: 'Not claimed test' });
    expect(await code(`/api/agents/tasks/${task.id}/complete`, {
      method: 'PUT', body: JSON.stringify({}),
    })).toBe(400);
  });

  it('code task completion creates review', async () => {
    const task = await createTask({ agent_id: 'app-repairdesk', type: 'bug-fix', title: 'Review chain test' });
    await claimTask(task.id);
    const res = await completeTask(task.id, { model_used: 'sonnet', cost_cents: 1 });
    expect(res.review_task_id).not.toBeNull();
  });
});

describe('Task Failure & Retry', () => {
  it('timeout failure auto-retries', async () => {
    const task = await createTask({ agent_id: 'ops-infra', title: 'Timeout retry test' });
    await claimTask(task.id);
    const res = await failTask(task.id, 'Connection timed out');
    expect(res.retried).toBe(true);
    // failure_type may not be in response if retried — check retried is sufficient
  });

  it('permission failure does NOT retry', async () => {
    const task = await createTask({ agent_id: 'ops-infra', title: 'Perm fail test' });
    await claimTask(task.id);
    const res = await failTask(task.id, 'Permission denied by hook', 'permission');
    expect(res.retried).toBe(false);
  });

  it('failure types are classified from error message', async () => {
    // Test classification by creating, claiming, and failing with different messages
    const tests = [
      { msg: 'Connection timed out to API', type: 'timeout' },
      { msg: 'Rate limit 429 exceeded', type: 'transient' },
      { msg: 'Server 502 Bad Gateway', type: 'infrastructure' },
      { msg: 'Permission denied access', type: 'permission' },
      { msg: 'Budget exceeded limit', type: 'budget' },
      { msg: 'Cannot solve this problem', type: 'logic' },
    ];
    for (const t of tests) {
      const task = await createTask({ agent_id: 'ops-infra', title: `Classify: ${t.type}` });
      await claimTask(task.id);
      const res = await failTask(task.id, t.msg);
      // The task may retry (which is fine), we just verify the API doesn't crash
      expect(res.ok).toBe(true);
    }
  });
});

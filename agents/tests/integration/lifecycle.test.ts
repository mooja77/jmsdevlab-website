import { describe, it, expect, beforeAll } from 'vitest';
import { api, createTask, claimTask, completeTask, failTask, resetAgent } from '../setup.js';

const AGENT = 'supervisor-marketing';
beforeAll(async () => {
  await resetAgent(AGENT);
  await api(`/api/agents/${AGENT}`, {
    method: 'PUT', body: JSON.stringify({ budget_daily_cents: 1000 }),
  });
});

describe('Full Task Lifecycle', () => {
  it('create → claim → complete (happy path)', async () => {
    const task = await createTask({ agent_id: AGENT, title: 'Lifecycle happy path' });
    expect(task.ok).toBe(true);

    await claimTask(task.id);
    const completed = await completeTask(task.id, {
      output_json: { summary: 'All good' }, model_used: 'sonnet',
      tokens_in: 200, tokens_out: 100, cost_cents: 1,
    });
    expect(completed.ok).toBe(true);
  });

  it('create → claim → fail → retry → claim → complete', async () => {
    const task = await createTask({ agent_id: AGENT, title: 'Retry lifecycle' });
    await claimTask(task.id);

    const failed = await failTask(task.id, 'Transient error: rate limit hit');
    expect(failed.retried).toBe(true);

    // Task should be back in queued
    await claimTask(task.id);
    const completed = await completeTask(task.id, { cost_cents: 1 });
    expect(completed.ok).toBe(true);
  });

  it('code task creates review for supervisor', async () => {
    const task = await createTask({
      agent_id: 'app-repairdesk', type: 'bug-fix', title: 'Review lifecycle test',
    });
    await claimTask(task.id);
    const res = await completeTask(task.id, { model_used: 'sonnet', cost_cents: 1 });
    expect(res.review_task_id).toBeTruthy();

    // Verify review task exists
    const tasks = await api(`/api/agents/tasks?agent_id=supervisor-apps&status=queued&limit=50`);
    const review = tasks.tasks.find((t: any) => t.id === res.review_task_id);
    expect(review).toBeTruthy();
    expect(review.title).toContain('Review');
    expect(review.created_by).toBe('system');
  });

  it('non-code task does NOT create review', async () => {
    const task = await createTask({ agent_id: AGENT, type: 'health-check', title: 'No review test' });
    await claimTask(task.id);
    const res = await completeTask(task.id);
    expect(res.review_task_id).toBeNull();
  });
});

describe('Escalation Chain', () => {
  it('logic failure after max retries creates escalation', async () => {
    const task = await createTask({ agent_id: 'app-repairdesk', title: 'Escalation chain test' });

    // Fail 3 times (max_retries=2, so 3rd fail is permanent)
    for (let i = 0; i < 3; i++) {
      await claimTask(task.id);
      await failTask(task.id, 'Cannot solve this problem', 'logic');
    }

    // Check for escalation task
    const supervisorTasks = await api('/api/agents/tasks?agent_id=supervisor-apps&status=queued&limit=50');
    const escalation = supervisorTasks.tasks.find((t: any) =>
      t.title.includes('Escalation') && t.parent_task_id === task.id
    );
    expect(escalation).toBeTruthy();
  });

  it('permission failure never retries', async () => {
    const task = await createTask({ agent_id: 'ops-infra', title: 'Perm no retry test' });
    await claimTask(task.id);
    const res = await failTask(task.id, 'Permission denied', 'permission');
    expect(res.retried).toBe(false);
  });
});

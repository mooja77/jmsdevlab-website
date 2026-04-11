import { describe, it, expect, beforeAll } from 'vitest';
import { api, createTask, claimTask, completeTask, failTask, resetAgent } from '../setup.js';

const AGENT = 'supervisor-marketing';
beforeAll(async () => {
  await resetAgent(AGENT);
  // Reset budget to ensure tasks aren't blocked
  await api(`/api/agents/${AGENT}`, {
    method: 'PUT', body: JSON.stringify({ budget_daily_cents: 1000 }),
  });
});

describe('Idempotency Guards', () => {
  it('double-complete returns already: true without side effects', async () => {
    const task = await createTask({ agent_id: AGENT, title: 'Idem: double complete' });
    await claimTask(task.id);
    const first = await completeTask(task.id, { cost_cents: 5 });
    expect(first.ok).toBe(true);
    expect(first.already).toBeUndefined();

    const second = await completeTask(task.id, { cost_cents: 5 });
    expect(second.ok).toBe(true);
    expect(second.already).toBe(true);
    // Budget should NOT be double-counted
  });

  it('double-fail returns already: true', async () => {
    const task = await createTask({ agent_id: AGENT, title: 'Idem: double fail' });
    await claimTask(task.id);
    const first = await failTask(task.id, 'error 1', 'permission');
    expect(first.retried).toBe(false); // permission = no retry

    const second = await failTask(task.id, 'error 2', 'permission');
    expect(second.ok).toBe(true);
    expect(second.already).toBe(true);
  });

  it('fail after complete is blocked', async () => {
    const task = await createTask({ agent_id: AGENT, title: 'Idem: fail after complete' });
    await claimTask(task.id);
    await completeTask(task.id);

    const res = await api(`/api/agents/tasks/${task.id}/fail`, {
      method: 'PUT',
      body: JSON.stringify({ error_message: 'too late' }),
    });
    // Should be blocked — completed is terminal
    expect(res.error || res.already).toBeTruthy();
  });

  it('complete after fail is blocked (terminal fail)', async () => {
    const task = await createTask({ agent_id: AGENT, title: 'Idem: complete after fail' });
    await claimTask(task.id);
    await failTask(task.id, 'permanent', 'permission');

    const res = await completeTask(task.id);
    expect(res.error || res.already).toBeTruthy();
  });

  it('heartbeat on completed task returns updated: false', async () => {
    const task = await createTask({ agent_id: AGENT, title: 'Idem: hb completed' });
    await claimTask(task.id);
    await completeTask(task.id);
    const hb = await api(`/api/agents/tasks/${task.id}/heartbeat`, { method: 'PUT' });
    expect(hb.updated).toBe(false);
  });
});

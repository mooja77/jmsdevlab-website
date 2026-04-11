import { describe, it, expect, afterAll } from 'vitest';
import { api, code, createTask } from '../setup.js';

// Use a less-important agent for deactivation tests
const TEST_AGENT = 'marketing-seo';

afterAll(async () => {
  // Re-activate the agent after tests
  await api(`/api/agents/${TEST_AGENT}`, {
    method: 'PUT', body: JSON.stringify({ status: 'idle' }),
  });
});

describe('Agent Soft Delete (Deactivation)', () => {
  it('deactivates agent', async () => {
    const res = await api(`/api/agents/${TEST_AGENT}`, { method: 'DELETE' });
    expect(res.ok).toBe(true);
  });

  it('agent status is disabled after deactivation', async () => {
    const data = await api(`/api/agents/${TEST_AGENT}`);
    expect(data.agent.status).toBe('disabled');
  });

  it('queued tasks are cancelled', async () => {
    // Create a task first, then deactivate
    // (agent is already disabled, but let's re-enable, create, then delete)
    await api(`/api/agents/${TEST_AGENT}`, {
      method: 'PUT', body: JSON.stringify({ status: 'idle' }),
    });
    const task = await createTask({ agent_id: TEST_AGENT, title: 'Deactivation cascade test' });
    await api(`/api/agents/${TEST_AGENT}`, { method: 'DELETE' });

    const tasks = await api(`/api/agents/tasks?agent_id=${TEST_AGENT}&status=cancelled&limit=50`);
    const found = tasks.tasks.find((t: any) => t.id === task.id);
    expect(found).toBeTruthy();
    expect(found.status).toBe('cancelled');
  });

  it('returns 404 for nonexistent agent', async () => {
    expect(await code('/api/agents/fake-agent-xyz', { method: 'DELETE' })).toBe(404);
  });

  it('audit trail records deactivation', async () => {
    const audit = await api(`/api/agents/audit?agent_id=${TEST_AGENT}&limit=5`);
    const deactivated = audit.audit.find((a: any) => a.action === 'agent-deactivated');
    expect(deactivated).toBeTruthy();
  });
});

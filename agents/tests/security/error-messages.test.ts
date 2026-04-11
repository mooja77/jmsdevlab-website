import { describe, it, expect } from 'vitest';
import { api, code, createTask, claimTask, completeTask } from '../setup.js';

describe('Error Message Sanitization', () => {
  it('nonexistent agent returns generic error', async () => {
    const res = await api('/api/agents/tasks', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'secret-agent-name', type: 'test', title: 'test' }),
    });
    expect(res.error).toBe('Not found');
    expect(res.error).not.toContain('secret-agent-name');
  });

  it('invalid transition returns generic error', async () => {
    const task = await createTask({ agent_id: 'supervisor-marketing', title: 'Error msg test' });
    // Try to complete without claiming
    const res = await api(`/api/agents/tasks/${task.id}/complete`, {
      method: 'PUT', body: JSON.stringify({}),
    });
    expect(res.error).toBe('Invalid operation');
    expect(res.error).not.toContain('queued');
  });

  it('double claim returns generic conflict', async () => {
    const task = await createTask({ agent_id: 'supervisor-marketing', title: 'Conflict msg test' });
    await claimTask(task.id);
    const status = await code(`/api/agents/tasks/${task.id}/claim`, { method: 'PUT' });
    expect(status).toBe(409);
    await completeTask(task.id);
  });
});

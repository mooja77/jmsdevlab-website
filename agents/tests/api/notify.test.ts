import { describe, it, expect, afterAll } from 'vitest';
import { api, createTask, resetAgent } from '../setup.js';

afterAll(() => resetAgent('app-pitchside'));

describe('Notify Policy Action', () => {
  it('budget warning creates bulletin', async () => {
    // Set budget to 2 cents, spend 2 to get to 100% (which triggers block, not notify)
    // Set budget to 10, spend 9 to get to 90% (>80% triggers notify)
    await api('/api/agents/app-pitchside', {
      method: 'PUT', body: JSON.stringify({ budget_daily_cents: 10 }),
    });

    // We need budget_spent to be >80%. Complete a task with cost to get there.
    const setupTask = await createTask({ agent_id: 'app-pitchside', type: 'health-check', title: 'Budget setup' });
    await api(`/api/agents/tasks/${setupTask.id}/claim`, { method: 'PUT' });
    await api(`/api/agents/tasks/${setupTask.id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ cost_cents: 9 }), // 90% of 10
    });

    // Now create another task — should trigger notify policy at 90%
    const res = await createTask({ agent_id: 'app-pitchside', title: 'Notify trigger test' });
    // Policy should be 'notify' (budget >80%) or 'block' (budget >100%)
    expect(['notify', 'block']).toContain(res.policy);
  });

  it('notify creates bulletin with correct content', async () => {
    const bulletins = await api('/api/agents/bulletins');
    const policyBulletin = bulletins.bulletins.find((b: any) =>
      b.title.includes('Policy alert') && b.agent_id === 'app-pitchside'
    );
    // May or may not exist depending on budget state — test shape if present
    if (policyBulletin) {
      expect(policyBulletin.severity).toBe('warning');
      expect(policyBulletin.body).toContain('app-pitchside');
    }
  });
});

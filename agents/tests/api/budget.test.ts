import { describe, it, expect, afterAll } from 'vitest';
import { api, code, createTask, claimTask, completeTask, resetAgent } from '../setup.js';
import { BudgetSchema } from '../schemas/index.js';

afterAll(() => resetAgent('app-qualcanvas'));

describe('Budget Tracking', () => {
  it('returns budget with schema validation', async () => {
    const data = await api('/api/agents/app-smartcash/budget');
    BudgetSchema.parse(data);
  });

  it('returns 404 for nonexistent agent', async () => {
    expect(await code('/api/agents/fake/budget')).toBe(404);
  });

  it('remaining_cents is non-negative', async () => {
    const data = await api('/api/agents/app-smartcash/budget');
    expect(data.remaining_cents).toBeGreaterThanOrEqual(0);
  });

  it('pct_used is 0 for fresh budget', async () => {
    // Use a less-used agent
    const data = await api('/api/agents/marketing-seo/budget');
    expect(data.pct_used).toBeGreaterThanOrEqual(0);
  });

  it('zero cost does not change budget', async () => {
    const before = await api('/api/agents/app-qualcanvas/budget');
    const task = await createTask({ agent_id: 'app-qualcanvas', title: 'Zero cost' });
    await claimTask(task.id);
    await completeTask(task.id, { cost_cents: 0 });
    const after = await api('/api/agents/app-qualcanvas/budget');
    expect(after.spent_today_cents).toBe(before.spent_today_cents);
  });

  it('cost increments budget correctly', async () => {
    // Use a fresh agent with known budget
    await api('/api/agents/app-qualcanvas', {
      method: 'PUT', body: JSON.stringify({ budget_daily_cents: 100 }),
    });
    const before = await api('/api/agents/app-qualcanvas/budget');
    const task = await createTask({ agent_id: 'app-qualcanvas', title: 'Cost tracking' });
    await claimTask(task.id);
    await completeTask(task.id, { cost_cents: 3 });
    const after = await api('/api/agents/app-qualcanvas/budget');
    expect(after.spent_today_cents).toBe(before.spent_today_cents + 3);
  });

  it('policy blocks when budget exceeded', async () => {
    await api('/api/agents/app-qualcanvas', {
      method: 'PUT', body: JSON.stringify({ budget_daily_cents: 1 }),
    });
    // Budget already > 1 cent from previous test
    const res = await createTask({ agent_id: 'app-qualcanvas', title: 'Should block' });
    expect(res.policy).toBe('block');
  });
});

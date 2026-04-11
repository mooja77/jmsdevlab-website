import { describe, it, expect } from 'vitest';
import { api } from '../setup.js';
import { DashboardSchema } from '../schemas/index.js';

describe('Dashboard Aggregate', () => {
  it('returns valid schema', async () => {
    const data = await api('/api/agents/dashboard');
    DashboardSchema.parse(data);
  });

  it('contains 18 agents', async () => {
    const data = await api('/api/agents/dashboard');
    expect(data.agents.length).toBe(18);
  });

  it('pendingApprovals is non-negative', async () => {
    const data = await api('/api/agents/dashboard');
    expect(data.pendingApprovals).toBeGreaterThanOrEqual(0);
  });

  it('todayBudget has correct shape', async () => {
    const data = await api('/api/agents/dashboard');
    expect(data.todayBudget).toBeDefined();
  });

  it('taskStats is array', async () => {
    const data = await api('/api/agents/dashboard');
    expect(Array.isArray(data.taskStats)).toBe(true);
  });
});

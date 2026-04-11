import { describe, it, expect, afterAll } from 'vitest';
import { api, code, resetAgent } from '../setup.js';
import { AgentListSchema, AgentDetailSchema } from '../schemas/index.js';

afterAll(() => resetAgent('app-smartcash'));

describe('Agent Registry — List', () => {
  it('returns all 18 agents', async () => {
    const data = await api('/api/agents');
    const parsed = AgentListSchema.parse(data);
    expect(parsed.agents.length).toBe(18);
  });

  it('filters by type=app (12)', async () => {
    const data = await api('/api/agents?type=app');
    expect(data.agents.length).toBe(12);
    expect(data.agents.every((a: any) => a.type === 'app')).toBe(true);
  });

  it('filters by type=supervisor (2)', async () => {
    const data = await api('/api/agents?type=supervisor');
    expect(data.agents.length).toBe(2);
  });

  it('filters by type=marketing (3)', async () => {
    const data = await api('/api/agents?type=marketing');
    expect(data.agents.length).toBe(3);
  });

  it('filters by type=operations (1)', async () => {
    const data = await api('/api/agents?type=operations');
    expect(data.agents.length).toBe(1);
  });

  it('returns 0 for invalid type', async () => {
    const data = await api('/api/agents?type=nonexistent');
    expect(data.agents.length).toBe(0);
  });

  it('filters by status', async () => {
    const data = await api('/api/agents?status=idle');
    expect(data.agents.length).toBeGreaterThan(0);
    expect(data.agents.every((a: any) => a.status === 'idle')).toBe(true);
  });
});

describe('Agent Registry — Detail', () => {
  it('returns agent with stats', async () => {
    const data = await api('/api/agents/app-smartcash');
    AgentDetailSchema.parse(data);
    expect(data.agent.id).toBe('app-smartcash');
    expect(data.recentTasks).toBeDefined();
    expect(data.stats).toBeDefined();
  });

  it('returns 404 for nonexistent', async () => {
    expect(await code('/api/agents/nonexistent')).toBe(404);
  });

  it('reserved words fall through correctly', async () => {
    expect(await code('/api/agents/dashboard')).toBe(200);
    expect(await code('/api/agents/tasks')).toBe(200);
    expect(await code('/api/agents/policies')).toBe(200);
  });
});

describe('Agent Registry — Update', () => {
  it('updates status to paused', async () => {
    const res = await api('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({ status: 'paused' }),
    });
    expect(res.ok).toBe(true);
    const detail = await api('/api/agents/app-smartcash');
    expect(detail.agent.status).toBe('paused');
  });

  it('rejects invalid status', async () => {
    expect(await code('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({ status: 'flying' }),
    })).toBe(400);
  });

  it('updates model_default', async () => {
    const res = await api('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({ model_default: 'opus' }),
    });
    expect(res.ok).toBe(true);
  });

  it('rejects invalid model', async () => {
    expect(await code('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({ model_default: 'gpt4' }),
    })).toBe(400);
  });

  it('updates budget_daily_cents', async () => {
    const res = await api('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({ budget_daily_cents: 50 }),
    });
    expect(res.ok).toBe(true);
  });

  it('rejects negative budget', async () => {
    expect(await code('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({ budget_daily_cents: -1 }),
    })).toBe(400);
  });

  it('rejects budget over 100000', async () => {
    expect(await code('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({ budget_daily_cents: 100001 }),
    })).toBe(400);
  });

  it('accepts valid config_json', async () => {
    const res = await api('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({ config_json: '{"test":1}' }),
    });
    expect(res.ok).toBe(true);
  });

  it('rejects invalid config_json', async () => {
    expect(await code('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({ config_json: 'not json' }),
    })).toBe(400);
  });

  it('rejects nonexistent agent', async () => {
    expect(await code('/api/agents/fake-agent', {
      method: 'PUT', body: JSON.stringify({ status: 'idle' }),
    })).toBe(404);
  });

  it('rejects empty body', async () => {
    expect(await code('/api/agents/app-smartcash', {
      method: 'PUT', body: JSON.stringify({}),
    })).toBe(400);
  });
});

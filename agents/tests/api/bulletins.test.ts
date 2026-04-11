import { describe, it, expect } from 'vitest';
import { api, code } from '../setup.js';

describe('Bulletins', () => {
  it('creates bulletin', async () => {
    const res = await api('/api/agents/bulletins', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'ops-infra', title: 'Test bulletin', severity: 'warning', body: 'Test body' }),
    });
    expect(res.ok).toBe(true);
  });

  it('rejects missing title', async () => {
    expect(await code('/api/agents/bulletins', {
      method: 'POST', body: JSON.stringify({ agent_id: 'ops-infra' }),
    })).toBe(400);
  });

  it('lists active bulletins', async () => {
    const data = await api('/api/agents/bulletins');
    expect(data.bulletins).toBeDefined();
    expect(data.bulletins.length).toBeGreaterThan(0);
  });

  it('expired bulletin not returned', async () => {
    await api('/api/agents/bulletins', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'ops-infra', title: 'Expired test', expires_at: '2020-01-01 00:00:00' }),
    });
    const data = await api('/api/agents/bulletins');
    const expired = data.bulletins.filter((b: any) => b.title === 'Expired test');
    expect(expired).toHaveLength(0);
  });
});

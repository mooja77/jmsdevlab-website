import { describe, it, expect } from 'vitest';
import { api, code } from '../setup.js';

describe('Audit Trail', () => {
  it('returns audit entries', async () => {
    const data = await api('/api/agents/audit');
    expect(data.audit).toBeDefined();
    expect(Array.isArray(data.audit)).toBe(true);
    expect(data.audit.length).toBeGreaterThan(0);
  });

  it('filters by agent_id', async () => {
    const data = await api('/api/agents/audit?agent_id=app-smartcash');
    for (const a of data.audit) {
      expect(a.agent_id).toBe('app-smartcash');
    }
  });

  it('respects limit parameter', async () => {
    const data = await api('/api/agents/audit?limit=3');
    expect(data.audit.length).toBeLessThanOrEqual(3);
  });

  it('caps limit at 200', async () => {
    const data = await api('/api/agents/audit?limit=999');
    expect(data.audit.length).toBeLessThanOrEqual(200);
  });

  it('entries have required fields', async () => {
    const data = await api('/api/agents/audit?limit=1');
    if (data.audit.length > 0) {
      const entry = data.audit[0];
      expect(entry.agent_id).toBeTruthy();
      expect(entry.action).toBeTruthy();
      expect(entry.created_at).toBeTruthy();
    }
  });
});

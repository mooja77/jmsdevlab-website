import { describe, it, expect } from 'vitest';
import { api } from '../setup.js';

describe('Policies', () => {
  it('returns 8 seeded policies', async () => {
    const data = await api('/api/agents/policies');
    expect(data.policies.length).toBe(8);
  });

  it('sorted by priority ascending', async () => {
    const data = await api('/api/agents/policies');
    for (let i = 1; i < data.policies.length; i++) {
      expect(data.policies[i].priority).toBeGreaterThanOrEqual(data.policies[i - 1].priority);
    }
  });

  it('all policies are enabled', async () => {
    const data = await api('/api/agents/policies');
    expect(data.policies.every((p: any) => p.enabled === 1)).toBe(true);
  });

  it('each policy has valid condition_json', async () => {
    const data = await api('/api/agents/policies');
    for (const p of data.policies) {
      expect(() => JSON.parse(p.condition_json)).not.toThrow();
    }
  });

  it('each policy has valid action', async () => {
    const validActions = ['auto_approve', 'block', 'notify', 'escalate', 'recover_once'];
    const data = await api('/api/agents/policies');
    for (const p of data.policies) {
      expect(validActions).toContain(p.action);
    }
  });
});

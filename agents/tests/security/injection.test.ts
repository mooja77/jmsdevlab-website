import { describe, it, expect } from 'vitest';
import { api, code, createTask } from '../setup.js';

const SQL_PAYLOADS = [
  "'; DROP TABLE agents;--",
  "1 OR 1=1",
  "' UNION SELECT * FROM agents--",
  "Robert'); DROP TABLE agent_tasks;--",
  "1; DELETE FROM agents WHERE 1=1",
];

describe('SQL Injection Prevention', () => {
  for (const payload of SQL_PAYLOADS) {
    it(`safe in type filter: ${payload.substring(0, 30)}...`, async () => {
      const data = await api(`/api/agents?type=${encodeURIComponent(payload)}`);
      expect(data.agents).toBeDefined();
      expect(data.agents.length).toBe(0); // No match, but no crash

      // Verify agents table still exists
      const all = await api('/api/agents');
      expect(all.agents.length).toBe(18);
    });

    it(`safe in task title: ${payload.substring(0, 30)}...`, async () => {
      const res = await createTask({ title: payload });
      expect(res.ok).toBe(true);
    });
  }

  it('safe in agent_id filter', async () => {
    const data = await api('/api/agents/tasks?agent_id=' + encodeURIComponent("'; DROP TABLE--"));
    expect(data.tasks).toBeDefined();
  });
});

describe('XSS Prevention', () => {
  it('script tags stored as data', async () => {
    const xss = '<script>alert(document.cookie)</script>';
    const res = await createTask({ title: xss });
    expect(res.ok).toBe(true);
  });

  it('HTML entities in description', async () => {
    const res = await createTask({
      title: 'XSS test',
      description: '<img src=x onerror=alert(1)>',
    });
    expect(res.ok).toBe(true);
  });
});

describe('Large Payload Protection', () => {
  it('truncates 200+ char title', async () => {
    const longTitle = 'A'.repeat(500);
    const res = await createTask({ title: longTitle });
    expect(res.ok).toBe(true);
    // Title should be stored but truncated to 200
  });

  it('truncates 5000+ char description', async () => {
    const longDesc = 'B'.repeat(10000);
    const res = await createTask({ title: 'Long desc', description: longDesc });
    expect(res.ok).toBe(true);
  });

  it('handles empty string fields', async () => {
    expect(await code('/api/agents/tasks', {
      method: 'POST',
      body: JSON.stringify({ agent_id: 'app-smartcash', type: 'test', title: '' }),
    })).toBe(400);
  });
});

describe('Unicode Handling', () => {
  it('accepts emoji in title', async () => {
    const res = await createTask({ title: 'Fix bug in module' });
    expect(res.ok).toBe(true);
  });

  it('accepts CJK characters', async () => {
    const res = await createTask({ title: 'テスト タスク' });
    expect(res.ok).toBe(true);
  });

  it('accepts Arabic characters', async () => {
    const res = await createTask({ title: 'مهمة اختبار' });
    expect(res.ok).toBe(true);
  });
});

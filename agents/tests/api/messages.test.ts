import { describe, it, expect } from 'vitest';
import { api, code } from '../setup.js';

describe('Messages', () => {
  it('sends message between agents', async () => {
    const res = await api('/api/agents/messages', {
      method: 'POST',
      body: JSON.stringify({ from_agent: 'app-smartcash', to_agent: 'supervisor-apps', body: 'Test message' }),
    });
    expect(res.ok).toBe(true);
  });

  it('rejects missing body field', async () => {
    expect(await code('/api/agents/messages', {
      method: 'POST',
      body: JSON.stringify({ from_agent: 'a', to_agent: 'b' }),
    })).toBe(400);
  });

  it('lists messages', async () => {
    const data = await api('/api/agents/messages');
    expect(data.messages).toBeDefined();
    expect(Array.isArray(data.messages)).toBe(true);
  });

  it('filters by agent_id', async () => {
    const data = await api('/api/agents/messages?agent_id=app-smartcash');
    for (const m of data.messages) {
      expect(m.from_agent === 'app-smartcash' || m.to_agent === 'app-smartcash').toBe(true);
    }
  });

  it('sends with all optional fields', async () => {
    const res = await api('/api/agents/messages', {
      method: 'POST',
      body: JSON.stringify({
        from_agent: 'ops-infra', to_agent: 'supervisor-apps',
        body: 'Full message', subject: 'Test Subject',
        message_type: 'alert', thread_id: 'thread-1',
      }),
    });
    expect(res.ok).toBe(true);
  });
});

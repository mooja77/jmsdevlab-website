import { describe, it, expect } from 'vitest';
import { API_BASE, getToken } from '../setup.js';

describe('Authentication', () => {
  it('rejects requests without token', async () => {
    const res = await fetch(`${API_BASE}/api/agents`);
    expect(res.status).toBe(401);
  });

  it('rejects requests with invalid token', async () => {
    const res = await fetch(`${API_BASE}/api/agents`, {
      headers: { Authorization: 'Bearer invalidtoken123' },
    });
    expect(res.status).toBe(401);
  });

  it('login returns valid token', async () => {
    const token = await getToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });

  it('accepts valid token', async () => {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/api/agents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });

  it('dashboard accessible with token', async () => {
    const token = await getToken();
    const res = await fetch(`${API_BASE}/api/agents/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});

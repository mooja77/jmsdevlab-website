import { describe, it, expect } from 'vitest';
import { timedApi, createTask } from '../setup.js';

describe('Performance Baselines', () => {
  it('GET /api/agents < 500ms', async () => {
    const { ms } = await timedApi('/api/agents');
    expect(ms).toBeLessThan(500);
  });

  it('GET /api/agents/dashboard < 1000ms', async () => {
    const { ms } = await timedApi('/api/agents/dashboard');
    expect(ms).toBeLessThan(1000);
  });

  it('GET /api/agents/:id < 500ms', async () => {
    const { ms } = await timedApi('/api/agents/app-smartcash');
    expect(ms).toBeLessThan(500);
  });

  it('POST task creation < 500ms', async () => {
    const start = Date.now();
    await createTask({ title: 'Perf test create' });
    expect(Date.now() - start).toBeLessThan(500);
  });

  it('GET /api/agents/tasks?limit=50 < 500ms', async () => {
    const { ms } = await timedApi('/api/agents/tasks?status=queued&limit=50');
    expect(ms).toBeLessThan(500);
  });

  it('GET /api/agents/policies < 300ms', async () => {
    const { ms } = await timedApi('/api/agents/policies');
    expect(ms).toBeLessThan(300);
  });
});

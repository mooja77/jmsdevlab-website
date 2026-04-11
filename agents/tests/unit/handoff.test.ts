import { describe, it, expect } from 'vitest';
import { serializeHandoff, parseHandoffFromOutput, type Handoff } from '../../handoff.js';

const successHandoff: Handoff = {
  session: 'task-42-fix-billing',
  date: '2026-04-10',
  status: 'complete',
  outcome: 'SUCCEEDED',
  goal: 'Fix billing API',
  now: 'Run tests',
  done: [{ task: 'Fixed webhook', files: ['auth.ts', 'billing.ts'] }],
  decisions: { used_upsert: 'Safer for data integrity' },
  worked: ['atomic charge check'],
  failed: [],
  next: ['Run tests', 'Submit PR'],
};

describe('serializeHandoff', () => {
  const yaml = serializeHandoff(successHandoff);

  it('starts with YAML separator', () => expect(yaml.startsWith('---')).toBe(true));
  it('contains session', () => expect(yaml).toContain('session: task-42-fix-billing'));
  it('contains date', () => expect(yaml).toContain('date: 2026-04-10'));
  it('contains status', () => expect(yaml).toContain('status: complete'));
  it('contains outcome', () => expect(yaml).toContain('outcome: SUCCEEDED'));
  it('contains goal', () => expect(yaml).toContain('goal: Fix billing API'));
  it('contains now', () => expect(yaml).toContain('now: Run tests'));
  it('contains done task', () => expect(yaml).toContain('task: Fixed webhook'));
  it('contains files', () => expect(yaml).toContain('auth.ts'));
  it('contains decision', () => expect(yaml).toContain('used_upsert'));
  it('contains worked', () => expect(yaml).toContain('atomic charge check'));
  it('omits empty failed', () => expect(yaml).not.toContain('failed:'));
  it('contains next steps', () => expect(yaml).toContain('Submit PR'));
});

describe('parseHandoffFromOutput — success', () => {
  const output = 'I modified src/auth.ts and created src/billing.ts. Decision: used upsert over delete.';
  const parsed = parseHandoffFromOutput(42, 'Fix billing', output);

  it('session includes task id', () => expect(parsed.session).toContain('task-42'));
  it('status is complete', () => expect(parsed.status).toBe('complete'));
  it('outcome is SUCCEEDED', () => expect(parsed.outcome).toBe('SUCCEEDED'));
  it('goal matches title', () => expect(parsed.goal).toBe('Fix billing'));
  it('extracts files', () => expect(parsed.done[0].files!.length).toBeGreaterThan(0));
  it('extracts decisions', () => expect(Object.keys(parsed.decisions).length).toBeGreaterThan(0));
  it('worked is populated', () => expect(parsed.worked.length).toBeGreaterThan(0));
  it('failed is empty', () => expect(parsed.failed.length).toBe(0));
});

describe('parseHandoffFromOutput — failure', () => {
  const output = 'Error: failed to connect. The migration failed with timeout.';
  const parsed = parseHandoffFromOutput(43, 'Run migration', output);

  it('status is failed', () => expect(parsed.status).toBe('failed'));
  it('outcome is FAILED', () => expect(parsed.outcome).toBe('FAILED'));
  it('failed is populated', () => expect(parsed.failed.length).toBeGreaterThan(0));
  it('worked is empty', () => expect(parsed.worked.length).toBe(0));
});

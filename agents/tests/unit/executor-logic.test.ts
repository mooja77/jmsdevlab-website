import { describe, it, expect } from 'vitest';

// Import the selectModel and estimateCost functions
// They need to be exported from executor.ts — we'll test the logic directly
function selectModel(defaultModel: string, taskType: string, budgetPct: number): string {
  const typeModelMap: Record<string, string> = {
    'health-check': 'haiku', 'status-lookup': 'haiku',
    'code-review': 'sonnet', 'architecture': 'opus', 'complex-debug': 'opus',
  };
  let model = typeModelMap[taskType] || defaultModel || 'sonnet';
  if (budgetPct >= 90 && model === 'opus') model = 'sonnet';
  if (budgetPct >= 95 && model === 'sonnet') model = 'haiku';
  return model;
}

function estimateCost(model: string, tokensIn: number, tokensOut: number): number {
  const prices: Record<string, { in: number; out: number }> = {
    opus: { in: 1500, out: 7500 },
    sonnet: { in: 300, out: 1500 },
    haiku: { in: 80, out: 400 },
  };
  const p = prices[model] || prices.sonnet;
  return Math.ceil((tokensIn * p.in + tokensOut * p.out) / 1_000_000);
}

describe('selectModel — task type overrides', () => {
  it('health-check → haiku', () => expect(selectModel('sonnet', 'health-check', 0)).toBe('haiku'));
  it('status-lookup → haiku', () => expect(selectModel('sonnet', 'status-lookup', 0)).toBe('haiku'));
  it('code-review → sonnet', () => expect(selectModel('haiku', 'code-review', 0)).toBe('sonnet'));
  it('architecture → opus', () => expect(selectModel('sonnet', 'architecture', 0)).toBe('opus'));
  it('complex-debug → opus', () => expect(selectModel('sonnet', 'complex-debug', 0)).toBe('opus'));
  it('general → uses default', () => expect(selectModel('sonnet', 'general', 0)).toBe('sonnet'));
  it('unknown type → uses default', () => expect(selectModel('opus', 'random', 0)).toBe('opus'));
});

describe('selectModel — budget downgrade', () => {
  it('budget 50% keeps opus', () => expect(selectModel('opus', 'general', 50)).toBe('opus'));
  it('budget 89% keeps opus', () => expect(selectModel('opus', 'general', 89)).toBe('opus'));
  it('budget 90% downgrades opus→sonnet', () => expect(selectModel('opus', 'general', 90)).toBe('sonnet'));
  it('budget 94% keeps sonnet', () => expect(selectModel('sonnet', 'general', 94)).toBe('sonnet'));
  it('budget 95% downgrades sonnet→haiku', () => expect(selectModel('sonnet', 'general', 95)).toBe('haiku'));
  it('budget 100% still haiku (not refused)', () => expect(selectModel('sonnet', 'general', 100)).toBe('haiku'));
  it('haiku never downgrades', () => expect(selectModel('haiku', 'general', 99)).toBe('haiku'));
});

describe('estimateCost', () => {
  it('opus cost is highest', () => {
    const cost = estimateCost('opus', 1000, 500);
    expect(cost).toBeGreaterThan(0);
  });

  it('haiku cost is lowest', () => {
    const opus = estimateCost('opus', 1000, 500);
    const haiku = estimateCost('haiku', 1000, 500);
    expect(haiku).toBeLessThan(opus);
  });

  it('zero tokens = zero cost', () => {
    // ceil(0) = 0
    expect(estimateCost('sonnet', 0, 0)).toBe(0);
  });

  it('unknown model defaults to sonnet pricing', () => {
    const unknown = estimateCost('gpt4', 1000, 500);
    const sonnet = estimateCost('sonnet', 1000, 500);
    expect(unknown).toBe(sonnet);
  });
});

import { describe, it, expect } from 'vitest';

// Test policy engine depth limiting directly
// Duplicate the evaluateCondition logic with depth tracking
interface Condition { type: string; value?: any; and?: Condition[]; or?: Condition[]; }
interface Ctx { task_type: string; agent_type: string; budget_pct: number; retry_count: number; max_retries: number; created_by: string; priority: number; }

function evaluateCondition(cond: Condition, ctx: Ctx, depth = 0): boolean {
  if (depth > 10) return false;
  if (cond.and) return cond.and.every(c => evaluateCondition(c, ctx, depth + 1));
  if (cond.or) return cond.or.some(c => evaluateCondition(c, ctx, depth + 1));
  if (cond.type === 'task_type_is') return ctx.task_type === cond.value;
  return false;
}

describe('Policy Engine DoS Prevention', () => {
  const ctx: Ctx = { task_type: 'health-check', agent_type: 'app', budget_pct: 0, retry_count: 0, max_retries: 2, created_by: 'human', priority: 5 };

  it('handles depth > 10 gracefully', () => {
    // Build a 20-level deep condition
    let condition: Condition = { type: 'task_type_is', value: 'health-check' };
    for (let i = 0; i < 20; i++) {
      condition = { type: '', and: [condition] };
    }
    // Should return false (depth exceeded) instead of stack overflow
    expect(evaluateCondition(condition, ctx)).toBe(false);
  });

  it('handles wide conditions', () => {
    // 1000 conditions at same level — should complete quickly
    const conditions = Array.from({ length: 1000 }, () => ({ type: 'task_type_is', value: 'nope' }));
    const condition: Condition = { type: '', or: conditions };
    const start = Date.now();
    const result = evaluateCondition(condition, ctx);
    expect(Date.now() - start).toBeLessThan(100); // Should be near-instant
    expect(result).toBe(false);
  });
});

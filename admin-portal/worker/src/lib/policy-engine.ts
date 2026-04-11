// Policy Engine — composable condition/action rules for autonomous agent decisions.
// Inspired by Claw Code's deterministic policy engine.

import { Env } from '../types';

interface Policy {
  id: number;
  name: string;
  agent_scope: string;
  condition_json: string;
  action: string;
  enabled: number;
  priority: number;
}

interface Condition {
  type: string;
  value?: any;
  and?: Condition[];
  or?: Condition[];
}

interface TaskContext {
  agent_id: string;
  agent_type: string;
  task_type: string;
  priority: number;
  created_by: string;
  retry_count: number;
  max_retries: number;
  failure_type?: string;
  budget_pct: number;
}

export type PolicyAction = 'auto_approve' | 'escalate' | 'block' | 'recover_once' | 'notify' | 'none';

export async function evaluatePolicy(
  env: Env,
  context: TaskContext,
): Promise<{ action: PolicyAction; policy_name: string | null }> {
  const policies = await env.DB.prepare(
    "SELECT * FROM agent_policies WHERE enabled = 1 ORDER BY priority ASC"
  ).all();

  for (const row of policies.results as unknown as Policy[]) {
    // Check scope
    if (row.agent_scope !== 'all' &&
        row.agent_scope !== context.agent_id &&
        row.agent_scope !== context.agent_type) {
      continue;
    }

    // Evaluate condition
    const condition: Condition = JSON.parse(row.condition_json);
    if (evaluateCondition(condition, context)) {
      return { action: row.action as PolicyAction, policy_name: row.name };
    }
  }

  return { action: 'none', policy_name: null };
}

function evaluateCondition(cond: Condition, ctx: TaskContext, depth = 0): boolean {
  if (depth > 10) return false; // Prevent DoS via deeply nested conditions

  // Composite conditions
  if (cond.and) {
    return cond.and.every(c => evaluateCondition(c, ctx, depth + 1));
  }
  if (cond.or) {
    return cond.or.some(c => evaluateCondition(c, ctx, depth + 1));
  }

  // Leaf conditions
  switch (cond.type) {
    case 'task_type_is':
      return ctx.task_type === cond.value;

    case 'task_type_in':
      return Array.isArray(cond.value) && cond.value.includes(ctx.task_type);

    case 'agent_type_is':
      return ctx.agent_type === cond.value;

    case 'created_by_is':
      return ctx.created_by === cond.value;

    case 'priority_lte':
      return ctx.priority <= (cond.value || 5);

    case 'priority_gte':
      return ctx.priority >= (cond.value || 5);

    case 'budget_over_pct':
      return ctx.budget_pct >= (cond.value || 100);

    case 'budget_under_pct':
      return ctx.budget_pct < (cond.value || 100);

    case 'retry_exceeded':
      return ctx.retry_count >= ctx.max_retries;

    case 'failure_type_is':
      return ctx.failure_type === cond.value;

    case 'failure_type_in':
      return Array.isArray(cond.value) && cond.value.includes(ctx.failure_type);

    default:
      return false;
  }
}

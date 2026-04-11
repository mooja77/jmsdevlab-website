import { z } from 'zod';

export const AgentSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(['app', 'supervisor', 'marketing', 'operations']),
  name: z.string().min(1),
  description: z.string().nullable(),
  status: z.enum(['idle', 'running', 'paused', 'errored', 'disabled']),
  app_id: z.string().nullable(),
  config_json: z.string().nullable(),
  capabilities_json: z.string().nullable(),
  model_default: z.enum(['haiku', 'sonnet', 'opus']),
  budget_daily_cents: z.number().int().min(0),
  budget_spent_today_cents: z.number().int().min(0),
  budget_reset_at: z.string().nullable(),
  last_active_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AgentListSchema = z.object({
  agents: z.array(AgentSchema),
});

export const AgentDetailSchema = z.object({
  agent: AgentSchema,
  recentTasks: z.array(z.any()),
  todayBudget: z.any().nullable(),
  stats: z.object({
    completed: z.number().nullable(),
    failed: z.number().nullable(),
    avg_cost: z.number().nullable(),
    total_cost: z.number().nullable(),
  }).nullable(),
});

export const BudgetSchema = z.object({
  daily_limit_cents: z.number().int().min(0),
  spent_today_cents: z.number().int().min(0),
  remaining_cents: z.number().int().min(0),
  pct_used: z.number().min(0),
  history: z.array(z.any()),
});

import { z } from 'zod';
import { AgentSchema } from './agent.schema.js';

export const DashboardSchema = z.object({
  agents: z.array(AgentSchema),
  taskStats: z.array(z.object({
    status: z.string(),
    count: z.number().int(),
  })),
  pendingApprovals: z.number().int().min(0),
  todayBudget: z.object({
    total_cents: z.number().nullable(),
    total_tasks: z.number().nullable(),
  }),
});

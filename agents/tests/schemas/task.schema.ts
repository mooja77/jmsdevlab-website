import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.number().int().positive(),
  agent_id: z.string(),
  type: z.string(),
  priority: z.number().int().min(1).max(10),
  status: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  input_json: z.string().nullable(),
  output_json: z.string().nullable(),
  model_used: z.string().nullable(),
  cost_cents: z.number().int().min(0),
  tokens_in: z.number().int().min(0),
  tokens_out: z.number().int().min(0),
  parent_task_id: z.number().nullable(),
  created_by: z.string(),
  claimed_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  error_message: z.string().nullable(),
  requires_approval: z.number(),
  approved_at: z.string().nullable(),
  heartbeat_at: z.string().nullable(),
  retry_count: z.number().int().min(0),
  max_retries: z.number().int().min(0),
  failure_type: z.string().nullable(),
  blocked_by: z.string().nullable(),
  review_task_id: z.number().nullable(),
  created_at: z.string(),
});

export const TaskListSchema = z.object({
  tasks: z.array(TaskSchema),
});

export const CreateTaskResponseSchema = z.object({
  ok: z.literal(true),
  id: z.number().int().positive(),
  policy: z.string(),
  policy_name: z.string().nullable(),
});

export const TaskActionSchema = z.object({
  ok: z.literal(true),
});

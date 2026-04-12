/**
 * Agent Harness — registry, task queue, messages, bulletins, budgets, audit.
 * V3: Policy engine, failure taxonomy, authoring/review separation, file claims.
 */

import { Env, json } from '../types';
import { evaluatePolicy } from '../lib/policy-engine';

// Code task types that trigger authoring/review separation
const CODE_TASK_TYPES = ['bug-fix', 'refactor', 'feature', 'deploy', 'complex'];

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  queued: ['claimed', 'cancelled'],
  claimed: ['running', 'completed', 'failed', 'queued'],
  running: ['completed', 'failed'],
  'needs-approval': ['queued', 'cancelled'],
  completed: [],
  failed: ['queued'],  // retry
  cancelled: [],
};

const TERMINAL_STATUSES = ['completed', 'failed', 'cancelled'];

function validateTransition(current: string, target: string): boolean {
  return (VALID_TRANSITIONS[current] || []).includes(target);
}

function validateString(val: unknown, maxLen: number): string | null {
  if (typeof val !== 'string') return null;
  return val.substring(0, maxLen);
}

function validateInt(val: unknown, min: number, max: number): number | null {
  const n = typeof val === 'number' ? val : parseInt(val as string);
  if (isNaN(n) || n < min || n > max) return null;
  return n;
}

export async function handleAgentRoutes(
  path: string,
  request: Request,
  url: URL,
  env: Env,
): Promise<Response> {

  // ─── Agent Registry ──────────────────────────────────────────

  // GET /api/agents — list all agents
  if (path === '/api/agents' && request.method === 'GET') {
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    let query = 'SELECT * FROM agents WHERE 1=1';
    const params: any[] = [];
    if (type) { query += ' AND type = ?'; params.push(type); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY type, name';
    const rows = await env.DB.prepare(query).bind(...params).all();
    return json({ agents: rows.results });
  }

  // POST /api/agents — create new agent
  if (path === '/api/agents' && request.method === 'POST') {
    const body = await request.json() as any;
    const id = validateString(body.id, 50);
    const name = validateString(body.name, 100);
    const type = validateString(body.type, 30);
    if (!id || !name || !type) {
      return json({ error: 'id, name, and type are required' }, 400);
    }
    if (!['app', 'supervisor', 'marketing', 'operations', 'research', 'custom'].includes(type)) {
      return json({ error: 'Invalid type' }, 400);
    }
    const existing = await env.DB.prepare('SELECT id FROM agents WHERE id = ?').bind(id).first();
    if (existing) return json({ error: 'Agent ID already exists' }, 409);

    const budget = validateInt(body.budget_daily_cents, 0, 100000) || 10;
    const model = ['haiku', 'sonnet', 'opus'].includes(body.model_default) ? body.model_default : 'sonnet';

    await env.DB.prepare(`
      INSERT INTO agents (id, type, name, description, app_id, config_json, capabilities_json,
        model_default, budget_daily_cents, system_prompt, skills_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, type, name,
      validateString(body.description, 500) || null,
      validateString(body.app_id, 50) || null,
      body.config_json ? JSON.stringify(typeof body.config_json === 'string' ? JSON.parse(body.config_json) : body.config_json) : null,
      body.capabilities_json ? JSON.stringify(typeof body.capabilities_json === 'string' ? JSON.parse(body.capabilities_json) : body.capabilities_json) : null,
      model, budget,
      validateString(body.system_prompt, 10000) || null,
      body.skills_json ? JSON.stringify(body.skills_json) : null,
    ).run();
    await logAudit(env, id, null, 'agent-created', `Agent ${name} (${type}) created`);
    return json({ ok: true, id });
  }

  // GET /api/marketing/dashboard — marketing command centre aggregate
  if (path === '/api/marketing/dashboard' && request.method === 'GET') {
    const MKT_AGENTS = ['marketer', 'marketing-business', 'marketing-content', 'marketing-social', 'marketing-seo', 'mkt-researcher', 'mkt-analytics', 'mkt-reviewer', 'outreach', 'supervisor-marketing'];
    const mktList = MKT_AGENTS.map(a => `'${a}'`).join(',');

    // Approvals pending
    const approvals = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM agent_tasks
      WHERE agent_id IN (${mktList}) AND status = 'needs-approval'
    `).first<{ count: number }>();

    // Content in pipeline (queued or claimed marketing content tasks)
    const contentPipeline = await env.DB.prepare(`
      SELECT id, agent_id, type, status, title, output_json, created_at, completed_at FROM agent_tasks
      WHERE agent_id IN (${mktList})
        AND type IN ('content-plan','blog-write','blog-seo','content-review','social-create')
        AND status IN ('queued','claimed','running','completed','needs-approval')
        AND created_at > datetime('now', '-14 days')
      ORDER BY created_at DESC LIMIT 30
    `).all();

    // Lead tasks
    const leadTasks = await env.DB.prepare(`
      SELECT id, agent_id, type, status, title, input_json, output_json, created_at, completed_at FROM agent_tasks
      WHERE type IN ('lead-research','lead-response')
        AND status IN ('queued','claimed','running','completed','needs-approval')
        AND created_at > datetime('now', '-14 days')
      ORDER BY created_at DESC LIMIT 20
    `).all();

    // Recent Bark leads
    const barkLeads = await env.DB.prepare(`
      SELECT id, first_name, location, business_type, bark_category, status, confidence, matched_name, matched_company, created_at
      FROM bark_leads WHERE created_at > datetime('now', '-30 days')
      ORDER BY created_at DESC LIMIT 10
    `).all();

    // Recent completed marketing tasks (activity feed)
    const recentActivity = await env.DB.prepare(`
      SELECT id, agent_id, type, title, status, completed_at, created_at FROM agent_tasks
      WHERE agent_id IN (${mktList})
        AND status IN ('completed','failed')
        AND completed_at > datetime('now', '-48 hours')
      ORDER BY completed_at DESC LIMIT 15
    `).all();

    // Social posts this week
    const socialThisWeek = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM agent_tasks
      WHERE type = 'social-create' AND status = 'completed'
        AND completed_at > datetime('now', '-7 days')
    `).first<{ count: number }>();

    // Group content pipeline by stage
    const tasks = (contentPipeline.results || []) as any[];
    const pipeline = {
      drafting: tasks.filter(t => t.type === 'blog-write' && t.status !== 'completed'),
      seo: tasks.filter(t => t.type === 'blog-seo' && t.status !== 'completed'),
      review: tasks.filter(t => t.type === 'content-review' && t.status !== 'completed'),
      approved: tasks.filter(t => t.status === 'completed' && t.type !== 'social-create'),
      social: tasks.filter(t => t.type === 'social-create'),
    };

    // Next action (first pending approval or first queued high-priority task)
    const nextApproval = await env.DB.prepare(`
      SELECT id, title, type FROM agent_tasks
      WHERE agent_id IN (${mktList}) AND status = 'needs-approval'
      ORDER BY priority ASC, created_at ASC LIMIT 1
    `).first<{ id: number; title: string; type: string }>();

    return json({
      stats: {
        leads_awaiting: ((leadTasks.results || []) as any[]).filter(t => t.status !== 'completed').length,
        content_in_pipeline: pipeline.drafting.length + pipeline.seo.length + pipeline.review.length,
        social_posts_this_week: socialThisWeek?.count || 0,
        approvals_pending: approvals?.count || 0,
      },
      leads: barkLeads.results || [],
      lead_tasks: leadTasks.results || [],
      content_pipeline: pipeline,
      recent_activity: recentActivity.results || [],
      next_action: nextApproval ? { type: nextApproval.type, title: nextApproval.title, task_id: nextApproval.id } : null,
    });
  }

  // GET /api/agents/dashboard — aggregate stats
  if (path === '/api/agents/dashboard' && request.method === 'GET') {
    const agents = await env.DB.prepare('SELECT * FROM agents ORDER BY type, name').all();
    const taskStats = await env.DB.prepare(`
      SELECT status, COUNT(*) as count FROM agent_tasks
      WHERE created_at > datetime('now', '-7 days')
      GROUP BY status
    `).all();
    const pendingApprovals = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM agent_tasks WHERE status = 'needs-approval'"
    ).first<{ count: number }>();
    const todayBudget = await env.DB.prepare(`
      SELECT SUM(cost_cents) as total_cents, SUM(task_count) as total_tasks
      FROM agent_budget_daily WHERE date = date('now')
    `).first();
    return json({
      agents: agents.results,
      taskStats: taskStats.results,
      pendingApprovals: pendingApprovals?.count || 0,
      todayBudget: todayBudget || { total_cents: 0, total_tasks: 0 },
    });
  }

  // GET /api/agents/:id — single agent detail
  const agentMatch = path.match(/^\/api\/agents\/([a-z0-9-]+)$/);
  if (agentMatch && request.method === 'GET' && !path.includes('/tasks') && !path.includes('/budget')) {
    const id = agentMatch[1];
    if (['dashboard', 'tasks', 'messages', 'bulletins', 'audit', 'claims', 'policies', 'skills', 'templates', 'routing-rules'].includes(id)) {
      // Fall through to other routes
    } else {
      const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?').bind(id).first();
      if (!agent) return json({ error: 'Agent not found' }, 404);
      const recentTasks = await env.DB.prepare(
        "SELECT * FROM agent_tasks WHERE agent_id = ? ORDER BY created_at DESC LIMIT 10"
      ).bind(id).all();
      const budget = await env.DB.prepare(
        "SELECT * FROM agent_budget_daily WHERE agent_id = ? AND date = date('now')"
      ).bind(id).first();
      const stats = await env.DB.prepare(`
        SELECT
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          AVG(CASE WHEN status = 'completed' THEN cost_cents END) as avg_cost,
          SUM(cost_cents) as total_cost
        FROM agent_tasks WHERE agent_id = ? AND created_at > datetime('now', '-30 days')
      `).bind(id).first();
      return json({ agent, recentTasks: recentTasks.results, todayBudget: budget, stats });
    }
  }

  // PUT /api/agents/:id — update agent config/status
  const agentUpdateMatch = path.match(/^\/api\/agents\/([a-z0-9-]+)$/);
  if (agentUpdateMatch && request.method === 'PUT') {
    const id = agentUpdateMatch[1];
    const existing = await env.DB.prepare('SELECT id FROM agents WHERE id = ?').bind(id).first();
    if (!existing) return json({ error: 'Agent not found' }, 404);

    const body = await request.json() as any;
    const fields: string[] = [];
    const params: any[] = [];
    if (body.status && ['idle', 'running', 'paused', 'errored', 'disabled'].includes(body.status)) {
      fields.push('status = ?'); params.push(body.status);
    }
    if (body.config_json) {
      try { JSON.parse(body.config_json); } catch { return json({ error: 'Invalid config_json' }, 400); }
      fields.push('config_json = ?'); params.push(body.config_json);
    }
    if (body.capabilities_json) {
      try { JSON.parse(body.capabilities_json); } catch { return json({ error: 'Invalid capabilities_json' }, 400); }
      fields.push('capabilities_json = ?'); params.push(body.capabilities_json);
    }
    if (body.model_default && ['haiku', 'sonnet', 'opus'].includes(body.model_default)) {
      fields.push('model_default = ?'); params.push(body.model_default);
    }
    if (body.budget_daily_cents !== undefined) {
      const budget = validateInt(body.budget_daily_cents, 0, 100000);
      if (budget === null) return json({ error: 'Invalid budget_daily_cents (0-100000)' }, 400);
      fields.push('budget_daily_cents = ?'); params.push(budget);
    }
    if (body.description) {
      fields.push('description = ?'); params.push(validateString(body.description, 500));
    }
    if (fields.length === 0) return json({ error: 'No valid fields to update' }, 400);
    fields.push("updated_at = datetime('now')");
    params.push(id);
    await env.DB.prepare(`UPDATE agents SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
    return json({ ok: true });
  }

  // DELETE /api/agents/:id — soft delete (deactivate)
  const agentDeleteMatch = path.match(/^\/api\/agents\/([a-z0-9-]+)$/);
  if (agentDeleteMatch && request.method === 'DELETE') {
    const id = agentDeleteMatch[1];
    const existing = await env.DB.prepare('SELECT id FROM agents WHERE id = ?').bind(id).first();
    if (!existing) return json({ error: 'Agent not found' }, 404);
    await env.DB.batch([
      env.DB.prepare("UPDATE agents SET status = 'disabled', updated_at = datetime('now') WHERE id = ?").bind(id),
      env.DB.prepare("UPDATE agent_tasks SET status = 'cancelled', completed_at = datetime('now') WHERE agent_id = ? AND status IN ('queued','claimed')").bind(id),
      env.DB.prepare("UPDATE agent_schedules SET enabled = 0 WHERE agent_id = ?").bind(id),
      env.DB.prepare("UPDATE agent_file_claims SET released_at = datetime('now') WHERE agent_id = ? AND released_at IS NULL").bind(id),
    ]);
    await logAudit(env, id, null, 'agent-deactivated', `Agent ${id} deactivated`);
    return json({ ok: true });
  }

  // GET /api/agents/:id/budget — budget status
  const budgetMatch = path.match(/^\/api\/agents\/([a-z0-9-]+)\/budget$/);
  if (budgetMatch && request.method === 'GET') {
    const id = budgetMatch[1];
    const agent = await env.DB.prepare('SELECT budget_daily_cents, budget_spent_today_cents FROM agents WHERE id = ?').bind(id).first<any>();
    if (!agent) return json({ error: 'Agent not found' }, 404);
    const history = await env.DB.prepare(
      "SELECT * FROM agent_budget_daily WHERE agent_id = ? ORDER BY date DESC LIMIT 7"
    ).bind(id).all();
    return json({
      daily_limit_cents: agent.budget_daily_cents,
      spent_today_cents: agent.budget_spent_today_cents,
      remaining_cents: Math.max(0, agent.budget_daily_cents - agent.budget_spent_today_cents),
      pct_used: agent.budget_daily_cents > 0 ? Math.round((agent.budget_spent_today_cents / agent.budget_daily_cents) * 100) : 0,
      history: history.results,
    });
  }

  // ─── Task Queue ──────────────────────────────────────────────

  // GET /api/agents/tasks — list tasks with filters
  if (path === '/api/agents/tasks' && request.method === 'GET') {
    const agentId = url.searchParams.get('agent_id');
    const status = url.searchParams.get('status');
    const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '50') || 50, 200));
    let query = 'SELECT * FROM agent_tasks WHERE 1=1';
    const params: any[] = [];
    if (agentId) { query += ' AND agent_id = ?'; params.push(agentId); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY priority ASC, created_at ASC LIMIT ?';
    params.push(limit);
    const rows = await env.DB.prepare(query).bind(...params).all();
    return json({ tasks: rows.results });
  }

  // GET /api/agents/tasks/next — pull next available task (for executor)
  if (path === '/api/agents/tasks/next' && request.method === 'GET') {
    const agentId = url.searchParams.get('agent_id');
    let query = "SELECT * FROM agent_tasks WHERE status = 'queued'";
    const params: any[] = [];
    if (agentId) { query += ' AND agent_id = ?'; params.push(agentId); }
    query += ' ORDER BY priority ASC, created_at ASC LIMIT 1';
    const task = await env.DB.prepare(query).bind(...params).first();
    if (!task) return json({ task: null });
    return json({ task });
  }

  // POST /api/agents/tasks — create a task
  if (path === '/api/agents/tasks' && request.method === 'POST') {
    const body = await request.json() as any;
    const agentId = validateString(body.agent_id, 50);
    const title = validateString(body.title, 200);
    const type = validateString(body.type, 50);
    if (!agentId || !title || !type) {
      return json({ error: 'agent_id (max 50), title (max 200), and type (max 50) are required' }, 400);
    }
    // Verify agent exists
    const agent = await env.DB.prepare('SELECT id FROM agents WHERE id = ?').bind(agentId).first();
    if (!agent) return json({ error: 'Not found' }, 404);

    // Rate limit: max 100 tasks per agent per hour
    const recentCount = await env.DB.prepare(
      "SELECT COUNT(*) as c FROM agent_tasks WHERE agent_id = ? AND created_at > datetime('now', '-1 hour')"
    ).bind(agentId).first<{ c: number }>();
    if ((recentCount?.c || 0) >= 500) {
      return json({ error: 'Rate limit exceeded' }, 429);
    }

    const priority = validateInt(body.priority, 1, 10) || 5;
    const description = validateString(body.description, 5000) || null;
    let inputJson: string | null = null;
    if (body.input_json) {
      try { inputJson = typeof body.input_json === 'string' ? body.input_json : JSON.stringify(body.input_json); }
      catch { return json({ error: 'Invalid input_json' }, 400); }
    }

    const createdBy = validateString(body.created_by, 50) || 'human';

    // Evaluate policy engine to determine if auto-approve or block
    const agentRow = await env.DB.prepare('SELECT type, budget_daily_cents, budget_spent_today_cents FROM agents WHERE id = ?').bind(agentId).first<any>();
    const budgetPct = agentRow?.budget_daily_cents > 0 ? (agentRow.budget_spent_today_cents / agentRow.budget_daily_cents) * 100 : 0;

    const policyResult = await evaluatePolicy(env, {
      agent_id: agentId,
      agent_type: agentRow?.type || 'app',
      task_type: type,
      priority,
      created_by: createdBy,
      retry_count: 0,
      max_retries: 2,
      budget_pct: budgetPct,
    });

    let requiresApproval = body.requires_approval ? 1 : 0;
    let initialStatus = 'queued';
    if (policyResult.action === 'auto_approve') requiresApproval = 0;
    if (policyResult.action === 'block') initialStatus = 'cancelled';

    const result = await env.DB.prepare(`
      INSERT INTO agent_tasks (agent_id, type, priority, status, title, description, input_json, created_by, requires_approval, parent_task_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      agentId, type, priority, initialStatus, title, description, inputJson,
      createdBy, requiresApproval, body.parent_task_id || null,
    ).run();

    const taskId = result.meta.last_row_id;
    const policyNote = policyResult.policy_name ? ` [policy: ${policyResult.policy_name} → ${policyResult.action}]` : '';
    await logAudit(env, agentId, null, 'task-created', `${title}${policyNote}`);

    if (policyResult.action === 'block') {
      await logAudit(env, agentId, taskId as number, 'task-blocked', `Blocked by policy: ${policyResult.policy_name}`);
    }

    if (policyResult.action === 'notify') {
      await env.DB.prepare(`
        INSERT INTO agent_bulletins (agent_id, scope, severity, title, body, expires_at)
        VALUES (?, 'all', 'warning', ?, ?, datetime('now', '+24 hours'))
      `).bind(
        agentId,
        `Policy alert: ${policyResult.policy_name}`,
        `Agent ${agentId} triggered policy "${policyResult.policy_name}" on task "${title}"`,
      ).run();
    }

    return json({ ok: true, id: taskId, policy: policyResult.action, policy_name: policyResult.policy_name });
  }

  // Task actions: claim, complete, fail, approve, reject, heartbeat
  const taskActionMatch = path.match(/^\/api\/agents\/tasks\/(\d+)\/(claim|complete|fail|approve|reject|heartbeat)$/);
  if (taskActionMatch && request.method === 'PUT') {
    const taskId = parseInt(taskActionMatch[1]);
    const action = taskActionMatch[2];

    // Heartbeat is lightweight — no full task fetch needed
    if (action === 'heartbeat') {
      const result = await env.DB.prepare(
        "UPDATE agent_tasks SET heartbeat_at = datetime('now') WHERE id = ? AND status IN ('claimed', 'running')"
      ).bind(taskId).run();
      return json({ ok: true, updated: result.meta.changes > 0 });
    }

    const task = await env.DB.prepare('SELECT * FROM agent_tasks WHERE id = ?').bind(taskId).first<any>();
    if (!task) return json({ error: 'Task not found' }, 404);

    switch (action) {
      case 'claim': {
        // ATOMIC CLAIM: only succeeds if status is still 'queued'
        const result = await env.DB.prepare(
          "UPDATE agent_tasks SET status = 'claimed', claimed_at = datetime('now'), heartbeat_at = datetime('now') WHERE id = ? AND status = 'queued'"
        ).bind(taskId).run();
        if (!result.meta.changes) {
          return json({ error: 'Conflict' }, 409);
        }
        await env.DB.prepare(
          "UPDATE agents SET status = 'running', last_active_at = datetime('now') WHERE id = ?"
        ).bind(task.agent_id).run();
        await logAudit(env, task.agent_id, taskId, 'task-claimed', task.title);
        return json({ ok: true });
      }

      case 'complete': {
        if (task.status === 'completed') return json({ ok: true, already: true });
        if (!validateTransition(task.status, 'completed')) {
          return json({ error: 'Invalid operation' }, 400);
        }
        const body = await request.json() as any;
        const costCents = validateInt(body.cost_cents, 0, 1000000) || 0;
        const tokensIn = validateInt(body.tokens_in, 0, 10000000) || 0;
        const tokensOut = validateInt(body.tokens_out, 0, 10000000) || 0;

        await env.DB.prepare(`
          UPDATE agent_tasks SET status = 'completed', completed_at = datetime('now'),
            output_json = ?, model_used = ?, tokens_in = ?, tokens_out = ?, cost_cents = ?
          WHERE id = ?
        `).bind(
          body.output_json ? JSON.stringify(body.output_json).substring(0, 50000) : null,
          validateString(body.model_used, 30) || null,
          tokensIn, tokensOut, costCents, taskId,
        ).run();
        await env.DB.prepare(
          "UPDATE agents SET status = 'idle', last_active_at = datetime('now'), budget_spent_today_cents = budget_spent_today_cents + ? WHERE id = ?"
        ).bind(costCents, task.agent_id).run();
        await env.DB.prepare(`
          INSERT INTO agent_budget_daily (agent_id, date, tokens_in, tokens_out, cost_cents, task_count)
          VALUES (?, date('now'), ?, ?, ?, 1)
          ON CONFLICT(agent_id, date) DO UPDATE SET
            tokens_in = tokens_in + ?, tokens_out = tokens_out + ?,
            cost_cents = cost_cents + ?, task_count = task_count + 1
        `).bind(
          task.agent_id, tokensIn, tokensOut, costCents,
          tokensIn, tokensOut, costCents,
        ).run();
        await logAudit(env, task.agent_id, taskId, 'task-completed', task.title, body.model_used, tokensIn + tokensOut, costCents);

        // Authoring/review separation: auto-create review task for code tasks
        let reviewTaskId = null;
        if (CODE_TASK_TYPES.includes(task.type) && task.agent_id.startsWith('app-')) {
          const reviewResult = await env.DB.prepare(`
            INSERT INTO agent_tasks (agent_id, type, priority, title, description, created_by, parent_task_id)
            VALUES ('supervisor-apps', 'review', ?, ?, ?, 'system', ?)
          `).bind(
            Math.min(task.priority + 2, 10),
            `Review: ${task.title}`,
            `Review task #${taskId} completed by ${task.agent_id}. Verify changes are correct and safe.`,
            taskId,
          ).run();
          reviewTaskId = reviewResult.meta.last_row_id;
          // Link review task back
          await env.DB.prepare('UPDATE agent_tasks SET review_task_id = ? WHERE id = ?').bind(reviewTaskId, taskId).run();
          await logAudit(env, 'supervisor-apps', reviewTaskId as number, 'review-created', `Auto-review for task #${taskId} by ${task.agent_id}`);
        }

        return json({ ok: true, review_task_id: reviewTaskId });
      }

      case 'fail': {
        if (task.status === 'failed') return json({ ok: true, already: true });
        if (!validateTransition(task.status, 'failed')) {
          return json({ error: 'Invalid operation' }, 400);
        }
        const body = await request.json() as any;
        const errorMsg = validateString(body.error_message, 2000) || 'Unknown error';
        const failureType = validateString(body.failure_type, 30) || classifyFailure(errorMsg);
        const retryCount = (task.retry_count || 0) + 1;
        const maxRetries = task.max_retries || 2;

        // Transient failures always retry; others check count
        const shouldRetry = (failureType === 'transient' || retryCount <= maxRetries) && failureType !== 'permission';

        if (shouldRetry && retryCount <= maxRetries) {
          await env.DB.prepare(
            "UPDATE agent_tasks SET status = 'queued', retry_count = ?, error_message = ?, failure_type = ?, heartbeat_at = NULL, claimed_at = NULL WHERE id = ?"
          ).bind(retryCount, errorMsg, failureType, taskId).run();
          await env.DB.prepare(
            "UPDATE agents SET status = 'idle', last_active_at = datetime('now') WHERE id = ?"
          ).bind(task.agent_id).run();
          await logAudit(env, task.agent_id, taskId, 'task-retry', `[${failureType}] Retry ${retryCount}/${maxRetries}: ${errorMsg}`);
          return json({ ok: true, retried: true, retry_count: retryCount, failure_type: failureType });
        }

        // Permanent failure
        await env.DB.prepare(
          "UPDATE agent_tasks SET status = 'failed', completed_at = datetime('now'), error_message = ?, failure_type = ?, retry_count = ? WHERE id = ?"
        ).bind(errorMsg, failureType, retryCount, taskId).run();
        await env.DB.prepare(
          "UPDATE agents SET status = 'errored', last_active_at = datetime('now') WHERE id = ?"
        ).bind(task.agent_id).run();
        await logAudit(env, task.agent_id, taskId, 'task-failed', `[${failureType}] Final failure after ${retryCount} attempts: ${errorMsg}`);

        // Policy: escalate logic failures to supervisor
        if (failureType === 'logic') {
          await env.DB.prepare(`
            INSERT INTO agent_tasks (agent_id, type, priority, title, description, created_by, parent_task_id)
            VALUES ('supervisor-apps', 'review', 3, ?, ?, 'system', ?)
          `).bind(
            `Escalation: ${task.title} failed`,
            `App agent ${task.agent_id} could not complete task #${taskId}: ${errorMsg}`,
            taskId,
          ).run();
          await logAudit(env, task.agent_id, taskId, 'task-escalated', `Escalated to supervisor-apps`);
        }

        return json({ ok: true, retried: false, failure_type: failureType });
      }

      case 'approve': {
        if (task.status !== 'needs-approval') return json({ error: 'Task not pending approval' }, 400);
        await env.DB.prepare(
          "UPDATE agent_tasks SET status = 'queued', approved_at = datetime('now') WHERE id = ?"
        ).bind(taskId).run();
        await logAudit(env, task.agent_id, taskId, 'task-approved', task.title);
        return json({ ok: true });
      }

      case 'reject': {
        if (task.status !== 'needs-approval') return json({ error: 'Task not pending approval' }, 400);
        await env.DB.prepare(
          "UPDATE agent_tasks SET status = 'cancelled', completed_at = datetime('now') WHERE id = ?"
        ).bind(taskId).run();
        await logAudit(env, task.agent_id, taskId, 'task-rejected', task.title);
        return json({ ok: true });
      }
    }
  }

  // ─── Messages ────────────────────────────────────────────────

  if (path === '/api/agents/messages' && request.method === 'GET') {
    const agentId = url.searchParams.get('agent_id');
    const unreadOnly = url.searchParams.get('unread') === 'true';
    let query = 'SELECT * FROM agent_messages WHERE 1=1';
    const params: any[] = [];
    if (agentId) { query += ' AND (to_agent = ? OR from_agent = ?)'; params.push(agentId, agentId); }
    if (unreadOnly) { query += ' AND read_at IS NULL'; }
    query += ' ORDER BY created_at DESC LIMIT 50';
    const rows = await env.DB.prepare(query).bind(...params).all();
    return json({ messages: rows.results });
  }

  if (path === '/api/agents/messages' && request.method === 'POST') {
    const body = await request.json() as any;
    const from = validateString(body.from_agent, 50);
    const to = validateString(body.to_agent, 50);
    const msgBody = validateString(body.body, 10000);
    if (!from || !to || !msgBody) {
      return json({ error: 'from_agent, to_agent, and body are required' }, 400);
    }
    await env.DB.prepare(`
      INSERT INTO agent_messages (from_agent, to_agent, thread_id, message_type, subject, body, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      from, to, body.thread_id || null,
      validateString(body.message_type, 20) || 'info',
      validateString(body.subject, 200) || null, msgBody,
      body.metadata_json ? JSON.stringify(body.metadata_json).substring(0, 5000) : null,
    ).run();
    return json({ ok: true });
  }

  // ─── Bulletins ───────────────────────────────────────────────

  if (path === '/api/agents/bulletins' && request.method === 'GET') {
    const rows = await env.DB.prepare(
      "SELECT * FROM agent_bulletins WHERE expires_at IS NULL OR expires_at > datetime('now') ORDER BY created_at DESC LIMIT 20"
    ).all();
    return json({ bulletins: rows.results });
  }

  if (path === '/api/agents/bulletins' && request.method === 'POST') {
    const body = await request.json() as any;
    const agentId = validateString(body.agent_id, 50);
    const title = validateString(body.title, 200);
    if (!agentId || !title) {
      return json({ error: 'agent_id and title are required' }, 400);
    }
    await env.DB.prepare(`
      INSERT INTO agent_bulletins (agent_id, scope, severity, title, body, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      agentId, validateString(body.scope, 50) || 'all',
      validateString(body.severity, 20) || 'info',
      title, validateString(body.body, 5000) || null, body.expires_at || null,
    ).run();
    return json({ ok: true });
  }

  // ─── Audit ───────────────────────────────────────────────────

  if (path === '/api/agents/audit' && request.method === 'GET') {
    const agentId = url.searchParams.get('agent_id');
    const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '50') || 50, 200));
    let query = 'SELECT * FROM agent_audit WHERE 1=1';
    const params: any[] = [];
    if (agentId) { query += ' AND agent_id = ?'; params.push(agentId); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    const rows = await env.DB.prepare(query).bind(...params).all();
    return json({ audit: rows.results });
  }

  // ─── File Claims ──────────────────────────────────────────────

  // GET /api/agents/claims — active file claims
  if (path === '/api/agents/claims' && request.method === 'GET') {
    const rows = await env.DB.prepare(
      "SELECT * FROM agent_file_claims WHERE released_at IS NULL ORDER BY claimed_at DESC LIMIT 100"
    ).all();
    return json({ claims: rows.results });
  }

  // POST /api/agents/claims — claim files
  if (path === '/api/agents/claims' && request.method === 'POST') {
    const body = await request.json() as any;
    if (!body.agent_id || !body.task_id || !body.files || !Array.isArray(body.files)) {
      return json({ error: 'agent_id, task_id, and files[] required' }, 400);
    }
    const conflicts: string[] = [];
    for (const filePath of body.files) {
      const existing = await env.DB.prepare(
        "SELECT agent_id FROM agent_file_claims WHERE file_path = ? AND released_at IS NULL AND agent_id != ?"
      ).bind(filePath, body.agent_id).first();
      if (existing) {
        conflicts.push(`${filePath} (held by ${(existing as any).agent_id})`);
      } else {
        await env.DB.prepare(
          "INSERT OR REPLACE INTO agent_file_claims (file_path, agent_id, task_id) VALUES (?, ?, ?)"
        ).bind(filePath, body.agent_id, body.task_id).run();
      }
    }
    return json({ ok: true, conflicts });
  }

  // DELETE /api/agents/claims — release files
  if (path === '/api/agents/claims' && request.method === 'DELETE') {
    const body = await request.json() as any;
    if (!body.agent_id || !body.task_id) return json({ error: 'agent_id and task_id required' }, 400);
    await env.DB.prepare(
      "UPDATE agent_file_claims SET released_at = datetime('now') WHERE agent_id = ? AND task_id = ?"
    ).bind(body.agent_id, body.task_id).run();
    return json({ ok: true });
  }

  // ─── Feedback ────────────────────────────────────────────────

  // POST /api/agents/tasks/:id/feedback — rate and provide feedback
  const feedbackMatch = path.match(/^\/api\/agents\/tasks\/(\d+)\/feedback$/);
  if (feedbackMatch && request.method === 'POST') {
    const taskId = parseInt(feedbackMatch[1]);
    const task = await env.DB.prepare('SELECT * FROM agent_tasks WHERE id = ?').bind(taskId).first<any>();
    if (!task) return json({ error: 'Not found' }, 404);

    const body = await request.json() as any;
    const rating = validateInt(body.rating, 1, 5);
    const feedback = validateString(body.feedback, 2000);

    if (rating) {
      await env.DB.prepare('UPDATE agent_tasks SET quality_rating = ? WHERE id = ?').bind(rating, taskId).run();
    }

    await logAudit(env, task.agent_id, taskId, 'task-feedback',
      `Rating: ${rating || 'none'} — ${feedback || 'no comment'}`);

    return json({ ok: true });
  }

  // ─── Execute (Draft System) ───────────────────────────────────

  // POST /api/agents/tasks/:id/execute — execute an approved draft
  const executeMatch = path.match(/^\/api\/agents\/tasks\/(\d+)\/execute$/);
  if (executeMatch && request.method === 'POST') {
    const taskId = parseInt(executeMatch[1]);
    const task = await env.DB.prepare('SELECT * FROM agent_tasks WHERE id = ?').bind(taskId).first<any>();
    if (!task) return json({ error: 'Not found' }, 404);
    if (task.status !== 'completed') return json({ error: 'Task must be completed before execution' }, 400);

    let draft: any;
    try { draft = JSON.parse(task.output_json || '{}'); } catch { return json({ error: 'Invalid draft data' }, 400); }

    const draftType = draft.type || draft.summary?.type;
    let result = { executed: false, detail: 'Unknown draft type' };

    // Draft types would be executed here (Gmail send, GitHub PR, etc.)
    // For now, mark as executed and log
    result = { executed: true, detail: `Draft type "${draftType || 'general'}" marked as executed. Manual action may be needed.` };

    await env.DB.prepare(
      "UPDATE agent_tasks SET output_json = ? WHERE id = ?"
    ).bind(JSON.stringify({ ...draft, _executed: true, _executed_at: new Date().toISOString() }), taskId).run();
    await logAudit(env, task.agent_id, taskId, 'task-executed', result.detail);
    return json({ ok: true, ...result });
  }

  // ─── Natural Language Task Decomposition ─────────────────────

  // POST /api/agents/tasks/natural — decompose natural language into tasks
  if (path === '/api/agents/tasks/natural' && request.method === 'POST') {
    const body = await request.json() as any;
    const prompt = validateString(body.prompt, 500);
    if (!prompt) return json({ error: 'prompt is required (max 500 chars)' }, 400);

    // Get agent list for context
    const agents = await env.DB.prepare("SELECT id, type, name FROM agents WHERE status != 'disabled' ORDER BY type, name").all();
    const agentList = (agents.results as any[]).map(a => `${a.id} (${a.type}: ${a.name})`).join(', ');

    // Use Anthropic API to decompose (Haiku for cost efficiency)
    const apiKey = env.ANTHROPIC_API_KEY || '';
    if (!apiKey) {
      // Fallback: create a single task for supervisor
      const result = await env.DB.prepare(`
        INSERT INTO agent_tasks (agent_id, type, priority, title, description, created_by)
        VALUES ('supervisor-apps', 'general', 5, ?, ?, 'natural-language')
      `).bind(prompt.substring(0, 200), prompt).run();
      return json({ ok: true, tasks: [{ id: result.meta.last_row_id, title: prompt }], fallback: true });
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{ role: 'user', content: `Given these agents: ${agentList}\n\nDecompose this request into 1-5 specific tasks:\n"${prompt}"\n\nReturn ONLY a JSON array: [{"agent_id":"...","type":"...","priority":1-10,"title":"...","description":"..."}]\nUse existing agent IDs. Types: health-check, code-review, bug-fix, audit, general, content, research.` }],
        }),
      });
      const data = await response.json() as any;
      const text = data.content?.[0]?.text || '[]';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const tasks = JSON.parse(jsonMatch?.[0] || '[]');

      const created = [];
      for (const t of tasks.slice(0, 5)) {
        const agentId = validateString(t.agent_id, 50) || 'supervisor-apps';
        const exists = await env.DB.prepare('SELECT id FROM agents WHERE id = ?').bind(agentId).first();
        if (!exists) continue;
        const result = await env.DB.prepare(`
          INSERT INTO agent_tasks (agent_id, type, priority, title, description, created_by)
          VALUES (?, ?, ?, ?, ?, 'natural-language')
        `).bind(agentId, t.type || 'general', t.priority || 5, t.title || prompt, t.description || '').run();
        created.push({ id: result.meta.last_row_id, agent_id: agentId, title: t.title });
      }
      await logAudit(env, 'system', null, 'natural-language', `"${prompt}" → ${created.length} tasks`);
      return json({ ok: true, tasks: created });
    } catch (e: any) {
      return json({ error: 'Decomposition failed: ' + e.message }, 500);
    }
  }

  // ─── Event Routing Rules ────────────────────────────────────

  // GET /api/agents/routing-rules — list routing rules
  if (path === '/api/agents/routing-rules' && request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM event_routing_rules ORDER BY source, task_priority').all();
    return json({ rules: rows.results });
  }

  // ─── Skills ───────────────────────────────────────────────────

  // GET /api/agents/skills — list all skills
  if (path === '/api/agents/skills' && request.method === 'GET') {
    const category = url.searchParams.get('category');
    let query = 'SELECT * FROM agent_skills WHERE 1=1';
    const params: any[] = [];
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY category, name';
    const rows = await env.DB.prepare(query).bind(...params).all();
    return json({ skills: rows.results });
  }

  // ─── Task Templates ─────────────────────────────────────────

  // GET /api/agents/templates — list task templates
  if (path === '/api/agents/templates' && request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM agent_task_templates ORDER BY name').all();
    return json({ templates: rows.results });
  }

  // ─── Policies ────────────────────────────────────────────────

  // GET /api/agents/policies — list policies
  if (path === '/api/agents/policies' && request.method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM agent_policies ORDER BY priority ASC').all();
    return json({ policies: rows.results });
  }

  return json({ error: 'Agent route not found' }, 404);
}

// ─── Helpers ─────────────────────────────────────────────────

function classifyFailure(errorMsg: string): string {
  const msg = errorMsg.toLowerCase();
  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('ETIMEDOUT')) return 'timeout';
  if (msg.includes('rate limit') || msg.includes('429') || msg.includes('overloaded')) return 'transient';
  if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('ECONNREFUSED')) return 'infrastructure';
  if (msg.includes('permission') || msg.includes('denied') || msg.includes('blocked')) return 'permission';
  if (msg.includes('budget') || msg.includes('exceeded')) return 'budget';
  return 'logic';
}

async function logAudit(
  env: Env, agentId: string, taskId: number | null,
  action: string, detail?: string, model?: string,
  tokens?: number, costCents?: number,
) {
  await env.DB.prepare(`
    INSERT INTO agent_audit (agent_id, task_id, action, detail, model, tokens, cost_cents)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(agentId, taskId, action, detail || null, model || null, tokens || 0, costCents || 0).run();
}

// Agent Harness Cron — budget reset, stale task cleanup, schedule evaluation.
// Runs on the every-30-minutes cron slot alongside existing crons.

import { Env } from '../types';

const STALE_TASK_TIMEOUT_MINUTES = 10;

export async function runAgentCron(env: Env): Promise<void> {
  const now = new Date();
  const minute = now.getUTCMinutes();
  const hour = now.getUTCHours();

  // Budget reset at midnight UTC (minute 0, hour 0)
  if (hour === 0 && minute < 30) {
    await resetDailyBudgets(env);
  }

  // Stale task cleanup — every run
  await recoverStaleTasks(env);

  // Expired bulletin cleanup — every run
  await cleanupExpiredBulletins(env);

  // Evaluate scheduled tasks — every run
  await evaluateSchedules(env, now);

  // Event routing — check for health failures and create agent tasks
  await routeHealthEvents(env);

  // Release stale file claims (>2 hours old)
  await releaseStaleFileClaims(env);

  // Approval timeout check
  await checkApprovalTimeouts(env);

  // Weekly data retention (Sunday)
  if (now.getUTCDay() === 0 && hour === 3 && minute < 30) {
    await runDataRetention(env);
  }
}

async function resetDailyBudgets(env: Env): Promise<void> {
  const result = await env.DB.prepare(
    "UPDATE agents SET budget_spent_today_cents = 0, budget_reset_at = datetime('now')"
  ).run();

  if (result.meta.changes > 0) {
    await env.DB.prepare(`
      INSERT INTO agent_audit (agent_id, task_id, action, detail)
      VALUES ('system', NULL, 'budget-reset', ?)
    `).bind(`Daily budget reset for ${result.meta.changes} agents`).run();
  }
}

async function recoverStaleTasks(env: Env): Promise<void> {
  // Find tasks claimed more than STALE_TASK_TIMEOUT_MINUTES ago with no recent heartbeat
  const timeout = `-${STALE_TASK_TIMEOUT_MINUTES} minutes`;
  const staleTasks = await env.DB.prepare(`
    SELECT id, agent_id, title, retry_count, max_retries FROM agent_tasks
    WHERE status IN ('claimed', 'running')
    AND (
      (heartbeat_at IS NULL AND claimed_at < datetime('now', ?))
      OR (heartbeat_at < datetime('now', ?))
    )
  `).bind(timeout, timeout).all();

  for (const task of staleTasks.results as any[]) {
    const retryCount = (task.retry_count || 0) + 1;
    const maxRetries = task.max_retries || 2;

    if (retryCount <= maxRetries) {
      // Re-queue for retry
      await env.DB.prepare(
        "UPDATE agent_tasks SET status = 'queued', retry_count = ?, error_message = 'Executor timeout - auto-recovered', heartbeat_at = NULL, claimed_at = NULL WHERE id = ?"
      ).bind(retryCount, task.id).run();
    } else {
      // Max retries exceeded
      await env.DB.prepare(
        "UPDATE agent_tasks SET status = 'failed', completed_at = datetime('now'), error_message = 'Executor timeout after max retries', retry_count = ? WHERE id = ?"
      ).bind(retryCount, task.id).run();
    }

    // Reset agent status
    await env.DB.prepare(
      "UPDATE agents SET status = 'idle' WHERE id = ? AND status = 'running'"
    ).bind(task.agent_id).run();

    await env.DB.prepare(`
      INSERT INTO agent_audit (agent_id, task_id, action, detail)
      VALUES (?, ?, 'task-recovered', ?)
    `).bind(task.agent_id, task.id, `Stale task recovered (retry ${retryCount}/${maxRetries})`).run();
  }
}

async function cleanupExpiredBulletins(env: Env): Promise<void> {
  await env.DB.prepare(
    "DELETE FROM agent_bulletins WHERE expires_at IS NOT NULL AND expires_at < datetime('now')"
  ).run();
}

async function evaluateSchedules(env: Env, now: Date): Promise<void> {
  // Find enabled schedules whose next_run_at is in the past
  const due = await env.DB.prepare(`
    SELECT * FROM agent_schedules
    WHERE enabled = 1 AND (next_run_at IS NULL OR next_run_at <= datetime('now'))
  `).all();

  for (const schedule of due.results as any[]) {
    // Check if we should run (simple cron matching for daily schedules)
    if (schedule.next_run_at === null || shouldRunNow(schedule.cron_expression, now)) {
      // Create the task
      await env.DB.prepare(`
        INSERT INTO agent_tasks (agent_id, type, priority, title, description, input_json, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 'schedule')
      `).bind(
        schedule.agent_id, schedule.task_type, schedule.task_priority,
        schedule.task_title, schedule.task_description, schedule.task_input_json,
      ).run();

      // Update last_run_at and next_run_at
      const nextRun = getNextRunTime(schedule.cron_expression, now);
      await env.DB.prepare(
        "UPDATE agent_schedules SET last_run_at = datetime('now'), next_run_at = ? WHERE id = ?"
      ).bind(nextRun, schedule.id).run();

      await env.DB.prepare(`
        INSERT INTO agent_audit (agent_id, task_id, action, detail)
        VALUES (?, NULL, 'schedule-triggered', ?)
      `).bind(schedule.agent_id, `Scheduled: ${schedule.name}`).run();
    }
  }
}

// Simple cron matcher — supports "M H * * *" format (minute hour)
function shouldRunNow(cron: string, now: Date): boolean {
  const parts = cron.split(' ');
  if (parts.length < 5) return false;
  const [cronMin, cronHour] = parts;
  const currentMin = now.getUTCMinutes();
  const currentHour = now.getUTCHours();

  const minMatch = cronMin === '*' || parseInt(cronMin) === currentMin || Math.abs(parseInt(cronMin) - currentMin) < 15;
  const hourMatch = cronHour === '*' || parseInt(cronHour) === currentHour;

  return minMatch && hourMatch;
}

function getNextRunTime(cron: string, now: Date): string {
  const parts = cron.split(' ');
  if (parts.length < 5) return new Date(now.getTime() + 86400000).toISOString();
  const [cronMin, cronHour] = parts;

  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + 1);
  next.setUTCHours(cronHour === '*' ? 0 : parseInt(cronHour));
  next.setUTCMinutes(cronMin === '*' ? 0 : parseInt(cronMin));
  next.setUTCSeconds(0);
  return next.toISOString().replace('T', ' ').substring(0, 19);
}

// Event router: health failures create agent tasks (ClawHip pattern)
async function routeHealthEvents(env: Env): Promise<void> {
  // Find apps with recent health failures (last 30 min) that don't already have an active task
  const failures = await env.DB.prepare(`
    SELECT h.app_id, h.error_message, a.id as agent_id
    FROM health_cache h
    JOIN agents a ON a.app_id = h.app_id
    WHERE h.status = 'error'
    AND h.checked_at > datetime('now', '-30 minutes')
    AND a.type = 'app'
    AND NOT EXISTS (
      SELECT 1 FROM agent_tasks t
      WHERE t.agent_id = a.id
      AND t.type = 'health-check'
      AND t.status IN ('queued', 'claimed', 'running')
      AND t.created_at > datetime('now', '-1 hour')
    )
  `).all();

  for (const f of failures.results as any[]) {
    await env.DB.prepare(`
      INSERT INTO agent_tasks (agent_id, type, priority, title, description, created_by)
      VALUES (?, 'health-check', 1, ?, ?, 'event-router')
    `).bind(
      f.agent_id,
      `Health check failure: ${f.app_id}`,
      `App ${f.app_id} is reporting errors: ${f.error_message || 'Unknown'}. Investigate and report.`,
    ).run();
    await env.DB.prepare(`
      INSERT INTO agent_audit (agent_id, task_id, action, detail)
      VALUES (?, NULL, 'event-routed', ?)
    `).bind(f.agent_id, `Health failure auto-task for ${f.app_id}`).run();
  }
}

async function releaseStaleFileClaims(env: Env): Promise<void> {
  await env.DB.prepare(
    "UPDATE agent_file_claims SET released_at = datetime('now') WHERE released_at IS NULL AND claimed_at < datetime('now', '-2 hours')"
  ).run();
}

async function checkApprovalTimeouts(env: Env): Promise<void> {
  // 72h+: auto-reject
  const expired = await env.DB.prepare(`
    UPDATE agent_tasks SET status = 'cancelled', completed_at = datetime('now'),
      error_message = 'Auto-rejected: approval timeout (72h)'
    WHERE status = 'needs-approval' AND created_at < datetime('now', '-72 hours')
  `).run();

  if (expired.meta.changes > 0) {
    await env.DB.prepare(`
      INSERT INTO agent_audit (agent_id, task_id, action, detail)
      VALUES ('system', NULL, 'approval-timeout', ?)
    `).bind(`Auto-rejected ${expired.meta.changes} tasks after 72h timeout`).run();
  }

  // 24h+: create warning bulletin (if not already created in last 24h)
  const stale = await env.DB.prepare(`
    SELECT id, agent_id, title FROM agent_tasks
    WHERE status = 'needs-approval'
    AND created_at < datetime('now', '-24 hours')
    AND created_at > datetime('now', '-72 hours')
  `).all();

  for (const task of stale.results as any[]) {
    const existingBulletin = await env.DB.prepare(`
      SELECT id FROM agent_bulletins
      WHERE title LIKE '%approval stale%' AND body LIKE ?
      AND created_at > datetime('now', '-24 hours')
    `).bind(`%#${task.id}%`).first();

    if (!existingBulletin) {
      await env.DB.prepare(`
        INSERT INTO agent_bulletins (agent_id, scope, severity, title, body, expires_at)
        VALUES (?, 'all', 'warning', 'Task approval stale', ?, datetime('now', '+24 hours'))
      `).bind(task.agent_id, `Task #${task.id} "${task.title}" has been waiting for approval >24h`).run();
    }
  }
}

async function runDataRetention(env: Env): Promise<void> {
  // Delete completed/failed/cancelled tasks older than 30 days
  const deleted = await env.DB.prepare(`
    DELETE FROM agent_tasks
    WHERE status IN ('completed','failed','cancelled')
    AND completed_at < datetime('now', '-30 days')
  `).run();

  // Release orphaned file claims
  await env.DB.prepare(`
    UPDATE agent_file_claims SET released_at = datetime('now')
    WHERE released_at IS NULL AND task_id IN (
      SELECT id FROM agent_tasks WHERE status IN ('completed','failed','cancelled')
    )
  `).run();

  // Delete old bulletins (expired > 7 days ago)
  await env.DB.prepare(`
    DELETE FROM agent_bulletins
    WHERE expires_at IS NOT NULL AND expires_at < datetime('now', '-7 days')
  `).run();

  if (deleted.meta.changes > 0) {
    await env.DB.prepare(`
      INSERT INTO agent_audit (agent_id, task_id, action, detail)
      VALUES ('system', NULL, 'data-retention', ?)
    `).bind(`Cleaned up ${deleted.meta.changes} old tasks`).run();
  }
}

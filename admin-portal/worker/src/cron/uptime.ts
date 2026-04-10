/**
 * Cron: Uptime checker — HTTP HEAD against all app production URLs.
 */

import { Env } from '../types';
import { getAllApps } from '../lib/d1';

export async function runUptimeChecks(env: Env): Promise<void> {
  const apps = await getAllApps(env);

  const checks = apps
    .filter(app => app.frontend_url)
    .map(async app => {
      const start = Date.now();
      let statusCode = 0;
      let isUp = 0;

      try {
        const response = await fetch(app.frontend_url!, {
          method: 'HEAD',
          signal: AbortSignal.timeout(15000),
          redirect: 'follow',
        });
        statusCode = response.status;
        isUp = statusCode >= 200 && statusCode < 400 ? 1 : 0;
      } catch {
        statusCode = 0;
        isUp = 0;
      }

      const responseMs = Date.now() - start;

      await env.DB.prepare(
        `INSERT INTO uptime_checks (app_id, url, status_code, response_ms, is_up, checked_at)
         VALUES (?, ?, ?, ?, ?, datetime("now"))`
      ).bind(app.id, app.frontend_url, statusCode, responseMs, isUp).run();

      // Log if site went down
      if (!isUp) {
        await env.DB.prepare(
          'INSERT INTO activity_log (source, event_type, summary) VALUES (?, ?, ?)'
        ).bind(app.id, 'site_down', `${app.name} (${app.frontend_url}) is DOWN — HTTP ${statusCode}`).run();
      }
    });

  await Promise.allSettled(checks);

  // Aggregate into performance_history (hourly buckets)
  try {
    await env.DB.prepare(`
      INSERT OR REPLACE INTO performance_history (app_id, hour, avg_ms, p95_ms, max_ms, check_count)
      SELECT app_id,
        strftime('%Y-%m-%d %H:00', checked_at) as hour,
        CAST(AVG(response_ms) AS INTEGER) as avg_ms,
        CAST(response_ms AS INTEGER) as p95_ms,
        MAX(response_ms) as max_ms,
        COUNT(*) as check_count
      FROM uptime_checks
      WHERE checked_at > datetime('now', '-2 hours')
      GROUP BY app_id, hour
    `).run();
  } catch { /* non-critical */ }

  // Clean up old uptime records (keep last 7 days)
  await env.DB.prepare(
    'DELETE FROM uptime_checks WHERE checked_at < datetime("now", "-7 days")'
  ).run();

  // Clean up old performance history (keep last 90 days)
  await env.DB.prepare(
    'DELETE FROM performance_history WHERE hour < datetime("now", "-90 days")'
  ).run();
}

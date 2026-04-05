/**
 * Deploy/infrastructure routes — GitHub status, uptime monitoring, response times.
 */

import { Env, json } from '../types';

export async function handleDeployRoutes(path: string, env: Env): Promise<Response> {
  // GET /api/deploy/github — all repos status
  if (path === '/api/deploy/github') {
    const repos = await env.DB.prepare(`
      SELECT g.*, a.name as app_name
      FROM github_cache g
      LEFT JOIN apps a ON g.app_id = a.id
      ORDER BY g.last_commit_date DESC
    `).all();
    return json({ repos: repos.results });
  }

  // GET /api/deploy/uptime — latest check per app
  if (path === '/api/deploy/uptime') {
    const checks = await env.DB.prepare(`
      SELECT u.*, a.name as app_name
      FROM uptime_checks u
      JOIN apps a ON u.app_id = a.id
      WHERE u.id IN (SELECT MAX(id) FROM uptime_checks GROUP BY app_id)
      ORDER BY a.name
    `).all();
    return json({ checks: checks.results });
  }

  // GET /api/deploy/uptime/sparkline — 7-day uptime data for all apps (hourly buckets)
  if (path === '/api/deploy/uptime/sparkline') {
    const result = await env.DB.prepare(`
      SELECT app_id,
        strftime('%Y-%m-%d %H:00', checked_at) as hour,
        MIN(is_up) as is_up,
        AVG(response_ms) as avg_ms,
        COUNT(*) as checks
      FROM uptime_checks
      WHERE checked_at > datetime('now', '-7 days')
      GROUP BY app_id, hour
      ORDER BY app_id, hour
    `).all();

    // Group by app
    const byApp: Record<string, Array<{ hour: string; is_up: number; avg_ms: number }>> = {};
    result.results.forEach((r: any) => {
      if (!byApp[r.app_id]) byApp[r.app_id] = [];
      byApp[r.app_id].push({ hour: r.hour, is_up: r.is_up, avg_ms: Math.round(r.avg_ms) });
    });

    return json({ sparklines: byApp });
  }

  // GET /api/deploy/response-times — average response time per app over last 24h
  if (path === '/api/deploy/response-times') {
    const result = await env.DB.prepare(`
      SELECT a.id, a.name,
        AVG(u.response_ms) as avg_ms,
        MAX(u.response_ms) as max_ms,
        MIN(u.response_ms) as min_ms,
        COUNT(*) as checks
      FROM uptime_checks u
      JOIN apps a ON u.app_id = a.id
      WHERE u.checked_at > datetime('now', '-1 day')
      GROUP BY a.id
      ORDER BY avg_ms DESC
    `).all();
    return json({ responseTimes: result.results });
  }

  // GET /api/deploy/errors — error trend snapshots
  if (path === '/api/deploy/errors') {
    const result = await env.DB.prepare(`
      SELECT e.app_id, a.name, e.error_count, e.snapshot_at
      FROM error_snapshots e
      JOIN apps a ON e.app_id = a.id
      WHERE e.snapshot_at > datetime('now', '-7 days')
      ORDER BY e.app_id, e.snapshot_at
    `).all();

    const byApp: Record<string, Array<{ count: number; at: string }>> = {};
    result.results.forEach((r: any) => {
      if (!byApp[r.app_id]) byApp[r.app_id] = [];
      byApp[r.app_id].push({ count: r.error_count, at: r.snapshot_at });
    });

    return json({ errors: byApp });
  }

  return json({ error: 'Not found' }, 404);
}

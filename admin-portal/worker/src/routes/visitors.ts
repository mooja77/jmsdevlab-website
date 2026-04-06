/**
 * Visitors & Analytics routes — tracking status, traffic data.
 */

import { Env, json } from '../types';

export async function handleVisitorRoutes(path: string, url: URL, env: Env): Promise<Response> {
  // GET /api/visitors/tracking — tag detection status for all domains
  if (path === '/api/visitors/tracking') {
    const rows = await env.DB.prepare(`
      SELECT t.*, a.name as app_name, a.id as app_id
      FROM tracking_status t
      LEFT JOIN apps a ON t.domain = REPLACE(REPLACE(a.frontend_url, 'https://', ''), 'http://', '')
      ORDER BY t.domain
    `).all();
    return json({ tracking: rows.results });
  }

  // GET /api/visitors/analytics?days=7 — daily traffic per domain
  if (path === '/api/visitors/analytics') {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const clamped = Math.min(Math.max(days, 1), 90);

    const rows = await env.DB.prepare(`
      SELECT * FROM analytics_daily
      WHERE date >= date('now', '-' || ? || ' days')
      ORDER BY domain, date
    `).bind(clamped).all();

    // Group by domain
    const byDomain: Record<string, any[]> = {};
    for (const r of rows.results as any[]) {
      if (!byDomain[r.domain]) byDomain[r.domain] = [];
      byDomain[r.domain].push(r);
    }

    return json({ analytics: byDomain, days: clamped });
  }

  // GET /api/visitors/summary — aggregated totals
  if (path === '/api/visitors/summary') {
    const week = await env.DB.prepare(`
      SELECT
        COALESCE(SUM(pageviews), 0) as pageviews,
        COALESCE(SUM(uniques), 0) as uniques,
        COALESCE(SUM(requests), 0) as requests,
        COALESCE(SUM(bandwidth_bytes), 0) as bandwidth_bytes
      FROM analytics_daily
      WHERE date >= date('now', '-7 days')
    `).first();

    const month = await env.DB.prepare(`
      SELECT
        COALESCE(SUM(pageviews), 0) as pageviews,
        COALESCE(SUM(uniques), 0) as uniques,
        COALESCE(SUM(requests), 0) as requests,
        COALESCE(SUM(bandwidth_bytes), 0) as bandwidth_bytes
      FROM analytics_daily
      WHERE date >= date('now', '-30 days')
    `).first();

    return json({ week, month });
  }

  // POST /api/visitors/sync — manual trigger
  if (path === '/api/visitors/sync') {
    // Import dynamically to avoid circular deps in route file
    const { runVisitorsSync } = await import('../cron/visitors');
    await runVisitorsSync(env);
    return json({ status: 'synced', timestamp: new Date().toISOString() });
  }

  return json({ error: 'Not found' }, 404);
}

/**
 * Visitors & Analytics routes — tracking status, traffic data.
 */

import { Env, json } from '../types';
import { classifyReferrer } from '../lib/referrers';

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

  // GET /api/visitors/sources — referrer/channel breakdown
  if (path === '/api/visitors/sources') {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const domain = url.searchParams.get('domain') || 'all';
    const domainClause = domain === 'all' ? '' : 'AND domain = ?';
    const binds: any[] = [Math.min(days, 90)];
    if (domain !== 'all') binds.push(domain);

    const rows = await env.DB.prepare(`
      SELECT dim_value, SUM(visits) as visits, SUM(page_views) as pv, SUM(requests) as reqs
      FROM analytics_dimensions
      WHERE dimension = 'referrer' AND date >= date('now', '-' || ? || ' days') ${domainClause}
      GROUP BY dim_value ORDER BY visits DESC LIMIT 50
    `).bind(...binds).all();

    // Classify into channels
    const channels: Record<string, { visits: number; pv: number; reqs: number; referrers: any[] }> = {};
    for (const r of rows.results as any[]) {
      const ch = classifyReferrer(r.dim_value);
      if (!channels[ch]) channels[ch] = { visits: 0, pv: 0, reqs: 0, referrers: [] };
      channels[ch].visits += r.visits;
      channels[ch].pv += r.pv;
      channels[ch].reqs += r.reqs;
      channels[ch].referrers.push({ host: r.dim_value || '(direct)', visits: r.visits, pv: r.pv });
    }

    return json({ channels, referrers: rows.results });
  }

  // GET /api/visitors/pages — top pages
  if (path === '/api/visitors/pages') {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const domain = url.searchParams.get('domain') || 'all';
    const domainClause = domain === 'all' ? '' : 'AND domain = ?';
    const binds: any[] = [Math.min(days, 90)];
    if (domain !== 'all') binds.push(domain);

    const rows = await env.DB.prepare(`
      SELECT dim_value as path, domain, SUM(requests) as reqs, SUM(bytes) as bytes
      FROM analytics_dimensions
      WHERE dimension = 'path' AND date >= date('now', '-' || ? || ' days') ${domainClause}
      GROUP BY dim_value, domain ORDER BY reqs DESC LIMIT 50
    `).bind(...binds).all();

    return json({ pages: rows.results });
  }

  // GET /api/visitors/geo — country breakdown
  if (path === '/api/visitors/geo') {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const domain = url.searchParams.get('domain') || 'all';
    const domainClause = domain === 'all' ? '' : 'AND domain = ?';
    const binds: any[] = [Math.min(days, 90)];
    if (domain !== 'all') binds.push(domain);

    const rows = await env.DB.prepare(`
      SELECT dim_value as country, SUM(requests) as reqs, SUM(bytes) as bytes
      FROM analytics_dimensions
      WHERE dimension = 'country' AND date >= date('now', '-' || ? || ' days') ${domainClause}
      GROUP BY dim_value ORDER BY reqs DESC
    `).bind(...binds).all();

    return json({ countries: rows.results });
  }

  // GET /api/visitors/tech — device + browser breakdown
  if (path === '/api/visitors/tech') {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const domain = url.searchParams.get('domain') || 'all';
    const domainClause = domain === 'all' ? '' : 'AND domain = ?';
    const binds: any[] = [Math.min(days, 90)];
    if (domain !== 'all') binds.push(domain);

    const devices = await env.DB.prepare(`
      SELECT dim_value as device, SUM(requests) as reqs
      FROM analytics_dimensions
      WHERE dimension = 'device' AND date >= date('now', '-' || ? || ' days') ${domainClause}
      GROUP BY dim_value ORDER BY reqs DESC
    `).bind(...binds).all();

    const browsers = await env.DB.prepare(`
      SELECT dim_value as browser, SUM(requests) as reqs
      FROM analytics_dimensions
      WHERE dimension = 'browser' AND date >= date('now', '-' || ? || ' days') ${domainClause}
      GROUP BY dim_value ORDER BY reqs DESC
    `).bind(...binds).all();

    return json({ devices: devices.results, browsers: browsers.results });
  }

  // GET /api/visitors/errors — HTTP error breakdown
  if (path === '/api/visitors/errors') {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const domain = url.searchParams.get('domain') || 'all';
    const domainClause = domain === 'all' ? '' : 'AND domain = ?';
    const binds: any[] = [Math.min(days, 90)];
    if (domain !== 'all') binds.push(domain);

    const all = await env.DB.prepare(`
      SELECT dim_value as status_code, domain, SUM(requests) as reqs
      FROM analytics_dimensions
      WHERE dimension = 'status' AND date >= date('now', '-' || ? || ' days') ${domainClause}
      GROUP BY dim_value, domain ORDER BY reqs DESC
    `).bind(...binds).all();

    // Separate into categories
    const errors = (all.results as any[]).filter(r => parseInt(r.status_code) >= 400);
    const totalReqs = await env.DB.prepare(`
      SELECT COALESCE(SUM(requests), 0) as total
      FROM analytics_daily
      WHERE date >= date('now', '-' || ? || ' days') ${domainClause.replace('domain', 'domain')}
    `).bind(...binds).first<{ total: number }>();

    const errorReqs = errors.reduce((s, e) => s + e.reqs, 0);

    return json({
      errors,
      totalRequests: totalReqs?.total || 0,
      errorRate: totalReqs?.total ? ((errorReqs / totalReqs.total) * 100).toFixed(2) : '0',
    });
  }

  // GET /api/visitors/trends — hourly patterns + daily trend
  if (path === '/api/visitors/trends') {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const domain = url.searchParams.get('domain') || 'all';
    const domainClause = domain === 'all' ? '' : 'AND domain = ?';
    const binds: any[] = [Math.min(days, 14)];
    if (domain !== 'all') binds.push(domain);

    const hourly = await env.DB.prepare(`
      SELECT hour, AVG(requests) as avg_reqs, AVG(page_views) as avg_pv, AVG(visits) as avg_visits
      FROM analytics_hourly
      WHERE date >= date('now', '-' || ? || ' days') ${domainClause}
      GROUP BY hour ORDER BY hour
    `).bind(...binds).all();

    const dailyBinds: any[] = [Math.min(days, 90)];
    if (domain !== 'all') dailyBinds.push(domain);

    const daily = await env.DB.prepare(`
      SELECT date, SUM(pageviews) as pv, SUM(uniques) as uniques, SUM(requests) as reqs
      FROM analytics_daily
      WHERE date >= date('now', '-' || ? || ' days') ${domainClause.replace('domain', 'domain')}
      GROUP BY date ORDER BY date
    `).bind(...dailyBinds).all();

    return json({ hourly: hourly.results, daily: daily.results });
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

/**
 * App routes — list apps, get app details, proxy to individual admin endpoints.
 *
 * RULES:
 * - App list shows health status ONLY. No user counts or MRR.
 * - App detail shows health + uptime. No user counts or MRR from cache.
 * - Proxy endpoints add "app-reported, may include test data" warning.
 * - NEVER cache user/MRR from proxy responses.
 */

import { Env, json } from '../types';
import { getAllApps, getApp, fetchAppEndpoint } from '../lib/d1';
import { extractData } from '../lib/normalize';

export async function handleAppsRoutes(path: string, url: URL, env: Env): Promise<Response> {
  // GET /api/apps — list all apps with health only
  if (path === '/api/apps') {
    const apps = await getAllApps(env);
    const health = await env.DB.prepare('SELECT * FROM health_cache').all();
    const healthMap = new Map(health.results.map((h: any) => [h.app_id, h]));

    const enriched = apps.map(app => ({
      ...app,
      health: healthMap.get(app.id) || null,
      // NO metrics. NO billing. These are unreliable from cache.
    }));

    return json({ apps: enriched });
  }

  // Parse /api/apps/:id or /api/apps/:id/:endpoint
  const match = path.match(/^\/api\/apps\/([^/]+)(\/(.+))?$/);
  if (!match) return json({ error: 'Not found' }, 404);

  const appId = match[1];
  const endpoint = match[3];

  const app = await getApp(env, appId);
  if (!app) return json({ error: 'App not found' }, 404);

  // GET /api/apps/:id — app details with health and uptime only
  if (!endpoint) {
    const health = await env.DB.prepare('SELECT * FROM health_cache WHERE app_id = ?').bind(appId).first();
    const recentUptime = await env.DB.prepare(
      'SELECT * FROM uptime_checks WHERE app_id = ? ORDER BY checked_at DESC LIMIT 10'
    ).bind(appId).all();

    return json({
      app,
      health,
      recentUptime: recentUptime.results,
      // NO metrics. NO billing.
    });
  }

  // GET /api/apps/:id/:endpoint — proxy to app's admin endpoint
  const validEndpoints = ['dashboard', 'health', 'users', 'billing', 'activity', 'features'];
  if (!validEndpoints.includes(endpoint)) {
    return json({ error: 'Invalid endpoint' }, 400);
  }

  const liveData = await fetchAppEndpoint(env, app, endpoint);
  if (liveData) {
    const data = extractData(liveData);

    // Cache health only (real infrastructure data)
    if (endpoint === 'health') {
      const status = data.dbConnected ? 'healthy' : 'degraded';
      await env.DB.prepare(
        'INSERT OR REPLACE INTO health_cache (app_id, status, db_connected, db_response_ms, memory_mb, version, raw_json, checked_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))'
      ).bind(appId, String(data.status || status), data.dbConnected ? 1 : 0, Number(data.dbResponseMs || 0), Number(data.memoryUsageMb || 0), String(data.version || ''), JSON.stringify(data)).run();
    }

    // DO NOT cache dashboard or billing — they contain test data

    return json({
      source: 'live',
      data,
      warning: (endpoint === 'dashboard' || endpoint === 'billing')
        ? 'App-reported data. May include test accounts. Use /api/customers for verified user counts and /api/aggregate/revenue for verified revenue.'
        : undefined,
    });
  }

  // For health, fall back to cache (health data is real)
  if (endpoint === 'health') {
    const cached = await env.DB.prepare('SELECT * FROM health_cache WHERE app_id = ?').bind(appId).first();
    if (cached) return json({ source: 'cache', data: cached });
  }

  return json({ error: 'No data available — app endpoint unreachable', appHasAdmin: app.has_admin }, 503);
}

/**
 * Aggregate routes — health, uptime, activity.
 *
 * RULES:
 * - User counts: NEVER from cache. Always 0 here (briefing provides real count).
 * - Revenue: Stripe ONLY. Never from billing_cache.
 * - Health/uptime/errors: real infrastructure data, always shown.
 */

import { Env, json } from '../types';

export async function handleAggregateRoutes(path: string, env: Env): Promise<Response> {
  // GET /api/aggregate/dashboard — health + errors only, no user counts or MRR
  if (path === '/api/aggregate/dashboard') {
    const apps = await env.DB.prepare('SELECT * FROM apps ORDER BY name').all();
    const health = await env.DB.prepare('SELECT * FROM health_cache').all();
    const healthMap = new Map(health.results.map((h: any) => [h.app_id, h]));

    let totalErrors = 0;
    let healthyCount = 0, degradedCount = 0, downCount = 0, unknownCount = 0;

    const perApp = apps.results.map((app: any) => {
      const h = healthMap.get(app.id) as any;

      if (h) {
        if (h.status === 'healthy') healthyCount++;
        else if (h.status === 'degraded') degradedCount++;
        else if (h.status === 'down') downCount++;
        else unknownCount++;
      } else {
        unknownCount++;
      }

      return {
        id: app.id,
        name: app.name,
        status: app.status,
        health: h?.status || 'unknown',
        lastChecked: h?.checked_at || null,
        // NO user counts. NO MRR. These are unreliable from cache.
      };
    });

    return json({
      summary: {
        totalApps: apps.results.length,
        totalErrors,
        healthy: healthyCount,
        degraded: degradedCount,
        down: downCount,
        unknown: unknownCount,
      },
      apps: perApp,
      generatedAt: new Date().toISOString(),
    });
  }

  // GET /api/aggregate/health
  if (path === '/api/aggregate/health') {
    const results = await env.DB.prepare(`
      SELECT a.id, a.name, a.frontend_url, a.has_admin, a.hosting,
             h.status, h.db_connected, h.db_response_ms, h.memory_mb, h.version, h.checked_at
      FROM apps a
      LEFT JOIN health_cache h ON a.id = h.app_id
      ORDER BY a.name
    `).all();
    return json({ apps: results.results, checkedAt: new Date().toISOString() });
  }

  // GET /api/aggregate/revenue — Stripe ONLY
  if (path === '/api/aggregate/revenue') {
    let totalMrr = 0, totalArr = 0, totalPaying = 0, totalTrials = 0;
    const stripeKey = (env as any).STRIPE_API_KEY;

    if (stripeKey) {
      try {
        const [activeRes, trialRes] = await Promise.all([
          fetch('https://api.stripe.com/v1/subscriptions?status=active&limit=100', {
            headers: { 'Authorization': `Bearer ${stripeKey}` },
            signal: AbortSignal.timeout(5000),
          }),
          fetch('https://api.stripe.com/v1/subscriptions?status=trialing&limit=100', {
            headers: { 'Authorization': `Bearer ${stripeKey}` },
            signal: AbortSignal.timeout(5000),
          }),
        ]);

        const [activeSubs, trialSubs] = await Promise.all([
          activeRes.json() as Promise<any>,
          trialRes.json() as Promise<any>,
        ]);

        if (activeSubs.data) {
          totalPaying = activeSubs.data.length;
          activeSubs.data.forEach((sub: any) => {
            const amount = sub.items?.data?.[0]?.price?.unit_amount || 0;
            const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
            if (interval === 'month') { totalMrr += amount / 100; totalArr += (amount / 100) * 12; }
            else if (interval === 'year') { totalArr += amount / 100; totalMrr += amount / 1200; }
          });
        }
        if (trialSubs.data) totalTrials = trialSubs.data.length;
      } catch { /* Stripe unavailable — all zeros */ }
    }

    return json({
      summary: { totalMrr, totalArr, totalPaying, totalTrials },
      source: 'stripe',
    });
  }

  // GET /api/aggregate/uptime
  if (path === '/api/aggregate/uptime') {
    const latest = await env.DB.prepare(`
      SELECT u.*, a.name FROM uptime_checks u
      JOIN apps a ON u.app_id = a.id
      WHERE u.id IN (SELECT MAX(id) FROM uptime_checks GROUP BY app_id)
      ORDER BY a.name
    `).all();
    return json({ checks: latest.results });
  }

  // GET /api/aggregate/activity
  if (path === '/api/aggregate/activity') {
    const activity = await env.DB.prepare(
      'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 50'
    ).all();
    return json({ activity: activity.results });
  }

  return json({ error: 'Not found' }, 404);
}

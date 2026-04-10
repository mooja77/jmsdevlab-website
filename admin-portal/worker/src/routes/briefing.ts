/**
 * Morning Briefing — the "open at 9am" endpoint.
 *
 * RULES:
 * - User counts come from live-filtered fetch ONLY. No cache fallback.
 * - MRR comes from Stripe ONLY. No cache fallback.
 * - If data is unavailable, show 0 — never show fake data.
 */

import { Env, json } from '../types';
import { getAllApps, fetchUsersFromApp } from '../lib/d1';

export async function handleBriefingRoutes(path: string, env: Env): Promise<Response> {
  if (path !== '/api/briefing') return json({ error: 'Not found' }, 404);

  const now = new Date();
  const hour = now.getUTCHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Health summary (real infrastructure data)
  const healthResult = await env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'healthy' THEN 1 ELSE 0 END) as healthy,
      SUM(CASE WHEN status = 'down' THEN 1 ELSE 0 END) as down,
      SUM(CASE WHEN status = 'degraded' THEN 1 ELSE 0 END) as degraded
    FROM health_cache
  `).first<{ total: number; healthy: number; down: number; degraded: number }>();

  // REAL user count — live fetch, filtered, NO FALLBACK
  const apps = await getAllApps(env);
  let realUserCount = 0;
  const failedApps: string[] = [];
  try {
    const fetches = apps.filter(a => a.has_admin && a.api_base_url).map(async app => {
      const result = await fetchUsersFromApp(env, app);
      if (result.error) { failedApps.push(app.name); return 0; }
      return result.realCount;
    });
    const counts = await Promise.allSettled(fetches);
    realUserCount = counts.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0), 0);
  } catch { /* 0 if all fetches fail */ }

  // REAL MRR — Stripe ONLY, NO FALLBACK
  let realMrr = 0;
  if (env.STRIPE_API_KEY) {
    try {
      const subRes = await fetch('https://api.stripe.com/v1/subscriptions?status=active&limit=100', {
        headers: { 'Authorization': `Bearer ${env.STRIPE_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      });
      const subs = await subRes.json() as any;
      if (subs.data) {
        realMrr = subs.data.reduce((sum: number, sub: any) => {
          const amount = sub.items?.data?.[0]?.price?.unit_amount || 0;
          const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
          return sum + (interval === 'month' ? amount / 100 : interval === 'year' ? amount / 1200 : 0);
        }, 0);
      }
    } catch { /* 0 if Stripe unavailable */ }
  }

  // Attention items
  const attentionItems: Array<{ type: string; severity: string; title: string; detail: string }> = [];

  if (healthResult && healthResult.down > 0) {
    const downApps = await env.DB.prepare(
      'SELECT a.name FROM health_cache h JOIN apps a ON h.app_id = a.id WHERE h.status = \'down\''
    ).all();
    attentionItems.push({
      type: 'health', severity: 'critical',
      title: `${healthResult.down} app${healthResult.down > 1 ? 's' : ''} down`,
      detail: downApps.results.map((a: any) => a.name).join(', '),
    });
  }

  const downSites = await env.DB.prepare(`
    SELECT a.name, u.status_code FROM uptime_checks u
    JOIN apps a ON u.app_id = a.id
    WHERE u.id IN (SELECT MAX(id) FROM uptime_checks GROUP BY app_id) AND u.is_up = 0
  `).all();
  if (downSites.results.length > 0) {
    attentionItems.push({
      type: 'uptime', severity: 'critical',
      title: `${downSites.results.length} site${downSites.results.length > 1 ? 's' : ''} unreachable`,
      detail: downSites.results.map((s: any) => `${s.name} (HTTP ${s.status_code})`).join(', '),
    });
  }

  const staleLeads = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM leads WHERE status = \'new\' AND created_at < datetime(\'now\', \'-1 day\')'
  ).first<{ count: number }>();
  if (staleLeads && staleLeads.count > 0) {
    attentionItems.push({
      type: 'leads', severity: 'warning',
      title: `${staleLeads.count} lead${staleLeads.count > 1 ? 's' : ''} unanswered >24h`,
      detail: 'Check the Leads page to follow up',
    });
  }

  const newLeads = await env.DB.prepare('SELECT COUNT(*) as count FROM leads WHERE status = \'new\'').first<{ count: number }>();

  const recentActivity = await env.DB.prepare(
    'SELECT * FROM activity_log WHERE created_at > datetime(\'now\', \'-1 day\') ORDER BY created_at DESC LIMIT 20'
  ).all();

  const achievedMilestones = await env.DB.prepare(
    'SELECT * FROM milestones WHERE achieved_at IS NOT NULL ORDER BY achieved_at DESC LIMIT 5'
  ).all();
  const nextMilestones = await env.DB.prepare(
    'SELECT * FROM milestones WHERE achieved_at IS NULL ORDER BY threshold ASC LIMIT 3'
  ).all();

  const activeProjects = await env.DB.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM project_milestones WHERE project_id = p.id) as total_milestones,
      (SELECT COUNT(*) FROM project_milestones WHERE project_id = p.id AND completed_at IS NOT NULL) as completed_milestones
    FROM projects p WHERE status IN ('active', 'proposal') ORDER BY value DESC
  `).all();

  // Status line
  const parts: string[] = [];
  if (healthResult) {
    if (healthResult.down === 0) parts.push('All apps healthy');
    else parts.push(`${healthResult.down} app${healthResult.down > 1 ? 's' : ''} down`);
  }
  if (newLeads && newLeads.count > 0) parts.push(`${newLeads.count} new lead${newLeads.count > 1 ? 's' : ''}`);
  if (realMrr > 0) parts.push(`$${realMrr.toFixed(0)} MRR`);
  parts.push(`${realUserCount} real user${realUserCount !== 1 ? 's' : ''}`);

  // Data freshness
  const healthAge = await env.DB.prepare('SELECT MAX(checked_at) as latest FROM health_cache').first<{ latest: string }>();
  const uptimeAge = await env.DB.prepare('SELECT MAX(checked_at) as latest FROM uptime_checks').first<{ latest: string }>();
  const githubAge = await env.DB.prepare('SELECT MAX(fetched_at) as latest FROM github_cache').first<{ latest: string }>();

  return json({
    greeting: `${greeting}, John`,
    date: now.toISOString(),
    statusLine: parts.join('. ') + '.',
    summary: {
      totalUsers: realUserCount,
      totalMrr: realMrr,
      healthyApps: healthResult?.healthy || 0,
      totalApps: apps.length,
      newLeads: newLeads?.count || 0,
      pipelineValue: activeProjects.results.reduce((sum: number, p: any) => sum + (p.value || 0), 0),
    },
    attentionItems,
    _warnings: failedApps.length > 0 ? [`User count may be incomplete — failed to reach: ${failedApps.join(', ')}`] : [],
    recentActivity: recentActivity.results,
    milestones: { achieved: achievedMilestones.results, next: nextMilestones.results },
    activeProjects: activeProjects.results,
    _meta: {
      userCountSource: 'live-filtered',
      mrrSource: 'stripe-api',
      healthSource: 'cached',
      healthCheckedAt: healthAge?.latest || null,
      uptimeCheckedAt: uptimeAge?.latest || null,
      githubSyncedAt: githubAge?.latest || null,
      generatedAt: now.toISOString(),
    },
  });
}

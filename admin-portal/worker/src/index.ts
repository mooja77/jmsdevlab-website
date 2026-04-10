/**
 * JMS Dev Lab Master Admin Portal — Cloudflare Worker
 *
 * Business command center: app monitoring, leads, revenue,
 * projects, Gmail, Stripe, GitHub integration.
 */

import { Env, json, CORS_HEADERS } from './types';
import { handleAuth, verifySession } from './auth';
import { handleAppsRoutes } from './routes/apps';
import { handleAggregateRoutes } from './routes/aggregate';
import { handleDeployRoutes } from './routes/deploy';
import { handleBriefingRoutes } from './routes/briefing';
import { handleLeadRoutes } from './routes/leads';
import { handleProjectRoutes } from './routes/projects';
import { handleCustomerRoutes } from './routes/customers';
import { handleCostRoutes } from './routes/costs';
import { handleMatrixRoutes } from './routes/matrices';
import { handleBarkRoutes } from './routes/bark';
import { handleVisitorRoutes } from './routes/visitors';
import { handleUsageRoutes } from './routes/usage';
import { runHealthChecks } from './cron/health';
import { runDashboardSync } from './cron/dashboard';
import { runUptimeChecks } from './cron/uptime';
import { runGitHubSync } from './cron/github';
import { runVisitorsSync } from './cron/visitors';
import { runBarkScan } from './cron/bark';
import { getAllApps } from './lib/d1';
import { isTestEmail } from './lib/filter';
import { handleStripeWebhook } from './routes/stripe-webhook';
import { handleErrorRoutes } from './routes/errors';
import { handleEventIngest } from './routes/ingest';
import { runCustomerHealthScores } from './cron/customer-health';
import { runConversionSync } from './cron/conversions';
import { runSnapshotSync } from './cron/snapshots';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // Public: health check
      if (path === '/api/health') {
        return json({ status: 'ok', portal: env.PORTAL_NAME, timestamp: new Date().toISOString() });
      }

      // Stripe webhooks (before auth — uses signature verification)
      if (path === '/api/webhooks/stripe') {
        return handleStripeWebhook(request, env);
      }

      // Error reporting (before auth — apps use their own admin key)
      if (path === '/api/errors/report' && request.method === 'POST') {
        return handleErrorRoutes(path, request, url, env);
      }

      // Event ingest (before auth — apps use their own admin key)
      if (path === '/api/events/ingest' && request.method === 'POST') {
        return handleEventIngest(request, env);
      }

      // Auth routes
      if (path.startsWith('/api/auth/')) {
        return handleAuth(path, request, env);
      }

      // All other routes require authentication
      const session = await verifySession(request, env);
      if (!session) {
        return json({ error: 'Unauthorized' }, 401);
      }

      // Morning briefing
      if (path === '/api/briefing') {
        return handleBriefingRoutes(path, env);
      }

      // App routes
      if (path.startsWith('/api/apps')) {
        return handleAppsRoutes(path, url, env);
      }

      // Aggregate routes
      if (path.startsWith('/api/aggregate')) {
        return handleAggregateRoutes(path, env);
      }

      // Lead pipeline
      if (path.startsWith('/api/leads')) {
        return handleLeadRoutes(path, request, env);
      }

      // Bark lead finder
      if (path.startsWith('/api/bark')) {
        return handleBarkRoutes(path, request, env);
      }

      // Project tracker
      if (path.startsWith('/api/projects')) {
        return handleProjectRoutes(path, request, env);
      }

      // Customers + Stripe
      if (path.startsWith('/api/customers')) {
        return handleCustomerRoutes(path, url, env);
      }

      // Business costs (CRUD)
      if (path.startsWith('/api/costs')) {
        return handleCostRoutes(path, request, env);
      }

      // Usage analytics
      if (path.startsWith('/api/usage')) {
        return handleUsageRoutes(path, url, env);
      }

      // Visitors & Analytics
      if (path.startsWith('/api/visitors')) {
        return handleVisitorRoutes(path, url, env);
      }

      // Error monitoring
      if (path.startsWith('/api/errors')) {
        return handleErrorRoutes(path, request, url, env);
      }

      // Deploy/infrastructure
      if (path.startsWith('/api/deploy')) {
        return handleDeployRoutes(path, env);
      }

      // Cache management
      if (path === '/api/cache/refresh' && request.method === 'POST') {
        await Promise.all([
          runHealthChecks(env),
          runDashboardSync(env),
          runUptimeChecks(env),
          runCustomerHealthScores(env),
          runConversionSync(env),
          runSnapshotSync(env),
        ]);
        return json({ status: 'refreshed', timestamp: new Date().toISOString() });
      }

      if (path === '/api/cache/status') {
        const health = await env.DB.prepare('SELECT MIN(checked_at) as oldest, MAX(checked_at) as newest FROM health_cache').first();
        const dashboard = await env.DB.prepare('SELECT MIN(fetched_at) as oldest, MAX(fetched_at) as newest FROM dashboard_cache').first();
        return json({ health, dashboard });
      }

      // Debug: user count trace — shows exactly what each app returns
      if (path === '/api/debug/users') {
        const apps = await getAllApps(env);
        const trace: any[] = [];

        for (const app of apps) {
          const entry: any = { app: app.name, id: app.id, hasAdmin: app.has_admin, apiUrl: app.api_base_url };

          if (!app.has_admin || !app.api_base_url) {
            entry.skipped = 'no admin or no api_base_url';
            trace.push(entry);
            continue;
          }

          const keyName = app.admin_key_name;
          const key = keyName ? (env as unknown as Record<string, string>)[keyName] : undefined;
          entry.keyName = keyName;
          entry.hasKey = !!key;

          if (!key) {
            entry.skipped = 'admin key not found: ' + keyName;
            trace.push(entry);
            continue;
          }

          try {
            const url = `${app.api_base_url}/api/admin/users`;
            const res = await fetch(url, {
              headers: { 'x-admin-key': key },
              signal: AbortSignal.timeout(15000),
            });
            entry.httpStatus = res.status;

            if (!res.ok) {
              entry.error = `HTTP ${res.status}`;
              trace.push(entry);
              continue;
            }

            const raw = await res.json() as any;
            const extracted = raw?.data || raw;
            let users: any[];
            if (Array.isArray(extracted)) {
              // RepairDesk pattern: { data: [...shops] } — raw.data is the array itself
              users = extracted;
            } else {
              users = (extracted.users || extracted.shops || extracted.stores || []) as any[];
              if ((!users || !users.length) && Array.isArray(extracted.data)) users = extracted.data;
            }
            entry.totalReturned = Array.isArray(users) ? users.length : 'not array';

            if (Array.isArray(users)) {
              const real: string[] = [];
              const test: string[] = [];
              for (const u of users) {
                const email = String(u.email || u.ownerEmail || u.domain || '');
                if (isTestEmail(email)) {
                  test.push(email);
                } else {
                  real.push(email);
                }
              }
              entry.realUsers = real;
              entry.realCount = real.length;
              entry.testUsers = test;
              entry.testCount = test.length;
            }
          } catch (err) {
            entry.error = String(err);
          }

          trace.push(entry);
        }

        const totalReal = trace.reduce((sum, t) => sum + (t.realCount || 0), 0);
        return json({ totalRealUsers: totalReal, trace });
      }

      // Deployment history
      if (path === '/api/deploy/history') {
        const days = parseInt(url.searchParams.get('days') || '30');
        const deploys = await env.DB.prepare(
          `SELECT d.*, a.name as app_name FROM deployments d
           LEFT JOIN apps a ON d.app_id = a.id
           WHERE d.created_at > datetime('now', '-' || ? || ' days')
           ORDER BY d.created_at DESC LIMIT 100`
        ).bind(days).all();
        const summary = await env.DB.prepare(`
          SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
            SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failures,
            COUNT(DISTINCT app_id) as apps_deployed
          FROM deployments WHERE created_at > datetime('now', '-' || ? || ' days')
        `).bind(days).first();
        return json({ deployments: deploys.results, summary });
      }

      // Funnel tracking (enhanced with unified_users + analytics)
      if (path === '/api/funnel') {
        // Stage counts from unified_users (real users only)
        const stageCounts = await env.DB.prepare(
          `SELECT current_stage, COUNT(*) as c FROM unified_users WHERE is_test = 0 GROUP BY current_stage`
        ).all<{ current_stage: string; c: number }>();
        const counts: Record<string, number> = { lead: 0, signup: 0, trial: 0, paid: 0, churned: 0 };
        for (const row of stageCounts.results) counts[row.current_stage] = row.c;

        // Visitors from analytics (last 30 days)
        const visitorRow = await env.DB.prepare(
          `SELECT COALESCE(SUM(uniques), 0) as v FROM analytics_daily WHERE date >= date('now', '-30 days')`
        ).first<{ v: number }>();
        const visitors = visitorRow?.v || 0;

        // Leads from bark
        const barkLeads = await env.DB.prepare(`SELECT COUNT(*) as c FROM bark_leads WHERE status != 'dismissed'`).first<{ c: number }>();
        counts.lead = Math.max(counts.lead, barkLeads?.c || 0);

        // Also count from funnel_events for historical accuracy
        const funnelCounts = await env.DB.prepare(
          `SELECT stage, COUNT(DISTINCT email) as c FROM funnel_events GROUP BY stage`
        ).all<{ stage: string; c: number }>();
        for (const row of funnelCounts.results) {
          counts[row.stage] = Math.max(counts[row.stage] || 0, row.c);
        }

        const conversions = {
          visitorToSignup: visitors > 0 ? ((counts.signup / visitors) * 100).toFixed(1) + '%' : '0%',
          leadToSignup: counts.lead > 0 ? ((counts.signup / counts.lead) * 100).toFixed(1) + '%' : '0%',
          signupToTrial: counts.signup > 0 ? ((counts.trial / counts.signup) * 100).toFixed(1) + '%' : '0%',
          trialToPaid: counts.trial > 0 ? ((counts.paid / counts.trial) * 100).toFixed(1) + '%' : '0%',
        };

        // Trend (last 30 days)
        const trend = await env.DB.prepare(
          `SELECT date, visitors, signups, trials, paid, churned FROM conversion_daily
           WHERE app_id IS NULL AND date >= date('now', '-30 days') ORDER BY date`
        ).all();

        // By app
        const byApp = await env.DB.prepare(
          `SELECT apps_json, current_stage, COUNT(*) as c FROM unified_users WHERE is_test = 0 GROUP BY apps_json, current_stage`
        ).all<{ apps_json: string; current_stage: string; c: number }>();
        const appMap: Record<string, Record<string, number>> = {};
        for (const row of byApp.results) {
          try {
            const appIds = JSON.parse(row.apps_json || '[]') as string[];
            for (const appId of appIds) {
              if (!appMap[appId]) appMap[appId] = {};
              appMap[appId][row.current_stage] = (appMap[appId][row.current_stage] || 0) + row.c;
            }
          } catch {}
        }
        const byAppList = Object.entries(appMap).map(([appId, stages]) => ({
          appId, signups: stages.signup || 0, trials: stages.trial || 0, paid: stages.paid || 0,
        }));

        // By source (UTM attribution)
        const bySource = await env.DB.prepare(
          `SELECT utm_source, utm_medium, COUNT(*) as signups,
           SUM(CASE WHEN converted_to_paid = 1 THEN 1 ELSE 0 END) as paid,
           SUM(revenue_cents) as revenue_cents
           FROM utm_attributions GROUP BY utm_source, utm_medium ORDER BY signups DESC LIMIT 20`
        ).all();

        return json({
          stages: { visitor: visitors, ...counts },
          conversions,
          trend: trend.results,
          byApp: byAppList,
          bySource: bySource.results,
        });
      }

      // Funnel daily trend
      if (path === '/api/funnel/daily') {
        const days = parseInt(url.searchParams.get('days') || '30', 10);
        const rows = await env.DB.prepare(
          `SELECT * FROM conversion_daily WHERE app_id IS NULL AND date >= date('now', '-' || ? || ' days') ORDER BY date`
        ).bind(Math.min(days, 90)).all();
        return json({ trend: rows.results });
      }

      // UTM attribution breakdown
      if (path === '/api/funnel/attribution') {
        const rows = await env.DB.prepare(
          `SELECT utm_source, utm_medium, utm_campaign, COUNT(*) as signups,
           SUM(CASE WHEN converted_to_paid = 1 THEN 1 ELSE 0 END) as paid,
           SUM(revenue_cents) as revenue_cents
           FROM utm_attributions GROUP BY utm_source, utm_medium, utm_campaign ORDER BY signups DESC`
        ).all();
        return json({ attributions: rows.results });
      }

      // User journeys
      if (path === '/api/journeys/popular') {
        const result = await env.DB.prepare(`
          SELECT app_id, page, COUNT(*) as views, COUNT(DISTINCT user_email) as unique_users
          FROM user_journeys WHERE created_at > datetime('now', '-30 days')
          GROUP BY app_id, page ORDER BY views DESC LIMIT 50
        `).all();
        return json({ pages: result.results });
      }

      // Customer health scores
      if (path === '/api/health-scores') {
        const scores = await env.DB.prepare(
          'SELECT * FROM customer_health ORDER BY score DESC'
        ).all();
        const summary = {
          champions: scores.results.filter((s: any) => s.label === 'champion').length,
          healthy: scores.results.filter((s: any) => s.label === 'healthy').length,
          atRisk: scores.results.filter((s: any) => s.label === 'at_risk').length,
          churning: scores.results.filter((s: any) => s.label === 'churning').length,
          new: scores.results.filter((s: any) => s.label === 'new').length,
        };
        return json({ scores: scores.results, summary });
      }

      // Revenue events
      if (path === '/api/revenue/events') {
        const events = await env.DB.prepare(
          'SELECT * FROM revenue_events ORDER BY created_at DESC LIMIT 100'
        ).all();
        return json({ events: events.results });
      }

      // Feature matrices
      if (path === '/api/matrices') {
        return handleMatrixRoutes(path, env);
      }

      // Milestones
      if (path === '/api/milestones') {
        const milestones = await env.DB.prepare('SELECT * FROM milestones ORDER BY achieved_at IS NULL, threshold ASC').all();
        return json({ milestones: milestones.results });
      }

      return json({ error: 'Not found' }, 404);
    } catch (error) {
      console.error('Worker error:', error);
      return json({ error: 'Internal server error', message: String(error) }, 500);
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const minute = new Date(event.scheduledTime).getMinutes();

    if (minute % 5 === 0) {
      ctx.waitUntil(runHealthChecks(env));
    }
    if (minute % 15 === 0) {
      ctx.waitUntil(runDashboardSync(env));
      ctx.waitUntil(runSnapshotSync(env));
    }
    if (minute % 10 === 0) {
      ctx.waitUntil(runUptimeChecks(env));
    }
    // Customer health scores — daily (run at midnight UTC)
    const hour = new Date(event.scheduledTime).getUTCHours();
    if (hour === 0 && minute === 0) {
      ctx.waitUntil(runCustomerHealthScores(env));
    }

    if (minute % 30 === 0) {
      ctx.waitUntil(runGitHubSync(env));
      ctx.waitUntil(runVisitorsSync(env));
      ctx.waitUntil(runBarkScan(env)); // daily check inside the function
      ctx.waitUntil(runConversionSync(env));
    }
  },
};

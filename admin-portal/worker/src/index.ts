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
    }
    if (minute % 10 === 0) {
      ctx.waitUntil(runUptimeChecks(env));
    }
    if (minute % 30 === 0) {
      ctx.waitUntil(runGitHubSync(env));
      ctx.waitUntil(runVisitorsSync(env));
      ctx.waitUntil(runBarkScan(env)); // daily check inside the function
    }
  },
};

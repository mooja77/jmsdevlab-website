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
import { runHealthChecks } from './cron/health';
import { runDashboardSync } from './cron/dashboard';
import { runUptimeChecks } from './cron/uptime';
import { runGitHubSync } from './cron/github';

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

      // Business costs
      if (path === '/api/costs') {
        return handleCostRoutes(path, env);
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
    }
  },
};

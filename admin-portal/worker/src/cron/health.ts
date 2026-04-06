/**
 * Cron: Health check poller — fetches /api/admin/health from all apps.
 */

import { Env } from '../types';
import { getAllApps, fetchAppEndpoint } from '../lib/d1';
import { extractData } from '../lib/normalize';

export async function runHealthChecks(env: Env): Promise<void> {
  const apps = await getAllApps(env);

  const checks = apps
    .filter(app => app.has_admin && app.api_base_url)
    .map(async app => {
      const raw = await fetchAppEndpoint(env, app, 'health');
      if (!raw) {
        await env.DB.prepare(
          'INSERT OR REPLACE INTO health_cache (app_id, status, checked_at) VALUES (?, ?, datetime("now"))'
        ).bind(app.id, 'down').run();

        await env.DB.prepare(
          'INSERT INTO activity_log (source, event_type, summary) VALUES (?, ?, ?)'
        ).bind(app.id, 'health_check_failed', `${app.name} health check failed`).run();
        return;
      }

      const data = extractData(raw);

      // Normalize DB connected — handle multiple field names
      const dbConnected = data.dbConnected ?? data.db_connected ?? null;

      // Normalize status
      const status = data.status || (dbConnected ? 'healthy' : 'degraded');

      // Normalize memory — handle object {rss, heapUsed} or number or various field names
      let memoryMb = 0;
      const memRaw = data.memoryUsageMb ?? data.memory_mb ?? data.memoryMb ?? data.memoryUsage ?? data.memory ?? 0;
      if (typeof memRaw === 'object' && memRaw !== null) {
        memoryMb = Number((memRaw as any).rss || (memRaw as any).heapUsed || 0);
      } else {
        memoryMb = Number(memRaw) || 0;
      }

      // Normalize DB response time
      const dbResponseMs = Number(data.dbResponseMs ?? data.db_response_ms ?? data.dbResponseTime ?? 0);

      await env.DB.prepare(
        `INSERT OR REPLACE INTO health_cache
         (app_id, status, db_connected, db_response_ms, memory_mb, version, raw_json, checked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))`
      ).bind(
        app.id,
        String(status),
        dbConnected ? 1 : 0,
        dbResponseMs,
        Math.round(memoryMb),
        String(data.version || ''),
        JSON.stringify(data)
      ).run();
    });

  await Promise.allSettled(checks);
}

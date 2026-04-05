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
      const status = data.dbConnected ? 'healthy' : 'degraded';

      await env.DB.prepare(
        `INSERT OR REPLACE INTO health_cache
         (app_id, status, db_connected, db_response_ms, memory_mb, version, raw_json, checked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))`
      ).bind(
        app.id,
        String(data.status || status),
        data.dbConnected ? 1 : 0,
        Number(data.dbResponseMs || 0),
        Number(data.memoryUsageMb || 0),
        String(data.version || ''),
        JSON.stringify(data)
      ).run();
    });

  await Promise.allSettled(checks);
}

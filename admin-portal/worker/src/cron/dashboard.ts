/**
 * Cron: Dashboard sync — fetches from all apps.
 * ONLY caches error_count and raw_json for debugging.
 * User counts and MRR are ZEROED — never trusted from app endpoints.
 */

import { Env } from '../types';
import { getAllApps, fetchAppEndpoint } from '../lib/d1';
import { extractData, normalizeDashboard } from '../lib/normalize';

export async function runDashboardSync(env: Env): Promise<void> {
  const apps = await getAllApps(env);

  const syncs = apps
    .filter(app => app.has_admin && app.api_base_url)
    .map(async app => {
      const raw = await fetchAppEndpoint(env, app, 'dashboard');
      if (!raw) return;

      const data = extractData(raw);
      const norm = normalizeDashboard(data);

      // Snapshot error count for trending (this is real infrastructure data)
      await env.DB.prepare(
        'INSERT INTO error_snapshots (app_id, error_count) VALUES (?, ?)'
      ).bind(app.id, norm.errorCount).run();

      // Cache ONLY error_count and raw_json — user counts and MRR are ZEROED
      await env.DB.prepare(
        `INSERT OR REPLACE INTO dashboard_cache
         (app_id, total_users, active_users, new_signups_7d, new_signups_30d, mrr, error_count, raw_json, fetched_at)
         VALUES (?, 0, 0, 0, 0, 0, ?, ?, datetime("now"))`
      ).bind(app.id, norm.errorCount, JSON.stringify(data)).run();

      // Cache billing as ZEROED — Stripe is the only revenue source of truth
      const billingRaw = await fetchAppEndpoint(env, app, 'billing');
      if (billingRaw) {
        const billing = extractData(billingRaw);
        await env.DB.prepare(
          `INSERT OR REPLACE INTO billing_cache
           (app_id, mrr, arr, paying_count, trial_count, churn_rate, raw_json, fetched_at)
           VALUES (?, 0, 0, 0, 0, 0, ?, datetime("now"))`
        ).bind(app.id, JSON.stringify(billing)).run();
      }
    });

  await Promise.allSettled(syncs);

  // Clean old error snapshots (keep 7 days)
  await env.DB.prepare(
    'DELETE FROM error_snapshots WHERE snapshot_at < datetime("now", "-7 days")'
  ).run();
}

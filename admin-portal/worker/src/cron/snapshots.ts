/**
 * Snapshot cache — pre-fetches slow endpoint data every 15 minutes.
 * Stores JSON snapshots in snapshot_cache table for instant page loads.
 */

import { Env } from '../types';
import { getAllApps, fetchUsersFromApp, fetchAppEndpoint } from '../lib/d1';
import { isTestEmail } from '../lib/filter';

async function cacheSnapshot(env: Env, key: string, data: unknown): Promise<void> {
  await env.DB.prepare(
    `INSERT OR REPLACE INTO snapshot_cache (key, data_json, fetched_at) VALUES (?, ?, datetime('now'))`
  ).bind(key, JSON.stringify(data)).run();
}

export async function runSnapshotSync(env: Env): Promise<void> {
  console.log('[snapshots] Starting snapshot sync...');
  const apps = await getAllApps(env);
  const appsWithAdmin = apps.filter(a => a.has_admin && a.api_base_url);

  // 1. Cache customers (users from all apps)
  try {
    const results = await Promise.allSettled(
      appsWithAdmin.map(async (app) => {
        const result = await fetchUsersFromApp(env, app);
        return { app, result };
      })
    );

    const customers: any[] = [];
    let realCount = 0;
    let testCount = 0;

    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      const { app, result } = r.value;
      for (const user of result.users) {
        customers.push({
          email: user.email,
          name: user.name,
          app: app.name,
          appId: app.id,
          plan: String(user.plan || user.tier || user.planTier || 'free'),
          isTest: user.isTest,
          createdAt: user.createdAt || user.created_at || null,
          lastLogin: user.lastLoginAt || user.lastActive || user.lastLogin || null,
        });
        if (user.isTest) testCount++;
        else realCount++;
      }
    }

    await cacheSnapshot(env, 'snapshot:customers', {
      customers,
      total: customers.length,
      realCustomers: realCount,
      testAccounts: testCount,
    });
    console.log(`[snapshots] Cached ${customers.length} customers (${realCount} real)`);
  } catch (err) {
    console.error('[snapshots] Customer cache failed:', err);
  }

  // 2. Cache usage data
  try {
    const usageResults = await Promise.allSettled(
      appsWithAdmin.map(async (app) => {
        const raw = await fetchAppEndpoint(env, app, 'usage?period=30d');
        return { app, raw };
      })
    );

    let totalActive = 0, totalSessions = 0, totalActions = 0;
    const appUsage: any[] = [];
    const allFeatures: any[] = [];
    const allActivity: any[] = [];
    let appsWithActivity = 0;

    for (const r of usageResults) {
      if (r.status !== 'fulfilled' || !r.value.raw) continue;
      const { app, raw } = r.value;
      const d = (raw as any).data || raw;
      const active = Number(d.activeUsers || d.totalActiveUsers || 0);
      const sessions = Number(d.totalSessions || d.sessions || 0);
      const actions = Number(d.totalActions || d.actions || 0);

      if (active > 0 || sessions > 0) appsWithActivity++;
      totalActive += active;
      totalSessions += sessions;
      totalActions += actions;

      const features = (d.featureBreakdown || d.features || []) as any[];
      const activity = (d.recentActivity || []) as any[];

      appUsage.push({
        appId: app.id,
        appName: app.name,
        activeUsers: active,
        totalSessions: sessions,
        totalActions: actions,
        topFeature: features[0]?.feature || features[0]?.name || '',
        featureBreakdown: features.slice(0, 10),
        dailyActiveUsers: d.dailyActiveUsers || [],
        recentActivity: activity.slice(0, 6),
      });

      for (const f of features.slice(0, 5)) {
        allFeatures.push({ app: app.name, feature: f.feature || f.name, uses: f.uses || f.count || 0, uniqueUsers: f.uniqueUsers || 0 });
      }
      for (const a of activity.slice(0, 5)) {
        allActivity.push({ app: app.name, ...a });
      }
    }

    allFeatures.sort((a, b) => b.uses - a.uses);
    allActivity.sort((a, b) => (b.at || '').localeCompare(a.at || ''));

    await cacheSnapshot(env, 'snapshot:usage', {
      period: '30d',
      summary: { totalActiveUsers: totalActive, totalSessions: totalSessions, totalActions: totalActions, appsWithActivity, totalApps: apps.length },
      apps: appUsage,
      topFeatures: allFeatures.slice(0, 20),
      recentActivity: allActivity.slice(0, 30),
      generatedAt: new Date().toISOString(),
    });
    console.log(`[snapshots] Cached usage data (${appsWithActivity} apps active)`);
  } catch (err) {
    console.error('[snapshots] Usage cache failed:', err);
  }

  // 3. Cache briefing summary (user count + basic metrics)
  try {
    let totalRealUsers = 0;
    const results = await Promise.allSettled(
      appsWithAdmin.map(async (app) => {
        const result = await fetchUsersFromApp(env, app);
        return result.realCount;
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled') totalRealUsers += r.value;
    }

    // Get other briefing data from D1 (fast)
    const healthApps = await env.DB.prepare(
      `SELECT COUNT(*) as total, SUM(CASE WHEN h.status = 'healthy' THEN 1 ELSE 0 END) as healthy
       FROM apps a LEFT JOIN health_cache h ON a.id = h.app_id`
    ).first<{ total: number; healthy: number }>();

    const leads = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM leads WHERE status = 'new' AND created_at > datetime('now', '-7 days')`
    ).first<{ c: number }>();

    const pipeline = await env.DB.prepare(
      `SELECT COALESCE(SUM(value), 0) as v FROM projects WHERE status IN ('prospect', 'proposal', 'in-progress')`
    ).first<{ v: number }>();

    await cacheSnapshot(env, 'snapshot:briefing', {
      totalUsers: totalRealUsers,
      healthyApps: healthApps?.healthy || 0,
      totalApps: healthApps?.total || 0,
      newLeads: leads?.c || 0,
      pipelineValue: pipeline?.v || 0,
    });
    console.log(`[snapshots] Cached briefing (${totalRealUsers} real users)`);
  } catch (err) {
    console.error('[snapshots] Briefing cache failed:', err);
  }

  console.log('[snapshots] Snapshot sync complete');
}

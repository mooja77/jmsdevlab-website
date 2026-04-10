/**
 * Usage analytics — aggregates /api/admin/usage from all apps.
 * Shows per-app engagement, feature usage, and real user activity.
 */

import { Env, json } from '../types';
import { getAllApps, fetchAppEndpoint } from '../lib/d1';
import { extractData } from '../lib/normalize';
import { isTestEmail } from '../lib/filter';

interface AppUsage {
  appId: string;
  appName: string;
  activeUsers: number;
  totalSessions: number;
  totalActions: number;
  topFeature: string;
  featureBreakdown: Array<{ feature: string; uses: number; uniqueUsers: number }>;
  dailyActiveUsers: Array<{ date: string; count: number }>;
  recentActivity: Array<{ user: string; action: string; at: string }>;
}

export async function handleUsageRoutes(path: string, url: URL, env: Env): Promise<Response> {
  // GET /api/usage — aggregate usage from all apps (cached, refreshed every 15 min)
  if (path === '/api/usage') {
    const period = url.searchParams.get('period') || '30d';
    const fresh = url.searchParams.get('fresh') === 'true';

    // Try cache first (unless ?fresh=true)
    if (!fresh) {
      const cached = await env.DB.prepare(
        `SELECT data_json, fetched_at FROM snapshot_cache WHERE key = 'snapshot:usage' AND fetched_at > datetime('now', '-20 minutes')`
      ).first<{ data_json: string; fetched_at: string }>();
      if (cached) {
        const data = JSON.parse(cached.data_json);
        data._cached = cached.fetched_at;
        return json(data);
      }
    }

    const apps = await getAllApps(env);

    const appUsages: AppUsage[] = [];
    let totalActiveUsers = 0;
    let totalSessions = 0;
    let totalActions = 0;
    const allFeatures: Record<string, { uses: number; uniqueUsers: number }> = {};
    const allRecentActivity: Array<{ app: string; user: string; action: string; at: string }> = [];

    // Fetch usage from each app in parallel
    const fetches = apps
      .filter(a => a.has_admin && a.api_base_url)
      .map(async app => {
        try {
          const raw = await fetchAppEndpoint(env, app, `usage?period=${period}`);
          if (!raw) return;

          const data = extractData(raw);

          const activeUsers = Number(data.activeUsers ?? 0);
          const sessions = Number(data.totalSessions ?? 0);
          const actions = Number(data.totalActions ?? 0);

          totalActiveUsers += activeUsers;
          totalSessions += sessions;
          totalActions += actions;

          // Feature breakdown
          const features = (data.featureBreakdown || []) as Array<{ feature: string; uses: number; uniqueUsers: number }>;
          let topFeature = '';
          let topFeatureUses = 0;
          for (const f of features) {
            const key = `${app.name}:${f.feature}`;
            allFeatures[key] = { uses: f.uses || 0, uniqueUsers: f.uniqueUsers || 0 };
            if ((f.uses || 0) > topFeatureUses) {
              topFeature = f.feature;
              topFeatureUses = f.uses || 0;
            }
          }

          // Daily active users
          const dau = (data.dailyActiveUsers || []) as Array<{ date: string; count: number }>;

          // Recent activity — filter test users
          const activity = (data.recentActivity || []) as Array<{ user?: string; email?: string; action: string; at?: string; timestamp?: string }>;
          const filtered = activity
            .filter(a => !isTestEmail(String(a.user || a.email || '')))
            .map(a => ({
              app: app.name,
              user: String(a.user || a.email || 'unknown'),
              action: String(a.action || ''),
              at: String(a.at || a.timestamp || ''),
            }));
          allRecentActivity.push(...filtered);

          appUsages.push({
            appId: app.id,
            appName: app.name,
            activeUsers,
            totalSessions: sessions,
            totalActions: actions,
            topFeature,
            featureBreakdown: features,
            dailyActiveUsers: dau,
            recentActivity: filtered,
          });
        } catch (err) {
          console.error(`Usage fetch failed for ${app.id}:`, err);
        }
      });

    await Promise.allSettled(fetches);

    // Sort apps by activity (most active first)
    appUsages.sort((a, b) => b.totalActions - a.totalActions);

    // Sort all recent activity by timestamp (newest first)
    allRecentActivity.sort((a, b) => (b.at || '').localeCompare(a.at || ''));

    // Top features across all apps
    const topFeatures = Object.entries(allFeatures)
      .sort(([, a], [, b]) => b.uses - a.uses)
      .slice(0, 10)
      .map(([key, val]) => {
        const [app, feature] = key.split(':');
        return { app, feature, ...val };
      });

    return json({
      period,
      summary: {
        totalActiveUsers,
        totalSessions,
        totalActions,
        appsWithActivity: appUsages.filter(a => a.totalActions > 0).length,
        totalApps: apps.length,
      },
      apps: appUsages,
      topFeatures,
      recentActivity: allRecentActivity.slice(0, 30),
      generatedAt: new Date().toISOString(),
    });
  }

  // GET /api/usage/realusers — detailed real user list with usage data
  if (path === '/api/usage/realusers') {
    const apps = await getAllApps(env);
    const realUsers: Array<Record<string, unknown> & { app: string; appId: string }> = [];

    const fetches = apps
      .filter(a => a.has_admin && a.api_base_url)
      .map(async app => {
        const raw = await fetchAppEndpoint(env, app, 'users?limit=100');
        if (!raw) return;

        const data = extractData(raw);
        let users: any[];
        if (Array.isArray(data)) {
          users = data;
        } else if (Array.isArray(data.data)) {
          users = data.data;
        } else {
          users = (data.users || data.shops || data.stores || []) as any[];
        }
        if (!Array.isArray(users)) return;

        for (const u of users) {
          const email = String(u.email || u.ownerEmail || u.domain || '');
          if (isTestEmail(email)) continue;

          realUsers.push({
            ...u,
            app: app.name,
            appId: app.id,
          });
        }
      });

    await Promise.allSettled(fetches);

    // Sort by most recently active
    realUsers.sort((a, b) => {
      const aDate = String(a.lastActive || a.lastLogin || a.createdAt || '');
      const bDate = String(b.lastActive || b.lastLogin || b.createdAt || '');
      return bDate.localeCompare(aDate);
    });

    return json({
      users: realUsers,
      total: realUsers.length,
    });
  }

  return json({ error: 'Not found' }, 404);
}

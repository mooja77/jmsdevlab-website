/**
 * Conversion sync cron — pulls user data from all apps,
 * populates unified_users, funnel_events, conversion_daily.
 * Runs every 30 minutes.
 */

import { Env } from '../types';
import { getAllApps, fetchUsersFromApp, ExtractedUser } from '../lib/d1';

function determineStage(user: any): string {
  const status = String(user.subscriptionStatus || user.status || user.planStatus || user.plan || '').toLowerCase();
  const plan = String(user.plan || user.tier || user.planTier || '').toLowerCase();

  if (status === 'cancelled' || status === 'canceled' || status === 'deleted' || status === 'expired') return 'churned';
  if (status === 'active' || status === 'paid') return 'paid';
  if (status === 'trialing' || plan === 'trial' || status === 'trial') return 'trial';
  if (plan === 'free' || plan === 'starter' || plan === '') return 'signup';
  return 'signup';
}

function getSignupDate(user: any): string | null {
  const d = user.createdAt || user.created_at || user.installedAt || user.signupDate;
  if (!d) return null;
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function getLastActive(user: any): string | null {
  const d = user.lastLoginAt || user.lastActiveAt || user.last_active || user.lastLogin || user.updatedAt;
  if (!d) return null;
  try {
    return new Date(d).toISOString();
  } catch {
    return null;
  }
}

export async function runConversionSync(env: Env): Promise<void> {
  console.log('[conversions] Starting conversion sync...');

  const apps = await getAllApps(env);
  const appsWithAdmin = apps.filter(a => a.has_admin && a.api_base_url);

  // Phase 1: Fetch all users from all apps
  const allUsers: { email: string; appId: string; stage: string; signupDate: string | null; lastActive: string | null; isTest: boolean }[] = [];

  const results = await Promise.allSettled(
    appsWithAdmin.map(async (app) => {
      const result = await fetchUsersFromApp(env, app);
      return { app, result };
    })
  );

  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    const { app, result } = r.value;
    for (const user of result.users) {
      allUsers.push({
        email: user.email.toLowerCase().trim(),
        appId: app.id,
        stage: determineStage(user),
        signupDate: getSignupDate(user),
        lastActive: getLastActive(user),
        isTest: user.isTest,
      });
    }
  }

  console.log(`[conversions] Fetched ${allUsers.length} users from ${appsWithAdmin.length} apps`);

  // Phase 2: Upsert into unified_users
  const byEmail = new Map<string, typeof allUsers>();
  for (const u of allUsers) {
    if (!u.email || u.email.length < 3) continue;
    const list = byEmail.get(u.email) || [];
    list.push(u);
    byEmail.set(u.email, list);
  }

  let stageChanges = 0;
  const stmts: D1PreparedStatement[] = [];

  for (const [email, entries] of byEmail) {
    const appIds = [...new Set(entries.map(e => e.appId))];
    const isTest = entries.some(e => e.isTest) ? 1 : 0;

    // Best stage: paid > trial > signup > churned
    const stageRank: Record<string, number> = { paid: 4, trial: 3, signup: 2, churned: 1 };
    const bestStage = entries.reduce((best, e) => (stageRank[e.stage] || 0) > (stageRank[best] || 0) ? e.stage : best, entries[0].stage);

    const earliest = entries
      .filter(e => e.signupDate)
      .sort((a, b) => (a.signupDate || '').localeCompare(b.signupDate || ''))[0];
    const latest = entries
      .filter(e => e.lastActive)
      .sort((a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''))[0];

    // Check if stage changed
    const existing = await env.DB.prepare('SELECT current_stage FROM unified_users WHERE email = ?').bind(email).first<{ current_stage: string }>();
    const previousStage = existing?.current_stage;

    stmts.push(
      env.DB.prepare(`
        INSERT INTO unified_users (email, first_seen_app, first_seen_at, last_active_at, app_count, apps_json, current_stage, is_test, synced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(email) DO UPDATE SET
          last_active_at = excluded.last_active_at,
          app_count = excluded.app_count,
          apps_json = excluded.apps_json,
          current_stage = excluded.current_stage,
          synced_at = datetime('now')
      `).bind(
        email,
        earliest?.appId || appIds[0],
        earliest?.signupDate || null,
        latest?.lastActive || null,
        appIds.length,
        JSON.stringify(appIds),
        bestStage,
        isTest,
      )
    );

    // Insert funnel event on stage change
    if (previousStage && previousStage !== bestStage) {
      stageChanges++;
      stmts.push(
        env.DB.prepare(`INSERT INTO funnel_events (email, stage, app_id, source) VALUES (?, ?, ?, 'admin_sync')`)
          .bind(email, bestStage, appIds[0])
      );
    } else if (!previousStage) {
      // New user — insert initial stage
      stmts.push(
        env.DB.prepare(`INSERT INTO funnel_events (email, stage, app_id, source) VALUES (?, ?, ?, 'admin_sync')`)
          .bind(email, bestStage, appIds[0])
      );
    }
  }

  // Batch execute in chunks of 50
  for (let i = 0; i < stmts.length; i += 50) {
    await env.DB.batch(stmts.slice(i, i + 50));
  }

  console.log(`[conversions] Upserted ${byEmail.size} unified users, ${stageChanges} stage changes`);

  // Phase 3: Ensure bark_leads are in funnel as "lead" stage
  const barkLeads = await env.DB.prepare(
    `SELECT first_name, matched_email, location FROM bark_leads WHERE status != 'dismissed'`
  ).all<{ first_name: string; matched_email: string; location: string }>();

  for (const lead of barkLeads.results) {
    const email = lead.matched_email || `bark_${lead.first_name?.toLowerCase()}_${lead.location?.toLowerCase().replace(/\s/g, '')}@lead.local`;
    await env.DB.prepare(
      `INSERT OR IGNORE INTO funnel_events (email, stage, source) VALUES (?, 'lead', 'bark')`
    ).bind(email).run();
  }

  // Phase 4: Build conversion_daily snapshot for today
  const today = new Date().toISOString().slice(0, 10);

  // Visitors from CF analytics
  const visitorRow = await env.DB.prepare(
    `SELECT COALESCE(SUM(uniques), 0) as visitors FROM analytics_daily WHERE date = ?`
  ).bind(today).first<{ visitors: number }>();

  // Stage counts from unified_users (excluding test)
  const stageCounts = await env.DB.prepare(`
    SELECT current_stage, COUNT(*) as c FROM unified_users WHERE is_test = 0 GROUP BY current_stage
  `).all<{ current_stage: string; c: number }>();

  const counts: Record<string, number> = {};
  for (const row of stageCounts.results) {
    counts[row.current_stage] = row.c;
  }

  await env.DB.prepare(`
    INSERT INTO conversion_daily (date, app_id, visitors, signups, trials, paid, churned)
    VALUES (?, NULL, ?, ?, ?, ?, ?)
    ON CONFLICT(date, app_id) DO UPDATE SET
      visitors = excluded.visitors, signups = excluded.signups,
      trials = excluded.trials, paid = excluded.paid, churned = excluded.churned
  `).bind(
    today, visitorRow?.visitors || 0,
    counts['signup'] || 0, counts['trial'] || 0,
    counts['paid'] || 0, counts['churned'] || 0,
  ).run();

  // Per-app snapshots
  for (const app of apps) {
    const domain = app.frontend_url?.replace('https://', '').replace('http://', '') || '';
    const appVisitors = await env.DB.prepare(
      `SELECT COALESCE(SUM(uniques), 0) as v FROM analytics_daily WHERE date = ? AND domain = ?`
    ).bind(today, domain).first<{ v: number }>();

    const appCounts = await env.DB.prepare(`
      SELECT current_stage, COUNT(*) as c FROM unified_users
      WHERE is_test = 0 AND apps_json LIKE ?
      GROUP BY current_stage
    `).bind(`%"${app.id}"%`).all<{ current_stage: string; c: number }>();

    const ac: Record<string, number> = {};
    for (const row of appCounts.results) ac[row.current_stage] = row.c;

    if ((appVisitors?.v || 0) > 0 || Object.keys(ac).length > 0) {
      await env.DB.prepare(`
        INSERT INTO conversion_daily (date, app_id, visitors, signups, trials, paid, churned)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(date, app_id) DO UPDATE SET
          visitors = excluded.visitors, signups = excluded.signups,
          trials = excluded.trials, paid = excluded.paid, churned = excluded.churned
      `).bind(
        today, app.id, appVisitors?.v || 0,
        ac['signup'] || 0, ac['trial'] || 0,
        ac['paid'] || 0, ac['churned'] || 0,
      ).run();
    }
  }

  console.log('[conversions] Conversion sync complete');
}

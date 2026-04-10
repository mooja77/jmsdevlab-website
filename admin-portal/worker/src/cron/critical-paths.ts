/**
 * Critical Path Checks — verifies all app pages load correctly.
 * Runs every 30 minutes. Stores results in critical_path_checks table.
 * Alerts on new failures via activity_log.
 */

import { Env } from '../types';
import { getAllApps, getAdminKey } from '../lib/d1';

interface Check {
  appId: string;
  type: string;
  url: string;
  expect?: string[]; // any of these strings in response body (case-insensitive)
}

// Registry of all critical paths to check
function buildCheckRegistry(): Check[] {
  return [
    // SmartCash
    { appId: 'smartcash', type: 'homepage', url: 'https://smartcashapp.net', expect: ['smartcash'] },
    { appId: 'smartcash', type: 'login', url: 'https://smartcashapp.net/login', expect: ['password', 'sign in', 'email'] },
    { appId: 'smartcash', type: 'api_health', url: 'https://api.smartcashapp.net/health' },

    // ProfitShield
    { appId: 'profitshield', type: 'homepage', url: 'https://profitshield.app', expect: ['profitshield'] },
    { appId: 'profitshield', type: 'login', url: 'https://profitshield.app/auth/login', expect: ['password', 'sign in', 'email'] },
    { appId: 'profitshield', type: 'register', url: 'https://profitshield.app/auth/register', expect: ['sign up', 'create', 'register'] },
    { appId: 'profitshield', type: 'pricing', url: 'https://profitshield.app/pricing', expect: ['price', '$', 'plan'] },

    // JewelValue
    { appId: 'jewelvalue', type: 'homepage', url: 'https://jewelvalue.app', expect: ['jewelvalue', 'valuation'] },
    { appId: 'jewelvalue', type: 'login', url: 'https://jewelvalue.app/auth/login', expect: ['password', 'sign in', 'email'] },

    // RepairDesk (Vite SPA)
    { appId: 'repairdesk', type: 'homepage', url: 'https://repairdeskapp.net', expect: ['repairdesk', 'root'] },
    { appId: 'repairdesk', type: 'login', url: 'https://repairdeskapp.net/login', expect: ['root', 'script'] },
    { appId: 'repairdesk', type: 'register', url: 'https://repairdeskapp.net/register', expect: ['root', 'script'] },

    // QualCanvas (Vite SPA — check for root div, not form content)
    { appId: 'qualcanvas', type: 'homepage', url: 'https://qualcanvas.com', expect: ['qualcanvas', 'root'] },
    { appId: 'qualcanvas', type: 'login', url: 'https://qualcanvas.com/login', expect: ['root', 'script'] },
    { appId: 'qualcanvas', type: 'pricing', url: 'https://qualcanvas.com/pricing', expect: ['root', 'script'] },

    // ThemeSweep (themesweep.com is the marketing site, app is at app.themesweep.app)
    { appId: 'themesweep', type: 'homepage', url: 'https://themesweep.com', expect: ['themesweep', 'shopify'] },

    // SpamShield (Vite SPA)
    { appId: 'spamshield', type: 'homepage', url: 'https://spamshield.dev', expect: ['spamshield', 'root'] },
    { appId: 'spamshield', type: 'login', url: 'https://spamshield.dev/login', expect: ['root', 'script'] },
    { appId: 'spamshield', type: 'register', url: 'https://spamshield.dev/register', expect: ['root', 'script'] },

    // TaxMatch
    { appId: 'taxmatch', type: 'homepage', url: 'https://taxmatch.app', expect: ['taxmatch', 'tax'] },
    { appId: 'taxmatch', type: 'login', url: 'https://taxmatch.app/auth/login', expect: ['password', 'sign in', 'email'] },

    // PitchSide
    { appId: 'pitchside', type: 'homepage', url: 'https://pitchsideapp.net', expect: ['pitch side', 'football', 'coaching'] },

    // JSM
    { appId: 'jsm', type: 'homepage', url: 'https://jewelrystudiomanager.com', expect: ['jewelry', 'studio', 'manager'] },
    { appId: 'jsm', type: 'login', url: 'https://jewelrystudiomanager.com/login', expect: ['password', 'sign in', 'email'] },

    // GrowthMap (Next.js — SSR, should have content)
    { appId: 'growthmap', type: 'homepage', url: 'https://mygrowthmap.net', expect: ['growthmap', 'marketing'] },
    { appId: 'growthmap', type: 'login', url: 'https://mygrowthmap.net/login', expect: ['sign in', 'email', 'password', 'script'] },

    // StaffHub
    { appId: 'staffhub', type: 'homepage', url: 'https://staffhubapp.com', expect: ['staffhub', 'staff'] },
    { appId: 'staffhub', type: 'login', url: 'https://staffhubapp.com/login', expect: ['password', 'sign in', 'email'] },
  ];
}

async function runCheck(check: Check): Promise<{
  status: 'pass' | 'fail' | 'degraded';
  httpStatus: number;
  responseMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const res = await fetch(check.url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'JMS-CriticalPath-Monitor/1.0' },
      redirect: 'follow',
    });

    const responseMs = Date.now() - start;
    const httpStatus = res.status;

    if (httpStatus >= 500) {
      return { status: 'fail', httpStatus, responseMs, error: `HTTP ${httpStatus}` };
    }

    if (httpStatus >= 400) {
      return { status: 'fail', httpStatus, responseMs, error: `HTTP ${httpStatus}` };
    }

    // Check content if expected strings provided
    if (check.expect && check.expect.length > 0) {
      const body = await res.text();
      const lower = body.toLowerCase();
      const found = check.expect.some(e => lower.includes(e.toLowerCase()));
      if (!found) {
        return { status: 'degraded', httpStatus, responseMs, error: `Expected content not found` };
      }
    }

    // Slow response warning
    if (responseMs > 5000) {
      return { status: 'degraded', httpStatus, responseMs, error: `Slow response: ${responseMs}ms` };
    }

    return { status: 'pass', httpStatus, responseMs };
  } catch (err) {
    return {
      status: 'fail',
      httpStatus: 0,
      responseMs: Date.now() - start,
      error: String(err).slice(0, 200),
    };
  }
}

export async function runCriticalPathChecks(env: Env): Promise<void> {
  console.log('[critical-paths] Starting checks...');

  const checks = buildCheckRegistry();

  // Also add billing API checks for apps with admin keys
  const apps = await getAllApps(env);
  for (const app of apps) {
    if (!app.api_base_url || !app.admin_key_name) continue;
    const key = getAdminKey(env, app.admin_key_name);
    if (!key) continue;
    checks.push({
      appId: app.id,
      type: 'billing_api',
      url: `${app.api_base_url}/api/admin/billing`,
      // Billing check uses admin key — handled specially below
    });
  }

  // Run all checks in parallel (batched to avoid overwhelming)
  const batchSize = 10;
  const results: { check: Check; result: Awaited<ReturnType<typeof runCheck>> }[] = [];

  for (let i = 0; i < checks.length; i += batchSize) {
    const batch = checks.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (check) => {
        // Special handling for billing API checks (need admin key header)
        if (check.type === 'billing_api') {
          const app = apps.find(a => a.id === check.appId);
          const key = app?.admin_key_name ? getAdminKey(env, app.admin_key_name) : undefined;
          if (!key) return { check, result: { status: 'fail' as const, httpStatus: 0, responseMs: 0, error: 'No admin key' } };

          const start = Date.now();
          try {
            const res = await fetch(check.url, {
              signal: AbortSignal.timeout(10000),
              headers: { 'x-admin-key': key },
            });
            return { check, result: { status: res.ok ? 'pass' as const : 'fail' as const, httpStatus: res.status, responseMs: Date.now() - start } };
          } catch (err) {
            return { check, result: { status: 'fail' as const, httpStatus: 0, responseMs: Date.now() - start, error: String(err).slice(0, 200) } };
          }
        }

        const result = await runCheck(check);
        return { check, result };
      })
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(r.value);
    }
  }

  // Store results + alert on new failures
  const stmts: D1PreparedStatement[] = [];

  for (const { check, result } of results) {
    stmts.push(
      env.DB.prepare(
        `INSERT INTO critical_path_checks (app_id, check_type, url, status, http_status, response_ms, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(check.appId, check.type, check.url, result.status, result.httpStatus, result.responseMs, result.error || null)
    );

    // Alert on failures (deduplicated — once per hour per app+check)
    if (result.status === 'fail') {
      const existing = await env.DB.prepare(
        `SELECT id FROM activity_log WHERE source = ? AND event_type = 'critical_path_failed' AND summary LIKE ? AND created_at > datetime('now', '-1 hour') LIMIT 1`
      ).bind(check.appId, `%${check.type}%`).first();

      if (!existing) {
        stmts.push(
          env.DB.prepare(
            `INSERT INTO activity_log (source, event_type, summary) VALUES (?, 'critical_path_failed', ?)`
          ).bind(check.appId, `${check.appId} ${check.type} check failed: ${result.error || 'HTTP ' + result.httpStatus}`)
        );
      }
    }
  }

  // Batch insert
  for (let i = 0; i < stmts.length; i += 50) {
    await env.DB.batch(stmts.slice(i, i + 50));
  }

  // Cleanup old checks (>7 days)
  await env.DB.prepare(
    `DELETE FROM critical_path_checks WHERE checked_at < datetime('now', '-7 days')`
  ).run();

  const passed = results.filter(r => r.result.status === 'pass').length;
  const failed = results.filter(r => r.result.status === 'fail').length;
  const degraded = results.filter(r => r.result.status === 'degraded').length;
  console.log(`[critical-paths] Done: ${passed} pass, ${failed} fail, ${degraded} degraded (${results.length} total)`);
}

/**
 * Cron: Visitors sync — tag detection, Cloudflare zone sync, analytics pull.
 */

import { Env } from '../types';
import { getAllApps } from '../lib/d1';

const MAIN_DOMAIN = 'jmsdevlab.com';
const CF_API = 'https://api.cloudflare.com/client/v4';
const CF_ACCOUNT = 'fe8383fe03ab5000c8fc4b13e4e2f0a8';

/** Extract domain from a URL like https://smartcashapp.net */
function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Known GTM container tags — GA4/Meta/Ads are injected by GTM at runtime,
// so they won't appear in raw HTML. We infer from the container ID.
const GTM_CONTAINER_TAGS: Record<string, { ga4: string; meta: string; gads: string }> = {
  'GTM-NPTXDRDH': { ga4: 'G-B7SYY8F9XY', meta: '1762011307420822', gads: '198296860' },
};

/** Detect tracking tags in HTML */
function detectTags(html: string) {
  const gtmMatch = html.match(/GTM-[A-Z0-9]+/);
  const gtmId = gtmMatch?.[0] || null;

  // Direct detection in HTML
  const ga4Match = html.match(/G-[A-Z0-9]{6,}/);
  const metaMatch = html.match(/fbq\s*\(\s*['"]init['"],\s*['"](\d+)['"]/);
  const gadsMatch = html.match(/AW-(\d+)/);
  const gscMatch = html.includes('google-site-verification');

  // If GTM is present, infer tags loaded by the container
  const containerTags = gtmId ? GTM_CONTAINER_TAGS[gtmId] : null;

  const hasGa4 = ga4Match || containerTags?.ga4 ? 1 : 0;
  const ga4Id = ga4Match?.[0] || containerTags?.ga4 || null;
  const hasMeta = metaMatch || html.includes('connect.facebook.net') || containerTags?.meta ? 1 : 0;
  const metaId = metaMatch?.[1] || containerTags?.meta || null;
  const hasGads = gadsMatch || html.includes('googleads.g.doubleclick.net') || containerTags?.gads ? 1 : 0;
  const gadsId = gadsMatch?.[1] || containerTags?.gads || null;

  return {
    has_gtm: gtmMatch ? 1 : 0,
    gtm_id: gtmId,
    has_ga4: hasGa4,
    ga4_id: ga4Id,
    has_meta: hasMeta,
    meta_id: metaId,
    has_gads: hasGads,
    gads_id: gadsId,
    has_gsc_verify: gscMatch ? 1 : 0,
  };
}

/** a) Fetch each domain and detect tracking tags */
async function syncTrackingTags(env: Env): Promise<void> {
  const apps = await getAllApps(env);
  const domains = new Set<string>();
  domains.add(MAIN_DOMAIN);

  for (const app of apps) {
    if (app.frontend_url) {
      const d = domainFromUrl(app.frontend_url);
      if (d) domains.add(d);
    }
  }

  const checks = [...domains].map(async (domain) => {
    try {
      const res = await fetch(`https://${domain}`, {
        signal: AbortSignal.timeout(10000),
        redirect: 'follow',
        headers: { 'User-Agent': 'JMS-Admin-Portal/1.0' },
      });
      const html = await res.text();
      const tags = detectTags(html);

      await env.DB.prepare(`
        INSERT INTO tracking_status (domain, has_gtm, gtm_id, has_ga4, ga4_id, has_meta, meta_id, has_gads, gads_id, has_gsc_verify, dns_resolves, checked_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
        ON CONFLICT(domain) DO UPDATE SET
          has_gtm=excluded.has_gtm, gtm_id=excluded.gtm_id,
          has_ga4=excluded.has_ga4, ga4_id=excluded.ga4_id,
          has_meta=excluded.has_meta, meta_id=excluded.meta_id,
          has_gads=excluded.has_gads, gads_id=excluded.gads_id,
          has_gsc_verify=excluded.has_gsc_verify,
          dns_resolves=1, checked_at=datetime('now')
      `).bind(
        domain,
        tags.has_gtm, tags.gtm_id,
        tags.has_ga4, tags.ga4_id,
        tags.has_meta, tags.meta_id,
        tags.has_gads, tags.gads_id,
        tags.has_gsc_verify
      ).run();
    } catch {
      // DNS failure or timeout
      await env.DB.prepare(`
        INSERT INTO tracking_status (domain, dns_resolves, checked_at)
        VALUES (?, 0, datetime('now'))
        ON CONFLICT(domain) DO UPDATE SET
          has_gtm=0, gtm_id=NULL, has_ga4=0, ga4_id=NULL,
          has_meta=0, meta_id=NULL, has_gads=0, gads_id=NULL,
          has_gsc_verify=0, dns_resolves=0, checked_at=datetime('now')
      `).bind(domain).run();
    }
  });

  await Promise.allSettled(checks);
}

/** b) Sync Cloudflare zones — map zone names to domains */
async function syncCfZones(env: Env): Promise<void> {
  if (!env.CLOUDFLARE_API_TOKEN) return;

  // Only run once per hour
  const lastRun = await env.DB.prepare(
    "SELECT value FROM config WHERE key = 'cf_zones_last_sync'"
  ).first<{ value: string }>();

  if (lastRun) {
    const elapsed = Date.now() - new Date(lastRun.value).getTime();
    if (elapsed < 3600000) return; // < 1 hour
  }

  try {
    const res = await fetch(`${CF_API}/zones?per_page=50`, {
      headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return;

    const data = await res.json() as { result: Array<{ id: string; name: string }> };

    for (const zone of data.result) {
      await env.DB.prepare(`
        UPDATE tracking_status SET cf_zone_id = ? WHERE domain = ?
      `).bind(zone.id, zone.name).run();
    }

    await env.DB.prepare(`
      INSERT INTO config (key, value, updated_at) VALUES ('cf_zones_last_sync', datetime('now'), datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = datetime('now'), updated_at = datetime('now')
    `).run();
  } catch {
    // Cloudflare API unavailable — skip
  }
}

/** c) Pull analytics from Cloudflare GraphQL for each zone */
async function syncAnalytics(env: Env): Promise<void> {
  if (!env.CLOUDFLARE_API_TOKEN) return;

  const zones = await env.DB.prepare(
    'SELECT domain, cf_zone_id FROM tracking_status WHERE cf_zone_id IS NOT NULL'
  ).all<{ domain: string; cf_zone_id: string }>();

  if (!zones.results?.length) return;

  // Yesterday's date in YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const pulls = zones.results.map(async ({ domain, cf_zone_id }) => {
    try {
      const query = `
        query {
          viewer {
            zones(filter: { zoneTag: "${cf_zone_id}" }) {
              httpRequests1dGroups(
                limit: 1
                filter: { date: "${yesterday}" }
              ) {
                sum {
                  pageViews
                  requests
                  bytes
                  threats
                }
                uniq {
                  uniques
                }
              }
              topPaths: httpRequests1dGroups(
                limit: 1
                filter: { date: "${yesterday}" }
              ) {
                sum {
                  responseStatusMap {
                    requests
                  }
                }
              }
            }
          }
        }
      `;

      const res = await fetch(`${CF_API}/graphql`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) return;

      const json = await res.json() as any;
      const groups = json?.data?.viewer?.zones?.[0]?.httpRequests1dGroups;
      if (!groups?.length) return;

      const g = groups[0];
      const pageviews = g.sum?.pageViews || 0;
      const requests = g.sum?.requests || 0;
      const bandwidth = g.sum?.bytes || 0;
      const threats = g.sum?.threats || 0;
      const uniques = g.uniq?.uniques || 0;

      await env.DB.prepare(`
        INSERT INTO analytics_daily (domain, date, pageviews, visits, uniques, requests, bandwidth_bytes, threats, fetched_at)
        VALUES (?, ?, ?, 0, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(domain, date) DO UPDATE SET
          pageviews=excluded.pageviews, uniques=excluded.uniques,
          requests=excluded.requests, bandwidth_bytes=excluded.bandwidth_bytes,
          threats=excluded.threats, fetched_at=datetime('now')
      `).bind(domain, yesterday, pageviews, uniques, requests, bandwidth, threats).run();
    } catch {
      // Individual zone failure — continue with others
    }
  });

  await Promise.allSettled(pulls);

  // Clean up old records (keep 90 days)
  await env.DB.prepare(
    "DELETE FROM analytics_daily WHERE date < date('now', '-90 days')"
  ).run();
}

/** Main entry: run all three sync tasks */
export async function runVisitorsSync(env: Env): Promise<void> {
  await syncTrackingTags(env);
  await syncCfZones(env);
  await syncAnalytics(env);
}

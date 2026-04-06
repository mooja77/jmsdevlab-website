import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Sparkline from '../components/ui/Sparkline';

/* ── Types ─────────────────────────────────────────── */

interface TrackingRow {
  domain: string;
  app_name: string | null;
  app_id: string | null;
  has_gtm: number;
  gtm_id: string | null;
  has_ga4: number;
  ga4_id: string | null;
  has_meta: number;
  meta_id: string | null;
  has_gads: number;
  gads_id: string | null;
  has_gsc_verify: number;
  cf_zone_id: string | null;
  dns_resolves: number;
  checked_at: string;
}

interface DayRow {
  domain: string;
  date: string;
  pageviews: number;
  visits: number;
  uniques: number;
  requests: number;
  bandwidth_bytes: number;
  threats: number;
}

interface Summary {
  pageviews: number;
  uniques: number;
  requests: number;
  bandwidth_bytes: number;
}

/* ── Constants ─────────────────────────────────────── */

const ANALYTICS_LINKS = {
  ga4: 'https://analytics.google.com/analytics/web/#/p530518943/reports/intelligenthome',
  gsc: 'https://search.google.com/search-console?resource_id=https://jmsdevlab.com/',
  gtm: 'https://tagmanager.google.com/#/container/accounts/6346991669/containers/247784426/workspaces/5',
  meta: 'https://business.facebook.com/latest/insights',
  cloudflare: 'https://dash.cloudflare.com/fe8383fe03ab5000c8fc4b13e4e2f0a8/web-analytics',
  plausible: 'https://plausible.io/jmsdevlab.com',
};

type Tab = 'overview' | 'traffic';

/* ── Page ──────────────────────────────────────────── */

export default function Visitors() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [tracking, setTracking] = useState<TrackingRow[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, DayRow[]>>({});
  const [summary, setSummary] = useState<{ week: Summary; month: Summary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    Promise.all([
      api<{ tracking: TrackingRow[] }>('/api/visitors/tracking'),
      api<{ analytics: Record<string, DayRow[]> }>('/api/visitors/analytics?days=7'),
      api<{ week: Summary; month: Summary }>('/api/visitors/summary'),
    ])
      .then(([t, a, s]) => {
        setTracking(t.tracking || []);
        setAnalytics(a.analytics || {});
        setSummary(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function triggerSync() {
    setSyncing(true);
    try {
      await api('/api/visitors/sync', { method: 'POST' });
      // Refetch
      const [t, a, s] = await Promise.all([
        api<{ tracking: TrackingRow[] }>('/api/visitors/tracking'),
        api<{ analytics: Record<string, DayRow[]> }>('/api/visitors/analytics?days=7'),
        api<{ week: Summary; month: Summary }>('/api/visitors/summary'),
      ]);
      setTracking(t.tracking || []);
      setAnalytics(a.analytics || {});
      setSummary(s);
    } catch {}
    setSyncing(false);
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Visitors & Analytics</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Tracking status, traffic, and search performance across all properties.
          </p>
        </div>
        <button
          onClick={triggerSync}
          disabled={syncing}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.1] transition-colors disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/50 border border-gray-800/50 rounded-xl p-1">
        {([['overview', 'Overview'], ['traffic', 'Traffic']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white/[0.08] text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab tracking={tracking} />
      )}
      {activeTab === 'traffic' && (
        <TrafficTab analytics={analytics} summary={summary} tracking={tracking} />
      )}
    </div>
  );
}

/* ── Overview Tab ──────────────────────────────────── */

function OverviewTab({ tracking }: { tracking: TrackingRow[] }) {
  const tagged = tracking.filter(t => t.has_gtm && t.has_ga4).length;
  const total = tracking.length;

  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <QuickLink label="Google Analytics 4" detail="GA4 — G-B7SYY8F9XY" url={ANALYTICS_LINKS.ga4} color="text-blue-400" />
        <QuickLink label="Search Console" detail="All properties" url={ANALYTICS_LINKS.gsc} color="text-emerald-400" />
        <QuickLink label="Tag Manager" detail="GTM-NPTXDRDH" url={ANALYTICS_LINKS.gtm} color="text-yellow-400" />
        <QuickLink label="Meta Business" detail="Pixel 1762011307420822" url={ANALYTICS_LINKS.meta} color="text-indigo-400" />
        <QuickLink label="Cloudflare Analytics" detail={`${total} domains monitored`} url={ANALYTICS_LINKS.cloudflare} color="text-orange-400" />
        <QuickLink label="Plausible" detail="Privacy-first (no consent)" url={ANALYTICS_LINKS.plausible} color="text-purple-400" />
      </div>

      {/* Tracking Status */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">
            Tracking Status — {tagged}/{total} fully tagged
          </h2>
          {tracking[0]?.checked_at && (
            <span className="text-[10px] text-gray-600">
              Updated {new Date(tracking[0].checked_at + 'Z').toLocaleString()}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-600 border-b border-gray-800/30">
                <th className="px-5 py-2 text-left">Domain</th>
                <th className="px-2 py-2 text-center">GTM</th>
                <th className="px-2 py-2 text-center">GA4</th>
                <th className="px-2 py-2 text-center">Meta</th>
                <th className="px-2 py-2 text-center">Ads</th>
                <th className="px-2 py-2 text-center">GSC</th>
                <th className="px-2 py-2 text-center">CF Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/20">
              {tracking.map((t) => (
                <tr key={t.domain} className={!t.dns_resolves ? 'opacity-50' : ''}>
                  <td className="px-5 py-2.5">
                    <div className="text-gray-300">{t.app_name || t.domain}</div>
                    <div className="text-[11px] text-gray-600">{t.domain}</div>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <TagDot active={!!t.has_gtm} id={t.gtm_id} dns={!!t.dns_resolves} />
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <TagDot active={!!t.has_ga4} id={t.ga4_id} dns={!!t.dns_resolves} />
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <TagDot active={!!t.has_meta} id={t.meta_id} dns={!!t.dns_resolves} />
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <TagDot active={!!t.has_gads} id={t.gads_id} dns={!!t.dns_resolves} />
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <TagDot active={!!t.has_gsc_verify} dns={!!t.dns_resolves} />
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    {!t.dns_resolves ? (
                      <span className="text-[10px] text-red-400/60">DNS</span>
                    ) : t.cf_zone_id ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title={t.cf_zone_id} />
                    ) : (
                      <span className="text-[10px] text-gray-600">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key IDs */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Key IDs & Configuration</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <ConfigRow label="GTM Container" value="GTM-NPTXDRDH" />
            <ConfigRow label="GA4 Measurement ID" value="G-B7SYY8F9XY" />
            <ConfigRow label="GA4 Property ID" value="530518943" />
            <ConfigRow label="Meta Pixel ID" value="1762011307420822" />
            <ConfigRow label="Google Ads Account" value="834-831-7464" />
            <ConfigRow label="Google Ads Conversion ID" value="198296860" />
            <ConfigRow label="Cookie Consent" value="GTM Consent Mode v2" />
            <ConfigRow label="Plausible" value="Active (no consent needed)" />
          </div>
        </div>
      </div>

      {/* Audience Building */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Audience Building</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AudienceCard
              platform="Meta"
              status="Building"
              detail="Pixel active. Audiences build passively. Min 100 for remarketing, 1,000 for Lookalikes."
            />
            <AudienceCard
              platform="Google Ads"
              status="Building"
              detail="Remarketing tag active. Min 1,000 for Search remarketing, 100 for Display."
            />
            <AudienceCard
              platform="GA4"
              status="Collecting"
              detail="Cross-domain tracking across tagged domains. Google Signals enabled. 14-month retention."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Traffic Tab ───────────────────────────────────── */

function TrafficTab({
  analytics,
  summary,
  tracking,
}: {
  analytics: Record<string, DayRow[]>;
  summary: { week: Summary; month: Summary } | null;
  tracking: TrackingRow[];
}) {
  const domains = tracking.map(t => t.domain);
  const hasCfZone = new Set(tracking.filter(t => t.cf_zone_id).map(t => t.domain));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard label="Pageviews (7d)" value={fmt(summary.week.pageviews)} />
          <SummaryCard label="Unique Visitors (7d)" value={fmt(summary.week.uniques)} />
          <SummaryCard label="Requests (7d)" value={fmt(summary.week.requests)} />
          <SummaryCard label="Bandwidth (7d)" value={fmtBytes(summary.week.bandwidth_bytes)} />
        </div>
      )}

      {/* Per-domain traffic */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Traffic by Domain (Last 7 Days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-600 border-b border-gray-800/30">
                <th className="px-5 py-2 text-left">Domain</th>
                <th className="px-3 py-2 text-right">Pageviews</th>
                <th className="px-3 py-2 text-right">Uniques</th>
                <th className="px-3 py-2 text-right">Requests</th>
                <th className="px-3 py-2 text-right">Bandwidth</th>
                <th className="px-3 py-2 text-right w-24">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/20">
              {domains.map((domain) => {
                const days = analytics[domain] || [];
                const totals = days.reduce(
                  (acc, d) => ({
                    pv: acc.pv + d.pageviews,
                    u: acc.u + d.uniques,
                    r: acc.r + d.requests,
                    b: acc.b + d.bandwidth_bytes,
                  }),
                  { pv: 0, u: 0, r: 0, b: 0 }
                );
                const sparkData = days.map(d => d.requests);
                const hasZone = hasCfZone.has(domain);

                return (
                  <tr key={domain}>
                    <td className="px-5 py-2.5">
                      <span className="text-gray-300">{domain}</span>
                      {!hasZone && (
                        <span className="ml-2 text-[10px] text-gray-600 bg-gray-800/50 px-1.5 py-0.5 rounded">
                          No CF zone
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-400 font-mono text-xs">
                      {hasZone ? fmt(totals.pv) : '--'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-400 font-mono text-xs">
                      {hasZone ? fmt(totals.u) : '--'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-400 font-mono text-xs">
                      {hasZone ? fmt(totals.r) : '--'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-400 font-mono text-xs">
                      {hasZone ? fmtBytes(totals.b) : '--'}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {sparkData.length > 1 ? (
                        <Sparkline data={sparkData} width={80} height={20} />
                      ) : (
                        <span className="text-gray-700 text-xs">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30-day summary */}
      {summary && summary.month.requests > 0 && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-3">30-Day Totals</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-white">{fmt(summary.month.pageviews)}</div>
              <div className="text-[10px] text-gray-500 uppercase">Pageviews</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{fmt(summary.month.uniques)}</div>
              <div className="text-[10px] text-gray-500 uppercase">Uniques</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{fmt(summary.month.requests)}</div>
              <div className="text-[10px] text-gray-500 uppercase">Requests</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{fmtBytes(summary.month.bandwidth_bytes)}</div>
              <div className="text-[10px] text-gray-500 uppercase">Bandwidth</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Components ────────────────────────────────────── */

function TagDot({ active, id, dns = true }: { active: boolean; id?: string | null; dns?: boolean }) {
  if (!dns) return <span className="w-2 h-2 rounded-full bg-gray-700 inline-block" title="DNS not resolving" />;
  return (
    <span
      className={`w-2 h-2 rounded-full inline-block ${active ? 'bg-emerald-500' : 'bg-red-500/60'}`}
      title={id || (active ? 'Detected' : 'Not found')}
    />
  );
}

function QuickLink({ label, detail, url, color }: { label: string; detail: string; url: string; color: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3 hover:border-gray-700 transition-colors group"
    >
      <div className={`text-[11px] font-medium uppercase tracking-wider ${color}`}>{label}</div>
      <div className="text-sm text-gray-400 group-hover:text-gray-200 mt-1">{detail}</div>
    </a>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-500">{label}</span>
      <code className="text-gray-300 font-mono text-xs">{value}</code>
    </div>
  );
}

function AudienceCard({ platform, status, detail }: { platform: string; status: string; detail: string }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{platform}</span>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{status}</span>
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed">{detail}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-semibold text-white mt-1">{value}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-800/50 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-800/30 rounded animate-pulse mt-2" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-800/30 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-gray-800/20 rounded-xl animate-pulse" />
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────── */

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + ' GB';
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

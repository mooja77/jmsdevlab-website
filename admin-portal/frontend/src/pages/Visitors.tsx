import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Sparkline from '../components/ui/Sparkline';
import BarChart from '../components/ui/BarChart';
import PieRing from '../components/ui/PieRing';
import DomainFilter from '../components/ui/DomainFilter';

/* ── Types ─────────────────────────────────────────── */

interface TrackingRow {
  domain: string; app_name: string | null; app_id: string | null;
  has_gtm: number; gtm_id: string | null; has_ga4: number; ga4_id: string | null;
  has_meta: number; meta_id: string | null; has_gads: number; gads_id: string | null;
  has_gsc_verify: number; cf_zone_id: string | null; dns_resolves: number; checked_at: string;
}
interface DayRow { domain: string; date: string; pageviews: number; visits: number; uniques: number; requests: number; bandwidth_bytes: number; }
interface SummaryData { pageviews: number; uniques: number; requests: number; bandwidth_bytes: number; }

/* ── Constants ─────────────────────────────────────── */

const LINKS = {
  ga4: 'https://analytics.google.com/analytics/web/#/p530518943/reports/intelligenthome',
  gsc: 'https://search.google.com/search-console?resource_id=https://jmsdevlab.com/',
  gtm: 'https://tagmanager.google.com/#/container/accounts/6346991669/containers/247784426/workspaces/5',
  meta: 'https://business.facebook.com/latest/insights',
  cloudflare: 'https://dash.cloudflare.com/fe8383fe03ab5000c8fc4b13e4e2f0a8/web-analytics',
  plausible: 'https://plausible.io/jmsdevlab.com',
};

const CHANNEL_COLORS: Record<string, string> = {
  search: '#3b82f6', direct: '#8b5cf6', social: '#f59e0b', referral: '#10b981', paid: '#ef4444',
};

type Tab = 'overview' | 'traffic' | 'sources' | 'pages' | 'geo' | 'tech' | 'errors';

/* ── Page ──────────────────────────────────────────── */

export default function Visitors() {
  const [tab, setTab] = useState<Tab>('overview');
  const [tracking, setTracking] = useState<TrackingRow[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, DayRow[]>>({});
  const [summary, setSummary] = useState<{ week: SummaryData; month: SummaryData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [domain, setDomain] = useState('all');

  const domains = tracking.map(t => t.domain);

  useEffect(() => {
    Promise.all([
      api<{ tracking: TrackingRow[] }>('/api/visitors/tracking'),
      api<{ analytics: Record<string, DayRow[]> }>('/api/visitors/analytics?days=7'),
      api<{ week: SummaryData; month: SummaryData }>('/api/visitors/summary'),
    ]).then(([t, a, s]) => {
      setTracking(t.tracking || []);
      setAnalytics(a.analytics || {});
      setSummary(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function triggerSync() {
    setSyncing(true);
    try {
      await api('/api/visitors/sync', { method: 'POST' });
      const [t, a, s] = await Promise.all([
        api<{ tracking: TrackingRow[] }>('/api/visitors/tracking'),
        api<{ analytics: Record<string, DayRow[]> }>('/api/visitors/analytics?days=7'),
        api<{ week: SummaryData; month: SummaryData }>('/api/visitors/summary'),
      ]);
      setTracking(t.tracking || []); setAnalytics(a.analytics || {}); setSummary(s);
    } catch {} setSyncing(false);
  }

  if (loading) return <Skeleton />;

  const tabs: [Tab, string][] = [
    ['overview', 'Overview'], ['traffic', 'Traffic'], ['sources', 'Sources'],
    ['pages', 'Pages'], ['geo', 'Geography'], ['tech', 'Tech'], ['errors', 'Errors'],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Visitors & Analytics</h1>
          <p className="text-gray-400 mt-1 text-sm">Traffic sources, content performance, and audience insights across all properties.</p>
        </div>
        <div className="flex items-center gap-3">
          {tab !== 'overview' && tab !== 'traffic' && (
            <DomainFilter domains={domains} value={domain} onChange={setDomain} />
          )}
          <button onClick={triggerSync} disabled={syncing}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.1] transition-colors disabled:opacity-50">
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-900/50 border border-gray-800/50 rounded-xl p-1 overflow-x-auto">
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === key ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab tracking={tracking} />}
      {tab === 'traffic' && <TrafficTab analytics={analytics} summary={summary} tracking={tracking} />}
      {tab === 'sources' && <SourcesTab domain={domain} />}
      {tab === 'pages' && <PagesTab domain={domain} />}
      {tab === 'geo' && <GeoTab domain={domain} />}
      {tab === 'tech' && <TechTab domain={domain} />}
      {tab === 'errors' && <ErrorsTab domain={domain} />}
    </div>
  );
}

/* ── Overview Tab ──────────────────────────────────── */

function OverviewTab({ tracking }: { tracking: TrackingRow[] }) {
  const tagged = tracking.filter(t => t.has_gtm && t.has_ga4).length;
  const total = tracking.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <QuickLink label="Google Analytics 4" detail="GA4 — G-B7SYY8F9XY" url={LINKS.ga4} color="text-blue-400" />
        <QuickLink label="Search Console" detail="All properties" url={LINKS.gsc} color="text-emerald-400" />
        <QuickLink label="Tag Manager" detail="GTM-NPTXDRDH" url={LINKS.gtm} color="text-yellow-400" />
        <QuickLink label="Meta Business" detail="Pixel 1762011307420822" url={LINKS.meta} color="text-indigo-400" />
        <QuickLink label="Cloudflare Analytics" detail={`${total} domains`} url={LINKS.cloudflare} color="text-orange-400" />
        <QuickLink label="Plausible" detail="Privacy-first" url={LINKS.plausible} color="text-purple-400" />
      </div>

      <Panel title={`Tracking Status — ${tagged}/${total} fully tagged`}
        right={tracking[0]?.checked_at && <span className="text-[10px] text-gray-600">Updated {new Date(tracking[0].checked_at + 'Z').toLocaleString()}</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-600 border-b border-gray-800/30">
                <th className="px-5 py-2 text-left">Domain</th>
                {['GTM','GA4','Meta','Ads','GSC','CF Zone'].map(h => <th key={h} className="px-2 py-2 text-center">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/20">
              {tracking.map(t => (
                <tr key={t.domain} className={!t.dns_resolves ? 'opacity-50' : ''}>
                  <td className="px-5 py-2.5"><div className="text-gray-300">{t.app_name || t.domain}</div><div className="text-[11px] text-gray-600">{t.domain}</div></td>
                  <td className="px-2 py-2.5 text-center"><Dot active={!!t.has_gtm} id={t.gtm_id} dns={!!t.dns_resolves} /></td>
                  <td className="px-2 py-2.5 text-center"><Dot active={!!t.has_ga4} id={t.ga4_id} dns={!!t.dns_resolves} /></td>
                  <td className="px-2 py-2.5 text-center"><Dot active={!!t.has_meta} id={t.meta_id} dns={!!t.dns_resolves} /></td>
                  <td className="px-2 py-2.5 text-center"><Dot active={!!t.has_gads} id={t.gads_id} dns={!!t.dns_resolves} /></td>
                  <td className="px-2 py-2.5 text-center"><Dot active={!!t.has_gsc_verify} dns={!!t.dns_resolves} /></td>
                  <td className="px-2 py-2.5 text-center">
                    {!t.dns_resolves ? <span className="text-[10px] text-red-400/60">DNS</span>
                      : t.cf_zone_id ? <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      : <span className="text-[10px] text-gray-600">--</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Key IDs & Configuration">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm p-5">
          {[['GTM Container','GTM-NPTXDRDH'],['GA4 Measurement ID','G-B7SYY8F9XY'],['GA4 Property ID','530518943'],
            ['Meta Pixel ID','1762011307420822'],['Google Ads Account','834-831-7464'],['Google Ads Conversion ID','198296860'],
            ['Cookie Consent','GTM Consent Mode v2'],['Plausible','Active (no consent needed)']].map(([l,v]) => (
            <div key={l} className="flex items-center justify-between py-1">
              <span className="text-gray-500">{l}</span><code className="text-gray-300 font-mono text-xs">{v}</code>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ── Traffic Tab ───────────────────────────────────── */

function TrafficTab({ analytics, summary, tracking }: { analytics: Record<string, DayRow[]>; summary: { week: SummaryData; month: SummaryData } | null; tracking: TrackingRow[] }) {
  const domains = tracking.map(t => t.domain);
  const hasCf = new Set(tracking.filter(t => t.cf_zone_id).map(t => t.domain));

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card label="Pageviews (7d)" value={fmt(summary.week.pageviews)} />
          <Card label="Unique Visitors (7d)" value={fmt(summary.week.uniques)} />
          <Card label="Requests (7d)" value={fmt(summary.week.requests)} />
          <Card label="Bandwidth (7d)" value={fmtBytes(summary.week.bandwidth_bytes)} />
        </div>
      )}

      <Panel title="Traffic by Domain (Last 7 Days)">
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
              {domains.map(d => {
                const days = analytics[d] || [];
                const tot = days.reduce((a, r) => ({ pv: a.pv + r.pageviews, u: a.u + r.uniques, r: a.r + r.requests, b: a.b + r.bandwidth_bytes }), { pv: 0, u: 0, r: 0, b: 0 });
                const zone = hasCf.has(d);
                return (
                  <tr key={d}>
                    <td className="px-5 py-2.5"><span className="text-gray-300">{d}</span>
                      {!zone && <span className="ml-2 text-[10px] text-gray-600 bg-gray-800/50 px-1.5 py-0.5 rounded">No CF zone</span>}</td>
                    <td className="px-3 py-2.5 text-right text-gray-400 font-mono text-xs">{zone ? fmt(tot.pv) : '--'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-400 font-mono text-xs">{zone ? fmt(tot.u) : '--'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-400 font-mono text-xs">{zone ? fmt(tot.r) : '--'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-400 font-mono text-xs">{zone ? fmtBytes(tot.b) : '--'}</td>
                    <td className="px-3 py-2.5 text-right">
                      {days.length > 1 ? <Sparkline data={days.map(x => x.requests)} width={80} height={20} /> : <span className="text-gray-700 text-xs">--</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {summary && summary.month.requests > 0 && (
        <Panel title="30-Day Totals">
          <div className="grid grid-cols-4 gap-4 text-center p-5">
            <div><div className="text-lg font-semibold text-white">{fmt(summary.month.pageviews)}</div><div className="text-[10px] text-gray-500 uppercase">Pageviews</div></div>
            <div><div className="text-lg font-semibold text-white">{fmt(summary.month.uniques)}</div><div className="text-[10px] text-gray-500 uppercase">Uniques</div></div>
            <div><div className="text-lg font-semibold text-white">{fmt(summary.month.requests)}</div><div className="text-[10px] text-gray-500 uppercase">Requests</div></div>
            <div><div className="text-lg font-semibold text-white">{fmtBytes(summary.month.bandwidth_bytes)}</div><div className="text-[10px] text-gray-500 uppercase">Bandwidth</div></div>
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ── Sources Tab ──────────────────────────────────── */

function SourcesTab({ domain: _domain }: { domain: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-5 py-4">
        <h3 className="text-sm font-medium text-blue-300 mb-2">Traffic Source Data</h3>
        <p className="text-sm text-blue-300/80">
          Referrer breakdown (which sites send you traffic) requires Cloudflare Business or Enterprise plan.
          For detailed source/medium/campaign data, use Google Analytics 4 which tracks this through GTM.
        </p>
        <div className="mt-3 flex gap-3">
          <a href={LINKS.ga4} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors">
            Open GA4 (Acquisition Report)
          </a>
          <a href={LINKS.gsc} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors">
            Open Search Console
          </a>
        </div>
      </div>

      <Panel title="What You Can Track Now">
        <div className="p-5 space-y-3 text-sm text-gray-400">
          <div className="flex items-start gap-3">
            <span className="text-emerald-400 mt-0.5">GA4</span>
            <span>Full acquisition data — organic, social, referral, paid channels with session tracking. Use Acquisition &gt; Traffic Acquisition report.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 mt-0.5">GSC</span>
            <span>Search queries, impressions, clicks, CTR, average position. Shows exactly what Google searches bring people to your sites.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 mt-0.5">Meta</span>
            <span>Facebook/Instagram pixel data — ad performance, audience building progress, conversions.</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-orange-400 mt-0.5">CF</span>
            <span>Pages, geography, devices, browsers, and error monitoring are available here (see other tabs).</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ── Pages Tab ────────────────────────────────────── */

function PagesTab({ domain }: { domain: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<any>(`/api/visitors/pages?days=7&domain=${domain}`)
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [domain]);

  if (loading) return <TabLoading />;
  if (!data?.pages?.length) return <NoData />;

  const pages = data.pages as Array<{ path: string; domain: string; reqs: number; bytes: number }>;

  // Group by content type
  const groups: Record<string, number> = {};
  for (const p of pages) {
    const type = p.path.startsWith('/blog') ? 'Blog' : p.path.startsWith('/tool') ? 'Tools'
      : p.path === '/' ? 'Homepage' : p.path.includes('pricing') ? 'Pricing'
      : p.path.includes('sign') ? 'Signup/Login' : 'Other';
    groups[type] = (groups[type] || 0) + p.reqs;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Top Pages">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-gray-600 border-b border-gray-800/30">
                  <th className="px-5 py-2 text-left">Path</th>
                  <th className="px-3 py-2 text-left">Domain</th>
                  <th className="px-3 py-2 text-right">Requests</th>
                  <th className="px-3 py-2 text-right">Bandwidth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/20">
                {pages.slice(0, 20).map((p, i) => (
                  <tr key={i}>
                    <td className="px-5 py-2 text-gray-300 font-mono text-xs truncate max-w-[200px]" title={p.path}>{p.path}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{p.domain}</td>
                    <td className="px-3 py-2 text-right text-gray-400 font-mono text-xs">{fmt(p.reqs)}</td>
                    <td className="px-3 py-2 text-right text-gray-400 font-mono text-xs">{fmtBytes(p.bytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Content Type Breakdown">
          <div className="p-5">
            <BarChart data={Object.entries(groups).sort((a, b) => b[1] - a[1]).map(([l, v]) => ({ label: l, value: v }))} color="#10b981" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ── Geography Tab ────────────────────────────────── */

function GeoTab({ domain }: { domain: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<any>(`/api/visitors/geo?days=7&domain=${domain}`)
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [domain]);

  if (loading) return <TabLoading />;
  if (!data?.countries?.length) return <NoData />;

  const countries = data.countries as Array<{ country: string; reqs: number; bytes: number }>;
  const total = countries.reduce((s, c) => s + c.reqs, 0);

  // Key markets — CF returns country codes, try both code and full name
  const keyMarkets = [{ label: 'Ireland', codes: ['IE', 'Ireland'] }, { label: 'United Kingdom', codes: ['GB', 'United Kingdom'] }, { label: 'United States', codes: ['US', 'United States'] }];
  const marketData = keyMarkets.map(m => {
    const c = countries.find(x => m.codes.includes(x.country));
    return { name: m.label, reqs: c?.reqs || 0, pct: total ? ((c?.reqs || 0) / total * 100).toFixed(1) : '0' };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {marketData.map(m => (
          <Card key={m.name} label={m.name} value={fmt(m.reqs)} sub={`${m.pct}%`} />
        ))}
      </div>

      <Panel title="All Countries">
        <div className="p-5">
          <BarChart data={countries.slice(0, 15).map(c => ({
            label: c.country, value: c.reqs,
            sub: total ? ((c.reqs / total) * 100).toFixed(0) + '%' : '',
          }))} color="#f59e0b" />
        </div>
      </Panel>
    </div>
  );
}

/* ── Tech Tab ─────────────────────────────────────── */

function TechTab({ domain }: { domain: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<any>(`/api/visitors/tech?days=7&domain=${domain}`)
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [domain]);

  if (loading) return <TabLoading />;
  if (!data?.devices?.length && !data?.browsers?.length) return <NoData />;

  const deviceColors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
  const browserColors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#6366f1'];

  const devices = (data.devices || []) as Array<{ device: string; reqs: number }>;
  const browsers = (data.browsers || []) as Array<{ browser: string; reqs: number }>;
  const totalDev = devices.reduce((s, d) => s + d.reqs, 0);
  const mobile = devices.find(d => d.device?.toLowerCase() === 'mobile');
  const mobilePct = totalDev ? ((mobile?.reqs || 0) / totalDev * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Devices">
          <div className="p-5 flex justify-center">
            <PieRing data={devices.map((d, i) => ({ label: d.device || 'Unknown', value: d.reqs, color: deviceColors[i] }))} size={160} />
          </div>
        </Panel>
        <Panel title="Browsers">
          <div className="p-5 flex justify-center">
            <PieRing data={browsers.map((b, i) => ({ label: b.browser || 'Unknown', value: b.reqs, color: browserColors[i] }))} size={160} />
          </div>
        </Panel>
      </div>

      {totalDev > 0 && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-5 py-4 text-sm text-blue-300">
          {parseInt(mobilePct) > 40
            ? `${mobilePct}% of visitors use mobile. Make sure all pages are fully responsive and fast on mobile.`
            : `${mobilePct}% of visitors use mobile. Desktop dominates — focus on desktop experience but keep mobile working.`}
        </div>
      )}
    </div>
  );
}

/* ── Errors Tab ───────────────────────────────────── */

function ErrorsTab({ domain }: { domain: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<any>(`/api/visitors/errors?days=7&domain=${domain}`)
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [domain]);

  if (loading) return <TabLoading />;

  const errors = (data?.errors || []) as Array<{ status_code: string; domain: string; reqs: number }>;
  const fourxx = errors.filter(e => e.status_code.startsWith('4')).reduce((s, e) => s + e.reqs, 0);
  const fivexx = errors.filter(e => e.status_code.startsWith('5')).reduce((s, e) => s + e.reqs, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Card label="4xx Errors (7d)" value={fmt(fourxx)} accent="#f59e0b" />
        <Card label="5xx Errors (7d)" value={fmt(fivexx)} accent="#ef4444" />
        <Card label="Error Rate" value={`${data?.errorRate || '0'}%`} />
      </div>

      {errors.length > 0 ? (
        <Panel title="Error Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-gray-600 border-b border-gray-800/30">
                  <th className="px-5 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Domain</th>
                  <th className="px-3 py-2 text-right">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/20">
                {errors.map((e, i) => (
                  <tr key={i}>
                    <td className="px-5 py-2">
                      <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                        e.status_code.startsWith('5') ? 'bg-red-500/10 text-red-400'
                        : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {e.status_code}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-400 text-xs">{e.domain}</td>
                    <td className="px-3 py-2 text-right text-gray-400 font-mono text-xs">{fmt(e.reqs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-5 py-4 text-sm text-emerald-300">
          No HTTP errors detected in the last 7 days. All sites returning healthy responses.
        </div>
      )}

      {fivexx > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-red-300">
          Server errors detected ({fivexx} requests). Check the affected domains for application issues.
        </div>
      )}
    </div>
  );
}

/* ── Shared Components ────────────────────────────── */

function Dot({ active, id, dns = true }: { active: boolean; id?: string | null; dns?: boolean }) {
  if (!dns) return <span className="w-2 h-2 rounded-full bg-gray-700 inline-block" title="DNS not resolving" />;
  return <span className={`w-2 h-2 rounded-full inline-block ${active ? 'bg-emerald-500' : 'bg-red-500/60'}`} title={id || (active ? 'Detected' : 'Not found')} />;
}

function QuickLink({ label, detail, url, color }: { label: string; detail: string; url: string; color: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3 hover:border-gray-700 transition-colors group">
      <div className={`text-[11px] font-medium uppercase tracking-wider ${color}`}>{label}</div>
      <div className="text-sm text-gray-400 group-hover:text-gray-200 mt-1">{detail}</div>
    </a>
  );
}

function Panel({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function Card({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-xl font-semibold text-white" style={accent ? { color: accent } : {}}>{value}</span>
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div><div className="h-8 w-64 bg-gray-800/50 rounded animate-pulse" /><div className="h-4 w-96 bg-gray-800/30 rounded animate-pulse mt-2" /></div>
      <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-800/30 rounded-xl animate-pulse" />)}</div>
      <div className="h-96 bg-gray-800/20 rounded-xl animate-pulse" />
    </div>
  );
}

function TabLoading() {
  return <div className="flex items-center justify-center py-20"><div className="text-gray-500 text-sm">Loading data...</div></div>;
}

function NoData() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <p className="text-sm">No dimensional data yet.</p>
      <p className="text-xs mt-1">Click "Sync Now" to pull analytics, or wait for the next 30-min cron run.</p>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────── */

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtBytes(b: number): string {
  if (b >= 1_073_741_824) return (b / 1_073_741_824).toFixed(1) + ' GB';
  if (b >= 1_048_576) return (b / 1_048_576).toFixed(1) + ' MB';
  if (b >= 1024) return (b / 1024).toFixed(1) + ' KB';
  return b + ' B';
}

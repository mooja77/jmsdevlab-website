import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface FunnelData {
  stages: Record<string, number>;
  conversions: Record<string, string>;
}

interface HealthSummary {
  champions: number;
  healthy: number;
  atRisk: number;
  churning: number;
  new: number;
}

interface RevenueEvent {
  id: number;
  event_type: string;
  customer_email: string;
  customer_name: string;
  amount: number;
  currency: string;
  plan_name: string;
  created_at: string;
}

interface TrackingRow {
  domain: string;
  has_gtm: number;
  ga4_id: string;
  has_meta: number;
  has_gads: number;
  has_gsc_verify: number;
}

const EVENT_LABELS: Record<string, string> = {
  'customer.subscription.created': 'New Subscription',
  'customer.subscription.updated': 'Subscription Updated',
  'customer.subscription.deleted': 'Subscription Cancelled',
  'invoice.payment_succeeded': 'Payment Received',
  'charge.succeeded': 'Charge Succeeded',
  'charge.refunded': 'Refund Issued',
};

const EVENT_COLORS: Record<string, string> = {
  'customer.subscription.created': 'text-emerald-400',
  'invoice.payment_succeeded': 'text-emerald-400',
  'charge.succeeded': 'text-emerald-400',
  'customer.subscription.deleted': 'text-red-400',
  'charge.refunded': 'text-amber-400',
  'customer.subscription.updated': 'text-blue-400',
};

export default function Conversions() {
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [health, setHealth] = useState<{ summary: HealthSummary } | null>(null);
  const [events, setEvents] = useState<RevenueEvent[]>([]);
  const [tracking, setTracking] = useState<TrackingRow[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<FunnelData>('/api/funnel').then(setFunnel).catch(() => {}),
      api<{ summary: HealthSummary }>('/api/health-scores').then(setHealth).catch(() => {}),
      api<{ events: RevenueEvent[] }>('/api/revenue/events').then(d => setEvents(d.events || [])).catch(() => {}),
      api<{ tracking: TrackingRow[] }>('/api/visitors/tracking').then(d => setTracking(d.tracking || [])).catch(() => {}),
      api<any>('/api/aggregate/revenue').then(setRevenue).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-sm">Loading conversions...</div>;

  const stages = funnel?.stages || {};
  const conv = funnel?.conversions || {};
  const revSummary = revenue?.summary || {};
  const apps = revenue?.apps || [];

  // Funnel visualization data
  const funnelStages = [
    { key: 'lead', label: 'Leads', count: stages.lead || 0, color: 'bg-blue-500' },
    { key: 'signup', label: 'Sign-ups', count: stages.signup || 0, color: 'bg-indigo-500' },
    { key: 'trial', label: 'Trials', count: stages.trial || 0, color: 'bg-violet-500' },
    { key: 'paid', label: 'Paid', count: stages.paid || 0, color: 'bg-emerald-500' },
  ];
  const maxCount = Math.max(...funnelStages.map(s => s.count), 1);

  // Tracking coverage
  const domainsWithGTM = tracking.filter(t => t.has_gtm).length;
  const domainsWithGA4 = tracking.filter(t => t.ga4_id).length;
  const domainsWithMeta = tracking.filter(t => t.has_meta).length;
  const domainsWithGSC = tracking.filter(t => t.has_gsc_verify).length;
  const totalDomains = tracking.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Conversions</h1>
        <p className="text-sm text-gray-400 mt-1">Funnel performance, revenue events, and tracking coverage</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="MRR" value={`$${(revSummary.totalMrr || 0).toFixed(2)}`} accent />
        <KPICard label="Paying Users" value={revSummary.totalPaying || 0} />
        <KPICard label="Trial Users" value={revSummary.totalTrials || 0} />
        <KPICard label="Total Leads" value={stages.lead || 0} />
        <KPICard label="Lead → Paid" value={conv.trialToPaid || '0%'} sub="trial conversion" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white mb-4">Conversion Funnel</h2>
          <div className="space-y-3">
            {funnelStages.map((stage, i) => (
              <div key={stage.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{stage.label}</span>
                  <span className="text-sm font-mono text-gray-400">{stage.count}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`${stage.color} h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max((stage.count / maxCount) * 100, 4)}%` }}
                  >
                    {stage.count > 0 && (
                      <span className="text-[10px] font-medium text-white/80">
                        {stage.count}
                      </span>
                    )}
                  </div>
                </div>
                {i < funnelStages.length - 1 && (
                  <div className="flex justify-center my-1">
                    <span className="text-[10px] text-gray-600">
                      {i === 0 ? conv.leadToSignup : i === 1 ? conv.signupToTrial : conv.trialToPaid}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {stages.churned ? (
            <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center justify-between">
              <span className="text-sm text-gray-500">Churned</span>
              <span className="text-sm font-mono text-red-400">{stages.churned}</span>
            </div>
          ) : null}
        </div>

        {/* Customer Health */}
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white mb-4">Customer Health</h2>
          {health?.summary ? (
            <div className="space-y-3">
              <HealthBar label="Champions" count={health.summary.champions} color="bg-emerald-500" icon="★" />
              <HealthBar label="Healthy" count={health.summary.healthy} color="bg-green-500" icon="●" />
              <HealthBar label="New" count={health.summary.new} color="bg-blue-500" icon="◆" />
              <HealthBar label="At Risk" count={health.summary.atRisk} color="bg-amber-500" icon="▲" />
              <HealthBar label="Churning" count={health.summary.churning} color="bg-red-500" icon="!" />
            </div>
          ) : (
            <p className="text-sm text-gray-600">No customer health data yet.</p>
          )}

          {/* Tracking Coverage */}
          <div className="mt-6 pt-4 border-t border-gray-800/50">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tracking Coverage</h3>
            <div className="grid grid-cols-2 gap-2">
              <CoverageItem label="GTM" count={domainsWithGTM} total={totalDomains} />
              <CoverageItem label="GA4" count={domainsWithGA4} total={totalDomains} />
              <CoverageItem label="Meta Pixel" count={domainsWithMeta} total={totalDomains} />
              <CoverageItem label="Search Console" count={domainsWithGSC} total={totalDomains} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue per App */}
      {apps.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white mb-4">Revenue by App</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left text-xs uppercase tracking-wider">
                  <th className="pb-2 pr-4">App</th>
                  <th className="pb-2 pr-4 text-right">MRR</th>
                  <th className="pb-2 pr-4 text-right">Paying</th>
                  <th className="pb-2 pr-4 text-right">Trials</th>
                  <th className="pb-2 text-right">Churn</th>
                </tr>
              </thead>
              <tbody>
                {apps.filter((a: any) => a.mrr > 0 || a.paying > 0 || a.trials > 0).map((app: any) => (
                  <tr key={app.name} className="border-t border-gray-800/30">
                    <td className="py-2 pr-4 text-gray-300">{app.name}</td>
                    <td className="py-2 pr-4 text-right font-mono text-emerald-400">${(app.mrr || 0).toFixed(2)}</td>
                    <td className="py-2 pr-4 text-right text-gray-400">{app.paying || 0}</td>
                    <td className="py-2 pr-4 text-right text-gray-400">{app.trials || 0}</td>
                    <td className="py-2 text-right text-gray-500">{app.churn ? `${app.churn}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Tracking Status */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-1">GA4 Event Tracking</h2>
        <p className="text-xs text-gray-600 mb-4">Events configured via gtag() across all apps</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 text-left uppercase tracking-wider">
                <th className="pb-2 pr-3">Event</th>
                <th className="pb-2 pr-3">SmartCash</th>
                <th className="pb-2 pr-3">ProfitShield</th>
                <th className="pb-2 pr-3">TaxMatch</th>
                <th className="pb-2 pr-3">SpamShield</th>
                <th className="pb-2 pr-3">ThemeSweep</th>
                <th className="pb-2 pr-3">StaffHub</th>
                <th className="pb-2 pr-3">QualCanvas</th>
                <th className="pb-2 pr-3">GrowthMap</th>
                <th className="pb-2">PitchSide</th>
              </tr>
            </thead>
            <tbody>
              {[
                { event: 'sign_up', apps: [1,1,1,1,1,1,1,1,1] },
                { event: 'login', apps: [1,1,1,1,1,1,1,1,1] },
                { event: 'pricing_viewed', apps: [0,1,1,0,0,0,0,0,0] },
                { event: 'purchase', apps: [0,0,0,0,0,0,0,0,0] },
                { event: 'generate_lead', apps: [0,0,0,0,0,0,0,0,0] },
              ].map(row => (
                <tr key={row.event} className="border-t border-gray-800/30">
                  <td className="py-1.5 pr-3 text-gray-300 font-mono">{row.event}</td>
                  {row.apps.map((v, i) => (
                    <td key={i} className="py-1.5 pr-3 text-center">
                      {v ? <span className="text-emerald-400">✓</span> : <span className="text-gray-700">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Revenue Events */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Recent Revenue Events</h2>
        {events.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {events.slice(0, 20).map(ev => (
              <div key={ev.id} className="flex items-center justify-between py-2 border-b border-gray-800/30 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-medium ${EVENT_COLORS[ev.event_type] || 'text-gray-400'}`}>
                    {EVENT_LABELS[ev.event_type] || ev.event_type}
                  </span>
                  <span className="text-sm text-gray-300 truncate">
                    {ev.customer_name || ev.customer_email}
                  </span>
                  {ev.plan_name && (
                    <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                      {ev.plan_name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {ev.amount > 0 && (
                    <span className="text-sm font-mono text-emerald-400">
                      ${(ev.amount / 100).toFixed(2)}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-600">
                    {new Date(ev.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No revenue events recorded yet. Events will appear when Stripe webhooks fire.</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-3">Analytics Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'GA4 Dashboard', url: 'https://analytics.google.com/analytics/web/#/p530518943/reports/dashboard' },
            { label: 'GA4 Events', url: 'https://analytics.google.com/analytics/web/#/p530518943/reports/explorer?params=_u..nav%3Dmaui&r=lifecycle-engagement-events' },
            { label: 'Google Ads', url: 'https://ads.google.com/aw/overview' },
            { label: 'GTM Container', url: 'https://tagmanager.google.com/#/container/accounts/6304306386/containers/111037282/workspaces' },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs text-gray-400 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors text-center"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, accent, sub }: { label: string; value: string | number; accent?: boolean; sub?: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-semibold mt-1 ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function HealthBar({ label, count, color, icon }: { label: string; count: number; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-4 text-center">{icon}</span>
      <span className="text-sm text-gray-300 w-24">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: count > 0 ? `${Math.max(count * 20, 8)}%` : '0%' }} />
      </div>
      <span className="text-sm font-mono text-gray-400 w-6 text-right">{count}</span>
    </div>
  );
}

function CoverageItem({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between px-2 py-1.5 bg-gray-800/30 rounded-lg">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs font-mono ${pct === 100 ? 'text-emerald-400' : pct > 50 ? 'text-amber-400' : 'text-red-400'}`}>
        {count}/{total}
      </span>
    </div>
  );
}

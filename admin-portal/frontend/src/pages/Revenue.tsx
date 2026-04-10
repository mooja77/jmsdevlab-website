import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Icon from '../components/ui/Icon';

export default function Revenue() {
  const [data, setData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/aggregate/revenue').then(setData),
      api<{ events: any[] }>('/api/revenue/events').then(d => setEvents(d.events || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading revenue...</div>;

  const summary = data?.summary || { totalMrr: 0, totalArr: 0, totalPaying: 0, totalTrials: 0 };
  const apps = data?.apps || [];

  // Milestone progress
  const milestoneTargets = [100, 500, 1000, 5000];
  const currentTarget = milestoneTargets.find(t => summary.totalMrr < t) || milestoneTargets[milestoneTargets.length - 1];
  const progress = Math.min((summary.totalMrr / currentTarget) * 100, 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Revenue</h1>
        <p className="text-sm text-gray-400 mt-1">Stripe source of truth (test accounts excluded)</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RevenueCard label="MRR" value={`$${summary.totalMrr.toFixed(2)}`} accent />
        <RevenueCard label="ARR" value={`$${summary.totalArr.toFixed(2)}`} />
        <RevenueCard label="Paying Users" value={summary.totalPaying} />
        <RevenueCard label="Trial Users" value={summary.totalTrials} />
      </div>

      {/* MRR Milestone Progress */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="trophy" className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-medium text-white">Next Milestone: ${currentTarget} MRR</h2>
          </div>
          <span className="text-sm text-gray-400 tabular-nums">${summary.totalMrr.toFixed(0)} / ${currentTarget}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-600 mt-2">{progress.toFixed(0)}% of the way there</p>
      </div>

      {/* Revenue Events Timeline */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Revenue Events</h2>
        </div>
        {events.length > 0 ? (
          <div className="divide-y divide-gray-800/20">
            {events.slice(0, 20).map((e: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  e.event_type.includes('succeeded') || e.event_type.includes('created') ? 'bg-emerald-400' :
                  e.event_type.includes('deleted') || e.event_type.includes('refunded') ? 'bg-red-400' : 'bg-amber-400'
                }`} />
                <span className="text-xs text-gray-500 w-32">{e.event_type.replace('customer.subscription.', '').replace('invoice.payment_', '')}</span>
                <span className="text-sm text-gray-300 flex-1">{e.customer_email || e.stripe_customer_id}</span>
                <span className="text-sm font-medium text-white tabular-nums">
                  {e.amount_cents > 0 ? `$${(e.amount_cents / 100).toFixed(2)}` : '-'}
                </span>
                <span className="text-[10px] text-gray-600">{e.created_at?.split('T')[0]}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500">No revenue events yet.</p>
            <p className="text-xs text-gray-600 mt-1">
              Events will appear here in real-time when customers subscribe via Stripe.
              {!summary.totalMrr && ' Register the Stripe webhook to enable this.'}
            </p>
          </div>
        )}
      </div>

      {/* Revenue Source */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-3">Revenue Source</h2>
        <p className="text-sm text-gray-400">
          All revenue data comes from <strong className="text-gray-300">Stripe</strong> (source of truth).
          {summary.totalMrr === 0 ? (
            <span> No active Stripe subscriptions currently. Revenue will appear here when real customers subscribe.</span>
          ) : (
            <span> Active subscriptions are generating ${summary.totalMrr.toFixed(2)}/month.</span>
          )}
        </p>
      </div>
    </div>
  );
}

function RevenueCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-semibold mt-1 tabular-nums ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/Icon';

interface Service {
  id: string;
  name: string;
  category: string;
  monthlyCost: number;
  currency: string;
  billingCycle: string;
  status: string;
  notes: string;
  dashboardUrl: string;
  lastInvoice?: string;
}

interface CostData {
  services: Service[];
  totalMonthlyUsd: number;
  totalAnnualUsd: number;
  byCategory: Record<string, { services: Service[]; total: number }>;
  paidCount: number;
  freeCount: number;
  trialCount: number;
  alerts: Array<{ service: string; message: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  infrastructure: 'Infrastructure & Hosting',
  ai: 'AI & APIs',
  tools: 'Developer Tools',
  marketing: 'Marketing & Analytics',
  domains: 'Domains & DNS',
};

const CATEGORY_ORDER = ['infrastructure', 'ai', 'tools', 'marketing', 'domains'];

const STATUS_COLORS: Record<string, string> = {
  active: 'healthy',
  trial: 'warning',
  free: 'unknown',
  cancelled: 'down',
};

export default function Costs() {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);

  const [mrr, setMrr] = useState(0);

  useEffect(() => {
    Promise.all([
      api<CostData>('/api/costs').then(setData),
      api<{ summary: { totalMrr: number } }>('/api/aggregate/revenue').then(d => setMrr(d.summary?.totalMrr || 0)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading costs...</div>;
  if (!data) return null;

  const currentMrr = mrr;
  const revenueGap = data.totalMonthlyUsd;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Costs</h1>
        <p className="text-sm text-gray-400 mt-1">Monthly business expenses across all services</p>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
              <Icon name="alert" className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">{alert.service}</p>
                <p className="text-xs text-gray-400 mt-0.5">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Monthly Burn</div>
          <div className="text-2xl font-semibold mt-1 text-red-400 tabular-nums">${data.totalMonthlyUsd}/mo</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Annual Cost</div>
          <div className="text-xl font-semibold mt-1 text-white tabular-nums">${data.totalAnnualUsd}/yr</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Paid Services</div>
          <div className="text-xl font-semibold mt-1 text-white tabular-nums">{data.paidCount}</div>
          <div className="text-[11px] text-gray-600 mt-0.5">+ {data.freeCount} free tier</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Break-Even MRR</div>
          <div className="text-xl font-semibold mt-1 text-amber-400 tabular-nums">${revenueGap}</div>
          <div className="text-[11px] text-gray-600 mt-0.5">MRR needed to cover costs</div>
        </div>
      </div>

      {/* Burn vs Revenue visualization */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white">Revenue vs Costs</h2>
          <span className="text-sm text-red-400 tabular-nums">-${(data.totalMonthlyUsd - currentMrr).toFixed(0)}/mo net</span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">MRR (Revenue)</span>
              <span className="text-xs text-emerald-400 tabular-nums">${currentMrr}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((currentMrr / data.totalMonthlyUsd) * 100, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Monthly Costs</span>
              <span className="text-xs text-red-400 tabular-nums">${data.totalMonthlyUsd}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
        <p className="text-[11px] text-gray-600 mt-3">
          Revenue covers {((currentMrr / data.totalMonthlyUsd) * 100).toFixed(0)}% of costs. Need ${data.totalMonthlyUsd - 98} more MRR to break even.
        </p>
      </div>

      {/* Services by Category */}
      {CATEGORY_ORDER.map(cat => {
        const group = data.byCategory[cat];
        if (!group) return null;
        return (
          <div key={cat} className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
              <h2 className="text-sm font-medium text-white">{CATEGORY_LABELS[cat] || cat}</h2>
              {group.total > 0 && (
                <span className="text-sm text-red-400 tabular-nums font-medium">${group.total}/mo</span>
              )}
            </div>
            <div className="divide-y divide-gray-800/30">
              {group.services.map(service => (
                <div key={service.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={service.dashboardUrl}
                        target="_blank"
                        rel="noopener"
                        className="text-sm text-gray-200 font-medium hover:text-indigo-400 transition-colors"
                      >
                        {service.name}
                      </a>
                      <Badge status={STATUS_COLORS[service.status] || 'unknown'} />
                      {service.status === 'trial' && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">TRIAL</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{service.notes}</p>
                  </div>
                  <div className="text-right flex-shrink-0 w-24">
                    {service.monthlyCost > 0 ? (
                      <p className="text-sm font-medium tabular-nums text-white">
                        {service.currency === 'EUR' ? 'EUR' : '$'}{service.monthlyCost}
                        <span className="text-gray-500 font-normal">/mo</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Free</p>
                    )}
                    {service.lastInvoice && (
                      <p className="text-[10px] text-gray-600 mt-0.5">{service.lastInvoice}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

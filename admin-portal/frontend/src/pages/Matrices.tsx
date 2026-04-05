import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Icon from '../components/ui/Icon';

interface AppScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  features: Record<string, 'yes' | 'partial' | 'no' | 'na'>;
}

interface MatrixData {
  criteria: string[];
  apps: AppScore[];
  shopify?: { criteria: string[]; apps: AppScore[] };
  blockers: Array<{ app: string; issue: string; type: string }>;
  security: Array<{ app: string; issue: string }>;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  yes: 'bg-emerald-500',
  partial: 'bg-amber-500',
  no: 'bg-red-500/70',
  na: 'bg-gray-700',
};

const STATUS_TEXT: Record<string, string> = {
  yes: 'text-emerald-400',
  partial: 'text-amber-400',
  no: 'text-red-400',
  na: 'text-gray-600',
};

export default function Matrices() {
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<MatrixData>('/api/matrices').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading matrices...</div>;
  if (!data) return null;

  const totalYes = data.apps.reduce((sum, app) => sum + Object.values(app.features).filter(v => v === 'yes').length, 0);
  const totalCells = data.apps.reduce((sum, app) => sum + Object.values(app.features).filter(v => v !== 'na').length, 0);
  const overallPercent = Math.round((totalYes / totalCells) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Feature Matrices</h1>
        <p className="text-sm text-gray-400 mt-1">18-point audit across all 12 apps. Updated {data.updatedAt}.</p>
      </div>

      {/* Overall progress */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Overall Coverage</div>
          <div className="text-2xl font-semibold mt-1 text-white tabular-nums">{overallPercent}%</div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${overallPercent}%` }} />
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Blockers</div>
          <div className="text-2xl font-semibold mt-1 text-red-400 tabular-nums">{data.blockers.length}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Security Issues</div>
          <div className="text-2xl font-semibold mt-1 text-amber-400 tabular-nums">{data.security.length}</div>
        </div>
      </div>

      {/* Blockers */}
      {data.blockers.length > 0 && (
        <div className="space-y-2">
          {data.blockers.map((b, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/20">
              <Icon name="alert" className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-white">{b.app}</span>
                <span className="text-sm text-gray-400 ml-2">{b.issue}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* App Score Cards */}
      <div>
        <h2 className="text-sm font-medium text-white mb-3">Audit Scores</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.apps.map(app => {
            const pct = Math.round((app.score / app.maxScore) * 100);
            const color = pct >= 90 ? 'text-emerald-400' : pct >= 70 ? 'text-amber-400' : 'text-red-400';
            const barColor = pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={app.id} className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-200">{app.name}</span>
                  <span className={`text-sm font-semibold tabular-nums ${color}`}>{app.score}/{app.maxScore}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                  <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Matrix Grid */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">18-Point Audit Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800/30">
                <th className="px-3 py-2 text-left text-gray-500 font-medium sticky left-0 bg-gray-900/90 min-w-[140px]">Criteria</th>
                {data.apps.map(app => (
                  <th key={app.id} className="px-2 py-2 text-center text-gray-400 font-medium min-w-[70px]">
                    <div className="truncate">{app.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.criteria.map(criterion => (
                <tr key={criterion} className="border-b border-gray-800/20 hover:bg-white/[0.02]">
                  <td className="px-3 py-1.5 text-gray-300 sticky left-0 bg-gray-900/90">{criterion}</td>
                  {data.apps.map(app => {
                    const status = app.features[criterion] || 'no';
                    return (
                      <td key={app.id} className="px-2 py-1.5 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} title={status} />
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t border-gray-800/50 font-medium">
                <td className="px-3 py-2 text-gray-200 sticky left-0 bg-gray-900/90">Score</td>
                {data.apps.map(app => (
                  <td key={app.id} className="px-2 py-2 text-center tabular-nums text-gray-300">
                    {app.score}/{app.maxScore}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Shopify Embedded Matrix */}
      {data.shopify && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800/50">
            <h2 className="text-sm font-medium text-white">Shopify Embedded App Readiness</h2>
            <p className="text-[11px] text-gray-500 mt-1">10 Shopify apps only. Only RepairDesk is currently listed on the App Store.</p>
          </div>

          {/* Shopify score cards */}
          <div className="px-5 py-4 border-b border-gray-800/30">
            <div className="flex gap-2 flex-wrap">
              {data.shopify.apps.map(app => {
                const pct = Math.round((app.score / app.maxScore) * 100);
                const color = pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';
                return (
                  <div key={app.id} className="bg-gray-800/30 rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-gray-300">{app.name}</span>
                    <span className={`ml-1.5 font-semibold tabular-nums ${color}`}>{app.score}/{app.maxScore}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800/30">
                  <th className="px-3 py-2 text-left text-gray-500 font-medium sticky left-0 bg-gray-900/90 min-w-[160px]">Feature</th>
                  {data.shopify.apps.map(app => (
                    <th key={app.id} className="px-2 py-2 text-center text-gray-400 font-medium min-w-[65px]">
                      <div className="truncate">{app.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.shopify.criteria.map(criterion => (
                  <tr key={criterion} className="border-b border-gray-800/20 hover:bg-white/[0.02]">
                    <td className="px-3 py-1.5 text-gray-300 sticky left-0 bg-gray-900/90">{criterion}</td>
                    {data.shopify?.apps.map(app => {
                      const status = app.features[criterion] || 'no';
                      return (
                        <td key={app.id} className="px-2 py-1.5 text-center">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} title={status} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Implemented</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Partial</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500/70" /> Missing</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-700" /> N/A</div>
      </div>

      {/* Security Issues */}
      {data.security.length > 0 && (
        <div className="bg-gray-900/50 border border-amber-500/20 rounded-xl p-5">
          <h2 className="text-sm font-medium text-amber-400 mb-3">Security — Credential Rotation Needed</h2>
          <div className="space-y-2">
            {data.security.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-gray-300 font-medium">{s.app}:</span>
                <span className="text-gray-400">{s.issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

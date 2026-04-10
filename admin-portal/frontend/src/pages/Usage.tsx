import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';

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

interface RealUser {
  email: string;
  name: string;
  app: string;
  appId: string;
  plan: string;
  createdAt: string;
  lastLogin: string;
  lastActive: string;
  sessionCount: number;
  totalActions: number;
  topFeatures: string[];
  usage: Record<string, number>;
}

interface UsageData {
  period: string;
  summary: {
    totalActiveUsers: number;
    totalSessions: number;
    totalActions: number;
    appsWithActivity: number;
    totalApps: number;
  };
  apps: AppUsage[];
  topFeatures: Array<{ app: string; feature: string; uses: number; uniqueUsers: number }>;
  recentActivity: Array<{ app: string; user: string; action: string; at: string }>;
}

export default function Usage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [realUsers, setRealUsers] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  const [healthScores, setHealthScores] = useState<Record<string, any>>({});

  useEffect(() => {
    setLoading(true);
    // Load real users and health scores first (fast), then usage data (slow ~10s)
    Promise.all([
      api<{ users: RealUser[] }>('/api/usage/realusers').then(d => setRealUsers(d.users || [])),
      api<{ scores: any[] }>('/api/health-scores').then(d => {
        const map: Record<string, any> = {};
        (d.scores || []).forEach((s: any) => { map[s.email] = s; });
        setHealthScores(map);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
    // Load usage data independently (takes 10+ seconds)
    api<UsageData>(`/api/usage?period=${period}`).then(setData).catch(() => {});
  }, [period]);

  if (loading) return <div className="text-gray-400">Loading usage analytics...</div>;

  const summary = data?.summary || { totalActiveUsers: 0, totalSessions: 0, totalActions: 0, appsWithActivity: 0, totalApps: 0 };
  const apps = data?.apps || [];
  const topFeatures = data?.topFeatures || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Usage Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">How users are engaging with your apps</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                period === p
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white bg-gray-800/50 border border-gray-700/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="Active Users" value={summary.totalActiveUsers} />
        <SummaryCard label="Total Sessions" value={summary.totalSessions} />
        <SummaryCard label="Total Actions" value={summary.totalActions} />
        <SummaryCard label="Apps with Activity" value={`${summary.appsWithActivity}/${summary.totalApps}`} />
      </div>

      {/* Real Users */}
      {realUsers.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800/50">
            <h2 className="text-base font-medium text-white">Real Users ({realUsers.length})</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800/30">
                <th className="text-left px-5 py-3 font-medium">User</th>
                <th className="text-left px-3 py-3 font-medium">App</th>
                <th className="text-left px-3 py-3 font-medium">Plan</th>
                <th className="text-right px-3 py-3 font-medium">Sessions</th>
                <th className="text-right px-3 py-3 font-medium">Actions</th>
                <th className="text-left px-3 py-3 font-medium">Top Features</th>
                <th className="text-left px-3 py-3 font-medium">Health</th>
                <th className="text-left px-5 py-3 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {realUsers.map((u, i) => (
                <tr key={i} className="border-b border-gray-800/20 hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="text-sm text-white font-medium">{u.name || u.email.split('@')[0]}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge status={u.app} />
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400">{u.plan || 'free'}</td>
                  <td className="px-3 py-3 text-right text-sm text-gray-300">{u.sessionCount || 0}</td>
                  <td className="px-3 py-3 text-right text-sm text-gray-300">{u.totalActions || 0}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(u.topFeatures || []).slice(0, 3).map((f, j) => (
                        <span key={j} className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded">{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {(() => {
                      const hs = healthScores[u.email];
                      if (!hs) return <span className="text-xs text-gray-600">-</span>;
                      const colors: Record<string, string> = {
                        champion: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                        healthy: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                        at_risk: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                        churning: 'bg-red-500/20 text-red-400 border-red-500/30',
                        new: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
                      };
                      return (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${colors[hs.label] || colors.new}`}>
                          {hs.score} {hs.label === 'at_risk' ? 'at risk' : hs.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {u.lastActive ? timeAgo(u.lastActive) : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-App Usage */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-base font-medium text-white">Per-App Engagement</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-800/30">
              <th className="text-left px-5 py-3 font-medium">App</th>
              <th className="text-right px-3 py-3 font-medium">Active Users</th>
              <th className="text-right px-3 py-3 font-medium">Sessions</th>
              <th className="text-right px-3 py-3 font-medium">Actions</th>
              <th className="text-left px-3 py-3 font-medium">Top Feature</th>
              <th className="text-left px-5 py-3 font-medium">Activity</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <React.Fragment key={app.appId}>
                <tr
                  className="border-b border-gray-800/20 hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => setExpandedApp(expandedApp === app.appId ? null : app.appId)}
                >
                  <td className="px-5 py-3">
                    <span className="text-sm text-white font-medium">{app.appName}</span>
                    <span className="text-[10px] text-gray-600 ml-2">{expandedApp === app.appId ? '▼' : '▶'}</span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-gray-300">{app.activeUsers}</td>
                  <td className="px-3 py-3 text-right text-sm text-gray-300">{app.totalSessions}</td>
                  <td className="px-3 py-3 text-right text-sm text-gray-300">{app.totalActions}</td>
                  <td className="px-3 py-3">
                    {app.topFeature && (
                      <span className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded">{app.topFeature}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <MiniSparkline data={app.dailyActiveUsers} />
                  </td>
                </tr>
                {expandedApp === app.appId && (
                  <tr>
                    <td colSpan={6} className="px-5 py-4 bg-gray-900/80">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Feature Breakdown */}
                        <div>
                          <h4 className="text-xs text-gray-500 font-medium uppercase mb-2">Feature Usage</h4>
                          {app.featureBreakdown.length > 0 ? (
                            <div className="space-y-1.5">
                              {app.featureBreakdown.slice(0, 8).map((f: any, i: number) => {
                                const maxUses = app.featureBreakdown[0]?.uses || 1;
                                return (
                                  <div key={i} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 w-28 truncate">{f.feature}</span>
                                    <div className="flex-1 bg-gray-800/50 rounded-full h-1.5">
                                      <div className="bg-indigo-500/60 h-1.5 rounded-full" style={{ width: `${(f.uses / maxUses) * 100}%` }} />
                                    </div>
                                    <span className="text-[10px] text-gray-500 w-12 text-right">{f.uses}</span>
                                    <span className="text-[10px] text-gray-600 w-16 text-right">{f.uniqueUsers || 0} users</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600">No feature data</p>
                          )}
                        </div>
                        {/* Recent Activity */}
                        <div>
                          <h4 className="text-xs text-gray-500 font-medium uppercase mb-2">Recent Activity</h4>
                          {app.recentActivity.length > 0 ? (
                            <div className="space-y-1">
                              {app.recentActivity.slice(0, 6).map((a: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-[11px]">
                                  <span className="text-gray-600 w-16">{timeAgo(a.at)}</span>
                                  <span className="text-gray-400 truncate">{a.user}</span>
                                  <span className="text-gray-600">{a.action}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600">No recent activity</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Features Across All Apps */}
      {topFeatures.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-5">
          <h2 className="text-base font-medium text-white mb-4">Top Features (All Apps)</h2>
          <div className="space-y-2">
            {topFeatures.slice(0, 10).map((f: any, i: number) => {
              const maxUses = topFeatures[0]?.uses || 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 truncate">{f.app}</span>
                  <span className="text-xs text-gray-300 w-32 truncate">{f.feature}</span>
                  <div className="flex-1 bg-gray-800/50 rounded-full h-2">
                    <div
                      className="bg-indigo-500/60 h-2 rounded-full"
                      style={{ width: `${(f.uses / maxUses) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right">{f.uses} uses</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-5">
          <h2 className="text-base font-medium text-white mb-4">Recent Real User Activity</h2>
          <div className="space-y-2">
            {recentActivity.slice(0, 20).map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="text-gray-500 w-24 truncate">{timeAgo(a.at)}</span>
                <Badge status={a.app} />
                <span className="text-gray-300 truncate">{a.user}</span>
                <span className="text-gray-500">{a.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
      <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-semibold text-white mt-1">{value}</div>
    </div>
  );
}

function MiniSparkline({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data || data.length === 0) return <span className="text-xs text-gray-600">No data</span>;
  const max = Math.max(...data.map(d => d.count), 1);
  const width = 80;
  const height = 20;
  const points = data.slice(-14).map((d, i, arr) => {
    const x = (i / Math.max(arr.length - 1, 1)) * width;
    const y = height - (d.count / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

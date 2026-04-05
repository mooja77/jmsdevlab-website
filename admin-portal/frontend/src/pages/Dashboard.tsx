import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/Icon';

interface Briefing {
  greeting: string;
  statusLine: string;
  summary: {
    totalUsers: number;
    totalMrr: number;
    healthyApps: number;
    totalApps: number;
    newLeads: number;
    pipelineValue: number;
  };
  attentionItems: Array<{ type: string; severity: string; title: string; detail: string }>;
  recentActivity: Array<{ source: string; event_type: string; summary: string; created_at: string }>;
  milestones: {
    achieved: Array<{ title: string; achieved_at: string }>;
    next: Array<{ title: string; threshold: number; type: string }>;
  };
  activeProjects: Array<{ name: string; client_name: string; value: number; currency: string; status: string; total_milestones: number; completed_milestones: number }>;
}

export default function Dashboard() {
  const [data, setData] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Briefing>('/api/briefing')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-64" />
        <div className="h-4 bg-gray-800 rounded w-96" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-800/50 rounded-xl" />)}
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { summary } = data;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-white">{data.greeting}</h1>
        <p className="text-gray-400 mt-1 text-sm">{data.statusLine}</p>
      </div>

      {/* Attention Items */}
      {data.attentionItems.length > 0 && (
        <div className="space-y-2">
          {data.attentionItems.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${
              item.severity === 'critical'
                ? 'bg-red-500/[0.06] border-red-500/20'
                : 'bg-amber-500/[0.06] border-amber-500/20'
            }`}>
              <Icon name="alert" className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                item.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
              }`} />
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Real Users" value={summary.totalUsers} />
        <StatCard label="MRR" value={`$${summary.totalMrr.toFixed(0)}`} accent={summary.totalMrr > 0} />
        <StatCard label="Apps Healthy" value={`${summary.healthyApps}/${summary.totalApps}`} accent={summary.healthyApps === summary.totalApps} />
        <StatCard label="New Leads" value={summary.newLeads} link="/leads" />
        <StatCard label="Pipeline" value={summary.pipelineValue > 0 ? `EUR ${(summary.pipelineValue / 1000).toFixed(0)}k` : '-'} link="/projects" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed — takes 2 columns */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800/50 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800/50">
            <h2 className="text-sm font-medium text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-800/30">
            {data.recentActivity.length > 0 ? data.recentActivity.slice(0, 10).map((event, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  event.event_type.includes('fail') || event.event_type.includes('down') ? 'bg-red-400' :
                  event.event_type.includes('signup') || event.event_type.includes('lead') ? 'bg-emerald-400' :
                  'bg-gray-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-300 truncate">{event.summary}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{formatRelativeTime(event.created_at)}</p>
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-center text-sm text-gray-600">
                No recent activity. Cron jobs will populate this automatically.
              </div>
            )}
          </div>
        </div>

        {/* Right column — Milestones + Projects */}
        <div className="space-y-6">
          {/* Milestones */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-800/50">
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                <Icon name="trophy" className="w-4 h-4 text-amber-400" />
                Milestones
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {data.milestones.achieved.slice(0, 3).map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon name="check" className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">{m.title}</span>
                  <span className="text-[11px] text-gray-600 ml-auto">{m.achieved_at}</span>
                </div>
              ))}
              {data.milestones.next.slice(0, 3).map((m, i) => (
                <div key={i} className="flex items-center gap-2 opacity-50">
                  <div className="w-4 h-4 rounded-full border border-gray-600" />
                  <span className="text-sm text-gray-400">{m.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
              <h2 className="text-sm font-medium text-white">Projects</h2>
              <Link to="/projects" className="text-[11px] text-gray-500 hover:text-gray-300">View all</Link>
            </div>
            <div className="p-5 space-y-3">
              {data.activeProjects.length > 0 ? data.activeProjects.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{p.name}</p>
                    <p className="text-[11px] text-gray-600">{p.client_name} &middot; {p.currency} {p.value.toLocaleString()}</p>
                  </div>
                  <Badge status={p.status} />
                </div>
              )) : (
                <p className="text-sm text-gray-600">No active projects</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* App Health Grid — compact */}
      <div>
        <h2 className="text-sm font-medium text-white mb-3">App Health</h2>
        <AppHealthGrid />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, link }: { label: string; value: string | number; accent?: boolean; link?: string }) {
  const inner = (
    <div className={`bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3 ${link ? 'hover:border-gray-700 transition-colors cursor-pointer' : ''}`}>
      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-semibold mt-1 tabular-nums ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
}

function AppHealthGrid() {
  const [apps, setApps] = useState<any[]>([]);
  useEffect(() => {
    api<{ apps: any[] }>('/api/aggregate/health').then(d => setApps(d.apps));
  }, []);

  const healthColor: Record<string, string> = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500',
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {apps.map((app: any) => (
        <Link
          key={app.id}
          to={`/apps/${app.id}`}
          className="bg-gray-900/30 border border-gray-800/30 rounded-lg px-3 py-2.5 hover:border-gray-700/50 transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${healthColor[app.status] || 'bg-gray-600'}`} />
            <span className="text-xs text-gray-400 group-hover:text-gray-200 truncate">{app.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

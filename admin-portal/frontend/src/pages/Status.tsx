import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface HealthApp {
  id: string;
  name: string;
  status: string;
  db_response_ms: number;
  checked_at: string;
}

interface UptimeCheck {
  app_id: string;
  name: string;
  url: string;
  status_code: number;
  response_ms: number;
  is_up: number;
  checked_at: string;
}

export default function Status() {
  const [health, setHealth] = useState<HealthApp[]>([]);
  const [uptime, setUptime] = useState<UptimeCheck[]>([]);
  const [cache, setCache] = useState<any>(null);
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [apiMs, setApiMs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = Date.now();
    Promise.all([
      api<{ apps: HealthApp[] }>('/api/aggregate/health').then(d => setHealth(d.apps || [])),
      api<{ checks: UptimeCheck[] }>('/api/aggregate/uptime').then(d => setUptime(d.checks || [])),
      api('/api/cache/status').then(setCache),
    ])
      .then(() => { setApiOk(true); setApiMs(Date.now() - start); })
      .catch(() => { setApiOk(false); setApiMs(Date.now() - start); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-sm">Checking systems...</div>;

  const allUp = health.every(a => a.status === 'healthy') && uptime.every(u => u.is_up);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">System Status</h1>
        <p className="text-sm text-gray-400 mt-1">Health of all services at a glance</p>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-xl p-4 border ${allUp ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${allUp ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          <span className={`text-sm font-medium ${allUp ? 'text-emerald-400' : 'text-amber-400'}`}>
            {allUp ? 'All systems operational' : 'Some systems need attention'}
          </span>
        </div>
      </div>

      {/* Core infrastructure */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Core Infrastructure</h2>
        <div className="space-y-2">
          <StatusRow name="Worker API" status={apiOk ? 'up' : 'down'} detail={`${apiMs}ms`} />
          <StatusRow name="D1 Database" status={apiOk ? 'up' : 'unknown'} detail={apiOk ? 'Connected' : ''} />
        </div>
      </div>

      {/* App health (from health_cache) */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">App Admin APIs</h2>
        <div className="space-y-2">
          {health.map(app => (
            <StatusRow
              key={app.id}
              name={app.name}
              status={app.status === 'healthy' ? 'up' : app.status === 'degraded' ? 'degraded' : 'down'}
              detail={app.db_response_ms ? `${app.db_response_ms}ms DB` : ''}
              time={app.checked_at}
            />
          ))}
        </div>
      </div>

      {/* Site uptime (from uptime_checks) */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Website Uptime</h2>
        <div className="space-y-2">
          {uptime.map(check => (
            <StatusRow
              key={check.app_id}
              name={check.name || check.url}
              status={check.is_up ? 'up' : 'down'}
              detail={`${check.response_ms}ms · HTTP ${check.status_code}`}
              time={check.checked_at}
            />
          ))}
        </div>
      </div>

      {/* Cache freshness */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Cache Freshness</h2>
        <div className="space-y-2">
          <StatusRow name="Health Cache" status="up" detail={cache?.health?.newest ? `Updated ${timeAgo(cache.health.newest)}` : 'No data'} />
          <StatusRow name="Dashboard Cache" status="up" detail={cache?.dashboard?.newest ? `Updated ${timeAgo(cache.dashboard.newest)}` : 'No data'} />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ name, status, detail, time }: { name: string; status: 'up' | 'down' | 'degraded' | 'unknown'; detail?: string; time?: string }) {
  const colors = {
    up: 'bg-emerald-400',
    down: 'bg-red-400',
    degraded: 'bg-amber-400',
    unknown: 'bg-gray-600',
  };
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
        <span className="text-sm text-gray-300">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        {detail && <span className="text-xs text-gray-500 font-mono">{detail}</span>}
        {time && <span className="text-[10px] text-gray-600">{timeAgo(time)}</span>}
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

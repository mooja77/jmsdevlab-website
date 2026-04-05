import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';
import Sparkline from '../components/ui/Sparkline';

interface UptimeCheck {
  app_id: string;
  name: string;
  url: string;
  status_code: number;
  response_ms: number;
  is_up: number;
  checked_at: string;
}

interface ResponseTime {
  id: string;
  name: string;
  avg_ms: number;
  max_ms: number;
  min_ms: number;
  checks: number;
}

export default function Infrastructure() {
  const [uptime, setUptime] = useState<UptimeCheck[]>([]);
  const [sparklines, setSparklines] = useState<Record<string, Array<{ hour: string; is_up: number; avg_ms: number }>>>({});
  const [responseTimes, setResponseTimes] = useState<ResponseTime[]>([]);
  const [github, setGithub] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ checks: UptimeCheck[] }>('/api/deploy/uptime').then(d => setUptime(d.checks)),
      api<{ sparklines: any }>('/api/deploy/uptime/sparkline').then(d => setSparklines(d.sparklines)),
      api<{ responseTimes: ResponseTime[] }>('/api/deploy/response-times').then(d => setResponseTimes(d.responseTimes)),
      api<{ repos: any[] }>('/api/deploy/github').then(d => setGithub(d.repos)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading infrastructure...</div>;

  const upCount = uptime.filter(c => c.is_up).length;
  const downCount = uptime.filter(c => !c.is_up).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Infrastructure</h1>
        <p className="text-sm text-gray-400 mt-1">Uptime, response times, and deployments</p>
      </div>

      {/* Uptime Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Sites Up</div>
          <div className="text-2xl font-semibold mt-1 text-emerald-400 tabular-nums">{upCount}/{uptime.length}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Sites Down</div>
          <div className={`text-2xl font-semibold mt-1 tabular-nums ${downCount > 0 ? 'text-red-400' : 'text-white'}`}>{downCount}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Avg Response</div>
          <div className="text-2xl font-semibold mt-1 text-white tabular-nums">
            {responseTimes.length ? `${Math.round(responseTimes.reduce((s, r) => s + r.avg_ms, 0) / responseTimes.length)}ms` : '-'}
          </div>
        </div>
      </div>

      {/* Uptime Grid with Sparklines */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Site Status</h2>
        </div>
        <div className="divide-y divide-gray-800/30">
          {uptime.map(check => {
            const appSparkline = sparklines[check.app_id] || [];
            const msData = appSparkline.map(s => s.avg_ms).filter(Boolean);

            return (
              <div key={check.app_id} className="px-5 py-3 flex items-center gap-4">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${check.is_up ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm text-gray-200 font-medium">{check.name}</p>
                  <p className="text-[11px] text-gray-600 truncate">{check.url?.replace('https://', '')}</p>
                </div>
                <div className="flex-1 flex justify-center">
                  {msData.length > 2 ? (
                    <Sparkline
                      data={msData}
                      width={160}
                      height={24}
                      color={check.is_up ? '#10b981' : '#ef4444'}
                    />
                  ) : (
                    <span className="text-[11px] text-gray-700">collecting data...</span>
                  )}
                </div>
                <div className="w-20 text-right flex-shrink-0">
                  <p className="text-sm tabular-nums text-gray-300">{check.response_ms}ms</p>
                  <Badge status={check.is_up ? 'healthy' : 'down'} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Response Time Ranking */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Response Times (24h average)</h2>
        </div>
        <div className="divide-y divide-gray-800/30">
          {responseTimes.map(rt => {
            const barWidth = Math.min((rt.avg_ms / 3000) * 100, 100);
            const isAlert = rt.avg_ms > 2000;

            return (
              <div key={rt.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300">{rt.name}</span>
                  <span className={`text-sm tabular-nums font-medium ${isAlert ? 'text-amber-400' : 'text-gray-400'}`}>
                    {Math.round(rt.avg_ms)}ms avg
                    <span className="text-gray-600 font-normal ml-2">(max: {Math.round(rt.max_ms)}ms)</span>
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all ${isAlert ? 'bg-amber-500' : rt.avg_ms > 1000 ? 'bg-blue-500' : 'bg-emerald-500'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
          {responseTimes.length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-gray-600">No response time data yet</div>
          )}
        </div>
      </div>

      {/* Recent Deployments */}
      {github.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-800/50">
            <h2 className="text-sm font-medium text-white">Recent Deployments</h2>
          </div>
          <div className="divide-y divide-gray-800/30">
            {github.map((repo: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{repo.last_commit_msg || 'No commits'}</p>
                  <p className="text-[11px] text-gray-600">{repo.app_name} &middot; {repo.last_commit_date || 'unknown'}</p>
                </div>
                {repo.ci_status && <Badge status={repo.ci_status === 'passing' ? 'healthy' : 'down'} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hosting Providers */}
      <div>
        <h2 className="text-sm font-medium text-white mb-3">Hosting Providers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Cloudflare', count: 2, desc: 'Pages + Workers + DNS' },
            { name: 'Railway', count: 6, desc: 'Express backends + PostgreSQL' },
            { name: 'Vercel', count: 6, desc: 'Next.js/React frontends' },
            { name: 'Firebase', count: 1, desc: 'PitchSide (Auth + RTDB)' },
          ].map(p => (
            <div key={p.name} className="bg-gray-900/30 border border-gray-800/30 rounded-lg px-4 py-3">
              <div className="text-sm text-gray-300 font-medium">{p.name}</div>
              <div className="text-lg font-semibold text-indigo-400 mt-0.5 tabular-nums">{p.count}</div>
              <div className="text-[11px] text-gray-600 mt-0.5">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

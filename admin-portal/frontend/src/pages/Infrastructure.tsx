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
  const [health, setHealth] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [deploySummary, setDeploySummary] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [errorSummary, setErrorSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ checks: UptimeCheck[] }>('/api/deploy/uptime').then(d => setUptime(d.checks)),
      api<{ sparklines: any }>('/api/deploy/uptime/sparkline').then(d => setSparklines(d.sparklines)),
      api<{ apps: any[] }>('/api/aggregate/health').then(d => setHealth(d.apps || [])),
      api<{ responseTimes: ResponseTime[] }>('/api/deploy/response-times').then(d => setResponseTimes(d.responseTimes)),
      api<{ repos: any[] }>('/api/deploy/github').then(d => setGithub(d.repos)),
      api<{ deployments: any[]; summary: any }>('/api/deploy/history').then(d => {
        setDeployments(d.deployments || []);
        setDeploySummary(d.summary);
      }).catch(() => {}),
      api<{ errors: any[]; summary: any }>('/api/errors').then(d => {
        setErrors(d.errors || []);
        setErrorSummary(d.summary);
      }).catch(() => {}),
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

      {/* Error Monitoring */}
      {errorSummary && (errorSummary.total > 0 || errors.length > 0) && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Error Log ({errorSummary?.unresolved || 0} unresolved)</h2>
          </div>
          <div className="divide-y divide-gray-800/20">
            {errors.slice(0, 10).map((e: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${e.resolved ? 'bg-gray-600' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{e.app_name}</span>
                    <span className="text-xs text-gray-700">×{e.count}</span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{e.message}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{e.endpoint} — {e.error_type}</p>
                </div>
              </div>
            ))}
            {errors.length === 0 && (
              <div className="px-5 py-6 text-center text-sm text-gray-600">No errors reported. Apps will send errors here when they occur.</div>
            )}
          </div>
        </div>
      )}

      {/* Deployment History */}
      {deployments.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent Deployments</h2>
            {deploySummary && (
              <span className="text-xs text-gray-500">
                {deploySummary.successes || 0} passed, {deploySummary.failures || 0} failed (30d)
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-800/20">
            {deployments.slice(0, 8).map((d: any, i: number) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  d.status === 'success' ? 'bg-emerald-400' : d.status === 'failure' ? 'bg-red-400' : 'bg-amber-400'
                }`} />
                <span className="text-xs text-gray-500 w-24 truncate">{d.app_name}</span>
                <span className="text-xs text-gray-400 font-mono">{d.commit_sha}</span>
                <span className="text-xs text-gray-300 truncate flex-1">{d.commit_message}</span>
                <span className="text-[10px] text-gray-600">{d.duration_seconds ? `${d.duration_seconds}s` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hosting Providers — computed from app data */}
      <div>
        <h2 className="text-sm font-medium text-white mb-3">Hosting Providers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(() => {
            // Compute hosting counts from health data
            const counts: Record<string, number> = {};
            (health || []).forEach((a: any) => {
              const hosting = a.hosting || 'unknown';
              const providers = hosting.split(/[+,]/);
              providers.forEach((p: string) => {
                const name = p.trim().replace('-pages', '').replace(/^\w/, (c: string) => c.toUpperCase());
                if (name) counts[name] = (counts[name] || 0) + 1;
              });
            });
            return Object.entries(counts).sort(([,a],[,b]) => b - a).map(([name, count]) => ({ name, count, desc: '' }));
          })().map(p => (
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

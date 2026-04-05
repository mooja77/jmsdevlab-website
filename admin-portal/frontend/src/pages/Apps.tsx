import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

interface AppEntry {
  id: string;
  name: string;
  frontend_url: string | null;
  has_admin: number;
  hosting: string | null;
  audit_score: number;
  status: string;
  health: { status: string; checked_at: string } | null;
}

const healthDot: Record<string, string> = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
};

export default function Apps() {
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ apps: AppEntry[] }>('/api/apps')
      .then(d => setApps(d.apps))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading apps...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">App Portfolio</h1>
        <p className="text-sm text-gray-400 mt-1">{apps.length} apps registered</p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800/30 text-gray-500 text-[11px] uppercase tracking-wider">
              <th className="px-5 py-3 text-left font-medium">App</th>
              <th className="px-5 py-3 text-left font-medium">Health</th>
              <th className="px-5 py-3 text-left font-medium">Audit</th>
              <th className="px-5 py-3 text-left font-medium">Hosting</th>
              <th className="px-5 py-3 text-left font-medium">Admin API</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app.id} className="border-b border-gray-800/30 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <Link to={`/apps/${app.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
                    {app.name}
                  </Link>
                  {app.frontend_url && (
                    <div className="text-[11px] text-gray-600 mt-0.5">{app.frontend_url.replace('https://', '')}</div>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${healthDot[app.health?.status || ''] || 'bg-gray-600'}`} />
                    <span className="text-gray-300">{app.health?.status || 'unknown'}</span>
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`${app.audit_score >= 12 ? 'text-emerald-400' : app.audit_score >= 9 ? 'text-amber-400' : 'text-gray-500'}`}>
                    {app.audit_score > 0 ? `${app.audit_score}/16` : '-'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{app.hosting || '-'}</td>
                <td className="px-5 py-3">
                  {app.has_admin ? (
                    <span className="text-emerald-400 text-xs">Connected</span>
                  ) : (
                    <span className="text-gray-600 text-xs">Not yet</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

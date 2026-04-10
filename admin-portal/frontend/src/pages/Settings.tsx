import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function Settings() {
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [appCount, setAppCount] = useState({ total: 0, healthy: 0 });

  useEffect(() => {
    api<{ summary: { totalApps: number; healthy: number } }>('/api/aggregate/dashboard')
      .then(d => setAppCount({ total: d.summary?.totalApps || 0, healthy: d.summary?.healthy || 0 }))
      .catch(() => {});
  }, []);

  async function refreshCache() {
    setRefreshing(true);
    setMessage('');
    try {
      await api('/api/cache/refresh', { method: 'POST' });
      setMessage('Cache refreshed successfully');
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Portal configuration and cache management</p>
      </div>

      {/* Cache Management */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Cache Management</h2>
        <p className="text-gray-400 text-sm mb-4">
          Data is automatically refreshed via cron triggers (health: 5 min, dashboard: 15 min, uptime: 10 min).
          Use the button below to force an immediate refresh.
        </p>
        <button
          onClick={refreshCache}
          disabled={refreshing}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          {refreshing ? 'Refreshing...' : 'Force Refresh All Caches'}
        </button>
        {message && (
          <p className={`mt-3 text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </p>
        )}
      </div>

      {/* Portal Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Portal Info</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Stack</span>
            <span className="text-gray-200">Cloudflare Workers + D1 + Pages</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Frontend</span>
            <span className="text-gray-200">React + Vite + Tailwind CSS</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Database</span>
            <span className="text-gray-200">Cloudflare D1 (SQLite)</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Connected Apps</span>
            <span className="text-gray-200">{appCount.healthy} / {appCount.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

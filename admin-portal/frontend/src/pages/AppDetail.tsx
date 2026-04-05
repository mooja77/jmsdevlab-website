import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';

export default function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('health');

  useEffect(() => {
    if (!id) return;
    api(`/api/apps/${id}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  function fetchEndpoint(endpoint: string) {
    if (!id) return;
    api(`/api/apps/${id}/${endpoint}`)
      .then(result => setLiveData(prev => ({ ...prev, [endpoint]: result })));
  }

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (!data?.app) return <div className="text-red-400">App not found</div>;

  const { app, health } = data;
  const tabs = ['health', 'users', 'billing', 'activity', 'features'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/apps" className="text-gray-500 hover:text-gray-300 text-sm mb-2 block">&larr; All Apps</Link>
          <h1 className="text-2xl font-semibold text-white">{app.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            {app.frontend_url && (
              <a href={app.frontend_url} target="_blank" rel="noopener" className="hover:text-indigo-400">
                {app.frontend_url.replace('https://', '')}
              </a>
            )}
            <span>{app.hosting}</span>
            {app.audit_score > 0 && <span>Audit: {app.audit_score}/16</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${
            health?.status === 'healthy' ? 'bg-emerald-500' :
            health?.status === 'degraded' ? 'bg-amber-500' :
            health?.status === 'down' ? 'bg-red-500' : 'bg-gray-600'
          }`} />
          <span className="text-gray-300 text-sm">{health?.status || 'unknown'}</span>
        </div>
      </div>

      {/* Health metrics only — no user counts or MRR */}
      {health && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickMetric label="DB Connected" value={health.db_connected ? 'Yes' : 'No'} />
          <QuickMetric label="DB Response" value={health.db_response_ms ? `${health.db_response_ms}ms` : '-'} />
          <QuickMetric label="Memory" value={health.memory_mb ? `${health.memory_mb}MB` : '-'} />
          <QuickMetric label="Version" value={health.version || '-'} />
        </div>
      )}

      {/* Tabs — proxy to app endpoints with warning */}
      <div className="border-b border-gray-800/50">
        <div className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab !== 'health') fetchEndpoint(tab); }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        {activeTab === 'health' && health && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Health Details</h3>
            <pre className="text-xs text-gray-400 bg-gray-800/50 p-4 rounded-lg overflow-auto">
              {JSON.stringify(JSON.parse(health.raw_json || '{}'), null, 2)}
            </pre>
          </div>
        )}

        {activeTab !== 'health' && (
          <div>
            {(activeTab === 'users' || activeTab === 'billing') && (
              <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-400">
                  App-reported data. May include test accounts. Use the Users and Revenue pages for verified data.
                </p>
              </div>
            )}
            {liveData[activeTab] ? (
              <pre className="text-xs text-gray-400 bg-gray-800/50 p-4 rounded-lg overflow-auto max-h-[600px]">
                {JSON.stringify(liveData[activeTab], null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">Loading {activeTab} data...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-3">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-white mt-0.5">{value}</div>
    </div>
  );
}

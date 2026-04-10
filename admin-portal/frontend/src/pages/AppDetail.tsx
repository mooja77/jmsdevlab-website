import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';

export default function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('health');

  useEffect(() => {
    if (!id) return;
    api(`/api/apps/${id}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  function fetchEndpoint(endpoint: string) {
    if (!id || liveData[endpoint]) return;
    setTabLoading(true);
    setTabError(null);
    const timeout = setTimeout(() => setTabError('Request timed out'), 20000);
    api(`/api/apps/${id}/${endpoint}`)
      .then(result => setLiveData(prev => ({ ...prev, [endpoint]: result })))
      .catch(e => setTabError(`Failed to load: ${e}`))
      .finally(() => { clearTimeout(timeout); setTabLoading(false); });
  }

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (!data?.app) return <div className="text-red-400">App not found</div>;

  const { app, health } = data;
  const tabs = ['health', 'dashboard', 'users', 'billing', 'activity', 'features'];

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
            {app.audit_score > 0 && <span>Audit: {app.audit_score}/18</span>}
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

      {/* Health quick metrics */}
      {health && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <QuickMetric label="DB Connected" value={health.db_connected ? 'Yes' : 'No'} />
          <QuickMetric label="DB Response" value={health.db_response_ms ? `${health.db_response_ms}ms` : '-'} />
          <QuickMetric label="Memory" value={health.memory_mb ? `${health.memory_mb}MB` : '-'} />
          <QuickMetric label="Version" value={health.version || '-'} />
          <QuickMetric label="Last Check" value={health.checked_at ? timeAgo(health.checked_at) : '-'} />
        </div>
      )}

      {/* Tabs */}
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
        {/* Health Tab */}
        {activeTab === 'health' && health && (
          <HealthTab health={health} />
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <DashboardTab data={liveData.dashboard} loading={tabLoading} error={tabError} />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UsersTab data={liveData.users} loading={tabLoading} error={tabError} />
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <BillingTab data={liveData.billing} loading={tabLoading} error={tabError} />
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <ActivityTab data={liveData.activity} loading={tabLoading} error={tabError} />
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <FeaturesTab data={liveData.features} loading={tabLoading} error={tabError} />
        )}
      </div>
    </div>
  );
}

function HealthTab({ health }: { health: any }) {
  const raw = JSON.parse(health.raw_json || '{}');
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">Health Details</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(raw).filter(([k]) => !['raw_json', 'success'].includes(k)).map(([key, val]) => (
          <div key={key} className="bg-gray-800/30 rounded-lg px-4 py-3">
            <div className="text-[10px] text-gray-600 uppercase">{key}</div>
            <div className="text-sm text-gray-200 mt-0.5 truncate">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardTab({ data, loading, error }: TabProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState label="dashboard" />;
  const d = data.data || data;
  return (
    <div className="space-y-4">
      <WarningBanner />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickMetric label="Total Users" value={d.totalUsers ?? '-'} />
        <QuickMetric label="Test Users" value={d.testUsers ?? '-'} />
        <QuickMetric label="Active Users" value={d.activeUsers ?? '-'} />
        <QuickMetric label="Signups (7d)" value={d.newSignups7d ?? d.newSignups ?? '-'} />
        <QuickMetric label="Signups (30d)" value={d.newSignups30d ?? '-'} />
        <QuickMetric label="MRR" value={d.mrr != null ? `$${d.mrr}` : '-'} />
        <QuickMetric label="Errors (24h)" value={d.errorCount24h ?? d.errorCount ?? '-'} />
        <QuickMetric label="Sessions" value={d.activeSessions ?? '-'} />
      </div>
      {d.planDistribution && (
        <div>
          <h4 className="text-xs text-gray-500 font-medium uppercase mt-4 mb-2">Plan Distribution</h4>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(d.planDistribution).map(([plan, count]) => (
              <div key={plan} className="bg-gray-800/30 rounded px-3 py-1.5 text-xs">
                <span className="text-gray-400">{plan}:</span>
                <span className="text-white ml-1 font-medium">{String(count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab({ data, loading, error }: TabProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState label="users" />;
  const d = data.data || data;
  const users = d.users || d.shops || d.stores || (Array.isArray(d) ? d : []);
  if (!users.length) return <p className="text-gray-500 text-sm">No users found</p>;
  return (
    <div className="space-y-4">
      <WarningBanner />
      <table className="w-full">
        <thead>
          <tr className="text-xs text-gray-500 border-b border-gray-800/30">
            <th className="text-left py-2 font-medium">Email</th>
            <th className="text-left py-2 font-medium">Name</th>
            <th className="text-left py-2 font-medium">Plan</th>
            <th className="text-left py-2 font-medium">Test</th>
            <th className="text-left py-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.slice(0, 50).map((u: any, i: number) => (
            <tr key={i} className="border-b border-gray-800/20 text-sm">
              <td className="py-2 text-gray-300">{u.email || u.ownerEmail || '-'}</td>
              <td className="py-2 text-gray-400">{u.name || u.shopName || u.displayName || '-'}</td>
              <td className="py-2"><Badge status={u.plan || u.status || 'unknown'} /></td>
              <td className="py-2 text-gray-500">{u.isTest ? 'Yes' : 'No'}</td>
              <td className="py-2 text-gray-500 text-xs">{formatDate(u.createdAt || u.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length > 50 && <p className="text-xs text-gray-600">Showing first 50 of {users.length}</p>}
    </div>
  );
}

function BillingTab({ data, loading, error }: TabProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState label="billing" />;
  const d = data.data || data;
  return (
    <div className="space-y-4">
      <WarningBanner />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickMetric label="MRR" value={d.mrr != null ? `$${d.mrr}` : '-'} />
        <QuickMetric label="ARR" value={d.arr != null ? `$${d.arr}` : '-'} />
        <QuickMetric label="Paying" value={d.totalPaying ?? d.payingCount ?? '-'} />
        <QuickMetric label="Free" value={d.totalFree ?? d.freeTrialCount ?? '-'} />
        <QuickMetric label="Trials" value={d.trialCount ?? '-'} />
        <QuickMetric label="Churn (30d)" value={d.churnRate30d != null ? `${d.churnRate30d}%` : '-'} />
      </div>
      {d.planBreakdown && (
        <div>
          <h4 className="text-xs text-gray-500 font-medium uppercase mt-4 mb-2">Plan Breakdown</h4>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(d.planBreakdown).map(([plan, count]) => (
              <div key={plan} className="bg-gray-800/30 rounded px-3 py-1.5 text-xs">
                <span className="text-gray-400">{plan}:</span>
                <span className="text-white ml-1 font-medium">{String(count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityTab({ data, loading, error }: TabProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState label="activity" />;
  const d = data.data || data;
  const activity = d.activity || d.activities || (Array.isArray(d) ? d : []);
  if (!activity.length) return <p className="text-gray-500 text-sm">No recent activity</p>;
  return (
    <div className="space-y-2">
      {activity.slice(0, 30).map((a: any, i: number) => (
        <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-800/20 text-sm">
          <span className="text-xs text-gray-600 w-28 flex-shrink-0">{timeAgo(a.timestamp || a.at || a.createdAt)}</span>
          <span className="text-gray-300">{a.action || a.event_type || a.type || '-'}</span>
          <span className="text-gray-500 truncate flex-1">{a.details || a.summary || a.description || ''}</span>
          {a.user && <span className="text-xs text-gray-600">{a.user}</span>}
        </div>
      ))}
    </div>
  );
}

function FeaturesTab({ data, loading, error }: TabProps) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!data) return <EmptyState label="features" />;
  const d = data.data || data;
  const features = d.features || (Array.isArray(d) ? d : []);
  if (!features.length) return <p className="text-gray-500 text-sm">No feature data</p>;
  const maxUses = Math.max(...features.map((f: any) => f.usageCount || f.uses || f.usage || 0), 1);
  return (
    <div className="space-y-2">
      {features.map((f: any, i: number) => {
        const uses = f.usageCount || f.uses || f.usage || 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-gray-300 w-40 truncate">{f.name || f.feature || `Feature ${i + 1}`}</span>
            <div className="flex-1 bg-gray-800/50 rounded-full h-2">
              <div className="bg-indigo-500/60 h-2 rounded-full" style={{ width: `${(uses / maxUses) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-20 text-right">{uses} uses</span>
            {f.uniqueUsers != null && <span className="text-xs text-gray-600 w-16 text-right">{f.uniqueUsers} users</span>}
          </div>
        );
      })}
    </div>
  );
}

// Shared components
interface TabProps { data: any; loading: boolean; error: string | null }

function LoadingState() {
  return <div className="text-gray-500 text-sm animate-pulse">Loading data...</div>;
}

function ErrorState({ error }: { error: string }) {
  return <div className="text-red-400 text-sm bg-red-500/[0.06] border border-red-500/20 rounded-lg p-3">{error}</div>;
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-gray-500 text-sm">Click the {label} tab to fetch live data from this app.</p>;
}

function WarningBanner() {
  return (
    <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-lg p-3 mb-4">
      <p className="text-xs text-amber-400">
        App-reported data. May include test accounts. Use the Users and Revenue pages for verified data.
      </p>
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

function timeAgo(dateStr: string): string {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'undefined') return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '-'; }
}

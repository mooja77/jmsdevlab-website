import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';

interface User {
  email: string;
  name: string;
  app: string;
  appId: string;
  plan: string;
  isTest: boolean;
  createdAt: string;
  lastLogin: string;
}

interface AppDashboard {
  app_id: string;
  total_users: number;
  active_users: number;
  new_signups_7d: number;
  raw_json: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    setError(null);
    api<{ customers: User[] }>(`/api/customers?includeTest=${showTest}`)
      .then(d => setUsers(d.customers || []))
      .catch(e => setError('Failed to load users: ' + String(e)))
      .finally(() => setLoading(false));
  }, [showTest]);

  if (loading) return <div className="text-gray-400">Loading users...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  const realUsers = users.filter(u => !u.isTest);
  const testUsers = users.filter(u => u.isTest);

  // Group by app
  const byApp: Record<string, User[]> = {};
  (showTest ? users : realUsers).forEach(u => {
    if (!byApp[u.app]) byApp[u.app] = [];
    byApp[u.app].push(u);
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Users</h1>
          <p className="text-sm text-gray-400 mt-1">
            {realUsers.length} real user{realUsers.length !== 1 ? 's' : ''} across all apps
            {showTest && <span className="text-gray-600"> + {testUsers.length} test accounts</span>}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showTest}
            onChange={e => { setShowTest(e.target.checked); setLoading(true); }}
            className="rounded border-gray-600 bg-gray-800 text-indigo-500"
          />
          Show test accounts
        </label>
      </div>

      {/* Summary by app */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(byApp).sort((a, b) => b[1].length - a[1].length).map(([app, appUsers]) => (
          <div key={app} className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-4 py-2.5">
            <div className="text-sm text-gray-300 font-medium">{app}</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-semibold text-indigo-400 tabular-nums">{appUsers.length}</span>
              <span className="text-[11px] text-gray-600">user{appUsers.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
        {Object.keys(byApp).length === 0 && !showTest && (
          <div className="text-sm text-gray-600">No real users yet. Toggle "Show test accounts" to see test data.</div>
        )}
      </div>

      {/* User List */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800/30 text-gray-500 text-[11px] uppercase tracking-wider">
              <th className="px-5 py-3 text-left font-medium">User</th>
              <th className="px-5 py-3 text-left font-medium">App</th>
              <th className="px-5 py-3 text-left font-medium">Plan</th>
              <th className="px-5 py-3 text-left font-medium">Signed Up</th>
              <th className="px-5 py-3 text-left font-medium">Last Active</th>
              {showTest && <th className="px-5 py-3 text-left font-medium">Type</th>}
            </tr>
          </thead>
          <tbody>
            {(showTest ? users : realUsers).map((user, i) => (
              <tr
                key={`${user.email}-${user.appId}-${i}`}
                className={`border-b border-gray-800/20 cursor-pointer hover:bg-white/[0.02] transition-colors ${user.isTest ? 'opacity-40' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <td className="px-5 py-3">
                  <p className="text-gray-200 font-medium">{user.name || 'Unknown'}</p>
                  <p className="text-[11px] text-gray-500">{user.email}</p>
                </td>
                <td className="px-5 py-3 text-gray-400">{user.app}</td>
                <td className="px-5 py-3"><Badge status={user.plan || 'unknown'} /></td>
                <td className="px-5 py-3 text-gray-500 text-xs tabular-nums">{formatDate(user.createdAt)}</td>
                <td className="px-5 py-3 text-gray-500 text-xs tabular-nums">{formatDate(user.lastLogin)}</td>
                {showTest && (
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${user.isTest ? 'bg-gray-800 text-gray-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {user.isTest ? 'test' : 'real'}
                    </span>
                  </td>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-600">
                  {showTest ? 'No users found across any app' : 'No real users yet. Your first customer will appear here.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Panel */}
      {selectedUser && (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-gray-900 border-l border-gray-800 z-50 overflow-y-auto shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{selectedUser.name || 'User'}</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-300 text-xl">&times;</button>
            </div>

            <div className="space-y-5">
              <DetailField label="Email" value={selectedUser.email} />
              <DetailField label="App" value={selectedUser.app} />
              <DetailField label="Plan">
                <Badge status={selectedUser.plan || 'unknown'} />
              </DetailField>
              <DetailField label="Signed Up" value={formatDate(selectedUser.createdAt)} />
              <DetailField label="Last Active" value={formatDate(selectedUser.lastLogin) || 'Unknown'} />
              <DetailField label="Type">
                <span className={`text-sm ${selectedUser.isTest ? 'text-gray-500' : 'text-emerald-400'}`}>
                  {selectedUser.isTest ? 'Test Account' : 'Real Customer'}
                </span>
              </DetailField>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-800/50 space-y-2">
                <a
                  href={`/apps/${selectedUser.appId}`}
                  className="block w-full text-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
                >
                  View {selectedUser.app} Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-sm text-gray-200">{children || value || '-'}</div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'undefined' || dateStr === 'null') return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr.substring(0, 10);
  }
}

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/Icon';

interface Customer {
  email: string;
  name: string;
  app: string;
  appId: string;
  plan: string;
  isTest: boolean;
  createdAt: string;
  lastLogin: string;
}

interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  isTest: boolean;
  created: string;
  subscriptions: Array<{
    id: string;
    status: string;
    mrr: number;
    items: Array<{ productName: string; amount: number; interval: string }>;
    currentPeriodEnd: string;
    cancelAt: string | null;
  }>;
}

interface StripeCatalog {
  id: string;
  name: string;
  description: string;
  prices: Array<{ id: string; amount: number; interval: string }>;
}

interface StripeData {
  customers: StripeCustomer[];
  realCustomers: number;
  testCustomers: number;
  subscriptions: any[];
  activeSubscriptions: number;
  totalMrr: number;
  balance: { available: Array<{ amount: number; currency: string }>; pending: Array<{ amount: number; currency: string }> };
  catalog: StripeCatalog[];
  error?: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stripe, setStripe] = useState<StripeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'stripe' | 'catalog'>('users');

  useEffect(() => {
    setLoading(true);
    setSlow(false);
    const timer = setTimeout(() => setSlow(true), 8000);
    Promise.all([
      api<{ customers: Customer[]; realCustomers: number; testAccounts: number }>(`/api/customers?includeTest=${showTest}`)
        .then(d => setCustomers(d.customers)),
      api<StripeData>('/api/customers/stripe').then(setStripe),
    ]).finally(() => { setLoading(false); clearTimeout(timer); });
    return () => clearTimeout(timer);
  }, [showTest]);

  if (loading) return (
    <div className="text-gray-400 text-sm">
      {slow ? 'Still loading — fetching live data from all apps...' : 'Loading customers...'}
    </div>
  );

  const realCustomers = customers.filter(c => !c.isTest);
  const appBreakdown = realCustomers.reduce<Record<string, number>>((acc, c) => {
    acc[c.app] = (acc[c.app] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Customers</h1>
          <p className="text-sm text-gray-400 mt-1">Users across all apps + Stripe billing data</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showTest}
            onChange={e => setShowTest(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-indigo-500"
          />
          Show test accounts
        </label>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Real Users" value={realCustomers.length} accent />
        <SummaryCard label="Stripe Customers" value={stripe?.realCustomers || 0} />
        <SummaryCard label="Active Subs" value={stripe?.activeSubscriptions || 0} />
        <SummaryCard label="Stripe MRR" value={`$${(stripe?.totalMrr || 0).toFixed(2)}`} accent={!!stripe?.totalMrr} />
        <SummaryCard label="Balance" value={`${stripe?.balance?.available?.[0]?.currency?.toUpperCase() || 'EUR'} ${(stripe?.balance?.available?.[0]?.amount || 0).toFixed(2)}`} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800/50">
        <div className="flex gap-6">
          {(['users', 'stripe', 'catalog'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab === 'users' ? 'App Users' : tab === 'stripe' ? 'Stripe Customers' : 'Product Catalog'}
            </button>
          ))}
        </div>
      </div>

      {/* App Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Per-app breakdown */}
          {Object.keys(appBreakdown).length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {Object.entries(appBreakdown).sort((a, b) => b[1] - a[1]).map(([app, count]) => (
                <div key={app} className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-300">{app}</span>
                  <span className="text-sm text-indigo-400 ml-2 tabular-nums font-medium">{count}</span>
                </div>
              ))}
            </div>
          )}

          {/* User Table */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/30 text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">User</th>
                  <th className="px-5 py-3 text-left font-medium">App</th>
                  <th className="px-5 py-3 text-left font-medium">Plan</th>
                  <th className="px-5 py-3 text-left font-medium">Signed Up</th>
                  {showTest && <th className="px-5 py-3 text-left font-medium">Type</th>}
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 50).map((c, i) => (
                  <tr key={`${c.email}-${c.appId}-${i}`} className={`border-b border-gray-800/20 ${c.isTest ? 'opacity-40' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="text-gray-200 font-medium">{c.name}</p>
                      <p className="text-[11px] text-gray-500">{c.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{c.app}</td>
                    <td className="px-5 py-3"><Badge status={c.plan} /></td>
                    <td className="px-5 py-3 text-gray-500 text-xs tabular-nums">{formatDate(c.createdAt)}</td>
                    {showTest && <td className="px-5 py-3">{c.isTest ? <Badge status="down" /> : <Badge status="healthy" />}</td>}
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-600">
                      {showTest ? 'No users found' : 'No real customers yet. Toggle "Show test accounts" to see test data.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {customers.length > 50 && (
              <div className="px-5 py-3 text-xs text-gray-600 border-t border-gray-800/30">
                Showing 50 of {customers.length} users
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stripe Customers Tab */}
      {activeTab === 'stripe' && stripe && (
        <div className="space-y-6">
          {stripe.error && (
            <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4">
              <p className="text-sm text-amber-400">{stripe.error}</p>
              <p className="text-xs text-gray-500 mt-1">Add STRIPE_API_KEY as a Worker secret to enable Stripe integration.</p>
            </div>
          )}

          {!stripe.error && (
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800/30 text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Customer</th>
                    <th className="px-5 py-3 text-left font-medium">Subscriptions</th>
                    <th className="px-5 py-3 text-right font-medium">MRR</th>
                    <th className="px-5 py-3 text-left font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {stripe.customers.filter(c => showTest || !c.isTest).map(c => (
                    <tr key={c.id} className={`border-b border-gray-800/20 ${c.isTest ? 'opacity-40' : ''}`}>
                      <td className="px-5 py-3">
                        <p className="text-gray-200 font-medium">{c.name || c.email?.split('@')[0] || 'Unknown'}</p>
                        <p className="text-[11px] text-gray-500">{c.email || c.id}</p>
                      </td>
                      <td className="px-5 py-3">
                        {c.subscriptions.length > 0 ? c.subscriptions.map(s => (
                          <div key={s.id} className="flex items-center gap-2 mb-1">
                            <Badge status={s.status === 'active' ? 'healthy' : s.status} />
                            <span className="text-xs text-gray-400">
                              {s.items.map(i => i.productName).join(', ') || 'Unknown plan'}
                            </span>
                          </div>
                        )) : <span className="text-xs text-gray-600">No subscriptions</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {c.subscriptions.reduce((sum, s) => sum + s.mrr, 0) > 0 ? (
                          <span className="text-emerald-400 tabular-nums font-medium">
                            ${c.subscriptions.reduce((sum, s) => sum + s.mrr, 0).toFixed(2)}
                          </span>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs tabular-nums">{formatDate(c.created)}</td>
                    </tr>
                  ))}
                  {stripe.customers.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-600">No Stripe customers</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Catalog Tab */}
      {activeTab === 'catalog' && stripe && !stripe.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stripe.catalog.map(product => (
            <div key={product.id} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-white">{product.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
              <div className="mt-3 space-y-1.5">
                {product.prices.sort((a, b) => a.amount - b.amount).map(price => (
                  <div key={price.id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 capitalize">{price.interval}ly</span>
                    <span className="text-sm text-white tabular-nums font-medium">${price.amount.toFixed(2)}<span className="text-gray-500 font-normal">/{price.interval === 'month' ? 'mo' : 'yr'}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {stripe.catalog.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-600 text-sm">No products configured in Stripe</div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-semibold mt-1 tabular-nums ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr.substring(0, 10);
  }
}

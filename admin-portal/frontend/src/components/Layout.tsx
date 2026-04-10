import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { logout, api } from '../lib/api';
import { useKeyboardShortcuts, useShortcutOverlay } from '../lib/keyboard';
import Icon, { IconName } from './ui/Icon';

const navItems: { to: string; label: string; icon: IconName; shortcut: string }[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', shortcut: 'g d' },
  { to: '/apps', label: 'Apps', icon: 'apps', shortcut: 'g a' },
  { to: '/revenue', label: 'Revenue', icon: 'revenue', shortcut: 'g r' },
  { to: '/users', label: 'Users', icon: 'leads', shortcut: 'g u' },
  { to: '/customers', label: 'Customers', icon: 'revenue', shortcut: 'g c' },
  { to: '/costs', label: 'Costs', icon: 'costs', shortcut: 'g x' },
  { to: '/visitors', label: 'Visitors', icon: 'visitors', shortcut: 'g v' },
  { to: '/leads', label: 'Leads', icon: 'leads', shortcut: 'g l' },
  { to: '/bark', label: 'Bark Finder', icon: 'bark', shortcut: 'g b' },
  { to: '/projects', label: 'Projects', icon: 'projects', shortcut: 'g p' },
  { to: '/usage', label: 'Usage', icon: 'visitors', shortcut: 'g y' },
  { to: '/infra', label: 'Infrastructure', icon: 'infra', shortcut: 'g i' },
  { to: '/matrices', label: 'Matrices', icon: 'apps', shortcut: 'g m' },
  { to: '/conversions', label: 'Conversions', icon: 'revenue', shortcut: 'g n' },
  { to: '/utm', label: 'UTM Builder', icon: 'visitors', shortcut: 'g t' },
  { to: '/status', label: 'Status', icon: 'alert', shortcut: 'g z' },
  { to: '/settings', label: 'Settings', icon: 'settings', shortcut: 'g s' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { show: showShortcuts, setShow: setShowShortcuts } = useShortcutOverlay();
  const [appCount, setAppCount] = useState<number | null>(null);

  useEffect(() => {
    api<{ summary: { totalApps: number }; apps?: any[] }>('/api/aggregate/dashboard')
      .then(d => setAppCount(d.summary?.totalApps || d.apps?.length || 0))
      .catch(() => {});
  }, []);

  const shortcuts = useMemo(() => ({
    'g d': () => navigate('/'),
    'g a': () => navigate('/apps'),
    'g r': () => navigate('/revenue'),
    'g u': () => navigate('/users'),
    'g c': () => navigate('/customers'),
    'g x': () => navigate('/costs'),
    'g v': () => navigate('/visitors'),
    'g l': () => navigate('/leads'),
    'g b': () => navigate('/bark'),
    'g p': () => navigate('/projects'),
    'g y': () => navigate('/usage'),
    'g i': () => navigate('/infra'),
    'g m': () => navigate('/matrices'),
    'g n': () => navigate('/conversions'),
    'g z': () => navigate('/status'),
    'g s': () => navigate('/settings'),
    'r': () => window.location.reload(),
  }), [navigate]);

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900/50 border-r border-gray-800/50 flex flex-col backdrop-blur-sm">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-lg font-semibold text-white tracking-tight">JMS Dev Lab</h1>
          <p className="text-[11px] text-gray-500 mt-0.5 font-medium uppercase tracking-wider">Command Center</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/[0.06] text-white border-l-2 border-indigo-400 pl-[10px]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                }`
              }
            >
              <Icon name={item.icon} className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              <span className="text-[10px] text-gray-700 group-hover:text-gray-500 font-mono hidden lg:inline">
                {item.shortcut}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800/50">
          <div className="flex items-center justify-between px-1 mb-3">
            <span className="text-[11px] text-gray-600">{appCount ?? '...'} apps connected</span>
            <button
              onClick={() => setShowShortcuts(true)}
              className="text-[10px] text-gray-700 hover:text-gray-400 font-mono border border-gray-800 rounded px-1"
            >
              ?
            </button>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="w-full px-3 py-1.5 text-[13px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] rounded-lg transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Keyboard Shortcut Overlay */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-6">Keyboard Shortcuts</h2>
            <div className="space-y-4">
              <ShortcutSection title="Navigation">
                {navItems.map(item => (
                  <ShortcutRow key={item.to} keys={item.shortcut} label={item.label} />
                ))}
              </ShortcutSection>
              <ShortcutSection title="Actions">
                <ShortcutRow keys="r" label="Refresh current page" />
                <ShortcutRow keys="?" label="Toggle this overlay" />
                <ShortcutRow keys="Esc" label="Close overlay / panel" />
              </ShortcutSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShortcutSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex gap-1">
        {keys.split(' ').map((k, i) => (
          <kbd key={i} className="px-2 py-0.5 text-[11px] text-gray-400 bg-gray-800 border border-gray-700 rounded font-mono">
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

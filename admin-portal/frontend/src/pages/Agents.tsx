import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../lib/api';

interface Agent {
  id: string;
  type: string;
  name: string;
  description: string;
  status: string;
  app_id: string | null;
  model_default: string;
  budget_daily_cents: number;
  budget_spent_today_cents: number;
  last_active_at: string | null;
}

interface Task {
  id: number;
  agent_id: string;
  type: string;
  priority: number;
  status: string;
  title: string;
  description: string | null;
  model_used: string | null;
  cost_cents: number;
  tokens_in: number;
  tokens_out: number;
  created_by: string;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  output_json: string | null;
  retry_count: number;
  max_retries: number;
}

interface DashboardData {
  agents: Agent[];
  taskStats: { status: string; count: number }[];
  pendingApprovals: number;
  todayBudget: { total_cents: number; total_tasks: number };
}

const TYPE_COLORS: Record<string, string> = {
  app: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  supervisor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  marketing: 'bg-green-500/10 text-green-400 border-green-500/20',
  operations: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  research: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-500',
  running: 'bg-green-500 animate-pulse',
  paused: 'bg-yellow-500',
  errored: 'bg-red-500',
  disabled: 'bg-gray-700',
};

const PRIORITY_LABELS: Record<number, string> = {
  1: 'P1 Critical',
  3: 'P3 High',
  5: 'P5 Normal',
  7: 'P7 Low',
  10: 'P10 Background',
};

const FAILURE_TYPE_COLORS: Record<string, string> = {
  transient: 'bg-yellow-500/20 text-yellow-400',
  permission: 'bg-orange-500/20 text-orange-400',
  budget: 'bg-red-500/20 text-red-400',
  logic: 'bg-purple-500/20 text-purple-400',
  infrastructure: 'bg-blue-500/20 text-blue-400',
  timeout: 'bg-gray-500/20 text-gray-400',
};

export default function Agents() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<'agents' | 'tasks' | 'approvals'>('agents');
  const [taskFilter, setTaskFilter] = useState('queued');
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ agent_id: '', type: 'general', priority: 5, title: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: number; action: string } | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const loadDashboard = useCallback(() => {
    api<DashboardData>('/api/agents/dashboard')
      .then(d => { setData(d); setError(null); })
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    loadDashboard();
    loadTasks('queued');
    // Auto-refresh every 15 seconds
    const timer = setInterval(loadDashboard, 15000);
    return () => clearInterval(timer);
  }, [loadDashboard]);

  function loadTasks(status: string) {
    setTaskFilter(status);
    api<{ tasks: Task[] }>(`/api/agents/tasks?status=${status}&limit=50`).then(d => setTasks(d.tasks)).catch(console.error);
  }

  async function approveTask(id: number) {
    if (actionInProgress) return;
    setActionInProgress(id);
    try {
      await api(`/api/agents/tasks/${id}/approve`, { method: 'PUT' });
      loadTasks(taskFilter);
      loadDashboard();
    } catch (e: any) { setError(e.message); }
    finally { setActionInProgress(null); setConfirmAction(null); }
  }

  async function rejectTask(id: number) {
    if (actionInProgress) return;
    setActionInProgress(id);
    try {
      await api(`/api/agents/tasks/${id}/reject`, { method: 'PUT' });
      loadTasks(taskFilter);
      loadDashboard();
    } catch (e: any) { setError(e.message); }
    finally { setActionInProgress(null); setConfirmAction(null); }
  }

  async function createTask() {
    if (!newTask.agent_id || !newTask.title) return;
    await api('/api/agents/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask),
    });
    setShowCreate(false);
    setNewTask({ agent_id: '', type: 'general', priority: 5, title: '', description: '' });
    loadTasks(taskFilter);
  }

  async function toggleAgent(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'paused' ? 'idle' : 'paused';
    await api(`/api/agents/${id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    api<DashboardData>('/api/agents/dashboard').then(setData);
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-gray-500 text-sm">Loading agent harness...</div>
      </div>
    );
  }

  const approvals = tasks.filter(t => t.status === 'needs-approval');

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Harness</h1>
          <p className="text-sm text-gray-500 mt-1">Manage AI agents across {data.agents.length} registered agents</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition"
        >
          + Create Task
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Agents</div>
          <div className="text-2xl font-bold text-white mt-1">{data.agents.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {data.agents.filter(a => a.status === 'running').length} running
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Pending Approvals</div>
          <div className={`text-2xl font-bold mt-1 ${data.pendingApprovals > 0 ? 'text-amber-400' : 'text-white'}`}>
            {data.pendingApprovals}
          </div>
          <div className="text-xs text-gray-500 mt-1">tasks need review</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Today's Budget</div>
          <div className="text-2xl font-bold text-white mt-1">
            ${((data.todayBudget.total_cents || 0) / 100).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">{data.todayBudget.total_tasks || 0} tasks today</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Task Stats (7d)</div>
          <div className="text-sm text-gray-300 mt-2 space-y-0.5">
            {data.taskStats.map(s => (
              <div key={s.status} className="flex justify-between">
                <span className="text-gray-500 capitalize">{s.status}</span>
                <span>{s.count}</span>
              </div>
            ))}
            {data.taskStats.length === 0 && <span className="text-gray-600">No tasks yet</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-800/50 pb-2">
        {(['agents', 'tasks', 'approvals'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'approvals') loadTasks('needs-approval'); }}
            className={`px-4 py-2 text-sm rounded-t-lg transition ${
              tab === t ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'approvals' && data.pendingApprovals > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                {data.pendingApprovals}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Agents tab */}
      {tab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.agents.map(agent => (
            <div key={agent.id} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/50 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[agent.status] || 'bg-gray-500'}`} />
                  <h3 className="text-sm font-medium text-white">{agent.name}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TYPE_COLORS[agent.type] || 'text-gray-400'}`}>
                  {agent.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{agent.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Model: <span className="text-gray-400">{agent.model_default}</span>
                </span>
                <span className="text-gray-600">
                  Budget: <span className="text-gray-400">${(agent.budget_daily_cents / 100).toFixed(2)}/d</span>
                </span>
              </div>
              {agent.budget_daily_cents > 0 && (
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      agent.budget_spent_today_cents / agent.budget_daily_cents > 0.8 ? 'bg-red-500' :
                      agent.budget_spent_today_cents / agent.budget_daily_cents > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (agent.budget_spent_today_cents / agent.budget_daily_cents) * 100)}%` }}
                  />
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toggleAgent(agent.id, agent.status)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition"
                >
                  {agent.status === 'paused' ? 'Resume' : 'Pause'}
                </button>
                <span className="text-gray-700">|</span>
                <button
                  onClick={() => {
                    setNewTask(prev => ({ ...prev, agent_id: agent.id }));
                    setShowCreate(true);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  Assign Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tasks tab */}
      {tab === 'tasks' && (
        <div>
          <div className="flex gap-2 mb-4">
            {['queued', 'claimed', 'running', 'completed', 'failed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => loadTasks(s)}
                className={`text-xs px-3 py-1.5 rounded-lg transition ${
                  taskFilter === s ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 bg-gray-800/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {tasks.length === 0 && (
              <div className="text-sm text-gray-600 py-8 text-center">No {taskFilter} tasks</div>
            )}
            {tasks.map(task => (
              <div key={task.id} className="bg-gray-900/50 border border-gray-800/50 rounded-lg overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/30 transition"
                  onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">#{task.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        task.priority <= 1 ? 'bg-red-500/20 text-red-400' :
                        task.priority <= 3 ? 'bg-orange-500/20 text-orange-400' :
                        task.priority <= 5 ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-500'
                      }`}>
                        {PRIORITY_LABELS[task.priority] || `P${task.priority}`}
                      </span>
                      <h4 className="text-sm text-white truncate" title={task.title}>{task.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{task.agent_id}</span>
                      <span>{task.type}</span>
                      {task.model_used && <span>model: {task.model_used}</span>}
                      {task.cost_cents > 0 && <span>${(task.cost_cents / 100).toFixed(3)}</span>}
                      {task.retry_count > 0 && <span className="text-amber-500">retry {task.retry_count}/{task.max_retries}</span>}
                      <span>{new Date(task.created_at + 'Z').toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {task.status === 'needs-approval' && (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); approveTask(task.id); }}
                          disabled={actionInProgress === task.id}
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition disabled:opacity-50"
                        >Approve</button>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmAction({ id: task.id, action: 'reject' }); }}
                          disabled={actionInProgress === task.id}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded transition disabled:opacity-50"
                        >Reject</button>
                      </>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      task.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      task.status === 'running' || task.status === 'claimed' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {task.status}
                    </span>
                    <span className="text-gray-600 text-xs">{expandedTask === task.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expandedTask === task.id && (
                  <div className="border-t border-gray-800/50 p-4 bg-gray-950/50 space-y-3">
                    {task.description && (
                      <div><span className="text-xs text-gray-500">Description:</span><p className="text-sm text-gray-300 mt-1">{task.description}</p></div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-gray-500">Model</span><p className="text-gray-300 mt-0.5">{task.model_used || 'pending'}</p></div>
                      <div><span className="text-gray-500">Tokens</span><p className="text-gray-300 mt-0.5">{task.tokens_in?.toLocaleString() || 0} in / {task.tokens_out?.toLocaleString() || 0} out</p></div>
                      <div><span className="text-gray-500">Cost</span><p className="text-gray-300 mt-0.5">${(task.cost_cents / 100).toFixed(4)}</p></div>
                      <div><span className="text-gray-500">Created by</span><p className="text-gray-300 mt-0.5">{task.created_by}</p></div>
                    </div>
                    {task.completed_at && (
                      <div className="text-xs"><span className="text-gray-500">Completed:</span> <span className="text-gray-400">{new Date(task.completed_at + 'Z').toLocaleString()}</span></div>
                    )}
                    {task.error_message && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-400 font-medium">Error:</span>
                          {(task as any).failure_type && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${FAILURE_TYPE_COLORS[(task as any).failure_type] || 'bg-gray-700 text-gray-400'}`}>
                              {(task as any).failure_type}
                            </span>
                          )}
                        </div>
                        <pre className="text-xs text-red-300 mt-1 whitespace-pre-wrap">{task.error_message}</pre>
                      </div>
                    )}
                    {task.output_json && (
                      <div className="bg-gray-800/50 rounded p-3">
                        <span className="text-xs text-gray-500 font-medium">Output:</span>
                        <pre className="text-xs text-gray-300 mt-1 whitespace-pre-wrap max-h-64 overflow-y-auto">
                          {(() => { try { const parsed = JSON.parse(task.output_json); return parsed.summary || JSON.stringify(parsed, null, 2); } catch { return task.output_json; } })()}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approvals tab */}
      {tab === 'approvals' && (
        <div className="space-y-2">
          {tasks.filter(t => t.status === 'needs-approval').length === 0 && (
            <div className="text-sm text-gray-600 py-8 text-center">No pending approvals</div>
          )}
          {tasks.filter(t => t.status === 'needs-approval').map(task => (
            <div key={task.id} className="bg-gray-900/50 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">#{task.id}</span>
                    <h4 className="text-sm text-white">{task.title}</h4>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Agent: {task.agent_id} | Type: {task.type} | Created: {new Date(task.created_at).toLocaleString()}
                  </div>
                  {task.description && <p className="text-xs text-gray-400 mt-2">{task.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveTask(task.id)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition">Approve</button>
                  <button onClick={() => rejectTask(task.id)} className="px-4 py-2 bg-red-600/50 hover:bg-red-600 text-white text-sm rounded-lg transition">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-600/90 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-3 text-white/70 hover:text-white">x</button>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setConfirmAction(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-medium">Confirm {confirmAction.action}</h3>
            <p className="text-sm text-gray-400 mt-2">Are you sure you want to {confirmAction.action} task #{confirmAction.id}?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button
                onClick={() => confirmAction.action === 'reject' ? rejectTask(confirmAction.id) : approveTask(confirmAction.id)}
                className={`px-4 py-2 text-sm text-white rounded-lg ${confirmAction.action === 'reject' ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
              >{confirmAction.action === 'reject' ? 'Reject' : 'Approve'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create task modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Create Task</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Agent</label>
                <select
                  value={newTask.agent_id}
                  onChange={e => setNewTask(prev => ({ ...prev, agent_id: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">Select agent...</option>
                  {data.agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Type</label>
                  <select
                    value={newTask.type}
                    onChange={e => setNewTask(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {['general', 'code-review', 'bug-fix', 'deploy', 'content', 'research', 'audit', 'seo', 'health-check'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {[1, 3, 5, 7, 10].map(p => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Title</label>
                <input
                  value={newTask.title}
                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What should the agent do?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Description (optional)</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional context..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">Cancel</button>
              <button onClick={createTask} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

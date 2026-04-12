import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Icon from '../components/ui/Icon';

interface TaskOutputJson {
  summary?: string;
  content?: string;
  subject?: string;
  body?: string;
  [key: string]: unknown;
}

interface ApprovalTask {
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

interface TasksResponse {
  tasks: ApprovalTask[];
}

type ContentType = 'OUTREACH' | 'BLOG' | 'SOCIAL' | 'REVIEW';

const MARKETING_PATTERNS = ['mkt', 'marketing', 'outreach', 'marketer'];

const TYPE_BADGE_COLORS: Record<ContentType, string> = {
  OUTREACH: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  BLOG: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  SOCIAL: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  REVIEW: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
};

function isMarketingAgent(agentId: string): boolean {
  const lower = agentId.toLowerCase();
  return MARKETING_PATTERNS.some(p => lower.includes(p));
}

function inferContentType(task: ApprovalTask): ContentType {
  const text = `${task.type} ${task.title} ${task.description || ''}`.toLowerCase();
  if (text.includes('outreach') || text.includes('email')) return 'OUTREACH';
  if (text.includes('blog') || text.includes('article') || text.includes('post')) return 'BLOG';
  if (text.includes('social') || text.includes('tweet') || text.includes('linkedin')) return 'SOCIAL';
  if (text.includes('review') || text.includes('audit')) return 'REVIEW';
  return 'OUTREACH';
}

function parseContent(task: ApprovalTask): string {
  if (task.output_json) {
    try {
      const parsed: TaskOutputJson = JSON.parse(task.output_json);
      if (parsed.summary) return parsed.summary;
      if (parsed.content) return parsed.content;
      if (parsed.body) return parsed.body;
      if (parsed.subject) return parsed.subject;
    } catch {
      // fall through
    }
  }
  return task.title;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr + 'Z').getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function MarketingApprovals() {
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  function loadTasks() {
    setLoading(true);
    api<TasksResponse>('/api/agents/tasks?status=needs-approval&limit=50')
      .then(data => {
        const filtered = data.tasks.filter(t => isMarketingAgent(t.agent_id));
        setTasks(filtered);
        setError(null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTasks();
    const timer = setInterval(loadTasks, 30000);
    return () => clearInterval(timer);
  }, []);

  async function approveTask(id: number) {
    if (actionInProgress) return;
    setActionInProgress(id);
    try {
      await api(`/api/agents/tasks/${id}/approve`, { method: 'PUT' });
      setTasks(prev => prev.filter(t => t.id !== id));
      if (expandedId === id) setExpandedId(null);
      if (editingId === id) setEditingId(null);
      if (rejectingId === id) setRejectingId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to approve task');
    } finally {
      setActionInProgress(null);
    }
  }

  async function rejectTask(id: number) {
    if (actionInProgress) return;
    setActionInProgress(id);
    try {
      await api(`/api/agents/tasks/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ feedback: rejectFeedback }),
      });
      setTasks(prev => prev.filter(t => t.id !== id));
      setRejectingId(null);
      setRejectFeedback('');
      if (expandedId === id) setExpandedId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to reject task');
    } finally {
      setActionInProgress(null);
    }
  }

  async function approveAll() {
    if (approvingAll || tasks.length === 0) return;
    setApprovingAll(true);
    try {
      await Promise.all(
        tasks.map(t => api(`/api/agents/tasks/${t.id}/approve`, { method: 'PUT' }))
      );
      setTasks([]);
      setExpandedId(null);
      setEditingId(null);
      setRejectingId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to approve all tasks');
      loadTasks();
    } finally {
      setApprovingAll(false);
    }
  }

  function toggleExpand(id: number) {
    setExpandedId(expandedId === id ? null : id);
  }

  function startEditing(task: ApprovalTask) {
    if (editingId === task.id) {
      setEditingId(null);
      return;
    }
    setEditContent(parseContent(task));
    setEditingId(task.id);
    setRejectingId(null);
  }

  function startRejecting(id: number) {
    if (rejectingId === id) {
      setRejectingId(null);
      setRejectFeedback('');
      return;
    }
    setRejectingId(id);
    setRejectFeedback('');
    setEditingId(null);
  }

  // Loading skeleton
  if (loading && tasks.length === 0) {
    return (
      <div className="p-8 max-w-5xl bg-gray-950 min-h-screen">
        <div className="mb-6">
          <div className="h-8 w-64 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-800/50 rounded animate-pulse mt-2" />
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="h-5 w-20 bg-gray-800 rounded" />
                <div className="h-5 w-64 bg-gray-800 rounded" />
              </div>
              <div className="flex gap-3 mt-3">
                <div className="h-3 w-24 bg-gray-800/50 rounded" />
                <div className="h-3 w-32 bg-gray-800/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tasks.length > 0
              ? `${tasks.length} item${tasks.length !== 1 ? 's' : ''} awaiting approval`
              : 'Review marketing content before it goes live'}
          </p>
        </div>
        {tasks.length > 0 && (
          <button
            onClick={approveAll}
            disabled={approvingAll}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            <Icon name="check" className="w-4 h-4" />
            {approvingAll ? 'Approving...' : `Approve All (${tasks.length})`}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-400 bg-red-500/[0.06] border border-red-500/20 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="alert" className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400/60 hover:text-red-400 text-sm ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && tasks.length === 0 && !error && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-12 text-center">
          <Icon name="check" className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            All caught up! No marketing content awaiting approval.
          </p>
        </div>
      )}

      {/* Approval cards */}
      <div className="space-y-3">
        {tasks.map(task => {
          const contentType = inferContentType(task);
          const content = parseContent(task);
          const isExpanded = expandedId === task.id;
          const isEditing = editingId === task.id;
          const isRejecting = rejectingId === task.id;
          const isBusy = actionInProgress === task.id;

          return (
            <div
              key={task.id}
              className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden transition hover:border-gray-700/50"
            >
              {/* Card header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(task.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${TYPE_BADGE_COLORS[contentType]}`}
                      >
                        {contentType}
                      </span>
                      <h3 className="text-sm font-medium text-white truncate">
                        {task.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] uppercase tracking-wider text-gray-500">
                        {task.agent_id}
                      </span>
                      <span className="text-gray-700">|</span>
                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                        <Icon name="clock" className="w-3 h-3" />
                        {timeAgo(task.created_at)}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs mt-1 shrink-0">
                    {isExpanded ? '\u25B2' : '\u25BC'}
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-gray-800/50 p-4 bg-gray-950/30 space-y-4">
                  {/* Content preview */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-gray-500 block mb-1.5">
                      Content
                    </span>
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={6}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 resize-y focus:border-indigo-500/50 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {content}
                      </p>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Type: {task.type}</span>
                    <span>Agent: {task.agent_id}</span>
                    <span>Created: {new Date(task.created_at + 'Z').toLocaleString()}</span>
                    {task.model_used && <span>Model: {task.model_used}</span>}
                  </div>

                  {/* Reject feedback */}
                  {isRejecting && (
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase tracking-wider text-gray-500 block">
                        Rejection Feedback
                      </span>
                      <textarea
                        value={rejectFeedback}
                        onChange={e => setRejectFeedback(e.target.value)}
                        placeholder="Why is this being rejected? Provide guidance for the agent..."
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 resize-none focus:border-red-500/50 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        approveTask(task.id);
                      }}
                      disabled={isBusy}
                      className="bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg px-3 py-1.5 transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Icon name="check" className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        startEditing(task);
                      }}
                      disabled={isBusy}
                      className="bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 transition disabled:opacity-50"
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit'}
                    </button>
                    {isRejecting ? (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          rejectTask(task.id);
                        }}
                        disabled={isBusy || !rejectFeedback.trim()}
                        className="bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg px-3 py-1.5 transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Icon name="alert" className="w-3.5 h-3.5" />
                        Confirm Reject
                      </button>
                    ) : (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          startRejecting(task.id);
                        }}
                        disabled={isBusy}
                        className="bg-red-600/30 hover:bg-red-600/50 text-red-400 text-sm rounded-lg px-3 py-1.5 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                    {isRejecting && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          startRejecting(task.id);
                        }}
                        className="text-gray-500 hover:text-gray-300 text-sm px-2 py-1.5 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

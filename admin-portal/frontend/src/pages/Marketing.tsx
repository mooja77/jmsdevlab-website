import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface MarketingDashboard {
  stats: {
    leads_awaiting: number;
    content_in_pipeline: number;
    social_posts_this_week: number;
    approvals_pending: number;
  };
  leads: BarkLead[];
  lead_tasks: Task[];
  content_pipeline: {
    drafting: Task[];
    seo: Task[];
    review: Task[];
    approved: Task[];
    social: Task[];
  };
  recent_activity: Task[];
  next_action: { type: string; title: string; task_id: number } | null;
}

interface BarkLead {
  id: string;
  first_name: string;
  location: string;
  business_type: string;
  bark_category: string;
  status: string;
  confidence: number;
  matched_name: string;
  matched_company: string;
  created_at: string;
}

interface Task {
  id: number;
  agent_id: string;
  type: string;
  status: string;
  title: string;
  output_json: string | null;
  created_at: string;
  completed_at: string | null;
}

const STAT_CARDS = [
  { key: 'leads_awaiting', label: 'Leads Awaiting', color: 'text-amber-400', bg: 'border-amber-500/20' },
  { key: 'content_in_pipeline', label: 'Content Pipeline', color: 'text-blue-400', bg: 'border-blue-500/20' },
  { key: 'social_posts_this_week', label: 'Social This Week', color: 'text-purple-400', bg: 'border-purple-500/20' },
  { key: 'approvals_pending', label: 'Approvals Pending', color: 'text-emerald-400', bg: 'border-emerald-500/20' },
] as const;

const PIPELINE_COLS = [
  { key: 'drafting', label: 'DRAFTING', border: 'border-blue-500' },
  { key: 'seo', label: 'SEO', border: 'border-purple-500' },
  { key: 'review', label: 'REVIEW', border: 'border-amber-500' },
  { key: 'approved', label: 'APPROVED', border: 'border-emerald-500' },
] as const;

function timeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function statusColor(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'found': case 'matched': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'contacted': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'won': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

export default function Marketing() {
  const navigate = useNavigate();
  const [data, setData] = useState<MarketingDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<MarketingDashboard>('/api/marketing/dashboard')
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-800 rounded-xl" />)}
      </div>
      <div className="h-64 bg-gray-800 rounded-xl" />
    </div>
  );

  if (error) return (
    <div className="text-red-400 bg-red-500/[0.06] border border-red-500/20 rounded-lg p-4">{error}</div>
  );

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Marketing Command Centre</h1>
          <p className="text-sm text-gray-400 mt-1">Lead pipeline, content, and social media at a glance</p>
        </div>
        {data.next_action && (
          <button
            onClick={() => navigate('/marketing/approvals')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg px-4 py-2 transition flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {data.next_action.title.substring(0, 40)}
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div key={card.key} className={`bg-gray-900/50 border ${card.bg} rounded-xl px-4 py-3`}>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider">{card.label}</div>
            <div className={`text-2xl font-semibold mt-1 ${card.color}`}>
              {card.key === 'social_posts_this_week'
                ? `${data.stats[card.key]}/3`
                : data.stats[card.key as keyof typeof data.stats]}
            </div>
          </div>
        ))}
      </div>

      {/* Lead Pipeline */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Lead Pipeline</h2>
          <button
            onClick={() => navigate('/bark')}
            className="text-xs text-gray-500 hover:text-gray-300 transition"
          >
            View All →
          </button>
        </div>
        <div className="p-4 space-y-3">
          {data.leads.length === 0 ? (
            <div className="text-gray-500 text-sm py-6 text-center">No recent leads</div>
          ) : (
            data.leads.slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 flex items-center justify-center text-xs font-medium text-white">
                    {(lead.first_name || '?')[0]}
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">
                      {lead.matched_name || lead.first_name || 'Unknown'}
                      {lead.matched_company && <span className="text-gray-400 font-normal"> — {lead.matched_company}</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lead.location || 'Unknown location'} · {lead.bark_category || lead.business_type || 'General'}
                      {lead.confidence > 0 && <span className="ml-2 text-amber-400">Score: {lead.confidence}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <span className="text-[10px] text-gray-600">{timeAgo(lead.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Content Pipeline Mini-Kanban */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Content Pipeline</h2>
          <button
            onClick={() => navigate('/marketing/content')}
            className="text-xs text-gray-500 hover:text-gray-300 transition"
          >
            View All →
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {PIPELINE_COLS.map(col => {
            const tasks = data.content_pipeline[col.key as keyof typeof data.content_pipeline] as Task[];
            return (
              <div key={col.key} className="space-y-2">
                <div className={`border-t-2 ${col.border} pt-2`}>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{col.label}</span>
                    <span className="text-gray-600">{tasks.length}</span>
                  </div>
                </div>
                {tasks.length === 0 ? (
                  <div className="text-gray-700 text-xs py-4 text-center">—</div>
                ) : (
                  tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="bg-gray-800/50 rounded-lg px-3 py-2 text-xs">
                      <div className="text-gray-300 truncate">{task.title.substring(0, 40)}</div>
                      <div className="text-gray-600 mt-1">{task.agent_id} · {timeAgo(task.created_at)}</div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-800/30">
          {data.recent_activity.length === 0 ? (
            <div className="text-gray-500 text-sm py-6 text-center">No recent marketing activity</div>
          ) : (
            data.recent_activity.slice(0, 8).map(task => (
              <div key={task.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <span className="text-sm text-gray-300">{task.agent_id}</span>
                    <span className="text-sm text-gray-500"> — {task.title.substring(0, 50)}</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-600">{timeAgo(task.completed_at || task.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

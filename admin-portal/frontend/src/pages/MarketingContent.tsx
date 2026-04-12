import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface ContentTask {
  id: string;
  title: string;
  task_type: string;
  status: string;
  agent_name: string;
  created_at: string;
  output_json?: {
    summary?: string;
  };
}

interface SocialTask {
  id: string;
  platform: string;
  caption: string;
  status: string;
  created_at: string;
}

interface ContentPipeline {
  planned: ContentTask[];
  writing: ContentTask[];
  seo: ContentTask[];
  review: ContentTask[];
  published: ContentTask[];
  social: SocialTask[];
}

interface MarketingDashboard {
  content_pipeline: ContentPipeline;
}

type TabKey = 'pipeline' | 'social';

const COLUMNS: Array<{
  key: keyof Omit<ContentPipeline, 'social'>;
  label: string;
  borderColor: string;
  countBg: string;
}> = [
  { key: 'planned', label: 'PLANNED', borderColor: 'border-t-gray-500', countBg: 'bg-gray-700/50 text-gray-300' },
  { key: 'writing', label: 'WRITING', borderColor: 'border-t-blue-500', countBg: 'bg-blue-500/20 text-blue-300' },
  { key: 'seo', label: 'SEO', borderColor: 'border-t-purple-500', countBg: 'bg-purple-500/20 text-purple-300' },
  { key: 'review', label: 'REVIEW', borderColor: 'border-t-amber-500', countBg: 'bg-amber-500/20 text-amber-300' },
  { key: 'published', label: 'PUBLISHED', borderColor: 'border-t-emerald-500', countBg: 'bg-emerald-500/20 text-emerald-300' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MarketingContent() {
  const [data, setData] = useState<MarketingDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('pipeline');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    api<MarketingDashboard>('/api/marketing/dashboard')
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-64" />
        <div className="h-4 bg-gray-800 rounded w-96" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-48 bg-gray-800/50 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-400 bg-red-500/[0.06] border border-red-500/20 rounded-lg p-4">{error}</div>;
  if (!data) return null;

  const pipeline = data.content_pipeline;

  return (
    <div className="space-y-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Marketing Content</h1>
        <p className="text-gray-400 mt-1 text-sm">Content pipeline and social calendar</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-800/50">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'pipeline'
              ? 'border-b-2 border-indigo-500 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Pipeline
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === 'social'
              ? 'border-b-2 border-indigo-500 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Social Calendar
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'pipeline' ? (
        <PipelineView
          pipeline={pipeline}
          expandedCard={expandedCard}
          onToggleCard={(id) => setExpandedCard(expandedCard === id ? null : id)}
        />
      ) : (
        <SocialCalendarView socialTasks={pipeline.social || []} />
      )}
    </div>
  );
}

/* ─── Pipeline (Kanban) View ─────────────────────────────────────────── */

function PipelineView({
  pipeline,
  expandedCard,
  onToggleCard,
}: {
  pipeline: ContentPipeline;
  expandedCard: string | null;
  onToggleCard: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {COLUMNS.map((col) => {
        const tasks = pipeline[col.key] || [];
        return (
          <div
            key={col.key}
            className={`bg-gray-900/50 border border-gray-800/50 rounded-xl border-t-2 ${col.borderColor} min-h-[200px] flex flex-col`}
          >
            {/* Column Header */}
            <div className="px-4 py-3 border-b border-gray-800/50 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{col.label}</h3>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${col.countBg}`}>
                {tasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="p-3 space-y-2 flex-1">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleCard(task.id)}
                    className="bg-gray-800/60 border border-gray-700/40 rounded-lg p-3 cursor-pointer hover:border-gray-600/60 transition-colors"
                  >
                    <p className="text-sm font-medium text-white leading-snug">
                      {task.title.length > 40 ? task.title.slice(0, 40) + '...' : task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-gray-500 bg-gray-700/50 px-1.5 py-0.5 rounded">
                        {task.task_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-gray-400">{task.agent_name}</span>
                      <span className="text-[10px] text-gray-500">{formatRelativeTime(task.created_at)}</span>
                    </div>

                    {/* Expanded content */}
                    {expandedCard === task.id && task.output_json?.summary && (
                      <div className="mt-3 pt-3 border-t border-gray-700/40">
                        <p className="text-xs text-gray-400 leading-relaxed">{task.output_json.summary}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full min-h-[100px]">
                  <p className="text-xs text-gray-600">No items</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Social Calendar View ───────────────────────────────────────────── */

function SocialCalendarView({ socialTasks }: { socialTasks: SocialTask[] }) {
  const weekDays = getCurrentWeekDays();
  const postsThisWeek = socialTasks.filter((task) => {
    const taskDate = new Date(task.created_at).toDateString();
    return weekDays.some((day) => day.date.toDateString() === taskDate);
  });

  return (
    <div className="space-y-4">
      {/* Week grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day, i) => {
          const dayTasks = socialTasks.filter(
            (task) => new Date(task.created_at).toDateString() === day.date.toDateString()
          );
          const isToday = day.date.toDateString() === new Date().toDateString();

          return (
            <div
              key={i}
              className={`bg-gray-900/50 border rounded-xl min-h-[200px] flex flex-col ${
                isToday ? 'border-indigo-500/40' : 'border-gray-800/50'
              }`}
            >
              {/* Day header */}
              <div className={`px-3 py-2 border-b border-gray-800/50 text-center ${
                isToday ? 'bg-indigo-500/10' : ''
              }`}>
                <p className="text-[11px] text-gray-500 uppercase font-medium">{DAY_LABELS[i]}</p>
                <p className={`text-sm font-semibold ${isToday ? 'text-indigo-400' : 'text-white'}`}>
                  {day.date.getDate()}
                </p>
              </div>

              {/* Posts */}
              <div className="p-2 space-y-2 flex-1">
                {dayTasks.length > 0 ? (
                  dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-800/60 border border-gray-700/40 rounded-lg p-2"
                    >
                      {/* Platform badge */}
                      <span
                        className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mb-1.5 ${
                          task.platform.toLowerCase() === 'instagram'
                            ? 'bg-pink-500/20 text-pink-300'
                            : task.platform.toLowerCase() === 'facebook'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-gray-700/50 text-gray-300'
                        }`}
                      >
                        {task.platform}
                      </span>

                      {/* Caption preview */}
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {task.caption.length > 60 ? task.caption.slice(0, 60) + '...' : task.caption}
                      </p>

                      {/* Status badge */}
                      <div className="mt-1.5">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            task.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : task.status === 'scheduled'
                              ? 'bg-amber-500/20 text-amber-300'
                              : task.status === 'draft'
                              ? 'bg-gray-700/50 text-gray-400'
                              : 'bg-gray-700/50 text-gray-400'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[80px]">
                    <span className="text-gray-700 text-lg leading-none select-none">+</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly counter */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-5 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Posts this week:{' '}
          <span className={`font-semibold ${postsThisWeek.length >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {postsThisWeek.length}
          </span>
          <span className="text-gray-500"> / 3 target</span>
        </p>
        {postsThisWeek.length >= 3 ? (
          <span className="text-[11px] text-emerald-400 font-medium">Target reached</span>
        ) : (
          <span className="text-[11px] text-gray-500">
            {3 - postsThisWeek.length} more to go
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getCurrentWeekDays(): Array<{ date: Date }> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // getDay() returns 0 for Sunday; adjust so Monday = 0
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return { date };
  });
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

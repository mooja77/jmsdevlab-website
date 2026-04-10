import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Conversation {
  id: string;
  app_id: string;
  message_count: number;
  first_message: string;
  created_at: string;
  last_message_at: string;
}

export default function ChatLog() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<{ today: number; week: number; messagesToday: number }>({ today: 0, week: 0, messagesToday: 0 });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string; created_at: string }[]>([]);

  useEffect(() => {
    api<{ conversations: Conversation[]; stats: typeof stats }>('/api/chat/conversations?days=30')
      .then(d => { setConvs(d.conversations || []); setStats(d.stats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleConv(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    try {
      const res = await api<{ conversations: any[] }>(`/api/chat/conversations?days=90`);
      // Get messages for this conversation from the messages table
      // For now, we just show the conversation data we have
      setMessages([]);
    } catch {}
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading chat logs...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Chat</h1>
        <p className="text-sm text-gray-400 mt-1">Customer conversations from the chat widget</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">Today</p>
          <p className="text-xl font-semibold text-white mt-1">{stats.today}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">This Week</p>
          <p className="text-xl font-semibold text-white mt-1">{stats.week}</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">Messages Today</p>
          <p className="text-xl font-semibold text-white mt-1">{stats.messagesToday}</p>
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Recent Conversations</h2>
        {convs.length === 0 ? (
          <p className="text-sm text-gray-600">No conversations yet. The chat widget will log conversations here once users start chatting.</p>
        ) : (
          <div className="space-y-2">
            {convs.map(c => (
              <div key={c.id} className="border-b border-gray-800/30 last:border-0">
                <button
                  onClick={() => toggleConv(c.id)}
                  className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-800/20 rounded px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded uppercase">{c.app_id}</span>
                    <span className="text-sm text-gray-300 truncate">{c.first_message || '...'}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-600">{c.message_count} msgs</span>
                    <span className="text-[10px] text-gray-600">{timeAgo(c.last_message_at)}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white mb-3">Embed Code</h2>
        <p className="text-xs text-gray-400 mb-2">Add this to any site to enable the chat widget:</p>
        <code className="block text-xs text-blue-400 bg-gray-800/50 rounded-lg p-3 break-all">
          {'<script src="https://jms-admin-portal.mooja77.workers.dev/api/chat/widget.js" data-app="YOUR_APP_ID"></script>'}
        </code>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

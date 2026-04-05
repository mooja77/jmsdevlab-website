import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';

const COLUMNS = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const;
const SOURCE_LABELS: Record<string, string> = { bark: 'Bark', email: 'Email', shopify: 'Shopify', social: 'Social', manual: 'Manual' };

interface Lead {
  id: string;
  source: string;
  name: string;
  email: string;
  company: string;
  service_type: string;
  status: string;
  value_estimate: number;
  notes: string;
  next_action: string;
  next_action_date: string;
  created_at: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  function loadLeads() {
    api<{ leads: Lead[]; pipeline: Record<string, Lead[]> }>('/api/leads')
      .then(d => { setLeads(d.leads); setPipeline(d.pipeline); })
      .finally(() => setLoading(false));
  }

  useEffect(loadLeads, []);

  async function updateLead(id: string, updates: Partial<Lead>) {
    await api(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    loadLeads();
    if (selected?.id === id) setSelected({ ...selected, ...updates } as Lead);
  }

  async function addLead(data: Partial<Lead>) {
    await api('/api/leads', { method: 'POST', body: JSON.stringify(data) });
    setShowAdd(false);
    loadLeads();
  }

  if (loading) return <div className="text-gray-400">Loading leads...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Lead Pipeline</h1>
          <p className="text-sm text-gray-400 mt-1">{leads.length} total leads</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Lead
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(status => (
          <div key={status} className="min-w-[240px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">{status}</h3>
              <span className="text-[11px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                {(pipeline[status] || []).length}
              </span>
            </div>
            <div className="space-y-2">
              {(pipeline[status] || []).map(lead => (
                <button
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className="w-full text-left bg-gray-900/50 border border-gray-800/50 rounded-lg p-3 hover:border-gray-700/50 transition-all"
                >
                  <p className="text-sm font-medium text-gray-200 truncate">{lead.name || 'Unknown'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-gray-500">{SOURCE_LABELS[lead.source] || lead.source}</span>
                    {lead.service_type && <span className="text-[11px] text-gray-600">&middot; {lead.service_type}</span>}
                  </div>
                  {lead.value_estimate > 0 && (
                    <p className="text-xs text-emerald-400 mt-1.5">EUR {lead.value_estimate.toLocaleString()}</p>
                  )}
                  <p className="text-[11px] text-gray-600 mt-1">{formatDaysAgo(lead.created_at)}</p>
                </button>
              ))}
              {(pipeline[status] || []).length === 0 && (
                <div className="border border-dashed border-gray-800/50 rounded-lg p-4 text-center text-[11px] text-gray-700">
                  No leads
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lead Detail Panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-800 z-50 overflow-y-auto shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{selected.name || 'Lead'}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <Field label="Status">
                <select
                  value={selected.status}
                  onChange={e => updateLead(selected.id, { status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
                >
                  {COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Source"><Badge status={selected.source} /></Field>
              {selected.email && <Field label="Email"><span className="text-sm text-gray-300">{selected.email}</span></Field>}
              {selected.company && <Field label="Company"><span className="text-sm text-gray-300">{selected.company}</span></Field>}
              {selected.service_type && <Field label="Service"><span className="text-sm text-gray-300">{selected.service_type}</span></Field>}
              <Field label="Value Estimate">
                <input
                  type="number"
                  defaultValue={selected.value_estimate}
                  onBlur={e => updateLead(selected.id, { value_estimate: Number(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
                />
              </Field>
              <Field label="Notes">
                <textarea
                  defaultValue={selected.notes || ''}
                  onBlur={e => updateLead(selected.id, { notes: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 resize-none"
                />
              </Field>
              <Field label="Next Action">
                <input
                  type="text"
                  defaultValue={selected.next_action || ''}
                  onBlur={e => updateLead(selected.id, { next_action: e.target.value })}
                  placeholder="e.g., Send proposal"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
                />
              </Field>
              <p className="text-[11px] text-gray-600 pt-2">Created {formatDaysAgo(selected.created_at)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onSave={addLead} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function AddLeadModal({ onClose, onSave }: { onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({ name: '', email: '', source: 'manual', service_type: 'web_design', value_estimate: 0, notes: '' });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-white mb-4">Add Lead</h2>
        <div className="space-y-3">
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200" />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200" />
          <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200">
            <option value="manual">Manual</option>
            <option value="bark">Bark</option>
            <option value="email">Email</option>
            <option value="shopify">Shopify</option>
            <option value="social">Social</option>
          </select>
          <select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200">
            <option value="web_design">Web Design</option>
            <option value="shopify_app">Shopify App</option>
            <option value="custom_dev">Custom Dev</option>
            <option value="seo">SEO</option>
          </select>
          <input placeholder="Value estimate (EUR)" type="number" value={form.value_estimate || ''} onChange={e => setForm({ ...form, value_estimate: Number(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200" />
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 resize-none" />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500">Save</button>
        </div>
      </div>
    </div>
  );
}

function formatDaysAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

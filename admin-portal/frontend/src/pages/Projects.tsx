import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/Icon';

interface Project {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  status: string;
  value: number;
  currency: string;
  start_date: string;
  target_end_date: string;
  notes: string;
  total_milestones: number;
  completed_milestones: number;
  total_invoiced: number;
  total_paid: number;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);

  function load() {
    api<{ projects: Project[] }>('/api/projects').then(d => setProjects(d.projects)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function selectProject(id: string) {
    setSelected(id);
    api(`/api/projects/${id}`).then(setDetail);
  }

  if (loading) return <div className="text-gray-400">Loading projects...</div>;

  const active = projects.filter(p => p.status === 'active');
  const proposals = projects.filter(p => p.status === 'proposal' || p.status === 'prospect');
  const completed = projects.filter(p => p.status === 'completed');

  const totalPipeline = [...active, ...proposals].reduce((s, p) => s + p.value, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-gray-400 mt-1">Custom development services</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Pipeline Value</div>
          <div className="text-xl font-semibold mt-1 text-white tabular-nums">EUR {totalPipeline.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Active</div>
          <div className="text-xl font-semibold mt-1 text-emerald-400">{active.length}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Proposals</div>
          <div className="text-xl font-semibold mt-1 text-amber-400">{proposals.length}</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3">
          <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Completed</div>
          <div className="text-xl font-semibold mt-1 text-gray-300">{completed.length}</div>
        </div>
      </div>

      {/* Project Cards */}
      <div className="space-y-3">
        {projects.map(project => (
          <button
            key={project.id}
            onClick={() => selectProject(project.id)}
            className={`w-full text-left bg-gray-900/50 border rounded-xl p-5 transition-all ${
              selected === project.id ? 'border-indigo-500/50' : 'border-gray-800/50 hover:border-gray-700/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-medium text-white">{project.name}</h3>
                  <Badge status={project.status} />
                </div>
                <p className="text-sm text-gray-400 mt-1">{project.client_name} &middot; {project.currency} {project.value.toLocaleString()}</p>
              </div>
              {project.total_milestones > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-400 tabular-nums">{project.completed_milestones}/{project.total_milestones} milestones</p>
                  <div className="w-24 bg-gray-800 rounded-full h-1.5 mt-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${(project.completed_milestones / project.total_milestones) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {project.notes && (
              <p className="text-xs text-gray-500 mt-3 line-clamp-2">{project.notes}</p>
            )}
          </button>
        ))}

        {projects.length === 0 && (
          <div className="bg-gray-900/30 border border-dashed border-gray-800/50 rounded-xl p-8 text-center">
            <Icon name="projects" className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No projects yet</p>
            <p className="text-xs text-gray-600 mt-1">Custom dev projects will appear here</p>
          </div>
        )}
      </div>

      {/* Project Detail Panel */}
      {selected && detail && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{detail.project.name} — Milestones</h2>
          {detail.milestones.length > 0 ? (
            <div className="space-y-3">
              {detail.milestones.map((ms: any) => (
                <div key={ms.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    ms.completed_at ? 'border-emerald-500 bg-emerald-500/20' : 'border-gray-600'
                  }`}>
                    {ms.completed_at && <Icon name="check" className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${ms.completed_at ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{ms.title}</p>
                    {ms.due_date && <p className="text-[11px] text-gray-600">Due: {ms.due_date}</p>}
                  </div>
                  {ms.invoice_amount > 0 && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm tabular-nums text-gray-300">EUR {ms.invoice_amount.toLocaleString()}</p>
                      <Badge status={ms.invoice_status} className="mt-0.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No milestones defined yet</p>
          )}
        </div>
      )}
    </div>
  );
}

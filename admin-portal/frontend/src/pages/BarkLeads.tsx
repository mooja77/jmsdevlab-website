import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface BarkLead {
  id: string;
  gmail_message_id: string;
  first_name: string;
  location: string;
  business_type: string;
  project_description: string;
  budget: string;
  timeline: string;
  hiring_intent: string;
  bark_category: string;
  partial_phone: string;
  partial_email: string;
  phone_prefix: string;
  email_first_char: string;
  email_char_count: number;
  email_last_char: string;
  email_domain: string;
  received_at: string;
  status: string;
  matched_name: string;
  matched_email: string;
  matched_phone: string;
  matched_linkedin: string;
  matched_website: string;
  matched_company: string;
  confidence: number;
  research_notes: string;
  search_results_json: string;
  lead_id: string;
  created_at: string;
  priority_score?: number;
  priority_label?: 'hot' | 'warm' | 'cold';
}

const PRIORITY_COLORS: Record<string, string> = {
  hot: 'bg-red-500/20 text-red-400',
  warm: 'bg-amber-500/20 text-amber-400',
  cold: 'bg-gray-500/20 text-gray-500',
};

interface ResearchCandidate {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  source: string;
  score: number;
  snippet?: string;
}

interface StrategyResult {
  strategy: string;
  status: 'ok' | 'skipped' | 'error';
  reason?: string;
  queries?: string[];
  candidates: ResearchCandidate[];
}

interface ResearchResults {
  strategies: StrategyResult[];
  topCandidates: ResearchCandidate[];
  researchedAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-500/20 text-gray-400',
  researching: 'bg-amber-500/20 text-amber-400',
  found: 'bg-emerald-500/20 text-emerald-400',
  contacted: 'bg-blue-500/20 text-blue-400',
  dismissed: 'bg-red-500/20 text-red-400',
};

function timeAgo(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function buildSearchLinks(lead: BarkLead) {
  const name = encodeURIComponent(lead.first_name);
  const loc = encodeURIComponent(lead.location || '');
  const biz = encodeURIComponent(lead.business_type || lead.bark_category || '');
  const links = [
    { label: 'Google', url: `https://www.google.com/search?q="${lead.first_name}"+${lead.business_type || lead.bark_category}+${lead.location}` },
    { label: 'LinkedIn', url: `https://www.google.com/search?q="${lead.first_name}"+${lead.location}+site:linkedin.com/in` },
    { label: 'Facebook', url: `https://www.google.com/search?q="${lead.first_name}"+${lead.business_type || lead.bark_category}+${lead.location}+site:facebook.com` },
    { label: 'Google Maps', url: `https://www.google.com/maps/search/${biz}+${loc}` },
    { label: 'Golden Pages', url: `https://www.goldenpages.ie/q/${biz}/where/${loc}/` },
  ];
  if (lead.business_type?.toLowerCase().includes('charit')) {
    links.push({ label: 'Charities Register', url: 'https://www.charitiesregulator.ie/en/information-for-the-public/search-the-register-of-charities' });
  }
  links.push({ label: 'CRO', url: 'https://core.cro.ie/' });
  return links;
}

function matchesPartialEmail(candidate: string, lead: BarkLead): boolean {
  if (!candidate || !lead.email_first_char) return false;
  const [local, domain] = candidate.toLowerCase().split('@');
  if (!local || !domain) return false;
  return (
    local[0] === lead.email_first_char.toLowerCase() &&
    local.length === lead.email_char_count &&
    local[local.length - 1] === lead.email_last_char.toLowerCase() &&
    domain === (lead.email_domain || '').toLowerCase()
  );
}

function parseProjectDetails(desc: string): Record<string, string> {
  try { return JSON.parse(desc); } catch { return {}; }
}

export default function BarkLeads() {
  const [leads, setLeads] = useState<BarkLead[]>([]);
  const [selected, setSelected] = useState<BarkLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Editable fields for research
  const [matchName, setMatchName] = useState('');
  const [matchEmail, setMatchEmail] = useState('');
  const [matchPhone, setMatchPhone] = useState('');
  const [matchLinkedin, setMatchLinkedin] = useState('');
  const [matchWebsite, setMatchWebsite] = useState('');
  const [matchCompany, setMatchCompany] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('new');
  const [emailMatch, setEmailMatch] = useState<boolean | null>(null);
  const [researching, setResearching] = useState(false);
  const [researchResults, setResearchResults] = useState<ResearchResults | null>(null);

  function loadLeads() {
    api<{ leads: BarkLead[]; byStatus: Record<string, number>; lastScan: string | null }>('/api/bark')
      .then(d => { setLeads(d.leads); setStats(d.byStatus); setLastScan(d.lastScan); })
      .finally(() => setLoading(false));
  }

  async function scanGmail() {
    setScanning(true);
    try {
      const result = await api<{ scanned: number; newLeads: string[]; errors: string[] }>('/api/bark/scan-gmail', { method: 'POST' });
      if (result.newLeads.length > 0) {
        loadLeads();
      }
      alert(result.newLeads.length > 0
        ? `Found ${result.newLeads.length} new leads:\n${result.newLeads.join('\n')}`
        : `Scanned ${result.scanned} emails. No new leads.${result.errors.length ? '\nErrors: ' + result.errors.join(', ') : ''}`);
    } catch (e) {
      alert('Scan failed: ' + String(e));
    }
    setScanning(false);
  }

  useEffect(() => { loadLeads(); }, []);

  function selectLead(lead: BarkLead) {
    setSelected(lead);
    setMatchName(lead.matched_name || '');
    setMatchEmail(lead.matched_email || '');
    setMatchPhone(lead.matched_phone || '');
    setMatchLinkedin(lead.matched_linkedin || '');
    setMatchWebsite(lead.matched_website || '');
    setMatchCompany(lead.matched_company || '');
    setConfidence(lead.confidence || 0);
    setNotes(lead.research_notes || '');
    setStatus(lead.status || 'new');
    setEmailMatch(null);
    setResearchResults(lead.search_results_json ? JSON.parse(lead.search_results_json) : null);
  }

  async function runResearch() {
    if (!selected) return;
    setResearching(true);
    try {
      const result = await api<{ strategies: StrategyResult[]; topCandidates: ResearchCandidate[]; autoFilled: boolean }>(`/api/bark/${selected.id}/research`, { method: 'POST' });
      setResearchResults({ strategies: result.strategies, topCandidates: result.topCandidates, researchedAt: new Date().toISOString() });
      if (result.autoFilled) {
        loadLeads();
        // Re-fetch the lead to get auto-filled values
        const updated = await api<{ lead: BarkLead }>(`/api/bark/${selected.id}`);
        if (updated.lead) selectLead(updated.lead);
      } else {
        setStatus('researching');
      }
    } catch (e) {
      console.error('Research failed:', e);
    } finally {
      setResearching(false);
    }
  }

  function useCandidate(c: ResearchCandidate) {
    if (c.name) setMatchName(c.name);
    if (c.email) { setMatchEmail(c.email); setEmailMatch(null); }
    if (c.phone) setMatchPhone(c.phone);
    if (c.website) setMatchWebsite(c.website);
    if (c.linkedin) setMatchLinkedin(c.linkedin);
    if (c.company) setMatchCompany(c.company);
    setConfidence(c.score);
    setStatus('found');
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    await api(`/api/bark/${selected.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        matched_name: matchName || null,
        matched_email: matchEmail || null,
        matched_phone: matchPhone || null,
        matched_linkedin: matchLinkedin || null,
        matched_website: matchWebsite || null,
        matched_company: matchCompany || null,
        confidence,
        research_notes: notes || null,
      }),
    });
    setSaving(false);
    loadLeads();
    setSelected({ ...selected, status, matched_name: matchName, matched_email: matchEmail, matched_phone: matchPhone, matched_linkedin: matchLinkedin, matched_website: matchWebsite, matched_company: matchCompany, confidence, research_notes: notes });
  }

  async function promote() {
    if (!selected) return;
    if (!confirm(`Promote ${selected.first_name} to the leads pipeline?`)) return;
    await save();
    const result = await api<{ leadId: string }>(`/api/bark/${selected.id}/promote`, { method: 'POST' });
    if (result.leadId) {
      alert(`Lead created: ${result.leadId}`);
      loadLeads();
      setSelected(null);
    }
  }

  function checkEmail() {
    if (matchEmail && selected) {
      setEmailMatch(matchesPartialEmail(matchEmail, selected));
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500 text-sm">Loading bark leads...</div>
      </div>
    );
  }

  const details = selected?.project_description ? parseProjectDetails(selected.project_description) : {};

  return (
    <div className="flex h-[calc(100vh-2rem)]">
      {/* Left: Lead List */}
      <div className="w-80 flex-shrink-0 border-r border-gray-800/50 flex flex-col">
        <div className="px-4 pt-6 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-semibold text-white">Bark Leads</h1>
            <button onClick={scanGmail} disabled={scanning}
              className="px-2 py-1 text-[10px] font-medium rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50">
              {scanning ? 'Scanning...' : 'Scan Gmail'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500">{leads.length} leads</p>
            {lastScan && <p className="text-[10px] text-gray-600">Last scan: {timeAgo(lastScan)}</p>}
          </div>
          {/* Stats row */}
          <div className="flex gap-2 mt-3">
            {Object.entries(stats).map(([s, count]) => (
              <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_COLORS[s] || 'bg-gray-800 text-gray-400'}`}>
                {s}: {count}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {leads.map(lead => (
            <button
              key={lead.id}
              onClick={() => selectLead(lead)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                selected?.id === lead.id
                  ? 'bg-white/[0.08] border border-indigo-500/30'
                  : 'hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-white">{lead.first_name}</span>
                  {lead.received_at && (Date.now() - new Date(lead.received_at).getTime()) < 86400000 && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-blue-500/30 text-blue-300 font-bold uppercase">NEW</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {lead.priority_label && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[lead.priority_label]}`}>
                      {lead.priority_label}
                    </span>
                  )}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-gray-500">{lead.location || 'Unknown location'}</div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-600">{lead.bark_category || lead.business_type || ''}</span>
                {lead.budget && <span className="text-[10px] text-emerald-500/70">{lead.budget}</span>}
              </div>
              {lead.received_at && (
                <div className="text-[10px] text-gray-700 mt-0.5">{timeAgo(lead.received_at)}</div>
              )}
            </button>
          ))}
          {leads.length === 0 && (
            <div className="text-center py-12 text-gray-600 text-sm">
              No bark leads yet. Use Claude to scan your Gmail for Bark emails and POST them to /api/bark/scan.
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail Panel */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div className="p-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">{selected.first_name}</h2>
                <p className="text-sm text-gray-400">{selected.bark_category} — {selected.location}</p>
              </div>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="bg-gray-800 text-sm text-gray-300 rounded-lg px-3 py-1.5 border border-gray-700"
              >
                <option value="new">New</option>
                <option value="researching">Researching</option>
                <option value="found">Found</option>
                <option value="contacted">Contacted</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Project Details */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4 mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Project Details</h3>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                {selected.budget && (
                  <div><span className="text-gray-500">Budget:</span> <span className="text-white">{selected.budget}</span></div>
                )}
                {selected.timeline && (
                  <div><span className="text-gray-500">Timeline:</span> <span className="text-white">{selected.timeline}</span></div>
                )}
                {selected.hiring_intent && (
                  <div><span className="text-gray-500">Hiring:</span> <span className="text-white">{selected.hiring_intent}</span></div>
                )}
                {selected.business_type && (
                  <div><span className="text-gray-500">Business:</span> <span className="text-white">{selected.business_type}</span></div>
                )}
              </div>
              {Object.keys(details).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800/50 space-y-1.5">
                  {Object.entries(details).filter(([k]) => k !== 'quote').map(([key, val]) => (
                    <div key={key} className="text-[12px]">
                      <span className="text-gray-500">{key}:</span>{' '}
                      <span className="text-gray-300">{val}</span>
                    </div>
                  ))}
                  {details.quote && (
                    <div className="mt-2 p-2 bg-gray-800/50 rounded text-[12px] text-gray-300 italic">
                      "{details.quote}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Decoded Contact */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4 mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Decoded Contact</h3>
              <div className="space-y-2 text-[13px]">
                {selected.partial_phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-16">Phone:</span>
                    <code className="text-amber-400 bg-gray-800 px-2 py-0.5 rounded">{selected.partial_phone}</code>
                    {selected.phone_prefix && (
                      <span className="text-gray-600">prefix: {selected.phone_prefix}</span>
                    )}
                  </div>
                )}
                {selected.partial_email && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-16">Email:</span>
                    <code className="text-amber-400 bg-gray-800 px-2 py-0.5 rounded">{selected.partial_email}</code>
                  </div>
                )}
                {selected.email_domain && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-16">Decoded:</span>
                    <span className="text-emerald-400">
                      {selected.email_first_char}{'_'.repeat(Math.max(0, (selected.email_char_count || 2) - 2))}{selected.email_last_char}@{selected.email_domain}
                    </span>
                    <span className="text-gray-600 text-[11px]">({selected.email_char_count} chars before @)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Search Links */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4 mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Search Links</h3>
              <div className="flex flex-wrap gap-2">
                {buildSearchLinks(selected).map(link => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-[12px] font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700/50"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Auto Research */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Auto Research</h3>
                <button
                  onClick={runResearch}
                  disabled={researching}
                  className="px-3 py-1.5 text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {researching ? 'Researching...' : 'Run Research'}
                </button>
              </div>

              {researchResults && (
                <div className="space-y-3">
                  {/* Strategy status */}
                  <div className="space-y-1">
                    {researchResults.strategies.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <span className={s.status === 'ok' ? 'text-emerald-400' : s.status === 'skipped' ? 'text-gray-600' : 'text-red-400'}>
                          {s.status === 'ok' ? '✅' : s.status === 'skipped' ? '⚪' : '❌'}
                        </span>
                        <span className="text-gray-400">{s.strategy}</span>
                        {s.status === 'ok' && <span className="text-gray-600">({s.candidates.length} candidates)</span>}
                        {s.reason && <span className="text-gray-700">{s.reason}</span>}
                      </div>
                    ))}
                    {researchResults.strategies.some(s => s.queries) && (
                      <details className="mt-1">
                        <summary className="text-[10px] text-gray-600 cursor-pointer">Show queries</summary>
                        <div className="mt-1 space-y-0.5 pl-5">
                          {researchResults.strategies.filter(s => s.queries).flatMap(s => s.queries!).map((q, i) => (
                            <div key={i} className="text-[10px] text-gray-700">{q}</div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>

                  {/* Top candidates */}
                  {researchResults.topCandidates.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-800/50">
                      <div className="text-[11px] text-gray-500 font-medium">Top Candidates</div>
                      {researchResults.topCandidates.map((c, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${c.score >= 60 ? 'border-emerald-800/50 bg-emerald-950/20' : c.score >= 30 ? 'border-amber-800/50 bg-amber-950/20' : 'border-gray-800/50 bg-gray-800/20'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-bold ${c.score >= 60 ? 'text-emerald-400' : c.score >= 30 ? 'text-amber-400' : 'text-gray-500'}`}>
                                {c.score}%
                              </span>
                              <span className="text-[13px] text-white font-medium">{c.name || c.company || 'Unknown'}</span>
                            </div>
                            <span className="text-[9px] text-gray-600 uppercase">{c.source}</span>
                          </div>
                          {c.company && c.company !== c.name && <div className="text-[11px] text-gray-400">{c.company}</div>}
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px]">
                            {c.email && (
                              <span className="text-gray-400">
                                {c.email}
                                {selected && matchesPartialEmail(c.email, selected) && <span className="text-emerald-400 ml-1">MATCH</span>}
                              </span>
                            )}
                            {c.phone && (
                              <span className="text-gray-400">
                                {c.phone}
                                {selected?.phone_prefix && c.phone.replace(/[\s\-]/g, '').startsWith(selected.phone_prefix) && <span className="text-emerald-400 ml-1">PREFIX</span>}
                              </span>
                            )}
                            {c.website && (
                              <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 truncate max-w-[200px]">{c.website.replace(/^https?:\/\//, '')}</a>
                            )}
                            {c.linkedin && (
                              <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">LinkedIn</a>
                            )}
                          </div>
                          {c.snippet && <div className="text-[10px] text-gray-600 mt-1 line-clamp-2">{c.snippet}</div>}
                          <button
                            onClick={() => useCandidate(c)}
                            className="mt-2 px-2 py-1 text-[10px] font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                          >
                            Use This Match
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {researchResults.topCandidates.length === 0 && (
                    <div className="text-[11px] text-gray-600 py-2">No candidates found. Try the manual search links above.</div>
                  )}
                </div>
              )}

              {!researchResults && !researching && (
                <div className="text-[11px] text-gray-600">Click "Run Research" to automatically search for this lead across Google, Golden Pages, WHOIS, and business directories.</div>
              )}
            </div>

            {/* Match Entry */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4 mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Research Match</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Full Name</label>
                    <input value={matchName} onChange={e => setMatchName(e.target.value)} placeholder={selected.first_name + '...'} className="w-full bg-gray-800 text-sm text-gray-200 rounded-lg px-3 py-1.5 border border-gray-700 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Company</label>
                    <input value={matchCompany} onChange={e => setMatchCompany(e.target.value)} className="w-full bg-gray-800 text-sm text-gray-200 rounded-lg px-3 py-1.5 border border-gray-700 focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">
                    Email
                    {emailMatch !== null && (
                      <span className={`ml-2 ${emailMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                        {emailMatch ? 'Pattern matches!' : 'Does not match pattern'}
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input value={matchEmail} onChange={e => { setMatchEmail(e.target.value); setEmailMatch(null); }} placeholder="email@example.com" className="flex-1 bg-gray-800 text-sm text-gray-200 rounded-lg px-3 py-1.5 border border-gray-700 focus:border-indigo-500 outline-none" />
                    <button onClick={checkEmail} className="px-3 py-1.5 text-[11px] bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg">
                      Check
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Phone</label>
                    <input value={matchPhone} onChange={e => setMatchPhone(e.target.value)} className="w-full bg-gray-800 text-sm text-gray-200 rounded-lg px-3 py-1.5 border border-gray-700 focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">LinkedIn</label>
                    <input value={matchLinkedin} onChange={e => setMatchLinkedin(e.target.value)} placeholder="linkedin.com/in/..." className="w-full bg-gray-800 text-sm text-gray-200 rounded-lg px-3 py-1.5 border border-gray-700 focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Website</label>
                  <input value={matchWebsite} onChange={e => setMatchWebsite(e.target.value)} placeholder="https://..." className="w-full bg-gray-800 text-sm text-gray-200 rounded-lg px-3 py-1.5 border border-gray-700 focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Confidence: {confidence}%</label>
                  <input type="range" min="0" max="100" value={confidence} onChange={e => setConfidence(parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Research Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Where did you find them, what confirmed the match..." className="w-full bg-gray-800 text-sm text-gray-200 rounded-lg px-3 py-2 border border-gray-700 focus:border-indigo-500 outline-none resize-none" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={promote} className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">
                Promote to Lead
              </button>
              <button onClick={() => setSelected(null)} className="px-4 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <div className="text-4xl mb-3">🐕</div>
              <p className="text-sm">Select a Bark lead to research</p>
              <p className="text-xs text-gray-700 mt-1">Use Claude to scan Gmail and POST emails to /api/bark/scan</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

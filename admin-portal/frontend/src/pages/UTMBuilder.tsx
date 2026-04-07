import { useState } from 'react';

const SOURCES = [
  { value: 'google', label: 'Google' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'devto', label: 'Dev.to' },
  { value: 'shopify-community', label: 'Shopify Community' },
  { value: 'email', label: 'Email' },
  { value: 'bark', label: 'Bark.com' },
];

const MEDIUMS = [
  { value: 'social', label: 'Social Media' },
  { value: 'cpc', label: 'Paid (CPC)' },
  { value: 'email', label: 'Email' },
  { value: 'referral', label: 'Referral' },
  { value: 'organic', label: 'Organic' },
];

const DOMAINS = [
  'jmsdevlab.com', 'smartcashapp.net', 'staffhubapp.com', 'jewelrystudiomanager.com',
  'jewelvalue.app', 'repairdeskapp.net', 'mygrowthmap.net', 'profitshield.app',
  'qualcanvas.com', 'spamshield.dev', 'taxmatch.app', 'pitchsideapp.net', 'themesweep.com',
];

export default function UTMBuilder() {
  const [domain, setDomain] = useState('jmsdevlab.com');
  const [path, setPath] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  const url = (() => {
    if (!source || !medium) return '';
    const base = `https://${domain}${path ? (path.startsWith('/') ? path : '/' + path) : ''}`;
    const params = new URLSearchParams();
    params.set('utm_source', source);
    params.set('utm_medium', medium);
    if (campaign) params.set('utm_campaign', campaign);
    if (content) params.set('utm_content', content);
    return `${base}?${params.toString()}`;
  })();

  function copy() {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">UTM Builder</h1>
        <p className="text-gray-400 mt-1 text-sm">Generate tracked URLs for social media, email, and ad campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-medium text-white">URL Parameters</h2>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Domain</label>
            <select value={domain} onChange={e => setDomain(e.target.value)}
              className="mt-1 w-full bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg px-3 py-2">
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Path (optional)</label>
            <input type="text" value={path} onChange={e => setPath(e.target.value)} placeholder="/pricing"
              className="mt-1 w-full bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Source *</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="mt-1 w-full bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg px-3 py-2">
              <option value="">Select source...</option>
              {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Medium *</label>
            <select value={medium} onChange={e => setMedium(e.target.value)}
              className="mt-1 w-full bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg px-3 py-2">
              <option value="">Select medium...</option>
              {MEDIUMS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Campaign</label>
            <input type="text" value={campaign} onChange={e => setCampaign(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="smartcash-launch-2026q2"
              className="mt-1 w-full bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Content (optional)</label>
            <input type="text" value={content} onChange={e => setContent(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="blog-post-1"
              className="mt-1 w-full bg-gray-800/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg px-3 py-2" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white mb-3">Generated URL</h2>
            {url ? (
              <div>
                <div className="bg-gray-800/50 rounded-lg p-3 break-all">
                  <code className="text-xs text-blue-400">{url}</code>
                </div>
                <button onClick={copy}
                  className="mt-3 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Select source and medium to generate a URL.</p>
            )}
          </div>

          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-white mb-3">Quick Templates</h2>
            <div className="space-y-2">
              {[
                { label: 'Dev.to blog post', s: 'devto', m: 'social', c: 'blog-awareness' },
                { label: 'Reddit comment', s: 'reddit', m: 'social', c: 'community-engagement' },
                { label: 'Shopify Community', s: 'shopify-community', m: 'social', c: 'shopify-awareness' },
                { label: 'LinkedIn post', s: 'linkedin', m: 'social', c: 'professional-network' },
                { label: 'Email newsletter', s: 'email', m: 'email', c: 'newsletter' },
                { label: 'Google Ads', s: 'google', m: 'cpc', c: 'search-ads' },
              ].map(t => (
                <button key={t.label} onClick={() => { setSource(t.s); setMedium(t.m); setCampaign(t.c); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-400 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors">
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

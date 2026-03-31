import { useState } from 'react';

const DOMAINS = [
  { name: 'jmsdevlab.com', label: 'JMS Dev Lab (Main)' },
  { name: 'smartcashapp.net', label: 'SmartCash' },
  { name: 'staffhubapp.com', label: 'StaffHub' },
  { name: 'jewelrystudiomanager.com', label: 'Jewelry Studio Manager' },
  { name: 'jewelvalue.app', label: 'Jewel Value' },
  { name: 'repairdeskapp.net', label: 'RepairDesk' },
  { name: 'mygrowthmap.net', label: 'GrowthMap' },
  { name: 'profitshield.app', label: 'ProfitShield' },
  { name: 'qualcanvas.com', label: 'QualCanvas' },
];

const ANALYTICS_LINKS = {
  ga4: 'https://analytics.google.com/analytics/web/#/p476913858/reports/intelligenthome',
  gsc: 'https://search.google.com/search-console?resource_id=https://jmsdevlab.com/',
  gtm: 'https://tagmanager.google.com/#/container/accounts/6346991669/containers/247784426/workspaces/5',
  meta: 'https://business.facebook.com/latest/insights',
  cloudflare: 'https://dash.cloudflare.com/fe8383fe03ab5000c8fc4b13e4e2f0a8/web-analytics',
  plausible: 'https://plausible.io/jmsdevlab.com',
};

type Tab = 'overview' | 'ga4' | 'gsc' | 'cloudflare';

export default function Visitors() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Visitors & Analytics</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Traffic, audiences, and search performance across all JMS Dev Lab properties.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/50 border border-gray-800/50 rounded-xl p-1">
        {([
          ['overview', 'Overview'],
          ['ga4', 'Google Analytics'],
          ['gsc', 'Search Console'],
          ['cloudflare', 'Cloudflare'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white/[0.08] text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'ga4' && <EmbedTab url={ANALYTICS_LINKS.ga4} title="Google Analytics 4" />}
      {activeTab === 'gsc' && <EmbedTab url={ANALYTICS_LINKS.gsc} title="Google Search Console" />}
      {activeTab === 'cloudflare' && <EmbedTab url={ANALYTICS_LINKS.cloudflare} title="Cloudflare Web Analytics" />}
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <QuickLink
          label="Google Analytics 4"
          detail="GA4 — G-B7SYY8F9XY"
          url={ANALYTICS_LINKS.ga4}
          color="text-blue-400"
        />
        <QuickLink
          label="Search Console"
          detail="19+ pages indexed"
          url={ANALYTICS_LINKS.gsc}
          color="text-emerald-400"
        />
        <QuickLink
          label="Tag Manager"
          detail="GTM-NPTXDRDH — 3 tags"
          url={ANALYTICS_LINKS.gtm}
          color="text-yellow-400"
        />
        <QuickLink
          label="Meta Pixel"
          detail="ID 1762011307420822"
          url={ANALYTICS_LINKS.meta}
          color="text-indigo-400"
        />
        <QuickLink
          label="Cloudflare Analytics"
          detail="7 sites enabled"
          url={ANALYTICS_LINKS.cloudflare}
          color="text-orange-400"
        />
        <QuickLink
          label="Plausible"
          detail="Privacy-first (no consent)"
          url={ANALYTICS_LINKS.plausible}
          color="text-purple-400"
        />
      </div>

      {/* Tracking Status */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Tracking Status by Domain</h2>
        </div>
        <div className="divide-y divide-gray-800/30">
          {DOMAINS.map((domain) => (
            <div key={domain.name} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">{domain.label}</p>
                <p className="text-[11px] text-gray-600">{domain.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot label="GTM" active />
                <StatusDot label="GA4" active />
                <StatusDot label="Meta" active />
                <StatusDot label="Ads" active />
                <StatusDot label="GSC" active />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GTM Tags */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">GTM Container — GTM-NPTXDRDH</h2>
        </div>
        <div className="p-5 space-y-3">
          <TagRow name="GA4 - JMS Dev Lab" type="Google Tag" id="G-B7SYY8F9XY" trigger="Initialization - All Pages" />
          <TagRow name="Meta Pixel - JMS Dev Lab" type="Custom HTML" id="1762011307420822" trigger="All Pages" />
          <TagRow name="Google Ads Remarketing" type="Google Ads Remarketing" id="198296860" trigger="All Pages" />
        </div>
      </div>

      {/* Audience Building Status */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Audience Building</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AudienceCard
              platform="Meta"
              status="Building"
              detail="Pixel active. Audiences build passively. Min 100 for remarketing, 1,000 for Lookalikes."
            />
            <AudienceCard
              platform="Google Ads"
              status="Building"
              detail="Remarketing tag active. Min 1,000 for Search remarketing, 100 for Display."
            />
            <AudienceCard
              platform="GA4"
              status="Collecting"
              detail="Cross-domain tracking across 9 domains. Google Signals enabled. 14-month retention."
            />
          </div>
        </div>
      </div>

      {/* Key Metrics Reference */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800/50">
          <h2 className="text-sm font-medium text-white">Key IDs & Configuration</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <ConfigRow label="GTM Container" value="GTM-NPTXDRDH" />
            <ConfigRow label="GA4 Measurement ID" value="G-B7SYY8F9XY" />
            <ConfigRow label="GA4 Property ID" value="476913858" />
            <ConfigRow label="Meta Pixel ID" value="1762011307420822" />
            <ConfigRow label="Google Ads Account" value="834-831-7464" />
            <ConfigRow label="Google Ads Conversion ID" value="198296860" />
            <ConfigRow label="Cookie Consent" value="GTM Consent Mode v2" />
            <ConfigRow label="Plausible" value="Active (no consent needed)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmbedTab({ url, title }: { url: string; title: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
        >
          Open in new tab
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden" style={{ height: '80vh' }}>
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}

function QuickLink({ label, detail, url, color }: { label: string; detail: string; url: string; color: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-gray-900/50 border border-gray-800/50 rounded-xl px-4 py-3 hover:border-gray-700 transition-colors group"
    >
      <div className={`text-[11px] font-medium uppercase tracking-wider ${color}`}>{label}</div>
      <div className="text-sm text-gray-400 group-hover:text-gray-200 mt-1">{detail}</div>
    </a>
  );
}

function StatusDot({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-1" title={label}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-600'}`} />
      <span className="text-[10px] text-gray-600">{label}</span>
    </div>
  );
}

function TagRow({ name, type, id, trigger }: { name: string; type: string; id: string; trigger: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-300">{name}</p>
        <p className="text-[11px] text-gray-600">{type} &middot; {trigger}</p>
      </div>
      <code className="text-[11px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded font-mono">{id}</code>
    </div>
  );
}

function AudienceCard({ platform, status, detail }: { platform: string; status: string; detail: string }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">{platform}</span>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{status}</span>
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed">{detail}</p>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-500">{label}</span>
      <code className="text-gray-300 font-mono text-xs">{value}</code>
    </div>
  );
}

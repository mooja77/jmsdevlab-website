/**
 * Costs — track business expenses across all services.
 * Static data with manual updates + links to billing dashboards.
 */

import { Env, json } from '../types';

interface ServiceCost {
  id: string;
  name: string;
  category: 'infrastructure' | 'ai' | 'tools' | 'marketing' | 'domains';
  monthlyCost: number;
  currency: string;
  billingCycle: 'monthly' | 'annual' | 'usage' | 'free';
  status: 'active' | 'trial' | 'free' | 'cancelled';
  notes: string;
  dashboardUrl: string;
  lastInvoice?: string;
}

// Hardcoded cost data from Gmail receipts — update manually when costs change
const SERVICES: ServiceCost[] = [
  // Infrastructure
  { id: 'railway', name: 'Railway', category: 'infrastructure', monthlyCost: 15, currency: 'USD', billingCycle: 'usage', status: 'active', notes: '6 backend services + PostgreSQL databases', dashboardUrl: 'https://railway.com/dashboard', lastInvoice: '#2122-5705 (Mar 27)' },
  { id: 'vercel', name: 'Vercel', category: 'infrastructure', monthlyCost: 20, currency: 'USD', billingCycle: 'monthly', status: 'active', notes: '6 Next.js/React frontends, Pro plan', dashboardUrl: 'https://vercel.com/dashboard', lastInvoice: '#2861-3803 (Mar 23)' },
  { id: 'cloudflare', name: 'Cloudflare', category: 'infrastructure', monthlyCost: 0, currency: 'USD', billingCycle: 'free', status: 'active', notes: 'DNS, Pages, Workers, D1, Email Routing — all free tier', dashboardUrl: 'https://dash.cloudflare.com' },
  { id: 'heroku', name: 'Heroku', category: 'infrastructure', monthlyCost: 14, currency: 'USD', billingCycle: 'monthly', status: 'active', notes: 'Legacy deployment — consider migrating to Railway', dashboardUrl: 'https://dashboard.heroku.com', lastInvoice: '#110826363 (Mar 2)' },
  { id: 'render', name: 'Render', category: 'infrastructure', monthlyCost: 0, currency: 'USD', billingCycle: 'free', status: 'free', notes: 'JSM backend — free tier', dashboardUrl: 'https://dashboard.render.com' },
  { id: 'firebase', name: 'Firebase', category: 'infrastructure', monthlyCost: 0, currency: 'USD', billingCycle: 'free', status: 'free', notes: 'PitchSide — Spark free tier', dashboardUrl: 'https://console.firebase.google.com' },
  { id: 'supabase', name: 'Supabase', category: 'infrastructure', monthlyCost: 0, currency: 'USD', billingCycle: 'free', status: 'free', notes: 'GrowthMap — free tier', dashboardUrl: 'https://supabase.com/dashboard' },

  // AI & APIs
  { id: 'anthropic-sub', name: 'Anthropic (Claude Max)', category: 'ai', monthlyCost: 180, currency: 'USD', billingCycle: 'monthly', status: 'active', notes: 'Claude Max subscription — Claude Code, Claude.ai, API credits', dashboardUrl: 'https://console.anthropic.com' },
  { id: 'anthropic-api', name: 'Anthropic (API Usage)', category: 'ai', monthlyCost: 20, currency: 'USD', billingCycle: 'usage', status: 'active', notes: 'Claude API overage for app AI features', dashboardUrl: 'https://console.anthropic.com', lastInvoice: '#2593-0776-7523 (Mar 26)' },
  { id: 'github', name: 'GitHub', category: 'tools', monthlyCost: 10, currency: 'USD', billingCycle: 'monthly', status: 'active', notes: 'Actions minutes budget — hit 100% on Mar 27', dashboardUrl: 'https://github.com/settings/billing' },

  // Tools
  { id: 'resend', name: 'Resend', category: 'tools', monthlyCost: 20, currency: 'USD', billingCycle: 'monthly', status: 'active', notes: 'Transactional email API for apps', dashboardUrl: 'https://resend.com/dashboard', lastInvoice: '#2978-2772 (Mar 23)' },
  { id: 'ngrok', name: 'ngrok', category: 'tools', monthlyCost: 10, currency: 'USD', billingCycle: 'monthly', status: 'active', notes: 'Tunnel for Shopify app local dev', dashboardUrl: 'https://dashboard.ngrok.com', lastInvoice: '#OPIODN-00009 (Mar 11)' },
  { id: 'sentry', name: 'Sentry', category: 'tools', monthlyCost: 0, currency: 'USD', billingCycle: 'free', status: 'free', notes: 'Error monitoring — free tier (27 errors last week)', dashboardUrl: 'https://sentry.io' },
  { id: 'canva', name: 'Canva', category: 'marketing', monthlyCost: 13, currency: 'USD', billingCycle: 'monthly', status: 'active', notes: 'Design tool for marketing materials', dashboardUrl: 'https://canva.com', lastInvoice: 'Invoice (Mar 16)' },

  // Marketing & Analytics
  { id: 'plausible', name: 'Plausible Analytics', category: 'marketing', monthlyCost: 9, currency: 'EUR', billingCycle: 'monthly', status: 'trial', notes: 'Privacy-friendly analytics. TRIAL ENDING IN 1 WEEK — decide to subscribe or cancel', dashboardUrl: 'https://plausible.io/sites' },
  { id: 'mailerlite', name: 'MailerLite', category: 'marketing', monthlyCost: 0, currency: 'USD', billingCycle: 'free', status: 'free', notes: 'Email marketing — free tier (welcome drip sequence)', dashboardUrl: 'https://dashboard.mailerlite.com' },
  { id: 'meta-ads', name: 'Meta Ads (Facebook/Instagram)', category: 'marketing', monthlyCost: 44, currency: 'EUR', billingCycle: 'usage', status: 'active', notes: 'Facebook + Instagram ads. Last charge EUR 44.16 (Feb 9)', dashboardUrl: 'https://business.facebook.com/adsmanager' },

  // Domains (annual costs, shown as monthly equivalent)
  { id: 'domains', name: 'Domain Renewals (11)', category: 'domains', monthlyCost: 12, currency: 'USD', billingCycle: 'annual', status: 'active', notes: '11 domains via Cloudflare Registrar (~$140/year total)', dashboardUrl: 'https://dash.cloudflare.com/fe8383fe03ab5000c8fc4b13e4e2f0a8/registrar/domains' },

  // Personal (on business email but not business costs — tracked for awareness)
  { id: 'blinkist', name: 'Blinkist Premium', category: 'tools', monthlyCost: 7, currency: 'EUR', billingCycle: 'annual', status: 'active', notes: 'Book summaries — EUR 79.99/year (personal, on business email)', dashboardUrl: 'https://blinkist.com' },
];

export async function handleCostRoutes(path: string, env: Env): Promise<Response> {
  if (path === '/api/costs') {
    // Also check D1 for any custom cost entries
    const customCosts = await env.DB.prepare(
      'SELECT * FROM config WHERE key LIKE "cost_%"'
    ).all();

    const totalMonthly = SERVICES.filter(s => s.status !== 'free' && s.status !== 'cancelled')
      .reduce((sum, s) => sum + s.monthlyCost, 0);

    const byCategory: Record<string, { services: ServiceCost[]; total: number }> = {};
    for (const s of SERVICES) {
      if (!byCategory[s.category]) byCategory[s.category] = { services: [], total: 0 };
      byCategory[s.category].services.push(s);
      if (s.status !== 'free' && s.status !== 'cancelled') {
        byCategory[s.category].total += s.monthlyCost;
      }
    }

    const paidServices = SERVICES.filter(s => s.monthlyCost > 0);
    const freeServices = SERVICES.filter(s => s.monthlyCost === 0);
    const trialServices = SERVICES.filter(s => s.status === 'trial');

    return json({
      services: SERVICES,
      totalMonthlyUsd: totalMonthly,
      totalAnnualUsd: totalMonthly * 12,
      byCategory,
      paidCount: paidServices.length,
      freeCount: freeServices.length,
      trialCount: trialServices.length,
      alerts: trialServices.map(s => ({ service: s.name, message: s.notes })),
    });
  }

  return json({ error: 'Not found' }, 404);
}

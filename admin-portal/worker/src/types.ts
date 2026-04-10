/**
 * Shared types and utilities — no circular imports.
 */

export interface Env {
  DB: D1Database;
  PORTAL_PASSWORD: string;
  PORTAL_NAME: string;
  CACHE_TTL_HEALTH: string;
  CACHE_TTL_DASHBOARD: string;
  CACHE_TTL_UPTIME: string;
  ADMIN_KEY_SMARTCASH?: string;
  ADMIN_KEY_PROFITSHIELD?: string;
  ADMIN_KEY_JEWELVALUE?: string;
  ADMIN_KEY_REPAIRDESK?: string;
  ADMIN_KEY_QUALCANVAS?: string;
  ADMIN_KEY_THEMESWEEP?: string;
  ADMIN_KEY_SPAMSHIELD?: string;
  ADMIN_KEY_TAXMATCH?: string;
  ADMIN_KEY_PITCHSIDE?: string;
  ADMIN_KEY_JSM?: string;
  ADMIN_KEY_GROWTHMAP?: string;
  ADMIN_KEY_STAFFHUB?: string;
  GITHUB_TOKEN?: string;
  STRIPE_API_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  GMAIL_REFRESH_TOKEN?: string;
  CLOUDFLARE_API_TOKEN?: string;
  GOOGLE_CSE_KEY?: string;
  GOOGLE_CSE_CX?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BRAVE_SEARCH_KEY?: string;
  EMAIL_VERIFY_KEY?: string;
  CRO_API_KEY?: string;
  CRO_EMAIL?: string;
  ANTHROPIC_API_KEY?: string;
}

const ALLOWED_ORIGINS = [
  'https://admin.jmsdevlab.com',
  'https://jms-admin-portal.pages.dev',
  'http://localhost:5173',
];

export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Portal-Key, x-admin-key, stripe-signature',
  };
}

// Keep backward compat for places that don't have request context
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://admin.jmsdevlab.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Portal-Key, x-admin-key, stripe-signature',
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export { CORS_HEADERS };

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
  GMAIL_REFRESH_TOKEN?: string;
  CLOUDFLARE_API_TOKEN?: string;
  GOOGLE_CSE_KEY?: string;
  GOOGLE_CSE_CX?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Portal-Key',
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export { CORS_HEADERS };

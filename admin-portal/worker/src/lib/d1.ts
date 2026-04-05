/**
 * D1 database helpers for the admin portal.
 */

import { Env } from '../types';

export interface AppRecord {
  id: string;
  name: string;
  api_base_url: string | null;
  frontend_url: string | null;
  admin_key_name: string | null;
  has_admin: number;
  hosting: string | null;
  github_repo: string | null;
  audit_score: number;
  pricing_low: number;
  pricing_high: number;
  status: string;
}

export async function getAllApps(env: Env): Promise<AppRecord[]> {
  const result = await env.DB.prepare('SELECT * FROM apps ORDER BY name').all<AppRecord>();
  return result.results;
}

export async function getApp(env: Env, id: string): Promise<AppRecord | null> {
  return env.DB.prepare('SELECT * FROM apps WHERE id = ?').bind(id).first<AppRecord>();
}

export function getAdminKey(env: Env, keyName: string): string | undefined {
  return (env as unknown as Record<string, string>)[keyName];
}

export async function fetchAppEndpoint(
  env: Env,
  app: AppRecord,
  endpoint: string
): Promise<Record<string, unknown> | null> {
  if (!app.api_base_url || !app.has_admin || !app.admin_key_name) return null;

  const key = getAdminKey(env, app.admin_key_name);
  if (!key) return null;

  try {
    const url = `${app.api_base_url}/api/admin/${endpoint}`;
    const response = await fetch(url, {
      headers: { 'x-admin-key': key },
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) return null;
    return await response.json() as Record<string, unknown>;
  } catch {
    return null;
  }
}

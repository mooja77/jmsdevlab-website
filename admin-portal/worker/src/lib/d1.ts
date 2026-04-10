/**
 * D1 database helpers for the admin portal.
 */

import { Env } from '../types';
import { extractData } from './normalize';
import { isTestEmail } from './filter';

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

/**
 * Shared user extraction — single source of truth.
 * Handles all response shapes: { users: [] }, { shops: [] }, { data: [] }, direct array.
 * Returns { users, realCount, testCount, error? }
 */
export interface ExtractedUser {
  email: string;
  name: string;
  isTest: boolean;
  [key: string]: unknown;
}

export interface UserFetchResult {
  users: ExtractedUser[];
  realCount: number;
  testCount: number;
  total: number;
  error?: string;
}

export async function fetchUsersFromApp(env: Env, app: AppRecord, limit = 100): Promise<UserFetchResult> {
  const empty: UserFetchResult = { users: [], realCount: 0, testCount: 0, total: 0 };

  const raw = await fetchAppEndpoint(env, app, `users?limit=${limit}`);
  if (!raw) return { ...empty, error: 'fetch failed' };

  const data = extractData(raw);

  // Handle all response shapes
  let rawUsers: any[];
  if (Array.isArray(data)) {
    rawUsers = data;
  } else if (Array.isArray(data.data)) {
    rawUsers = data.data;
  } else {
    rawUsers = (data.users || data.shops || data.stores || []) as any[];
  }

  if (!Array.isArray(rawUsers)) return { ...empty, error: 'not array' };

  const users: ExtractedUser[] = rawUsers.map(u => {
    const email = String(u.email || u.ownerEmail || u.domain || '');
    return {
      ...u,
      email,
      name: String(u.name || u.firstName || u.displayName || u.shopName || '').trim() || email.split('@')[0],
      isTest: isTestEmail(email),
    };
  });

  return {
    users,
    realCount: users.filter(u => !u.isTest).length,
    testCount: users.filter(u => u.isTest).length,
    total: users.length,
  };
}

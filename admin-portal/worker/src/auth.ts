/**
 * Authentication — simple password login with D1 session storage.
 * Single-user system (sole trader).
 */

import { Env, json } from './types';
import { constantTimeEqual } from './lib/crypto';

async function generateToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export async function handleAuth(path: string, request: Request, env: Env): Promise<Response> {
  if (path === '/api/auth/login' && request.method === 'POST') {
    // Rate limiting: max 5 attempts per IP per 5 minutes
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `login_attempts:${ip}`;
    const recent = await env.DB.prepare(
      `SELECT value FROM config WHERE key = ? AND updated_at > datetime('now', '-5 minutes')`
    ).bind(rateLimitKey).first<{ value: string }>();
    const attemptCount = parseInt(recent?.value || '0', 10);
    if (attemptCount >= 5) {
      return json({ error: 'Too many attempts. Try again in 5 minutes.' }, 429);
    }

    const body = await request.json<{ password: string }>();
    if (!body?.password || !env.PORTAL_PASSWORD) {
      return json({ error: 'Invalid password' }, 401);
    }

    // Timing-safe password comparison
    const passwordMatch = await constantTimeEqual(body.password, env.PORTAL_PASSWORD);
    if (!passwordMatch) {
      // Track failed attempt
      await env.DB.prepare(
        `INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, datetime('now'))`
      ).bind(rateLimitKey, String(attemptCount + 1)).run();
      return json({ error: 'Invalid password' }, 401);
    }

    // Create session (24h expiry)
    try {
      const token = await generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await env.DB.prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').bind(token, expiresAt).run();

      // Clean up expired sessions + reset rate limit on success
      await env.DB.prepare('DELETE FROM sessions WHERE expires_at < datetime("now")').run();
      await env.DB.prepare('DELETE FROM config WHERE key = ?').bind(rateLimitKey).run();

      return json({ success: true, token, expiresAt });
    } catch (err) {
      console.error('Session creation failed:', err);
      return json({ error: 'Internal server error' }, 500);
    }
  }

  if (path === '/api/auth/logout' && request.method === 'POST') {
    const token = extractToken(request);
    if (token) {
      await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    }
    return json({ success: true });
  }

  if (path === '/api/auth/check') {
    const session = await verifySession(request, env);
    return json({ authenticated: !!session });
  }

  return json({ error: 'Not found' }, 404);
}

function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  const portalKey = request.headers.get('X-Portal-Key');
  if (portalKey) return portalKey;

  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(/portal_session=([^;]+)/);
  if (match) return match[1];

  return null;
}

export async function verifySession(request: Request, env: Env): Promise<boolean> {
  const token = extractToken(request);
  if (!token) return false;

  const session = await env.DB.prepare(
    'SELECT token FROM sessions WHERE token = ? AND expires_at > datetime("now")'
  ).bind(token).first();

  return !!session;
}

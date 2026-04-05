/**
 * Authentication — simple password login with D1 session storage.
 * Single-user system (sole trader).
 */

import { Env, json } from './types';

async function generateToken(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}


export async function handleAuth(path: string, request: Request, env: Env): Promise<Response> {
  if (path === '/api/auth/login' && request.method === 'POST') {
    const body = await request.json<{ password: string }>();
    if (!body?.password || body.password !== env.PORTAL_PASSWORD) {
      return json({ error: 'Invalid password' }, 401);
    }

    // Create session (24h expiry)
    try {
      const token = await generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await env.DB.prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').bind(token, expiresAt).run();

      // Clean up expired sessions
      await env.DB.prepare('DELETE FROM sessions WHERE expires_at < datetime("now")').run();

      return json({ success: true, token, expiresAt });
    } catch (err) {
      return json({ error: 'Session creation failed', details: String(err) }, 500);
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
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check X-Portal-Key header
  const portalKey = request.headers.get('X-Portal-Key');
  if (portalKey) return portalKey;

  // Check cookie
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

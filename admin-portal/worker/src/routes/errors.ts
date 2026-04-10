/**
 * Error Monitoring — apps POST errors here, Command Centre displays them.
 * Errors are deduplicated by message+app+endpoint (count incremented).
 */

import { Env, json } from '../types';

export async function handleErrorRoutes(path: string, request: Request, url: URL, env: Env): Promise<Response> {
  // POST /api/errors/report — apps send errors (no portal auth, uses app admin key)
  if (path === '/api/errors/report' && request.method === 'POST') {
    const body = await request.json<{
      app_id: string;
      error_type?: string;
      message: string;
      stack_trace?: string;
      user_email?: string;
      endpoint?: string;
      http_status?: number;
      admin_key: string;
    }>();

    if (!body?.message || !body?.app_id) {
      return json({ error: 'app_id and message required' }, 400);
    }

    // Verify admin key for the app
    const keyName = `ADMIN_KEY_${body.app_id.toUpperCase()}`;
    const expectedKey = (env as unknown as Record<string, string>)[keyName];
    if (!expectedKey || body.admin_key !== expectedKey) {
      return json({ error: 'Invalid admin key' }, 401);
    }

    // Check for existing identical error (deduplicate)
    const existing = await env.DB.prepare(
      'SELECT id, count FROM error_log WHERE app_id = ? AND message = ? AND endpoint = ? AND resolved = 0'
    ).bind(body.app_id, body.message, body.endpoint || '').first<{ id: number; count: number }>();

    if (existing) {
      // Increment count and update last_seen
      await env.DB.prepare(
        'UPDATE error_log SET count = count + 1, last_seen = datetime("now") WHERE id = ?'
      ).bind(existing.id).run();
    } else {
      // Insert new error
      await env.DB.prepare(`
        INSERT INTO error_log (app_id, error_type, message, stack_trace, user_email, endpoint, http_status, count, first_seen, last_seen, resolved)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'), 0)
      `).bind(
        body.app_id, body.error_type || 'unhandled', body.message,
        body.stack_trace || '', body.user_email || '', body.endpoint || '',
        body.http_status || 0
      ).run();
    }

    return json({ received: true });
  }

  // GET /api/errors — list errors
  if (path === '/api/errors' && request.method === 'GET') {
    const appFilter = url.searchParams.get('app');
    const resolved = url.searchParams.get('resolved') === 'true';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

    let query = 'SELECT e.*, a.name as app_name FROM error_log e LEFT JOIN apps a ON e.app_id = a.id WHERE e.resolved = ?';
    const params: any[] = [resolved ? 1 : 0];

    if (appFilter) {
      query += ' AND e.app_id = ?';
      params.push(appFilter);
    }

    query += ' ORDER BY e.last_seen DESC LIMIT ?';
    params.push(limit);

    const result = await env.DB.prepare(query).bind(...params).all();

    const summary = await env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN resolved = 0 THEN 1 ELSE 0 END) as unresolved,
        SUM(CASE WHEN resolved = 0 THEN count ELSE 0 END) as total_occurrences,
        COUNT(DISTINCT app_id) as affected_apps
      FROM error_log
    `).first();

    return json({ errors: result.results, summary });
  }

  // GET /api/errors/trends — error count over time per app
  if (path === '/api/errors/trends') {
    const days = parseInt(url.searchParams.get('days') || '7');
    const result = await env.DB.prepare(`
      SELECT app_id, a.name as app_name,
        strftime('%Y-%m-%d', last_seen) as date,
        SUM(count) as error_count
      FROM error_log e
      LEFT JOIN apps a ON e.app_id = a.id
      WHERE e.last_seen > datetime('now', '-' || ? || ' days')
      GROUP BY app_id, date
      ORDER BY date DESC
    `).bind(days).all();

    return json({ trends: result.results });
  }

  // PUT /api/errors/:id/resolve — mark error as resolved
  if (path.match(/\/api\/errors\/\d+\/resolve/) && request.method === 'PUT') {
    const id = path.match(/\/api\/errors\/(\d+)\/resolve/)?.[1];
    if (!id) return json({ error: 'Invalid ID' }, 400);
    await env.DB.prepare('UPDATE error_log SET resolved = 1 WHERE id = ?').bind(id).run();
    return json({ resolved: id });
  }

  return json({ error: 'Not found' }, 404);
}

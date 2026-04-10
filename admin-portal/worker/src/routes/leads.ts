/**
 * Lead pipeline — CRUD for tracking leads from Bark, email, social.
 */

import { Env, json } from '../types';

function generateId(): string {
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function handleLeadRoutes(path: string, request: Request, env: Env): Promise<Response> {
  // GET /api/leads — list all leads
  if (path === '/api/leads' && request.method === 'GET') {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const VALID_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

    let query = 'SELECT * FROM leads';
    const params: string[] = [];
    if (status) {
      if (!VALID_STATUSES.includes(status)) return json({ error: 'Invalid status' }, 400);
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const stmt = params.length
      ? env.DB.prepare(query).bind(...params)
      : env.DB.prepare(query);
    const result = await stmt.all();

    // Group by status for pipeline view
    const pipeline: Record<string, unknown[]> = { new: [], contacted: [], qualified: [], proposal: [], won: [], lost: [] };
    result.results.forEach((lead: any) => {
      if (pipeline[lead.status]) pipeline[lead.status].push(lead);
      else pipeline.new.push(lead);
    });

    return json({ leads: result.results, pipeline, total: result.results.length });
  }

  // POST /api/leads — create a lead
  if (path === '/api/leads' && request.method === 'POST') {
    const body = await request.json<any>();
    const id = generateId();
    await env.DB.prepare(`
      INSERT INTO leads (id, source, name, email, company, service_type, budget_range, status, notes, value_estimate, next_action, next_action_date, source_message_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.source || 'manual',
      body.name || null,
      body.email || null,
      body.company || null,
      body.service_type || null,
      body.budget_range || null,
      body.status || 'new',
      body.notes || null,
      body.value_estimate || 0,
      body.next_action || null,
      body.next_action_date || null,
      body.source_message_id || null,
    ).run();

    await env.DB.prepare(
      'INSERT INTO activity_log (source, event_type, summary) VALUES (?, ?, ?)'
    ).bind('portal', 'lead_created', `New lead: ${body.name || 'Unknown'} (${body.source || 'manual'})`).run();

    return json({ success: true, id });
  }

  // PUT /api/leads/:id — update a lead
  const putMatch = path.match(/^\/api\/leads\/(.+)$/);
  if (putMatch && request.method === 'PUT') {
    const id = putMatch[1];
    const body = await request.json<any>();

    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of ['name', 'email', 'company', 'service_type', 'budget_range', 'status', 'notes', 'value_estimate', 'next_action', 'next_action_date']) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    fields.push('updated_at = datetime("now")');
    values.push(id);

    await env.DB.prepare(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();

    if (body.status) {
      await env.DB.prepare(
        'INSERT INTO activity_log (source, event_type, summary) VALUES (?, ?, ?)'
      ).bind('portal', 'lead_updated', `Lead ${body.name || id} moved to ${body.status}`).run();
    }

    return json({ success: true });
  }

  // DELETE /api/leads/:id
  const delMatch = path.match(/^\/api\/leads\/(.+)$/);
  if (delMatch && request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(delMatch[1]).run();
    return json({ success: true });
  }

  return json({ error: 'Not found' }, 404);
}

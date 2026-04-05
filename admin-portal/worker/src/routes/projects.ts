/**
 * Custom dev project tracker — projects, milestones, invoicing.
 */

import { Env, json } from '../types';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function handleProjectRoutes(path: string, request: Request, env: Env): Promise<Response> {
  // GET /api/projects — list all projects with milestone progress
  if (path === '/api/projects' && request.method === 'GET') {
    const projects = await env.DB.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM project_milestones WHERE project_id = p.id) as total_milestones,
        (SELECT COUNT(*) FROM project_milestones WHERE project_id = p.id AND completed_at IS NOT NULL) as completed_milestones,
        (SELECT SUM(invoice_amount) FROM project_milestones WHERE project_id = p.id) as total_invoiced,
        (SELECT SUM(invoice_amount) FROM project_milestones WHERE project_id = p.id AND invoice_status = 'paid') as total_paid
      FROM projects p ORDER BY
        CASE status WHEN 'active' THEN 0 WHEN 'proposal' THEN 1 WHEN 'prospect' THEN 2 WHEN 'completed' THEN 3 ELSE 4 END,
        value DESC
    `).all();

    return json({ projects: projects.results });
  }

  // GET /api/projects/:id — project detail with milestones
  const getMatch = path.match(/^\/api\/projects\/([^/]+)$/);
  if (getMatch && request.method === 'GET') {
    const id = getMatch[1];
    const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
    if (!project) return json({ error: 'Project not found' }, 404);

    const milestones = await env.DB.prepare(
      'SELECT * FROM project_milestones WHERE project_id = ? ORDER BY sort_order'
    ).bind(id).all();

    return json({ project, milestones: milestones.results });
  }

  // POST /api/projects — create project
  if (path === '/api/projects' && request.method === 'POST') {
    const body = await request.json<any>();
    const id = body.id || generateId('proj');

    await env.DB.prepare(`
      INSERT INTO projects (id, name, client_name, client_email, status, value, currency, start_date, target_end_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, body.name, body.client_name || null, body.client_email || null, body.status || 'prospect', body.value || 0, body.currency || 'EUR', body.start_date || null, body.target_end_date || null, body.notes || null).run();

    await env.DB.prepare(
      'INSERT INTO activity_log (source, event_type, summary) VALUES (?, ?, ?)'
    ).bind('portal', 'project_created', `New project: ${body.name} (${body.client_name || 'TBD'})`).run();

    return json({ success: true, id });
  }

  // PUT /api/projects/:id — update project
  if (getMatch && request.method === 'PUT') {
    const id = getMatch[1];
    const body = await request.json<any>();
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of ['name', 'client_name', 'client_email', 'status', 'value', 'currency', 'start_date', 'target_end_date', 'notes']) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    fields.push('updated_at = datetime("now")');
    values.push(id);

    await env.DB.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    return json({ success: true });
  }

  // POST /api/projects/:id/milestones — add milestone
  const msMatch = path.match(/^\/api\/projects\/([^/]+)\/milestones$/);
  if (msMatch && request.method === 'POST') {
    const body = await request.json<any>();
    await env.DB.prepare(`
      INSERT INTO project_milestones (project_id, title, description, due_date, invoice_amount, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(msMatch[1], body.title, body.description || null, body.due_date || null, body.invoice_amount || 0, body.sort_order || 0).run();

    return json({ success: true });
  }

  // PUT /api/projects/:pid/milestones/:mid — update milestone
  const msUpdateMatch = path.match(/^\/api\/projects\/([^/]+)\/milestones\/(\d+)$/);
  if (msUpdateMatch && request.method === 'PUT') {
    const body = await request.json<any>();
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of ['title', 'description', 'due_date', 'completed_at', 'invoice_amount', 'invoice_status', 'sort_order']) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    values.push(msUpdateMatch[2]);

    await env.DB.prepare(`UPDATE project_milestones SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    return json({ success: true });
  }

  return json({ error: 'Not found' }, 404);
}

/**
 * Costs — track business expenses across all services.
 * Reads from D1 service_costs table — editable without code deploy.
 */

import { Env, json } from '../types';

interface ServiceCost {
  id: string;
  name: string;
  category: string;
  monthly_cost: number;
  currency: string;
  billing_cycle: string;
  status: string;
  notes: string;
  dashboard_url: string;
  last_invoice: string | null;
  updated_at: string;
}

export async function handleCostRoutes(path: string, request: Request, env: Env): Promise<Response> {
  // GET /api/costs — all costs from D1
  if (path === '/api/costs' && request.method === 'GET') {
    const result = await env.DB.prepare('SELECT * FROM service_costs ORDER BY category, name').all<ServiceCost>();
    const services = result.results;

    const totalMonthly = services
      .filter(s => s.status !== 'free' && s.status !== 'cancelled')
      .reduce((sum, s) => sum + (s.monthly_cost || 0), 0);

    const byCategory: Record<string, { services: ServiceCost[]; total: number }> = {};
    for (const s of services) {
      if (!byCategory[s.category]) byCategory[s.category] = { services: [], total: 0 };
      byCategory[s.category].services.push(s);
      if (s.status !== 'free' && s.status !== 'cancelled') {
        byCategory[s.category].total += s.monthly_cost || 0;
      }
    }

    const paidServices = services.filter(s => (s.monthly_cost || 0) > 0);
    const freeServices = services.filter(s => (s.monthly_cost || 0) === 0);
    const trialServices = services.filter(s => s.status === 'trial');

    return json({
      services,
      totalMonthlyUsd: totalMonthly,
      totalAnnualUsd: totalMonthly * 12,
      byCategory,
      paidCount: paidServices.length,
      freeCount: freeServices.length,
      trialCount: trialServices.length,
      alerts: trialServices.map(s => ({ service: s.name, message: s.notes })),
      source: 'D1',
    });
  }

  // PUT /api/costs/:id — update a service cost
  if (path.startsWith('/api/costs/') && request.method === 'PUT') {
    const id = path.split('/api/costs/')[1];
    const body = await request.json<Partial<ServiceCost>>();

    const fields: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name); }
    if (body.category !== undefined) { fields.push('category = ?'); values.push(body.category); }
    if (body.monthly_cost !== undefined) { fields.push('monthly_cost = ?'); values.push(body.monthly_cost); }
    if (body.currency !== undefined) { fields.push('currency = ?'); values.push(body.currency); }
    if (body.billing_cycle !== undefined) { fields.push('billing_cycle = ?'); values.push(body.billing_cycle); }
    if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }
    if (body.notes !== undefined) { fields.push('notes = ?'); values.push(body.notes); }
    if (body.dashboard_url !== undefined) { fields.push('dashboard_url = ?'); values.push(body.dashboard_url); }
    if (body.last_invoice !== undefined) { fields.push('last_invoice = ?'); values.push(body.last_invoice); }

    if (fields.length === 0) return json({ error: 'No fields to update' }, 400);

    fields.push('updated_at = datetime("now")');
    values.push(id);

    await env.DB.prepare(`UPDATE service_costs SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();

    return json({ updated: id });
  }

  // POST /api/costs — add a new service
  if (path === '/api/costs' && request.method === 'POST') {
    const body = await request.json<ServiceCost>();
    if (!body.id || !body.name) return json({ error: 'id and name required' }, 400);

    await env.DB.prepare(
      `INSERT INTO service_costs (id, name, category, monthly_cost, currency, billing_cycle, status, notes, dashboard_url, last_invoice, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      body.id, body.name, body.category || 'tools', body.monthly_cost || 0,
      body.currency || 'USD', body.billing_cycle || 'monthly', body.status || 'active',
      body.notes || '', body.dashboard_url || '', body.last_invoice || null
    ).run();

    return json({ created: body.id });
  }

  // DELETE /api/costs/:id
  if (path.startsWith('/api/costs/') && request.method === 'DELETE') {
    const id = path.split('/api/costs/')[1];
    await env.DB.prepare('DELETE FROM service_costs WHERE id = ?').bind(id).run();
    return json({ deleted: id });
  }

  return json({ error: 'Not found' }, 404);
}

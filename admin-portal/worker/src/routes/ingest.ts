/**
 * Event ingest endpoint — apps POST conversion events directly.
 * Auth: x-admin-key header (same as app admin endpoints).
 */

import { Env, json } from '../types';
import { getAllApps, getAdminKey } from '../lib/d1';
import { isTestEmail } from '../lib/filter';

interface IngestEvent {
  name: string;
  email?: string;
  properties?: Record<string, any>;
}

interface IngestBody {
  app_id: string;
  events: IngestEvent[];
}

export async function handleEventIngest(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const adminKey = request.headers.get('x-admin-key');
  if (!adminKey) return json({ error: 'Missing x-admin-key header' }, 401);

  let body: IngestBody;
  try {
    body = await request.json() as IngestBody;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.app_id || !Array.isArray(body.events) || body.events.length === 0) {
    return json({ error: 'Required: app_id, events[]' }, 400);
  }

  // Validate admin key against app registry
  const apps = await getAllApps(env);
  const app = apps.find(a => a.id === body.app_id);
  if (!app || !app.admin_key_name) return json({ error: 'Unknown app_id' }, 404);

  const expectedKey = getAdminKey(env, app.admin_key_name);
  if (!expectedKey || adminKey !== expectedKey) return json({ error: 'Invalid admin key' }, 403);

  // Process events (max 50 per request)
  const events = body.events.slice(0, 50);
  const stmts: D1PreparedStatement[] = [];
  let ingested = 0;
  let skipped = 0;

  for (const event of events) {
    if (!event.name) { skipped++; continue; }

    const email = event.email?.toLowerCase().trim() || null;
    if (email && isTestEmail(email)) { skipped++; continue; }

    // Insert into ingest_events
    stmts.push(
      env.DB.prepare(
        `INSERT INTO ingest_events (app_id, event_name, email, properties_json) VALUES (?, ?, ?, ?)`
      ).bind(body.app_id, event.name, email, event.properties ? JSON.stringify(event.properties) : null)
    );

    // Sign-up events → funnel + UTM attribution
    if (event.name === 'sign_up' && email) {
      stmts.push(
        env.DB.prepare(
          `INSERT OR IGNORE INTO funnel_events (email, stage, app_id, source) VALUES (?, 'signup', ?, 'event_ingest')`
        ).bind(email, body.app_id)
      );

      const props = event.properties || {};
      if (props.utm_source) {
        stmts.push(
          env.DB.prepare(
            `INSERT INTO utm_attributions (email, app_id, utm_source, utm_medium, utm_campaign, utm_content, signed_up_at)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
          ).bind(email, body.app_id, props.utm_source, props.utm_medium || null, props.utm_campaign || null, props.utm_content || null)
        );
      }
    }

    // Upgrade/purchase events → funnel stage "paid"
    if ((event.name === 'upgrade' || event.name === 'purchase') && email) {
      stmts.push(
        env.DB.prepare(
          `INSERT OR IGNORE INTO funnel_events (email, stage, app_id, source) VALUES (?, 'paid', ?, 'event_ingest')`
        ).bind(email, body.app_id)
      );

      // Update unified_users stage
      stmts.push(
        env.DB.prepare(
          `UPDATE unified_users SET current_stage = 'paid', synced_at = datetime('now') WHERE email = ?`
        ).bind(email)
      );

      // Update UTM attribution if exists
      const amount = event.properties?.amount_cents || event.properties?.amount || 0;
      if (amount) {
        stmts.push(
          env.DB.prepare(
            `UPDATE utm_attributions SET converted_to_paid = 1, revenue_cents = ? WHERE email = ? AND app_id = ?`
          ).bind(amount, email, body.app_id)
        );
      }
    }

    ingested++;
  }

  // Batch execute
  if (stmts.length > 0) {
    for (let i = 0; i < stmts.length; i += 50) {
      await env.DB.batch(stmts.slice(i, i + 50));
    }
  }

  return json({ status: 'ok', ingested, skipped, total: events.length });
}

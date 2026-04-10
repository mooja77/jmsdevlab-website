/**
 * Stripe Webhook Handler — receives real-time subscription & payment events.
 * Stores in revenue_events table. No auth (Stripe signature verification instead).
 */

import { Env, json } from '../types';

export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Verify webhook signature
  if (env.STRIPE_WEBHOOK_SECRET && signature) {
    const isValid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    if (!isValid) return json({ error: 'Invalid signature' }, 400);
  }

  const event = JSON.parse(body);
  const type = event.type;
  const data = event.data?.object;

  if (!data) return json({ received: true });

  // Extract common fields
  let customerEmail = '';
  let customerName = '';
  let amountCents = 0;
  let currency = 'usd';
  let planName = '';
  let stripeCustomerId = data.customer || '';

  // Resolve customer email from Stripe
  if (stripeCustomerId && env.STRIPE_API_KEY) {
    try {
      const custRes = await fetch(`https://api.stripe.com/v1/customers/${stripeCustomerId}`, {
        headers: { Authorization: `Bearer ${env.STRIPE_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      });
      if (custRes.ok) {
        const cust = await custRes.json() as any;
        customerEmail = cust.email || '';
        customerName = cust.name || '';
      }
    } catch { /* non-critical */ }
  }

  switch (type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      amountCents = data.items?.data?.[0]?.price?.unit_amount || 0;
      currency = data.currency || 'usd';
      planName = data.items?.data?.[0]?.price?.nickname || data.items?.data?.[0]?.price?.product || '';
      break;

    case 'invoice.payment_succeeded':
      amountCents = data.amount_paid || 0;
      currency = data.currency || 'usd';
      customerEmail = customerEmail || data.customer_email || '';
      break;

    case 'charge.succeeded':
      amountCents = data.amount || 0;
      currency = data.currency || 'usd';
      break;

    case 'charge.refunded':
      amountCents = -(data.amount_refunded || data.amount || 0);
      currency = data.currency || 'usd';
      break;

    default:
      // Store but don't process unknown events
      break;
  }

  // Store the event
  try {
    await env.DB.prepare(`
      INSERT OR IGNORE INTO revenue_events
      (event_type, customer_email, customer_name, amount_cents, currency, plan_name, stripe_event_id, stripe_customer_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      type, customerEmail, customerName, amountCents, currency, planName,
      event.id, stripeCustomerId
    ).run();

    // Log to activity
    if (['customer.subscription.created', 'invoice.payment_succeeded'].includes(type)) {
      const amount = (amountCents / 100).toFixed(2);
      await env.DB.prepare(
        'INSERT INTO activity_log (source, event_type, summary) VALUES (?, ?, ?)'
      ).bind('stripe', type, `${customerEmail || 'Unknown'}: $${amount} ${currency.toUpperCase()} — ${planName || type}`).run();

      // Check milestones — First Dollar
      if (amountCents > 0) {
        await env.DB.prepare(
          'UPDATE milestones SET achieved_at = datetime("now") WHERE title = "First Dollar" AND achieved_at IS NULL'
        ).run();
      }
    }

    // Update funnel stages in unified_users + funnel_events
    if (customerEmail) {
      const email = customerEmail.toLowerCase().trim();
      if (type === 'customer.subscription.created' || type === 'invoice.payment_succeeded') {
        await env.DB.prepare(
          `UPDATE unified_users SET current_stage = 'paid', synced_at = datetime('now') WHERE email = ?`
        ).bind(email).run();
        await env.DB.prepare(
          `INSERT OR IGNORE INTO funnel_events (email, stage, source) VALUES (?, 'paid', 'stripe_webhook')`
        ).bind(email).run();
        // Mark UTM attribution as converted
        await env.DB.prepare(
          `UPDATE utm_attributions SET converted_to_paid = 1, revenue_cents = revenue_cents + ? WHERE email = ? AND converted_to_paid = 0`
        ).bind(Math.max(amountCents, 0), email).run();
      }
      if (type === 'customer.subscription.deleted') {
        await env.DB.prepare(
          `UPDATE unified_users SET current_stage = 'churned', synced_at = datetime('now') WHERE email = ?`
        ).bind(email).run();
        await env.DB.prepare(
          `INSERT OR IGNORE INTO funnel_events (email, stage, source) VALUES (?, 'churned', 'stripe_webhook')`
        ).bind(email).run();
      }
    }
  } catch (err) {
    console.error('Stripe webhook storage error:', err);
  }

  return json({ received: true });
}

async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const parts = signature.split(',').reduce((acc: Record<string, string>, part) => {
      const [key, value] = part.split('=');
      acc[key.trim()] = value;
      return acc;
    }, {});

    const timestamp = parts['t'];
    const sig = parts['v1'];
    if (!timestamp || !sig) return false;

    // Check timestamp is within 5 minutes
    const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
    if (age > 300) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expected = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
    const expectedHex = Array.from(new Uint8Array(expected)).map(b => b.toString(16).padStart(2, '0')).join('');

    return expectedHex === sig;
  } catch {
    return false;
  }
}

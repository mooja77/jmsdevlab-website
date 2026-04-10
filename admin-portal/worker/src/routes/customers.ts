/**
 * Customers — unified view across all apps + Stripe data.
 * Aggregates users from each app's /api/admin/users endpoint
 * and enriches with Stripe subscription/payment data.
 */

import { Env, json } from '../types';
import { getAllApps, fetchUsersFromApp } from '../lib/d1';
import { isTestEmail } from '../lib/filter';

interface Customer {
  email: string;
  name: string;
  app: string;
  appId: string;
  plan: string;
  isTest: boolean;
  createdAt: string;
  lastLogin: string;
  stripe?: {
    customerId: string;
    subscriptionStatus: string;
    planAmount: number;
    currentPeriodEnd: string;
  };
}

// isTestEmail imported from ../lib/filter.ts — single source of truth

export async function handleCustomerRoutes(path: string, url: URL, env: Env): Promise<Response> {
  // GET /api/customers — all real users from all apps (filtered, no test accounts)
  if (path === '/api/customers' && !path.includes('/stripe')) {
    const showTest = url.searchParams.get('includeTest') === 'true';
    const apps = await getAllApps(env);

    const allCustomers: Customer[] = [];

    // Fetch users from each app in parallel (shared function)
    const fetches = apps
      .filter(app => app.has_admin && app.api_base_url)
      .map(async app => {
        const result = await fetchUsersFromApp(env, app);
        if (result.error) return;

        for (const u of result.users) {
          if (!showTest && u.isTest) continue;

          allCustomers.push({
            email: u.email,
            name: u.name,
            app: app.name,
            appId: app.id,
            plan: String(u.plan || u.subscriptionTier || u.subscriptionPlan || u.status || 'unknown'),
            isTest: u.isTest,
            createdAt: String(u.createdAt || u.created_at || ''),
            lastLogin: String(u.lastLogin || u.lastLoginAt || u.last_login || ''),
          });
        }
      });

    await Promise.allSettled(fetches);

    // Sort: real customers first, then by most recent
    allCustomers.sort((a, b) => {
      if (a.isTest !== b.isTest) return a.isTest ? 1 : -1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    const realCount = allCustomers.filter(c => !c.isTest).length;
    const testCount = allCustomers.filter(c => c.isTest).length;

    return json({
      customers: allCustomers,
      total: allCustomers.length,
      realCustomers: realCount,
      testAccounts: testCount,
    });
  }

  // GET /api/customers/stripe — Stripe-specific data
  if (path === '/api/customers/stripe') {
    if (!env.STRIPE_API_KEY) {
      return json({ error: 'Stripe API key not configured', customers: [], products: [], subscriptions: [] });
    }

    try {
      // Fetch customers, products, subscriptions, and balance in parallel
      const [custRes, prodRes, subRes, balRes, priceRes] = await Promise.all([
        fetch('https://api.stripe.com/v1/customers?limit=100', {
          headers: { 'Authorization': `Bearer ${env.STRIPE_API_KEY}` },
        }),
        fetch('https://api.stripe.com/v1/products?limit=100&active=true', {
          headers: { 'Authorization': `Bearer ${env.STRIPE_API_KEY}` },
        }),
        fetch('https://api.stripe.com/v1/subscriptions?limit=100&status=all', {
          headers: { 'Authorization': `Bearer ${env.STRIPE_API_KEY}` },
        }),
        fetch('https://api.stripe.com/v1/balance', {
          headers: { 'Authorization': `Bearer ${env.STRIPE_API_KEY}` },
        }),
        fetch('https://api.stripe.com/v1/prices?limit=100&active=true', {
          headers: { 'Authorization': `Bearer ${env.STRIPE_API_KEY}` },
        }),
      ]);

      const [customers, products, subscriptions, balance, prices] = await Promise.all([
        custRes.json() as Promise<any>,
        prodRes.json() as Promise<any>,
        subRes.json() as Promise<any>,
        balRes.json() as Promise<any>,
        priceRes.json() as Promise<any>,
      ]);

      // Build product lookup
      const productMap: Record<string, string> = {};
      (products.data || []).forEach((p: any) => { productMap[p.id] = p.name; });

      // Build price lookup
      const priceMap: Record<string, { amount: number; interval: string; product: string }> = {};
      (prices.data || []).forEach((p: any) => {
        priceMap[p.id] = {
          amount: p.unit_amount || p.amount || 0,
          interval: p.recurring?.interval || 'one_time',
          product: productMap[p.product] || p.product,
        };
      });

      // Enrich subscriptions with product names
      const enrichedSubs = (subscriptions.data || []).map((sub: any) => {
        const items = (sub.items?.data || []).map((item: any) => {
          const price = priceMap[item.price?.id] || { amount: item.price?.unit_amount || 0, interval: item.price?.recurring?.interval || '', product: '' };
          return {
            priceId: item.price?.id,
            productName: price.product,
            amount: price.amount / 100,
            interval: price.interval,
          };
        });

        return {
          id: sub.id,
          customerId: sub.customer,
          status: sub.status,
          items,
          mrr: items.reduce((sum: number, i: any) => sum + (i.interval === 'month' ? i.amount : i.interval === 'year' ? i.amount / 12 : 0), 0),
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
          cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
          created: new Date(sub.created * 1000).toISOString(),
        };
      });

      // Enrich customers
      const enrichedCustomers = (customers.data || []).map((c: any) => ({
        id: c.id,
        email: c.email,
        name: c.name,
        isTest: isTestEmail(c.email || ''),
        created: new Date(c.created * 1000).toISOString(),
        subscriptions: enrichedSubs.filter((s: any) => s.customerId === c.id),
      }));

      // Build product catalog with prices
      const catalog = (products.data || []).map((p: any) => {
        const productPrices = (prices.data || [])
          .filter((pr: any) => pr.product === p.id)
          .map((pr: any) => ({
            id: pr.id,
            amount: (pr.unit_amount || pr.amount || 0) / 100,
            interval: pr.recurring?.interval || 'one_time',
            intervalCount: pr.recurring?.interval_count || 1,
          }));
        return { id: p.id, name: p.name, description: p.description, prices: productPrices };
      });

      const available = (balance as any).available || [];
      const pending = (balance as any).pending || [];

      return json({
        customers: enrichedCustomers,
        realCustomers: enrichedCustomers.filter((c: any) => !c.isTest).length,
        testCustomers: enrichedCustomers.filter((c: any) => c.isTest).length,
        subscriptions: enrichedSubs,
        activeSubscriptions: enrichedSubs.filter((s: any) => s.status === 'active').length,
        totalMrr: enrichedSubs.filter((s: any) => s.status === 'active').reduce((sum: number, s: any) => sum + s.mrr, 0),
        balance: {
          available: available.map((b: any) => ({ amount: b.amount / 100, currency: b.currency })),
          pending: pending.map((b: any) => ({ amount: b.amount / 100, currency: b.currency })),
        },
        catalog,
      });
    } catch (err) {
      return json({ error: 'Stripe API error: ' + String(err) }, 500);
    }
  }

  return json({ error: 'Not found' }, 404);
}

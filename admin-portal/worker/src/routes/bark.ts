/**
 * Bark Lead Finder — parse Bark.com email notifications,
 * extract structured lead data, decode partial contacts.
 */

import { Env, json } from '../types';
import { parseBarkEmail, decodePartialEmail, decodePartialPhone, decodeDomain, scorePriority, COMMON_DOMAINS } from '../lib/bark-parser';

function generateId(): string {
  return `bark_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Re-export parser functions used inline below (keep backwards compat)
export { parseBarkEmail, decodePartialEmail, decodePartialPhone };

// Parsing functions imported from ../lib/bark-parser

// ─── Auto-Research Strategies ────────────────────────────────────

interface Candidate {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  source: string;
  score: number;
  snippet?: string;
}

interface StrategyResult {
  strategy: string;
  status: 'ok' | 'skipped' | 'error';
  reason?: string;
  queries?: string[];
  candidates: Candidate[];
}

// COMMON_DOMAINS imported from ../lib/bark-parser

// Noise patterns — penalise irrelevant results
const NOISE_URLS = /careers\.|indeed\.|glassdoor\.|monster\.|jobs\.|yelp\.|designrush\.|clutch\.co|sortlist\.|themanifest\.|mobiloud\.|ensun\.|spokeo\.|rocketreach\.|contactout\.|zoominfo\./i;
const NOISE_TITLES = /top \d+|best \d+|companies in|firms in|agencies in|developers in|rankings|directory/i;

/** Check if an email matches a lead's partial email pattern */
function matchesPartialEmail(email: string, lead: any): boolean {
  if (!email || !lead.email_first_char) return false;
  const [local, domain] = email.toLowerCase().split('@');
  if (!local || !domain) return false;
  return local[0] === lead.email_first_char.toLowerCase()
    && local.length === lead.email_char_count
    && local[local.length - 1] === (lead.email_last_char || '').toLowerCase()
    && domain === (lead.email_domain || '').toLowerCase();
}

function scoreCandidate(c: Candidate, lead: any): number {
  let score = 0;
  const fn = (lead.first_name || '').toLowerCase();
  const loc = (lead.location || '').toLowerCase();
  const combined = `${c.company || ''} ${c.snippet || ''}`.toLowerCase();

  // Penalties for noise
  if (NOISE_URLS.test(c.website || '')) score -= 20;
  if (NOISE_TITLES.test(combined)) score -= 15;

  // Name match — extra for LinkedIn
  if (c.name && c.name.toLowerCase().includes(fn)) {
    score += c.linkedin ? 40 : 30;
  }

  // Location match
  if (loc) {
    const locTerm = loc.split(',')[0].trim();
    if (locTerm && combined.includes(locTerm)) score += 20;
  }

  // Business type match — check category keywords
  const biz = (lead.business_type || lead.bark_category || '').toLowerCase();
  if (biz) {
    const bizWords = biz.split(/[\s,/]+/).filter((w: string) => w.length > 3);
    const matchCount = bizWords.filter((w: string) => combined.includes(w)).length;
    if (matchCount >= 2) score += 20;
    else if (matchCount >= 1) score += 10;
  }

  // .ie domain bonus
  if (c.website && /\.ie(\/|$)/.test(c.website)) score += 5;

  // Email pattern match — strongest signal
  if (c.email && matchesPartialEmail(c.email, lead)) score += 30;

  // Phone prefix match
  if (c.phone && lead.phone_prefix) {
    const digits = c.phone.replace(/[\s\-\+\(\)]/g, '');
    if (digits.startsWith(lead.phone_prefix) || digits.startsWith('353' + lead.phone_prefix.slice(1))) {
      score += 10;
    }
  }

  return score;
}

/** Strategy 1: Brave Web Search */
async function searchBrave(lead: any, env: Env): Promise<StrategyResult> {
  if (!env.BRAVE_SEARCH_KEY) {
    return { strategy: 'Brave Search', status: 'skipped', reason: 'No BRAVE_SEARCH_KEY configured', candidates: [] };
  }

  const name = lead.first_name;
  const loc = lead.location || 'Ireland';
  const biz = lead.business_type || lead.bark_category || '';
  const queries = [
    `${name} ${biz} ${loc} Ireland`,
    `${name} ${loc} Ireland site:linkedin.com/in`,
    `${biz} ${loc} Ireland`,
  ];

  const candidates: Candidate[] = [];
  const queryResults: string[] = [];

  for (const q of queries) {
    try {
      const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=5`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': env.BRAVE_SEARCH_KEY,
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) { queryResults.push(`"${q}" → error ${res.status}`); continue; }
      const data = await res.json<any>();
      const items = data.web?.results || [];
      queryResults.push(`"${q}" → ${items.length} results`);

      for (const item of items) {
        const c: Candidate = {
          name: '',
          source: 'brave',
          score: 0,
          snippet: item.description || '',
          website: item.url || '',
        };

        // Extract name from title for LinkedIn results
        if (item.url?.includes('linkedin.com/in/')) {
          c.linkedin = item.url;
          const titleMatch = item.title?.match(/^([^-–|]+)/);
          if (titleMatch) c.name = titleMatch[1].trim();
        } else if (item.url?.includes('facebook.com')) {
          const titleMatch = item.title?.match(/^([^-–|]+)/);
          if (titleMatch) c.name = titleMatch[1].trim();
        } else {
          c.company = item.title?.replace(/ [-–|].*/, '').trim();
          c.name = name;
        }

        // Look for email in snippet
        const emailMatch = (item.description || '').match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) c.email = emailMatch[0];

        // Look for phone in snippet (Irish format)
        const phoneMatch = (item.description || '').match(/(?:0\d{1,2}[\s-]?\d{3}[\s-]?\d{4}|\+353[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4})/);
        if (phoneMatch) c.phone = phoneMatch[0];

        if (c.name || c.company) {
          c.score = scoreCandidate(c, lead);
          candidates.push(c);
        }
      }
    } catch (e) {
      queryResults.push(`"${q}" → error: ${String(e).slice(0, 50)}`);
    }
  }

  // Second pass: scrape top candidate websites for email/phone that match partial patterns
  const scrapeable = candidates
    .filter(c => c.website && !/linkedin|facebook|twitter|indeed|glassdoor/.test(c.website))
    .slice(0, 3);
  for (const c of scrapeable) {
    try {
      const page = await fetch(c.website!, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      });
      if (!page.ok) continue;
      const html = await page.text();
      // Check for email pattern match
      const emails = html.match(/[\w.-]+@[\w.-]+\.\w{2,}/g) || [];
      for (const email of emails.filter(e => !/example|wix|wordpress|sentry/.test(e))) {
        if (matchesPartialEmail(email, lead)) {
          c.email = email;
          c.score = scoreCandidate(c, lead); // re-score with email match
          break;
        }
      }
      // Extract phone if not found
      if (!c.phone) {
        const phones = html.match(/(?:0\d{1,2}[\s-]?\d{3}[\s-]?\d{4}|\+353[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4})/g) || [];
        if (phones.length > 0) {
          c.phone = phones[0];
          c.score = scoreCandidate(c, lead);
        }
      }
    } catch { /* timeout or fetch error — skip */ }
  }

  return { strategy: 'Brave Search', status: 'ok', queries: queryResults, candidates };
}

/** Strategy 2: .ie Domain WHOIS via RDAP */
async function lookupWhois(lead: any): Promise<StrategyResult> {
  const domain = lead.email_domain;
  if (!domain || COMMON_DOMAINS.includes(domain)) {
    return { strategy: 'WHOIS Lookup', status: 'skipped', reason: `${domain || 'no domain'} is not a custom domain`, candidates: [] };
  }

  try {
    // Try RDAP lookup
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { 'Accept': 'application/rdap+json' },
    });

    if (!res.ok) {
      // Fallback: just try to fetch the domain's homepage for contact info
      return await scrapeWebsite(domain, lead);
    }

    const data = await res.json<any>();
    const candidates: Candidate[] = [];

    // Extract registrant info from RDAP response
    const entities = data.entities || [];
    for (const entity of entities) {
      if (entity.roles?.includes('registrant') || entity.roles?.includes('administrative')) {
        const vcard = entity.vcardArray?.[1] || [];
        const c: Candidate = { name: '', source: 'whois', score: 0, website: `https://${domain}` };
        for (const field of vcard) {
          if (field[0] === 'fn') c.name = field[3];
          if (field[0] === 'org') c.company = field[3];
          if (field[0] === 'email') c.email = field[3];
          if (field[0] === 'tel') c.phone = field[3];
        }
        if (c.name || c.company) {
          c.score = scoreCandidate(c, lead);
          candidates.push(c);
        }
      }
    }

    return { strategy: 'WHOIS Lookup', status: 'ok', candidates };
  } catch (e) {
    return { strategy: 'WHOIS Lookup', status: 'error', reason: String(e).slice(0, 100), candidates: [] };
  }
}

/** Scrape a website homepage for contact info */
async function scrapeWebsite(domain: string, lead: any): Promise<StrategyResult> {
  try {
    const res = await fetch(`https://${domain}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow',
    });
    if (!res.ok) return { strategy: 'Website Scrape', status: 'error', reason: `${res.status}`, candidates: [] };

    const html = await res.text();
    const candidates: Candidate[] = [];
    const c: Candidate = { name: '', source: 'website', score: 0, website: `https://${domain}` };

    // Extract emails from page
    const emails = html.match(/[\w.-]+@[\w.-]+\.\w{2,}/g) || [];
    const relevantEmails = emails.filter(e => !e.includes('example') && !e.includes('wix') && !e.includes('wordpress'));
    if (relevantEmails.length > 0) c.email = relevantEmails[0];

    // Extract phone numbers (Irish format)
    const phones = html.match(/(?:0\d{1,2}[\s\-]?\d{3}[\s\-]?\d{4}|\+353[\s\-]?\d{1,2}[\s\-]?\d{3}[\s\-]?\d{4})/g) || [];
    if (phones.length > 0) c.phone = phones[0];

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
    if (titleMatch) c.company = titleMatch[1].replace(/\s*[-|–].*/, '').trim();

    // Look for name in meta or about sections
    const fn = lead.first_name.toLowerCase();
    if (html.toLowerCase().includes(fn)) {
      c.name = lead.first_name;
      // Try to find full name near first name
      const namePattern = new RegExp(`(${lead.first_name}\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)`, 'i');
      const fullNameMatch = html.match(namePattern);
      if (fullNameMatch) c.name = fullNameMatch[1];
    }

    if (c.name || c.email || c.phone || c.company) {
      c.score = scoreCandidate(c, lead);
      candidates.push(c);
    }

    return { strategy: 'Website Scrape', status: 'ok', candidates };
  } catch (e) {
    return { strategy: 'Website Scrape', status: 'error', reason: String(e).slice(0, 100), candidates: [] };
  }
}

/** Strategy 3: Golden Pages business directory */
async function searchGoldenPages(lead: any): Promise<StrategyResult> {
  const loc = lead.location;
  const biz = lead.business_type || lead.bark_category || '';
  if (!loc) return { strategy: 'Golden Pages', status: 'skipped', reason: 'No location', candidates: [] };

  try {
    const searchTerm = biz.split(/[,(/]/)[0].trim() || 'business';
    const area = loc.split(',')[0].trim();
    const url = `https://www.goldenpages.ie/q/${encodeURIComponent(searchTerm)}/where/${encodeURIComponent(area)}/`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JMSDevLab/1.0)' },
      redirect: 'follow',
    });

    if (!res.ok) return { strategy: 'Golden Pages', status: 'error', reason: `HTTP ${res.status}`, candidates: [] };

    const html = await res.text();
    const candidates: Candidate[] = [];
    const fn = lead.first_name.toLowerCase();

    // Parse listing items - look for business names, phones, websites
    const listingPattern = /<h2[^>]*class="[^"]*listing-name[^"]*"[^>]*>([^<]+)<\/h2>/gi;
    const phonePattern = /href="tel:([^"]+)"/gi;
    const websitePattern = /data-ga-click="website"[^>]*href="([^"]+)"/gi;

    let match;
    const names: string[] = [];
    const phones: string[] = [];
    const websites: string[] = [];

    while ((match = listingPattern.exec(html)) !== null) names.push(match[1].trim());
    while ((match = phonePattern.exec(html)) !== null) phones.push(match[1].trim());
    while ((match = websitePattern.exec(html)) !== null) websites.push(match[1].trim());

    for (let i = 0; i < Math.min(names.length, 10); i++) {
      const c: Candidate = {
        name: names[i].toLowerCase().includes(fn) ? lead.first_name : '',
        company: names[i],
        phone: phones[i] || undefined,
        website: websites[i] || undefined,
        source: 'goldenpages',
        score: 0,
      };
      c.score = scoreCandidate(c, lead);
      // Only include if some relevance
      if (c.score > 0 || names[i].toLowerCase().includes(fn)) {
        candidates.push(c);
      }
    }

    // If no name matches, include top 3 anyway as area businesses
    if (candidates.length === 0 && names.length > 0) {
      for (let i = 0; i < Math.min(names.length, 3); i++) {
        candidates.push({
          name: '',
          company: names[i],
          phone: phones[i] || undefined,
          website: websites[i] || undefined,
          source: 'goldenpages',
          score: 5,
          snippet: `Business in ${area}`,
        });
      }
    }

    return { strategy: 'Golden Pages', status: 'ok', candidates };
  } catch (e) {
    return { strategy: 'Golden Pages', status: 'error', reason: String(e).slice(0, 100), candidates: [] };
  }
}

/** Strategy 4: Try to resolve candidate .ie domains */
async function searchDomainGuess(lead: any): Promise<StrategyResult> {
  const domain = lead.email_domain;
  if (!domain || COMMON_DOMAINS.includes(domain)) {
    return { strategy: 'Domain Guess', status: 'skipped', reason: 'Common email domain', candidates: [] };
  }

  // If the email is on a custom domain, we already know the website
  // Try to scrape it
  return scrapeWebsite(domain, lead);
}

/** Run all strategies and return combined results */
async function runAutoResearch(lead: any, env: Env): Promise<{
  strategies: StrategyResult[];
  topCandidates: Candidate[];
}> {
  // Run strategies in parallel
  const [google, whois, goldenPages, domainGuess] = await Promise.allSettled([
    searchBrave(lead, env),
    lookupWhois(lead),
    searchGoldenPages(lead),
    searchDomainGuess(lead),
  ]);

  const strategies: StrategyResult[] = [
    google.status === 'fulfilled' ? google.value : { strategy: 'Brave Search', status: 'error' as const, reason: String((google as PromiseRejectedResult).reason).slice(0, 100), candidates: [] },
    whois.status === 'fulfilled' ? whois.value : { strategy: 'WHOIS Lookup', status: 'error' as const, reason: String((whois as PromiseRejectedResult).reason).slice(0, 100), candidates: [] },
    goldenPages.status === 'fulfilled' ? goldenPages.value : { strategy: 'Golden Pages', status: 'error' as const, reason: String((goldenPages as PromiseRejectedResult).reason).slice(0, 100), candidates: [] },
    domainGuess.status === 'fulfilled' ? domainGuess.value : { strategy: 'Domain Guess', status: 'error' as const, reason: String((domainGuess as PromiseRejectedResult).reason).slice(0, 100), candidates: [] },
  ];

  // Collect all candidates, dedupe by website/email, sort by score
  const allCandidates = strategies.flatMap(s => s.candidates);
  const seen = new Set<string>();
  const unique = allCandidates.filter(c => {
    const key = c.email || c.website || c.linkedin || c.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => b.score - a.score);
  const topCandidates = unique.slice(0, 8);

  return { strategies, topCandidates };
}

export async function handleBarkRoutes(path: string, request: Request, env: Env): Promise<Response> {

  // GET /api/bark — list all bark leads with priority scoring
  if (path === '/api/bark' && request.method === 'GET') {
    const result = await env.DB.prepare(
      'SELECT * FROM bark_leads ORDER BY received_at DESC, created_at DESC'
    ).all();
    const byStatus: Record<string, number> = {};
    const leads = result.results.map((r: any) => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      const priority = scorePriority(r);
      return { ...r, priority_score: priority.score, priority_label: priority.label };
    });

    // Get last scan time
    const lastScan = await env.DB.prepare(
      "SELECT value FROM config WHERE key = 'bark_scan_last'"
    ).first<{ value: string }>();

    return json({ leads, total: leads.length, byStatus, lastScan: lastScan?.value || null });
  }

  // POST /api/bark/scan-gmail — trigger Gmail scan on demand
  if (path === '/api/bark/scan-gmail' && request.method === 'POST') {
    const { runBarkScan } = await import('../cron/bark');
    // Override the daily check for manual trigger
    await env.DB.prepare("DELETE FROM config WHERE key = 'bark_scan_last'").run();
    const scanResult = await runBarkScan(env);
    return json(scanResult);
  }

  // GET /api/bark/:id — single lead
  const getMatch = path.match(/^\/api\/bark\/([^/]+)$/);
  if (getMatch && request.method === 'GET') {
    const lead = await env.DB.prepare('SELECT * FROM bark_leads WHERE id = ?').bind(getMatch[1]).first();
    if (!lead) return json({ error: 'Not found' }, 404);
    return json({ lead });
  }

  // POST /api/bark/scan — parse pre-fetched Bark emails
  if (path === '/api/bark/scan' && request.method === 'POST') {
    const body = await request.json<{ emails: Array<{ messageId: string; subject: string; body: string; date: string }> }>();

    const results: string[] = [];
    for (const email of body.emails) {
      // Check if already parsed
      const existing = await env.DB.prepare(
        'SELECT id FROM bark_leads WHERE gmail_message_id = ?'
      ).bind(email.messageId).first();
      if (existing) {
        results.push(`${email.messageId}: skipped (already exists)`);
        continue;
      }

      const parsed = parseBarkEmail(email.body, email.subject);
      if (!parsed.firstName) {
        results.push(`${email.messageId}: skipped (could not parse name)`);
        continue;
      }

      const emailDecoded = decodePartialEmail(parsed.partialEmail);
      const phoneDecoded = decodePartialPhone(parsed.partialPhone);

      const id = generateId();
      await env.DB.prepare(`
        INSERT INTO bark_leads (
          id, gmail_message_id, first_name, location, business_type,
          project_description, budget, timeline, hiring_intent, bark_category,
          partial_phone, partial_email, phone_prefix,
          email_first_char, email_char_count, email_last_char, email_domain,
          received_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        email.messageId,
        parsed.firstName,
        parsed.location || null,
        parsed.projectDetails['Business type'] || null,
        JSON.stringify({ ...parsed.projectDetails, quote: parsed.quote }),
        parsed.projectDetails['Budget'] || null,
        parsed.projectDetails['Timeline'] || null,
        parsed.projectDetails['Hiring intent'] || null,
        parsed.category || null,
        parsed.partialPhone || null,
        parsed.partialEmail || null,
        phoneDecoded?.prefix || null,
        emailDecoded?.firstChar || null,
        emailDecoded?.charCount || null,
        emailDecoded?.lastChar || null,
        emailDecoded?.domain || null,
        email.date || new Date().toISOString(),
      ).run();

      results.push(`${email.messageId}: parsed → ${parsed.firstName} (${parsed.location})`);
    }

    return json({ success: true, results, count: results.length });
  }

  // PUT /api/bark/:id — update research results
  const putMatch = path.match(/^\/api\/bark\/([^/]+)$/);
  if (putMatch && request.method === 'PUT') {
    const id = putMatch[1];
    const body = await request.json<any>();

    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of [
      'status', 'matched_name', 'matched_email', 'matched_phone',
      'matched_linkedin', 'matched_website', 'matched_company',
      'confidence', 'research_notes',
    ]) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }
    fields.push('updated_at = datetime("now")');
    values.push(id);

    await env.DB.prepare(`UPDATE bark_leads SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
    return json({ success: true });
  }

  // POST /api/bark/:id/promote — promote to leads pipeline
  const promoteMatch = path.match(/^\/api\/bark\/([^/]+)\/promote$/);
  if (promoteMatch && request.method === 'POST') {
    const barkId = promoteMatch[1];
    const bark = await env.DB.prepare('SELECT * FROM bark_leads WHERE id = ?').bind(barkId).first<any>();
    if (!bark) return json({ error: 'Not found' }, 404);

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await env.DB.prepare(`
      INSERT INTO leads (id, source, name, email, company, service_type, budget_range, status, notes, source_message_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      leadId,
      'bark',
      bark.matched_name || bark.first_name,
      bark.matched_email || null,
      bark.matched_company || null,
      bark.bark_category || null,
      bark.budget || null,
      'new',
      `Bark lead from ${bark.location}. ${bark.research_notes || ''}`.trim(),
      bark.gmail_message_id,
    ).run();

    await env.DB.prepare('UPDATE bark_leads SET lead_id = ?, status = ? WHERE id = ?')
      .bind(leadId, 'contacted', barkId).run();

    await env.DB.prepare(
      'INSERT INTO activity_log (source, event_type, summary) VALUES (?, ?, ?)'
    ).bind('bark', 'lead_created', `Bark lead promoted: ${bark.first_name} (${bark.location})`).run();

    return json({ success: true, leadId });
  }

  // POST /api/bark/:id/research — auto-research a lead
  const researchMatch = path.match(/^\/api\/bark\/([^/]+)\/research$/);
  if (researchMatch && request.method === 'POST') {
    const id = researchMatch[1];
    const lead = await env.DB.prepare('SELECT * FROM bark_leads WHERE id = ?').bind(id).first<any>();
    if (!lead) return json({ error: 'Not found' }, 404);

    // Set status to researching
    await env.DB.prepare('UPDATE bark_leads SET status = ? WHERE id = ?').bind('researching', id).run();

    const { strategies, topCandidates } = await runAutoResearch(lead, env);

    // Store results
    const resultsJson = JSON.stringify({ strategies, topCandidates, researchedAt: new Date().toISOString() });

    // Auto-fill from top candidate if high confidence
    const top = topCandidates[0];
    const updates: Record<string, unknown> = {
      search_results_json: resultsJson,
      status: top && top.score >= 80 ? 'found' : 'researching',
      updated_at: new Date().toISOString(),
    };
    if (top && top.score >= 80) {
      if (top.name) updates.matched_name = top.name;
      if (top.email) updates.matched_email = top.email;
      if (top.phone) updates.matched_phone = top.phone;
      if (top.website) updates.matched_website = top.website;
      if (top.linkedin) updates.matched_linkedin = top.linkedin;
      if (top.company) updates.matched_company = top.company;
      updates.confidence = top.score;
    }

    const fields = Object.keys(updates).map(k => `${k} = ?`);
    const values = Object.values(updates);
    values.push(id);
    await env.DB.prepare(`UPDATE bark_leads SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();

    return json({ success: true, strategies, topCandidates, autoFilled: top && top.score >= 80 });
  }

  // GET /api/bark/:id/template — generate outreach email
  const templateMatch = path.match(/^\/api\/bark\/([^/]+)\/template$/);
  if (templateMatch && request.method === 'GET') {
    const lead = await env.DB.prepare('SELECT * FROM bark_leads WHERE id = ?').bind(templateMatch[1]).first<any>();
    if (!lead) return json({ error: 'Not found' }, 404);
    const details = JSON.parse(lead.project_description || '{}');
    const isWeb = (lead.bark_category || '').toLowerCase().includes('web');

    return json({ template: {
      subject: `${lead.bark_category} — I can help, ${lead.first_name}`,
      body: `Hi ${lead.first_name},

I'm John Moore from JMS Dev Lab, a software development studio based in Ireland. I saw you're looking for a ${lead.bark_category}${lead.location ? ` in ${lead.location}` : ''}.

${details.quote ? `Your project — "${details.quote}" — sounds like something I can help with.\n` : ''}${lead.budget && lead.budget !== 'Unknown' ? `Your budget of ${lead.budget} is within my range. ` : ''}I have experience building ${isWeb ? 'responsive websites, WordPress sites, and custom web applications' : 'mobile apps for iOS and Android, including React Native and native development'}.

You can see my work at https://jmsdevlab.com

Would you be open to a quick 15-minute call to discuss your requirements?

Best regards,
John Moore
JMS Dev Lab
john@jmsdevlab.com`,
    }});
  }

  // DELETE /api/bark/:id
  const delMatch = path.match(/^\/api\/bark\/([^/]+)$/);
  if (delMatch && request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM bark_leads WHERE id = ?').bind(delMatch[1]).run();
    return json({ success: true });
  }

  return json({ error: 'Not found' }, 404);
}

// Export for use in cron/bark.ts
export { runAutoResearch };

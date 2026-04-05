/**
 * Bark Lead Finder — parse Bark.com email notifications,
 * extract structured lead data, decode partial contacts.
 */

import { Env, json } from '../types';

function generateId(): string {
  return `bark_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Decode partially masked email domain: y***o.com → yahoo.com */
function decodeDomain(masked: string): string {
  const map: Record<string, string> = {
    'g***l.com': 'gmail.com',
    'y***o.com': 'yahoo.com',
    'h*****l.com': 'hotmail.com',
    'o*****k.com': 'outlook.com',
    'i****d.com': 'icloud.com',
    'l**e.com': 'live.com',
    'p********l.com': 'protonmail.com',
    'a*l.com': 'aol.com',
  };
  for (const [pattern, domain] of Object.entries(map)) {
    if (masked.length === domain.length) {
      let match = true;
      for (let i = 0; i < masked.length; i++) {
        if (masked[i] !== '*' && masked[i] !== domain[i]) { match = false; break; }
      }
      if (match) return domain;
    }
  }
  return masked; // return as-is if no match
}

/** Parse partial email like k**********8@y***o.com */
function decodePartialEmail(partial: string): {
  firstChar: string; charCount: number; lastChar: string; domain: string; raw: string;
} | null {
  if (!partial || !partial.includes('@')) return null;
  const [local, domainRaw] = partial.split('@');
  if (!local || !domainRaw) return null;
  return {
    firstChar: local[0],
    charCount: local.length,
    lastChar: local[local.length - 1],
    domain: decodeDomain(domainRaw),
    raw: partial,
  };
}

/** Parse partial phone like 086******* */
function decodePartialPhone(partial: string): { prefix: string; totalDigits: number; raw: string } | null {
  if (!partial) return null;
  const cleaned = partial.replace(/[\s\-]/g, '');
  const digits = cleaned.match(/^(\d{3})/);
  if (!digits) return null;
  return {
    prefix: digits[1],
    totalDigits: cleaned.replace(/\*/g, '0').length,
    raw: partial,
  };
}

/** Parse a Bark notification email body into structured data */
function parseBarkEmail(body: string, subject: string): {
  firstName: string;
  category: string;
  location: string;
  partialPhone: string;
  partialEmail: string;
  projectDetails: Record<string, string>;
  quote: string | null;
} {
  const result = {
    firstName: '',
    category: '',
    location: '',
    partialPhone: '',
    partialEmail: '',
    projectDetails: {} as Record<string, string>,
    quote: null as string | null,
  };

  // Name + category from subject/body: "Khalid is looking for a Web Designer"
  const nameMatch = body.match(/🔔\s*(\w+)\s+is looking for a\s+(.+?)[\n📍]/s)
    || subject.match(/(?:Verified|details):\s*(\w+)\s+is looking for a\s+(.+)/);
  if (nameMatch) {
    result.firstName = nameMatch[1].trim();
    result.category = nameMatch[2].trim();
  }

  // Location: "📍Dublin: Happy to receive..."
  const locMatch = body.match(/📍([^:]+?):\s*(?:Happy|Needs)/);
  if (locMatch) {
    result.location = locMatch[1].trim();
  }

  // Partial phone: "086*******" or "085 *** ****"
  const phoneMatch = body.match(/(0\d{2}[\s*]+[\d*\s]+)/);
  if (phoneMatch) {
    result.partialPhone = phoneMatch[1].trim();
  }

  // Partial email: "k**********8@y***o.com"
  const emailMatch = body.match(/([a-zA-Z]\*+[a-zA-Z0-9]@[a-zA-Z*]+\.[a-zA-Z.]+)/);
  if (emailMatch) {
    result.partialEmail = emailMatch[1].trim();
  }

  // Quoted text: "Polish, connect and push live my app..."
  const quoteMatch = body.match(/"([^"]{10,})"/);
  if (quoteMatch) {
    result.quote = quoteMatch[1].trim();
  }

  // Project details: Q&A pairs after "Project Details"
  const detailsSection = body.split('Project Details')[1];
  if (detailsSection) {
    const qaPattern = /(?:Which|What|How|Do you)[^?]+\?\s*([^\n]+)/g;
    let match;
    while ((match = qaPattern.exec(detailsSection)) !== null) {
      const question = match[0].split('?')[0].trim() + '?';
      const answer = match[1].trim();
      if (answer && !answer.startsWith('Contact') && !answer.startsWith('You\'ll')) {
        // Shorten the question key
        const key = question
          .replace(/Which of these best describes your\s*/i, '')
          .replace(/What type of business is this for\?/i, 'Business type')
          .replace(/What are the objectives.*\?/i, 'Objectives')
          .replace(/What is your estimated budget.*\?/i, 'Budget')
          .replace(/How soon would you like.*\?/i, 'Timeline')
          .replace(/How likely are you to make a hiring decision\?/i, 'Hiring intent')
          .replace(/What sort of development work.*\?/i, 'Dev work')
          .replace(/What platform.*\?/i, 'Platform')
          .replace(/Which programming language.*\?/i, 'Language')
          .replace(/Do you have a budget.*\?/i, 'Budget')
          .replace(/\?$/, '');
        result.projectDetails[key || question] = answer;
      }
    }
  }

  return result;
}

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

const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'protonmail.com', 'aol.com'];

function scoreCandidate(c: Candidate, lead: any): number {
  let score = 0;
  const fn = (lead.first_name || '').toLowerCase();
  const loc = (lead.location || '').toLowerCase();

  // Name match
  if (c.name && c.name.toLowerCase().includes(fn)) score += 30;

  // Location match
  if (c.company && loc) {
    const combined = `${c.company} ${c.snippet || ''}`.toLowerCase();
    if (combined.includes(loc.split(',')[0].trim())) score += 20;
  }
  if (c.snippet && loc) {
    if (c.snippet.toLowerCase().includes(loc.split(',')[0].trim())) score += 10;
  }

  // Business type match
  const biz = (lead.business_type || lead.bark_category || '').toLowerCase();
  if (biz && c.snippet && c.snippet.toLowerCase().includes(biz.split(/[\s,]/)[0])) score += 15;

  // Email pattern match
  if (c.email && lead.email_first_char) {
    const [local, domain] = c.email.toLowerCase().split('@');
    if (local && domain &&
        local[0] === lead.email_first_char.toLowerCase() &&
        local.length === lead.email_char_count &&
        local[local.length - 1] === (lead.email_last_char || '').toLowerCase() &&
        domain === (lead.email_domain || '').toLowerCase()) {
      score += 25;
    }
  }

  // Phone prefix match
  if (c.phone && lead.phone_prefix) {
    const digits = c.phone.replace(/[\s\-\+\(\)]/g, '');
    if (digits.startsWith(lead.phone_prefix) || digits.startsWith('353' + lead.phone_prefix.slice(1))) {
      score += 10;
    }
  }

  return score;
}

/** Strategy 1: Google Custom Search */
async function searchGoogle(lead: any, env: Env): Promise<StrategyResult> {
  if (!env.GOOGLE_CSE_KEY || !env.GOOGLE_CSE_CX) {
    return { strategy: 'Google Search', status: 'skipped', reason: 'No API key configured', candidates: [] };
  }

  const name = lead.first_name;
  const loc = lead.location || 'Ireland';
  const biz = lead.business_type || lead.bark_category || '';
  const queries = [
    `"${name}" "${biz}" "${loc}" Ireland`,
    `"${name}" "${loc}" site:linkedin.com/in`,
    `"${name}" "${biz}" "${loc}" site:facebook.com`,
  ];

  const candidates: Candidate[] = [];
  const queryResults: string[] = [];

  for (const q of queries) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${env.GOOGLE_CSE_KEY}&cx=${env.GOOGLE_CSE_CX}&q=${encodeURIComponent(q)}&num=5`;
      const res = await fetch(url);
      if (!res.ok) { queryResults.push(`"${q}" → error ${res.status}`); continue; }
      const data = await res.json<any>();
      const items = data.items || [];
      queryResults.push(`"${q}" → ${items.length} results`);

      for (const item of items) {
        const c: Candidate = {
          name: '',
          source: 'google',
          score: 0,
          snippet: item.snippet || '',
          website: item.link || '',
        };

        // Extract name from title for LinkedIn results
        if (item.link?.includes('linkedin.com/in/')) {
          c.linkedin = item.link;
          const titleMatch = item.title?.match(/^([^-–|]+)/);
          if (titleMatch) c.name = titleMatch[1].trim();
        } else if (item.link?.includes('facebook.com')) {
          const titleMatch = item.title?.match(/^([^-–|]+)/);
          if (titleMatch) c.name = titleMatch[1].trim();
        } else {
          // Business website — extract contact info from snippet
          c.company = item.title?.replace(/ [-–|].*/, '').trim();
          c.name = name; // assume name match if search returned it
        }

        // Look for email in snippet
        const emailMatch = (item.snippet || '').match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) c.email = emailMatch[0];

        // Look for phone in snippet (Irish format)
        const phoneMatch = (item.snippet || '').match(/(?:0\d{1,2}[\s-]?\d{3}[\s-]?\d{4}|\+353[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4})/);
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

  return { strategy: 'Google Search', status: 'ok', queries: queryResults, candidates };
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
    searchGoogle(lead, env),
    lookupWhois(lead),
    searchGoldenPages(lead),
    searchDomainGuess(lead),
  ]);

  const strategies: StrategyResult[] = [
    google.status === 'fulfilled' ? google.value : { strategy: 'Google Search', status: 'error' as const, reason: String((google as PromiseRejectedResult).reason).slice(0, 100), candidates: [] },
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

  // GET /api/bark — list all bark leads
  if (path === '/api/bark' && request.method === 'GET') {
    const result = await env.DB.prepare(
      'SELECT * FROM bark_leads ORDER BY received_at DESC, created_at DESC'
    ).all();
    const byStatus: Record<string, number> = {};
    result.results.forEach((r: any) => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });
    return json({ leads: result.results, total: result.results.length, byStatus });
  }

  // GET /api/bark/:id — single lead
  const getMatch = path.match(/^\/api\/bark\/([^/]+)$/);
  if (getMatch && request.method === 'GET') {
    const lead = await env.DB.prepare('SELECT * FROM bark_leads WHERE id = ?').bind(getMatch[1]).first();
    if (!lead) return json({ error: 'Not found' }, 404);
    return json({ lead });
  }

  // POST /api/bark/scan — scan Gmail for Bark emails and parse them
  if (path === '/api/bark/scan' && request.method === 'POST') {
    if (!env.GMAIL_REFRESH_TOKEN) {
      return json({ error: 'Gmail not configured (GMAIL_REFRESH_TOKEN missing)' }, 400);
    }

    // For now, accept emails via POST body (parsed client-side or via MCP)
    // In production, this would call Gmail API with the refresh token
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
      status: top && top.score >= 60 ? 'found' : 'researching',
      updated_at: new Date().toISOString(),
    };
    if (top && top.score >= 60) {
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

    return json({ success: true, strategies, topCandidates, autoFilled: top && top.score >= 60 });
  }

  // DELETE /api/bark/:id
  const delMatch = path.match(/^\/api\/bark\/([^/]+)$/);
  if (delMatch && request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM bark_leads WHERE id = ?').bind(delMatch[1]).run();
    return json({ success: true });
  }

  return json({ error: 'Not found' }, 404);
}

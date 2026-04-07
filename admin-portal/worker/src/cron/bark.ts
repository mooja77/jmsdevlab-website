/**
 * Cron: Bark lead scanner — daily Gmail scan for new Bark.com lead emails.
 */

import { Env } from '../types';
import { parseBarkEmail, decodePartialEmail, decodePartialPhone } from '../lib/bark-parser';

function generateId(): string {
  return `bark_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Exchange refresh token for access token */
async function getGmailAccessToken(env: Env): Promise<string | null> {
  if (!env.GMAIL_REFRESH_TOKEN || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: env.GMAIL_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { access_token: string };
    return data.access_token;
  } catch {
    return null;
  }
}

/** Decode base64url encoded Gmail message body */
function decodeBody(encoded: string): string {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

/** Extract plain text body from Gmail message parts */
function extractBody(payload: any): string {
  // Simple body
  if (payload.body?.data) {
    return decodeBody(payload.body.data);
  }
  // Multipart — find text/plain or text/html
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBody(part.body.data);
      }
    }
    // Fallback to HTML
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        // Strip HTML tags for parsing
        return decodeBody(part.body.data).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
      }
      // Nested multipart
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
  }
  return '';
}

/** Main: scan Gmail for new Bark leads */
export async function runBarkScan(env: Env): Promise<{ scanned: number; newLeads: string[]; errors: string[] }> {
  const result = { scanned: 0, newLeads: [] as string[], errors: [] as string[] };

  // Only run once per day
  const lastRun = await env.DB.prepare(
    "SELECT value FROM config WHERE key = 'bark_scan_last'"
  ).first<{ value: string }>();

  if (lastRun) {
    const elapsed = Date.now() - new Date(lastRun.value).getTime();
    if (elapsed < 86400000) return result; // < 24 hours
  }

  const accessToken = await getGmailAccessToken(env);
  if (!accessToken) {
    result.errors.push('Could not get Gmail access token — check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REFRESH_TOKEN');
    return result;
  }

  try {
    // Search for Bark lead emails from last 3 days
    const query = 'from:bark.com subject:"is looking for" newer_than:3d';
    const searchRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=20`,
      { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(15000) }
    );

    if (!searchRes.ok) {
      result.errors.push(`Gmail search failed: ${searchRes.status}`);
      return result;
    }

    const searchData = await searchRes.json() as { messages?: Array<{ id: string }> };
    const messageIds = searchData.messages || [];
    result.scanned = messageIds.length;

    for (const { id } of messageIds) {
      // Check if already in DB
      const existing = await env.DB.prepare(
        'SELECT id FROM bark_leads WHERE gmail_message_id = ?'
      ).bind(id).first();
      if (existing) continue;

      // Fetch full message
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(10000) }
      );
      if (!msgRes.ok) { result.errors.push(`Failed to read message ${id}: ${msgRes.status}`); continue; }

      const msg = await msgRes.json() as any;
      const headers = msg.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';
      const body = extractBody(msg.payload);

      if (!body) { result.errors.push(`Empty body for ${id}`); continue; }

      // Parse the email
      const parsed = parseBarkEmail(body, subject);
      if (!parsed.firstName) { continue; } // Not a valid lead email

      const emailDecoded = decodePartialEmail(parsed.partialEmail);
      const phoneDecoded = decodePartialPhone(parsed.partialPhone);

      // Duplicate detection — check for matching email pattern
      let duplicateNote = '';
      if (emailDecoded) {
        const dup = await env.DB.prepare(`
          SELECT id, first_name, bark_category, received_at FROM bark_leads
          WHERE email_first_char = ? AND email_char_count = ? AND email_last_char = ? AND email_domain = ?
          ORDER BY received_at DESC LIMIT 1
        `).bind(emailDecoded.firstChar, emailDecoded.charCount, emailDecoded.lastChar, emailDecoded.domain).first<any>();
        if (dup) {
          duplicateNote = `DUPLICATE: matches lead ${dup.id} (${dup.first_name} — ${dup.bark_category})`;
        }
      }

      const projectDesc = { ...parsed.projectDetails, quote: parsed.quote, ...(duplicateNote ? { _duplicate: duplicateNote } : {}) };

      const leadId = generateId();
      await env.DB.prepare(`
        INSERT OR IGNORE INTO bark_leads (
          id, gmail_message_id, first_name, location, business_type,
          project_description, budget, timeline, hiring_intent, bark_category,
          partial_phone, partial_email, phone_prefix,
          email_first_char, email_char_count, email_last_char, email_domain,
          received_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        leadId, id, parsed.firstName, parsed.location || null,
        parsed.projectDetails['Business type'] || parsed.projectDetails['Project type'] || null,
        JSON.stringify(projectDesc),
        parsed.projectDetails['Budget'] || null,
        parsed.projectDetails['Timeline'] || null,
        parsed.projectDetails['Hiring intent'] || null,
        parsed.category || null,
        parsed.partialPhone || null, parsed.partialEmail || null,
        phoneDecoded?.prefix || null,
        emailDecoded?.firstChar || null, emailDecoded?.charCount || null,
        emailDecoded?.lastChar || null, emailDecoded?.domain || null,
        date ? new Date(date).toISOString() : new Date().toISOString(),
      ).run();

      result.newLeads.push(`${parsed.firstName} (${parsed.location || 'unknown location'}) — ${parsed.category}${duplicateNote ? ' [DUP]' : ''}`);

      // Auto-research the new lead
      try {
        const newLead = await env.DB.prepare('SELECT * FROM bark_leads WHERE id = ?').bind(leadId).first<any>();
        if (newLead) {
          const { runAutoResearch } = await import('../routes/bark');
          const research = await runAutoResearch(newLead, env);
          const resultsJson = JSON.stringify({ ...research, researchedAt: new Date().toISOString() });
          const topScore = research.topCandidates[0]?.score || 0;
          await env.DB.prepare('UPDATE bark_leads SET search_results_json = ?, status = ? WHERE id = ?')
            .bind(resultsJson, topScore >= 80 ? 'found' : 'new', leadId).run();
        }
      } catch { /* research failure shouldn't block scan */ }

      // Log to activity
      await env.DB.prepare(
        'INSERT INTO activity_log (source, event_type, summary) VALUES (?, ?, ?)'
      ).bind('bark', 'lead_found', `New Bark lead: ${parsed.firstName} in ${parsed.location || '?'} — ${parsed.category}${duplicateNote ? ' [DUPLICATE]' : ''}`).run();
    }

    // Auto-dismiss leads older than 14 days
    await env.DB.prepare(
      "UPDATE bark_leads SET status = 'dismissed' WHERE status IN ('new', 'researching') AND received_at < datetime('now', '-14 days')"
    ).run();

    // Update last scan time
    await env.DB.prepare(`
      INSERT INTO config (key, value, updated_at) VALUES ('bark_scan_last', datetime('now'), datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = datetime('now'), updated_at = datetime('now')
    `).run();

  } catch (e) {
    result.errors.push(`Scan error: ${String(e).slice(0, 200)}`);
  }

  return result;
}

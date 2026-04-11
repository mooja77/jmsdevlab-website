/**
 * Daily Chat Briefing — sends email summary of all chat conversations.
 * Runs at 20:00 UTC (9pm Irish time).
 */

import { Env } from '../types';

async function getGmailAccessToken(env: Env): Promise<string | null> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GMAIL_REFRESH_TOKEN) return null;
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
    const data = await res.json() as { access_token: string };
    return data.access_token;
  } catch {
    return null;
  }
}

function encodeBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function runChatBriefing(env: Env): Promise<void> {
  console.log('[chat-briefing] Building daily briefing...');

  const today = new Date().toISOString().slice(0, 10);

  // Get today's conversations
  const convs = await env.DB.prepare(`
    SELECT * FROM chat_conversations
    WHERE date(created_at) = ? OR date(last_message_at) = ?
    ORDER BY created_at ASC
  `).bind(today, today).all<{
    id: string; app_id: string; message_count: number; created_at: string;
  }>();

  if (convs.results.length === 0) {
    console.log('[chat-briefing] No conversations today, skipping email');
    return;
  }

  // Get messages for each conversation
  const conversations: { app: string; time: string; messages: { role: string; content: string }[] }[] = [];
  const appCounts: Record<string, number> = {};
  let totalMessages = 0;

  for (const conv of convs.results) {
    const msgs = await env.DB.prepare(
      `SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY created_at ASC`
    ).bind(conv.id).all<{ role: string; content: string }>();

    conversations.push({
      app: conv.app_id,
      time: conv.created_at.slice(11, 16),
      messages: msgs.results,
    });

    appCounts[conv.app_id] = (appCounts[conv.app_id] || 0) + 1;
    totalMessages += msgs.results.length;
  }

  // Count unique apps
  const uniqueApps = Object.keys(appCounts).length;

  // Build email body
  let body = `Hi John,\n\nHere's today's chat widget summary:\n\n`;
  body += `OVERVIEW\n`;
  body += `- ${convs.results.length} conversation${convs.results.length !== 1 ? 's' : ''} across ${uniqueApps} app${uniqueApps !== 1 ? 's' : ''}\n`;
  body += `- ${totalMessages} messages total\n\n`;

  body += `BY APP\n`;
  for (const [app, count] of Object.entries(appCounts).sort((a, b) => b[1] - a[1])) {
    body += `- ${app}: ${count} conversation${count !== 1 ? 's' : ''}\n`;
  }
  body += '\n';

  body += `CONVERSATIONS\n\n`;
  conversations.forEach((conv, i) => {
    body += `${i + 1}. ${conv.app} — ${conv.time}\n`;
    for (const msg of conv.messages) {
      const label = msg.role === 'user' ? 'User' : 'Bot';
      const content = msg.content.length > 200 ? msg.content.slice(0, 200) + '...' : msg.content;
      body += `   ${label}: ${content}\n`;
    }
    body += '\n';
  });

  body += `---\nView all conversations: https://admin.jmsdevlab.com/chat\n`;
  body += `This briefing is automated from the JMS Dev Lab Command Centre.\n`;

  // Send via Gmail API
  const accessToken = await getGmailAccessToken(env);
  if (!accessToken) {
    console.error('[chat-briefing] Could not get Gmail access token');
    return;
  }

  const subject = `Chat Widget Briefing — ${today} — ${convs.results.length} conversation${convs.results.length !== 1 ? 's' : ''}`;

  const rawEmail = [
    `From: john@jmsdevlab.com`,
    `To: mooja77@gmail.com`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    '',
    body,
  ].join('\r\n');

  const encodedEmail = encodeBase64Url(rawEmail);

  try {
    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedEmail }),
    });

    if (sendRes.ok) {
      console.log(`[chat-briefing] Sent daily briefing: ${convs.results.length} conversations`);
    } else {
      const err = await sendRes.text();
      console.error(`[chat-briefing] Gmail send failed: ${sendRes.status} ${err}`);
    }
  } catch (err) {
    console.error('[chat-briefing] Gmail send error:', err);
  }
}

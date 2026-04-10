/**
 * Chat widget routes — serves embeddable JS widget + handles chat API.
 * Public endpoints (no portal auth) for cross-origin use on all 13 sites.
 */

import { Env, json } from '../types';
import { CHAT_SYSTEM_PROMPTS, DEFAULT_CHAT_PROMPT, HOST_TO_APP, APP_NAMES, APP_SUPPORT_EMAILS } from '../lib/chat-prompts';

const CHAT_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function chatJson(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CHAT_CORS, 'Content-Type': 'application/json' },
  });
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip + ':jms-chat-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function handleChatRoutes(path: string, request: Request, url: URL, env: Env): Promise<Response> {

  // OPTIONS — permissive CORS for chat
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CHAT_CORS });
  }

  // GET /api/chat/widget.js — serve the embeddable widget
  if (path === '/api/chat/widget.js' && request.method === 'GET') {
    const apiUrl = 'https://jms-admin-portal.mooja77.workers.dev/api/chat';
    const widgetJs = buildWidgetJs(apiUrl);
    return new Response(widgetJs, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        ...CHAT_CORS,
      },
    });
  }

  // POST /api/chat — handle chat message
  if (path === '/api/chat' && request.method === 'POST') {
    if (!env.ANTHROPIC_API_KEY) {
      return chatJson({ error: 'Chat not configured' }, 500);
    }

    const body = await request.json() as {
      app_id: string;
      message: string;
      conversation_id?: string;
      history?: { role: string; content: string }[];
    };

    if (!body.app_id || !body.message || body.message.length > 2000) {
      return chatJson({ error: 'Invalid request' }, 400);
    }

    // Rate limit: 10 messages per IP per 5 minutes
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipHash = await hashIp(ip);
    const rateLimitKey = `chat_rate:${ipHash}`;
    const recent = await env.DB.prepare(
      `SELECT value FROM config WHERE key = ? AND updated_at > datetime('now', '-5 minutes')`
    ).bind(rateLimitKey).first<{ value: string }>();
    const count = parseInt(recent?.value || '0', 10);
    if (count >= 10) {
      return chatJson({ error: 'Too many messages. Please wait a moment.' }, 429);
    }
    await env.DB.prepare(
      `INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, datetime('now'))`
    ).bind(rateLimitKey, String(count + 1)).run();

    // Get or create conversation
    let convId = body.conversation_id;
    if (!convId) {
      convId = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO chat_conversations (id, app_id, ip_hash) VALUES (?, ?, ?)`
      ).bind(convId, body.app_id, ipHash).run();
    }

    // Build messages for Claude
    const systemPrompt = CHAT_SYSTEM_PROMPTS[body.app_id] || DEFAULT_CHAT_PROMPT;
    const history = (body.history || []).slice(-20); // Last 10 exchanges
    const messages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: body.message },
    ];

    // Call Claude Haiku
    let assistantResponse = '';
    try {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: systemPrompt,
          messages,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!claudeRes.ok) {
        console.error('Claude API error:', claudeRes.status);
        return chatJson({ error: 'Sorry, I had trouble processing that. Please try again.' }, 502);
      }

      const claudeData = await claudeRes.json() as { content: { text: string }[] };
      assistantResponse = claudeData.content?.[0]?.text || 'Sorry, I could not generate a response.';
    } catch (err) {
      console.error('Claude API call failed:', err);
      return chatJson({ error: 'Sorry, I had trouble processing that. Please try again.' }, 502);
    }

    // Store messages in D1
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, 'user', ?)`
      ).bind(convId, body.message),
      env.DB.prepare(
        `INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, 'assistant', ?)`
      ).bind(convId, assistantResponse),
      env.DB.prepare(
        `UPDATE chat_conversations SET message_count = message_count + 2, last_message_at = datetime('now') WHERE id = ?`
      ).bind(convId),
    ]);

    return chatJson({ response: assistantResponse, conversation_id: convId });
  }

  // GET /api/chat/conversations — authenticated, for Command Centre
  if (path === '/api/chat/conversations' || path.startsWith('/api/chat/conversations')) {
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    const appFilter = url.searchParams.get('app_id');

    let query = `SELECT c.*,
      (SELECT content FROM chat_messages WHERE conversation_id = c.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as first_message
      FROM chat_conversations c WHERE c.created_at > datetime('now', '-' || ? || ' days')`;
    const binds: any[] = [Math.min(days, 90)];

    if (appFilter) {
      query += ' AND c.app_id = ?';
      binds.push(appFilter);
    }
    query += ' ORDER BY c.last_message_at DESC LIMIT 100';

    const convs = await env.DB.prepare(query).bind(...binds).all();

    // Stats
    const today = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM chat_conversations WHERE created_at > datetime('now', '-1 day')`
    ).first<{ c: number }>();
    const week = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM chat_conversations WHERE created_at > datetime('now', '-7 days')`
    ).first<{ c: number }>();
    const msgToday = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM chat_messages WHERE created_at > datetime('now', '-1 day')`
    ).first<{ c: number }>();

    return json({
      conversations: convs.results,
      stats: { today: today?.c || 0, week: week?.c || 0, messagesToday: msgToday?.c || 0 },
    });
  }

  return chatJson({ error: 'Not found' }, 404);
}

// ─── Widget JavaScript (IIFE) ───────────────────────────────────────

function buildWidgetJs(apiUrl: string): string {
  const hostMap = JSON.stringify(HOST_TO_APP);
  const appNames = JSON.stringify(APP_NAMES);
  const supportEmails = JSON.stringify(APP_SUPPORT_EMAILS);

  return `(function(){
'use strict';
var API='${apiUrl}';
var HOST_MAP=${hostMap};
var APP_NAMES=${appNames};
var SUPPORT=${supportEmails};
var MAX_MSG=20;

var script=document.currentScript;
var appId=script&&script.getAttribute('data-app')||HOST_MAP[location.hostname]||'jmsdevlab';
var appName=APP_NAMES[appId]||'Support';
var supportEmail=SUPPORT[appId]||'john@jmsdevlab.com';

var convId=null;
var history=[];
var msgCount=0;
var isOpen=false;

// Check dismissal
var dismissed=localStorage.getItem('jms_chat_dismissed');
if(dismissed&&Date.now()-parseInt(dismissed)<86400000)return;

// Restore session
try{var s=sessionStorage.getItem('jms_chat');if(s){var d=JSON.parse(s);convId=d.c;history=d.h||[];msgCount=d.n||0;}}catch(e){}

// CSS
var style=document.createElement('style');
style.textContent=\`
#jms-chat-btn{position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:#2563eb;border:none;cursor:pointer;z-index:99999;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,99,235,0.4);transition:transform 0.2s}
#jms-chat-btn:hover{transform:scale(1.1)}
#jms-chat-btn svg{width:24px;height:24px;fill:white}
#jms-chat-panel{position:fixed;bottom:80px;right:20px;width:350px;height:500px;background:#111827;border:1px solid #1f2937;border-radius:16px;z-index:99999;display:none;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,sans-serif;overflow:hidden}
#jms-chat-panel.open{display:flex}
#jms-chat-hdr{padding:14px 16px;background:#1f2937;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #374151}
#jms-chat-hdr h3{margin:0;font-size:14px;font-weight:600;color:white}
#jms-chat-hdr button{background:none;border:none;color:#9ca3af;cursor:pointer;font-size:18px;padding:4px}
#jms-chat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.jms-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;word-wrap:break-word}
.jms-msg-user{align-self:flex-end;background:#2563eb;color:white;border-bottom-right-radius:4px}
.jms-msg-ai{align-self:flex-start;background:#1f2937;color:#d1d5db;border-bottom-left-radius:4px}
.jms-msg-system{align-self:center;color:#6b7280;font-size:11px;font-style:italic}
#jms-chat-input{display:flex;padding:12px;border-top:1px solid #1f2937;gap:8px}
#jms-chat-input input{flex:1;background:#1f2937;border:1px solid #374151;border-radius:8px;padding:8px 12px;color:white;font-size:13px;outline:none}
#jms-chat-input input:focus{border-color:#2563eb}
#jms-chat-input button{background:#2563eb;border:none;border-radius:8px;padding:8px 14px;color:white;cursor:pointer;font-size:13px;font-weight:500}
#jms-chat-input button:disabled{opacity:0.5;cursor:default}
#jms-chat-ftr{padding:6px;text-align:center}
#jms-chat-ftr a{color:#4b5563;font-size:10px;text-decoration:none}
.jms-dots{display:inline-flex;gap:4px}.jms-dots span{width:6px;height:6px;background:#6b7280;border-radius:50%;animation:jms-bounce 1.4s infinite}
.jms-dots span:nth-child(2){animation-delay:0.2s}.jms-dots span:nth-child(3){animation-delay:0.4s}
@keyframes jms-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}
@media(max-width:480px){#jms-chat-panel{width:100vw;height:100vh;bottom:0;right:0;border-radius:0}#jms-chat-btn{bottom:16px;right:16px;width:48px;height:48px}}
\`;
document.head.appendChild(style);

// Button
var btn=document.createElement('button');
btn.id='jms-chat-btn';
btn.innerHTML='<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
btn.title='Chat with us';
document.body.appendChild(btn);

// Panel
var panel=document.createElement('div');
panel.id='jms-chat-panel';
panel.innerHTML='<div id="jms-chat-hdr"><h3>'+appName+' Support</h3><button id="jms-chat-close">&times;</button></div><div id="jms-chat-msgs"></div><div id="jms-chat-input"><input type="text" placeholder="Type a message..." id="jms-chat-txt" maxlength="500"><button id="jms-chat-send">Send</button></div><div id="jms-chat-ftr"><a href="https://jmsdevlab.com" target="_blank" rel="noopener">Powered by JMS Dev Lab</a></div>';
document.body.appendChild(panel);

var msgs=document.getElementById('jms-chat-msgs');
var txt=document.getElementById('jms-chat-txt');
var sendBtn=document.getElementById('jms-chat-send');

function addMsg(content,role){
  var div=document.createElement('div');
  div.className='jms-msg jms-msg-'+(role==='user'?'user':role==='system'?'system':'ai');
  div.textContent=content;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
  return div;
}

function saveSession(){
  try{sessionStorage.setItem('jms_chat',JSON.stringify({c:convId,h:history,n:msgCount}));}catch(e){}
}

// Restore previous messages
if(history.length){
  for(var i=0;i<history.length;i++){addMsg(history[i].content,history[i].role);}
}else{
  addMsg('Hi! How can I help you with '+appName+'?','ai');
}

function togglePanel(){
  isOpen=!isOpen;
  panel.classList.toggle('open',isOpen);
  if(isOpen){txt.focus();msgs.scrollTop=msgs.scrollHeight;}
}

async function sendMessage(){
  var message=txt.value.trim();
  if(!message)return;
  if(msgCount>=MAX_MSG){addMsg('For further help, please email '+supportEmail,'system');return;}

  txt.value='';
  sendBtn.disabled=true;
  addMsg(message,'user');
  history.push({role:'user',content:message});
  msgCount++;

  // Loading dots
  var loading=document.createElement('div');
  loading.className='jms-msg jms-msg-ai';
  loading.innerHTML='<div class="jms-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(loading);
  msgs.scrollTop=msgs.scrollHeight;

  try{
    var res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({app_id:appId,message:message,conversation_id:convId,history:history.slice(-20)})});
    var data=await res.json();
    msgs.removeChild(loading);
    if(data.error){addMsg(data.error,'system');}
    else{
      convId=data.conversation_id;
      addMsg(data.response,'ai');
      history.push({role:'assistant',content:data.response});
      msgCount++;
    }
  }catch(e){
    msgs.removeChild(loading);
    addMsg('Sorry, something went wrong. Please try again.','system');
  }
  sendBtn.disabled=false;
  saveSession();
  txt.focus();
}

btn.onclick=function(){togglePanel();localStorage.removeItem('jms_chat_dismissed');};
document.getElementById('jms-chat-close').onclick=function(){togglePanel();localStorage.setItem('jms_chat_dismissed',String(Date.now()));};
sendBtn.onclick=sendMessage;
txt.onkeydown=function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}};
})();`;
}

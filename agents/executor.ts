// JMS Dev Lab Agent Executor v2
// Built on the Claude Agent SDK with governance hooks.
// Usage: PORTAL_TOKEN=<jwt> npx tsx executor.ts

import { query, type ClaudeAgentOptions, type MessageStream } from "@anthropic-ai/claude-agent-sdk";
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  blockDestructiveCommands,
  requireApprovalForDeploys,
  blockEnvFileAccess,
  enforceWorkdirScope,
} from './hooks.js';
import { serializeHandoff, parseHandoffFromOutput } from './handoff.js';
import { createWorktree, commitWorktreeChanges, cleanupWorktree } from './worktree.js';

// ─── Config ──────────────────────────────────────────────────

const API_BASE = process.env.API_BASE || 'https://jms-admin-portal.mooja77.workers.dev';
const PORTAL_TOKEN = process.env.PORTAL_TOKEN || '';
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL || '30000');
const HEARTBEAT_INTERVAL_MS = 60_000;
const MAX_TASK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const BASE_DIR = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const MEMORY_DIR = join(BASE_DIR, 'memory');
const LOGS_DIR = join(BASE_DIR, 'logs');
const DEFS_DIR = join(BASE_DIR, 'definitions');

const CODE_TASK_TYPES = ['bug-fix', 'refactor', 'feature', 'deploy', 'complex'];

// Ensure directories exist
[MEMORY_DIR, LOGS_DIR].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });

let isShuttingDown = false;
let currentTaskId: number | null = null;

// ─── API Client ──────────────────────────────────────────────

async function api<T = any>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PORTAL_TOKEN}`,
      ...(options?.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as T;
}

// ─── Types ───────────────────────────────────────────────────

interface Task {
  id: number;
  agent_id: string;
  type: string;
  priority: number;
  status: string;
  title: string;
  description: string | null;
  input_json: string | null;
}

interface Agent {
  id: string;
  type: string;
  name: string;
  config_json: string | null;
  capabilities_json: string | null;
  model_default: string;
  budget_daily_cents: number;
  budget_spent_today_cents: number;
}

// ─── Task Execution ──────────────────────────────────────────

async function executeTask(task: Task): Promise<void> {
  log(`Claiming task #${task.id}: ${task.title} (agent: ${task.agent_id}, P${task.priority})`);

  // Atomic claim
  try {
    await api(`/api/agents/tasks/${task.id}/claim`, { method: 'PUT' });
  } catch (err: any) {
    if (err.message.includes('409')) {
      log(`Task #${task.id} already claimed by another executor, skipping`);
      return;
    }
    throw err;
  }

  currentTaskId = task.id;

  // Start heartbeat
  const heartbeatTimer = setInterval(async () => {
    try {
      await api(`/api/agents/tasks/${task.id}/heartbeat`, { method: 'PUT' });
    } catch { /* ignore heartbeat failures */ }
  }, HEARTBEAT_INTERVAL_MS);

  try {
    // Get agent details
    const { agent } = await api<{ agent: Agent }>(`/api/agents/${task.agent_id}`);
    if (!agent) throw new Error(`Agent ${task.agent_id} not found`);

    // Budget check
    const budgetPct = agent.budget_daily_cents > 0
      ? (agent.budget_spent_today_cents / agent.budget_daily_cents) * 100 : 0;

    if (budgetPct >= 100) {
      log(`Budget exceeded for ${task.agent_id} (${budgetPct.toFixed(0)}%). Failing task.`);
      await api(`/api/agents/tasks/${task.id}/fail`, {
        method: 'PUT',
        body: JSON.stringify({ error_message: 'Daily budget exceeded' }),
      });
      return;
    }

    // Model selection with budget-driven downgrade
    let model = selectModel(agent.model_default, task.type, budgetPct);

    // Load context
    const memoryFile = join(MEMORY_DIR, `${task.agent_id}.md`);
    const memory = existsSync(memoryFile) ? readFileSync(memoryFile, 'utf-8').slice(-3000) : '';

    const { bulletins } = await api<{ bulletins: any[] }>('/api/agents/bulletins');
    const relevantBulletins = bulletins
      .filter((b: any) => b.scope === 'all' || b.scope === agent.type || b.scope === agent.id)
      .map((b: any) => `[${b.severity.toUpperCase()}] ${b.title}: ${b.body || ''}`)
      .join('\n');

    // Parse config
    const config = agent.config_json ? JSON.parse(agent.config_json) : {};
    const capabilities = agent.capabilities_json ? JSON.parse(agent.capabilities_json) : {};
    const appPath = config.app_path || '';
    const taskInput = task.input_json ? JSON.parse(task.input_json) : {};

    // Build prompt
    const prompt = buildPrompt(agent, task, memory, relevantBulletins, taskInput, capabilities);

    // Determine allowed tools based on capabilities
    const tools: string[] = ['Read', 'Grep', 'Glob'];
    if (capabilities.can_write_code !== false) tools.push('Edit', 'Write');
    if (capabilities.can_write_code !== false) tools.push('Bash');

    // Build hooks based on agent capabilities
    const hooks: ClaudeAgentOptions['hooks'] = {
      PreToolUse: [
        { matcher: 'Bash', hooks: [blockDestructiveCommands, requireApprovalForDeploys] },
        { matcher: 'Edit|Write|Read', hooks: [blockEnvFileAccess] },
      ],
    };

    // Scope agents to their app directory if one is configured
    if (appPath) {
      hooks.PreToolUse!.push(
        { matcher: 'Edit|Write', hooks: [enforceWorkdirScope(appPath)] }
      );
    }

    // Calculate max budget for this task
    const remainingBudget = Math.max(0.01, (agent.budget_daily_cents - agent.budget_spent_today_cents) / 100);
    const maxBudget = Math.min(remainingBudget, 0.50); // Cap at $0.50 per task

    log(`Executing with SDK: model=${model}, budget=$${maxBudget.toFixed(2)}, tools=[${tools.join(',')}]`);

    // Execute via Claude Agent SDK
    let output = '';
    let tokensIn = 0;
    let tokensOut = 0;

    const taskTimeout = setTimeout(() => {
      log(`Task #${task.id} timed out after ${MAX_TASK_DURATION_MS / 1000}s`);
    }, MAX_TASK_DURATION_MS);

    try {
      const sdkOptions: ClaudeAgentOptions = {
        allowedTools: tools,
        maxBudgetUsd: maxBudget,
        maxTurns: 15,
        hooks,
        model: model === 'opus' ? 'claude-opus-4-6'
          : model === 'haiku' ? 'claude-haiku-4-5-20251001'
          : 'claude-sonnet-4-6',
      };

      // Set working directory if app has a path
      if (appPath) {
        sdkOptions.cwd = appPath;
      }

      for await (const message of query({ prompt, options: sdkOptions })) {
        if ('result' in message) {
          output = (message as any).result || '';
        }
        if ('usage' in message) {
          const usage = (message as any).usage;
          tokensIn = usage?.input_tokens || 0;
          tokensOut = usage?.output_tokens || 0;
        }
        // Collect text output
        if ('content' in message && Array.isArray((message as any).content)) {
          const texts = (message as any).content
            .filter((b: any) => b.type === 'text')
            .map((b: any) => b.text);
          if (texts.length) output += texts.join('\n');
        }
      }
    } finally {
      clearTimeout(taskTimeout);
    }

    // Calculate cost
    const costCents = estimateCost(model, tokensIn, tokensOut);

    // Write YAML handoff to memory (Continuous-Claude-v3 pattern)
    const handoff = parseHandoffFromOutput(task.id, task.title, output);
    const handoffYaml = serializeHandoff(handoff);
    appendFileSync(memoryFile, `\n${handoffYaml}\n`);

    // Trim memory file if too large (keep last 10KB)
    if (existsSync(memoryFile)) {
      const content = readFileSync(memoryFile, 'utf-8');
      if (content.length > 10000) {
        writeFileSync(memoryFile, content.slice(-10000));
      }
    }

    // Report completion
    await api(`/api/agents/tasks/${task.id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({
        output_json: { summary: output.substring(0, 5000) },
        model_used: model,
        tokens_in: tokensIn,
        tokens_out: tokensOut,
        cost_cents: costCents,
      }),
    });

    log(`Task #${task.id} completed. Model: ${model}, Tokens: ${tokensIn}+${tokensOut}, Cost: $${(costCents / 100).toFixed(3)}`);

  } catch (err: any) {
    log(`Task #${task.id} failed: ${err.message}`);
    await api(`/api/agents/tasks/${task.id}/fail`, {
      method: 'PUT',
      body: JSON.stringify({ error_message: err.message.substring(0, 2000) }),
    }).catch(() => {});
  } finally {
    clearInterval(heartbeatTimer);
    currentTaskId = null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function selectModel(defaultModel: string, taskType: string, budgetPct: number): string {
  // Task-type overrides
  const typeModelMap: Record<string, string> = {
    'health-check': 'haiku',
    'status-lookup': 'haiku',
    'code-review': 'sonnet',
    'architecture': 'opus',
    'complex-debug': 'opus',
  };

  let model = typeModelMap[taskType] || defaultModel || 'sonnet';

  // Budget-driven downgrade
  if (budgetPct >= 90 && model === 'opus') { model = 'sonnet'; log('Budget >90% — downgrading opus→sonnet'); }
  if (budgetPct >= 95 && model === 'sonnet') { model = 'haiku'; log('Budget >95% — downgrading sonnet→haiku'); }

  return model;
}

function buildPrompt(
  agent: Agent, task: Task, memory: string,
  bulletins: string, input: any, capabilities: any,
): string {
  const sections: string[] = [];

  // Load agent definition file if it exists (wshobson/agents pattern)
  const defFile = join(DEFS_DIR, `${agent.id}.md`);
  if (existsSync(defFile)) {
    const defContent = readFileSync(defFile, 'utf-8');
    // Extract system prompt from definition
    const systemPromptMatch = defContent.match(/## System Prompt\n([\s\S]*?)(?=\n## |\n---|\Z)/);
    if (systemPromptMatch) {
      sections.push(`# ${agent.name}`);
      sections.push(systemPromptMatch[1].trim());
    } else {
      sections.push(`# You are: ${agent.name}`);
    }
  } else {
    sections.push(`# You are: ${agent.name}`);
  }

  sections.push(`Role: ${agent.type} agent for JMS Dev Lab`);

  // Capability constraints
  const constraints: string[] = [];
  if (capabilities.can_write_code === false) constraints.push('You may NOT modify code files.');
  if (capabilities.can_deploy === false) constraints.push('You may NOT deploy to production.');
  if (capabilities.can_send_external === false) constraints.push('You may NOT send external communications.');
  if (constraints.length) sections.push(`\n## Constraints\n${constraints.join('\n')}`);

  // Bulletins
  if (bulletins) sections.push(`\n## Active Bulletins\n${bulletins}`);

  // Memory (last 2000 chars)
  if (memory) sections.push(`\n## Your Recent Memory\n${memory.slice(-2000)}`);

  // The task
  sections.push(`\n## Task: ${task.title}`);
  if (task.description) sections.push(task.description);
  if (Object.keys(input).length > 0) sections.push(`\nInput:\n\`\`\`json\n${JSON.stringify(input, null, 2)}\n\`\`\``);
  sections.push(`\nPriority: P${task.priority}`);

  // Output instructions
  sections.push(`\n## Instructions`);
  sections.push('- Be concise and focused. Complete the task efficiently.');
  sections.push('- Provide a clear summary of what you did and any findings.');
  sections.push('- If you encounter issues you cannot resolve, describe them clearly.');

  return sections.join('\n');
}

function estimateCost(model: string, tokensIn: number, tokensOut: number): number {
  const prices: Record<string, { in: number; out: number }> = {
    opus:   { in: 1500, out: 7500 },
    sonnet: { in: 300, out: 1500 },
    haiku:  { in: 80, out: 400 },
  };
  const p = prices[model] || prices.sonnet;
  return Math.ceil((tokensIn * p.in + tokensOut * p.out) / 1_000_000);
}

// ─── Logging ─────────────────────────────────────────────────

function log(msg: string) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);

  const logFile = join(LOGS_DIR, `${ts.split('T')[0]}.log`);
  try { appendFileSync(logFile, line + '\n'); } catch { /* ignore */ }
}

// ─── Graceful Shutdown ───────────────────────────────────────

function setupShutdownHandlers() {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    log(`Received ${signal}. Shutting down gracefully...`);

    if (currentTaskId) {
      log(`Task #${currentTaskId} is running. Waiting up to 60s for completion...`);
      const deadline = Date.now() + 60_000;
      while (currentTaskId && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 1000));
      }
      if (currentTaskId) {
        log(`Task #${currentTaskId} did not complete. Marking as failed.`);
        await api(`/api/agents/tasks/${currentTaskId}/fail`, {
          method: 'PUT',
          body: JSON.stringify({ error_message: `Executor shutdown (${signal})` }),
        }).catch(() => {});
      }
    }

    log('Executor stopped.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// ─── Main Loop ───────────────────────────────────────────────

async function main() {
  if (!PORTAL_TOKEN) {
    console.error('PORTAL_TOKEN env var required.');
    console.error('Usage: PORTAL_TOKEN=your_jwt_token npx tsx executor.ts');
    process.exit(1);
  }

  setupShutdownHandlers();

  log('Agent Executor v2 (Claude Agent SDK) starting...');
  log(`API: ${API_BASE}`);
  log(`Poll: ${POLL_INTERVAL_MS}ms | Heartbeat: ${HEARTBEAT_INTERVAL_MS}ms | Max task: ${MAX_TASK_DURATION_MS / 1000}s`);

  // Verify connection
  try {
    const { agents } = await api<{ agents: any[] }>('/api/agents');
    log(`Connected. ${agents.length} agents registered.`);
  } catch (err: any) {
    log(`Failed to connect: ${err.message}`);
    process.exit(1);
  }

  // Poll loop
  let consecutiveErrors = 0;
  while (!isShuttingDown) {
    try {
      const { task } = await api<{ task: Task | null }>('/api/agents/tasks/next');
      if (task) {
        consecutiveErrors = 0;
        await executeTask(task);
      } else {
        consecutiveErrors = 0;
      }
    } catch (err: any) {
      consecutiveErrors++;
      log(`Poll error (${consecutiveErrors}): ${err.message}`);
      // Back off on repeated errors
      if (consecutiveErrors >= 5) {
        log('Too many consecutive errors. Backing off for 2 minutes.');
        await new Promise(r => setTimeout(r, 120_000));
        consecutiveErrors = 0;
        continue;
      }
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

// Agent Harness Governance Hooks
// Block destructive operations, enforce scope, require approval for deploys.

import type { HookCallback } from "@anthropic-ai/claude-agent-sdk";

// Destructive commands that should never be run by an agent
const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+[\/~]/,
  /rm\s+-rf\s+\./,
  /drop\s+table/i,
  /drop\s+database/i,
  /truncate\s+table/i,
  /git\s+push\s+--force/,
  /git\s+reset\s+--hard/,
  /git\s+checkout\s+\./,
  /git\s+clean\s+-f/,
  /killall/,
  /format\s+[a-z]:/i,
  /del\s+\/s\s+\/q/i,
];

// Files agents must never read or write
const BLOCKED_FILE_PATTERNS = [
  /\.env$/,
  /\.env\./,
  /credentials/i,
  /secrets?\./i,
  /\.pem$/,
  /\.key$/,
  /id_rsa/,
  /password/i,
];

// Deploy commands that require human approval
const DEPLOY_PATTERNS = [
  /wrangler\s+deploy/,
  /wrangler\s+pages\s+deploy/,
  /railway\s+up/,
  /git\s+push/,
  /npm\s+publish/,
  /npx\s+wrangler\s+deploy/,
];

export const blockDestructiveCommands: HookCallback = async (input, _toolUseId, _context) => {
  const toolInput = (input as any).tool_input || {};
  const command = toolInput.command || '';

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `Blocked destructive command: ${command.substring(0, 80)}`,
        },
      };
    }
  }
  return {};
};

export const requireApprovalForDeploys: HookCallback = async (input, _toolUseId, _context) => {
  const toolInput = (input as any).tool_input || {};
  const command = toolInput.command || '';

  for (const pattern of DEPLOY_PATTERNS) {
    if (pattern.test(command)) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `Deploy commands require human approval: ${command.substring(0, 80)}`,
        },
      };
    }
  }
  return {};
};

export const blockEnvFileAccess: HookCallback = async (input, _toolUseId, _context) => {
  const toolInput = (input as any).tool_input || {};
  const filePath = toolInput.file_path || toolInput.path || '';

  for (const pattern of BLOCKED_FILE_PATTERNS) {
    if (pattern.test(filePath)) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `Cannot access sensitive file: ${filePath}`,
        },
      };
    }
  }
  return {};
};

export function enforceWorkdirScope(allowedPath: string): HookCallback {
  const { resolve } = require('path');
  const resolvedAllowed = resolve(allowedPath).replace(/\\/g, '/').toLowerCase();

  return async (input, _toolUseId, _context) => {
    const toolInput = (input as any).tool_input || {};
    const rawPath = toolInput.file_path || toolInput.path || '';
    if (!rawPath) return {};

    // Resolve to absolute path — catches ../ traversals
    const resolvedPath = resolve(rawPath).replace(/\\/g, '/').toLowerCase();

    if (!resolvedPath.startsWith(resolvedAllowed)) {
      return {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `Path resolves outside scope: ${rawPath}`,
        },
      };
    }
    return {};
  };
}

// Git Worktree Isolation — each code task runs in its own branch.
// From ComposioHQ/agent-orchestrator pattern.

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';

const WORKTREE_BASE = join(dirname(new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), 'worktrees');

export interface WorktreeResult {
  worktreePath: string;
  branchName: string;
  created: boolean;
}

export function createWorktree(appPath: string, taskId: number, agentId: string): WorktreeResult {
  const branchName = `agent/${agentId}/task-${taskId}`;
  const safeName = branchName.replace(/\//g, '-');
  const worktreePath = join(WORKTREE_BASE, safeName);

  // Ensure base directory exists
  if (!existsSync(WORKTREE_BASE)) {
    mkdirSync(WORKTREE_BASE, { recursive: true });
  }

  // Create worktree with new branch
  try {
    execSync(`git worktree add "${worktreePath}" -b "${branchName}"`, {
      cwd: appPath,
      stdio: 'pipe',
      timeout: 30000,
    });
    return { worktreePath, branchName, created: true };
  } catch (err: any) {
    // Branch might already exist
    if (err.message.includes('already exists')) {
      execSync(`git worktree add "${worktreePath}" "${branchName}"`, {
        cwd: appPath,
        stdio: 'pipe',
        timeout: 30000,
      });
      return { worktreePath, branchName, created: true };
    }
    throw err;
  }
}

export function commitWorktreeChanges(
  worktreePath: string,
  message: string,
  trailers: Record<string, string>,
): boolean {
  try {
    // Check if there are changes
    const status = execSync('git status --porcelain', { cwd: worktreePath, encoding: 'utf-8' });
    if (!status.trim()) return false;

    // Stage all changes
    execSync('git add -A', { cwd: worktreePath, stdio: 'pipe' });

    // Build commit message with trailers
    const trailerLines = Object.entries(trailers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const fullMessage = `${message}\n\n${trailerLines}`;

    execSync('git commit -F -', {
      cwd: worktreePath,
      input: fullMessage,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
    });

    return true;
  } catch {
    return false;
  }
}

export function createPullRequest(
  worktreePath: string,
  branchName: string,
  title: string,
  body: string,
): string | null {
  try {
    // Push branch
    execSync(`git push -u origin "${branchName}"`, {
      cwd: worktreePath,
      stdio: 'pipe',
      timeout: 60000,
    });

    // Create PR
    const prUrl = execSync(
      `gh pr create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"`,
      { cwd: worktreePath, encoding: 'utf-8', timeout: 30000 },
    ).trim();

    return prUrl;
  } catch {
    return null;
  }
}

export function cleanupWorktree(appPath: string, worktreePath: string, branchName: string): void {
  try {
    // Remove worktree
    execSync(`git worktree remove "${worktreePath}" --force`, {
      cwd: appPath,
      stdio: 'pipe',
      timeout: 15000,
    });
  } catch {
    // Force remove if git fails
    if (existsSync(worktreePath)) {
      rmSync(worktreePath, { recursive: true, force: true });
      try {
        execSync('git worktree prune', { cwd: appPath, stdio: 'pipe' });
      } catch { /* ignore */ }
    }
  }

  // Optionally delete branch if no PR was created
  try {
    execSync(`git branch -D "${branchName}"`, { cwd: appPath, stdio: 'pipe' });
  } catch { /* branch may not exist locally */ }
}

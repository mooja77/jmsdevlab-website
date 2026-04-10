import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

let pass = 0, fail = 0;
function t(name: string, ok: boolean) {
  console.log((ok ? '  PASS' : '  FAIL') + ': ' + name);
  if (ok) pass++; else fail++;
}

// Create a temporary git repo for testing
const TMP = join(process.env.TEMP || '/tmp', 'agent-worktree-test-' + Date.now());
mkdirSync(TMP, { recursive: true });

try {
  // Init git repo
  execSync('git init', { cwd: TMP, stdio: 'pipe' });
  execSync('git config user.email "test@test.com"', { cwd: TMP, stdio: 'pipe' });
  execSync('git config user.name "Test"', { cwd: TMP, stdio: 'pipe' });
  writeFileSync(join(TMP, 'README.md'), '# Test');
  execSync('git add -A && git commit -m "init"', { cwd: TMP, stdio: 'pipe', shell: 'bash' });

  // Import and test worktree functions
  const { createWorktree, commitWorktreeChanges, cleanupWorktree } = await import('./worktree.js');

  // Test createWorktree
  try {
    const result = createWorktree(TMP, 99, 'app-test');
    t('Create worktree succeeds', result.created === true);
    t('Worktree path exists', existsSync(result.worktreePath));
    t('Branch name correct', result.branchName === 'agent/app-test/task-99');

    // Test commitWorktreeChanges — no changes
    const noChanges = commitWorktreeChanges(result.worktreePath, 'No changes', {});
    t('No changes returns false', noChanges === false);

    // Make a change and commit
    writeFileSync(join(result.worktreePath, 'test.txt'), 'hello');
    const committed = commitWorktreeChanges(result.worktreePath, 'Test commit', {
      'Agent': 'app-test',
      'Task': '#99',
      'Confidence': 'high',
    });
    t('Commit with changes returns true', committed === true);

    // Verify commit message has trailers
    const log = execSync('git log -1 --format=%B', { cwd: result.worktreePath, encoding: 'utf-8' });
    t('Commit has message', log.includes('Test commit'));
    t('Commit has Agent trailer', log.includes('Agent: app-test'));
    t('Commit has Task trailer', log.includes('Task: #99'));
    t('Commit has Confidence trailer', log.includes('Confidence: high'));

    // Test cleanup
    cleanupWorktree(TMP, result.worktreePath, result.branchName);
    t('Worktree cleaned up', !existsSync(result.worktreePath));

  } catch (e: any) {
    console.log('  FAIL: Worktree operations error: ' + e.message);
    fail++;
  }

} finally {
  // Clean up temp repo
  try { rmSync(TMP, { recursive: true, force: true }); } catch {}
}

console.log(`\nWorktree: ${pass} PASS, ${fail} FAIL`);

import { describe, it, expect } from 'vitest';
import { blockDestructiveCommands, requireApprovalForDeploys, blockEnvFileAccess, enforceWorkdirScope } from '../../hooks.js';

const isDeny = (r: any) => r?.hookSpecificOutput?.permissionDecision === 'deny';
const inp = (command: string) => ({ tool_input: { command } } as any);
const file = (file_path: string) => ({ tool_input: { file_path } } as any);

describe('blockDestructiveCommands', () => {
  it.each([
    ['rm -rf /', true],
    ['rm -rf .', true],
    ['DROP TABLE users', true],
    ['drop database prod', true],
    ['TRUNCATE TABLE orders', true],
    ['git push --force', true],
    ['git reset --hard', true],
    ['git clean -f', true],
    ['killall node', true],
    ['ls -la', false],
    ['cat README.md', false],
    ['npm install', false],
    ['git status', false],
  ])('command "%s" → deny=%s', async (cmd, shouldDeny) => {
    const result = await blockDestructiveCommands(inp(cmd), null as any, null as any);
    expect(isDeny(result)).toBe(shouldDeny);
  });
});

describe('requireApprovalForDeploys', () => {
  it.each([
    ['wrangler deploy', true],
    ['npx wrangler deploy', true],
    ['railway up', true],
    ['git push origin main', true],
    ['npm publish', true],
    ['pwd', false],
    ['npm test', false],
    ['git status', false],
  ])('command "%s" → deny=%s', async (cmd, shouldDeny) => {
    const result = await requireApprovalForDeploys(inp(cmd), null as any, null as any);
    expect(isDeny(result)).toBe(shouldDeny);
  });
});

describe('blockEnvFileAccess', () => {
  it.each([
    ['/app/.env', true],
    ['/app/.env.local', true],
    ['/certs/server.pem', true],
    ['/ssh/id_rsa', true],
    ['/app/credentials.json', true],
    ['/app/secrets.yaml', true],
    ['/app/src/index.ts', false],
    ['/app/package.json', false],
    ['/app/README.md', false],
  ])('file "%s" → deny=%s', async (path, shouldDeny) => {
    const result = await blockEnvFileAccess(file(path), null as any, null as any);
    expect(isDeny(result)).toBe(shouldDeny);
  });
});

describe('enforceWorkdirScope', () => {
  const scoped = enforceWorkdirScope('C:/JM Programs/CashFlowAppV2');

  it('allows files within scope', async () => {
    expect(isDeny(await scoped(file('C:/JM Programs/CashFlowAppV2/src/index.ts'), null as any, null as any))).toBe(false);
  });

  it('blocks files outside scope', async () => {
    expect(isDeny(await scoped(file('C:/JM Programs/ProfitShield/src/x.ts'), null as any, null as any))).toBe(true);
  });

  it('blocks /tmp writes (security hardened)', async () => {
    expect(isDeny(await scoped(file('/tmp/test.txt'), null as any, null as any))).toBe(true);
  });

  it('handles empty path', async () => {
    expect(isDeny(await scoped(file(''), null as any, null as any))).toBe(false);
  });
});

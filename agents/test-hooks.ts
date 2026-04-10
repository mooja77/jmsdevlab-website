import { blockDestructiveCommands, requireApprovalForDeploys, blockEnvFileAccess, enforceWorkdirScope } from './hooks.js';

const isDeny = (r: any) => r?.hookSpecificOutput?.permissionDecision === 'deny';
let pass = 0, fail = 0;

function t(name: string, actual: boolean, expected: boolean) {
  const ok = actual === expected;
  console.log((ok ? '  PASS' : '  FAIL') + ': ' + name);
  if (ok) pass++; else fail++;
}

async function main() {
  t('15.1 Block rm -rf /', isDeny(await blockDestructiveCommands({ tool_input: { command: 'rm -rf /' } } as any, null as any, null as any)), true);
  t('15.2 Block DROP TABLE', isDeny(await blockDestructiveCommands({ tool_input: { command: 'DROP TABLE users' } } as any, null as any, null as any)), true);
  t('15.3 Block git push --force', isDeny(await blockDestructiveCommands({ tool_input: { command: 'git push --force' } } as any, null as any, null as any)), true);
  t('15.4 Block killall', isDeny(await blockDestructiveCommands({ tool_input: { command: 'killall node' } } as any, null as any, null as any)), true);
  t('15.9 Allow ls', isDeny(await blockDestructiveCommands({ tool_input: { command: 'ls -la' } } as any, null as any, null as any)), false);
  t('15.7 Block wrangler deploy', isDeny(await requireApprovalForDeploys({ tool_input: { command: 'wrangler deploy' } } as any, null as any, null as any)), true);
  t('15.8 Block git push', isDeny(await requireApprovalForDeploys({ tool_input: { command: 'git push origin main' } } as any, null as any, null as any)), true);
  t('15.10 Allow pwd', isDeny(await requireApprovalForDeploys({ tool_input: { command: 'pwd' } } as any, null as any, null as any)), false);
  t('15.5 Block .env', isDeny(await blockEnvFileAccess({ tool_input: { file_path: '/app/.env' } } as any, null as any, null as any)), true);
  t('15.6 Block .pem', isDeny(await blockEnvFileAccess({ tool_input: { file_path: '/certs/server.pem' } } as any, null as any, null as any)), true);
  t('15.9b Allow .ts', isDeny(await blockEnvFileAccess({ tool_input: { file_path: '/app/src/index.ts' } } as any, null as any, null as any)), false);

  const scoped = enforceWorkdirScope('C:/JM Programs/CashFlowAppV2');
  t('15.11 Block out-of-scope', isDeny(await scoped({ tool_input: { file_path: 'C:/JM Programs/ProfitShield/x.ts' } } as any, null as any, null as any)), true);
  t('15.12 Allow /tmp', isDeny(await scoped({ tool_input: { file_path: '/tmp/test.txt' } } as any, null as any, null as any)), false);

  console.log(`\nHooks: ${pass} PASS, ${fail} FAIL`);
}

main();

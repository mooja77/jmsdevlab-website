import { serializeHandoff, parseHandoffFromOutput } from './handoff.js';

let pass = 0, fail = 0;
function t(name: string, ok: boolean) {
  console.log((ok ? '  PASS' : '  FAIL') + ': ' + name);
  if (ok) pass++; else fail++;
}

// Test serialization
const handoff = {
  session: 'task-42-fix-billing',
  date: '2026-04-10',
  status: 'complete' as const,
  outcome: 'SUCCEEDED' as const,
  goal: 'Fix billing API',
  now: 'Run tests',
  done: [{ task: 'Fixed webhook', files: ['auth.ts', 'billing.ts'] }],
  decisions: { used_upsert: 'Safer for data integrity' },
  worked: ['atomic charge check'],
  failed: [],
  next: ['Run tests', 'Submit PR'],
};

const yaml = serializeHandoff(handoff);
t('Serialize contains session', yaml.includes('session: task-42-fix-billing'));
t('Serialize contains date', yaml.includes('date: 2026-04-10'));
t('Serialize contains status', yaml.includes('status: complete'));
t('Serialize contains outcome', yaml.includes('outcome: SUCCEEDED'));
t('Serialize contains goal', yaml.includes('goal: Fix billing API'));
t('Serialize contains done task', yaml.includes('task: Fixed webhook'));
t('Serialize contains files', yaml.includes('auth.ts'));
t('Serialize contains decision', yaml.includes('used_upsert'));
t('Serialize contains worked', yaml.includes('atomic charge check'));
t('Serialize has no failed section', !yaml.includes('failed:'));
t('Serialize contains next', yaml.includes('Run tests'));
t('Serialize has YAML separators', yaml.startsWith('---'));

// Test parsing from output
const output1 = 'I modified src/auth.ts and created src/billing.ts to fix the webhook. Decision: used upsert over delete for safety.';
const parsed1 = parseHandoffFromOutput(42, 'Fix billing webhook', output1);
t('Parse: session contains task id', parsed1.session.includes('task-42'));
t('Parse: status is complete (no error)', parsed1.status === 'complete');
t('Parse: outcome is SUCCEEDED', parsed1.outcome === 'SUCCEEDED');
t('Parse: goal matches title', parsed1.goal === 'Fix billing webhook');
t('Parse: extracted files', parsed1.done[0].files !== undefined && parsed1.done[0].files.length > 0);
t('Parse: extracted decision', Object.keys(parsed1.decisions).length > 0);

// Test failed output
const output2 = 'Error: failed to connect to database. The migration script failed with timeout.';
const parsed2 = parseHandoffFromOutput(43, 'Run migration', output2);
t('Parse failed: status is failed', parsed2.status === 'failed');
t('Parse failed: outcome is FAILED', parsed2.outcome === 'FAILED');
t('Parse failed: failed array not empty', parsed2.failed.length > 0);
t('Parse failed: worked array empty', parsed2.worked.length === 0);

console.log(`\nHandoff: ${pass} PASS, ${fail} FAIL`);

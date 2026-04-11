import { describe, it, expect } from 'vitest';
import { enforceWorkdirScope } from '../../hooks.js';

const isDeny = (r: any) => r?.hookSpecificOutput?.permissionDecision === 'deny';
const file = (file_path: string) => ({ tool_input: { file_path } } as any);

describe('Path Traversal Prevention', () => {
  const scoped = enforceWorkdirScope('C:/JM Programs/CashFlowAppV2');

  it('blocks ../ traversal', async () => {
    expect(isDeny(await scoped(file('C:/JM Programs/CashFlowAppV2/../../etc/passwd'), null as any, null as any))).toBe(true);
  });

  it('blocks relative ../ from inside scope', async () => {
    expect(isDeny(await scoped(file('C:/JM Programs/CashFlowAppV2/../ProfitShield/x.ts'), null as any, null as any))).toBe(true);
  });

  it('blocks absolute path outside scope', async () => {
    expect(isDeny(await scoped(file('C:/Windows/System32/cmd.exe'), null as any, null as any))).toBe(true);
  });

  it('allows file within scope', async () => {
    expect(isDeny(await scoped(file('C:/JM Programs/CashFlowAppV2/src/index.ts'), null as any, null as any))).toBe(false);
  });

  it('allows nested file within scope', async () => {
    expect(isDeny(await scoped(file('C:/JM Programs/CashFlowAppV2/src/lib/utils.ts'), null as any, null as any))).toBe(false);
  });

  it('blocks /tmp (no blanket allowance)', async () => {
    expect(isDeny(await scoped(file('/tmp/malicious.sh'), null as any, null as any))).toBe(true);
  });

  it('handles empty path safely', async () => {
    expect(isDeny(await scoped(file(''), null as any, null as any))).toBe(false);
  });

  it('blocks sibling directory', async () => {
    expect(isDeny(await scoped(file('C:/JM Programs/ProfitShield/src/x.ts'), null as any, null as any))).toBe(true);
  });
});

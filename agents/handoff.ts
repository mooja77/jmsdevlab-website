// YAML Handoff — structured session state (from Continuous-Claude-v3 pattern).
// 5x more token-efficient than raw markdown memory.

export interface Handoff {
  session: string;
  date: string;
  status: 'complete' | 'partial' | 'blocked' | 'failed';
  outcome: 'SUCCEEDED' | 'PARTIAL_PLUS' | 'PARTIAL_MINUS' | 'FAILED';
  goal: string;
  now: string;
  done: { task: string; files?: string[] }[];
  decisions: Record<string, string>;
  worked: string[];
  failed: string[];
  next: string[];
}

export function serializeHandoff(h: Handoff): string {
  const lines: string[] = [
    '---',
    `session: ${h.session}`,
    `date: ${h.date}`,
    `status: ${h.status}`,
    `outcome: ${h.outcome}`,
    '---',
    `goal: ${h.goal}`,
    `now: ${h.now}`,
  ];

  if (h.done.length) {
    lines.push('done:');
    for (const d of h.done) {
      lines.push(`  - task: ${d.task}`);
      if (d.files?.length) lines.push(`    files: [${d.files.join(', ')}]`);
    }
  }

  if (Object.keys(h.decisions).length) {
    lines.push('decisions:');
    for (const [k, v] of Object.entries(h.decisions)) {
      lines.push(`  - ${k}: ${v}`);
    }
  }

  if (h.worked.length) lines.push(`worked: [${h.worked.join(', ')}]`);
  if (h.failed.length) lines.push(`failed: [${h.failed.join(', ')}]`);

  if (h.next.length) {
    lines.push('next:');
    for (const n of h.next) lines.push(`  - ${n}`);
  }

  return lines.join('\n');
}

export function parseHandoffFromOutput(
  taskId: number, title: string, output: string,
): Handoff {
  // Extract structured info from agent output
  const date = new Date().toISOString().split('T')[0];
  const succeeded = !output.toLowerCase().includes('error') && !output.toLowerCase().includes('failed');

  // Extract file paths mentioned
  const filePattern = /(?:modified|created|edited|changed|updated)\s+[`"]?([^\s`"]+\.\w+)[`"]?/gi;
  const files: string[] = [];
  let match;
  while ((match = filePattern.exec(output)) !== null) {
    if (!files.includes(match[1])) files.push(match[1]);
  }

  // Extract decisions (lines starting with "Decision:" or "Chose X over Y")
  const decisionPattern = /(?:decision|chose|selected|picked):\s*(.+)/gi;
  const decisions: Record<string, string> = {};
  while ((match = decisionPattern.exec(output)) !== null) {
    const key = match[1].split(/[:.]/)[0].trim().toLowerCase().replace(/\s+/g, '_');
    decisions[key] = match[1].trim();
  }

  return {
    session: `task-${taskId}-${title.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}`,
    date,
    status: succeeded ? 'complete' : 'failed',
    outcome: succeeded ? 'SUCCEEDED' : 'FAILED',
    goal: title,
    now: succeeded ? 'Verify changes and run tests' : 'Investigate failure and retry',
    done: files.length ? [{ task: title, files }] : [{ task: title }],
    decisions,
    worked: succeeded ? [output.substring(0, 100)] : [],
    failed: succeeded ? [] : [output.substring(0, 100)],
    next: succeeded ? ['Run tests', 'Review PR'] : ['Debug the issue', 'Check logs'],
  };
}

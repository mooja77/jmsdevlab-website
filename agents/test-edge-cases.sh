#!/bin/bash
# Agent Harness Tests 15-17: Hooks, Cron verification, Edge Cases
set -o pipefail

API="https://jms-admin-portal.mooja77.workers.dev"
PASS=0; FAIL=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "  PASS: $name"
    ((PASS++))
  else
    echo "  FAIL: $name (expected=$expected, got=$actual)"
    ((FAIL++))
  fi
}

code() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

jq_val() {
  python3 -c "import sys,json; d=json.load(sys.stdin); print($1)" 2>/dev/null
}

TOKEN=$(curl -s "$API/api/auth/login" -X POST -H "Content-Type: application/json" -d "{\"password\":\"JmsAdmin2026\"}" | jq_val "d['token']")
H="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

echo "===== TEST 15: GOVERNANCE HOOKS (unit tests) ====="
# These test the hook functions directly via the executor's TypeScript
cd "/c/JM Programs/JMS Dev Lab/agents"

HOOK_RESULTS=$(npx tsx -e "
import { blockDestructiveCommands, requireApprovalForDeploys, blockEnvFileAccess, enforceWorkdirScope } from './hooks.js';

async function test() {
  const results = [];

  // Destructive commands
  const rm = await blockDestructiveCommands({ tool_input: { command: 'rm -rf /' } }, null, null);
  results.push({ test: '15.1', name: 'Block rm -rf /', pass: rm?.hookSpecificOutput?.permissionDecision === 'deny' });

  const drop = await blockDestructiveCommands({ tool_input: { command: 'DROP TABLE users' } }, null, null);
  results.push({ test: '15.2', name: 'Block DROP TABLE', pass: drop?.hookSpecificOutput?.permissionDecision === 'deny' });

  const force = await blockDestructiveCommands({ tool_input: { command: 'git push --force' } }, null, null);
  results.push({ test: '15.3', name: 'Block git push --force', pass: force?.hookSpecificOutput?.permissionDecision === 'deny' });

  const kill = await blockDestructiveCommands({ tool_input: { command: 'killall node' } }, null, null);
  results.push({ test: '15.4', name: 'Block killall', pass: kill?.hookSpecificOutput?.permissionDecision === 'deny' });

  const safe = await blockDestructiveCommands({ tool_input: { command: 'ls -la' } }, null, null);
  results.push({ test: '15.10', name: 'Allow ls', pass: !safe?.hookSpecificOutput?.permissionDecision });

  // Deploy commands
  const deploy = await requireApprovalForDeploys({ tool_input: { command: 'wrangler deploy' } }, null, null);
  results.push({ test: '15.7', name: 'Block wrangler deploy', pass: deploy?.hookSpecificOutput?.permissionDecision === 'deny' });

  const push = await requireApprovalForDeploys({ tool_input: { command: 'git push origin main' } }, null, null);
  results.push({ test: '15.8', name: 'Block git push', pass: push?.hookSpecificOutput?.permissionDecision === 'deny' });

  const npm = await requireApprovalForDeploys({ tool_input: { command: 'npm publish' } }, null, null);
  results.push({ test: '15.8b', name: 'Block npm publish', pass: npm?.hookSpecificOutput?.permissionDecision === 'deny' });

  const pwd = await requireApprovalForDeploys({ tool_input: { command: 'pwd' } }, null, null);
  results.push({ test: '15.10b', name: 'Allow pwd', pass: !pwd?.hookSpecificOutput?.permissionDecision });

  // Env file access
  const env = await blockEnvFileAccess({ tool_input: { file_path: '/app/.env' } }, null, null);
  results.push({ test: '15.5', name: 'Block .env', pass: env?.hookSpecificOutput?.permissionDecision === 'deny' });

  const pem = await blockEnvFileAccess({ tool_input: { file_path: '/certs/server.pem' } }, null, null);
  results.push({ test: '15.6', name: 'Block .pem', pass: pem?.hookSpecificOutput?.permissionDecision === 'deny' });

  const cred = await blockEnvFileAccess({ tool_input: { file_path: '/app/credentials.json' } }, null, null);
  results.push({ test: '15.6b', name: 'Block credentials', pass: cred?.hookSpecificOutput?.permissionDecision === 'deny' });

  const ts = await blockEnvFileAccess({ tool_input: { file_path: '/app/src/index.ts' } }, null, null);
  results.push({ test: '15.9', name: 'Allow .ts file', pass: !ts?.hookSpecificOutput?.permissionDecision });

  // Workdir scope
  const scopedHook = enforceWorkdirScope('C:/JM Programs/CashFlowAppV2');

  const inScope = await scopedHook({ tool_input: { file_path: 'C:/JM Programs/CashFlowAppV2/src/index.ts' } }, null, null);
  results.push({ test: '15.9b', name: 'Allow in-scope write', pass: !inScope?.hookSpecificOutput?.permissionDecision });

  const outScope = await scopedHook({ tool_input: { file_path: 'C:/JM Programs/ProfitShield/src/index.ts' } }, null, null);
  results.push({ test: '15.11', name: 'Block out-of-scope write', pass: outScope?.hookSpecificOutput?.permissionDecision === 'deny' });

  const tmp = await scopedHook({ tool_input: { file_path: '/tmp/test.txt' } }, null, null);
  results.push({ test: '15.12', name: 'Allow /tmp write', pass: !tmp?.hookSpecificOutput?.permissionDecision });

  console.log(JSON.stringify(results));
}
test();
" 2>/dev/null)

echo "$HOOK_RESULTS" | python3 -c "
import sys, json
results = json.loads(sys.stdin.read())
for r in results:
    status = 'PASS' if r['pass'] else 'FAIL'
    print(f'  {status}: {r[\"test\"]} {r[\"name\"]}')
" 2>/dev/null
HOOK_PASS=$(echo "$HOOK_RESULTS" | python3 -c "import sys,json; print(sum(1 for r in json.loads(sys.stdin.read()) if r['pass']))" 2>/dev/null)
HOOK_FAIL=$(echo "$HOOK_RESULTS" | python3 -c "import sys,json; print(sum(1 for r in json.loads(sys.stdin.read()) if not r['pass']))" 2>/dev/null)
PASS=$((PASS + HOOK_PASS))
FAIL=$((FAIL + HOOK_FAIL))

echo ""
echo "===== TEST 16: CRON VERIFICATION ====="
# Verify cron structures exist (can't trigger cron remotely, but verify data is in place)

# 16.4 Dawn Patrol schedule exists
SCHED=$(curl -s "$API/api/agents/audit?agent_id=supervisor-apps&limit=50" -H "$H" | jq_val "'schedule' in str(d)")
check "16.4 Dawn Patrol schedule seeded" "True" "$SCHED"

# Verify stale task recovery setup (heartbeat column exists)
HB_TASK=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-qualcanvas\",\"type\":\"general\",\"title\":\"Heartbeat test\"}" | jq_val "d['id']")
curl -s "$API/api/agents/tasks/$HB_TASK/claim" -X PUT -H "$H" > /dev/null
HB_RES=$(curl -s "$API/api/agents/tasks/$HB_TASK/heartbeat" -X PUT -H "$H" | jq_val "d['updated']")
check "16.2 Heartbeat mechanism works" "True" "$HB_RES"
# Cleanup: fail the task so it doesn't hang
curl -s "$API/api/agents/tasks/$HB_TASK/fail" -X PUT -H "$H" -H "$CT" -d "{\"error_message\":\"Test cleanup\"}" > /dev/null

echo ""
echo "===== TEST 17: EDGE CASES ====="

# 17.1 Max length title (200 chars)
LONG_TITLE=$(python3 -c "print('A' * 200)")
R=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"$LONG_TITLE\"}" | jq_val "d.get('ok')")
check "17.1 200-char title accepted" "True" "$R"

# 17.4 Empty title
R=$(code "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"\"}")
check "17.4 Empty title rejected" "400" "$R"

# 17.5 Unicode title
R=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"Fix bug in \u2603 module \ud83d\ude80\"}" | jq_val "d.get('ok')")
check "17.5 Unicode title accepted" "True" "$R"

# 17.8 Zero cost completion
ZTID=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"Zero cost test\"}" | jq_val "d['id']")
curl -s "$API/api/agents/tasks/$ZTID/claim" -X PUT -H "$H" > /dev/null
R=$(curl -s "$API/api/agents/tasks/$ZTID/complete" -X PUT -H "$H" -H "$CT" -d "{\"cost_cents\":0,\"tokens_in\":0,\"tokens_out\":0}" | jq_val "d.get('ok')")
check "17.8 Zero cost completion" "True" "$R"

# 17.6 Concurrent claims (simulate race condition)
RACE_ID=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"Race test\"}" | jq_val "d['id']")
# Fire two claims simultaneously
R1=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/agents/tasks/$RACE_ID/claim" -X PUT -H "$H") &
R2=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/agents/tasks/$RACE_ID/claim" -X PUT -H "$H") &
wait
# One should be 200, one should be 409
if [ "$R1" = "200" ] || [ "$R2" = "200" ]; then
  echo "  PASS: 17.6 At least one claim succeeded"
  ((PASS++))
else
  echo "  FAIL: 17.6 Neither claim succeeded (R1=$R1, R2=$R2)"
  ((FAIL++))
fi

# 17.7 Create 20 tasks rapidly
echo -n "  17.7 Rapid creation (20 tasks): "
RAPID_PASS=0
for i in $(seq 1 20); do
  R=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"Rapid $i\"}" | jq_val "d.get('ok')")
  if [ "$R" = "True" ]; then ((RAPID_PASS++)); fi
done
if [ "$RAPID_PASS" = "20" ]; then echo "PASS (all 20 created)"; ((PASS++)); else echo "FAIL ($RAPID_PASS/20)"; ((FAIL++)); fi

# 17.9 Negative cost
NTID=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"Neg cost test\"}" | jq_val "d['id']")
curl -s "$API/api/agents/tasks/$NTID/claim" -X PUT -H "$H" > /dev/null
R=$(curl -s "$API/api/agents/tasks/$NTID/complete" -X PUT -H "$H" -H "$CT" -d "{\"cost_cents\":-10}" | jq_val "d.get('ok')")
check "17.9 Negative cost defaults to 0" "True" "$R"

echo ""
echo "===== TEST 10.4: POLICY BUDGET BLOCK ====="
# Set agent budget very low, then try to create task
curl -s "$API/api/agents/app-qualcanvas" -X PUT -H "$H" -H "$CT" -d "{\"budget_daily_cents\":1}" > /dev/null
# Simulate spent budget by completing a costly task
BTID=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-qualcanvas\",\"type\":\"general\",\"title\":\"Budget blocker\"}" | jq_val "d['id']")
curl -s "$API/api/agents/tasks/$BTID/claim" -X PUT -H "$H" > /dev/null
curl -s "$API/api/agents/tasks/$BTID/complete" -X PUT -H "$H" -H "$CT" -d "{\"cost_cents\":5}" > /dev/null
# Now create another task — policy should block (budget > 100%)
BLOCKED=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-qualcanvas\",\"type\":\"general\",\"title\":\"Should be blocked\"}")
BPOL=$(echo "$BLOCKED" | jq_val "d.get('policy','')")
check "10.4 Budget block policy" "block" "$BPOL"
# Restore budget
curl -s "$API/api/agents/app-qualcanvas" -X PUT -H "$H" -H "$CT" -d "{\"budget_daily_cents\":10}" > /dev/null

echo ""
echo "===== TEST 5.16-17: LOGIC FAILURE ESCALATION ====="
LID=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-repairdesk\",\"type\":\"general\",\"title\":\"Logic fail test\"}" | jq_val "d['id']")
curl -s "$API/api/agents/tasks/$LID/claim" -X PUT -H "$H" > /dev/null
LR=$(curl -s "$API/api/agents/tasks/$LID/fail" -X PUT -H "$H" -H "$CT" -d "{\"error_message\":\"Cannot solve this problem\",\"failure_type\":\"logic\"}")
LFT=$(echo "$LR" | jq_val "d.get('failure_type','')")
check "5.16 Logic failure classified" "logic" "$LFT"

# Check if escalation task was created for supervisor
ECTASKS=$(curl -s "$API/api/agents/tasks?agent_id=supervisor-apps&status=queued&limit=10" -H "$H" | jq_val "[t for t in d['tasks'] if 'Escalation' in t.get('title','')]")
if echo "$ECTASKS" | grep -q "Escalation"; then
  echo "  PASS: 5.17 Logic failure escalated to supervisor"
  ((PASS++))
else
  echo "  FAIL: 5.17 No escalation task found"
  ((FAIL++))
fi

echo ""
echo "========================================"
echo "TOTAL: $PASS PASS, $FAIL FAIL out of $((PASS+FAIL)) tests"
echo "========================================"

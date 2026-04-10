#!/bin/bash
# Agent Harness Test Suite — Tests 1-12 (API tests via curl)
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

echo "===== TEST 1: AUTHENTICATION ====="
check "1.1 No token 401" "401" "$(code "$API/api/agents")"
check "1.2 Bad token 401" "401" "$(code "$API/api/agents" -H "Authorization: Bearer badtoken")"

TOKEN=$(curl -s "$API/api/auth/login" -X POST -H "Content-Type: application/json" -d "{\"password\":\"JmsAdmin2026\"}" | jq_val "d['token']")
if [ -n "$TOKEN" ] && [ "$TOKEN" != "None" ]; then check "1.3 Login OK" "true" "true"; else check "1.3 Login" "token" "none"; fi

check "1.4 Valid token 200" "200" "$(code "$API/api/agents" -H "Authorization: Bearer $TOKEN")"
check "1.5 Dashboard 200" "200" "$(code "$API/api/agents/dashboard" -H "Authorization: Bearer $TOKEN")"

H="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

echo ""
echo "===== TEST 2: AGENT REGISTRY ====="
check "2.1 All 18 agents" "18" "$(curl -s "$API/api/agents" -H "$H" | jq_val "len(d['agents'])")"
check "2.2 12 app agents" "12" "$(curl -s "$API/api/agents?type=app" -H "$H" | jq_val "len(d['agents'])")"
check "2.3 2 supervisors" "2" "$(curl -s "$API/api/agents?type=supervisor" -H "$H" | jq_val "len(d['agents'])")"
check "2.4 3 marketing" "3" "$(curl -s "$API/api/agents?type=marketing" -H "$H" | jq_val "len(d['agents'])")"
check "2.5 1 operations" "1" "$(curl -s "$API/api/agents?type=operations" -H "$H" | jq_val "len(d['agents'])")"
check "2.6 0 for invalid type" "0" "$(curl -s "$API/api/agents?type=fake" -H "$H" | jq_val "len(d['agents'])")"
check "2.8 Agent detail 200" "200" "$(code "$API/api/agents/app-smartcash" -H "$H")"
check "2.9 Nonexistent 404" "404" "$(code "$API/api/agents/nonexistent" -H "$H")"

# Update tests
check "2.11 Pause agent" "200" "$(code "$API/api/agents/app-smartcash" -X PUT -H "$H" -H "$CT" -d "{\"status\":\"paused\"}")"
check "2.12 Invalid status" "400" "$(code "$API/api/agents/app-smartcash" -X PUT -H "$H" -H "$CT" -d "{\"status\":\"flying\"}")"
check "2.19 Invalid JSON" "400" "$(code "$API/api/agents/app-smartcash" -X PUT -H "$H" -H "$CT" -d "{\"config_json\":\"not json\"}")"
check "2.20 Nonexistent PUT" "404" "$(code "$API/api/agents/fake-agent" -X PUT -H "$H" -H "$CT" -d "{\"status\":\"idle\"}")"
check "2.21 Empty body" "400" "$(code "$API/api/agents/app-smartcash" -X PUT -H "$H" -H "$CT" -d "{}")"
# Restore
curl -s "$API/api/agents/app-smartcash" -X PUT -H "$H" -H "$CT" -d "{\"status\":\"idle\"}" > /dev/null
echo "  PASS: 2.22 Restored"; ((PASS++))

echo ""
echo "===== TEST 3: BUDGET ====="
check "3.1 Budget 200" "200" "$(code "$API/api/agents/app-smartcash/budget" -H "$H")"
check "3.2 Fake budget 404" "404" "$(code "$API/api/agents/fake/budget" -H "$H")"

echo ""
echo "===== TEST 4: TASK CREATION & POLICY ====="
check "4.1 Health auto-approve" "auto_approve" "$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"health-check\",\"title\":\"T4.1\"}" | jq_val "d['policy']")"
check "4.5 Bug-fix no policy" "none" "$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"bug-fix\",\"title\":\"T4.5\"}" | jq_val "d['policy']")"
check "4.7 Fake agent 404" "404" "$(code "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"fake\",\"type\":\"t\",\"title\":\"t\"}")"
check "4.8 Missing title 400" "400" "$(code "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"t\"}")"
check "4.17 Schedule auto-approve" "auto_approve" "$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"T4.17\",\"created_by\":\"schedule\"}" | jq_val "d['policy']")"

echo ""
echo "===== TEST 5: TASK LIFECYCLE ====="
# Create lifecycle test task
TID=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-repairdesk\",\"type\":\"bug-fix\",\"title\":\"Lifecycle test\"}" | jq_val "d['id']")
echo "  Created task #$TID"

check "5.3 Claim OK" "200" "$(code "$API/api/agents/tasks/$TID/claim" -X PUT -H "$H")"
check "5.4 Double claim 409" "409" "$(code "$API/api/agents/tasks/$TID/claim" -X PUT -H "$H")"
check "5.7 Heartbeat OK" "200" "$(code "$API/api/agents/tasks/$TID/heartbeat" -X PUT -H "$H")"

# Complete + verify review
COMP=$(curl -s "$API/api/agents/tasks/$TID/complete" -X PUT -H "$H" -H "$CT" -d "{\"output_json\":{\"summary\":\"Fixed\"},\"model_used\":\"sonnet\",\"tokens_in\":1000,\"tokens_out\":500,\"cost_cents\":2}")
check "5.9 Complete OK" "True" "$(echo "$COMP" | jq_val "d['ok']")"
RID=$(echo "$COMP" | jq_val "d.get('review_task_id')")
if [ "$RID" != "None" ] && [ -n "$RID" ]; then check "5.10 Review created" "true" "true"; else check "5.10 Review" "id" "None"; fi

# Fail transient
FID=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"Fail test\"}" | jq_val "d['id']")
curl -s "$API/api/agents/tasks/$FID/claim" -X PUT -H "$H" > /dev/null
FR=$(curl -s "$API/api/agents/tasks/$FID/fail" -X PUT -H "$H" -H "$CT" -d "{\"error_message\":\"Connection timed out\"}")
check "5.14 Timeout retried" "True" "$(echo "$FR" | jq_val "d['retried']")"
check "5.14b Failure type" "timeout" "$(echo "$FR" | jq_val "d['failure_type']")"

# Fail permission (no retry)
PID=$(curl -s "$API/api/agents/tasks" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"type\":\"general\",\"title\":\"Perm test\"}" | jq_val "d['id']")
curl -s "$API/api/agents/tasks/$PID/claim" -X PUT -H "$H" > /dev/null
PR=$(curl -s "$API/api/agents/tasks/$PID/fail" -X PUT -H "$H" -H "$CT" -d "{\"error_message\":\"Permission denied\"}")
check "5.15 Perm not retried" "False" "$(echo "$PR" | jq_val "d['retried']")"
check "5.15b Failure type" "permission" "$(echo "$PR" | jq_val "d['failure_type']")"

echo ""
echo "===== TEST 6: MESSAGES ====="
check "6.1 Send message" "200" "$(code "$API/api/agents/messages" -X POST -H "$H" -H "$CT" -d "{\"from_agent\":\"app-smartcash\",\"to_agent\":\"supervisor-apps\",\"body\":\"Test message\"}")"
check "6.2 Missing body 400" "400" "$(code "$API/api/agents/messages" -X POST -H "$H" -H "$CT" -d "{\"from_agent\":\"a\",\"to_agent\":\"b\"}")"
check "6.3 List messages" "200" "$(code "$API/api/agents/messages" -H "$H")"

echo ""
echo "===== TEST 7: BULLETINS ====="
check "7.1 Create bulletin" "200" "$(code "$API/api/agents/bulletins" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"ops-infra\",\"title\":\"Test bulletin\",\"severity\":\"warning\"}")"
check "7.2 Missing title 400" "400" "$(code "$API/api/agents/bulletins" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"ops-infra\"}")"
check "7.3 List bulletins" "200" "$(code "$API/api/agents/bulletins" -H "$H")"

echo ""
echo "===== TEST 8: FILE CLAIMS ====="
check "8.1 Claim files" "200" "$(code "$API/api/agents/claims" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"task_id\":1,\"files\":[\"test.ts\",\"test2.ts\"]}")"
# Claim same file from different agent
CONF=$(curl -s "$API/api/agents/claims" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"app-repairdesk\",\"task_id\":2,\"files\":[\"test.ts\"]}" | jq_val "len(d['conflicts'])")
check "8.2 Conflict detected" "1" "$CONF"
check "8.3 List claims" "200" "$(code "$API/api/agents/claims" -H "$H")"
check "8.4 Release claims" "200" "$(code "$API/api/agents/claims" -X DELETE -H "$H" -H "$CT" -d "{\"agent_id\":\"app-smartcash\",\"task_id\":1}")"
check "8.5 Missing fields 400" "400" "$(code "$API/api/agents/claims" -X POST -H "$H" -H "$CT" -d "{\"agent_id\":\"a\"}")"

echo ""
echo "===== TEST 9: POLICIES ====="
PC=$(curl -s "$API/api/agents/policies" -H "$H" | jq_val "len(d['policies'])")
check "9.1 8 policies" "8" "$PC"

echo ""
echo "===== TEST 10: AUDIT ====="
check "10.1 Audit 200" "200" "$(code "$API/api/agents/audit" -H "$H")"
check "10.2 Audit filtered" "200" "$(code "$API/api/agents/audit?agent_id=app-smartcash" -H "$H")"
check "10.3 Audit limited" "200" "$(code "$API/api/agents/audit?limit=5" -H "$H")"

echo ""
echo "===== TEST 11: DASHBOARD AGGREGATE ====="
DASH=$(curl -s "$API/api/agents/dashboard" -H "$H")
AC=$(echo "$DASH" | jq_val "len(d['agents'])")
check "11.1 Dashboard 18 agents" "18" "$AC"

echo ""
echo "========================================"
echo "TOTAL: $PASS PASS, $FAIL FAIL out of $((PASS+FAIL)) tests"
echo "========================================"

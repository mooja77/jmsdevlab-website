#!/bin/bash
# Command Centre Smoke Test — run after every deploy
# Usage: bash smoke-test.sh [password]

BASE="https://jms-admin-portal.mooja77.workers.dev"
PASS=0
FAIL=0

# Login
TOKEN=$(curl -s "$BASE/api/auth/login" -X POST -H "Content-Type: application/json" -d "{\"password\":\"${1:-JmsAdmin2026}\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "FAIL: Could not login"
  exit 1
fi

test_endpoint() {
  local path=$1
  local method=${2:-GET}
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 -H "Authorization: Bearer $TOKEN" -X "$method" "$BASE$path")
  if [ "$STATUS" = "200" ]; then
    PASS=$((PASS+1))
    echo "  PASS  $path"
  else
    FAIL=$((FAIL+1))
    echo "  FAIL  $path (HTTP $STATUS)"
  fi
}

echo "Command Centre Smoke Test"
echo "========================="
echo ""

echo "Public endpoints:"
test_endpoint "/api/health"

echo ""
echo "Core pages:"
test_endpoint "/api/briefing"
test_endpoint "/api/apps"
test_endpoint "/api/aggregate/dashboard"
test_endpoint "/api/aggregate/health"
test_endpoint "/api/aggregate/revenue"
test_endpoint "/api/aggregate/uptime"
test_endpoint "/api/aggregate/activity"

echo ""
echo "Customers & Users:"
test_endpoint "/api/customers"
test_endpoint "/api/customers/stripe"

echo ""
echo "Analytics:"
test_endpoint "/api/visitors/tracking"
test_endpoint "/api/visitors/analytics?days=7"
test_endpoint "/api/visitors/summary"
test_endpoint "/api/visitors/sources"
test_endpoint "/api/visitors/pages"
test_endpoint "/api/visitors/geo"
test_endpoint "/api/visitors/tech"
test_endpoint "/api/visitors/errors"
test_endpoint "/api/visitors/trends"

echo ""
echo "Business:"
test_endpoint "/api/leads"
test_endpoint "/api/bark"
test_endpoint "/api/projects"
test_endpoint "/api/costs"
test_endpoint "/api/usage"
test_endpoint "/api/usage/realusers"

echo ""
echo "Conversions & Funnel:"
test_endpoint "/api/funnel"
test_endpoint "/api/funnel/daily"
test_endpoint "/api/funnel/attribution"
test_endpoint "/api/health-scores"
test_endpoint "/api/revenue/events"

echo ""
echo "Status & Monitoring:"
test_endpoint "/api/status/critical-paths"

echo ""
echo "Infrastructure:"
test_endpoint "/api/deploy/history"
test_endpoint "/api/errors"
test_endpoint "/api/matrices"
test_endpoint "/api/milestones"
test_endpoint "/api/cache/status"
test_endpoint "/api/debug/users"

echo ""
echo "Security checks:"
# Wrong password
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" -d '{"password":"wrong"}' "$BASE/api/auth/login")
if [ "$STATUS" = "401" ]; then PASS=$((PASS+1)); echo "  PASS  Login rejects wrong password";
else FAIL=$((FAIL+1)); echo "  FAIL  Login should reject wrong password (got HTTP $STATUS)"; fi

# No auth
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/briefing")
if [ "$STATUS" = "401" ]; then PASS=$((PASS+1)); echo "  PASS  Endpoints require auth";
else FAIL=$((FAIL+1)); echo "  FAIL  Endpoints accessible without auth (got HTTP $STATUS)"; fi

# Invalid admin key
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST -H "x-admin-key: wrong" -H "Content-Type: application/json" -d '{"app_id":"smartcash","events":[{"name":"test"}]}' "$BASE/api/events/ingest")
if [ "$STATUS" = "403" ]; then PASS=$((PASS+1)); echo "  PASS  Ingest rejects bad admin key";
else FAIL=$((FAIL+1)); echo "  FAIL  Ingest should reject bad key (got HTTP $STATUS)"; fi

# Stripe webhook without signature
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" -d '{"type":"test"}' "$BASE/api/webhooks/stripe")
if [ "$STATUS" = "400" ] || [ "$STATUS" = "500" ]; then PASS=$((PASS+1)); echo "  PASS  Stripe webhook rejects unsigned request";
else FAIL=$((FAIL+1)); echo "  FAIL  Stripe webhook should reject unsigned (got HTTP $STATUS)"; fi

echo ""
echo "========================="
echo "Results: $PASS passed, $FAIL failed ($(($PASS + $FAIL)) total)"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi

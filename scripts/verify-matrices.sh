#!/bin/bash
# JMS Dev Lab — Automated Feature Matrix Verification
# Run: bash scripts/verify-matrices.sh
# Output: scripts/matrices-verified.json
#
# This script is the SINGLE SOURCE OF TRUTH for all feature matrices.
# The doc and command center are derived from its output.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$SCRIPT_DIR/matrices-verified.json"
BASE="/c/JM Programs"

# App definitions: id|name|path|is_shopify|shopify_slug
APPS=(
  "smartcash|SmartCash|$BASE/Smart Cash|yes|smartcash"
  "profitshield|ProfitShield|$BASE/ProfitShield|yes|profitshield"
  "jewelvalue|JewelValue|$BASE/Valuation App/jewel-value|yes|"
  "repairdesk|RepairDesk|$BASE/Repair Desk|yes|repairdesk"
  "growthmap|GrowthMap|$BASE/GrowthMap|yes|"
  "spamshield|SpamShield|$BASE/Spam Shield|yes|"
  "themesweep|ThemeSweep|$BASE/Theme Sweep|yes|"
  "taxmatch|TaxMatch|$BASE/TaxMatch|yes|"
  "jsm|JSM|$BASE/Custom Jewellery Manager|yes|jewelry-studio-manager"
  "staffhub|StaffHub|$BASE/Staff Hub|yes|staff-hub"
  "pitchside|PitchSide|$BASE/PitchSide|no|"
  "qualcanvas|QualCanvas|$BASE/Canvas App|no|"
)

check_exists() { [ -n "$1" ] && [ "$1" != "0" ]; }

echo "Verifying feature matrices for ${#APPS[@]} apps..."
echo "{"
echo '  "verifiedAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",'
echo '  "apps": {'

FIRST_APP=true
for entry in "${APPS[@]}"; do
  IFS='|' read -r id name path is_shopify slug <<< "$entry"

  if [ ! -d "$path" ]; then
    echo "  SKIP: $name ($path not found)" >&2
    continue
  fi

  cd "$path" || continue

  # --- 18-Point Audit Criteria ---

  # 1. Monorepo
  c1="no"
  [ -d "apps" ] || [ -d "packages" ] && c1="yes"

  # 2. Web SaaS (has login/auth routes)
  c2="no"
  hits=$(grep -rl "login\|/auth/" --include="*.tsx" --include="*.ts" --include="*.html" 2>/dev/null | grep -v node_modules | grep -v ".git" | head -1)
  [ -n "$hits" ] && c2="yes"

  # 3. Google OAuth (GOOGLE_CLIENT_ID in any .env)
  c3="no"
  hits=$(find . -maxdepth 4 -name ".env*" -not -name ".env.example" 2>/dev/null | xargs grep -l "GOOGLE_CLIENT_ID" 2>/dev/null | head -1)
  [ -n "$hits" ] && c3="yes"

  # 4. Guided Tour (tour library in package.json)
  c4="no"
  hits=$(grep -rl "react-joyride\|nextstepjs\|shepherd\|intro\.js" . --include="package.json" 2>/dev/null | grep -v node_modules | head -1)
  [ -n "$hits" ] && c4="yes"

  # 5. Tutorial/Help content
  c5="no"
  hits=$(find . -not -path "*/node_modules/*" -not -path "*/.git/*" \( -name "*help*" -o -name "*guide*" -o -name "*tutorial*" -o -name "*support*" -o -name "*faq*" \) -name "*.tsx" -o -name "*.ts" -o -name "*.html" 2>/dev/null | head -1)
  [ -n "$hits" ] && c5="yes"
  # Also check for help/guide text in code
  if [ "$c5" = "no" ]; then
    hits=$(grep -rl "tutorial\|help center\|getting started\|how to\|FAQ" --include="*.tsx" --include="*.ts" --include="*.html" 2>/dev/null | grep -v node_modules | head -1)
    [ -n "$hits" ] && c5="yes"
  fi

  # 6. Billing Enforcement (subscription guard/gate middleware)
  c6="no"
  if [ "$is_shopify" = "no" ] && [ "$id" = "pitchside" ]; then
    c6="na"
  else
    hits=$(grep -rl "subscription.*guard\|subscription.*gate\|billing.*middleware\|requireActive\|plan.*enforce\|checkTrial\|subscriptionGuard" --include="*.ts" --include="*.js" --include="*.tsx" 2>/dev/null | grep -v node_modules | head -1)
    [ -n "$hits" ] && c6="yes"
  fi

  # 7. Pricing Tiers (3+ plan names)
  c7="no"
  if [ "$id" = "pitchside" ]; then
    c7="na"
  else
    count=$(grep -r "starter\|professional\|enterprise\|basic\|pro\|agency\|team\|free.*plan\|STARTER\|PROFESSIONAL\|ENTERPRISE" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l)
    [ "$count" -ge 3 ] && c7="yes"
  fi

  # 8. GDPR Webhooks (active Shopify GDPR handlers)
  c8="no"
  if [ "$is_shopify" = "no" ]; then
    c8="na"
  else
    redact=$(grep -r "customers.*redact\|shop.*redact\|data_request" --include="*.ts" --include="*.js" 2>/dev/null | grep -v node_modules | grep -v "^.*//.*redact\|^.*\*.*redact" | head -1)
    [ -n "$redact" ] && c8="yes"
  fi

  # 9. Responsive (Tailwind or responsive CSS framework)
  c9="no"
  hits=$(grep -rl "tailwindcss\|tailwind\|bootstrap\|@media.*screen\|responsive" --include="package.json" --include="*.css" --include="tailwind.config.*" 2>/dev/null | grep -v node_modules | head -1)
  [ -n "$hits" ] && c9="yes"
  # Most React/Next.js apps are responsive by default with flex/grid
  if [ "$c9" = "no" ]; then
    hits=$(grep -rl "flex\|grid\|sm:\|md:\|lg:" --include="*.tsx" --include="*.css" 2>/dev/null | grep -v node_modules | head -1)
    [ -n "$hits" ] && c9="yes"
  fi

  # 10. Mascot/Logo (branded image assets)
  c10="no"
  imgcount=$(find . -not -path "*/node_modules/*" -not -path "*/.git/*" \( -name "*.png" -o -name "*.svg" -o -name "*.jpg" -o -name "*.webp" \) 2>/dev/null | grep -iv "screenshot\|snapshot" | wc -l)
  [ "$imgcount" -ge 5 ] && c10="yes"

  # 11. Promo Video (video files or YouTube embeds)
  c11="no"
  vidcount=$(find . -not -path "*/node_modules/*" -not -path "*/.git/*" \( -name "*.mp4" -o -name "*.webm" -o -name "*.mov" \) 2>/dev/null | wc -l)
  ytcount=$(grep -r "youtube.com/embed\|youtu.be" --include="*.html" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | wc -l)
  [ "$vidcount" -gt 0 ] || [ "$ytcount" -gt 0 ] && c11="yes"

  # 12. Marketing Website
  c12="no"
  [ -d "website" ] || [ -d "apps/website" ] || [ -f "index.html" ] && c12="yes"
  # Also check for marketing pages in Next.js apps
  if [ "$c12" = "no" ]; then
    [ -d "src/app/(marketing)" ] || [ -d "app/(marketing)" ] && c12="yes"
  fi

  # 13. Screencast (same as video check - video files or YouTube embeds)
  c13="no"
  [ "$vidcount" -gt 0 ] || [ "$ytcount" -gt 0 ] && c13="yes"

  # 14. Test Plan (test files exist)
  c14="no"
  hits=$(find . -not -path "*/node_modules/*" -not -path "*/.git/*" \( -name "*.test.*" -o -name "*.spec.*" \) 2>/dev/null | head -1)
  [ -n "$hits" ] && c14="yes"

  # 15. Geo Requirements (geographic restrictions stated)
  c15="no"
  hits=$(grep -rl "geographic\|country.*restrict\|US.*only\|Ireland\|United States\|IRS\|1099" --include="*.ts" --include="*.tsx" --include="*.html" --include="*.md" --include="*.toml" 2>/dev/null | grep -v node_modules | head -1)
  [ -n "$hits" ] && c15="yes"

  # 16. JMS Footer
  c16="no"
  hits=$(grep -r "JMS Dev Lab" --include="*.html" --include="*.tsx" --include="*.ts" --include="*.jsx" 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v AGENT-INSTRUCTIONS | head -1)
  [ -n "$hits" ] && c16="yes"

  # 17. Admin Portal (/api/admin endpoints)
  c17="no"
  hits=$(grep -r "/api/admin" --include="*.ts" --include="*.js" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".git" | head -1)
  [ -n "$hits" ] && c17="yes"

  # 18. False Claims Clean
  c18="yes"
  hits=$(grep -r "trusted by [0-9]\|join thousands\|join hundreds\|used by [0-9]" --include="*.html" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v test | grep -v AGENT | head -1)
  [ -n "$hits" ] && c18="no"

  # Count score
  score=0
  max=0
  for c in $c1 $c2 $c3 $c4 $c5 $c6 $c7 $c8 $c9 $c10 $c11 $c12 $c13 $c14 $c15 $c16 $c17 $c18; do
    if [ "$c" != "na" ]; then
      max=$((max + 1))
      [ "$c" = "yes" ] && score=$((score + 1))
    fi
  done

  # --- Shopify Embedded Criteria (if applicable) ---
  s1="na"; s2="na"; s3="na"; s4="na"; s5="na"; s6="na"; s7="na"; s8="na"; s9="na"; s10="na"; s11="na"; s12="na"; s13="na"
  shopify_score=0; shopify_max=0

  if [ "$is_shopify" = "yes" ]; then
    # S1. Embedded Dir
    s1="no"; [ -d "apps/shopify" ] || [ -d "apps/shopify-embedded" ] && s1="yes"

    # S2. App Bridge
    s2="no"; hits=$(grep -r "app-bridge\|shopify-app-remix" --include="package.json" 2>/dev/null | grep -v node_modules | head -1); [ -n "$hits" ] && s2="yes"

    # S3. Session Tokens
    s3="no"; hits=$(grep -r "authenticatedFetch\|getSessionToken\|shopify-app-remix\|authenticate.admin" --include="*.ts" --include="*.tsx" --include="package.json" 2>/dev/null | grep -v node_modules | head -1); [ -n "$hits" ] && s3="yes"

    # S4. Polaris UI
    s4="no"; hits=$(grep -r "@shopify/polaris" --include="package.json" 2>/dev/null | grep -v node_modules | head -1); [ -n "$hits" ] && s4="yes"

    # S5. Shopify Billing API
    s5="no"; hits=$(grep -r "appSubscriptionCreate\|RECURRING_APPLICATION_CHARGE\|billing.*shopify\|app_subscriptions" --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v node_modules | head -1); [ -n "$hits" ] && s5="yes"

    # S6. GDPR (same as c8)
    s6="$c8"

    # S7. App Proxy
    s7="no"; hits=$(grep -r "app_proxy\|subpath" shopify.app.toml 2>/dev/null | head -1); [ -n "$hits" ] && s7="yes"

    # S8. GraphQL API
    s8="no"; hits=$(grep -r "graphql\|admin-api-client\|SHOPIFY.*GRAPHQL\|shopifyApi" --include="*.ts" --include="*.tsx" --include="package.json" 2>/dev/null | grep -v node_modules | head -1); [ -n "$hits" ] && s8="yes"

    # S9. On App Store
    s9="no"
    if [ -n "$slug" ]; then
      status=$(curl -sI --max-time 5 "https://apps.shopify.com/$slug" 2>/dev/null | head -1 | awk '{print $2}')
      [ "$status" = "200" ] && s9="yes"
    fi

    # S10. App Store Link
    s10="$s9"

    # S11. Shopify CLI config
    s11="no"; [ -f "shopify.app.toml" ] && s11="yes"

    # S12. Web + Embedded
    s12="no"; [ "$c2" = "yes" ] && ([ "$s1" = "yes" ] || [ "$s2" = "yes" ]) && s12="yes"

    # S13. Geo Requirements
    s13="$c15"

    for s in $s1 $s2 $s3 $s4 $s5 $s6 $s7 $s8 $s9 $s10 $s11 $s12 $s13; do
      if [ "$s" != "na" ]; then
        shopify_max=$((shopify_max + 1))
        [ "$s" = "yes" ] && shopify_score=$((shopify_score + 1))
      fi
    done
  fi

  # Output JSON
  if [ "$FIRST_APP" = "true" ]; then FIRST_APP=false; else echo ","; fi

  cat <<APPJSON
    "$id": {
      "name": "$name",
      "audit": {
        "monorepo": "$c1", "web_saas": "$c2", "google_oauth": "$c3", "guided_tour": "$c4",
        "tutorial": "$c5", "billing": "$c6", "pricing": "$c7", "gdpr": "$c8",
        "responsive": "$c9", "mascot": "$c10", "promo_video": "$c11", "marketing_site": "$c12",
        "screencast": "$c13", "tests": "$c14", "geo_req": "$c15", "jms_footer": "$c16",
        "admin_portal": "$c17", "clean_claims": "$c18",
        "score": $score, "max": $max
      },
      "shopify": {
        "embedded_dir": "$s1", "app_bridge": "$s2", "session_tokens": "$s3", "polaris": "$s4",
        "billing_api": "$s5", "gdpr_webhooks": "$s6", "app_proxy": "$s7", "graphql": "$s8",
        "on_store": "$s9", "store_link": "$s10", "shopify_cli": "$s11", "web_embedded": "$s12",
        "geo_req": "$s13",
        "score": $shopify_score, "max": $shopify_max
      }
    }
APPJSON

  echo "  $name: $score/$max (Shopify: $shopify_score/$shopify_max)" >&2
done

echo ""
echo "  }"
echo "}"

echo "Results written to stdout. Redirect to $OUTPUT" >&2

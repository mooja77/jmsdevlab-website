# JMS Dev Lab Daily Project Review
$date = Get-Date -Format "yyyy-MM-dd"
$logDir = "C:\JM Programs\JMS Dev Lab\logs"
$logFile = "$logDir\daily-review-$date.log"
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

function Log($msg) { "$(Get-Date -Format 'HH:mm:ss') | $msg" | Tee-Object -FilePath $logFile -Append }

Log "=== JMS DEV LAB DAILY PROJECT REVIEW ==="
Log "Date: $date"
Log ""

# 1. GIT STATUS
Log "--- GIT STATUS ---"
$repos = @{
    "JMS Website"="C:\JM Programs\JMS Dev Lab"
    "SmartCash"="C:\JM Programs\Smart Cash"
    "ProfitShield"="C:\JM Programs\ProfitShield"
    "JewelValue"="C:\JM Programs\Valuation App\jewel-value"
    "RepairDesk"="C:\JM Programs\Repair Desk"
    "GrowthMap"="C:\JM Programs\GrowthMap"
    "StaffHub"="C:\JM Programs\Staff Hub"
    "SpamShield"="C:\JM Programs\Spam Shield"
    "ThemeSweep"="C:\JM Programs\Theme Sweep"
    "TaxMatch"="C:\JM Programs\TaxMatch"
    "PitchSide"="C:\JM Programs\PitchSide"
    "QualCanvas"="C:\JM Programs\Canvas App"
    "JSM"="C:\JM Programs\Custom Jewellery Manager"
    "Vegrify"="C:\JM Programs\Vegrify"
}

foreach ($name in $repos.Keys) {
    $path = $repos[$name]
    if (Test-Path "$path\.git") {
        Push-Location $path
        $dirty = (git status --porcelain 2>$null | Measure-Object).Count
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        if ($dirty -gt 0) {
            Log "  DIRTY: $name ($dirty uncommitted changes on $branch)"
        } else {
            Log "  CLEAN: $name ($branch)"
        }
        Pop-Location
    }
}
Log ""

# 2. LIVE APP HEALTH
Log "--- LIVE APP HEALTH ---"
$sites = @{
    "jmsdevlab.com"="https://jmsdevlab.com"
    "smartcashapp.net"="https://smartcashapp.net"
    "profitshield.app"="https://profitshield.app"
    "jewelvalue.app"="https://jewelvalue.app"
    "repairdeskapp.net"="https://repairdeskapp.net"
    "mygrowthmap.net"="https://mygrowthmap.net"
    "staffhubapp.com"="https://staffhubapp.com"
    "pitchsideapp.net"="https://pitchsideapp.net"
    "qualcanvas.com"="https://qualcanvas.com"
    "jewelrystudiomanager.com"="https://jewelrystudiomanager.com"
}

foreach ($name in $sites.Keys) {
    try {
        $r = Invoke-WebRequest -Uri $sites[$name] -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 5
        Log "  OK: $name (HTTP $($r.StatusCode))"
    } catch {
        Log "  FAIL: $name - $($_.Exception.Message)"
    }
}
Log ""

# 3. DOCS CHECK
Log "--- DOCS CURRENCY ---"
$docs = Get-ChildItem "C:\JM Programs\JMS Dev Lab\docs" -Recurse -Filter "*.md"
$stale = $docs | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
Log "  Total: $($docs.Count) docs, Stale (>30d): $(($stale | Measure-Object).Count)"
Log ""

# 4. AGENT-INSTRUCTIONS
Log "--- AGENT-INSTRUCTIONS ---"
foreach ($name in $repos.Keys) {
    $f = Join-Path $repos[$name] "AGENT-INSTRUCTIONS.md"
    if (Test-Path $f) {
        Log "  OK: $name"
    } else {
        Log "  MISSING: $name"
    }
}
# 5. ADMIN PORTAL HEALTH (when portals are live)
Log "--- ADMIN PORTAL HEALTH ---"
# These endpoints will be checked once admin portals are deployed
# Each app should expose GET /api/admin/health with x-admin-key header
$adminEndpoints = @{
    "SmartCash"="https://api.smartcashapp.net/api/admin/health"
    "ProfitShield"="https://api.profitshield.app/api/admin/health"
    "RepairDesk"="https://api.repairdeskapp.net/api/admin/health"
    "GrowthMap"="https://api.mygrowthmap.net/api/admin/health"
    "StaffHub"="https://api.staffhubapp.com/api/admin/health"
    "QualCanvas"="https://canvas-app-production.up.railway.app/api/admin/health"
}
# NOTE: Uncomment below once ADMIN_API_KEY is configured per app
# $adminKey = $env:JMS_ADMIN_API_KEY
# foreach ($name in $adminEndpoints.Keys) {
#     try {
#         $headers = @{ "x-admin-key" = $adminKey }
#         $r = Invoke-WebRequest -Uri $adminEndpoints[$name] -Headers $headers -UseBasicParsing -TimeoutSec 10
#         $data = $r.Content | ConvertFrom-Json
#         Log "  OK: $name - Users: $($data.totalUsers), Errors24h: $($data.errorRate24h)"
#     } catch {
#         Log "  SKIP: $name - Admin portal not yet deployed"
#     }
# }
Log "  Status: Admin portals not yet deployed - checks will activate once /api/admin/health endpoints are live"
Log ""

Log "=== REVIEW COMPLETE ==="

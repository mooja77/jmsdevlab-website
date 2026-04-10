# 41 — Monitoring and Health Checks

> **Last Updated:** 2026-03-25
> **Maintainer:** John Moore (john@jmsdevlab.com)
> **Status:** LIVE

---

## Overview

JMS Dev Lab uses a combination of local batch scripts, cloud dashboards, and platform-native alerts to monitor the health of all properties. This document covers daily and weekly monitoring routines, analytics, search console tracking, and alerting configuration.

---

## 1. Monitoring Scripts

### Daily Monitoring

| Setting | Value |
|---------|-------|
| Script | `scripts/daily-monitoring.bat` |
| Location | `C:/JM Programs/JMS Dev Lab/scripts/daily-monitoring.bat` |
| Frequency | Daily (manual execution) |
| Purpose | Check all business development channels for new opportunities |

#### Daily Checks

| Check | What It Does |
|-------|-------------|
| **eTenders** | Opens eTenders.gov.ie to check for relevant public procurement tenders |
| **Upwork** | Opens Upwork to check for matching freelance job postings |
| **Reddit** | Opens relevant subreddits (r/shopify, r/shopifyapps, r/smallbusiness) for engagement opportunities |
| **Bark** | Opens Bark dashboard to check for new lead requests |
| **Google Search Console** | Opens GSC dashboard to check indexing status and search performance |
| **Shopify Partners** | Opens Shopify Partners dashboard to check app installs and reviews |

### Weekly Site Health Check

| Setting | Value |
|---------|-------|
| Script | `scripts/weekly-site-check.bat` |
| Location | `C:/JM Programs/JMS Dev Lab/scripts/weekly-site-check.bat` |
| Frequency | Weekly (manual execution) |
| Purpose | Verify all web properties are online and responding |

#### HTTP 200 Checks

The weekly script checks that the following URLs return HTTP 200:

| # | URL | Property |
|---|-----|----------|
| 1 | `https://jmsdevlab.com` | Main website |
| 2 | `https://smartcashapp.net` | SmartCash website |
| 3 | `https://jewelrystudiomanager.com` | JSM website |
| 4 | `https://staffhubapp.com` | StaffHub website |
| 5 | `https://profitshield.app` | ProfitShield |
| 6 | `https://repairdesk.app` | RepairDesk |
| 7 | `https://jewelvalue.app` | Jewel Value |
| 8 | `https://growthmap.app` | GrowthMap |
| 9 | `https://qualcanvas.com` | QualCanvas |
| 10 | `https://themesweep.app` | ThemeSweep |

> **Note:** URLs above are representative. Verify exact domains against [../architecture/11-app-catalogue.md](../architecture/11-app-catalogue.md).

#### What to Do If a Check Fails

| Response Code | Action |
|--------------|--------|
| HTTP 200 | All good — no action needed |
| HTTP 301/302 | Verify redirect is intentional |
| HTTP 404 | Check deployment status; redeploy if needed |
| HTTP 500 | Check platform logs (Railway/Vercel); investigate error |
| Timeout | Check Cloudflare status; check platform status page |
| DNS error | Check Cloudflare DNS records for the domain |

---

## 2. Analytics (Plausible)

| Setting | Value |
|---------|-------|
| Provider | Plausible Analytics |
| Property | `jmsdevlab.com` |
| Dashboard | Plausible cloud dashboard |
| Installed | March 2026 |
| Privacy | No cookies, GDPR-compliant |

### Key Metrics to Monitor

| Metric | Purpose | Baseline Action |
|--------|---------|-----------------|
| **Unique visitors** | Overall traffic trend | Establish weekly baseline; investigate drops > 30% |
| **Page views** | Content engagement | Track most-visited pages |
| **Bounce rate** | Content quality signal | Investigate pages with > 80% bounce |
| **Top pages** | Content performance | Double down on high-traffic content |
| **Referral sources** | Channel effectiveness | Track which platforms drive traffic |
| **Top countries** | Audience geography | Should be primarily IE, UK, US |

### Blog Post Performance

Track individual blog post traffic to identify:

- Highest-performing topics for future content
- Posts that need SEO updates
- Seasonal traffic patterns

### Tool Page Engagement

Monitor the 8 interactive tools for usage patterns:

- Which tools get the most traffic
- Time on page (engagement signal)
- Referral sources to tools (organic vs direct)

---

## 3. Google Search Console (GSC)

### Properties

JMS Dev Lab has **10 GSC properties** registered:

| # | Property | Type |
|---|----------|------|
| 1 | `jmsdevlab.com` | Domain property |
| 2 | `smartcashapp.net` | Domain property |
| 3 | `jewelrystudiomanager.com` | Domain property |
| 4 | `staffhubapp.com` | Domain property |
| 5 | `profitshield.app` | Domain property |
| 6 | `repairdesk.app` | Domain property |
| 7 | `jewelvalue.app` | Domain property |
| 8 | `growthmap.app` | Domain property |
| 9 | `qualcanvas.com` | Domain property |
| 10 | `themesweep.app` | Domain property |

### GSC Monitoring Tasks

| Task | Frequency | What to Check |
|------|-----------|---------------|
| **Indexing status** | Weekly | Pages indexed vs submitted; check for indexing errors |
| **Coverage issues** | Weekly | Crawl errors, blocked pages, soft 404s |
| **Search performance** | Weekly | Clicks, impressions, CTR, average position |
| **New keywords** | Monthly | Queries driving traffic; opportunities for new content |
| **Core Web Vitals** | Monthly | LCP, FID, CLS scores |
| **Manual actions** | As needed | Check for any Google penalties |

### Indexing Request Workflow

When new pages are published:

```
1. Deploy the page (see deployment procedures)
2. Open Google Search Console for the property
3. Use URL Inspection tool
4. Enter the new page URL
5. Click "Request Indexing"
6. Track status in indexing request log
```

---

## 4. Shopify Partners Dashboard

| Setting | Value |
|---------|-------|
| Dashboard | `partners.shopify.com` |
| Check frequency | Daily (part of daily monitoring script) |

### Metrics to Monitor

| Metric | What to Watch For |
|--------|-------------------|
| **App installs** | New installs across all 7 Shopify apps |
| **Uninstalls** | Churn — investigate reasons if spike detected |
| **Active installs** | Net growth trend |
| **Reviews** | New reviews — respond to all within 24 hours |
| **Review rating** | Average rating per app; address negative feedback |
| **Revenue** | Monthly recurring revenue from app subscriptions |
| **App listing impressions** | Shopify App Store visibility |

### Review Response Policy

| Rating | Response Time | Action |
|--------|-------------|--------|
| 5 stars | Within 24h | Thank the merchant |
| 3-4 stars | Within 24h | Thank and ask how to improve |
| 1-2 stars | Within 4h | Investigate issue, offer support, attempt resolution |

---

## 5. Platform Alerts

All critical alerts route to a single inbox for centralised monitoring.

### Alert Routing

| Platform | Alert Types | Destination |
|----------|-----------|-------------|
| **Cloudflare** | SSL expiry, DNS changes, Pages deploy failures | `mooja77@gmail.com` |
| **Vercel** | Deploy failures, function errors, domain issues | `mooja77@gmail.com` |
| **Railway** | Deploy failures, service crashes, database alerts | `mooja77@gmail.com` |
| **Firebase** | Usage threshold alerts, auth anomalies | `mooja77@gmail.com` |
| **Supabase** | Database size warnings, auth issues | `mooja77@gmail.com` |
| **Shopify Partners** | App reviews, install notifications | `mooja77@gmail.com` |
| **Google Search Console** | Coverage issues, manual actions | `mooja77@gmail.com` |

### Alert Priority Levels

| Priority | Examples | Response Time |
|----------|---------|---------------|
| **Critical** | Service down, SSL expired, deploy failure, security alert | Within 1 hour |
| **High** | Negative app review, indexing errors, auth failures | Within 4 hours |
| **Medium** | Deploy warnings, performance degradation | Within 24 hours |
| **Low** | New install notifications, routine reports | Next business day |

---

## 6. Uptime and Availability

### Current Monitoring

| Method | Coverage | Limitation |
|--------|----------|------------|
| Weekly batch script | All 10 URLs | Manual, weekly only |
| Platform dashboards | Individual services | Must check each separately |
| Cloudflare analytics | Cloudflare-hosted sites | Only covers Cloudflare Pages sites |

### Recommended Improvements

| Priority | Improvement | Cost |
|----------|------------|------|
| High | Set up free uptime monitoring (e.g., UptimeRobot free tier) | Free |
| Medium | Automated Slack/email alerts on downtime | Free |
| Low | Synthetic monitoring for critical user flows | Paid |

---

## 7. Monitoring Schedule Summary

| When | What | Script/Tool |
|------|------|------------|
| **Daily** | Business development channels (eTenders, Upwork, Reddit, Bark) | `scripts/daily-monitoring.bat` |
| **Daily** | GSC quick check, Shopify Partners dashboard | `scripts/daily-monitoring.bat` |
| **Weekly** | HTTP 200 checks on all 10 web properties | `scripts/weekly-site-check.bat` |
| **Weekly** | Plausible analytics review | Plausible dashboard |
| **Weekly** | GSC indexing status and coverage | Google Search Console |
| **Weekly** | Shopify Partners installs and reviews | Shopify Partners dashboard |
| **Monthly** | GSC keyword analysis and Core Web Vitals | Google Search Console |
| **Monthly** | Traffic trend analysis | Plausible dashboard |
| **As needed** | Platform alerts (deploy failures, errors) | Email alerts to `mooja77@gmail.com` |

---

## Cross-References

- [40-deployment-procedures.md](40-deployment-procedures.md) — Deployment commands and post-deploy checks
- [../architecture/10-technical-architecture.md](../architecture/10-technical-architecture.md) — Infrastructure and hosting platforms
- [../architecture/11-app-catalogue.md](../architecture/11-app-catalogue.md) — App URLs and domains
- [../architecture/12-website-architecture.md](../architecture/12-website-architecture.md) — Plausible analytics on jmsdevlab.com
- [../architecture/13-infrastructure-and-hosting.md](../architecture/13-infrastructure-and-hosting.md) — Platform details for each service
- [../platforms/50-platform-accounts-registry.md](../platforms/50-platform-accounts-registry.md) — Account details for monitoring platforms
- [../platforms/52-google-services.md](../platforms/52-google-services.md) — Google Search Console property details

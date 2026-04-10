# Master Admin Portal — Agent Dispatch

**Date:** 2026-03-29
**Portal:** https://admin.jmsdevlab.com
**Portal API:** https://jms-admin-portal.mooja77.workers.dev

## Current Status

All 12 apps connected and healthy. Zero test data in portal.

| App | Health | Admin API | Real Users | Issues |
|-----|--------|-----------|------------|--------|
| SmartCash | Healthy | Connected | 0 | None |
| ProfitShield | Healthy | Connected | 0 | None |
| JewelValue | Healthy | Connected | 0 | None |
| RepairDesk | Healthy | Connected | 0 | None |
| SpamShield | Healthy | Connected | 0 | None |
| ThemeSweep | Healthy | Connected | 0 | CI failures (pre-existing) |
| GrowthMap | Healthy | Connected | 0 | None |
| JSM | Healthy | Connected | 1 | GDPR webhooks missing |
| QualCanvas | Healthy | Connected | 0 | CI type errors (fixed) |
| TaxMatch | Healthy | Connected | 0 | US disclosure missing |
| StaffHub | Healthy | Connected | 0 | Shopify review blocked |
| PitchSide | Healthy | Connected | 4 | Users endpoint slow (20s) |

## Critical Rules

1. **Revenue:** Stripe API is the ONLY source of truth. Never trust app-reported MRR.
2. **Users:** Portal's `isTestEmail()` filter (in `worker/src/lib/filter.ts`) is the ONLY source of truth. Never trust app-reported user counts.
3. **Cache:** `dashboard_cache` and `billing_cache` store zeros for user counts and MRR. Only error counts and raw JSON are cached.
4. **Test data:** NEVER show test accounts anywhere in the portal UI.

## For App Agents

Every app's `/api/admin/dashboard` and `/api/admin/billing` endpoints should filter test users before reporting. See standard: `C:\JM Programs\JMS Dev Lab\docs\standards\TEST-USER-FILTER.md`

## Security Issues (Credential Rotation Needed)
1. StaffHub .env: MongoDB production URI with password exposed
2. PitchSide functions/.env: ADMIN_API_KEY exposed
3. stuller_dynamic_config .env: Shopify storefront password exposed

## Shopify Review Blockers
1. StaffHub: 4 issues from review ref 102157
2. TaxMatch: Missing US/IRS geographic requirement
3. JSM: Missing GDPR webhooks

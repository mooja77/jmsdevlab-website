# TaxMatch

**Last Updated:** 2026-03-25

---

## Overview

TaxMatch is a Shopify embedded app designed for US-based Shopify merchants who need to reconcile their Shopify order data against IRS tax filings. It automates the tedious process of matching sales transactions to tax records, identifying discrepancies, and generating reconciliation reports to ensure merchants remain compliant with US federal tax obligations.

The app is US/IRS-specific, which introduces a geographic requirement that must be clearly declared during Shopify app review. TaxMatch is currently in active development and has not yet been submitted to the Shopify App Store.

## Status

- **Phase:** In development (not yet submitted for Shopify review)
- **Audit Score:** 10/16
- **Shopify App Store:** Not submitted
- **GDPR Webhooks:** Commented out in codebase, awaiting Shopify API approval before activation
- **Known Blockers:**
  - Geographic requirements documentation (US/IRS-specific) must be completed before submission
  - GDPR webhook endpoints exist but are disabled pending API access approval from Shopify

## URLs

- **Production URL:** Not yet deployed publicly
- **Marketing Website:** Not yet created

## Local Path

```
C:\JM Programs\TaxMatch
```

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Framework    | Shopify embedded app                    |
| Architecture | Full monorepo                           |
| Language     | TypeScript                              |
| Frontend     | React (Shopify Polaris UI)              |
| Backend      | Node.js / Express                       |
| Database     | PostgreSQL with Prisma ORM              |
| Auth         | Shopify session tokens                  |
| Build        | Turbo (monorepo orchestration)          |

## Architecture

TaxMatch follows the JMS Dev Lab standard monorepo architecture:

```
TaxMatch/
├── apps/
│   ├── shopify/       # Shopify embedded app (Polaris UI)
│   ├── web/           # Standalone web SaaS version
│   └── backend/       # Express API server
├── packages/
│   └── shared/        # Shared types, utilities, constants
├── package.json
└── turbo.json
```

The app operates as a Shopify embedded iframe, authenticating via Shopify session tokens. It pulls order data from the Shopify Admin API and allows merchants to upload or connect IRS filing data for automated matching and reconciliation.

## Key Features

- **Order-to-Tax Matching:** Automatically matches Shopify orders against IRS tax filings using transaction amounts, dates, and reference numbers
- **Discrepancy Detection:** Flags mismatches between reported sales and tax filings with severity levels
- **Reconciliation Reports:** Generates downloadable reports for accountants and tax professionals
- **Tax Period Management:** Organizes data by IRS tax periods (quarterly/annual)
- **Dashboard:** Summary view of reconciliation status across tax periods
- **Multi-Store Support:** Enterprise tier supports reconciliation across multiple Shopify stores

## Pricing Tiers

All plans include a **14-day free trial**. No free tier is offered.

| Plan     | Price      | Features                                     |
|----------|------------|----------------------------------------------|
| Standard | $9.99/mo   | Basic matching, single store, quarterly reports |
| Pro      | $19.99/mo  | Advanced matching, priority discrepancy alerts |
| Premium  | $24.99/mo  | Multi-store, annual reports, accountant export |

## Deployment

- **Hosting:** Not yet deployed to production
- **Target Infrastructure:** Railway (backend API), Shopify CDN (embedded app)
- **CI/CD:** To be configured
- **Environment Variables:** Standard Shopify app credentials (API key, API secret, scopes, host URL)

## Known Gaps

- **GDPR Webhooks (CRITICAL):** The three mandatory Shopify GDPR endpoints (`customers/data_request`, `customers/redact`, `shop/redact`) are coded but commented out. They cannot be activated until Shopify grants API approval. This is a hard blocker for app store submission.
- **Geographic Requirements:** The app is exclusively useful for US merchants filing with the IRS. This must be documented and declared in the Shopify app listing to avoid review rejection.
- **Guided Tour:** No onboarding tour implemented yet (standard requirement per JMS Dev Lab playbook)
- **Tutorial/Onboarding Wizard:** Not yet built
- **Mascot:** No app mascot designed
- **Promo Video:** No promotional video created
- **Screencast:** No walkthrough screencast recorded
- **Marketing Website:** No standalone website exists for the app

## Related Documents

- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- App Instance Instructions: `C:\JM Programs\JMS Dev Lab Website\APP-INSTANCE-INSTRUCTIONS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

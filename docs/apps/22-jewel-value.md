# Jewel Value

**Last Updated:** 2026-03-25

---

## 1. Overview

Jewel Value is a world-class jewellery and watch valuation platform built as a Shopify embedded app with a standalone web SaaS frontend. It enables jewellers, watchmakers, and valuation professionals to create professional valuation certificates with support for 13 languages, 14 currencies, live metal pricing integration, PDF export, and a customer-facing portal where clients can view and download their certificates. The platform is purpose-built for the jewellery retail industry, leveraging domain expertise from Moores Jewellers' decades of experience.

**Target User:** Independent jewellers, watch retailers, valuation professionals, and jewellery appraisers who need to produce standardised, professional valuation certificates for insurance, resale, or customer records.

---

## 2. Status

| Field | Value |
|-------|-------|
| Audit Score | **13/16** |
| Shopify Review | Submitted for review |
| Blockers | Mascot needed, test plan documentation, geographic requirements (has Eircode fields that may need attention for international review) |

---

## 3. URLs

| Resource | URL |
|----------|-----|
| Production (Web) | https://jewelvalue.app |
| YouTube Demo | https://youtu.be/KH6Xv_IyvZM |
| Shopify Listing | Submitted, pending review |
| GitHub | mooja77/valuation-app |

---

## 4. Local Path

```
C:\JM Programs\Valuation App\jewel-value
```

---

## 5. Tech Stack

| Component | Technology |
|-----------|-----------|
| API Backend | NestJS (`@jewel-value/api`) |
| Web Frontend | Next.js (`@jewel-value/web`) with Sentry integration |
| Shared Package | `@jewel-value/shared` -- shared types and utilities |
| Build Orchestration | Turborepo (`turbo.json`) |
| Package Manager | pnpm 9.15.0 (workspace protocol) |
| Language | TypeScript 5.3+ (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma 5.22 |
| Code Quality | Husky + lint-staged, Prettier, ESLint |
| Error Tracking | Sentry (client, server, and edge configs) |
| Hosting | Railway (API), Vercel or similar (web frontend) |

---

## 6. Architecture

Jewel Value is a Turborepo-managed pnpm monorepo with clear separation between the NestJS API backend, Next.js web frontend, and a shared types package.

```
jewel-value/
├── apps/
│   ├── api/              NestJS backend API
│   │   ├── prisma/       Database schema and migrations
│   │   ├── src/          NestJS modules, controllers, services
│   │   ├── test/         E2E and unit tests
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   └── jest.config.ts
│   └── web/              Next.js frontend
│       ├── src/          Pages, components, hooks
│       ├── public/       Static assets
│       ├── sentry.*.config.ts  Sentry integration (client/server/edge)
│       └── next.config.js
├── packages/
│   └── shared/           Shared TypeScript types, constants, utilities
├── turbo.json            Turborepo pipeline configuration
├── pnpm-workspace.yaml   pnpm workspace definition
├── tsconfig.base.json    Shared TypeScript config
├── docker-compose.yml    Local PostgreSQL for development
├── railway.toml          Railway deployment config
└── shopify.app.toml      Shopify app configuration
```

---

## 7. Key Features

- Professional valuation certificate generation
- Support for 13 languages (internationalised UI and certificates)
- Support for 14 currencies with automatic conversion
- Live metal pricing integration (gold, silver, platinum, palladium)
- PDF certificate export with professional formatting
- Customer-facing portal for certificate viewing and download
- Multi-item valuations (jewellery, watches, gemstones)
- Shopify embedded app with App Bridge integration
- Standalone web SaaS mode
- Sentry error tracking across all layers
- Responsive design

---

## 8. Pricing Tiers

| Tier | Price | Features | Billing |
|------|-------|----------|---------|
| Basic | $9.99/mo | Core valuation certificates, standard templates, PDF export | 14-day free trial, then Shopify Billing API / Stripe |
| Professional | $29.99/mo | All languages and currencies, live metal pricing, customer portal | 14-day free trial, then Shopify Billing API / Stripe |
| Enterprise | $59.99/mo | Unlimited valuations, custom branding, priority support, bulk export | 14-day free trial, then Shopify Billing API / Stripe |

---

## 9. Deployment

**Commands:**
```bash
# Install dependencies
pnpm install

# Build all packages (Turborepo)
pnpm build

# Dev servers (Turborepo parallel)
pnpm dev

# Database operations
pnpm db:migrate       # Run Prisma migrations (API)
pnpm db:generate      # Generate Prisma client
pnpm db:seed          # Seed database with sample data

# Testing
pnpm test             # Run all tests
pnpm test:e2e         # E2E tests

# Code quality
pnpm lint             # ESLint across all packages
pnpm format           # Prettier formatting
pnpm format:check     # Check formatting without writing
pnpm typecheck        # TypeScript type checking across all packages
pnpm clean            # Clean all build artifacts and node_modules
```

**API Dev Server:**
```bash
cd apps/api && nest start --watch
```

**Platforms:**
- API: Railway (Dockerfile-based deployment)
- Web: Vercel or similar (Next.js deployment)

**Required Environment Variables:**
- `DATABASE_URL` -- PostgreSQL connection string
- `SHOPIFY_API_KEY` -- Shopify app client ID
- `SHOPIFY_API_SECRET` -- Shopify app client secret
- `SENTRY_DSN` -- Sentry error tracking DSN
- Metal pricing API credentials (for live pricing)

---

## 10. Known Gaps

| Priority | Gap |
|----------|-----|
| Medium | Mascot not yet created |
| Medium | Test plan documentation incomplete |
| Medium | Geographic requirements -- Eircode fields may cause issues for Shopify review (needs internationalisation) |

---

## 11. Related Documents

- Test Plan: `C:\JM Programs\Valuation App\jewel-value\TEST-PLAN.md`
- Jewel Value docs: `C:\JM Programs\Valuation App\jewel-value\docs\`
- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

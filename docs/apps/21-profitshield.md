# ProfitShield

**Last Updated:** 2026-03-25

---

## 1. Overview

ProfitShield is a real-time order profitability validation platform for Shopify merchants. It operates as both a Shopify embedded app and a standalone web SaaS, protecting merchants from unprofitable orders by validating profitability at checkout and automatically blocking or flagging orders that fall below configurable margin thresholds. The Shopify Function (written in Rust) executes directly within Shopify's checkout pipeline for zero-latency validation, while the web dashboard provides comprehensive profit analysis, order review, and cost management tools.

**Target User:** Shopify merchants who sell products with variable costs (shipping, discounts, returns) and need automated guardrails to prevent unprofitable transactions at the point of sale.

---

## 2. Status

| Field | Value |
|-------|-------|
| Audit Score | **14/16** |
| Shopify Review | Submitted for review |
| Blockers | Promo video script needed; clarify free tier vs 14-day trial policy |

---

## 3. URLs

| Resource | URL |
|----------|-----|
| Production (Web) | https://profitshield.app |
| Shopify Listing | Submitted, pending review |
| GitHub | mooja77/ProfitShield |

---

## 4. Local Path

```
C:\JM Programs\ProfitShield
```

---

## 5. Tech Stack

| Component | Technology |
|-----------|-----------|
| Web App | Next.js 15 (`@profitshield/web`) |
| Shopify App | Remix + Polaris + App Bridge (`@profitshield/shopify`) |
| Backend | Express.js (`@profitshield/backend`) |
| Shopify Function | Rust (checkout validation) |
| Language | TypeScript (strict mode) + Rust |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Shopify session token validation (embedded), JWT bearer token (web) |
| Shared Logic | `@profitshield/shared` -- pure profit math functions, types, constants |
| Hosting | Vercel (Project ID: prj_7h8w6zF2IsAxnCii2u4CJPdt2Nu4) |
| Backend Hosting | Railway |

---

## 6. Architecture

ProfitShield is a monorepo using npm workspaces. A single Express backend serves both frontends with a unified `resolveShop` middleware that normalises Shopify and web authentication into a common `req.shop` object.

```
ProfitShield/
├── apps/
│   ├── backend/            Express API server (@profitshield/backend)
│   ├── shopify/            Remix embedded Shopify app (@profitshield/shopify)
│   ├── shopify-function/   Rust Shopify Function for checkout validation
│   └── web/                Next.js 15 standalone web app (@profitshield/web)
├── packages/
│   └── shared/             Shared types, constants, profit math (@profitshield/shared)
├── deploy-pages/
├── docs/
├── Dockerfile
└── docker-compose.yml
```

**Auth Architecture:**
- **Shopify path:** Session token validation --> resolves Shop by `shopifyDomain`
- **Web path:** JWT bearer token --> resolves Shop by `webUserId`
- **Shared routes** (`/api/*`): dashboard, orders, settings, products
- **Platform-specific routes:** `/shopify/*` (OAuth, webhooks), `/web/*` (register, login, import)

---

## 7. Key Features

- Real-time order validation at Shopify checkout via Rust Shopify Function
- Automatic blocking of unprofitable orders before they complete
- Configurable margin rules and profit thresholds per product or category
- Comprehensive profit analysis dashboard
- Order-level profitability breakdown (cost, shipping, discounts, returns)
- Product cost management and import
- AI-powered profit insights
- What-if order simulator
- Dark mode support
- Dual-mode: Shopify embedded + standalone web SaaS (shared data layer)
- Polaris UI (Shopify) / Tailwind UI (web)
- Customer profitability analysis

---

## 8. Pricing Tiers

| Tier | Price | Features | Billing |
|------|-------|----------|---------|
| Starter | $19/mo | Core order validation, basic dashboard, up to N orders/mo | 14-day free trial, then Shopify Billing API / Stripe |
| Pro | $49/mo | Advanced rules, AI insights, full reporting | 14-day free trial, then Shopify Billing API / Stripe |
| Business | $149/mo | Unlimited orders, simulator, priority support | 14-day free trial, then Shopify Billing API / Stripe |

> **Note:** The portfolio previously listed a free tier (100 orders/mo). JMS Dev Lab policy is 14-day trial only, no free tier. This needs to be reconciled in the app.

---

## 9. Deployment

**Commands:**
```bash
# Build all workspaces (build shared first)
npm run build:shared
npm run build

# Database
npm run db:migrate
npm run db:seed
npm run db:studio

# Dev servers
npm run dev:backend    # Express API
npm run dev:web        # Next.js web app
npm run dev:shopify    # Shopify Remix app

# Tests
npm test
```

**Platforms:**
- Frontend (web): Vercel (auto-deploy on push)
- Backend: Railway (Dockerfile-based)
- Shopify Function: Deployed via Shopify CLI as part of app extension

**Required Environment Variables:**
- `DATABASE_URL` -- PostgreSQL connection string
- `SHOPIFY_API_KEY` -- Shopify app client ID
- `SHOPIFY_API_SECRET` -- Shopify app client secret
- `JWT_SECRET` -- JWT signing secret for web auth
- `SESSION_SECRET` -- Express session secret
- `FRONTEND_URL` -- Web frontend origin
- `APP_URL` -- Backend URL

---

## 10. Known Gaps

| Priority | Gap |
|----------|-----|
| Medium | Promo video script not yet written |
| Medium | Free tier vs 14-day trial policy needs clarification and enforcement |

---

## 11. Related Documents

- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- ProfitShield docs: `C:\JM Programs\ProfitShield\docs\`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

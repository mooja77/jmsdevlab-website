# ThemeSweep

**Last Updated:** 2026-03-25

---

## 1. Overview

ThemeSweep finds and removes dead code left behind by uninstalled apps, unused scripts, and orphaned files in Shopify themes. It scans a store's live theme, identifies leftover code with confidence scoring, and safely cleans it up with full backup and rollback support. The app improves store performance by eliminating bloat that accumulates over time as merchants install and uninstall third-party apps. ThemeSweep features "Sweepy," a branded mascot character with a defined character guide.

**Target User:** Shopify store owners and developers who want to optimise their theme performance by identifying and removing dead code, orphaned scripts, and remnants of previously uninstalled apps.

---

## 2. Status

| Field | Value |
|-------|-------|
| Audit Score | **12/16** |
| Shopify Review | Submitted (status pending) |
| Blockers | JMS Dev Lab footer needed, promo video script, screencast |

---

## 3. URLs

| Resource | URL |
|----------|-----|
| Production (Shopify App) | https://app.themesweep.app |
| Marketing Website | themesweep.com (Railway) |
| Backend API | Railway |
| GitHub | mooja77/themesweep |

---

## 4. Local Path

```
C:\JM Programs\Theme Sweep
```

---

## 5. Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Cache / Queue Backing | Redis 7 |
| Job Queue | BullMQ (scan jobs, email delivery, scheduled tasks, backup cleanup, monthly reset) |
| Shopify App | Remix + Polaris + App Bridge |
| Web App (SaaS) | React 18 + Vite + Tailwind CSS + Radix UI (shadcn/ui) |
| Marketing Site | React + Vite |
| Shared Package | TypeScript types (40+ interfaces) and utilities |
| Auth | JWT + refresh tokens, Google OAuth, Shopify OAuth |
| Billing | Stripe (web), Shopify Billing API (embedded) |
| Email | Resend API |
| Node Requirement | >= 20.10.0 |
| Deployment | Railway (backend, shopify, website), Vercel (web) |

---

## 6. Architecture

ThemeSweep is a monorepo using npm workspaces with four application packages and one shared library.

```
themesweep/
├── apps/
│   ├── backend/          Express + Prisma + BullMQ -- API, scan engine, workers
│   │   ├── src/
│   │   │   ├── routes/          8 API routers (auth, scan, cleanup, store, webhooks, billing)
│   │   │   ├── services/        6 services (scanner, cleanup, billing, email, health score)
│   │   │   ├── workers/         5 BullMQ workers (scan, auto-scan, email, backup cleanup, monthly reset)
│   │   │   ├── middleware/      Auth, rate limiting, request logging
│   │   │   ├── lib/             Prisma, Redis, cache, queue, Shopify client, audit logging
│   │   │   └── __tests__/       57+ test files with fixtures and e2e tests
│   │   └── prisma/              14 models, 8 migrations
│   ├── shopify/          Remix + Polaris -- Shopify embedded app
│   │   └── app/
│   │       ├── routes/          5 routes (dashboard, scan, cleanup, history, settings)
│   │       ├── components/      12 Polaris components
│   │       └── lib/             API client, auth, tour definitions
│   ├── web/              React + Vite + shadcn/ui -- standalone web SaaS
│   │   └── src/
│   │       ├── routes/          12 routes (auth, dashboard, scan, cleanup, settings, history)
│   │       ├── components/      30+ shadcn/ui + domain components
│   │       ├── hooks/           7 custom hooks (useQuery, usePoll, useAnimatedNumber, etc.)
│   │       ├── context/         Auth, Theme, Tour contexts
│   │       └── lib/             API, auth, theme, export utilities
│   └── website/          React + Vite -- marketing site (themesweep.com)
├── packages/
│   └── shared/           TypeScript types (40+ interfaces) and utilities
│       └── src/
│           ├── types.ts
│           └── utils.ts  (formatBytes, etc.)
├── docker-compose.yml    PostgreSQL + Redis for development
├── railway.toml          Backend Railway config
├── railway-shopify.toml  Shopify app Railway config
├── railway-web.toml      Web app Railway config
├── railway-website.toml  Marketing site Railway config
└── shopify.app.toml      Shopify app configuration
```

**Mascot:** "Sweepy" -- defined in `CHARACTER-GUIDE.md`

---

## 7. Key Features

- Theme dead code scanning with confidence scoring
- Automatic identification of remnants from uninstalled apps
- Safe cleanup with full backup and one-click rollback
- Theme health score assessment
- Scan history and audit logging
- BullMQ-powered background scan jobs (auto-scan scheduling)
- Backup cleanup and monthly usage reset workers
- Email notifications via Resend
- Dark mode support
- Guided product tour
- Dual-mode: Shopify embedded (Polaris) + standalone web SaaS (shadcn/ui)
- Marketing website with landing pages

---

## 8. Pricing Tiers

Pricing tiers are managed via Stripe (web) and Shopify Billing API (embedded). Specific tier names and prices are configured within the billing service. Standard JMS Dev Lab 14-day free trial applies.

---

## 9. Deployment

**Local Development:**
```bash
# Install dependencies
npm install

# Start databases (PostgreSQL + Redis)
docker-compose up -d

# Configure environment
cp .env.example apps/backend/.env
# Edit apps/backend/.env with required values

# Run database migrations
cd apps/backend && npx prisma migrate deploy

# Start dev servers (each in separate terminal)
cd apps/backend && npm run dev     # API on port 3001
cd apps/shopify && npm run dev     # Shopify app on port 3002
cd apps/web && npm run dev         # Web app on port 3003
cd apps/website && npm run dev     # Marketing site on port 3004
```

**Testing:**
```bash
cd apps/backend && npx jest --verbose    # Backend tests (57+ test files)
cd apps/web && npx vitest run            # Frontend tests
cd packages/shared && npx jest           # Shared package tests
cd apps/backend && npx tsc --noEmit      # TypeScript check
cd apps/shopify && npx tsc --noEmit
cd apps/web && npx tsc --noEmit
```

**Production Deployment:**
- Backend: Railway (auto-deploys on push to master)
- Shopify App: Railway
- Web App: Vercel (`vercel deploy --prebuilt --prod`)
- Marketing Site: Railway

**Required Environment Variables:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `SHOPIFY_API_KEY` | Shopify app client ID |
| `SHOPIFY_API_SECRET` | Shopify app client secret |
| `APP_URL` | Backend URL (e.g., https://api.themesweep.com) |
| `FRONTEND_URL` | Shopify app URL |
| `WEB_FRONTEND_URL` | Web SaaS URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `RESEND_API_KEY` | Resend email API key |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

---

## 10. Known Gaps

| Priority | Gap |
|----------|-----|
| Medium | JMS Dev Lab footer not yet added |
| Medium | Promo video script not yet written |
| Medium | Screencast / product walkthrough not recorded |

---

## 11. Related Documents

- Character Guide (Sweepy mascot): `C:\JM Programs\Theme Sweep\CHARACTER-GUIDE.md` (if present in docs/)
- ThemeSweep docs: `C:\JM Programs\Theme Sweep\docs\`
- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

# SpamShield

**Last Updated:** 2026-03-25

---

## 1. Overview

SpamShield is an intelligent spam filtering SaaS for website contact forms and Shopify stores. It provides a multi-layered detection engine that analyses incoming form submissions for spam indicators including content analysis, geo-detection, pattern matching, and optionally AI-powered classification via Anthropic's API. The platform features a real-time dashboard, audit logging, quarantine management with release/block workflows, and a one-line JavaScript embed for integration into any website. It operates as both a Shopify embedded app and a standalone web SaaS.

**Target User:** Shopify merchants and website owners who receive spam through their contact forms, product reviews, or other user-generated content areas and need automated filtering with manual review capabilities.

---

## 2. Status

| Field | Value |
|-------|-------|
| Audit Score | **11/16** |
| Shopify Review | Not yet submitted |
| Blockers | **CRITICAL: Billing not enforced** -- pricing tiers are displayed but payment is not actually collected. Mascot, promo video, and screencast also needed. |

---

## 3. URLs

| Resource | URL |
|----------|-----|
| Backend API | Railway deployment |
| Web Dashboard | Vercel (Project ID: prj_gvGWdPFwByuK7h3UcRo5uVNJMhjW) |
| Shopify Listing | Not yet submitted |
| GitHub | mooja77/SpamShield |

---

## 4. Local Path

```
C:\JM Programs\Spam Shield
```

---

## 5. Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Express.js, TypeScript |
| Frontend (Web SaaS) | React 18 + Vite + Tailwind CSS |
| Shopify App | Remix (App Bridge compatible) |
| Language | TypeScript |
| Database | PostgreSQL |
| Cache / Rate Limiting | Redis |
| ORM | Prisma |
| Auth | JWT (7-day tokens) + Google OAuth, dual-auth compatible with Shopify HMAC |
| AI Detection | Anthropic API (optional, BYOK) |
| Email | SMTP (Ethereal in dev) |
| Embed | JavaScript snippet loaded on customer sites |
| Frontend Hosting | Vercel (Project ID: prj_gvGWdPFwByuK7h3UcRo5uVNJMhjW) |
| Backend Hosting | Railway (Docker) |
| Monorepo | npm workspaces with shared types package |

---

## 6. Architecture

SpamShield is a monorepo using npm workspaces with three application packages, a shared types library, and Shopify extensions.

```
Spam Shield/
├── apps/
│   ├── backend/          Express API server
│   │   ├── src/
│   │   │   ├── routes/          API route handlers
│   │   │   ├── middleware/      Auth, rate limit, error handling
│   │   │   ├── services/        Email, audit, spam detection engine
│   │   │   ├── jobs/            Background jobs (digest, archive)
│   │   │   └── lib/             DB, Redis, logger, env validation
│   │   ├── prisma/              Schema and migrations
│   │   ├── docker-entrypoint.sh
│   │   └── vitest.config.ts
│   ├── web/              React SPA (SaaS dashboard)
│   │   └── src/
│   │       ├── pages/           Route pages
│   │       ├── components/      Shared UI components
│   │       ├── context/         React context (auth)
│   │       └── lib/             API client, error tracking
│   └── shopify/          Shopify embedded app (Remix)
│       ├── app/
│       └── vite.config.ts
├── packages/
│   └── shared/           Shared TypeScript types
├── extensions/
│   ├── spam-shield/      Shopify app extension
│   └── spam-shield-flow/ Shopify Flow extension
├── assets/               Static assets
├── Dockerfile
└── docker-compose.yml    PostgreSQL + Redis for development
```

**Detection Architecture:**
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  React SPA   │────>│  Express API │────>│  PostgreSQL  │
│  (Vercel)    │     │  (Railway)   │     │  + Redis     │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                     ┌─────┴─────┐
                     │  Embed JS │  (loaded on customer sites)
                     └───────────┘
```

---

## 7. Key Features

- Multi-layered spam detection engine (content analysis, pattern matching, geo-detection)
- Optional AI-powered detection via Anthropic API (BYOK)
- Real-time dashboard with spam statistics and trends
- Message inbox with search and filtering
- Quarantine system with release/block workflows
- Bulk actions on messages (approve, block, delete)
- Detailed spam signal breakdown per message
- Audit logging with filtering
- Test mode for validating configuration
- Dark mode support across all views
- Settings management with save confirmation
- One-line JavaScript embed for website integration
- Background jobs for digest emails and archive management
- Shopify Flow extension for automated workflows
- Security headers (HSTS, X-Frame-Options, CSP) on Vercel

---

## 8. Pricing Tiers

| Tier | Price | Features | Billing |
|------|-------|----------|---------|
| Starter | $9/mo | Core spam filtering, basic dashboard | **NOT ENFORCED** -- displayed but no payment collected |
| Pro | $29/mo | Advanced detection, AI classification, full audit log | **NOT ENFORCED** |
| Enterprise | $99/mo | Unlimited sites, priority support, custom rules | **NOT ENFORCED** |

> **CRITICAL:** Billing is displayed in the UI but not actually enforced. This must be resolved before the app can generate revenue.

---

## 9. Deployment

**Local Development:**
```bash
# Install dependencies
npm install

# Start databases (PostgreSQL + Redis)
docker compose up -d

# Configure environment
cp .env.example .env
# Edit .env: DATABASE_URL, SAAS_JWT_SECRET, SESSION_SECRET (minimum)

# Run migrations and seed
npm run db:migrate
npm run db:seed

# Start dev servers
npm run dev                              # Backend on :3001
npm run dev --workspace=apps/web         # Frontend on :3002
```

**Testing:**
```bash
npm test                     # All tests (251 tests)
npm run test:coverage        # With coverage report
cd apps/web && npx tsc --noEmit    # TypeScript check
npm run test:e2e             # E2E tests
```

**Production:**
- Backend: Railway (auto-deploys on push to `main` via Dockerfile; set `RUN_MIGRATIONS=true` on primary instance only)
- Frontend: Vercel (auto-deploys on push to `main`; API proxy rewrites to Railway, SPA fallback routing)

**Required Environment Variables:**

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SAAS_JWT_SECRET` | Yes | Secret for signing JWTs |
| `SESSION_SECRET` | Yes | Express session secret |
| `REDIS_URL` | Recommended | Redis URL for rate limiting, caching |
| `SAAS_FRONTEND_URL` | Recommended | Frontend URL (default: localhost:3002) |
| `SAAS_BACKEND_URL` | Recommended | Backend URL (default: localhost:3001) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `SMTP_HOST` | Optional | SMTP server for emails |
| `SMTP_PORT` | Optional | SMTP port (default: 587) |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASS` | Optional | SMTP password |
| `ANTHROPIC_API_KEY` | Optional | For AI-powered detection |
| `RUN_MIGRATIONS` | Docker only | Set `true` on primary replica |

---

## 10. Known Gaps

| Priority | Gap |
|----------|-----|
| **CRITICAL** | Billing not enforced -- pricing tiers displayed but payment not collected |
| Medium | Mascot not yet created |
| Medium | Promo video not recorded |
| Medium | Screencast / product walkthrough not recorded |

---

## 11. Related Documents

- SpamShield docs: `C:\JM Programs\Spam Shield\docs\` (if present)
- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

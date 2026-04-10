# SmartCash

**Last Updated:** 2026-03-25

---

## 1. Overview

SmartCash is an enterprise-grade cashflow management application built as a Shopify embedded app with a standalone web SaaS counterpart. It provides Shopify merchants and independent retailers with real-time cashflow visibility, AI-powered ARIMA forecasting, what-if scenario modelling, and a comprehensive suite of over 15 financial reports exportable in PDF, Excel, CSV, and JSON formats. The executive dashboard aggregates financial data across multiple branches with currency normalisation, enabling merchants to make data-driven decisions about their cash position.

**Target User:** Shopify store owners, multi-location retailers, and small-to-medium business operators who need professional cashflow forecasting and financial reporting without enterprise-level accounting software.

---

## 2. Status

| Field | Value |
|-------|-------|
| Audit Score | **15/16** (gold standard -- highest across all JMS Dev Lab apps) |
| Shopify Review | Submitted for review |
| Blockers | None known; awaiting Shopify review decision |

---

## 3. URLs

| Resource | URL |
|----------|-----|
| Production (Web) | https://smartcashapp.net |
| Backend API | Railway deployment |
| YouTube Promo | https://youtu.be/I3H5M6jL-9A |
| YouTube Tour | https://youtu.be/w2OKtOTmDiE |
| Shopify Listing | Submitted, pending review |
| GitHub | mooja77/CashFlowAppV2 |

---

## 4. Local Path

```
C:\JM Programs\Smart Cash
```

---

## 5. Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | Next.js 15 (App Router) + React 19 |
| State Management | TanStack Query |
| Backend | Express.js / Node.js |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma |
| Forecasting | ARIMA (arima npm package) -- Seasonal ARIMA(0,1,1) model |
| Auth | HttpOnly cookies (access token 15m, refresh token 7d), Shopify session tokens |
| Reporting | PDF, Excel (XLSX), CSV, JSON export |
| Frontend Hosting | Vercel (Project ID: prj_F2fzxHJAz9AMlMskExlF3QGc0SmH) |
| Backend Hosting | Railway |
| Shopify Integration | Shopify App Bridge, OAuth, session token validation |

---

## 6. Architecture

SmartCash is a monorepo using npm workspaces. A single Express backend serves both the Shopify embedded app and the standalone web SaaS frontend.

```
Smart Cash/
├── apps/
│   ├── backend/          Express API -- Prisma, forecasting, reporting services
│   ├── frontend/         Next.js 15 (App Router) dashboard and UI
│   ├── shopify/          Shopify embedded app (Remix + Polaris)
│   └── website/          Marketing / landing page site
├── packages/
│   └── shared/           Shared TypeScript types, constants, utilities
├── Dockerfile
├── commitlint.config.js
└── README.md
```

**Authentication Flow:**
1. Login: `POST /auth/login` -- backend sets `accessToken` (15m) and `refreshToken` (7d) as HttpOnly cookies
2. Requests: Frontend sends requests with `credentials: 'include'`; browser automatically attaches cookies
3. Refresh: Frontend silently calls `/auth/refresh` to rotate cookies before expiry

---

## 7. Key Features

- Executive dashboard with real-time cashflow overview
- Shopify order sync and data import
- ARIMA-powered cashflow forecasting (seasonal model, replaces linear projection)
- What-if scenario modelling for business decisions
- 15+ built-in financial reports (Cash Flow Statement, P&L, Executive Summary, Forecast Accuracy)
- Multi-format export: PDF, Excel (XLSX), CSV, JSON
- Multi-branch data aggregation with currency normalisation
- Dark mode support
- HttpOnly cookie authentication (XSS-mitigated)
- Guided product tour and onboarding
- Responsive design across desktop and mobile
- Dual-mode: Shopify embedded + standalone web SaaS (shared data)

---

## 8. Pricing Tiers

| Tier | Price | Features | Billing |
|------|-------|----------|---------|
| Starter | $9.99/mo | Core dashboard, basic forecasting, standard reports | 14-day free trial, then Shopify Billing API / Stripe |
| Professional | $24.99/mo | Advanced ARIMA forecasting, all report templates, what-if scenarios | 14-day free trial, then Shopify Billing API / Stripe |
| Enterprise | $49.99/mo | Multi-branch support, currency normalisation, priority support, full export suite | 14-day free trial, then Shopify Billing API / Stripe |

---

## 9. Deployment

**Frontend (Vercel):**
```bash
# Automatic deployment on push to master via Vercel Git integration
# Manual: vercel deploy --prebuilt --prod
```

**Backend (Railway):**
```bash
# Automatic deployment on push via Railway + Dockerfile
# Database migrations:
cd apps/backend && npm run db:setup
```

**Local Development:**
```bash
# Install dependencies
npm install
cd apps/backend && npm install

# Database setup
cd apps/backend && npm run db:setup

# Start dev servers
npm run dev
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
```

**Required Environment Variables:**
- `DATABASE_URL` -- PostgreSQL connection string
- `SHOPIFY_API_KEY` -- Shopify app client ID
- `SHOPIFY_API_SECRET` -- Shopify app client secret
- `SESSION_SECRET` -- Express session secret
- `JWT_SECRET` -- JWT signing secret
- `FRONTEND_URL` -- Frontend origin for CORS
- `VERCEL_URL` -- Vercel deployment URL

---

## 10. Known Gaps

| Priority | Gap |
|----------|-----|
| -- | No significant gaps identified (gold standard at 15/16) |

---

## 11. Related Documents

- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- App Instance Instructions: `C:\JM Programs\JMS Dev Lab Website\APP-INSTANCE-INSTRUCTIONS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`
- Feature Roadmap: `C:\JM Programs\Smart Cash\FEATURE_ROADMAP.md`
- Improvement Plan: `C:\JM Programs\Smart Cash\IMPROVEMENT_PLAN.md`

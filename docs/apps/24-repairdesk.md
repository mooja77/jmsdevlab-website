# RepairDesk

**Last Updated:** 2026-03-25

---

## 1. Overview

RepairDesk is a Shopify embedded app for managing repair tickets, purpose-built for jewellers and watchmakers but designed with a multi-vertical architecture that can serve any repair-based business. It provides a complete repair ticket pipeline from intake through completion, with quote generation, photo documentation, SMS notifications to customers, parts inventory tracking, and multi-language support. The app combines a robust Express/Prisma backend with a React/Vite frontend using Shopify Polaris for the embedded experience.

**Target User:** Jewellers, watchmakers, electronics repair shops, and any retail business that takes in customer items for repair and needs to track jobs, communicate with customers, and manage parts inventory.

---

## 2. Status

| Field | Value |
|-------|-------|
| Audit Score | **11/16** |
| Shopify Review | Submitted for review |
| Blockers | GDPR webhooks (CRITICAL -- must be implemented for Shopify compliance), monorepo migration needed |

---

## 3. URLs

| Resource | URL |
|----------|-----|
| Production | https://repairdeskapp.net |
| Shopify Listing | Submitted, pending review |
| GitHub | mooja77/RepairDesk |

---

## 4. Local Path

```
C:\JM Programs\Repair Desk
```

---

## 5. Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Express.js + TypeScript |
| Frontend | React + Vite + Shopify Polaris |
| Language | TypeScript |
| Database | PostgreSQL (Docker container `repairdesk-db`, port 5434) |
| ORM | Prisma |
| Auth | Shopify session tokens (embedded) |
| Testing | Vitest (backend), Vite (frontend) |
| Hosting | Railway (backend + frontend) |
| Containerisation | Docker + Docker Compose |

---

## 6. Architecture

RepairDesk is currently a two-directory structure (not yet a full monorepo -- this is an identified gap). The backend and frontend are separate npm projects within the same repository.

```
Repair Desk/
├── backend/              Express API server
│   ├── src/              Route handlers, middleware, services
│   ├── prisma/           Database schema and migrations
│   ├── dist/             Compiled output
│   ├── boot.js           Application bootstrap
│   ├── vitest.config.ts
│   └── package.json
├── frontend/             React + Vite SPA
│   ├── src/              Components, pages, hooks
│   ├── public/           Static assets
│   ├── dist/             Production build
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── docs/
│   └── app-store-listing.md
├── e2e-screenshots/      End-to-end test screenshots
├── cf-proxy/             Cloudflare proxy configuration
├── Dockerfile
├── docker-compose.yml    PostgreSQL container (port 5434)
└── logs/
```

---

## 7. Key Features

- Repair ticket pipeline (intake, assessment, quoting, in-progress, complete, collected)
- Quote generation and customer approval workflow
- Photo documentation attached to repair tickets
- SMS notifications to customers at each stage
- Parts inventory management and tracking
- Multi-language support: English, French, Spanish (i18n)
- Repair history per customer
- Search and filter across all tickets
- Pagination and sorting
- Responsive design for desktop and mobile
- Landing page with hero, features, pricing, FAQ sections
- Dark mode support
- Mobile-responsive login, registration, and pricing views

---

## 8. Pricing Tiers

| Tier | Price | Features | Billing |
|------|-------|----------|---------|
| Starter | $9.99/mo | Core ticket management, basic reporting | 14-day free trial, then Shopify Billing API |
| Professional | $19.99/mo | Photo documentation, SMS notifications, parts inventory | 14-day free trial, then Shopify Billing API |
| Business | $29.99/mo | Multi-language, advanced reporting, priority support | 14-day free trial, then Shopify Billing API |

---

## 9. Deployment

**Local Development:**
```bash
# Start PostgreSQL container
docker compose up -d

# Install dependencies
cd backend && npm install
cd frontend && npm install

# Run database migrations
cd backend && npx prisma migrate dev

# Seed sample data
cd backend && npx prisma db seed

# Start both servers
npm run dev

# Visual database browser
cd backend && npx prisma studio
```

**API Port:** 3005

**Production (Railway):**
- Deployed via Dockerfile on Railway
- Auto-deploys on push to master

**Required Environment Variables:**
- `DATABASE_URL` -- PostgreSQL connection string
- `SHOPIFY_API_KEY` -- Shopify app client ID
- `SHOPIFY_API_SECRET` -- Shopify app client secret
- `SESSION_SECRET` -- Express session secret
- `APP_URL` -- Backend URL
- SMS provider credentials (for customer notifications)

---

## 10. Known Gaps

| Priority | Gap |
|----------|-----|
| **CRITICAL** | GDPR webhooks not implemented (mandatory for Shopify app review) |
| High | Needs migration to standard monorepo structure (apps/backend, apps/shopify, packages/shared) |
| Medium | Mascot not yet created |
| Medium | Promo video and screencast not recorded |

---

## 11. Related Documents

- App Store Listing: `C:\JM Programs\Repair Desk\docs\app-store-listing.md`
- RepairDesk docs: `C:\JM Programs\Repair Desk\docs\`
- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

# 10 — Technical Architecture

> **Last Updated:** 2026-03-25
> **Maintainer:** John Moore (john@jmsdevlab.com)
> **Status:** LIVE

---

## Overview

JMS Dev Lab builds and operates 12 software products — 7 Shopify embedded apps, 3 standalone web apps, 1 mobile app, and 1 static portfolio site. This document describes the system-wide technical architecture, shared patterns, and infrastructure decisions that apply across the entire portfolio.

---

## 1. Core Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Language** | TypeScript | Used everywhere — frontend, backend, mobile, scripts |
| **Frontend frameworks** | React, Next.js | Next.js for SSR/SSG apps; React for Shopify embedded (Polaris) |
| **Backend frameworks** | Express.js, NestJS | Express for most apps; NestJS for structured backends |
| **ORMs** | Prisma, Mongoose | Prisma for PostgreSQL; Mongoose for MongoDB (StaffHub only) |
| **Databases** | PostgreSQL, MongoDB, Firebase Realtime DB, Supabase, WatermelonDB, Cloudflare D1 | See [14-database-systems.md](14-database-systems.md) |
| **Mobile** | React Native (Expo) | Vegrify only |
| **API style** | REST, Shopify GraphQL | Shopify Admin API via GraphQL; internal APIs via REST |
| **Billing** | Shopify Billing API (GraphQL), Stripe | See [15-authentication-and-billing.md](15-authentication-and-billing.md) |
| **Auth** | Shopify Session Tokens, Google OAuth, Firebase Auth, Supabase Auth | See [15-authentication-and-billing.md](15-authentication-and-billing.md) |
| **CSS** | Shopify Polaris, Tailwind CSS, vanilla CSS | Polaris for Shopify apps; Tailwind or vanilla for standalone |

---

## 2. Standard Monorepo Pattern

**9 of 12 apps** use a monorepo structure. The standard layout is:

```
app-name/
├── apps/
│   ├── shopify/          # Shopify embedded frontend (React + Polaris)
│   ├── web/              # Public marketing website (static HTML or Next.js)
│   ├── backend/          # Express or NestJS API server
│   └── frontend/         # Standalone frontend (where applicable)
├── packages/
│   └── shared/           # Shared types, utils, constants
├── package.json          # Root workspace config
├── turbo.json            # Turborepo config (where used)
└── .env                  # Environment variables (gitignored)
```

### Apps Using Monorepos

| App | Monorepo | Notes |
|-----|----------|-------|
| SmartCash | Yes | `apps/shopify`, `apps/web`, `apps/backend` |
| ProfitShield | Yes | `apps/shopify`, `apps/backend` |
| Jewel Value | Yes | `apps/shopify`, `apps/backend` |
| ThemeSweep | Yes | `apps/shopify`, `apps/backend` |
| RepairDesk | Yes | `apps/shopify`, `apps/backend` |
| SpamShield | Yes | `apps/shopify`, `apps/backend` |
| GrowthMap | Yes | `apps/web`, `apps/backend` |
| QualCanvas | Yes | `apps/frontend`, `apps/backend` |
| Vegrify | Yes | `apps/mobile`, `apps/api` |
| JSM | No | Single Next.js project |
| StaffHub | No | Separate frontend/backend repos |
| Pitch Side | No | Single React Native project |

---

## 3. Network and Infrastructure

### DNS and CDN

| Component | Provider | Details |
|-----------|----------|---------|
| **DNS** | Cloudflare | All domains managed through Cloudflare |
| **SSL** | Cloudflare | Auto-managed, Universal SSL on all domains |
| **CDN** | Cloudflare | Automatic for all Cloudflare Pages sites |
| **DDoS** | Cloudflare | Default protection on all domains |

### Hosting Platforms

| Platform | Apps Hosted | Purpose |
|----------|-----------|---------|
| **Cloudflare Pages** | jmsdevlab.com, JSM website, StaffHub website, SmartCash website, QualCanvas frontend | Static site hosting |
| **Railway** | SmartCash, RepairDesk, Jewel Value, QualCanvas backend | Backend hosting + PostgreSQL |
| **Vercel** | ProfitShield, GrowthMap | Full-stack hosting (Next.js) |
| **Shopify** | 7 Shopify apps (embedded frontends) | Embedded app hosting |
| **Firebase** | Pitch Side | Auth + Realtime DB |
| **Supabase** | GrowthMap | Auth + PostgreSQL |
| **Cloudflare Workers/D1** | Vegrify API | Edge compute + SQLite |

For full hosting details, see [13-infrastructure-and-hosting.md](13-infrastructure-and-hosting.md).

---

## 4. Third-Party Integrations

| Service | Purpose | Apps Using It |
|---------|---------|---------------|
| **Shopify Admin API** (GraphQL) | Store data, orders, products, metafields | SmartCash, ProfitShield, Jewel Value, ThemeSweep, RepairDesk, SpamShield, GrowthMap |
| **Shopify Billing API** (GraphQL) | Subscription billing for Shopify apps | SmartCash, ProfitShield, Jewel Value, ThemeSweep, RepairDesk, SpamShield |
| **Stripe** | Payment processing for standalone apps | QualCanvas, JSM (standalone) |
| **Google OAuth** | User authentication | JSM, Jewel Value |
| **MailerLite** | Email marketing, newsletter, welcome drip | jmsdevlab.com |
| **Plausible Analytics** | Privacy-friendly analytics | jmsdevlab.com (installed March 2026) |
| **Google ML Kit** | Image recognition (vegan label scanning) | Vegrify |
| **Cloudflare Email Routing** | Email forwarding | jmsdevlab.com domain emails |

---

## 5. Security Architecture

### Principles

1. **No secrets in repositories** — All sensitive values stored as environment variables per platform
2. **GDPR compliance** — Privacy policies, data processing agreements, right-to-erasure support
3. **Shop-scoped data isolation** — Shopify apps isolate data by shop domain, preventing cross-tenant access
4. **HTTPS everywhere** — All traffic encrypted via Cloudflare Universal SSL

### Secret Management

| Platform | Secret Storage |
|----------|---------------|
| Railway | Environment variables in project settings |
| Vercel | Environment variables in project settings |
| Shopify | Environment variables in app config |
| Cloudflare | Workers secrets / Pages environment variables |
| Firebase | Firebase config (client-side safe) + service account keys (server-side) |
| Supabase | Environment variables (anon key client-side, service key server-side) |

### Security Incident History

| Date | Incident | Resolution | Reference |
|------|----------|------------|-----------|
| 2026-03-21 | Exposed API keys committed to Git | Removed secrets, updated `.gitignore`, rotated keys | Commit `3a86f58` |

### Key Security Practices

- `.env` files are always `.gitignored`
- API keys rotated after any suspected exposure
- Shopify App Bridge session tokens validated server-side
- CORS configured per-app to restrict origins
- Rate limiting on public API endpoints

---

## 6. Development Environment

| Tool | Purpose |
|------|---------|
| **VS Code** | Primary IDE |
| **Claude Code** | AI-assisted development |
| **Node.js 18+** | Runtime |
| **npm** | Package manager |
| **Git** | Version control (GitHub) |
| **Wrangler CLI** | Cloudflare Pages/Workers deployment |
| **Railway CLI** | Railway deployment (optional, mostly git-push) |

---

## Cross-References

- [11-app-catalogue.md](11-app-catalogue.md) — Individual app details, URLs, pricing, audit scores
- [12-website-architecture.md](12-website-architecture.md) — jmsdevlab.com static site architecture
- [13-infrastructure-and-hosting.md](13-infrastructure-and-hosting.md) — Hosting platform details and GitHub mapping
- [14-database-systems.md](14-database-systems.md) — Database engines, ORMs, backup strategy
- [15-authentication-and-billing.md](15-authentication-and-billing.md) — Auth flows and billing integration
- [16-email-infrastructure.md](16-email-infrastructure.md) — Email routing, SMTP, DNS records
- [../operations/40-deployment-procedures.md](../operations/40-deployment-procedures.md) — How to deploy each app
- [../operations/41-monitoring-and-health-checks.md](../operations/41-monitoring-and-health-checks.md) — Monitoring and alerting

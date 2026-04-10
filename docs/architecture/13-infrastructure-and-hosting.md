# 13 -- Infrastructure and Hosting

> **Last updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [App Catalogue](11-app-catalogue.md) | [Business Overview](../business/01-business-overview.md) | [Platform Accounts](../platforms/50-platform-accounts-registry.md)

---

## Overview

JMS Dev Lab's infrastructure is distributed across six hosting/cloud providers, with Cloudflare serving as the universal DNS and edge layer. All source code lives in private GitHub repositories.

---

## Infrastructure Map

```
                         +------------------+
                         |    CLOUDFLARE     |
                         |  DNS + Edge + CDN |
                         +--------+---------+
                                  |
          +-----------+-----------+-----------+-----------+
          |           |           |           |           |
     +----+----+ +----+----+ +---+----+ +----+---+ +-----+----+
     | Railway  | | Vercel  | |Firebase| | Render | | Supabase |
     | Backend  | |Frontend | |        | |        | |   Auth   |
     +---------+ +---------+ +--------+ +--------+ +----------+
```

---

## 1. Cloudflare

Cloudflare is the central infrastructure layer. All domains are registered through Cloudflare and all DNS is managed there.

### Services Used

| Service | Purpose | Apps/Sites |
|---------|---------|------------|
| DNS | Domain name resolution | All domains |
| Domain Registration | Domain registrar | All domains |
| Pages | Static site hosting | jmsdevlab.com, JMS Dev Lab website, StaffHub website, SmartCash website, QualCanvas frontend |
| Email Routing | Email forwarding to Gmail | jmsdevlab.com (hello@ and john@) |
| Workers | Serverless API functions | Vegrify API |
| SSL/TLS | Automatic HTTPS | All domains |
| CDN | Content delivery | All sites |

### Cloudflare Pages Deployments

| Site | Domain | Repository |
|------|--------|------------|
| JMS Dev Lab main site | jmsdevlab.com | Private (GitHub) |
| StaffHub marketing site | staffhubapp.com (static pages) | Private (GitHub) |
| SmartCash marketing site | smartcashapp.net (static pages) | Private (GitHub) |
| QualCanvas frontend | qualcanvas.com | Private (GitHub) |

### Cloudflare Email Routing

| Address | Forwards To |
|---------|-------------|
| hello@jmsdevlab.com | mooja77@gmail.com |
| john@jmsdevlab.com | mooja77@gmail.com |

### Cloudflare Workers

| Worker | Purpose | Domain |
|--------|---------|--------|
| Vegrify API | Backend API for Vegrify prototype | Vegrify subdomain |

---

## 2. Railway

Railway hosts the backend servers (Node.js/Express) and databases for several applications.

### Railway Services

| App | Service Type | Stack | Database |
|-----|-------------|-------|----------|
| SmartCash | Backend API | Express + Prisma | PostgreSQL (Railway) |
| StaffHub | Backend API | Express | MongoDB (external or Railway) |
| RepairDesk | Backend API | Express + Prisma | PostgreSQL (Railway) |
| SpamShield | Backend API | Express + Prisma | PostgreSQL (Railway) |
| QualCanvas | Backend API | Express + Prisma | PostgreSQL (Railway) |
| ThemeSweep | Backend API | Shopify CLI | PostgreSQL (Railway) |

### Railway Configuration

- Auto-deploy from GitHub on push to main/master branch
- Environment variables managed in Railway dashboard
- PostgreSQL databases provisioned per-project within Railway

---

## 3. Vercel

Vercel hosts frontend applications, primarily Next.js projects.

### Vercel Deployments

| App | Framework | Domain |
|-----|-----------|--------|
| SmartCash | Next.js | smartcashapp.net (app routes) |
| ProfitShield | Next.js | profitshield.app |
| GrowthMap | Next.js | mygrowthmap.net |
| Pitch Side | Next.js | pitchsideapp.net |
| SpamShield | Next.js (frontend) | SpamShield frontend |
| Vegrify MVP | React/Expo web | Vegrify web preview |

### Vercel Configuration

- Auto-deploy from GitHub on push
- Preview deployments on pull requests
- Environment variables managed in Vercel dashboard
- Connected to GitHub org `mooja77`

---

## 4. Firebase

Firebase is used exclusively for Pitch Side.

### Firebase Services

| Service | App | Purpose |
|---------|-----|---------|
| Hosting | Pitch Side | Static hosting (alternative/supplementary to Vercel) |
| Realtime Database | Pitch Side | Live match data, scores, player stats |
| Authentication | Pitch Side | User auth (email/password, anonymous) |

### Firebase Project

| Field | Value |
|-------|-------|
| Project | Pitch Side |
| Region | Europe (eu-west1) |
| Billing plan | Spark (free) |

---

## 5. Render

Render hosts JewelryStudioManager.

### Render Services

| App | Service Type | Config |
|-----|-------------|--------|
| JewelryStudioManager | Web Service | render.yaml (infrastructure as code) |

### Render Configuration

| Field | Value |
|-------|-------|
| App | JewelryStudioManager |
| Domain | jewelrystudiomanager.com |
| Stack | Express + Prisma + PostgreSQL |
| Config file | render.yaml in repo root |
| Auto-deploy | Yes (from GitHub) |

---

## 6. Supabase

Supabase provides authentication and database services for GrowthMap.

### Supabase Services

| Service | App | Purpose |
|---------|-----|---------|
| Auth | GrowthMap | User authentication and session management |
| Database | GrowthMap | PostgreSQL database (Supabase-hosted) |

---

## 7. GitHub

All source code is hosted in private repositories on GitHub.

### GitHub Organisation

| Field | Value |
|-------|-------|
| Organisation/User | mooja77 |
| Visibility | All repositories private |
| Total repos | 12+ (one per app, plus supporting repos) |

### Repository List

| Repository | App | Primary Branch |
|------------|-----|----------------|
| (private) | SmartCash | main |
| (private) | ProfitShield | main |
| (private) | Jewel Value | main |
| (private) | ThemeSweep | main |
| (private) | RepairDesk | main |
| (private) | SpamShield | main |
| (private) | GrowthMap | main |
| (private) | JewelryStudioManager | main |
| (private) | StaffHub | main |
| (private) | PitchSide | main |
| (private) | QualCanvas | main |
| (private) | Vegrify | main |
| (private) | JMS Dev Lab (this repo) | master |

---

## 8. Domain Registry

All domains are registered and managed through Cloudflare.

| Domain | Primary App | DNS Provider | Registrar |
|--------|------------|--------------|-----------|
| jmsdevlab.com | JMS Dev Lab website | Cloudflare | Cloudflare |
| smartcashapp.net | SmartCash | Cloudflare | Cloudflare |
| profitshield.app | ProfitShield | Cloudflare | Cloudflare |
| jewelvalue.app | Jewel Value | Cloudflare | Cloudflare |
| themesweep.app | ThemeSweep | Cloudflare | Cloudflare |
| repairdeskapp.net | RepairDesk | Cloudflare | Cloudflare |
| mygrowthmap.net | GrowthMap | Cloudflare | Cloudflare |
| jewelrystudiomanager.com | JewelryStudioManager | Cloudflare | Cloudflare |
| staffhubapp.com | StaffHub | Cloudflare | Cloudflare |
| pitchsideapp.net | Pitch Side | Cloudflare | Cloudflare |
| qualcanvas.com | QualCanvas | Cloudflare | Cloudflare |

> **Note:** SpamShield and Vegrify do not have dedicated public-facing domains. SpamShield operates as a Shopify app with a Railway backend. Vegrify is in prototype stage.

---

## 9. Hosting Matrix

A consolidated view of where each app's components are hosted.

| App | Frontend | Backend | Database | Auth | Other |
|-----|----------|---------|----------|------|-------|
| SmartCash | Vercel (Next.js) | Railway (Express) | Railway (PostgreSQL) | Shopify OAuth | Cloudflare Pages (marketing) |
| ProfitShield | Vercel (Next.js) | Vercel (API routes) | Prisma | Shopify OAuth | Shopify Functions (Rust) |
| Jewel Value | -- | -- | -- | -- | NestJS monorepo (Turborepo) |
| ThemeSweep | Shopify embedded | Railway | Railway (PostgreSQL) | Shopify OAuth | -- |
| RepairDesk | -- | Railway (Express) | Railway (PostgreSQL) | App auth | -- |
| SpamShield | Vercel | Railway (Express) | Railway (Prisma) | Shopify OAuth | -- |
| GrowthMap | Vercel (Next.js) | Vercel (API routes) | Supabase (PostgreSQL) | Supabase Auth | Stripe billing |
| JewelryStudioManager | Render | Render (Express) | Render (PostgreSQL) | App auth | render.yaml |
| StaffHub | Cloudflare Pages | Railway (Express) | MongoDB | App auth | -- |
| Pitch Side | Vercel (Next.js) | Firebase | Firebase (RTDB) | Firebase Auth | -- |
| QualCanvas | Cloudflare Pages | Railway (Express) | Railway (PostgreSQL) | App auth | React + Vite |
| Vegrify | Vercel (Expo web) | Cloudflare Workers | -- | -- | React Native + Expo |

---

## 10. Cost Considerations

Most services are on free or starter tiers. Key cost items:

| Provider | Tier | Estimated Monthly Cost |
|----------|------|----------------------|
| Cloudflare | Free (Pages, DNS, Email Routing, Workers) | $0 |
| Railway | Usage-based | Variable (low traffic) |
| Vercel | Hobby / Pro | $0 -- $20 |
| Firebase | Spark (free) | $0 |
| Render | Free / Starter | $0 -- $7 |
| Supabase | Free tier | $0 |
| GitHub | Free (private repos) | $0 |
| Plausible Analytics | Paid | ~EUR 9/mo |
| Domains (Cloudflare) | Annual registration | ~$10-15/domain/year |

> **Note:** Exact costs vary by usage. No paid tier upgrades until the business has income (see [Business Overview](../business/01-business-overview.md)).

---

## 11. Environment Variables

Environment variables are managed per-platform:

| Platform | Management Method |
|----------|-------------------|
| Railway | Railway dashboard (per-service) |
| Vercel | Vercel dashboard (per-project, per-environment) |
| Cloudflare Workers | Wrangler secrets / Cloudflare dashboard |
| Firebase | Firebase console / .env files (local only) |
| Render | Render dashboard |
| Supabase | Supabase dashboard |

> **Security rule:** No secrets, API keys, or credentials are ever committed to Git. All `.env` files are in `.gitignore`. For a reference of environment variable names (without values), see [Environment Variables Reference](../reference/63-environment-variables.md) (planned).

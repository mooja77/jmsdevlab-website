# JewelryStudioManager

**Last Updated:** 2026-03-25

---

## Overview

JewelryStudioManager is a customer relationship management (CRM) platform purpose-built for jewelry studios and custom design workshops. It enables jewelers to manage the full lifecycle of custom commissions -- from initial client consultation through design iteration, production tracking, and final delivery. The app serves as both a Shopify non-embedded app (connecting to Shopify stores for product/order sync) and a standalone SaaS accessible via Stripe billing for non-Shopify merchants.

The platform includes guided onboarding tours for three distinct user roles (Owner, Staff, Client) and a four-step SetupWizard to get studios operational quickly.

## Status

- **Phase:** Submitted for Shopify review
- **Audit Score:** 10/16
- **Shopify App Store:** Submitted, awaiting review
- **Known Gaps:** Google OAuth not implemented, JMS Dev Lab footer missing in some views, no screencast, no mascot

## URLs

| Resource           | URL                                      |
|--------------------|------------------------------------------|
| Marketing Website  | https://jewelrystudiomanager.com         |
| GitHub Repository  | https://github.com/mooja77/custom-design-manager |
| YouTube Promo      | https://youtu.be/kncsg783qe4             |
| YouTube Tour       | https://youtu.be/3RTTTIaB9qQ             |

## Local Path

```
C:\JM Programs\Custom Jewellery Manager
```

> Note: The apps portfolio memory file references `C:\JM Programs\Custom Design Tool - Customer Manager` as an alternate path. The canonical path is `Custom Jewellery Manager`.

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Backend      | Express.js (Node.js)                    |
| ORM          | Prisma                                  |
| Database     | PostgreSQL                              |
| Frontend     | React + Vite                            |
| Hosting      | Render.com                              |
| Config       | render.yaml + Docker                    |
| Auth         | Shopify session tokens + Stripe (standalone mode) |
| Language     | TypeScript                              |

## Architecture

JewelryStudioManager uses a monorepo structure with clearly separated backend and frontend concerns:

```
Custom Jewellery Manager/
├── backend/           # Express API server
│   ├── prisma/        # Database schema & migrations
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   └── middleware/ # Auth, error handling
│   └── Dockerfile
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── tours/     # Guided tour definitions (Owner, Staff, Client)
│   │   └── wizard/    # 4-step SetupWizard
│   └── vite.config.ts
├── render.yaml        # Render.com deployment config
└── docker-compose.yml
```

**Dual-mode architecture:** The app operates in two modes:
1. **Shopify mode (non-embedded):** Connects to a Shopify store via OAuth, syncs products and orders, uses Shopify billing API for subscriptions
2. **Standalone mode:** Merchants without Shopify sign up directly, pay via Stripe, and use the full CRM independently

Both modes share the same backend API and database schema. The Shopify connection is additive -- it layers sync capabilities on top of the core CRM.

## Key Features

- **Commission Tracking:** Track custom jewelry commissions from inquiry through completion with status workflows, timelines, and cost tracking
- **Client Management:** Full client profiles with contact details, purchase history, style preferences, measurements, and communication logs
- **Consultation Scheduling:** Built-in scheduling for design consultations with calendar integration and automated reminders
- **Client Portal:** Dedicated portal where clients can view their commission progress, approve designs, and communicate with the studio
- **Shopify Sync:** Two-way synchronization of products, orders, and customer data with a connected Shopify store
- **Analytics Dashboard:** Revenue tracking, commission pipeline metrics, client acquisition trends, and studio performance KPIs
- **3 Guided Tours:**
  - **Owner Tour:** Full platform walkthrough covering settings, team management, and business configuration
  - **Staff Tour:** Focused on day-to-day operations -- managing commissions, client interactions, and scheduling
  - **Client Tour:** Guides clients through the portal, showing how to view progress and communicate with the studio
- **4-Step SetupWizard:**
  1. Studio profile & branding
  2. Team members & roles
  3. Service catalog & pricing
  4. Shopify connection (optional) or Stripe setup

## Pricing Tiers

All plans include a **14-day free trial**. No free tier is offered.

| Plan         | Price      | Features                                           |
|--------------|------------|-----------------------------------------------------|
| Starter      | $9.99/mo   | 1 user, basic CRM, client management, 50 commissions/mo |
| Professional | $19.99/mo  | 5 users, full CRM, client portal, Shopify sync, analytics |
| Enterprise   | $29.99/mo  | Unlimited users, priority support, custom branding, API access |

## Deployment

- **Platform:** Render.com
- **Configuration:** `render.yaml` defines both web service (backend) and static site (frontend) deployments
- **Containerization:** Docker used for backend service
- **Database:** PostgreSQL hosted on Render.com (managed)
- **Migrations:** Prisma Migrate handles schema changes (`npx prisma migrate deploy`)
- **Environment Variables:**
  - `DATABASE_URL` -- PostgreSQL connection string
  - `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` -- Shopify app credentials
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` -- Stripe billing (standalone mode)
  - `SESSION_SECRET` -- Express session encryption
  - `FRONTEND_URL` -- CORS origin for the React frontend

## Known Gaps

- **Google OAuth:** Not yet implemented. Currently relies on Shopify session tokens or email/password auth in standalone mode. Google OAuth is a standard requirement per the JMS Dev Lab app playbook.
- **JMS Dev Lab Footer:** The "Created by JMS Dev Lab" attribution footer is missing from some views in the frontend.
- **Screencast:** No walkthrough screencast has been recorded for the app listing or documentation.
- **Mascot:** No app mascot has been designed.
- **Promo Video:** YouTube videos exist (2 published), but a dedicated promotional video for the Shopify listing may need updating.

## Related Documents

- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- App Instance Instructions: `C:\JM Programs\JMS Dev Lab Website\APP-INSTANCE-INSTRUCTIONS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

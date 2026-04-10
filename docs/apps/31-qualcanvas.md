# QualCanvas

**Last Updated:** 2026-03-25

---

## Overview

QualCanvas is a standalone web application for qualitative data analysis, designed for researchers, academics, and qualitative data analysts. It provides an infinite interactive canvas where users can code transcripts, discover patterns, and build theory visually. The app supports industry-standard features like QDPX import/export (compatible with NVivo and ATLAS.ti), intercoder reliability measurement via Cohen's Kappa, and AI-assisted coding with a bring-your-own-key (BYOK) model.

QualCanvas is **not a Shopify app**. It targets the academic and research market as a standalone SaaS product.

## Status

- **Phase:** Live / Active
- **Audit Score:** Not scored in standard audit (standalone, non-Shopify)
- **Shopify App Store:** N/A -- this is not a Shopify app
- **Target Market:** Researchers, academics, qualitative data analysts, graduate students

## URLs

| Resource              | URL                                                    |
|-----------------------|--------------------------------------------------------|
| Marketing Website     | https://qualcanvas.com                                 |
| Backend API           | https://canvas-app-production.up.railway.app           |
| GitHub Repository     | https://github.com/mooja77/Canvas-App                  |

## Local Path

```
C:\JM Programs\Canvas App
```

## Tech Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Frontend     | React + Vite                                  |
| Backend      | Express.js (Node.js)                          |
| ORM          | Prisma                                        |
| Database     | PostgreSQL                                    |
| Hosting (FE) | Cloudflare Pages                              |
| Hosting (BE) | Railway                                       |
| Language     | TypeScript                                    |

## Architecture

QualCanvas uses a monorepo structure with a shared package for types and utilities used by both frontend and backend:

```
Canvas App/
├── shared/                # Shared types, constants, validation schemas
├── apps/
│   ├── frontend/          # React + Vite SPA
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── canvas/       # Infinite canvas engine
│   │   │   │   ├── coding/       # Code management & application
│   │   │   │   ├── analysis/     # 12 analysis tools
│   │   │   │   ├── ai/           # AI-assisted coding (BYOK)
│   │   │   │   └── import-export/ # QDPX, transcript handling
│   │   │   ├── pages/
│   │   │   └── stores/
│   │   └── vite.config.ts
│   └── backend/           # Express API server
│       ├── prisma/        # Database schema & migrations
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   └── middleware/
│       └── package.json
└── package.json
```

**Deployment topology:**
- Frontend is deployed to Cloudflare Pages for global CDN distribution and fast load times
- Backend API runs on Railway at `canvas-app-production.up.railway.app`
- PostgreSQL database hosted on Railway (managed)
- Vercel project also exists (ID: `prj_Pb06pdrXiuauluQASeZYA3nzKNJW`) -- potentially for preview deployments or prior hosting

## Key Features

- **Infinite Interactive Canvas:** A zoomable, pannable workspace where researchers visually organize codes, themes, memos, and transcript excerpts. Supports drag-and-drop, grouping, linking, and spatial arrangement of qualitative data elements.

- **12 Analysis Tools:** A comprehensive suite of analysis methods built into the platform:
  1. Open Coding
  2. Axial Coding
  3. Selective Coding
  4. Thematic Analysis
  5. Pattern Matching
  6. Cross-Case Analysis
  7. Narrative Analysis
  8. Discourse Analysis
  9. Framework Analysis
  10. Content Analysis
  11. Grounded Theory
  12. Phenomenological Analysis

- **Auto-Coding:** Automated code suggestion and application based on keyword patterns, regular expressions, and previously applied codes. Reduces manual coding effort on large transcript sets.

- **AI-Assisted Coding (BYOK):** Researchers can connect their own OpenAI, Anthropic, or other LLM API keys to get AI-powered coding suggestions, theme identification, and summary generation. No data is sent through JMS Dev Lab servers -- the BYOK model ensures data sovereignty.

- **QDPX Import/Export:** Full support for the QDPX (Qualitative Data Project Exchange) standard, enabling interoperability with NVivo, ATLAS.ti, MAXQDA, and other qualitative analysis software. Researchers can move projects between tools without data loss.

- **Cohen's Kappa Intercoder Reliability:** Built-in calculation of Cohen's Kappa statistic for measuring intercoder agreement. Essential for research validity when multiple coders analyze the same data.

- **Ethics Compliance:** Features supporting research ethics requirements including audit trails, data anonymization tools, consent tracking, and data retention policies.

- **Cases & Cross-Case Analysis:** Organize data by case (participant, site, time period) and perform cross-case analysis to identify patterns and themes that span multiple cases.

- **Transcript Management:** Import transcripts in multiple formats, segment them, and link segments to codes and themes on the canvas.

- **Memo System:** Rich-text memos that can be attached to codes, themes, or transcript segments for reflexive journaling and analytical notes.

## Pricing Tiers

QualCanvas offers a limited free tier (suitable for students exploring the tool) alongside paid plans. A **40% discount** is available for `.edu` email addresses.

| Plan | Price    | Features                                                    |
|------|----------|-------------------------------------------------------------|
| Free | $0/mo    | 1 canvas, 2 transcripts, 5 codes -- suitable for evaluation |
| Pro  | $12/mo   | Unlimited canvases, transcripts, and codes; all 12 analysis tools; AI-assisted coding; QDPX import/export |
| Team | $29/mo   | Everything in Pro + multi-user collaboration, intercoder reliability, shared codebooks, team management |

**Academic Discount:** 40% off Pro and Team plans for verified `.edu` email addresses.
- Pro with .edu: $7.20/mo
- Team with .edu: $17.40/mo

## Deployment

- **Frontend Hosting:** Cloudflare Pages
  - Global CDN distribution
  - Automatic builds from Git
  - Custom domain: qualcanvas.com
- **Backend Hosting:** Railway
  - Production URL: `canvas-app-production.up.railway.app`
  - Auto-deploys from GitHub
- **Database:** PostgreSQL on Railway (managed)
- **Vercel Project:** `prj_Pb06pdrXiuauluQASeZYA3nzKNJW` (secondary/preview)
- **Migrations:** Prisma Migrate (`npx prisma migrate deploy`)
- **Environment Variables:**
  - `DATABASE_URL` -- PostgreSQL connection string
  - `FRONTEND_URL` -- CORS origin (qualcanvas.com)
  - `SESSION_SECRET` -- Express session encryption
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` -- Billing
  - `CLOUDFLARE_*` -- Cloudflare Pages deployment credentials

## Known Gaps

- **Mascot:** No app mascot designed.
- **Promo Video:** No promotional video for marketing.
- **Screencast:** No walkthrough screencast recorded.
- **Google OAuth:** Status unclear -- should be verified. Academic users especially benefit from institutional Google login.
- **JMS Dev Lab Footer:** Should be verified as present in the frontend.
- **Mobile Responsiveness:** Canvas-based interfaces can be challenging on mobile devices. Needs verification.

## Related Documents

- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- App Instance Instructions: `C:\JM Programs\JMS Dev Lab Website\APP-INSTANCE-INSTRUCTIONS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

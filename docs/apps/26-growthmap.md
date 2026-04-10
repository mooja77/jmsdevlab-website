# GrowthMap

**Last Updated:** 2026-03-25

---

## 1. Overview

GrowthMap is a marketing plan execution platform described as "like Duolingo, but for marketing." It transforms marketing strategy into daily actionable quests that merchants complete to build consistent marketing habits. The app features an XP (experience points) system, streak tracking, AI-powered content draft generation via Anthropic's Claude API, a learning library, and progress analytics. It operates as both a Shopify embedded app and a standalone Next.js web application, using Supabase for authentication, Prisma with PostgreSQL for data, and Stripe for billing.

**Target User:** Small-to-medium Shopify merchants and independent business owners who know they need to do marketing but lack a structured plan, struggle with consistency, or do not know where to start. GrowthMap gamifies the process to build daily marketing habits.

---

## 2. Status

| Field | Value |
|-------|-------|
| Audit Score | **10/16** |
| Shopify Review | Submitted for review |
| Blockers | Google OAuth needed, mascot not created, promo video and screencast not recorded, separate marketing website needed |

---

## 3. URLs

| Resource | URL |
|----------|-----|
| Production | https://mygrowthmap.net |
| Vercel Project | prj_2dsvUje7E5EQ48tDqSyOnt6d0NSq |
| Shopify Listing | Submitted, pending review |
| GitHub | mooja77/growthmap |

---

## 4. Local Path

```
C:\JM Programs\GrowthMap
```

---

## 5. Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS + class-variance-authority + clsx |
| Animations | Framer Motion |
| Auth | Supabase Auth (@supabase/supabase-js, @supabase/ssr) |
| Database | PostgreSQL (via Prisma) |
| ORM | Prisma (@prisma/client + @prisma/adapter-pg) |
| AI Content | Anthropic Claude API (@anthropic-ai/sdk) |
| Billing | Stripe |
| Shopify Integration | @shopify/app-bridge-react, @shopify/shopify-api |
| Error Tracking | Sentry (@sentry/nextjs, @sentry/node) |
| Testing | Vitest (unit), Playwright (e2e) |
| Hosting | Vercel (Project ID: prj_2dsvUje7E5EQ48tDqSyOnt6d0NSq) |

---

## 6. Architecture

GrowthMap is a single Next.js application (not a monorepo) that handles both the Shopify embedded experience and the standalone web SaaS in one codebase. It uses the Next.js App Router pattern.

```
GrowthMap/
├── src/
│   ├── app/              Next.js App Router pages and layouts
│   ├── components/       React components (UI, domain, shared)
│   ├── generated/        Auto-generated types (Prisma, etc.)
│   ├── lib/              Utilities, API clients, helpers
│   └── proxy.ts          Proxy configuration
├── e2e/                  Playwright end-to-end tests
│   └── playwright.config.ts
├── components.json       shadcn/ui component configuration
├── package.json
└── Marketing Stuff/      Marketing assets and materials
```

**Auth Flow:**
- Supabase handles user authentication (email/password, social providers)
- Shopify session tokens for embedded app context
- Stripe manages subscription billing and plan enforcement

---

## 7. Key Features

- Daily marketing quests with step-by-step guided execution
- AI-powered content drafts (blog posts, social media, email copy) via Anthropic Claude
- XP (experience points) system for completing marketing tasks
- Streak tracking to encourage daily marketing habits
- Plan overview with marketing strategy roadmap
- Task filtering by category (SEO, social media, email, etc.)
- Progress analytics and completion tracking
- Learning library with searchable marketing guides and resources
- Settings management (profile, plan, billing)
- Responsive design (mobile-first dashboard, tasks, and progress views)
- Landing page with hero, features, FAQ, and pricing sections
- Dark mode support
- Sentry error tracking
- Dual-mode: Shopify embedded + standalone web SaaS

---

## 8. Pricing Tiers

| Tier | Price | Features | Billing |
|------|-------|----------|---------|
| Starter | $9.99/mo | Core marketing quests, basic AI drafts, streak tracking | 14-day free trial, then Stripe |
| Professional | $19.99/mo | Advanced AI content, full learning library, progress analytics | 14-day free trial, then Stripe |
| Enterprise | $29.99/mo | Unlimited AI drafts, priority support, team features | 14-day free trial, then Stripe |

---

## 9. Deployment

**Local Development:**
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
# App available at http://localhost:3000
```

**Build:**
```bash
# Production build (generates Prisma client first)
npm run build
# Equivalent to: prisma generate && next build

# Start production server
npm start
```

**Testing:**
```bash
# Unit tests
npm test              # vitest run
npm run test:watch    # vitest (watch mode)

# E2E tests (Playwright)
npm run test:e2e          # Headless
npm run test:e2e:ui       # Interactive UI mode
npm run test:e2e:headed   # Headed browser
npm run test:e2e:debug    # Debug mode
```

**Linting:**
```bash
npm run lint
```

**Production Deployment:**
- Hosted on Vercel (auto-deploys on push)
- Prisma client generated at build time via `postinstall` hook

**Required Environment Variables:**
- `DATABASE_URL` -- PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` -- Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` -- Supabase service role key
- `ANTHROPIC_API_KEY` -- Anthropic Claude API key for AI content generation
- `STRIPE_SECRET_KEY` -- Stripe API key
- `STRIPE_WEBHOOK_SECRET` -- Stripe webhook signing secret
- `SHOPIFY_API_KEY` -- Shopify app client ID
- `SHOPIFY_API_SECRET` -- Shopify app client secret
- `SENTRY_DSN` -- Sentry error tracking DSN
- `NEXT_PUBLIC_APP_URL` -- Public application URL

---

## 10. Known Gaps

| Priority | Gap |
|----------|-----|
| High | Google OAuth not yet implemented |
| Medium | Mascot not yet created |
| Medium | Promo video not recorded |
| Medium | Screencast / product walkthrough not recorded |
| Medium | Separate marketing website not yet built (currently uses landing page within app) |

---

## 11. Related Documents

- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`
- Marketing Materials: `C:\JM Programs\GrowthMap\Marketing Stuff\`

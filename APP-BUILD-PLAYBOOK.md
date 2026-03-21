# JMS Dev Lab — App Build Playbook

A repeatable checklist for building, polishing, and shipping apps. Derived from 10+ apps already built and the workflows used to build them.

---

## Phase 1: Core App Build

### 1.1 Project Setup
- [ ] Create monorepo structure: `apps/shopify`, `apps/web`, `apps/backend`, `packages/shared`
- [ ] Shared package for types, utils, and business logic (used by both Shopify and web versions)
- [ ] TypeScript strict mode
- [ ] Environment config: `.env` files for dev/staging/production
- [ ] Docker Compose for local dev (PostgreSQL/MongoDB + Redis if needed)
- [ ] CLAUDE.md with dev commands and safety rules

### 1.2 Backend
- [ ] Express or Node.js API server
- [ ] Database: PostgreSQL (Prisma) or MongoDB
- [ ] Authentication: Shopify session tokens + Google OAuth (for web version)
- [ ] Subscription/billing enforcement middleware — checks tier on every request
- [ ] GDPR compliance webhooks: `customers/data_request`, `customers/redact`, `shop/redact`
- [ ] App lifecycle webhooks: `app/uninstalled`, `app_subscriptions/update`
- [ ] Rate limiting and error handling
- [ ] API versioning

### 1.3 Core Functionality
- [ ] Build and validate core features — accuracy and correctness first
- [ ] Seed with plausible test data
- [ ] Automated tests for critical paths

### 1.4 Database Design
- [ ] Schema design with proper indexes
- [ ] Migrations setup (Prisma migrate or equivalent)
- [ ] Multi-tenant isolation (shop-scoped data)

---

## Phase 2: Shopify Integration

### 2.1 Shopify App Config
- [ ] `shopify.app.toml` with correct client ID, scopes, webhooks
- [ ] App URL pointing to production backend
- [ ] App Proxy configured (if customer-facing portal needed)
- [ ] Embedded app setup with App Bridge
- [ ] Polaris UI components for admin interface

### 2.2 Billing / Subscriptions
- [ ] Pricing tiers defined (no free tier — can't afford to run for free)
- [ ] `app_subscriptions/update` webhook handler
- [ ] Subscription enforcement on all protected routes
- [ ] Graceful handling of expired/cancelled subscriptions
- [ ] Test billing flow on dev store

### 2.3 Shopify Webhooks
- [ ] All required webhooks registered and handling correctly
- [ ] GDPR mandatory webhooks (3x)
- [ ] `app/uninstalled` — cleanup shop data
- [ ] Domain-specific webhooks (orders, products, etc.)

---

## Phase 3: Web-Based SaaS Version

### 3.1 Web App
- [ ] Standalone web app (same monorepo, `apps/web`)
- [ ] Complete interoperability with Shopify version — same database, same API
- [ ] Customers can use either version with same experience and data
- [ ] Google Login option (via existing Google Cloud account)
- [ ] Email/password signup and login
- [ ] Subscription enforcement through the web app for all tier levels

### 3.2 Authentication Parity
- [ ] Shopify users: session token auth
- [ ] Web users: Google OAuth + email/password
- [ ] Account linking: Shopify user can also log in via web and vice versa
- [ ] Session management and token refresh

### 3.3 Subscription Enforcement (Web)
- [ ] Stripe or similar for web-only subscribers
- [ ] Same tier features as Shopify version
- [ ] Upgrade/downgrade flows
- [ ] Payment webhook handlers

---

## Phase 4: UI/UX — World Class

### 4.1 Design Standards
- [ ] Responsive design: mobile, tablet, desktop
- [ ] Same intuitive experience on Shopify embedded and web standalone
- [ ] Polaris components in Shopify; matching design system in web version
- [ ] Loading states, empty states, error states for every screen
- [ ] Consistent typography, spacing, colours

### 4.2 Onboarding
- [ ] Guided tour / interactive walkthrough on first use
- [ ] Tutorial system inside the app (step-by-step for each feature)
- [ ] Progress indicator for setup completion
- [ ] Contextual help tooltips

### 4.3 Deep UI Review
- [ ] No UI bugs, display issues, or error pages (Shopify review requirement 2.1.2)
- [ ] Test all flows end-to-end with real data
- [ ] Test on multiple screen sizes
- [ ] Check all form validations
- [ ] Verify all navigation paths work

---

## Phase 5: Testing

### 5.1 Automated Tests
- [ ] Unit tests for core business logic
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for critical user flows

### 5.2 Live Site Testing
- [ ] Deploy to staging/production
- [ ] Create test plan covering every feature end-to-end
- [ ] Create test users, setup accounts, seed with plausible data
- [ ] Test each subscription tier
- [ ] Take screenshots to verify UI is correct
- [ ] Test on Shopify dev store (install and exercise all features)
- [ ] Verify parity between Shopify app, web app, and Shopify embedded app

### 5.3 Core Functionality Audit
- [ ] Verify accuracy and correctness of core features
- [ ] Edge cases and error handling
- [ ] Performance under load
- [ ] Data integrity checks

---

## Phase 6: Branding & Marketing Assets

### 6.1 Visual Identity
- [ ] App logo — square image (use NanoBanana prompt)
- [ ] App mascot — Pixar style, square image (use NanoBanana prompt)
- [ ] Consistent branding across app, website, and store listing

### 6.2 Promo Video
- [ ] Script: ~60 seconds, text only
- [ ] Screencast: run through the guided tour, capture with screen recording
- [ ] This screencast doubles as the Shopify submission video

### 6.3 App Website
- [ ] World-class marketing website for the app
- [ ] Sign-in link to web-based version from the website
- [ ] Footer: "Created by JMS Dev Lab"
- [ ] Responsive design
- [ ] SEO basics: meta tags, OG cards, structured data

---

## Phase 7: Deployment

### 7.1 Infrastructure
- [ ] Backend: Railway.app (or Cloudflare Workers)
- [ ] Frontend/Web: Vercel (or Cloudflare Pages)
- [ ] Database: Railway PostgreSQL or MongoDB Atlas
- [ ] Code: GitHub repository (private)
- [ ] Domain: configure later (use platform default URL initially)

### 7.2 Go Live
- [ ] Push to production
- [ ] Test everything on live site
- [ ] SSL/HTTPS verified
- [ ] Environment variables set correctly
- [ ] Webhook URLs pointing to production

---

## Phase 8: Shopify App Store Submission

### 8.1 Pre-Submission Checklist
- [ ] App listing complete (name, description, screenshots, categories)
- [ ] Pricing plan configured in Shopify Partners
- [ ] Privacy policy URL
- [ ] App icon (1200x1200)
- [ ] Screenshots (desktop + mobile)
- [ ] Screencast video (guided tour recording)
- [ ] Testing instructions with credentials for review team
- [ ] Contact email: hello@jmsdevlab.com
- [ ] Geographic requirements stated if applicable (Shopify requirement 4.3.8)

### 8.2 Common Review Failures (from experience)
- [ ] **4.3.8**: If app has region-specific features (e.g. Eircode), state geographic requirements in listing
- [ ] **2.1.2**: No UI bugs, display issues, or error pages — test everything before submission
- [ ] Training/testing instructions must match actual app UI — if you mention a feature, it must be visible
- [ ] Settings must save correctly
- [ ] All GDPR webhooks must respond correctly
- [ ] App must work on a fresh install with no prior data

### 8.3 Post-Submission
- [ ] Monitor email for review feedback
- [ ] Respond within 14 days or app gets paused
- [ ] Fix and reply to review email when issues resolved

---

## Phase 9: Post-Launch

### 9.1 Market Research
- [ ] Addressable market size
- [ ] Relevant locales and Shopify user counts
- [ ] Competitor analysis

### 9.2 Improvement Cycle
- [ ] Deep review of app — plan improvements
- [ ] Deep review of website — plan improvements
- [ ] User feedback collection
- [ ] Iterate and redeploy

---

## Current App Status Matrix (Audited 19 March 2026)

| Feature | SmartCash | JewelVal | ProfitShield | ThemeSweep | RepairDesk | SpamShield | GrowthMap | TaxMatch | JSM | StaffHub | PitchSide |
|---------|-----------|----------|-------------|------------|------------|------------|-----------|----------|-----|----------|-----------|
| **Score** | **15/16** | **13/16** | **14/16** | **12/16** | **11/16** | **11/16** | **10/16** | **10/16** | **10/16** | **9/16** | **9/16** |
| Monorepo | YES | YES | YES | YES | NO | YES | NO | YES | PARTIAL | NO | NO |
| Web SaaS | YES | YES | YES | YES | YES | YES | YES | YES | YES | PARTIAL | YES* |
| Google Login | YES | YES | YES | YES | YES | YES | NO** | YES | NO | YES | YES |
| Guided Tour | YES | YES | YES | YES | YES | YES | YES | NO | YES | YES | YES |
| Tutorial | YES | YES | YES | YES | — | YES | YES | NO | YES | YES | YES |
| Billing | YES | YES | YES | YES | YES | NO | YES | YES | YES | YES | N/A*** |
| Pricing Tiers | YES | YES | PARTIAL | YES* | YES | YES* | YES | YES | YES | YES | FREE |
| GDPR | YES | YES | YES | YES | NO | YES | YES | PARTIAL | YES | YES | NO |
| Responsive | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES |
| Mascot/Logo | YES | PARTIAL | YES | YES | YES | NO | PARTIAL | NO | PARTIAL | NO | NO |
| Promo Video | YES | PARTIAL | NO | NO | YES | NO | NO | NO | PARTIAL | NO | NO |
| Website | YES | YES | YES | YES | YES | YES | NO**** | PARTIAL | YES | YES | YES |
| Screencast | YES | YES | PARTIAL | NO | — | NO | NO | NO | NO | NO | N/A |
| Test Plan | YES | PARTIAL | YES | YES | YES | YES | YES | YES | YES | PARTIAL | YES |
| Geo Reqs | NO | NO | NO | YES | NO | YES | NO | NO | NO | NO | NO |
| JMS Footer | YES | YES | YES | NO | YES | YES | YES | YES | NO | YES | YES |

**Legend:** YES = done, NO = missing, PARTIAL = incomplete, — = not verified, N/A = not applicable
\* PitchSide is not a Shopify app — standalone web + mobile (free, no billing)
\** GrowthMap uses Supabase magic links instead of Google OAuth
\*** PitchSide is intentionally free
\**** GrowthMap landing page IS the marketing site (no separate website)
\* SpamShield/ThemeSweep/ProfitShield have free trial tiers

### Priority Gaps (Most Common Missing Items)

| Gap | Apps Missing It | Priority |
|-----|----------------|----------|
| **Screencast for Shopify** | StaffHub, GrowthMap, JSM, SpamShield, ThemeSweep, TaxMatch | HIGH — blocks submission |
| **Promo video script** | StaffHub, GrowthMap, SpamShield, ThemeSweep, TaxMatch, ProfitShield, PitchSide | MEDIUM |
| **Mascot character** | StaffHub, SpamShield, TaxMatch, PitchSide + partial on JewelVal, GrowthMap, JSM | MEDIUM |
| **Guided tour** | TaxMatch | MEDIUM |
| **Google OAuth** | GrowthMap, JSM | MEDIUM |
| **GDPR webhooks** | RepairDesk, PitchSide | HIGH — compliance |
| **Billing enforcement** | SpamShield | HIGH — revenue |
| **JMS Dev Lab footer** | JSM, ThemeSweep | LOW — quick fix |
| **Monorepo structure** | RepairDesk, StaffHub, GrowthMap, PitchSide | LOW — architectural |
| **Geographic requirements** | 8 of 11 apps | LOW — state in listing where applicable |

### App-by-App Action Items (ranked by score)

**SmartCash (15/16)** — Gold standard. Only add geographic requirements to listing if applicable.

**ProfitShield (14/16)** — Near-complete. Add promo video script. Clarify free tier vs trial in pricing.

**Jewel Value (13/16)** — Add mascot character, formal test plan doc, geographic requirements.

**ThemeSweep (12/16)** — Add JMS Dev Lab footer, promo video script, screencast.

**RepairDesk (11/16)** — Add GDPR webhooks (critical), monorepo restructure (low priority).

**SpamShield (11/16)** — Add billing enforcement (critical), mascot, promo video, screencast.

**GrowthMap (10/16)** — Add Google OAuth, mascot, promo video, screencast, separate marketing website.

**TaxMatch (10/16)** — Add guided tour, tutorial, mascot, promo video, screencast. State US/IRS geographic requirement.

**JewelryStudioMgr (10/16)** — Add Google OAuth, JMS Dev Lab footer, screencast, mascot.

**StaffHub (9/16)** — Fix Shopify review issues first (critical). Then: web SaaS marketing, mascot, promo video, screencast, monorepo.

**Pitch Side (9/16)** — Free app, not Shopify. Add GDPR data export/delete, mascot, promo video. Consider stating Irish football context in listing.

---

## Standard Prompts Reference

These are the standard prompts to run through for each app, in order:

1. Build core app functionality
2. "deeply review the app, enter plan mode and plan how to improve it and make it world class"
3. "check the core functionality — make sure it is accurate and top class"
4. "create a tutorial and a guided tour inside the app"
5. "build a web based SaaS version — completely interoperable with the Shopify one"
6. "google login option — set it up on our Google Cloud account"
7. "Make sure the app has world class UI/UX that works the same on Shopify and web"
8. "does the sign up and log in work for the web based option and is the subscription enforcement working"
9. "make sure this is responsive design, for mobile, desktop and any other platform"
10. "have you created a pricing plan — no free option"
11. "Provide a NanoBanana prompt to create a logo — square image"
12. "Provide a NanoBanana prompt to create a mascot — Pixar style, square image"
13. "create a script for a promo video — about 60 seconds, text only"
14. "create world class website for this app — sign in to web version from the website"
15. "Put a footer that this app is created by JMS Dev Lab"
16. "push to live site — Railway, Vercel, Cloudflare, GitHub — test on live site"
17. "create a complete test plan — test each feature end-to-end — take screenshots"
18. "is there complete parity between Shopify app, web app, and embedded app"
19. "We need a screencast video for the Shopify submission — run through the tour"
20. "what is needed before we can submit for Shopify app store review"
21. "Complete the Shopify app store submission"
22. "what is the addressable market — locales, Shopify user counts"
23. "deeply review the app website, enter plan mode and plan how to improve it"
24. "How would you improve the app?"

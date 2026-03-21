# Claude Code Instance Instructions — Per App

Copy the relevant section into each app's CLAUDE.md file (or append to existing CLAUDE.md).

---

## Common Instructions (ALL APPS)

Add this to every app's CLAUDE.md:

```markdown
# JMS Dev Lab — Standard App Rules

## Owner
John Moore, JMS Dev Lab (sole trader), Cork, Ireland
- Website: jmsdevlab.com
- Contact: john@jmsdevlab.com
- Shopify Partner ID: 4100630

## Forbidden Commands
- **NEVER use `killall`** — this command is strictly forbidden in all contexts

## Architecture Standards
- Monorepo structure: `apps/shopify`, `apps/web`, `apps/backend`, `packages/shared`
- Shared package for types, utils, and business logic reused across Shopify and web versions
- TypeScript strict mode throughout
- All apps must have both a Shopify embedded version AND a standalone web SaaS version
- Both versions must be completely interoperable — same database, same API, same data
- A customer must be able to use either version and have the same experience

## Authentication
- Shopify: session token auth via App Bridge
- Web: Google OAuth (we have a Google Cloud account with multiple apps configured) + email/password
- Account linking: a user who installs via Shopify can also log in via web, and vice versa

## Billing & Subscriptions
- No free tier (we can't afford to run apps for free for lots of users)
- 14-day trial is acceptable, but after that, paid only
- Shopify billing via GraphQL Billing API
- Web billing via Stripe
- Plan enforcement middleware on every protected route — both Shopify and web
- Subscription status must be checked and enforced, not just displayed

## GDPR Compliance (Mandatory)
- Must implement all 3 Shopify GDPR webhooks:
  - `customers/data_request` — export customer data
  - `customers/redact` — delete customer data
  - `shop/redact` — delete all shop data on uninstall
- Web version must also support data export and deletion requests

## UI/UX Standards
- World-class UI/UX — intuitive, pleasant, easy to use
- Responsive design: mobile (375px), tablet (768px), desktop (1024px+)
- Same experience on Shopify embedded and web standalone
- Loading states, empty states, error states for every screen
- Polaris components in Shopify; matching design system in web

## Onboarding (Required)
- Guided tour / interactive walkthrough on first use (use react-joyride, nextstepjs, or similar)
- Tutorial system inside the app with step-by-step feature walkthroughs
- Tour must be restartable from settings/help menu
- Tour should auto-start on first visit
- Must include a "demo tour" mode that auto-advances for screencast recording

## Branding
- Footer on all pages: "Created by JMS Dev Lab" with link to jmsdevlab.com
- App needs a logo (square, 1200x1200 for Shopify)
- App needs a mascot character (Pixar style) for promo materials

## Testing
- Automated tests: unit tests for business logic, integration tests for API, e2e tests (Playwright)
- Formal test plan document covering every feature
- Test on live site with real data, multiple subscription tiers, multiple screen sizes
- Take screenshots to verify UI correctness
- Test parity between Shopify app, web app, and embedded app

## Deployment
- Backend: Railway.app (or Cloudflare Workers)
- Frontend/Web: Vercel (or Cloudflare Pages)
- Database: Railway PostgreSQL or MongoDB Atlas
- Code: GitHub (private repo, org: mooja77)
- Push to live site and test there — don't just test locally

## Shopify App Store Submission
- App listing: name, description, screenshots (desktop + mobile), categories
- Pricing plan configured in Shopify Partners
- Privacy policy URL on app website
- App icon: 1200x1200
- Screencast video: run through the guided tour on screen (auto-advance demo mode)
- Testing instructions with working credentials for the review team
- Contact email: hello@jmsdevlab.com
- If app has region-specific features, state geographic requirements in listing (requirement 4.3.8)
- App must be free from UI bugs, display issues, or error pages (requirement 2.1.2)
- Testing instructions must match actual app UI — don't mention features that aren't visible
- Settings must save correctly
- App must work on a fresh install with no prior data
- Respond to review feedback within 14 days or app gets paused

## Marketing Assets
- 60-second promo video script (text only)
- NanoBanana prompt for logo (square image)
- NanoBanana prompt for mascot (Pixar style, square image)
- Marketing website with sign-in link to web version
- SEO basics: meta tags, OG cards, structured data

## What NOT To Do
- No fake data, placeholder testimonials, or inflated claims
- No free tier (trial only)
- Don't skip GDPR webhooks
- Don't submit to Shopify without testing on a fresh dev store install
- Don't use `killall`
```

---

## Per-App Instructions

### SmartCash (15/16) — `C:\JM Programs\CashFlowAppV2`

```markdown
## App-Specific: SmartCash

**Score: 15/16** — Gold standard. Use this app as the reference implementation for all other apps.

**Current status:** Submitted for Shopify review. All features implemented.

**Remaining tasks:**
- [ ] Add geographic requirements to Shopify listing if applicable (only gap)

**Reference URLs:**
- Production: https://empowering-joy-production.up.railway.app
- Website: smartcashapp.net
- YouTube promo: https://youtu.be/I3H5M6jL-9A
- YouTube tour: https://youtu.be/w2OKtOTmDiE
```

---

### ProfitShield (14/16) — `C:\JM Programs\ProfitShield`

```markdown
## App-Specific: ProfitShield

**Score: 14/16** — Near-complete. Very mature codebase.

**Current status:** Dev/early stage per Shopify Partners but codebase is comprehensive.

**Remaining tasks:**
- [ ] Create 60-second promo video script
- [ ] Clarify pricing: free tier (100 orders/mo) vs trial — decide if this should be trial-only
- [ ] Add geographic requirements to listing if applicable
- [ ] Complete Shopify App Store submission with screencast

**Key architecture notes:**
- Includes Shopify Function (Rust) for checkout validation
- Has mascot asset at `apps/web/public/mascot.svg`
```

---

### Jewel Value (13/16) — `C:\JM Programs\Valuation App\jewel-value`

```markdown
## App-Specific: Jewel Value

**Score: 13/16** — Strong implementation.

**Current status:** Submitted for Shopify review.

**Remaining tasks:**
- [ ] Create mascot character (only has logo, no mascot)
- [ ] Create formal test plan document (tests exist but no plan doc)
- [ ] Add geographic requirements to listing — app supports 13 languages, 14 currencies but has Eircode fields (this was flagged on StaffHub review, could happen here too)

**IMPORTANT:** Shopify flagged StaffHub for having Eircode/Irish address fields without stating geographic requirements. Jewel Value may have similar fields — check and add geographic requirements to listing proactively.

**Reference URLs:**
- Production: jewelvalue.app
- YouTube: https://youtu.be/KH6Xv_IyvZM
```

---

### ThemeSweep (12/16) — `C:\JM Programs\themesweep`

```markdown
## App-Specific: ThemeSweep

**Score: 12/16** — Solid. Has mascot (Sweepy) with full character guide.

**Remaining tasks:**
- [ ] Add "Created by JMS Dev Lab" footer with link to jmsdevlab.com
- [ ] Create 60-second promo video script
- [ ] Create screencast for Shopify submission (run guided tour in demo mode)
- [ ] Complete Shopify App Store submission

**Key notes:**
- Has CHARACTER-GUIDE.md for Sweepy mascot — use for all marketing materials
- 4 apps in monorepo: backend, shopify, web, website
```

---

### RepairDesk (11/16) — `C:\JM Programs\Repair Desk`

```markdown
## App-Specific: RepairDesk

**Score: 11/16**

**CRITICAL:** GDPR webhooks are missing. This is a compliance requirement for Shopify.

**Remaining tasks (priority order):**
1. [ ] **CRITICAL: Implement GDPR webhooks** — `customers/data_request`, `customers/redact`, `shop/redact`
2. [ ] Create screencast for Shopify submission
3. [ ] Add geographic requirements to listing if applicable
4. [ ] Consider monorepo restructure (low priority — current backend/frontend/cf-proxy structure works)

**Reference URLs:**
- Production: repairdeskapp.net

**Architecture note:** Not a monorepo — has `/backend`, `/frontend`, `/cf-proxy`. Functional but doesn't match the standard pattern.
```

---

### SpamShield (11/16) — `C:\JM Programs\SpamShield`

```markdown
## App-Specific: SpamShield

**Score: 11/16**

**CRITICAL:** Billing/subscription enforcement is missing. The app has pricing tiers displayed but no enforcement middleware.

**Remaining tasks (priority order):**
1. [ ] **CRITICAL: Implement subscription billing enforcement** — Stripe for web, Shopify Billing API for Shopify
2. [ ] Create mascot character
3. [ ] Create 60-second promo video script
4. [ ] Create screencast for Shopify submission
5. [ ] Complete Shopify App Store submission

**Key notes:**
- Has geo-detection (layer2-geo.ts) — geographic requirements ARE stated
- Landing page shows 3 paid tiers but no enforcement backend
```

---

### GrowthMap (10/16) — `C:\JM Programs\marketingapp`

```markdown
## App-Specific: GrowthMap

**Score: 10/16**

**Remaining tasks:**
- [ ] Add Google OAuth login (currently uses Supabase magic links only)
- [ ] Create mascot character (has logo but no mascot)
- [ ] Create 60-second promo video script
- [ ] Create screencast for Shopify submission
- [ ] Create separate marketing website (currently landing page is embedded in the app)
- [ ] Add geographic requirements to listing if applicable

**Architecture notes:**
- Single Next.js app (not monorepo) — handles both Shopify and web in one codebase
- Uses Supabase for auth (magic links) — add Google OAuth as additional option
- Uses nextstepjs for guided tour (10+ steps)
```

---

### TaxMatch (10/16) — `C:\JM Programs\TaxMatch`

```markdown
## App-Specific: TaxMatch

**Score: 10/16** — Good infrastructure, missing UX polish.

**Remaining tasks:**
- [ ] **Add guided tour / interactive walkthrough** (no tour library integrated yet)
- [ ] **Add tutorial system** (help page exists but no in-app interactive tutorials)
- [ ] Create mascot character
- [ ] Create 60-second promo video script
- [ ] Create screencast for Shopify submission
- [ ] **State geographic requirements: US/IRS-focused** — this app is specifically for US tax reconciliation
- [ ] Complete GDPR webhooks (currently commented out, awaiting Shopify API approval)

**IMPORTANT:** This app is US/IRS-specific. Geographic requirements MUST be stated in the Shopify listing to avoid review rejection (requirement 4.3.8).

**Architecture notes:**
- Full monorepo with apps/shopify, apps/web, apps/backend, packages/shared
- Pricing: Standard $9.99, Pro $19.99, Premium $24.99 + 14-day trial
```

---

### Jewelry Studio Manager (10/16) — `C:\JM Programs\Custom Design Tool - Customer Manager`

```markdown
## App-Specific: Jewelry Studio Manager (JSM)

**Score: 10/16**

**Remaining tasks:**
- [ ] Add Google OAuth login (currently JWT + Shopify OAuth only)
- [ ] Add "Created by JMS Dev Lab" footer with link to jmsdevlab.com
- [ ] Create screencast for Shopify submission
- [ ] Create mascot character (has icons but no named mascot)
- [ ] Add geographic requirements to listing if applicable

**Key notes:**
- Has 3 separate guided tours: Owner/Admin, Staff/Designer, Client Portal (25+ steps each)
- Has 4-step SetupWizard for onboarding
- Non-embedded Shopify app (unlike most others)
- Website at jewelrystudiomanager.com
```

---

### StaffHub (9/16) — `C:\JM Programs\Staff Hub`

```markdown
## App-Specific: StaffHub

**Score: 9/16**

**CRITICAL: Shopify review is blocked.** Fix these issues from the review (Reference: 102157):

1. **4.3.8 Geographic requirements:** App has Eircode/Irish address fields in valuations. State geographic requirements in listing OR remove region-specific fields.
2. **2.1.2 Bug: Error creating valuations** — fix the error shown in reviewer's screencast
3. **2.1.2 Bug: Training settings not saving** — settings changes must persist correctly
4. **2.1.2 Bug: Staff portal not visible** — testing instructions mention staff portal with credentials but reviewer can't find it in the app UI. Either add the portal to the UI or update testing instructions.

**After fixing review issues:**
- [ ] Market the web SaaS version separately (exists but not branded/marketed)
- [ ] Create mascot character (only has inline buddy avatar)
- [ ] Create 60-second promo video script
- [ ] Create screencast for Shopify submission
- [ ] Consider monorepo restructure (low priority)

**Architecture notes:**
- 3 separate apps sharing one Express backend: frontend (React admin), shopify-app (Remix embedded), public-app (storefront proxy)
- Backend on Railway, frontend on Vercel
- Reply to Shopify review email within 14 days or app gets paused
```

---

### Pitch Side (9/16) — `C:\JM Programs\Football Coaching App`

```markdown
## App-Specific: Pitch Side

**Score: 9/16** — Different model: free app, not Shopify.

**This is NOT a Shopify app.** Standalone web + Capacitor mobile app for grassroots football coaching. Intentionally free.

**Remaining tasks:**
- [ ] Add GDPR data export/deletion functionality (Firebase functions)
- [ ] Create mascot character
- [ ] Create 60-second promo video script
- [ ] Consider stating Irish football context (FAI rules) in app description

**What does NOT apply to this app:**
- Shopify integration (N/A)
- Billing/subscriptions (intentionally free)
- Shopify screencast (N/A)
- Monorepo structure (single app is fine for this)

**Architecture notes:**
- Next.js 16 + Firebase (Realtime DB + Auth + Hosting)
- Capacitor wrappers for iOS/Android
- Deployed at pitchsideapp.net
- Has comprehensive guided tour (36+ react-joyride steps)
- Has Google OAuth login
```

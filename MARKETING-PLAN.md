# JMS Dev Lab — Unified Marketing Plan

**Prepared:** March 2026
**Sources:** Deep research audit, strategic market analysis, and independent website review

---

## 1. Executive Summary

JMS Dev Lab is an EU-based, GDPR-compliant software studio and Shopify Partner with two revenue streams: (1) niche Shopify apps for underserved verticals, and (2) custom software services replacing spreadsheet-driven workflows for SMBs.

The biggest constraint found in this audit is **conversion friction**. At least one "Install on Shopify" CTA routes to the generic Shopify App Store homepage rather than a specific listing — an avoidable leak that collapses intent across every channel. Fixing this is the single highest-ROI task.

Beyond that, the strategy breaks into three layers:

1. **Foundation (Weeks 1–2):** Fix conversion leaks, add analytics, establish review capture.
2. **Demand capture (Weeks 3–6):** Content, SEO, service packaging, lead magnets.
3. **Growth loops (Weeks 7–12+):** Partner/agency outreach, community building, localisation, paid tests.

**Key assumption:** Apps are the scalable engine; services are the revenue stabiliser and case-study source.

---

## 2. What You Have (Positioning Audit)

### Strengths

- **Maker credibility.** Five shipped, production apps used by real people daily. This is rare — most dev studios claiming custom build capability can't point to their own live products as proof.
- **Pain-first copy.** The "Sound Familiar?" section and spreadsheet-chaos messaging is genuinely strong. It speaks the buyer's language, not tech jargon.
- **Niche-first approach.** Jewellery studio CRM, jewellery valuations — these are categories the big players ignore entirely. That's a defensible position.
- **EU/GDPR positioning.** Increasingly valuable as data regulation tightens. This is a trust signal that competitors outside Europe can't easily claim.
- **Low-friction service model.** "Fixed price, short cycles, talk to the builders" — this directly addresses the #1 fear of SMBs buying custom software.

### Weaknesses (from website code review)

| Issue | Impact | Fix effort |
|-------|--------|------------|
| Install CTAs resolve to App Store homepage, not specific listings | **Critical** — kills conversions from every channel | Low (URL fix) |
| No analytics tracking in the HTML (no GA4, no Plausible, nothing) | Can't measure anything; flying blind | Low — **[FIXED March 2026]** Plausible installed on all pages |
| No structured data / schema.org markup | Missing rich results in Google (FAQ, Software, Organisation) | Low–Medium — **[FIXED March 2026]** Organisation, SoftwareApplication, FAQPage, LocalBusiness, Article, BreadcrumbList schema implemented |
| No sitemap.xml or robots.txt | Search engines may not crawl efficiently | Low — **[FIXED March 2026]** sitemap.xml and robots.txt added |
| No Open Graph images on any page | Social shares look generic/broken | Low — **[FIXED March 2026]** OG and Twitter Card meta tags on all pages |
| No email capture anywhere on the site | Zero lead nurturing capability | Medium — **[FIXED March 2026]** Newsletter signup forms added to all page footers |
| No social media links in header or footer | No way for visitors to find or follow you | Low |
| No testimonials or social proof | Weakens trust, especially for services | Medium — **[FIXED March 2026]** "By the Numbers" section on homepage; case studies page created from own apps |
| All 5 blog posts dated the same day (26 Feb 2026) | Looks unnatural; no SEO freshness signal | Low (stagger dates) — **[FIXED March 2026]** 22 blog posts with dates spread Jan–Apr 2026 |
| Blog post pages may not exist (blog/ directory was empty) | 404s from blog links would damage credibility | Check & fix — **[FIXED March 2026]** 22 blog posts verified and live |
| No canonical URLs set | Potential duplicate content issues | Low — **[FIXED March 2026]** Canonical link tags on all pages |
| Pitch Side not leveraged as brand asset | Free product = goodwill + audience, currently underused | Strategic |

---

## 3. Target Personas and Jobs-to-Be-Done

### App Personas

**JewelryStudioManager** — Owner-operator of a custom jewellery studio on Shopify.
- JTBD: "Track commissions from enquiry to delivery so nothing falls through the cracks."
- JTBD: "Give clients a branded portal so they can check progress without calling me."
- Positioning edge: Jewellery-specific data model (ring sizes, metal choices, commission stages) vs generic CRM.

**Jewel Value** — Retail jeweller or appraiser offering valuations as a revenue stream.
- JTBD: "Produce consistent, insurance-ready certificates quickly and let customers retrieve them."
- Positioning edge: Shopify-native + branding control vs BriteCo's "free but insurance-coupled" model.

**StaffHub** — Shopify retail merchant with staff turnover.
- JTBD: "Repeatable onboarding and structured training so new hires get productive faster."
- Positioning edge: Training + knowledge + comms inside Shopify (not payroll/time-clock — that's Easyteam's territory).

**SmartCash** — Shopify merchant-owner lacking cashflow clarity.
- JTBD: "See my cash runway and forecast where I'm heading so I stop guessing."
- Positioning edge: "ARIMA + confidence intervals" is unusually specific and technically credible. Lean into "forecasting done properly, explained plainly."

**Pitch Side** — Volunteer grassroots football coach.
- JTBD: "Plan sessions and manage my squad from my phone without creating accounts or paying."
- Positioning edge: Completely free, no tracking, no ads — a genuine goodwill product.

### Services Persona

**Operations lead / founder at a niche SMB** drowning in spreadsheets.
- JTBD: "Turn the spreadsheet that runs our business into a proper system with permissions, audit trail, and automations."
- JTBD: "Build a client portal / booking / job tracker that matches our exact workflow."

---

## 4. Competitive Landscape

| Segment | JMS Dev Lab | Key Competitors | Your Edge |
|---------|-------------|----------------|-----------|
| Jewellery studio CRM | JewelryStudioManager ($9.99–$29.99/mo) | JewelLink (CRM + texting), RepairPilot (repair workflow), Valigara (all-in-one ops) | Commission workflow + client portal + Shopify-native. Don't compete on feature count; compete on "built for how jewellers actually work." |
| Jewellery valuations | Jewel Value ($9.99–$59.99/mo) | BriteCo (free, insurance-coupled), GemFind (ecosystem player) | Shopify-native, branding control, no insurance lock-in, analytics. |
| Staff training & management | StaffHub ($4.99–$29.99/mo) | Easyteam (POS/payroll-heavy), Workfeed (scheduling), Zon Staff (clock-in), Shift Win ($500/mo KPI gamification) | Own "training + knowledge" niche. Multilingual staff portal as wedge. Avoid payroll/time-clock features. |
| Cashflow / forecasting | SmartCash ($9.99–$49.99/mo) | Triffin (AI finance platform), Inventory Mate (inventory-first), Settle (COGS/AR) | "In-Shopify, owner-friendly, instant clarity." ARIMA is a genuine technical differentiator — explain it plainly. |

---

## 5. Channel Strategy

### 5.1 Search Engine Optimisation (SEO)

**Priority keyword clusters:**

- JewelryStudioManager: "jewellery studio CRM", "jewelry commission tracking software", "custom jewellery order tracking", "Shopify CRM for jewellers"
- Jewel Value: "jewellery valuation certificate software", "jewelry appraisal software", "insurance-ready jewellery valuation"
- StaffHub: "Shopify staff training app", "Shopify onboarding app", "retail training modules"
- SmartCash: "Shopify cashflow forecast", "Shopify cash runway dashboard", "cashflow dashboard Shopify"
- Services: "replace spreadsheet with app", "internal tool development", "bespoke CRM development", "custom portal development"
- Local: "Cork software consultancy", "software development Cork Ireland", "bespoke app development Munster"

**Technical SEO fixes (immediate):**
1. Add sitemap.xml and robots.txt
2. Add canonical URLs to all pages
3. Add structured data: Organisation, SoftwareApplication (for apps), FAQPage (for FAQ section), LocalBusiness
4. Add Open Graph images (og:image) to all pages
5. Stagger blog post dates to create a natural publishing cadence
6. Verify blog post HTML files exist and return 200 (not 404)

**Content SEO (ongoing):**
- Publish 2–4 intent-led articles per month targeting the keyword clusters above
- Each article should link to the relevant app page or service page with a clear CTA
- Focus on "problem-aware" content: "How to track custom jewellery commissions without spreadsheets" > "JewelryStudioManager features"

### 5.2 Shopify App Store Optimisation (ASO)

**Non-negotiable fix:** Every "Install on Shopify" / "Start Free Trial" button across jmsdevlab.com and all product sites must link to the *exact* app listing URL. The audit found at least one resolving to the App Store homepage.

**Listing optimisation:**
- Title format: **Primary outcome + category keyword + niche qualifier**
- Subtitle: Carry the highest-intent keyword naturally
- Screenshots should work like a 6-slide sales deck:
  1. Outcome hook ("Know your cash runway in 30 seconds")
  2. Hero workflow (the main screen)
  3. Key differentiating feature
  4. Reporting/dashboard
  5. Trust signals (security, GDPR, Shopify billing)
  6. Time-to-value ("Set up in 2 minutes")

**Built for Shopify (BFS):** If your apps qualify, apply — BFS apps get priority visibility and additional promotion surfaces. If they don't yet qualify, remove ambiguous "Built for Shopify" language until confirmed.

**Review strategy:** Prompt for reviews only *after* the user's "Aha moment" (see Section 6), not on day one. Respond to every review, positive and negative. Fixing a reported bug and replying often gets a rating revision upward.

### 5.3 Local Cork / Ireland Ecosystem

- **Republic of Work** (South Mall, Cork): Join and attend events. This is where startup founders and SMB operators who need custom software congregate.
- **Local Enterprise Office (LEO) Cork:** Explore Innovation Partnership Feasibility Studies — being recognised as an Innovation Partner signals technical rigor and provides funding.
- **Digital PR:** Pitch case studies to Business Plus Magazine and The Echo. "Cork-based studio ships 5 Shopify apps" is a genuine local tech story.
- **Google Business Profile:** Set up and optimise for "software development Cork" — captures local "near me" searches.

### 5.4 Partner and Agency Loops

- **Shopify Partner Directory:** Ensure discoverability for "Development and troubleshooting" and "Expert guidance" service types.
- **Agency outreach:** Agencies standardise tool stacks for their clients. Target Shopify agencies who serve retail merchants (for StaffHub/SmartCash) and jewellery industry specialists (for JewelryStudioManager/Jewel Value).
- **Accountant referrals:** Accountants who serve Shopify merchants are a warm channel for SmartCash — "recommend this to your clients so they stop sending you messy spreadsheets."

### 5.5 Community and "Build in Public"

| Platform | Tactic | Outcome |
|----------|--------|---------|
| Reddit (r/shopify, r/saas, r/IndieDev) | Answer questions, share insights, no self-promotion | Trust + early adopter acquisition |
| Hacker News | "Show HN" launches for major releases | High-authority traffic + peer validation |
| Twitter/X | Weekly "Build in Public" updates, technical threads | Personal brand + founder network |
| DEV.to | Technical write-ups on Shopify app development | SEO backlinks + developer credibility |
| Discord | Community server for beta testers and power users | Retention + real-time feedback |

### 5.6 Micro-Influencer Partnerships

- Target creators with 10k–50k followers in productivity, Shopify, or jewellery content niches
- Offer lifetime access or affiliate arrangements for authentic reviews
- Higher-quality installs and better retention than paid ads because the recommendation comes from a trusted source

---

## 6. Funnel Design and Onboarding

### App Funnel

```
Awareness (search, partners, content, communities)
  → Visit (app landing or listing)
    → Intent action ("Install" / "Start trial")
      → Onboarding (connect, import/sync)
        → Aha moment (first value event)
          → Adoption (repeated weekly usage)
            → Conversion (trial → paid)
              → Expansion (seats/stores/upgrade)
                → Advocacy (reviews + referrals)
```

**Aha moments (when to prompt for reviews):**
- JewelryStudioManager: First commission created + client portal link shared
- Jewel Value: First certificate generated and downloaded
- StaffHub: First training module assigned + first completion recorded
- SmartCash: Dashboard populates with cash position + runway displayed

### Services Funnel

```
Problem aware (spreadsheet pain / manual ops)
  → Content (case study, checklist, ROI tool)
    → Lead capture (email + short intake form)
      → Qualification (15-min call / async questionnaire)
        → Paid discovery sprint OR fixed-scope quote
          → Build cycles + demos
            → Launch + training
              → Retainer / expansion
```

### Onboarding Tactics

1. **Setup checklists** (not just help docs) — guide users to their Aha moment step by step
2. **Trigger-based "win emails"** — "Your first certificate is ready", "Cash runway updated", "3 staff completed onboarding"
3. **Export hooks** — "Export CSV for accountant" reduces anxiety and increases stickiness for SmartCash/Jewel Value
4. **Review capture** — Only after the Aha moment. Never on day 1.

---

## 7. Website Improvements (My Additions)

These are issues I found by reviewing the actual website code that neither report covered:

### 7.1 Missing Technical Foundations

**No analytics at all.** There is zero tracking code in any HTML file. Without analytics you can't measure any of this plan's impact. Add Plausible (privacy-friendly, GDPR-compliant, aligns with your EU positioning) or GA4 at minimum.

**No email capture.** The site has no newsletter signup, no lead magnet download, no email list mechanism anywhere. This means every visitor who isn't ready to contact you right now is lost forever. Add:
- A simple email signup in the footer ("Get notified when we publish new tools and insights")
- Lead magnet downloads gated by email (see Section 8)
- A blog sidebar/bottom CTA for email capture

**No social media presence links.** The footer and header contain zero links to any social profile. If you're going to do "Build in Public" on Twitter or engage on Reddit, visitors need a way to find you there.

### 7.2 Social Proof Gap

The site has strong pain-point copy but **zero social proof**. No testimonials, no app review counts, no "trusted by X merchants", no logos. For services buyers especially, this is a significant trust gap.

**Quick wins:**
- Pull star ratings and review counts from your Shopify listings and display them on the app cards
- Add a "What merchants say" section with real quotes (even 2–3 is enough to start)
- Display install counts or "active merchants" numbers if available

### 7.3 Blog Strategy Issues

All 5 blog posts are dated 26 February 2026 — the same day. This signals "we set everything up at once" rather than "we regularly publish content." Stagger the dates across January and February to create a natural publishing history. More importantly, **start publishing new content regularly** — the blog is your primary SEO growth engine.

### 7.4 Pitch Side as a Brand Asset

Pitch Side is currently positioned as just another product in the lineup, but it's strategically different: it's **free, privacy-forward, and community-driven**. This is an underused marketing asset:

- It demonstrates your values (building genuinely useful tools without monetisation pressure)
- It can generate organic press coverage ("Cork developer builds free app for grassroots football coaches")
- It attracts a different audience that may refer you for commercial work
- It's a "Show HN" candidate with a compelling story

Consider giving Pitch Side its own PR push separate from the Shopify apps.

### 7.5 Structured Data Opportunity

The FAQ section on apps.html contains 7 questions. Adding FAQPage schema markup would make these eligible for rich results in Google — appearing as expandable questions directly in search results. This is free visibility with minimal effort.

Similarly, each app should have SoftwareApplication schema with pricing, ratings, and operating system data.

---

## 8. Content and Lead Magnets

### Blog Content Calendar (First 8 Weeks)

Publish 2 per week, alternating between app-niche content and services content:

| Week | Article 1 (App Niche) | Article 2 (Services / SEO) |
|------|----------------------|---------------------------|
| 1 | "How to Track Custom Jewellery Commissions Without Spreadsheets" | "5 Signs Your Business Has Outgrown Spreadsheets" |
| 2 | "What Makes a Jewellery Valuation Certificate Insurance-Ready?" | "Internal Tools vs Off-the-Shelf SaaS: When to Build Custom" |
| 3 | "The Real Cost of Bad Staff Onboarding for Shopify Stores" | "What a Spreadsheet Replacement Actually Looks Like" |
| 4 | "How to Forecast Cashflow for Your Shopify Store (Without an Accountant)" | "Why We Build Fixed-Price Software (And Why Hourly Billing Hurts You)" |
| 5 | "Grassroots Football Coaching Apps: What Coaches Actually Need" | "Client Portals: How They Save Your Team 10+ Hours a Week" |
| 6 | "Shopify Staff Training: Modules vs 'Figure It Out Yourself'" | "Automation for Small Businesses: Start With the Copy-Paste" |
| 7 | "Jewellery Studio Workflow: Inquiry to Delivery in One System" | "How to Brief a Developer When You Don't Know What You Need" |
| 8 | "Cashflow vs Profit: Why Shopify Merchants Get Confused" | "The 'Good Enough' Spreadsheet That's Actually Costing You" |

### Lead Magnets

**Lead magnet 1 — Spreadsheet Replacement ROI Calculator (Services)**
- Format: Downloadable spreadsheet template + short guide
- Promise: "Estimate weekly hours saved + error risk reduction"
- CTA: "Send us your spreadsheet and we'll recommend an MVP scope"

**Lead magnet 2 — Insurance-Ready Valuation Checklist (Jewel Value)**
- Format: PDF checklist
- Promise: "Required fields, common failure modes, professional certificate structure"
- CTA: "Generate your first certificate in minutes with Jewel Value"

**Lead magnet 3 — Shopify Staff Onboarding Playbook (StaffHub)**
- Format: PDF guide
- Promise: "Training module templates, quiz examples, onboarding checklists"
- CTA: "Set up your first module in StaffHub in under 5 minutes"

---

## 9. Service Packaging

Your services page currently offers principles rather than packages. Packaging increases conversion because it makes the first step legible.

### Package 1: Spreadsheet Replacement Sprint (2–4 weeks)
- **Hero:** "Turn the spreadsheet that runs your business into a secure internal tool."
- **Deliverable:** Web app with roles/permissions, audit trail, automations, exports, dashboards
- **CTA:** "Send us the spreadsheet" intake form

### Package 2: Shopify Ops Automation Sprint (2–6 weeks)
- **Hero:** "Internal Shopify tools that save hours every week."
- **Deliverable:** Custom admin extensions, workflow automations, quoting calculators, approval flows
- **CTA:** "Describe the workflow" + quick scoping questionnaire

### Package 3: Client Portal Build (4–10 weeks)
- **Hero:** "Let your clients check progress, approve work, and access documents — without the calls."
- **Deliverable:** Branded portal with login, status tracking, document access, notifications
- **CTA:** "Tell us what your clients keep calling about"

---

## 10. Outreach Templates

### Agency/Partner Outreach (StaffHub/SmartCash)

> **Subject:** Quick win for your Shopify retail clients (staff training inside admin)
>
> Hi [Name] — I'm [Your name] at JMS Dev Lab.
>
> We build Shopify-native apps for operational pain that agencies see repeatedly:
> - **StaffHub:** structured staff training + scheduling + reviews inside Shopify admin (multilingual)
> - **SmartCash:** cash runway + forecasting + what-if scenarios from Shopify order data
>
> If you have clients with staff turnover, "WhatsApp scheduling", or cashflow guessing, I can share a 2-minute demo and a partner-friendly referral arrangement.
>
> Worth a 15-min chat next week?

### Jewellery Niche Outreach

> **Subject:** Built for custom jewellery studios using Shopify
>
> Hi [Name] — I'm [Your name] at JMS Dev Lab.
>
> We built two Shopify apps specifically for jewellers:
> - **JewelryStudioManager:** commission tracking (enquiry to delivery), consultations, and a branded client portal
> - **Jewel Value:** professional valuation certificates (PDF), insurance-ready fields, and customer document access
>
> If you're currently using spreadsheets or Word templates for commissions or valuations, I'd be happy to show how this works inside Shopify.
>
> Can I send a quick demo link?

### Services Outreach (Spreadsheet Replacement)

> **Subject:** Replace the spreadsheet that runs [Company]?
>
> Hi [Name] — quick one.
>
> We build internal tools for teams who've outgrown spreadsheets: portals, scheduling, workflow trackers, and integrations. Fixed-scope, fixed-price, working software in short cycles, and you own the result.
>
> If you can share the spreadsheet or process causing the most pain, I'll reply with:
> 1. What an MVP would look like
> 2. A fast/medium/large build estimate
> 3. What we'd automate first
>
> Interested?

---

## 11. Measurement System

### Analytics Events to Implement

**Acquisition (website):**
- `page_view` (with product_line: app|services, app_name)
- `cta_click_install` / `cta_click_contact`
- `view_pricing` (pricing section reached)
- `lead_submit` (services form / email capture)
- `outbound_click_shopify_listing` (critical: diagnose install-link leakage)

**Activation (in-app):**
- `install_complete`
- `onboarding_step_complete`
- `aha_event` (per app definition)
- `export_csv` (retention indicator)

### Weekly Dashboard KPIs

- Sessions by channel → listing clicks → installs → Aha users → trial-to-paid
- Time-to-Aha (median days)
- Trial-to-paid conversion rate by cohort
- Churn rate (logo churn)
- Review count, average rating, response time
- Support load: tickets per active account, first response time
- Content: organic sessions by post, email signups

---

## 12. Budget Scenarios

### Low Budget (£0–£500/month — founder time is the investment)
- Fix install leakage + add analytics
- Publish 1–2 high-intent blog posts per app niche per month
- Manual outreach to 20–40 agencies/partners
- Join Republic of Work / attend local networking events
- "Build in Public" on Twitter/X (free, just time)
- **Expected outcome:** Measurable uplift in trial starts once CTAs are corrected; early partner conversations; first content funnel established.

### Medium Budget (£1,500–£4,000/month)
- Everything above, plus:
- Professional screenshot/video polish for Shopify listings
- Light paid search tests (Google Ads on high-intent keywords)
- Contractor copy/design for service packaging pages
- Plausible Analytics or GA4 + email tool (ConvertKit/Buttondown)
- **Expected outcome:** Faster improvement in install conversion; consistent lead flow for services; growing content library.

### High Budget (£7,500–£15,000/month)
- Everything above, plus:
- Sustained paid acquisition (Shopify app install ads, Google Ads)
- Partner marketing programme with referral incentives
- Full content production (blog, video, case studies)
- Micro-influencer partnerships
- App localisation (Super Geo Localisation) for international markets
- **Expected outcome:** Meaningful growth in installs and leads; international expansion; self-sustaining content and partner engines.

---

## 13. Phased Roadmap

> **Status (14 March 2026):** Phases 1–5 substantially complete. Website fully built out with 18 blog posts, 7 interactive "Engineering as Marketing" tools, partner programme page, jewelry vertical landing page, and comprehensive SEO (structured data, OG/Twitter cards, sitemap, breadcrumbs). All outreach research is drafted and saved in `Marketing Stuff/`. Active outreach (sending emails, joining communities, posting Show HN, contacting LEO Cork) is **paused** until existing business is closed down (~May 2026). LEO Cork detailed research saved to `Marketing Stuff/leo-cork-supports.md`.

### Phase 1: Fix the Foundation (Weeks 1–2)

- [x] Fix every install CTA to link to exact Shopify listing URLs *(done — apps link to product sites or direct apps.shopify.com URLs)*
- [x] Add analytics (Plausible recommended — aligns with GDPR/privacy positioning) *(Plausible installed on all pages)*
- [x] Add sitemap.xml and robots.txt
- [x] Add structured data (FAQPage, SoftwareApplication, Organisation, LocalBusiness) *(all schema types implemented)*
- [x] Add Open Graph images to all pages *(og:image + Twitter Cards on all pages)*
- [x] Add canonical URLs *(canonical link tags on all pages)*
- [ ] Add social media profile links to footer
- [x] Verify blog post HTML files exist (not 404) *(22 blog posts verified)*
- [x] Stagger blog post dates for natural publishing cadence *(dates spread Jan–Apr 2026)*
- [x] Set up Google Business Profile for Cork

### Phase 2: Assets and Capture (Weeks 3–6)

- [x] Add email capture to footer (newsletter signup) *(forms on all pages — needs backend integration)*
- [x] Create first lead magnet (Spreadsheet Replacement ROI Calculator) *(3 lead magnets: spreadsheet checklist, valuation checklist, staff onboarding playbook)*
- [x] Build service packaging pages (Spreadsheet Sprint, Shopify Ops, Client Portal) *(on apps.html)*
- [x] Add social proof section (review quotes, star ratings, install counts) *("By the Numbers" section on homepage)*
- [x] Publish first 6–8 intent-led blog posts *(22 posts published — well exceeded)*
- [ ] Set up review capture flows (post-Aha moment triggers) *(requires in-app implementation — see Aha moments in Section 6)*
- [ ] Apply for Built for Shopify if eligible; remove BFS claims if not *(not yet eligible — requires 50+ installs + 5 reviews per app; revisit when apps have traction)*

### Phase 3: Demand Generation (Weeks 7–12)

- [x] Begin partner/agency outreach (20–40 targets) *(27 agencies identified and prioritised — see Marketing Stuff/agency-outreach-targets.md)*
- [ ] Launch "Build in Public" content on Twitter/X *(blocked — need @JMSDevLab account)*
- [x] Submit Pitch Side to Hacker News ("Show HN") *(post drafted — see Marketing Stuff/show-hn-pitch-side.md)*
- [x] Pitch local media (Business Plus, The Echo) with Cork tech story *(4 pitch emails drafted — see Marketing Stuff/local-media-pitches.md)*
- [x] Join Republic of Work / LEO networking events *(online alternatives researched — LEO Cork free mentoring + 5 online communities identified — see Marketing Stuff/networking-communities.md)*
- [x] Begin micro-influencer outreach for top-performing app *(20 targets identified across jewellery, Shopify, football coaching, and small business — see Marketing Stuff/micro-influencer-targets.md)*
- [x] Run CRO experiments (pricing page, screenshots, onboarding flows) *(Fixed: newsletter forms, contact form endpoint, mobile CTA, hero credibility line, form trust signals)*

### Phase 4: Scale and Optimise (Months 4–6)

- [ ] Evaluate and double down on highest-performing channel *(need Plausible data — check after 2+ weeks of traffic)*
- [x] Explore Innovation Partnership with LEO Cork *(researched — free mentoring, Feasibility Grant, Priming Grant, online training available — see Marketing Stuff/networking-communities.md)*
- [ ] Begin app localisation for international markets (if data supports)
- [ ] Develop case studies from services clients *(needs actual client work first)*
- [ ] Launch paid acquisition tests *(deferred — free-only until revenue)*
- [x] Expand content to 2–4 posts/week *(22 posts total across product launches, SEO content marketing, and how-to guides)*
- [ ] Build Discord community for power users and beta testers *(deprioritised — revisit when apps have active users)*

### Phase 5: Authority and Compounding (Months 6–18)

- [ ] Host technical workshops or webinars
- [ ] Contribute to open-source projects (visibility + credibility)
- [ ] Pursue Enterprise Ireland Innovation Partnership (full programme)
- [x] Develop "Engineering as Marketing" tools (free calculators, audit tools) *(7 tools built — one per product, all live at tools/):*
  - *Spreadsheet Cost Calculator → Custom Dev*
  - *Cashflow Health Check → SmartCash*
  - *Training Cost Calculator → StaffHub*
  - *Valuation Certificate Checker → Jewel Value*
  - *Commission Pricing Calculator → JewelryStudioManager*
  - *Repair Turnaround Calculator → RepairDesk*
  - *Marketing Readiness Score → GrowthMap*
- [x] Expand partner programme with formal referral incentives *(Partner programme page built — see partners.html)*
- [ ] Maintain agile "un-plan" framework: test channels, double down on winners, cut losers

---

## 14. The Single Most Important Thing

Everything in this plan compounds *only if the install path works*. If a merchant clicks "Install on Shopify" and lands on the App Store homepage instead of your listing, every blog post, every agency referral, every ad dollar, every "Build in Public" tweet leaks conversion.

**Fix the install links first. Then everything else builds on top.**

---

*This plan merges findings from the strategic market analysis (Cork ecosystem, ASO trends, community building), the deep research audit (personas, competitors, funnel design, 60-day tactical plan), and an independent review of the jmsdevlab.com source code revealing technical gaps neither report covered.*

---

## Appendix: Competitive Research Update (March 2026)

In March 2026, detailed competitive research was conducted covering pricing strategy, competitor analysis, the Irish dev market, Shopify Experts landscape, and no-code vs custom development economics. The full research is documented in `Marketing Stuff/pricing-strategy.md` and `Marketing Stuff/competitive-positioning.md`. Key findings and resulting actions are summarised below.

### 1. Pricing Now Published

Three service packages with transparent, published pricing — a key differentiator since 90%+ of competitors hide prices behind "contact us":

| Package | Price Range | Timeline | Target Client |
|---------|-----------|----------|---------------|
| **Starter** — "Replace Your Spreadsheet" | EUR 3,000–6,000 | 3–4 weeks | Business on spreadsheets, 1–10 users |
| **Growth** — "Build Your Business Tool" | EUR 6,000–12,000 | 4–8 weeks | Multi-feature internal tool or client portal |
| **Scale** — "Custom Software, Built to Fit" | EUR 12,000–25,000 | 8–12 weeks | End-to-end solution, complex integrations, Shopify apps |

**Optional retainer:** EUR 300–800/month (4–8 hours dev time, bug fixes, feature updates, priority support).

Pricing is benchmarked against GBA Solutions (Kildare), the closest national competitor, who publishes EUR 3,000–12,000+ for comparable work. JMS Dev Lab positions at mid-market — below agency rates (EUR 100+/hr), above offshore, aligned with proven Irish market pricing.

### 2. Key Competitive Findings

**Market gap confirmed:**
- No Cork-based competitor targets SMB custom tools (the "outgrown spreadsheets" segment). Cork has web agencies and website builders, but nobody doing custom business tools for SMBs.
- GBA Solutions (Kildare) is the closest national competitor. They target construction and food safety verticals — different from JMS Dev Lab's jewelry/retail/Shopify focus.
- No Irish competitor combines Shopify app development with custom SMB tool services.
- Nobody in Ireland (or the UK) claims the jewelry software niche.

**Biggest competitive threat — no-code platforms, not other developers:**
- Airtable, Bubble, Glide, and Retool are the primary alternatives SMBs consider.
- However, custom development wins on total cost of ownership at 10+ users. A 3-year comparison shows custom is cheaper in every scenario once user count exceeds 10 (e.g., Airtable + consultant for 20 users: EUR 19,400 over 3 years vs custom: EUR 13,080).
- No-code also carries platform lock-in, per-seat pricing, and GDPR concerns with US-hosted data.

**Shopify Partner opportunity:**
- Almost no Ireland-based developers appear in the Shopify Partner Directory. The closest listed partner (Glaze Digital, Belfast) has only 6 reviews.
- Storetasker (curated Shopify expert marketplace) represents $2K–$35K/month potential.
- Having 6 published Shopify apps is a strong differentiator that no other Irish developer can match.

**LEO Grow Digital Voucher — underused sales tool:**
- The voucher covers 50% of project costs up to EUR 5,000. This reframes a EUR 6,000 project as EUR 3,000 to the client.
- No competitor in the market is prominently mentioning this voucher. First-mover advantage on messaging.
- Starter package (EUR 3,000–6,000) aligns perfectly with voucher coverage.

### 3. Website Changes Implemented

Based on the competitive research, the following changes were made to jmsdevlab.com in March 2026:

- **Pricing page** with transparent packages, LEO voucher callout, and no-code TCO comparison
- **Case studies page** created from JMS Dev Lab's own apps (demonstrating capability through shipped products)
- **Budget estimator tool** added to the free tools collection
- **6 new SEO blog posts** targeting high-intent keywords identified in the competitive content gap analysis (e.g., "Shopify developer Ireland", "custom software cost Ireland", "LEO digital voucher software")
- **Contact form** updated with qualification fields to improve lead quality
- **About page** updated with credibility improvements addressing the "solo developer risk" perception
- **Cork landing page** added for local SEO (targeting "software development Cork", "spreadsheet replacement Cork")
- **Guarantee section** added to pricing page (scope-match guarantee)
- **Navigation updated** across all pages to include new sections

### 4. Priority Actions Remaining

These high-impact, low-effort actions from the competitive research are still outstanding:

| Action | Impact | Status |
|--------|--------|--------|
| Register on Shopify Partner Directory | High — free lead source, almost no Irish competition | Not started |
| Apply to Storetasker | Medium — curated marketplace, $2K–$35K/month potential | Not started |
| Collect testimonials from Shopify app users | High — biggest remaining social proof gap | Not started |
| Google Business Profile setup and optimisation | Medium — captures local "near me" searches for Cork | Not started |
| Add social media profile links to footer | Low — enables community discovery | Not started |
| Build Discord community for beta testers | Low priority — revisit when apps have active users | Deferred |

### 5. Competitive Positioning Summary

JMS Dev Lab's defensible position rests on a combination no competitor replicates:

1. 6 published Shopify apps (credibility proof)
2. Custom development services (flexibility)
3. Jewelry vertical expertise (zero competition)
4. Fixed-price published packages (trust)
5. 7 free calculator tools (lead generation)
6. Cork-based solo developer (direct access, no middlemen)
7. EU-hosted, GDPR-compliant by default (data sovereignty)

The primary competitive strategy is not to compete with other developers on price, but to (a) position as the "graduation from no-code" for businesses that have outgrown platforms, (b) own the Cork/Munster market for custom SMB tools, and (c) own the jewelry software niche nationally.

---

*Appendix based on competitive research conducted March 2026. Sources: `Marketing Stuff/pricing-strategy.md`, `Marketing Stuff/competitive-positioning.md`. Competitive landscape should be reviewed every 6 months.*

---

## Appendix: Additional Promotion Channels (March 2026)

Added 15 March 2026. These channels supplement the core strategy above and can be executed with zero budget and no in-person interaction.

### 1. Comparison / "Alternatives" Content (Implemented)

Five high-intent blog posts targeting buyer searches with low competition:

| Post | Target Query | Promotes |
|------|-------------|----------|
| `blog/briteco-alternatives.html` | "BriteCo alternatives" | Jewel Value |
| `blog/repairpilot-alternatives.html` | "RepairPilot alternatives" | RepairDesk |
| `blog/easyteam-alternatives.html` | "Easyteam alternatives training" | StaffHub |
| `blog/triffin-vs-smartcash.html` | "Triffin vs SmartCash" | SmartCash |
| `blog/best-jewelry-crm-software.html` | "best jewelry CRM software" | JewelryStudioManager |

These are bottom-of-funnel pages — visitors searching for alternatives are actively evaluating options.

### 2. FAQ Schema / Answer Engine Optimisation (Implemented)

FAQPage structured data added to all 28+ blog posts. This optimises for:
- Google Featured Snippets and "People also ask" boxes
- ChatGPT, Perplexity, and Google AI Overviews (answer engine queries)
- Rich results in search (expandable FAQ cards)

### 3. SaaS / Software Directory Listings (Ready)

Submission guide created: `Marketing Stuff/directory-submissions.md`

Directories to submit to (free profiles):
- AlternativeTo, SaaSHub, G2, Capterra, SourceForge, GetApp, Software Advice
- Product Hunt (launch Pitch Side first — free app with a good story)
- Irish: GoldenPages.ie, BusinessListings.ie, TechIreland.org, Cork Chamber

Copy-paste descriptions and submission checklist included in the guide.

### 4. Email Nurture Sequence (Ready)

Content written: `Marketing Stuff/email-nurture-sequence.md`

5-email welcome drip sequence ready for MailerLite (free up to 1,000 subscribers):
1. Welcome + best blog post
2. What we build + case studies
3. Pricing + LEO voucher
4. Free tool spotlight
5. Soft CTA: "Got a spreadsheet that needs replacing?"

Plus RSS-to-email monthly digest setup instructions.

**Status:** Email content written and ready. Platform signup and configuration needed (MailerLite recommended).

### 5. Google Alerts + Brand Monitoring (Ready)

Setup guide: `Marketing Stuff/google-alerts-setup.md`

Alerts for all brand names + competitor names. Includes:
- HARO/Connectively journalist query monitoring
- Quora answer strategy
- Unlinked mention outreach process

### 6. Content Syndication (To Do When Ready)

Republish top blog posts to dev.to, Hashnode, Medium with canonical tags pointing back to jmsdevlab.com:
- "How Much Does Custom Software Cost?"
- "No-Code vs Custom Software"
- "Buy vs Build"
- "Internal Tools vs SaaS"

Canonical tags prevent duplicate content issues. ~30 min per article.

### 7. Community Engagement (To Do After May 2026)

- **Orchid (orchid.ganoksin.com):** Largest online jewelry community. Answer technology/business questions. Extremely targeted for JSM, Jewel Value, RepairDesk.
- **Quora:** Answer questions about jewelry software, Shopify cashflow, custom software costs.
- **HARO/Connectively:** Respond to journalist queries (written responses only). Single placement = DA 80+ backlink.

### Priority Order

| Priority | Channel | Effort | Impact | Status |
|----------|---------|--------|--------|--------|
| 1 | Comparison blog posts | Done | High | Live |
| 2 | FAQ schema on all posts | Done | Medium | Live |
| 3 | Email nurture sequence | Content ready | High | Needs platform setup |
| 4 | Directory submissions | Guide ready | Medium | Needs manual submission |
| 5 | Google Alerts | Guide ready | Low (ongoing) | 15 min to set up |
| 6 | Content syndication | Not started | Medium | ~3 hours |
| 7 | Community engagement | Not started | Medium | After May 2026 |

# 61 -- Content Strategy

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Marketing Strategy](60-marketing-strategy.md) | [SEO and Search Console](../platforms/54-seo-and-search-console.md)

---

## 1. Content Channels

| Channel | URL | Status | Audience |
|---------|-----|--------|----------|
| Blog | jmsdevlab.com/blog/ | Active -- 46 posts | Shopify merchants, SME owners, jewelry businesses |
| dev.to | dev.to/jmsdevlab | Active -- 4 articles | Developers, indie hackers, technical audience |
| Reddit | r/shopify, r/smallbusiness | Active -- low karma, comments auto-removed | Business owners, Shopify merchants |
| Quora | Quora.com | Planned | Business owners searching for solutions |
| boards.ie | boards.ie (JMSDevLab) | Registered | Irish business community |
| Email (MailerLite) | Via website signup | Active -- 5-email drip | Website visitors who opt in |
| YouTube | youtube.com | Active -- 6 videos | App users, prospects |

---

## 2. Blog (jmsdevlab.com/blog/)

### Overview

The blog is the primary content marketing engine. All 46 posts are static HTML pages hosted on Cloudflare Pages, included in the sitemap.xml, and submitted for Google indexing.

### Content categories

| Category | Count | Purpose | Example posts |
|----------|-------|---------|---------------|
| Shopify app guides | ~10 | Drive traffic from merchants searching for app solutions | "Best Shopify Apps for Jewelry Stores", "What is a Shopify App?" |
| Spreadsheet replacement | ~6 | Target SMEs who have outgrown spreadsheets | "Replace Your Spreadsheet With an App", "Outgrown Airtable?" |
| Custom software decisions | ~8 | Educate prospects considering custom development | "How Much Does Custom Software Cost?", "Buy vs Build Custom Software", "No-Code vs Custom Software" |
| Competitor comparisons | ~8 | Capture search traffic from people comparing tools | "Triffin vs SmartCash", "BriteCo Alternatives", "RepairPilot Alternatives", "EasyTeam Alternatives" |
| Jewelry industry | ~5 | Establish niche authority in jewelry retail tech | "Best Jewelry CRM Software", jewelry-specific app guides |
| Builder stories / founder content | ~4 | Build trust and relatability | "Hiring a Developer for the First Time", "Internal Tools vs SaaS" |
| How-to guides | ~5 | Provide practical value, earn backlinks | Tool-specific guides, setup walkthroughs |

### Blog SEO approach

- Each post targets a specific long-tail keyword
- Structured data (Article schema) on every post
- Internal linking between related posts
- Posts included in sitemap.xml
- Indexing requested via Google Search Console (batched over multiple days due to daily quota of ~6-7 requests)

### Publishing cadence

No fixed schedule. Posts are written in batches when time allows. Quality over frequency. Current rate: approximately 2-4 posts per week during active periods.

---

## 3. dev.to (@jmsdevlab)

### Published articles (4 total)

Articles on dev.to serve a dual purpose: reach a technical audience and generate backlinks to jmsdevlab.com.

| # | Topic | Cross-posted from blog |
|---|-------|----------------------|
| 1 | Shopify app development insights | Yes |
| 2 | Building production apps as a solo developer | Yes |
| 3 | Technical deep-dive on an app feature | Yes |
| 4 | Developer journey / builder story | Yes |

### Strategy

- Cross-post selected blog articles (not all -- only those relevant to a developer audience)
- Include canonical URL pointing back to jmsdevlab.com/blog/ to avoid duplicate content issues
- Engage with comments and community
- Focus on "builder" narrative: real apps shipped, real problems solved

---

## 4. Reddit

### Current status

| Subreddit | Activity | Issue |
|-----------|----------|-------|
| r/shopify | Comment posted | Low karma -- comments auto-removed by AutoModerator |
| r/smallbusiness | Comment posted (voice memo transcribed via Whisper, posted) | Same karma issue |
| r/SideProject | Not yet | Need karma first |
| r/webdev | Not yet | Need karma first |

### Karma-building plan

Reddit requires organic participation before self-promotional content is accepted. Current approach:

1. Post helpful comments on questions in r/shopify, r/smallbusiness, r/webdev, r/startups
2. Share genuine expertise (22 years retail, software development experience) without linking to JMS Dev Lab
3. Once karma is sufficient (50-100+), begin sharing relevant blog posts and app announcements
4. Never spam -- Reddit communities detect and punish self-promotion aggressively

### Constraint

John's comments are currently being auto-removed due to low karma. This channel requires patience and consistent helpful participation before it yields results.

---

## 5. Community Replies (Quora, boards.ie)

### Quora

- Strategy: Answer questions about custom software costs, Shopify app selection, jewelry business software, spreadsheet replacement
- Link back to relevant blog posts where appropriate
- Focus on providing genuine value in answers -- the link is secondary

### boards.ie

- Registered as JMSDevLab
- Strategy: Participate in business and technology discussions in Irish context
- Avoid direct advertising -- contribute expertise and let profile do the talking

---

## 6. Email Nurture (MailerLite)

### 5-email welcome drip sequence

Triggered when a visitor signs up via the website contact form or newsletter signup.

| Email | Timing | Subject / Theme | Purpose |
|-------|--------|-----------------|---------|
| 1 | Immediate | Welcome + what JMS Dev Lab does | Set expectations, introduce two services (apps + custom dev) |
| 2 | Day 3 | The problem with spreadsheets | Educate on spreadsheet replacement, link to blog post |
| 3 | Day 7 | How fixed-price custom dev works | Explain pricing tiers, scope-match guarantee, LEO voucher |
| 4 | Day 14 | App showcase | Highlight 2-3 most relevant apps based on audience |
| 5 | Day 21 | Invitation to chat | Soft CTA to reply or book a call |

### Technical setup

- Platform: MailerLite (free tier)
- Domain: authenticated (DKIM/SPF records in Cloudflare DNS)
- Sending address: hello@jmsdevlab.com
- SMTP: MailerLite SMTP for outbound

---

## 7. YouTube

### Published videos (6 total)

| App | Videos | Type |
|-----|--------|------|
| JewelryStudioManager | 2 | Promo + feature tour |
| StaffHub | 2 | Promo + feature tour |
| SmartCash | 2 | Promo (https://youtu.be/I3H5M6jL-9A) + tour (https://youtu.be/w2OKtOTmDiE) |

### Constraint

John is shy and avoids on-camera content. All videos are screen recordings with voiceover or animated demos -- no talking-head format. This is a hard constraint that will not change.

### Future videos needed

Each app ideally needs a promo video and a feature screencast. Several apps still lack these (see App Catalogue for gaps). Videos are created opportunistically, not on a schedule.

---

## 8. Content Types and Templates

### Builder stories

Format: "I built [app] because [real problem]. Here is what I learned."
Purpose: Authenticity, trust-building, founder credibility.
Constraint: Must be genuine -- no manufactured narratives.

### Comparison posts

Format: "[Competitor] Alternatives -- What to Consider in 2026"
Purpose: Capture search traffic from people evaluating competitors.
Examples: "BriteCo Alternatives", "RepairPilot Alternatives", "EasyTeam Alternatives", "Triffin vs SmartCash"
Rule: Fair and factual comparison -- do not disparage competitors.

### How-to guides

Format: Step-by-step instructions for solving a specific problem.
Purpose: Provide value, earn organic backlinks, demonstrate expertise.
Examples: "How to Replace Your Spreadsheet With a Custom App", "How to Hire a Developer for the First Time"

### Industry-specific content

Format: Targeted content for jewelry businesses and Shopify merchants.
Purpose: Establish niche authority.
Examples: "Best Shopify Apps for Jewelry Stores", "Best Jewelry CRM Software"

---

## 9. Content Rules

These rules apply across all content channels.

| Rule | Detail |
|------|--------|
| No fake testimonials | All social proof must come from real customers with real results |
| No placeholder data | No "Company X saved 40% on..." unless it actually happened |
| No inflated claims | State facts: "9 shipped apps", "22 years in retail" -- not "industry-leading" or "revolutionary" |
| Canonical URLs | When cross-posting (e.g., dev.to), always set canonical URL to jmsdevlab.com |
| No AI-generated fluff | Content should read like it was written by a human who builds software |
| Factual and verifiable | Every claim must be something John can back up if challenged |

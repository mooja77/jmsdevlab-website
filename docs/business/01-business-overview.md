# 01 -- Business Overview

> **Last updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [App Catalogue](../architecture/11-app-catalogue.md) | [Infrastructure](../architecture/13-infrastructure-and-hosting.md) | [Platform Accounts](../platforms/50-platform-accounts-registry.md)

---

## 1. Entity Details

| Field | Value |
|-------|-------|
| Trading name | JMS Dev Lab |
| Legal structure | Sole Trader |
| Proprietor | John Moore |
| CRO reference | SR8242189 (pending) |
| Date established | 2025 |
| Country | Ireland |

### Previous trading entity

JMS Dev Lab previously invoiced through **Aideil Ltd** (VAT registration IE9657715M). This arrangement has ended. JMS Dev Lab now trades exclusively as a sole trader and does **not** operate through Aideil Ltd.

---

## 2. Tax and Registration

| Field | Value |
|-------|-------|
| PPSN | 7305338A |
| VAT registered | No |
| VAT threshold | EUR 42,500 (services) |
| VAT registration number | N/A -- below threshold |
| Tax year | Calendar year (Jan-Dec) |
| Revenue Online Service | Active |

> **Note:** VAT registration will be required once annual turnover from services exceeds EUR 42,500. Monitor quarterly.

---

## 3. Contact Information

| Channel | Details |
|---------|---------|
| Primary email | hello@jmsdevlab.com |
| Personal email | john@jmsdevlab.com |
| Email forwarding | Both addresses forward to mooja77@gmail.com |
| Send-as configured | john@jmsdevlab.com (via Gmail Send As) |
| Phone | 086 811 3687 |
| Address | 22 Nova Court, Carrigaline, Co. Cork, Ireland |
| Website | [jmsdevlab.com](https://jmsdevlab.com) |

### Email routing

```
hello@jmsdevlab.com  -->  Cloudflare Email Routing  -->  mooja77@gmail.com
john@jmsdevlab.com   -->  Cloudflare Email Routing  -->  mooja77@gmail.com
```

Outbound replies are sent via Gmail's "Send As" feature using `john@jmsdevlab.com` as the from address.

---

## 4. Website

| Field | Value |
|-------|-------|
| URL | https://jmsdevlab.com |
| Hosting | Cloudflare Pages |
| DNS | Cloudflare |
| SSL | Cloudflare (automatic) |
| Analytics | Plausible Analytics |
| Legal pages | [privacy.html](https://jmsdevlab.com/privacy.html), [terms.html](https://jmsdevlab.com/terms.html) |

The website is a static site deployed to Cloudflare Pages. It serves as the primary marketing and credibility page for JMS Dev Lab.

---

## 5. Brand Identity

### Tone of voice

JMS Dev Lab uses a **direct, no-jargon, builder-to-owner** tone across all communications. The voice is:

| Attribute | Description |
|-----------|-------------|
| Direct | Say what needs to be said without corporate filler |
| Practical | Focus on what the software does, not abstract promises |
| Builder-to-owner | Speak as one business owner to another -- peer-level, not salesy |
| No-jargon | Avoid technical terms when speaking to non-technical audiences |
| Honest | No fake testimonials, no placeholder data, no inflated claims |

### Key messaging pillars

1. **Built by a business owner, for business owners** -- John has run Moores Jewellers (multi-site retail) and understands real-world business pain points
2. **Shopify specialist** -- Deep expertise in Shopify app development and the Shopify ecosystem
3. **Jewelry industry expertise** -- Niche knowledge in jewelry retail, valuation, and repair management
4. **Solo developer, direct relationship** -- Clients work directly with the person who builds the software

### Content rules

- No fake data or placeholder testimonials -- real content only
- No free tier on apps -- 14-day free trial only (business cannot afford free users at this stage)
- No paid marketing upgrades until the business has revenue
- All content must be factual and verifiable

---

## 6. Legal Pages

The website includes two legal documents:

| Page | URL | Purpose |
|------|-----|---------|
| Privacy Policy | https://jmsdevlab.com/privacy.html | GDPR-compliant privacy notice covering data collection, processing, and rights |
| Terms of Service | https://jmsdevlab.com/terms.html | Terms governing use of JMS Dev Lab services and applications |

Both pages are static HTML served from Cloudflare Pages.

---

## 7. Business Context

### Current status (as of 2026-03-25)

John Moore is transitioning from running **Moores Jewellers** (a multi-site jewelry retail business in Cork, Ireland) to full-time software development under JMS Dev Lab. Moores Jewellers is expected to close around May 2026.

### Implications

| Item | Detail |
|------|--------|
| LinkedIn | Deferred until Moores Jewellers closes (~May 2026) to avoid confusion |
| LEO outreach | Proactive outreach paused until closure; inbound leads and RFQs are still pursued |
| Active RFQ | Vegrify MVP contract (EUR 28,875) -- submitted, awaiting decision |
| Income | No revenue yet from JMS Dev Lab; operating on savings |

### Background

John's career path: University College Cork (Computer Science) --> Sun Microsystems --> Moores Jewellers (family business, multi-site jewelry retail in Cork) --> JMS Dev Lab (software development, 2025-present).

This background gives JMS Dev Lab a genuine dual expertise in both software engineering and real-world retail/jewelry business operations -- a differentiator when selling to Shopify merchants and jewelry businesses.

---

## 8. Key Accounts and Services

For a complete registry of all external platform accounts, see [Platform Accounts Registry](../platforms/50-platform-accounts-registry.md).

For the full application portfolio, see [App Catalogue](../architecture/11-app-catalogue.md).

For infrastructure and hosting details, see [Infrastructure and Hosting](../architecture/13-infrastructure-and-hosting.md).

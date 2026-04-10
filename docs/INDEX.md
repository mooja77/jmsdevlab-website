# JMS Dev Lab -- Technical Documentation Index

> **Last updated:** 2026-03-25
> **Maintainer:** John Moore (john@jmsdevlab.com)

This is the master index for JMS Dev Lab's complete technical documentation set. All paths are relative to the `docs/` directory.

---

## How to use this index

Documents are organised into 6 sections and numbered for easy reference. Status markers indicate completion:

| Marker | Meaning |
|--------|---------|
| LIVE | Document exists and is current |
| PLANNED | Document is scheduled but not yet written |

---

## Section 1 -- Business (01-09)

Core business identity, legal, financial, and operational information.

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 01 | [business/01-business-overview.md](business/01-business-overview.md) | Entity details, tax, contact info, brand identity, legal pages | LIVE |
| 02 | [business/02-pricing-strategy.md](business/02-pricing-strategy.md) | Per-app pricing tiers, free-trial policy (14-day, no free tier), Stripe config | PLANNED |
| 03 | [business/03-financial-overview.md](business/03-financial-overview.md) | Revenue tracking, costs, runway, invoicing history (Aideil Ltd transition) | PLANNED |
| 04 | [business/04-client-acquisition-plan.md](business/04-client-acquisition-plan.md) | Inbound/outbound strategy, pipeline, LEO deferral, Vegrify RFQ | PLANNED |
| 05 | [business/05-brand-guidelines.md](business/05-brand-guidelines.md) | Tone of voice, logo usage, colour palette, typography | PLANNED |
| 06 | [business/06-legal-and-compliance.md](business/06-legal-and-compliance.md) | Privacy policy, terms of service, GDPR, data processing | PLANNED |
| 07 | [business/07-invoicing-and-payments.md](business/07-invoicing-and-payments.md) | Stripe setup, invoice templates, payment flows | PLANNED |
| 08 | [business/08-insurance-and-risk.md](business/08-insurance-and-risk.md) | Professional indemnity, public liability, risk register | PLANNED |
| 09 | [business/09-intellectual-property.md](business/09-intellectual-property.md) | Domain registrations, trademarks, code ownership | PLANNED |

## Section 2 -- Architecture (10-19)

Technical architecture, app catalogue, infrastructure, and development standards.

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 10 | [architecture/10-technical-architecture.md](architecture/10-technical-architecture.md) | System-wide tech stack, monorepo patterns, infrastructure, security | LIVE |
| 11 | [architecture/11-app-catalogue.md](architecture/11-app-catalogue.md) | Registry of all 12 apps with paths, URLs, stacks, pricing, audit scores | LIVE |
| 12 | [architecture/12-website-architecture.md](architecture/12-website-architecture.md) | jmsdevlab.com static site: 81 pages, SEO, tools, MailerLite, Plausible | LIVE |
| 13 | [architecture/13-infrastructure-and-hosting.md](architecture/13-infrastructure-and-hosting.md) | Cloudflare, Railway, Vercel, Firebase, Render, Supabase, GitHub mapping | LIVE |
| 14 | [architecture/14-database-systems.md](architecture/14-database-systems.md) | PostgreSQL, MongoDB, Firebase, Supabase, WatermelonDB, D1 — ORMs, backups | LIVE |
| 15 | [architecture/15-authentication-and-billing.md](architecture/15-authentication-and-billing.md) | Auth methods, Shopify session tokens, Stripe, billing gaps | LIVE |
| 16 | [architecture/16-email-infrastructure.md](architecture/16-email-infrastructure.md) | Email routing, DNS records, MailerLite, Gmail Send As setup | LIVE |
| 17 | [architecture/17-security-practices.md](architecture/17-security-practices.md) | Secret management, .env handling, Cloudflare WAF, HTTPS | PLANNED |
| 18 | [architecture/18-domain-and-dns.md](architecture/18-domain-and-dns.md) | All domains, DNS records, email routing, SSL certificates | PLANNED |
| 19 | [architecture/19-api-reference-index.md](architecture/19-api-reference-index.md) | Per-app API endpoint inventories | PLANNED |

## Section 3 -- Apps (20-31)

Individual app deep-dives -- one document per app.

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 20 | [apps/20-smartcash.md](apps/20-smartcash.md) | SmartCash: cash management for Shopify | PLANNED |
| 21 | [apps/21-profitshield.md](apps/21-profitshield.md) | ProfitShield: discount abuse prevention for Shopify | PLANNED |
| 22 | [apps/22-jewel-value.md](apps/22-jewel-value.md) | Jewel Value: jewelry valuation certificates | PLANNED |
| 23 | [apps/23-themesweep.md](apps/23-themesweep.md) | ThemeSweep: Shopify theme cleanup tool | PLANNED |
| 24 | [apps/24-repairdesk.md](apps/24-repairdesk.md) | RepairDesk: repair tracking for jewellers | PLANNED |
| 25 | [apps/25-spamshield.md](apps/25-spamshield.md) | SpamShield: Shopify spam order protection | PLANNED |
| 26 | [apps/26-growthmap.md](apps/26-growthmap.md) | GrowthMap: business growth planning | PLANNED |
| 27 | [apps/27-jewelrystudiomanager.md](apps/27-jewelrystudiomanager.md) | JewelryStudioManager: custom jewellery workshop management | PLANNED |
| 28 | [apps/28-staffhub.md](apps/28-staffhub.md) | StaffHub: employee scheduling and management | PLANNED |
| 29 | [apps/29-pitch-side.md](apps/29-pitch-side.md) | Pitch Side: GAA match tracking | PLANNED |
| 30 | [apps/30-qualcanvas.md](apps/30-qualcanvas.md) | QualCanvas: qualifications portfolio builder | PLANNED |
| 31 | [apps/31-vegrify.md](apps/31-vegrify.md) | Vegrify: vegan product verification (mobile, contract) | PLANNED |

## Section 4 -- Operations (32-39)

Day-to-day operational processes and playbooks.

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 32 | [operations/32-dev-workflow.md](operations/32-dev-workflow.md) | Local dev setup, Git conventions, branch strategy | PLANNED |
| 33 | [operations/33-deployment-playbook.md](operations/33-deployment-playbook.md) | Step-by-step deploy procedures per platform | PLANNED |
| 40 | [operations/40-deployment-procedures.md](operations/40-deployment-procedures.md) | Full deployment commands, rollback, env vars for all properties | LIVE |
| 41 | [operations/41-monitoring-and-health-checks.md](operations/41-monitoring-and-health-checks.md) | Daily/weekly scripts, Plausible, GSC, Shopify Partners, alerts | LIVE |
| 34 | [operations/34-incident-response.md](operations/34-incident-response.md) | Downtime response, rollback procedures, comms templates | PLANNED |
| 35 | [operations/35-support-and-triage.md](operations/35-support-and-triage.md) | Customer support workflow, email templates, escalation | PLANNED |
| 36 | [operations/36-shopify-app-review.md](operations/36-shopify-app-review.md) | Shopify App Store submission checklist and review process | PLANNED |
| 37 | [operations/37-app-build-playbook.md](operations/37-app-build-playbook.md) | Standard playbook for building new apps from gap analysis | PLANNED |
| 38 | [operations/38-content-publishing.md](operations/38-content-publishing.md) | Blog, social media, Product Hunt launch processes | PLANNED |
| 39 | [operations/39-backup-and-recovery.md](operations/39-backup-and-recovery.md) | Database backups, code backups, disaster recovery | PLANNED |

## Section 5 -- Platforms (50-55)

External platform accounts, integrations, and third-party services.

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 50 | [platforms/50-platform-accounts-registry.md](platforms/50-platform-accounts-registry.md) | Every external account with status, credentials location, notes | LIVE |
| 51 | [platforms/51-shopify-partner-account.md](platforms/51-shopify-partner-account.md) | Shopify Partner dashboard, app listings, review status | PLANNED |
| 52 | [platforms/52-google-services.md](platforms/52-google-services.md) | Business Profile, Search Console, Alerts, Analytics | PLANNED |
| 53 | [platforms/53-social-media-strategy.md](platforms/53-social-media-strategy.md) | Platform-by-platform posting strategy and content calendar | PLANNED |
| 54 | [platforms/54-freelance-platforms.md](platforms/54-freelance-platforms.md) | Upwork, Bark, Referr, Freelancermap, Jobbers, MyGig setup and strategy | PLANNED |
| 55 | [platforms/55-directory-listings.md](platforms/55-directory-listings.md) | Sortlist, Clutch, DesignRush, GoodFirms, TechBehemoths, SelectedFirms | PLANNED |

## Section 6 -- Reference (60-65)

Appendices, checklists, and quick-reference material.

| # | Document | Description | Status |
|---|----------|-------------|--------|
| 60 | [reference/60-glossary.md](reference/60-glossary.md) | Terms, acronyms, and definitions used across docs | PLANNED |
| 61 | [reference/61-contact-directory.md](reference/61-contact-directory.md) | Key contacts: Shopify support, hosting providers, partners | PLANNED |
| 62 | [reference/62-audit-scoring-methodology.md](reference/62-audit-scoring-methodology.md) | How the /16 app audit scores are calculated | PLANNED |
| 63 | [reference/63-environment-variables.md](reference/63-environment-variables.md) | Per-app .env variable reference (no values, just keys) | PLANNED |
| 64 | [reference/64-url-and-domain-registry.md](reference/64-url-and-domain-registry.md) | Complete list of all owned domains and URLs | PLANNED |
| 65 | [reference/65-changelog.md](reference/65-changelog.md) | Documentation changelog and version history | PLANNED |

---

## Document counts

| Section | Total | Live | Planned |
|---------|-------|------|---------|
| Business (01-09) | 9 | 1 | 8 |
| Architecture (10-19) | 10 | 7 | 3 |
| Apps (20-31) | 12 | 0 | 12 |
| Operations (32-41) | 10 | 2 | 8 |
| Platforms (50-55) | 6 | 1 | 5 |
| Reference (60-65) | 6 | 0 | 6 |
| **Total** | **53** | **11** | **42** |

> Note: The index lists 51 documents (including this INDEX.md makes the set referenced at 46 unique subject documents plus this index). The numbering leaves room for future additions within each section.

---

## Conventions

- **Numbering:** Documents are numbered by section. Gaps in numbering are intentional to allow future inserts.
- **Cross-references:** Use relative links (e.g., `../architecture/11-app-catalogue.md`).
- **Dates:** All dates use ISO 8601 format (YYYY-MM-DD).
- **Currency:** EUR unless otherwise stated. USD used for Shopify app pricing.
- **Sensitive data:** No secrets, passwords, or API keys in any document. Reference `.env` variable names only.

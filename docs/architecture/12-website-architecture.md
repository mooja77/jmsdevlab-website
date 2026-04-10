# 12 — Website Architecture (jmsdevlab.com)

> **Last Updated:** 2026-03-25
> **Maintainer:** John Moore (john@jmsdevlab.com)
> **Status:** LIVE

---

## Overview

The JMS Dev Lab website ([jmsdevlab.com](https://jmsdevlab.com)) is a static HTML/CSS/JS site with no framework or build process. It serves as the primary marketing site, blog, and lead generation tool for the business. The site hosts 81 HTML pages including interactive tools that demonstrate domain expertise to potential customers.

---

## 1. Technology Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Markup** | Static HTML | No templating engine, no SSR |
| **Styling** | Single `style.css` | One stylesheet for the entire site |
| **JavaScript** | Single `main.js` | One script file for all interactive functionality |
| **Framework** | None | Zero dependencies, no build step |
| **Hosting** | Cloudflare Pages | Project name: `jmsdevlab` |
| **CDN** | Cloudflare | Automatic with Cloudflare Pages |
| **Analytics** | Plausible | Privacy-friendly, installed March 2026 |
| **Email capture** | MailerLite | Newsletter signup forms in all footers |

---

## 2. Deployment

### Deploy Command

```bash
cd "C:/JM Programs/JMS Dev Lab" && npx wrangler pages deploy . --project-name=jmsdevlab --branch=main
```

### Deployment Details

| Setting | Value |
|---------|-------|
| Platform | Cloudflare Pages |
| Project name | `jmsdevlab` |
| Branch | `main` |
| Build command | None (static files) |
| Deploy tool | Wrangler CLI (`npx wrangler`) |
| Deploy source | Root of `C:/JM Programs/JMS Dev Lab` |

There is no CI/CD pipeline — deployment is manual via the Wrangler CLI command above. See [../operations/40-deployment-procedures.md](../operations/40-deployment-procedures.md) for full deployment procedures.

---

## 3. Page Inventory

### Summary

| Category | Count |
|----------|-------|
| Main pages | 24 |
| Blog posts | 46 |
| Interactive tools | 9 |
| Vegrify pages | 2 |
| **Total** | **81** |

### Main Pages (24)

Core marketing, product, and informational pages including:

- Homepage (`index.html`)
- About, Contact, Privacy Policy, Terms of Service
- Individual app landing pages (SmartCash, ProfitShield, Jewel Value, ThemeSweep, RepairDesk, SpamShield, GrowthMap, JSM, StaffHub, Pitch Side, QualCanvas)
- Services pages, portfolio page
- Pricing, FAQ pages

### Blog Posts (46)

SEO-driven content covering:

- Shopify app development and best practices
- Jewelry industry technology and management
- Small business software guidance
- Cash management and financial tools
- Staff scheduling and HR topics

### Interactive Tools (9)

Free browser-based calculators and assessment tools that generate leads and demonstrate expertise:

| Tool | URL Path | Purpose |
|------|----------|---------|
| Budget Estimator | `/tools/budget-estimator` | Estimate software development costs |
| Cashflow Health Check | `/tools/cashflow-health-check` | Assess business cashflow health |
| Commission Pricing Calculator | `/tools/commission-pricing-calculator` | Calculate commission-based pricing models |
| Marketing Readiness Score | `/tools/marketing-readiness-score` | Assess marketing readiness |
| Repair Turnaround Calculator | `/tools/repair-turnaround-calculator` | Estimate jewelry repair turnaround times |
| Spreadsheet Cost Calculator | `/tools/spreadsheet-cost-calculator` | Calculate hidden costs of spreadsheet-based workflows |
| Training Cost Calculator | `/tools/training-cost-calculator` | Estimate staff training costs |
| Valuation Certificate Checker | `/tools/valuation-certificate-checker` | Verify jewelry valuation certificate quality |

*Note: There are 8 tools listed above. The 9th interactive page is a quiz/assessment tool.*

### Vegrify Pages (2)

Dedicated landing pages for the Vegrify contract app (separate from the main Vegrify product).

---

## 4. SEO Configuration

### Technical SEO

| Element | Implementation | Status |
|---------|---------------|--------|
| `sitemap.xml` | Auto-generated, lists all public pages | Active |
| `robots.txt` | Allows all crawlers, references sitemap | Active |
| Canonical tags | `<link rel="canonical">` on every page | Active |
| OG tags | Open Graph title, description, image on all pages | Active |
| Twitter cards | `twitter:card`, `twitter:title`, `twitter:description` | Active |
| Meta descriptions | Unique per page | Active |
| Page titles | Unique, keyword-optimised per page | Active |

### Structured Data (JSON-LD)

| Schema Type | Where Used |
|-------------|-----------|
| `Organization` | Homepage — business name, logo, contact info |
| `Article` | All blog posts — author, date, headline |
| `FAQPage` | FAQ sections on app landing pages |
| `BreadcrumbList` | All inner pages — navigation hierarchy |
| `SoftwareApplication` | App landing pages — name, OS, pricing |

### Google Search Console

The site is registered across 10 GSC properties. Indexing requests are tracked and submitted regularly. See [../platforms/52-google-services.md](../platforms/52-google-services.md) for details.

---

## 5. Email Capture and Marketing

### MailerLite Integration

| Component | Details |
|-----------|---------|
| **Forms** | Newsletter signup embedded in all page footers |
| **Welcome drip** | 5-email automated sequence for new subscribers |
| **Account tier** | Free plan |
| **Domain** | `jmsdevlab.com` — authenticated with SPF/DKIM/DMARC |

For full email infrastructure details, see [16-email-infrastructure.md](16-email-infrastructure.md).

---

## 6. Analytics

### Plausible Analytics

| Setting | Value |
|---------|-------|
| Provider | Plausible |
| Installed | March 2026 |
| Privacy | No cookies, GDPR-compliant by default |
| Dashboard | Plausible cloud dashboard |
| Tracking | Lightweight `<script>` tag in page headers |

Used for:

- Traffic baseline monitoring
- Blog post performance
- Tool page engagement
- Referral source tracking

See [../operations/41-monitoring-and-health-checks.md](../operations/41-monitoring-and-health-checks.md) for monitoring procedures.

---

## 7. File Structure

```
C:/JM Programs/JMS Dev Lab/
├── index.html                    # Homepage
├── style.css                     # Single global stylesheet
├── main.js                       # Single global script
├── sitemap.xml                   # SEO sitemap
├── robots.txt                    # Crawler directives
├── about/                        # About page
├── apps/                         # App landing pages
├── blog/                         # Blog posts (46 articles)
├── contact/                      # Contact page
├── tools/                        # Interactive tools (9)
├── vegrify/                      # Vegrify landing pages (2)
├── images/                       # Site images and assets
├── docs/                         # Technical documentation (this folder)
└── ...                           # Other pages and assets
```

---

## Cross-References

- [10-technical-architecture.md](10-technical-architecture.md) — System-wide tech stack overview
- [13-infrastructure-and-hosting.md](13-infrastructure-and-hosting.md) — Cloudflare Pages hosting details
- [16-email-infrastructure.md](16-email-infrastructure.md) — MailerLite and email routing setup
- [../operations/40-deployment-procedures.md](../operations/40-deployment-procedures.md) — Website deployment command and procedures
- [../operations/41-monitoring-and-health-checks.md](../operations/41-monitoring-and-health-checks.md) — Site health checks and Plausible monitoring
- [../platforms/52-google-services.md](../platforms/52-google-services.md) — Google Search Console properties

# 54 -- SEO and Search Console

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Content Strategy](../marketing/61-content-strategy.md) | [Marketing Strategy](../marketing/60-marketing-strategy.md)

---

## 1. Google Search Console Properties

| Property | Domain | Verification | Indexing status |
|----------|--------|-------------|-----------------|
| jmsdevlab.com | jmsdevlab.com | Verified (DNS) | Homepage indexed; 25+ pages indexing requested |
| profitshield.app | profitshield.app | Verification tag added | Zero indexing as of March 2026 |
| jewelrystudiomanager.com | jewelrystudiomanager.com | Verification tag added | Zero indexing as of March 2026 |
| app.themesweep.app | app.themesweep.app | Verification tag added | Pending deploy |

All GSC properties are managed under the mooja77@gmail.com Google account.

### App domain indexing problem

Most app domains have zero Google indexing as of March 2026. This is because:
- App domains primarily serve embedded Shopify apps (not crawlable by Google)
- Marketing/landing pages for individual apps need to be created and submitted
- Some verification tags have been added but not yet deployed

---

## 2. jmsdevlab.com Indexing Status

### Current state

| Metric | Value |
|--------|-------|
| Pages indexed | 1 (homepage) as of early March 2026 |
| Pages with indexing requested | 25+ |
| Pages discovered, not indexed | ~22 |
| Sitemap URLs | 71 |
| Daily indexing request quota | ~6-7 requests |

### Indexing request history

Requests submitted in daily batches (limited by Google's quota of ~6-7 per day):

| Date | Pages requested |
|------|-----------------|
| 2026-03-16 | apps.html, pricing.html |
| 2026-03-17 | blog.html, about.html, case-studies.html, cork.html, blog/how-much-does-custom-software-cost.html, blog/no-code-vs-custom-software.html |
| 2026-03-18 | blog/buy-vs-build-custom-software.html, contact.html, jewelry.html, tools/, blog/internal-tools-vs-saas.html, blog/best-shopify-apps-jewelry-stores.html |
| 2026-03-19 | blog/hiring-developer-first-time.html, blog/outgrown-airtable.html, blog/replace-spreadsheet-with-app.html, partners.html, blog/briteco-alternatives.html, blog/repairpilot-alternatives.html |
| 2026-03-20 | blog/easyteam-alternatives.html, blog/triffin-vs-smartcash.html, blog/best-jewelry-crm-software.html, tools/spreadsheet-cost-calculator.html, tools/budget-estimator.html |

### How to request indexing

1. Open Google Search Console (search.google.com/search-console)
2. Type the full URL in the top inspection bar
3. Wait for URL inspection to complete
4. Click "Request indexing"
5. Wait ~90 seconds for the request to process
6. Repeat for next URL
7. Stop when quota is reached (~6-7 per day)

### Known issues

| Issue | Detail | Action |
|-------|--------|--------|
| "Page with redirect" (1 page) | www to non-www redirect | Intentional -- ignore |
| "No referring sitemaps detected" | Some pages show this warning | Sitemap may not be fully processed yet -- wait |
| Slow indexing | Most pages still in "Discovered -- currently not indexed" | Normal for new sites; continue requesting |

---

## 3. SEO Fixes Applied (March 2026)

All SEO fixes were applied across the JMS Dev Lab website and individual app sites in March 2026, based on the SEO-FIXES-PER-APP.md audit document.

### Fixes applied to jmsdevlab.com

| Fix | Detail |
|-----|--------|
| Meta titles | Unique, keyword-rich titles on all pages |
| Meta descriptions | Descriptive meta descriptions on all pages |
| Open Graph tags | og:title, og:description, og:image, og:url on all pages |
| Canonical URLs | Self-referencing canonical tags on all pages |
| Heading hierarchy | Single H1 per page, logical H2/H3 structure |
| Image alt text | Descriptive alt attributes on all images |
| Internal linking | Cross-links between related blog posts and pages |
| Mobile responsiveness | All pages responsive |
| Page speed | Static HTML -- inherently fast |
| HTTPS | Cloudflare automatic SSL |

### Fixes applied per app

SEO improvements were made to individual app marketing pages and websites. Details are documented in:
- `C:\JM Programs\JMS Dev Lab Website\SEO-FIXES-PER-APP.md`

---

## 4. Sitemap

### Location

| Field | Value |
|-------|-------|
| URL | https://jmsdevlab.com/sitemap.xml |
| Total URLs | 71 |
| Submitted to GSC | Yes |
| Format | Standard XML sitemap |

### URL breakdown

| Section | Approximate count | Examples |
|---------|-------------------|----------|
| Core pages | 7 | index.html, apps.html, pricing.html, about.html, contact.html, cork.html, jewelry.html |
| Blog posts | ~46 | blog/how-much-does-custom-software-cost.html, blog/triffin-vs-smartcash.html, etc. |
| Tools | 3 | tools/, tools/spreadsheet-cost-calculator.html, tools/budget-estimator.html |
| Legal | 2 | privacy.html, terms.html |
| Other | ~13 | partners.html, case-studies.html, blog.html (index), etc. |

### Maintenance

When new blog posts or pages are added to jmsdevlab.com:
1. Add the URL to sitemap.xml
2. Deploy updated sitemap via `npx wrangler pages deploy . --project-name=jmsdevlab`
3. Request indexing in GSC for the new URL

---

## 5. Structured Data

The jmsdevlab.com website implements multiple structured data types using JSON-LD format.

### Implemented schemas

| Schema type | Where used | Purpose |
|-------------|-----------|---------|
| Organization | Homepage | Company name, logo, contact info, social profiles |
| Article | Blog posts | Title, author, date, description for rich snippets |
| FAQPage | FAQ sections on relevant pages | Question/answer pairs for FAQ rich results |
| BreadcrumbList | All pages | Navigation breadcrumbs in search results |
| SoftwareApplication | App pages | App name, pricing, OS, rating for app rich snippets |

### Example: Organization schema (homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "JMS Dev Lab",
  "url": "https://jmsdevlab.com",
  "logo": "https://jmsdevlab.com/images/logo.png",
  "founder": {
    "@type": "Person",
    "name": "John Moore"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cork",
    "addressCountry": "IE"
  }
}
```

### Validation

Structured data should be validated periodically using:
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org validator: https://validator.schema.org/

---

## 6. SEO Strategy

### Keyword targeting approach

| Category | Example keywords | Content type |
|----------|-----------------|--------------|
| Shopify apps | "best shopify cash flow app", "shopify jewelry app" | Blog posts, app pages |
| Spreadsheet replacement | "replace spreadsheet with app", "outgrown airtable" | Blog posts, tools page |
| Custom software costs | "how much does custom software cost ireland", "custom app development cork" | Blog posts, pricing page |
| Competitor comparisons | "briteco alternatives", "triffin vs smartcash", "repairpilot alternatives" | Comparison blog posts |
| Jewelry industry | "best jewelry crm software", "jewelry valuation software" | Blog posts, jewelry page |
| Local SEO | "software developer cork", "app developer ireland" | Cork page, about page |

### Link building

Currently organic only (no outreach for backlinks). Backlink sources include:
- dev.to articles (dofollow from cross-posted content)
- Directory profiles (Upwork, Bark, Sortlist, Clutch, etc.)
- Google Business Profile
- Social media profiles
- Any future press coverage or interviews

### Monitoring

| Tool | What it tracks | Frequency |
|------|---------------|-----------|
| Google Search Console | Impressions, clicks, position, indexing status | Weekly |
| Plausible Analytics | Traffic, page views, referrers, geography | Weekly |
| Manual SERP checks | Position for target keywords | Monthly |

---

## 7. Per-App SEO Status

| App | Domain | GSC verified | Indexed pages | Marketing site |
|-----|--------|-------------|---------------|----------------|
| SmartCash | smartcashapp.net | No | 0 | Exists |
| Jewel Value | jewelvalue.app | No | 0 | Exists |
| RepairDesk | repairdeskapp.net | No | 0 | Exists |
| StaffHub | staffhubapp.com | No | 0 | Exists |
| GrowthMap | mygrowthmap.net | No | 0 | Exists |
| JewelryStudioManager | jewelrystudiomanager.com | Verification tag added | 0 | Exists |
| ProfitShield | profitshield.app | Verification tag added | 0 | Exists |
| ThemeSweep | app.themesweep.app | Verification tag added, pending deploy | 0 | Exists |
| Pitch Side | pitchsideapp.net | No | 0 | Exists |
| QualCanvas | qualcanvas.com | No | 0 | Exists |

### Priority actions

1. Deploy verification tags for ThemeSweep (already added, needs deploy)
2. Add GSC verification to remaining app domains
3. Submit sitemaps for app marketing sites that have them
4. Request indexing for key app landing pages
5. Ensure each app's marketing page has proper meta tags, structured data, and content

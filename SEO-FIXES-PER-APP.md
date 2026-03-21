# SEO Fixes Required Per App

**Date:** 2026-03-17
**Context:** 7 of 8 app domains have zero Google indexing. Only SmartCash has 1 page indexed. These instructions are for the agent/session working on each app's codebase.

---

## JewelryStudioManager (jewelrystudiomanager.com)

**Current state:** Placeholder/stub page. No meta tags, no robots.txt, no sitemap. Worst of all 7 sites.

### Tasks

1. **Build a real landing page** (if one doesn't exist). Must include:
   - `<title>JewelryStudioManager - Shopify CRM for Jewelry Studios</title>`
   - `<meta name="description" content="Manage commissions, customer relationships, and sales tracking for your jewelry studio. Shopify app from $9.99/month.">`
   - `<link rel="canonical" href="https://jewelrystudiomanager.com/">`
   - OG tags: `og:title`, `og:description`, `og:url`, `og:image`, `og:type`
   - Twitter card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

2. **Create `robots.txt`** at the domain root:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://jewelrystudiomanager.com/sitemap.xml
   ```

3. **Create `sitemap.xml`** listing all public pages (homepage, support, privacy, terms, any feature pages).

4. **Add structured data** (JSON-LD in `<head>`):
   ```json
   {
     "@context": "https://schema.org",
     "@type": "SoftwareApplication",
     "name": "JewelryStudioManager",
     "applicationCategory": "BusinessApplication",
     "operatingSystem": "Web",
     "offers": {
       "@type": "Offer",
       "price": "9.99",
       "priceCurrency": "USD"
     },
     "description": "Shopify CRM for jewelry studios. Track commissions, manage customers, and grow sales.",
     "url": "https://jewelrystudiomanager.com"
   }
   ```

5. **After deploying**, add the domain to Google Search Console, verify ownership via DNS TXT record or HTML file, and submit the sitemap.

---

## StaffHub (staffhubapp.com)

**Current state:** Has robots.txt, sitemap.xml (6 URLs), and structured data. Missing basic meta tags in `<head>`.

### Tasks

1. **Add meta tags to `<head>`** on all pages:
   - `<title>StaffHub - Shopify Staff Training & Management App</title>`
   - `<meta name="description" content="Train, manage, and track your team's progress. Shopify app from $4.99/month. SOPs, quizzes, and onboarding in one place.">`
   - `<link rel="canonical" href="https://staffhubapp.com/">` (adjust per page)

2. **Add OG tags to `<head>`** on all pages:
   ```html
   <meta property="og:type" content="website">
   <meta property="og:title" content="StaffHub - Shopify Staff Training & Management">
   <meta property="og:description" content="Train, manage, and track your team's progress. From $4.99/month.">
   <meta property="og:url" content="https://staffhubapp.com/">
   <meta property="og:image" content="https://staffhubapp.com/og-image.png">
   ```

3. **Add Twitter card tags:**
   ```html
   <meta name="twitter:card" content="summary_large_image">
   <meta name="twitter:title" content="StaffHub - Shopify Staff Training & Management">
   <meta name="twitter:description" content="Train, manage, and track your team's progress. From $4.99/month.">
   <meta name="twitter:image" content="https://staffhubapp.com/og-image.png">
   ```

4. **Create an OG image** (1200x630px) with the app name and a screenshot or tagline.

5. **Verify in Google Search Console** and submit the existing sitemap (https://staffhubapp.com/sitemap.xml).

---

## Jewel Value (jewelvalue.app)

**Current state:** Has title and description. Missing canonical, OG tags, Twitter cards, robots.txt, sitemap, structured data.

### Tasks

1. **Add to `<head>`** on all pages:
   ```html
   <link rel="canonical" href="https://jewelvalue.app/">
   <meta property="og:type" content="website">
   <meta property="og:title" content="Jewel Value - Professional Jewellery Valuations">
   <meta property="og:description" content="World-class jewellery and watch valuation platform for retail jewellers. Professional certificates, GIA integration, and more.">
   <meta property="og:url" content="https://jewelvalue.app/">
   <meta property="og:image" content="https://jewelvalue.app/og-image.png">
   <meta name="twitter:card" content="summary_large_image">
   <meta name="twitter:title" content="Jewel Value - Professional Jewellery Valuations">
   <meta name="twitter:description" content="Professional valuation certificates for retail jewellers. From $9/month.">
   <meta name="twitter:image" content="https://jewelvalue.app/og-image.png">
   ```

2. **Create `robots.txt`:**
   ```
   User-agent: *
   Allow: /
   Disallow: /api/
   Disallow: /dashboard/
   Sitemap: https://jewelvalue.app/sitemap.xml
   ```

3. **Create `sitemap.xml`** listing all public pages.

4. **Add SoftwareApplication structured data** (JSON-LD):
   ```json
   {
     "@context": "https://schema.org",
     "@type": "SoftwareApplication",
     "name": "Jewel Value",
     "applicationCategory": "BusinessApplication",
     "operatingSystem": "Web",
     "offers": {
       "@type": "Offer",
       "price": "9.00",
       "priceCurrency": "USD"
     },
     "description": "Professional jewellery and watch valuation platform for retail jewellers.",
     "url": "https://jewelvalue.app"
   }
   ```

5. **Add to Google Search Console** and submit sitemap.

---

## SmartCash (smartcashapp.net)

**Current state:** 1 page indexed (homepage). JS-rendered app — meta tags may not be visible to crawlers. No robots.txt, no sitemap.

### Tasks

1. **Ensure meta tags are server-side rendered** (not client-side JS only). If using a framework (React/Vue/etc.), use SSR or pre-rendering for the landing page. Google can render JS but it's slower and less reliable. Key meta tags:
   - `<title>SmartCash - Shopify Cashflow Management with AI Forecasting</title>`
   - `<meta name="description" content="Take control of your Shopify store's cashflow. AI-powered forecasting, expense tracking, and financial insights. From $9.99/month.">`
   - `<link rel="canonical" href="https://smartcashapp.net/">`
   - Full OG and Twitter card tags

2. **Create `robots.txt`:**
   ```
   User-agent: *
   Allow: /
   Disallow: /api/
   Disallow: /app/
   Sitemap: https://smartcashapp.net/sitemap.xml
   ```

3. **Create `sitemap.xml`** listing all public pages.

4. **Add SoftwareApplication structured data.**

5. **Add to Google Search Console** and submit sitemap. Since the homepage is already indexed, this site has the best foundation — focus on expanding indexing to other pages.

---

## Pitch Side (pitchsideapp.net)

**Current state:** Best on-page meta of all apps (title, description, OG tags, Twitter cards). Missing canonical, robots.txt, sitemap, structured data.

### Tasks

1. **Add canonical URL** to `<head>`:
   ```html
   <link rel="canonical" href="https://pitchsideapp.net/">
   ```

2. **Create `robots.txt`:**
   ```
   User-agent: *
   Allow: /
   Disallow: /api/
   Disallow: /app/
   Sitemap: https://pitchsideapp.net/sitemap.xml
   ```

3. **Create `sitemap.xml`** listing all public pages.

4. **Add SoftwareApplication structured data** (JSON-LD). Note: price is free:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "SoftwareApplication",
     "name": "Pitch Side",
     "applicationCategory": "SportsApplication",
     "operatingSystem": "Web",
     "offers": {
       "@type": "Offer",
       "price": "0",
       "priceCurrency": "USD"
     },
     "description": "Free coaching companion for grassroots football. Plan sessions, organise your squad, and get match day sorted.",
     "url": "https://pitchsideapp.net"
   }
   ```

5. **Add to Google Search Console** and submit sitemap.

---

## RepairDesk (repairdeskapp.net)

**Current state:** Has robots.txt and sitemap.xml (5 URLs). Missing meta description, canonical, OG tags, Twitter cards. Note: brand name collides with repairdesk.co (a major competitor).

### Tasks

1. **Add meta tags to `<head>`** on all pages. Use the full brand "RepairDesk by JMS Dev Lab" to differentiate from the competitor:
   - `<title>RepairDesk - Repair Management for Jewellers & Watchmakers | Shopify App</title>`
   - `<meta name="description" content="Manage repair tickets, track parts, and keep customers informed. Built for jewellers and watchmakers. Shopify app from $9.99/month.">`
   - `<link rel="canonical" href="https://repairdeskapp.net/">`

2. **Add OG and Twitter card tags** to all pages.

3. **Add SoftwareApplication structured data** (JSON-LD):
   ```json
   {
     "@context": "https://schema.org",
     "@type": "SoftwareApplication",
     "name": "RepairDesk",
     "applicationCategory": "BusinessApplication",
     "operatingSystem": "Web",
     "offers": {
       "@type": "Offer",
       "price": "9.99",
       "priceCurrency": "USD"
     },
     "description": "Repair management for jewellers and watchmakers. Track tickets, parts, and customer communications.",
     "url": "https://repairdeskapp.net"
   }
   ```

4. **SEO content strategy:** Because "RepairDesk" is dominated by repairdesk.co in search results, focus on long-tail keywords in page content: "jewelry repair management Shopify", "watchmaker repair tracking app", "jeweller repair ticket system". Consider whether a rebrand or subtitle is needed long-term.

5. **Verify in Google Search Console** and submit the existing sitemap.

---

## GrowthMap (mygrowthmap.net)

**Current state:** Next.js app. Nothing detected — no meta tags, no robots.txt, no sitemap. Completely invisible to search engines.

### Tasks

1. **Configure Next.js metadata** using the App Router `metadata` export or `generateMetadata` function. This ensures tags are server-rendered, not client-only:
   ```typescript
   // app/layout.tsx or app/page.tsx
   export const metadata = {
     title: 'GrowthMap - Marketing Plan Execution App',
     description: 'Like Duolingo, but for marketing. Build and execute your marketing plan step by step. Shopify app from $9.99/month.',
     openGraph: {
       title: 'GrowthMap - Marketing Plan Execution App',
       description: 'Build and execute your marketing plan step by step.',
       url: 'https://mygrowthmap.net',
       type: 'website',
       images: [{ url: 'https://mygrowthmap.net/og-image.png', width: 1200, height: 630 }],
     },
     twitter: {
       card: 'summary_large_image',
       title: 'GrowthMap - Marketing Plan Execution App',
       description: 'Build and execute your marketing plan step by step.',
       images: ['https://mygrowthmap.net/og-image.png'],
     },
     alternates: {
       canonical: 'https://mygrowthmap.net',
     },
   };
   ```

2. **Create `robots.txt`** — In Next.js App Router, create `app/robots.ts`:
   ```typescript
   export default function robots() {
     return {
       rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/app/'] },
       sitemap: 'https://mygrowthmap.net/sitemap.xml',
     };
   }
   ```

3. **Create `sitemap.xml`** — In Next.js App Router, create `app/sitemap.ts`:
   ```typescript
   export default function sitemap() {
     return [
       { url: 'https://mygrowthmap.net', lastModified: new Date(), priority: 1.0 },
       { url: 'https://mygrowthmap.net/privacy', lastModified: new Date(), priority: 0.3 },
       { url: 'https://mygrowthmap.net/terms', lastModified: new Date(), priority: 0.3 },
     ];
   }
   ```

4. **Add SoftwareApplication structured data** via a `<script type="application/ld+json">` in the root layout.

5. **Add to Google Search Console** and submit sitemap.

---

## Google Search Console Setup (All Apps)

For each app, after deploying the fixes above:

1. Go to https://search.google.com/search-console
2. Click "Add Property" > "URL prefix" > enter the domain
3. Verify ownership via one of:
   - **DNS TXT record** (recommended if you control DNS): add a TXT record to the domain
   - **HTML file upload**: upload a verification HTML file to the site root
   - **HTML meta tag**: add a `<meta name="google-site-verification">` tag to the homepage
4. Once verified, go to Sitemaps > submit the sitemap URL
5. Use URL Inspection > enter the homepage URL > click "Request Indexing"
6. Repeat URL Inspection for any other key pages

**Priority order for setup:** SmartCash (already has 1 page indexed), StaffHub & RepairDesk (already have sitemaps), Pitch Side (best meta tags), then Jewel Value, GrowthMap, JewelryStudioManager.

---

## OG Image Spec (All Apps)

Each app needs an OG image for social sharing. Spec:
- **Size:** 1200 x 630 pixels
- **Format:** PNG or JPG
- **Content:** App name/logo, one-line tagline, optional screenshot
- **Filename:** `og-image.png` in the site root
- **Colours:** Use the JMS Dev Lab design system — #2563eb blue primary, #14b8a6 teal accent, Inter font

# Vegrify (Prototype)

**Last Updated:** 2026-03-25

---

## Overview

Vegrify is a food-tech mobile application that allows consumers to scan ingredient labels via OCR and instantly determine whether a product is vegan-friendly. The app classifies each ingredient through a 4-tier verification pipeline, provides explainable AI output, and works offline-first using a local database of 6,413 known ingredients. The result is a sub-10ms classification response even without network connectivity.

**Vegrify is a client project, not a JMS Dev Lab product.** It was developed as a prototype/MVP in response to an RFQ for Lead Product Engineer from Kate Meaun (Asiera/Vegrify). The project is funded through an LEO Feasibility Grant (50% co-funding up to EUR 15,000). A formal quote of EUR 28,875 has been submitted and a decision is pending.

## Status

- **Phase:** Prototype complete, RFQ submitted, awaiting client decision
- **Type:** CLIENT PROJECT -- not a JMS Dev Lab portfolio product
- **Contract Status:**
  - RFQ received: 2026-03-14
  - Response submitted: 2026-03-18
  - Video call with Kate Meaun: 2026-03-20 at 15:45
  - Decision: **Pending**
- **Quote:** EUR 28,875 (55 days x EUR 525/day, 6 work packages)
- **Funding:** LEO Feasibility Grant -- client claims ~EUR 14,437 back
- **Prototype Deployed:** Yes (Vercel web + Android APK)

## URLs

| Resource           | URL                                              |
|--------------------|--------------------------------------------------|
| Web Prototype      | https://vegrify-mvp.vercel.app                   |
| API                | https://vegrify-api.mooja77.workers.dev           |
| GitHub Repository  | https://github.com/mooja77/vegrify (private)     |
| Android APK        | Uploaded to Google Drive (shareable link)         |

## Local Path

```
C:\JM Programs\Vegrify
C:\JM Programs\JMS Dev Lab\vegrify     (secondary copy / working directory)
```

## Tech Stack

| Layer           | Technology                                    |
|-----------------|-----------------------------------------------|
| Mobile Framework| React Native + Expo SDK 55                    |
| Language        | TypeScript                                    |
| OCR             | Google ML Kit (on-device text recognition)    |
| Offline DB      | WatermelonDB (SQLite-backed, offline-first)   |
| State Management| Zustand                                       |
| Backend         | Cloudflare Workers                            |
| Backend DB      | Cloudflare D1 (SQLite at the edge)            |
| Testing         | Jest + React Testing Library                  |
| Hosting (Web)   | Vercel                                        |
| Hosting (Mobile)| Expo Application Services (EAS) for builds    |

## Architecture

Vegrify follows a mobile-first, offline-first architecture. The core classification logic runs entirely on-device so that scanning and verification works without any network connection. The backend serves as a sync layer for database updates and analytics.

```
Vegrify/
├── src/
│   ├── app/               # Expo Router screens
│   ├── components/
│   │   ├── scanner/       # Camera + ML Kit OCR integration
│   │   ├── results/       # Classification result display
│   │   └── common/        # Shared UI components
│   ├── services/
│   │   ├── classifier/    # 4-tier ingredient classification pipeline
│   │   ├── ocr/           # ML Kit OCR wrapper
│   │   └── sync/          # Backend sync service
│   ├── stores/            # Zustand state stores
│   ├── db/
│   │   ├── schema/        # WatermelonDB schema (6,413 ingredients)
│   │   ├── models/        # WatermelonDB model definitions
│   │   └── migrations/    # Database migrations
│   ├── types/
│   └── utils/
├── workers/               # Cloudflare Workers backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   └── d1/            # D1 database queries
│   └── wrangler.toml      # Cloudflare Workers config
├── __tests__/             # Jest test suites
├── app.json               # Expo configuration
├── eas.json               # EAS Build configuration
└── package.json
```

**Classification Pipeline (4 tiers):**
1. **Exact Match:** Direct lookup against the 6,413-ingredient database
2. **Fuzzy Match:** Levenshtein distance matching for OCR errors and spelling variations
3. **Component Analysis:** Break compound ingredients into sub-components and classify each
4. **AI Classification:** For truly unknown ingredients, escalate to an AI model for classification with confidence scoring

**Offline-First Design:**
- WatermelonDB provides a local SQLite database on the device with the full ingredient database
- All classification happens on-device with sub-10ms response times
- Background sync updates the ingredient database when connectivity is available
- No network required for core scanning functionality

## Key Features

- **Ingredient Label Scanning:** Point the camera at any food product ingredient list and the app extracts text via Google ML Kit OCR, then classifies each ingredient.
- **6,413 Ingredients Database:** Comprehensive pre-loaded database of ingredients with vegan/non-vegan classifications, sourced from verified food science data.
- **4-Tier Classification Pipeline:** Multi-layered approach ensures high accuracy -- exact match, fuzzy match (for OCR errors), component analysis (for compound ingredients), and AI fallback.
- **Explainable Output:** Every classification comes with a human-readable explanation of why an ingredient is or is not vegan, including source references and confidence levels.
- **Offline-First:** Full functionality without internet. The entire ingredient database is stored locally via WatermelonDB. Sub-10ms response times.
- **Barcode Scanning:** Scan product barcodes to look up known products and their ingredient lists from a product database.
- **Scan History:** Track previously scanned products with results and timestamps.
- **Product Sharing:** Share scan results with other users or on social media.

## Pricing Tiers

Not applicable -- Vegrify is a client project. Pricing and monetization decisions are the client's responsibility. The JMS Dev Lab engagement is a fixed-price contract (EUR 28,875).

## Deployment

- **Web Prototype:** Vercel
  - Project ID: `prj_JMVS74AnJCYDAvfY7tlL8EMrh29B`
  - URL: https://vegrify-mvp.vercel.app
- **Mobile Builds:** Expo Application Services (EAS)
  - Android APK built and distributed via Google Drive
  - iOS builds available via EAS Build
- **Backend API:** Cloudflare Workers
  - URL: https://vegrify-api.mooja77.workers.dev
  - Database: Cloudflare D1 (SQLite at the edge)
  - Configured via `wrangler.toml`
- **Environment Variables:**
  - Cloudflare Workers: `D1_DATABASE_ID`, Worker secrets via `wrangler secret`
  - Expo/React Native: Environment variables via `app.json` or `.env`
  - Vercel: Standard Vercel environment configuration

## Contract Details

| Field                | Detail                                           |
|----------------------|--------------------------------------------------|
| Client               | Kate Meaun, Asiera/Vegrify                       |
| Email                | kate.meaun@public-procurement.ie                 |
| Phone                | +353 89 985 6572                                 |
| Quote                | EUR 28,875                                       |
| Day Rate             | EUR 525/day x 55 days                            |
| Work Packages        | 6 milestone-based packages                       |
| Payment Structure    | 6 milestone payments of ~EUR 4,812 each          |
| Tax                  | PSWT (20% withheld per payment, recovered via tax return) |
| VAT                  | Not VAT registered -- saves client 23%           |
| Trading Entity       | JMS Dev Lab (sole trader, NOT through Aideil Ltd)|
| Funding              | LEO Feasibility Grant (50% co-funding up to EUR 15,000) |
| Evaluation Criteria  | Form completeness, experience (pass/fail), lowest price wins |
| Win Probability      | Estimated 35-45%                                 |

## Known Gaps

As a prototype, the following items would be addressed in the full MVP engagement if the contract is awarded:

- **Production Hardening:** The prototype demonstrates core functionality but needs production-grade error handling, logging, and monitoring.
- **App Store Submission:** Neither iOS App Store nor Google Play Store submission has been completed. The prototype is distributed via direct APK/TestFlight.
- **Accessibility:** Full accessibility audit and remediation needed for production release.
- **Analytics:** No product analytics or usage tracking implemented in the prototype.
- **User Accounts:** Authentication and user account management are minimal in the prototype.
- **Ingredient Database Expansion:** The 6,413 ingredient database is comprehensive but will need ongoing curation and expansion.
- **Regulatory Compliance:** Food labeling regulations vary by jurisdiction -- the production app needs jurisdiction-aware compliance features.

## Related Documents

- RFQ Response: `C:\JM Programs\JMS Dev Lab\vegrify\RFQ-RESPONSE-VEGRIFY.md`
- CV Submitted: `C:\JM Programs\JMS Dev Lab\vegrify\CV-JOHN-MOORE.md`
- HTML Templates: `C:\JM Programs\JMS Dev Lab\vegrify\cv.html`, `C:\JM Programs\JMS Dev Lab\vegrify\rfq.html`
- Vegrify RFQ Memory: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\project_vegrify_rfq.md`
- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

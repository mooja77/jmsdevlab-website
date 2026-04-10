# 11 -- App Catalogue

> **Last updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Business Overview](../business/01-business-overview.md) | [Infrastructure](13-infrastructure-and-hosting.md) | [Platform Accounts](../platforms/50-platform-accounts-registry.md)

---

## Overview

JMS Dev Lab maintains a portfolio of 12 applications. Nine are live in production, one is newly launched, one is in active development, and one is a prototype tied to a pending contract.

Each app is scored on a /16 audit scale. For the scoring methodology, see [Audit Scoring Methodology](../reference/62-audit-scoring-methodology.md) (planned).

---

## Summary Table

| # | App | Audit Score | Status | Shopify App | Pricing (USD/mo) |
|---|-----|-------------|--------|-------------|-------------------|
| 1 | SmartCash | 15/16 | Live | Yes | $9.99 -- $49.99 |
| 2 | ProfitShield | 14/16 | Live | Yes | $19 -- $149 |
| 3 | Jewel Value | 13/16 | Live | No | $9.99 -- $59.99 |
| 4 | ThemeSweep | 12/16 | In Development | Yes | TBD |
| 5 | RepairDesk | 11/16 | Live | No | $9.99 -- $29.99 |
| 6 | SpamShield | 11/16 | Live | Yes | $9 -- $99 |
| 7 | GrowthMap | 10/16 | Live | No | $9.99 -- $29.99 |
| 8 | JewelryStudioManager | 10/16 | Live | No | $9.99 -- $29.99 |
| 9 | StaffHub | 9/16 | Live | No | $4.99 -- $29.99 |
| 10 | Pitch Side | 9/16 | Live | No | Free |
| 11 | QualCanvas | New | Live | No | Free / $12 / $29 |
| 12 | Vegrify | N/A | Prototype | No | Contract (EUR 28,875) |

---

## Detailed App Registry

### 1. SmartCash

| Field | Value |
|-------|-------|
| Full name | SmartCash |
| Audit score | 15/16 |
| Status | Live |
| Local path | `C:\JM Programs\Smart Cash` |
| Production URL | https://smartcashapp.net |
| Tech stack | Next.js, Prisma, PostgreSQL |
| Shopify app | Yes |
| Shopify Partner ID | 4100630 |
| Pricing | $9.99 / $24.99 / $49.99 per month |
| Description | Cash management and float tracking app for Shopify retailers. Helps store owners manage cash registers, track floats, and reconcile daily takings. |

### 2. ProfitShield

| Field | Value |
|-------|-------|
| Full name | ProfitShield |
| Audit score | 14/16 |
| Status | Live |
| Local path | `C:\JM Programs\ProfitShield` |
| Production URL | https://profitshield.app |
| Tech stack | Next.js, Prisma, Shopify Functions (Rust) |
| Shopify app | Yes |
| Pricing | $19 / $49 / $149 per month |
| Description | Discount abuse prevention for Shopify stores. Uses Shopify Functions (written in Rust) to enforce discount rules at checkout, preventing coupon stacking, excessive discounting, and margin erosion. |

### 3. Jewel Value

| Field | Value |
|-------|-------|
| Full name | Jewel Value |
| Audit score | 13/16 |
| Status | Live |
| Local path | `C:\JM Programs\Valuation App` |
| Production URL | https://jewelvalue.app |
| Tech stack | NestJS, Turborepo, pnpm (monorepo) |
| Shopify app | No |
| Pricing | $9.99 / $29.99 / $59.99 per month |
| Description | Professional jewelry valuation certificate generator. Enables jewellers to create, manage, and issue insurance valuation certificates for customers. Built on John's direct experience running Moores Jewellers. |

### 4. ThemeSweep

| Field | Value |
|-------|-------|
| Full name | ThemeSweep |
| Audit score | 12/16 |
| Status | In Development |
| Local path | `C:\JM Programs\Theme Sweep` |
| Production URL | https://app.themesweep.app |
| Tech stack | Shopify CLI |
| Shopify app | Yes |
| Pricing | TBD (in development) |
| Description | Shopify theme cleanup and optimisation tool. Scans themes for unused code, bloated assets, and performance issues. Helps merchants improve page load speed by cleaning up their theme files. |

### 5. RepairDesk

| Field | Value |
|-------|-------|
| Full name | RepairDesk |
| Audit score | 11/16 |
| Status | Live |
| Local path | `C:\JM Programs\Repair Desk` |
| Production URL | https://repairdeskapp.net |
| Tech stack | Express, Prisma, PostgreSQL |
| Shopify app | No |
| Pricing | $9.99 / $19.99 / $29.99 per month |
| Description | Repair job tracking for jewellers and watchmakers. Manages the full repair lifecycle from customer intake through to completion and collection. Another app built from direct jewelry retail experience. |

### 6. SpamShield

| Field | Value |
|-------|-------|
| Full name | SpamShield |
| Audit score | 11/16 |
| Status | Live |
| Local path | `C:\JM Programs\Spam Shield` |
| Production URL | Railway backend (no public frontend URL) |
| Tech stack | Express, Prisma |
| Shopify app | Yes |
| Pricing | $9 / $29 / $99 per month |
| Description | Spam order protection for Shopify stores. Automatically detects and blocks fraudulent or spam orders based on configurable rules and pattern matching. |

### 7. GrowthMap

| Field | Value |
|-------|-------|
| Full name | GrowthMap |
| Audit score | 10/16 |
| Status | Live |
| Local path | `C:\JM Programs\GrowthMap` |
| Production URL | https://mygrowthmap.net |
| Tech stack | Next.js, Supabase, Stripe |
| Shopify app | No |
| Pricing | $9.99 / $19.99 / $29.99 per month |
| Description | Business growth planning tool. Helps small business owners create structured growth plans with actionable milestones and progress tracking. Uses Supabase for auth and data, Stripe for billing. |

### 8. JewelryStudioManager

| Field | Value |
|-------|-------|
| Full name | JewelryStudioManager |
| Audit score | 10/16 |
| Status | Live |
| Local path | `C:\JM Programs\Custom Jewellery Manager` |
| Production URL | https://jewelrystudiomanager.com |
| Tech stack | Express, Prisma, PostgreSQL |
| Shopify app | No |
| Hosting | Render (render.yaml) |
| Pricing | $9.99 / $19.99 / $29.99 per month |
| Description | Workshop management for custom jewellery makers. Tracks custom orders, design iterations, materials, and client communications through the bespoke jewellery creation process. |

### 9. StaffHub

| Field | Value |
|-------|-------|
| Full name | StaffHub |
| Audit score | 9/16 |
| Status | Live |
| Local path | `C:\JM Programs\Staff Hub` |
| Production URL | https://staffhubapp.com |
| Tech stack | Express, MongoDB |
| Shopify app | No |
| Pricing | $4.99 / $14.99 / $29.99 per month |
| Description | Employee scheduling and staff management. Handles shift planning, availability, time-off requests, and team communication for small businesses. |
| Known issues | CRITICAL review (Ref 102157) -- requires attention |

> **Action required:** StaffHub has a critical review flagged under reference 102157. This needs investigation and resolution as a priority.

### 10. Pitch Side

| Field | Value |
|-------|-------|
| Full name | Pitch Side |
| Audit score | 9/16 |
| Status | Live |
| Local path | `C:\JM Programs\PitchSide` |
| Production URL | https://pitchsideapp.net |
| Tech stack | Next.js, Firebase (Hosting, Realtime Database, Auth) |
| Shopify app | No |
| Pricing | Free |
| Description | GAA match tracking and scoring app. Built for the Irish sporting community to record live match scores, track player stats, and share results. Free to use -- no monetisation. |

### 11. QualCanvas

| Field | Value |
|-------|-------|
| Full name | QualCanvas |
| Audit score | New (not yet audited) |
| Status | Live |
| Local path | `C:\JM Programs\Canvas App` |
| Production URL | https://qualcanvas.com |
| Tech stack | React, Vite, Express, Prisma |
| Shopify app | No |
| Pricing | Free / $12 / $29 per month |
| Description | Qualifications portfolio builder. Helps professionals create visual, shareable portfolios of their qualifications, certifications, and training records. |

### 12. Vegrify

| Field | Value |
|-------|-------|
| Full name | Vegrify |
| Audit score | N/A (prototype) |
| Status | Prototype |
| Local path | `C:\JM Programs\Vegrify` (also `C:\JM Programs\JMS Dev Lab\vegrify`) |
| Production URL | N/A (prototype stage) |
| Tech stack | React Native, Expo |
| Shopify app | No |
| Pricing | Contract -- EUR 28,875 (RFQ submitted) |
| Description | Vegan product verification mobile app. Allows consumers to scan product barcodes and verify vegan/plant-based credentials. Being developed as a contract project -- RFQ submitted to client (Kate), awaiting decision. |

> **Contract status:** RFQ for EUR 28,875 submitted. Call with Kate took place 2026-03-20. Awaiting decision.

---

## Apps by Tech Stack

| Tech Stack | Apps |
|------------|------|
| Next.js | SmartCash, ProfitShield, GrowthMap, Pitch Side |
| Express | RepairDesk, SpamShield, JewelryStudioManager, StaffHub, QualCanvas |
| NestJS | Jewel Value |
| React + Vite | QualCanvas |
| React Native + Expo | Vegrify |
| Shopify CLI | ThemeSweep |
| Prisma | SmartCash, ProfitShield, Jewel Value, RepairDesk, SpamShield, JewelryStudioManager, QualCanvas |
| PostgreSQL | SmartCash, RepairDesk, JewelryStudioManager |
| MongoDB | StaffHub |
| Firebase | Pitch Side |
| Supabase | GrowthMap |
| Shopify Functions (Rust) | ProfitShield |

---

## Apps by Shopify Status

| Status | Apps |
|--------|------|
| Shopify app (listed/in review) | SmartCash, ProfitShield, SpamShield, ThemeSweep |
| Standalone (not Shopify) | Jewel Value, RepairDesk, GrowthMap, JewelryStudioManager, StaffHub, Pitch Side, QualCanvas, Vegrify |

All Shopify apps are managed under **Shopify Partner ID 4100630**.

---

## Audit Score Distribution

| Score | Count | Apps |
|-------|-------|------|
| 15/16 | 1 | SmartCash |
| 14/16 | 1 | ProfitShield |
| 13/16 | 1 | Jewel Value |
| 12/16 | 1 | ThemeSweep |
| 11/16 | 2 | RepairDesk, SpamShield |
| 10/16 | 2 | GrowthMap, JewelryStudioManager |
| 9/16 | 2 | StaffHub, Pitch Side |
| New/N/A | 2 | QualCanvas, Vegrify |

**Portfolio average (scored apps):** 11.0/16

---

## Notes

- All apps use a **14-day free trial** model. There is no permanent free tier (except Pitch Side which is entirely free, and QualCanvas which has a free tier).
- Pricing is in USD for all apps (standard for SaaS and Shopify ecosystem), except the Vegrify contract which is in EUR.
- Local paths reference the Windows development machine. All source code is also in private GitHub repos under the `mooja77` organisation.
- For hosting and infrastructure details for each app, see [Infrastructure and Hosting](13-infrastructure-and-hosting.md).

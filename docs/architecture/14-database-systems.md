# 14 — Database Systems

> **Last Updated:** 2026-03-25
> **Maintainer:** John Moore (john@jmsdevlab.com)
> **Status:** LIVE

---

## Overview

JMS Dev Lab apps use six different database technologies across five hosting platforms. Database selection is driven by app requirements: PostgreSQL for relational Shopify app data, MongoDB for document-oriented scheduling, Firebase for real-time sync, Supabase for serverless PostgreSQL, WatermelonDB for offline-first mobile, and Cloudflare D1 for edge computing.

---

## 1. Database Technology Summary

| Database | Hosting Platform | ORM/Driver | Apps |
|----------|-----------------|------------|------|
| PostgreSQL | Railway | Prisma | SmartCash, ProfitShield, Jewel Value, RepairDesk, QualCanvas |
| MongoDB | Atlas / Railway | Mongoose | StaffHub |
| Firebase Realtime DB | Firebase (Google) | Firebase SDK | Pitch Side |
| Supabase PostgreSQL | Supabase | Supabase Client SDK | GrowthMap |
| WatermelonDB | Device-local (SQLite) | WatermelonDB | Vegrify (mobile) |
| Cloudflare D1 | Cloudflare (edge) | D1 Client API | Vegrify (API backend) |

---

## 2. PostgreSQL on Railway (Prisma ORM)

### Apps Using PostgreSQL

| App | Railway Project | Database | Key Tables |
|-----|----------------|----------|------------|
| **SmartCash** | smartcash | PostgreSQL | shops, sessions, cash_reports, settings |
| **ProfitShield** | profitshield | PostgreSQL | shops, sessions, discount_rules, alerts |
| **Jewel Value** | jewel-value | PostgreSQL | shops, sessions, valuations, certificates, items |
| **RepairDesk** | repairdesk | PostgreSQL | shops, sessions, repairs, customers, statuses |
| **QualCanvas** | qualcanvas | PostgreSQL | users, portfolios, qualifications, templates |

### Prisma Configuration

All PostgreSQL apps use Prisma ORM with the following standard setup:

| Setting | Value |
|---------|-------|
| ORM | Prisma (latest) |
| Schema file | `prisma/schema.prisma` |
| Migrations | `npx prisma migrate deploy` (production) |
| Client generation | `npx prisma generate` |
| Connection | `DATABASE_URL` environment variable on Railway |
| Connection pooling | Prisma connection pool (default settings) |

### Standard Prisma Schema Patterns

```prisma
// All Shopify apps include these base models:
model Shop {
  id        String   @id @default(cuid())
  domain    String   @unique    // myshop.myshopify.com
  token     String              // Shopify access token (encrypted)
  plan      String?             // Subscription plan name
  trialEnd  DateTime?           // Trial expiry date
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Session {
  id      String @id
  shop    String
  state   String
  online  Boolean @default(false)
  expires DateTime?
}
```

### Multi-Tenancy (Shopify Apps)

All Shopify apps on PostgreSQL use **shop-scoped data isolation**:

- Every data table includes a `shopDomain` or `shopId` foreign key
- All queries filter by the authenticated shop's domain
- No cross-shop data access is possible through the application layer
- Session token validation extracts the shop domain from the JWT

---

## 3. MongoDB on Atlas/Railway (Mongoose)

### StaffHub

| Setting | Value |
|---------|-------|
| Database | MongoDB |
| Hosting | MongoDB Atlas (free tier) or Railway |
| ORM | Mongoose |
| Connection | `MONGODB_URI` environment variable |

### Key Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Staff and admin accounts |
| `organizations` | Business entities |
| `schedules` | Shift schedules and rosters |
| `shifts` | Individual shift records |
| `timecards` | Clock-in/clock-out records |
| `announcements` | Team announcements |

### Why MongoDB for StaffHub

StaffHub's scheduling data is document-oriented — shifts have nested availability arrays, recurring patterns, and flexible metadata. MongoDB's schema flexibility suits this better than rigid relational tables.

---

## 4. Firebase Realtime Database

### Pitch Side

| Setting | Value |
|---------|-------|
| Database | Firebase Realtime Database |
| Hosting | Firebase (Google Cloud) |
| SDK | Firebase JS SDK |
| Auth integration | Firebase Auth (email/password) |
| Connection | Firebase config object (client-safe keys) |

### Data Structure

```
/users/{userId}/
  - profile
  - preferences
/matches/{matchId}/
  - teams
  - scores
  - events[]
  - timestamps
/clubs/{clubId}/
  - name
  - members[]
```

### Why Firebase for Pitch Side

Real-time match tracking requires instant data sync across devices. Firebase Realtime Database provides sub-second sync with minimal backend code — ideal for a sports tracking app where multiple users watch the same match live.

---

## 5. Supabase

### GrowthMap

| Setting | Value |
|---------|-------|
| Database | Supabase PostgreSQL |
| Hosting | Supabase (free tier) |
| ORM | Supabase Client SDK (auto-generated REST API) |
| Auth | Supabase Auth (magic links) |
| Connection | `SUPABASE_URL` + `SUPABASE_ANON_KEY` environment variables |

### Key Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles linked to Supabase Auth |
| `businesses` | Business entities being assessed |
| `assessments` | Growth assessment responses |
| `action_plans` | Generated growth action plans |
| `milestones` | Progress tracking milestones |

### Row-Level Security (RLS)

GrowthMap uses Supabase RLS policies to ensure users can only access their own data:

- All tables have RLS enabled
- Policies filter by `auth.uid()` matching the row's `user_id`
- No server-side middleware needed for basic access control

---

## 6. WatermelonDB (Vegrify Mobile)

| Setting | Value |
|---------|-------|
| Database | WatermelonDB (SQLite under the hood) |
| Platform | React Native (Expo) |
| Sync | Offline-first with optional cloud sync |

### Purpose

Vegrify is a mobile app for scanning and verifying vegan products. WatermelonDB enables:

- **Offline-first operation** — full functionality without internet
- **Fast queries** — SQLite performance on device
- **Lazy loading** — only loads records as needed
- **Sync protocol** — can sync with backend when online

### Key Tables

| Table | Purpose |
|-------|---------|
| `products` | Scanned product records |
| `scans` | Individual scan events with results |
| `ingredients` | Ingredient database for offline lookup |

---

## 7. Cloudflare D1 (Vegrify API)

| Setting | Value |
|---------|-------|
| Database | Cloudflare D1 (SQLite at the edge) |
| Runtime | Cloudflare Workers |
| Connection | D1 binding in `wrangler.toml` |

### Purpose

The Vegrify API backend runs on Cloudflare Workers with D1 for:

- Product database lookups
- Scan result caching
- User feedback storage
- Low-latency edge responses globally

---

## 8. Backup Strategy

| Platform | Backup Method | Frequency | Retention |
|----------|--------------|-----------|-----------|
| **Railway** (PostgreSQL) | Automatic daily snapshots | Daily | Platform-managed |
| **MongoDB Atlas** | Continuous backup (free tier: daily) | Daily | Platform-managed |
| **Firebase** | Export via `firebase database:export` | Manual / on-demand | Developer-managed |
| **Supabase** | Automatic daily backups | Daily | 7 days (free tier) |
| **WatermelonDB** | On-device (user's phone) | N/A | Device-managed |
| **Cloudflare D1** | D1 automatic backups | Platform-managed | Platform-managed |

### Backup Recommendations

| Priority | Action |
|----------|--------|
| High | Set up automated Firebase export script (currently manual) |
| Medium | Test Railway snapshot restore procedure |
| Low | Document Supabase point-in-time recovery process |

---

## 9. Database Access Patterns

### Environment Variables

| Variable | Platform | Apps |
|----------|----------|------|
| `DATABASE_URL` | Railway | SmartCash, ProfitShield, Jewel Value, RepairDesk, QualCanvas |
| `MONGODB_URI` | Atlas/Railway | StaffHub |
| `SUPABASE_URL` | Supabase | GrowthMap |
| `SUPABASE_ANON_KEY` | Supabase | GrowthMap |
| `SUPABASE_SERVICE_KEY` | Supabase | GrowthMap (server-side only) |
| Firebase config | Firebase | Pitch Side (client-safe) |
| D1 binding | Cloudflare | Vegrify API (wrangler.toml) |

> **Security:** No database credentials are ever committed to Git. All connection strings are stored as environment variables on their respective hosting platforms. See [10-technical-architecture.md](10-technical-architecture.md) for security practices.

---

## Cross-References

- [10-technical-architecture.md](10-technical-architecture.md) — System-wide tech stack and security practices
- [11-app-catalogue.md](11-app-catalogue.md) — Full app registry with tech stacks
- [13-infrastructure-and-hosting.md](13-infrastructure-and-hosting.md) — Hosting platforms (Railway, Firebase, Supabase)
- [15-authentication-and-billing.md](15-authentication-and-billing.md) — Auth integration with databases
- [../operations/40-deployment-procedures.md](../operations/40-deployment-procedures.md) — Database migration procedures during deployment

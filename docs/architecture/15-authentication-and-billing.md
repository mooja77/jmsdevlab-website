# 15 — Authentication and Billing

> **Last Updated:** 2026-03-25
> **Maintainer:** John Moore (john@jmsdevlab.com)
> **Status:** LIVE

---

## Overview

JMS Dev Lab apps use five different authentication methods and two billing systems, driven by the platform each app runs on. This document covers all auth flows, billing integrations, trial policies, and known gaps.

---

## 1. Authentication Methods by App

| App | Auth Method | Provider | Notes |
|-----|-----------|----------|-------|
| SmartCash | Shopify Session Tokens | Shopify App Bridge | Embedded app, no separate login |
| ProfitShield | Shopify Session Tokens | Shopify App Bridge | Embedded app, no separate login |
| Jewel Value | Shopify Session Tokens + Google OAuth | Shopify App Bridge / Google | Session tokens for Shopify; Google OAuth for standalone mode |
| ThemeSweep | Shopify Session Tokens | Shopify App Bridge | Embedded app, no separate login |
| RepairDesk | Shopify Session Tokens | Shopify App Bridge | Embedded app, no separate login |
| SpamShield | Shopify Session Tokens | Shopify App Bridge | Embedded app, no separate login |
| GrowthMap | Supabase Magic Links | Supabase Auth | Passwordless email login |
| JSM (Shopify) | Shopify Session Tokens | Shopify App Bridge | When installed as Shopify app |
| JSM (Standalone) | Email/Password + Google OAuth | Custom auth / Google | Standalone web app login |
| StaffHub | Email/Password | Custom auth | Standard credentials |
| Pitch Side | Firebase Auth | Firebase | Email/password via Firebase |
| QualCanvas | Email/Password | Custom auth | Standard credentials |
| Vegrify | N/A (mobile) | Device-local | No user accounts in MVP |

---

## 2. Shopify Session Token Flow

Seven apps use Shopify App Bridge session tokens. This is the standard OAuth + session token flow for Shopify embedded apps.

### Flow

```
1. Merchant clicks "Install" on Shopify App Store
2. Shopify redirects to app's /auth endpoint
3. App redirects to Shopify OAuth consent screen
4. Merchant approves requested scopes
5. Shopify redirects back with authorization code
6. App exchanges code for access token (stored server-side)
7. App loads inside Shopify Admin as an iframe
8. App Bridge generates short-lived session tokens (JWT)
9. Frontend sends session token with each API request
10. Backend validates JWT signature and extracts shop domain
```

### Key Points

- **No separate login** — merchants authenticate via Shopify Admin, never see a login form
- **Session tokens are JWTs** — signed by Shopify, contain shop domain, expiry, and user info
- **Server-side validation** — backend verifies JWT signature using the app's API secret
- **Access tokens** — long-lived, stored in database, used for Shopify Admin API calls
- **Scopes** — each app requests only the scopes it needs (principle of least privilege)

### Common Scopes Used

| Scope | Apps Using It | Purpose |
|-------|--------------|---------|
| `read_products` | SmartCash, ProfitShield, Jewel Value | Read product data |
| `write_products` | Jewel Value | Create/update products |
| `read_orders` | SmartCash, ProfitShield, SpamShield | Read order data |
| `write_orders` | SpamShield | Cancel/tag spam orders |
| `read_themes` | ThemeSweep | Access theme files |
| `write_themes` | ThemeSweep | Remove unused theme code |
| `read_customers` | RepairDesk | Customer information |

---

## 3. Google OAuth Flow

Used by JSM (standalone) and Jewel Value (standalone mode).

### Flow

```
1. User clicks "Sign in with Google"
2. App redirects to Google OAuth consent screen
3. User approves access
4. Google redirects back with authorization code
5. App exchanges code for access + refresh tokens
6. App creates/matches user record in database
7. Session cookie or JWT issued for subsequent requests
```

### Configuration

| Setting | Value |
|---------|-------|
| Provider | Google Cloud OAuth 2.0 |
| Scopes | `openid`, `email`, `profile` |
| Redirect URIs | Per-app callback URLs |
| Client credentials | Stored as environment variables |

---

## 4. Other Auth Methods

### Supabase Magic Links (GrowthMap)

- User enters email address
- Supabase sends a one-time login link
- User clicks link to authenticate
- Session managed by Supabase client SDK
- No password to remember — reduces friction

### Firebase Auth (Pitch Side)

- Email/password authentication via Firebase
- Firebase SDK handles session management
- User data stored in Firebase Realtime Database

### Email/Password (JSM Standalone, StaffHub, QualCanvas)

- Traditional email + password registration
- Passwords hashed with bcrypt
- JWT tokens issued on login
- Refresh token rotation for session management

---

## 5. Billing Systems

### Shopify Billing API (GraphQL)

Used by all 7 Shopify apps for subscription billing.

| Feature | Details |
|---------|---------|
| API | Shopify GraphQL Admin API — `appSubscriptionCreate` mutation |
| Billing cycle | Monthly recurring |
| Trial period | 14 days, no credit card required |
| Currency | USD (Shopify standard) |
| Revenue share | Shopify takes 0% on first $1M/year, then standard rev share |
| Cancellation | Merchant can uninstall at any time; billing stops immediately |

#### Shopify Billing Flow

```
1. App calls appSubscriptionCreate with plan name, price, trial days
2. Shopify returns confirmation URL
3. Merchant is redirected to Shopify to approve charge
4. On approval, Shopify redirects back to app with charge_id
5. App stores subscription status in database
6. App checks subscription status on each request
```

#### Pricing by App (Shopify Billing)

| App | Monthly Price (USD) | Trial | Status |
|-----|-------------------|-------|--------|
| SmartCash | $4.99 | 14 days | Active |
| ProfitShield | $9.99 | 14 days | Active |
| Jewel Value | $14.99 | 14 days | Active |
| ThemeSweep | $4.99 | 14 days | Active |
| RepairDesk | $14.99 | 14 days | Active |
| SpamShield | $6.99 | 14 days | **NOT ENFORCED** |
| GrowthMap | $9.99/mo | 14 days | Active (via Stripe, not Shopify) |

### Stripe Billing

Used by QualCanvas and JSM (standalone mode).

| Feature | Details |
|---------|---------|
| Provider | Stripe |
| Integration | Stripe Checkout + Customer Portal |
| Trial period | 14 days, no credit card required |
| Billing cycle | Monthly recurring |
| Currency | EUR |
| Webhooks | `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` |

#### Stripe-Billed Apps

| App | Monthly Price | Trial |
|-----|-------------|-------|
| QualCanvas | EUR 9.99 | 14 days |
| JSM (standalone) | EUR 14.99 | 14 days |

---

## 6. Trial Policy

All paid apps follow the same trial policy:

| Policy | Value |
|--------|-------|
| Duration | 14 days |
| Credit card required | No |
| Free tier | **None** — no permanent free plan on any app |
| Post-trial | App functionality restricted until subscription activated |
| Trial extensions | Not currently offered |

> **Business rule:** No free tier is offered on any app. The business cannot afford to support free users. All apps use a 14-day trial followed by mandatory paid subscription.

---

## 7. Known Gaps and Issues

### CRITICAL: SpamShield Billing Not Enforced

| Issue | Details |
|-------|---------|
| **App** | SpamShield |
| **Problem** | Billing integration exists but is not enforced — merchants can use the app indefinitely without paying |
| **Impact** | Lost revenue on every SpamShield install |
| **Priority** | High |
| **Fix required** | Add subscription check middleware to block access after trial expiry |

### Other Gaps

| Gap | App | Priority |
|-----|-----|----------|
| No webhook retry handling | QualCanvas (Stripe) | Medium |
| No subscription status caching | Multiple Shopify apps | Low |
| No dunning management | Stripe apps | Low |

---

## Cross-References

- [10-technical-architecture.md](10-technical-architecture.md) — System-wide tech stack and third-party services
- [14-database-systems.md](14-database-systems.md) — Where subscription data is stored per app
- [11-app-catalogue.md](11-app-catalogue.md) — Full app registry with pricing
- [../business/02-pricing-strategy.md](../business/02-pricing-strategy.md) — Business pricing decisions and strategy
- [../operations/40-deployment-procedures.md](../operations/40-deployment-procedures.md) — Deployment procedures (billing env vars)

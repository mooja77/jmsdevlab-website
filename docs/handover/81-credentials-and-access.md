# 81 -- Credentials and Access

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Handover Summary](80-handover-summary.md) | [Business Overview](../business/01-business-overview.md)

---

## 1. Primary Account

| Field | Value |
|-------|-------|
| Master email | mooja77@gmail.com |
| Used for | GitHub, Railway, Vercel, Cloudflare, Google services, Firebase, Supabase, Stripe |
| 2FA | Check Google account security settings |

Most services are registered under mooja77@gmail.com. Access to this Google account provides access to (or password recovery for) nearly all other services.

---

## 2. Password Storage

| Method | Detail |
|--------|--------|
| Primary | Browser saved passwords (Google Chrome, synced to Google account) |
| Backup | None documented |

### Recommendation

Passwords are stored in Chrome's built-in password manager, synced to the mooja77@gmail.com Google account. To access:
1. Log into Chrome with mooja77@gmail.com
2. Navigate to chrome://settings/passwords (or passwords.google.com)
3. All saved credentials are available there

**No separate password manager** (1Password, Bitwarden, etc.) is in use.

---

## 3. API Keys and Environment Variables

API keys are **not** stored in a central vault. They are stored as environment variables on each hosting platform.

| Platform | Where env vars are stored | How to access |
|----------|--------------------------|---------------|
| Railway | Per-service environment variables | Railway dashboard > Service > Variables tab |
| Vercel | Per-project environment variables | Vercel dashboard > Project > Settings > Environment Variables |
| Cloudflare Workers | Worker environment variables / secrets | Cloudflare dashboard > Workers > Settings > Variables |
| Firebase | Firebase console (config in app code) | Firebase console > Project Settings |
| Supabase | Supabase dashboard (API keys in settings) | Supabase dashboard > Settings > API |

### Important

- **No API keys should be committed to git.** See security incident history below.
- Each app has its own `.env` file locally (not committed to git -- listed in .gitignore)
- The `.env` files on John's local machine (C:\JM Programs\...) contain the development keys
- Production keys are only on the hosting platforms (Railway, Vercel, Cloudflare)

---

## 4. GitHub

| Field | Value |
|-------|-------|
| Username | mooja77 |
| All repos | Private |
| Organisation | mooja77 (personal) |

### Repository list

All app source code is in private repositories under the mooja77 GitHub account. Repository names generally match app names. Key repos:

| Repo | App |
|------|-----|
| CashFlowAppV2 (or similar) | SmartCash |
| ProfitShield | ProfitShield |
| jewel-value | Jewel Value |
| themesweep | ThemeSweep |
| Repair-Desk (or similar) | RepairDesk |
| SpamShield | SpamShield |
| Staff-Hub (or similar) | StaffHub |
| marketingapp | GrowthMap |
| Custom-Design-Tool (or similar) | JewelryStudioManager |
| Football-Coaching-App (or similar) | Pitch Side |
| vegrify | Vegrify |
| TaxMatch | TaxMatch |

### Access

GitHub access requires the mooja77 account credentials. If 2FA is enabled, the authenticator app or recovery codes are needed.

---

## 5. Shopify Partner Account

| Field | Value |
|-------|-------|
| Partner ID | 4100630 |
| Dashboard | partners.shopify.com |
| Login | mooja77@gmail.com |
| Apps submitted | 6 (SmartCash, Jewel Value, RepairDesk, GrowthMap, JewelryStudioManager, ProfitShield) |
| App with review issues | StaffHub (Ref 102157 -- 4 issues flagged) |

### App review status

| App | Review status |
|-----|--------------|
| SmartCash | Submitted for review |
| Jewel Value | Submitted for review |
| RepairDesk | Submitted for review |
| GrowthMap | Submitted for review |
| JewelryStudioManager | Submitted for review |
| ProfitShield | Submitted for review |
| StaffHub | Critical review -- 4 issues flagged (geographic reqs, valuation error, settings not saving, staff portal not visible) |

### Critical: 14-day review deadline

If Shopify sends review feedback, there is a 14-day window to respond with fixes. Monitor the Shopify Partner dashboard and mooja77@gmail.com for review emails.

---

## 6. Hosting Platforms

### Railway

| Field | Value |
|-------|-------|
| URL | railway.app |
| Account | mooja77@gmail.com |
| Services hosted | SmartCash backend, StaffHub backend, SpamShield backend |
| Databases | PostgreSQL instances per app |

### Vercel

| Field | Value |
|-------|-------|
| URL | vercel.com |
| Account | mooja77@gmail.com |
| Projects hosted | StaffHub admin (staff-hub-admin.vercel.app), Vegrify MVP (vegrify-mvp.vercel.app) |

### Cloudflare

| Field | Value |
|-------|-------|
| URL | cloudflare.com |
| Account | mooja77@gmail.com |
| Services | DNS (all domains), Pages (jmsdevlab.com, app websites), Workers (Vegrify API), Email Routing |

### Firebase

| Field | Value |
|-------|-------|
| URL | console.firebase.google.com |
| Account | mooja77@gmail.com |
| Projects | Pitch Side (Realtime Database, Auth, Hosting) |

### Supabase

| Field | Value |
|-------|-------|
| URL | supabase.com |
| Account | mooja77@gmail.com |
| Projects | GrowthMap (auth) |

---

## 7. Email Configuration

| Address | Routing | Sending |
|---------|---------|---------|
| hello@jmsdevlab.com | Cloudflare Email Routing to mooja77@gmail.com | MailerLite SMTP |
| john@jmsdevlab.com | Cloudflare Email Routing to mooja77@gmail.com | Gmail Send As (app password configured) |

### MailerLite

| Field | Value |
|-------|-------|
| Account email | hello@jmsdevlab.com |
| Tier | Free |
| Domain | Authenticated (DKIM/SPF in Cloudflare DNS) |
| Active sequences | 5-email welcome drip |

---

## 8. Security Incident History

### Secrets committed to git (fixed)

| Field | Value |
|-------|-------|
| Incident | API keys and secrets were committed to git in early commits |
| Commit that fixed it | 3a86f58 ("Security: remove tracked secrets, .env.production, .playwright-mcp logs, update .gitignore") |
| Previous fix | 69b3f50 ("Fix: add .gitignore, remove node_modules with exposed API key") |
| Status | Fixed -- .gitignore now prevents secrets from being committed |
| Residual risk | Secrets may still exist in git history; rotate any keys that were exposed |

### Preventive measures

| Measure | Status |
|---------|--------|
| .gitignore covers .env, .env.production, node_modules | Active |
| API keys stored as platform env vars (not in code) | Active |
| No secrets in documentation | Active |
| Git history cleanup (BFG or filter-branch) | Not done -- consider if repos are ever made public |

---

## 9. Domain Registrations

All domains are managed through Cloudflare.

| Domain | Purpose | Auto-renew |
|--------|---------|------------|
| jmsdevlab.com | Main website | Check Cloudflare |
| smartcashapp.net | SmartCash | Check Cloudflare |
| profitshield.app | ProfitShield | Check Cloudflare |
| jewelvalue.app | Jewel Value | Check Cloudflare |
| repairdeskapp.net | RepairDesk | Check Cloudflare |
| staffhubapp.com | StaffHub | Check Cloudflare |
| mygrowthmap.net | GrowthMap | Check Cloudflare |
| jewelrystudiomanager.com | JewelryStudioManager | Check Cloudflare |
| pitchsideapp.net | Pitch Side | Check Cloudflare |
| qualcanvas.com | QualCanvas | Check Cloudflare |
| themesweep.app | ThemeSweep | Check Cloudflare |

**Action:** Verify auto-renew is enabled for all domains in Cloudflare to prevent accidental expiry.

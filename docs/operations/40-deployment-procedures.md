# 40 — Deployment Procedures

> **Last Updated:** 2026-03-25
> **Maintainer:** John Moore (john@jmsdevlab.com)
> **Status:** LIVE

---

## Overview

This document covers how to deploy every JMS Dev Lab property — the main website, static app websites, and backend services. Deployments use a mix of manual Wrangler CLI commands (for static sites) and git-push auto-deploy (for backends and full-stack apps).

---

## 1. Deployment Methods Summary

| Method | Properties | How It Works |
|--------|-----------|-------------|
| **Wrangler CLI** (manual) | jmsdevlab.com, JSM website, StaffHub website, SmartCash website, QualCanvas frontend | Run `npx wrangler pages deploy` locally |
| **Git-push auto-deploy** | GrowthMap, ProfitShield, RepairDesk, Jewel Value, QualCanvas backend | Push to `main` branch triggers automatic deploy |
| **Shopify** | 7 Shopify embedded apps | Hosted by Shopify; backend deploy separately |

---

## 2. JMS Dev Lab Website (jmsdevlab.com)

### Deploy Command

```bash
cd "C:/JM Programs/JMS Dev Lab" && npx wrangler pages deploy . --project-name=jmsdevlab --branch=main
```

| Setting | Value |
|---------|-------|
| Platform | Cloudflare Pages |
| Project name | `jmsdevlab` |
| Source directory | `C:/JM Programs/JMS Dev Lab` (root) |
| Build step | None (static files) |
| Branch | `main` |

### Pre-Deploy Checklist

- [ ] All HTML changes tested locally (open in browser)
- [ ] `sitemap.xml` updated if new pages added
- [ ] No broken links (check new/changed pages)
- [ ] Images optimised (no raw photos > 500KB)
- [ ] MailerLite form present in footer of new pages

### Post-Deploy Checks

- [ ] Site loads at `https://jmsdevlab.com`
- [ ] SSL certificate valid (padlock icon)
- [ ] New/changed pages render correctly
- [ ] Interactive tools functional
- [ ] Plausible analytics script firing

For website architecture details, see [../architecture/12-website-architecture.md](../architecture/12-website-architecture.md).

---

## 3. Static App Websites (Cloudflare Pages)

Four app marketing websites are deployed manually via Wrangler CLI to Cloudflare Pages.

### JSM (Jewelry Studio Manager)

```bash
cd "C:/JM Programs/Custom Jewellery Manager/website" && npx wrangler pages deploy . --project-name=jewelry-studio-manager --branch=main
```

| Setting | Value |
|---------|-------|
| Project name | `jewelry-studio-manager` |
| Source path | `C:/JM Programs/Custom Jewellery Manager/website` |
| Build step | None (static) |

### StaffHub

```bash
cd "C:/JM Programs/Staff Hub/website" && npx wrangler pages deploy . --project-name=staff-hub --branch=main
```

| Setting | Value |
|---------|-------|
| Project name | `staff-hub` |
| Source path | `C:/JM Programs/Staff Hub/website` |
| Build step | None (static) |

### SmartCash

```bash
cd "C:/JM Programs/Smart Cash/apps/website" && npx wrangler pages deploy . --project-name=smartcashapp --branch=main
```

| Setting | Value |
|---------|-------|
| Project name | `smartcashapp` |
| Source path | `C:/JM Programs/Smart Cash/apps/website` |
| Build step | None (static) |

### QualCanvas

```bash
cd "C:/JM Programs/Canvas App/apps/frontend" && npm run build && npx wrangler pages deploy dist --project-name=canvas-app --branch=main
```

| Setting | Value |
|---------|-------|
| Project name | `canvas-app` |
| Source path | `C:/JM Programs/Canvas App/apps/frontend/dist` |
| Build step | **Required** — `npm run build` before deploy |

> **Important:** QualCanvas is the only static site that requires a build step. Run `npm run build` first, then deploy the `dist` folder.

### Quick Reference Table

| App | Project Name | Local Path | Build Required |
|-----|-------------|-----------|----------------|
| JSM | `jewelry-studio-manager` | `Custom Jewellery Manager/website` | No |
| StaffHub | `staff-hub` | `Staff Hub/website` | No |
| SmartCash | `smartcashapp` | `Smart Cash/apps/website` | No |
| QualCanvas | `canvas-app` | `Canvas App/apps/frontend/dist` | Yes (`npm run build`) |

---

## 4. Git-Push Auto-Deploy Services

These services deploy automatically when code is pushed to their `main` branch on GitHub.

### Vercel Auto-Deploy

| App | Vercel Project | GitHub Repo | Deploy Trigger |
|-----|---------------|------------|----------------|
| **GrowthMap** | growthmap | GitHub `main` push | Automatic |
| **ProfitShield** | profitshield | GitHub `main` push | Automatic |

Vercel builds and deploys on every push to `main`. Preview deployments are created for pull requests.

### Railway Auto-Deploy

| App | Railway Project | GitHub Repo | Deploy Trigger |
|-----|----------------|------------|----------------|
| **RepairDesk** | repairdesk | GitHub `main` push | Automatic |
| **Jewel Value** | jewel-value | GitHub `main` push | Automatic |
| **QualCanvas** (backend) | qualcanvas | GitHub `main` push | Automatic |

Railway watches the connected GitHub repo and redeploys on every push to `main`.

### Auto-Deploy Workflow

```
1. Make changes locally
2. Commit to local branch
3. Push to GitHub (main branch)
4. Platform detects push and starts build
5. Build completes → new version goes live
6. Verify deployment in platform dashboard
```

### Pre-Push Checklist (Auto-Deploy)

- [ ] Code compiles without errors locally
- [ ] Environment variables set on platform (if new ones added)
- [ ] Database migrations applied (if schema changed): `npx prisma migrate deploy`
- [ ] No secrets in committed code

---

## 5. Database Migrations

For apps using Prisma (PostgreSQL on Railway):

### Apply Migrations

```bash
# From the app's backend directory
npx prisma migrate deploy
```

### Create New Migration

```bash
# From the app's backend directory
npx prisma migrate dev --name description_of_change
```

### Migration Workflow

```
1. Modify prisma/schema.prisma
2. Run: npx prisma migrate dev --name your_migration_name
3. Test locally
4. Commit migration files (prisma/migrations/)
5. Push to GitHub → auto-deploy triggers
6. Railway runs prisma migrate deploy during build
```

For database details, see [../architecture/14-database-systems.md](../architecture/14-database-systems.md).

---

## 6. Post-Deploy Verification

### Standard Checks (All Deployments)

| Check | How | Expected Result |
|-------|-----|-----------------|
| Site loads | Visit URL in browser | HTTP 200, page renders |
| SSL valid | Check padlock icon | Valid certificate, no warnings |
| API responds | Hit health endpoint (`/api/health` or `/`) | JSON response or 200 |
| Webhooks fire | Check Shopify Partner dashboard | Webhooks registered and active |
| Logs clean | Check platform logs (Railway/Vercel dashboard) | No crash loops or errors |

### Platform-Specific Checks

| Platform | Dashboard URL | What to Check |
|----------|-------------|---------------|
| Cloudflare Pages | `dash.cloudflare.com` | Deployment status, build logs |
| Railway | `railway.app/dashboard` | Service status, deploy logs, database health |
| Vercel | `vercel.com/dashboard` | Deployment status, function logs |
| Shopify Partners | `partners.shopify.com` | App status, webhook health |

---

## 7. Rollback Procedures

### Cloudflare Pages (Static Sites)

```
1. Go to Cloudflare dashboard > Pages > [project]
2. Find previous successful deployment
3. Click "Rollback to this deployment"
```

Or redeploy the previous known-good version via Wrangler CLI.

### Railway

```
1. Go to Railway dashboard > [project] > Deployments
2. Find the previous successful deployment
3. Click "Redeploy"
```

Railway keeps deployment history — you can redeploy any previous version instantly.

### Vercel

```
1. Go to Vercel dashboard > [project] > Deployments
2. Click the previous deployment's "..." menu
3. Select "Promote to Production"
```

Vercel supports instant rollback to any previous deployment.

### Git Revert (All Platforms)

For auto-deploy platforms, you can also revert the offending commit:

```bash
git revert HEAD
git push origin main
```

This creates a new commit that undoes the changes and triggers a fresh deploy.

---

## 8. Environment Variable Management

### Where to Set Environment Variables

| Platform | Location |
|----------|----------|
| Railway | Project > Service > Variables tab |
| Vercel | Project > Settings > Environment Variables |
| Cloudflare Pages | Project > Settings > Environment Variables |
| Cloudflare Workers | `wrangler secret put VARIABLE_NAME` |

### Common Variables Across Apps

| Variable | Purpose | Where Set |
|----------|---------|-----------|
| `DATABASE_URL` | PostgreSQL connection string | Railway |
| `SHOPIFY_API_KEY` | Shopify app API key | Railway/Vercel |
| `SHOPIFY_API_SECRET` | Shopify app secret | Railway/Vercel |
| `SESSION_SECRET` | Express session signing | Railway/Vercel |
| `NODE_ENV` | Environment flag | All platforms |

> **Security:** Never commit environment variables to Git. Always set them through the platform's dashboard or CLI. See [../architecture/10-technical-architecture.md](../architecture/10-technical-architecture.md) for security practices.

---

## Cross-References

- [../architecture/10-technical-architecture.md](../architecture/10-technical-architecture.md) — Tech stack and security practices
- [../architecture/12-website-architecture.md](../architecture/12-website-architecture.md) — jmsdevlab.com site structure
- [../architecture/13-infrastructure-and-hosting.md](../architecture/13-infrastructure-and-hosting.md) — Hosting platform details
- [../architecture/14-database-systems.md](../architecture/14-database-systems.md) — Database migration procedures
- [../architecture/15-authentication-and-billing.md](../architecture/15-authentication-and-billing.md) — Billing env vars
- [41-monitoring-and-health-checks.md](41-monitoring-and-health-checks.md) — Post-deploy monitoring

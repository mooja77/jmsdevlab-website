# 43 -- Incident Response

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Backup and Recovery](44-backup-and-recovery.md) | [GDPR Compliance](../standards/73-gdpr-compliance.md) | [Coding Standards](../standards/71-coding-standards.md)

---

## Overview

JMS Dev Lab is a sole trader operation. John Moore is the only person who handles incidents. There is no team to escalate to, no on-call rotation, and no dedicated DevOps staff. This document provides clear, actionable runbooks for the most common incident types so that problems can be resolved quickly under pressure.

**Key principle:** When something breaks, follow the runbook. Do not improvise under stress.

---

## 1. Incident Severity Levels

| Level | Definition | Response Time | Examples |
|-------|-----------|---------------|---------|
| **P1 -- Critical** | Service completely down, data loss risk, security breach | Immediate | Website down, database unreachable, secret exposure |
| **P2 -- High** | Major feature broken, significant user impact | Within 4 hours | Billing not working, webhooks failing, auth broken |
| **P3 -- Medium** | Minor feature broken, workaround available | Within 24 hours | UI bug, non-critical API error, slow performance |
| **P4 -- Low** | Cosmetic issue, no functional impact | Within 1 week | Typo, minor styling issue, non-critical log noise |

---

## 2. General Incident Response Process

For any incident, follow this sequence:

### Step 1: Identify

- What is broken? Which app? Which component?
- When did it start? (Check deployment history, recent changes.)
- Who is affected? (All users, specific shops, specific features.)
- Is this a known issue? (Check recent deployments, recent code changes.)

### Step 2: Contain

- If a deployment caused the issue, roll back immediately.
- If a secret is exposed, rotate it immediately (do not wait to investigate).
- If a webhook is failing, check if Shopify is retrying (they retry for 48 hours).

### Step 3: Resolve

- Follow the specific runbook below for the incident type.
- Fix the root cause, not just the symptom.
- Test the fix in development before deploying to production.

### Step 4: Communicate

- If users are affected, communicate via the app's support channel.
- If Shopify review is pending, note any downtime in the review response.
- Email: john@jmsdevlab.com outbound, or in-app notification if available.

### Step 5: Post-Mortem

- Document what happened, why, and how it was fixed.
- Update this runbook if a new incident type is discovered.
- Add preventive measures (monitoring, alerts, tests).

---

## 3. Incident Runbooks

### 3.1 Website Down (jmsdevlab.com)

**Hosting:** Cloudflare Pages

**Diagnosis:**
1. Check https://jmsdevlab.com in a browser. Note the error (502, 504, DNS failure, etc.).
2. Check Cloudflare status: https://www.cloudflarestatus.com/
3. Check Cloudflare dashboard: https://dash.cloudflare.com/ > Pages > jmsdevlab.
4. Check if a recent deployment failed.

**Resolution:**
- **If Cloudflare is down:** Wait for Cloudflare to resolve. Nothing you can do.
- **If deployment failed:** Redeploy from local:
  ```bash
  cd "C:\JM Programs\JMS Dev Lab Website"
  npx wrangler pages deploy . --project-name=jmsdevlab
  ```
- **If DNS issue:** Check Cloudflare DNS settings. Verify A/CNAME records point to Cloudflare Pages.
- **If SSL issue:** Cloudflare manages SSL. Check certificate status in Cloudflare dashboard > SSL/TLS.

**Recovery time:** 5-15 minutes (redeploy) or dependent on Cloudflare (outage).

---

### 3.2 Backend API Down

**Hosting:** Railway (SmartCash, StaffHub, SpamShield, RepairDesk, TaxMatch, ProfitShield), Vercel (StaffHub admin)

**Diagnosis:**
1. Check the app's health endpoint: `GET https://[backend-url]/health`
2. Check Railway dashboard: https://railway.app/dashboard
3. Look at deployment logs for errors.
4. Check if the database is reachable (see 3.3).

**Resolution:**
- **If Railway is down:** Check https://status.railway.app/. Wait for resolution.
- **If deployment crashed:**
  1. Check Railway logs for the error.
  2. If a recent deploy caused it, redeploy the previous version from Railway dashboard.
  3. If the error is in code, fix locally, push to GitHub, Railway auto-deploys.
- **If out of resources:** Check Railway usage. Free tier has limits. Upgrade or optimise.
- **If environment variables missing:** Check Railway service > Variables tab. Compare with `.env.example`.

**Vercel-hosted services (StaffHub admin):**
1. Check Vercel dashboard: https://vercel.com/dashboard
2. Check deployment logs.
3. Redeploy from dashboard or push to GitHub.

**Recovery time:** 5-30 minutes depending on cause.

---

### 3.3 Database Failure

**Databases:** Railway PostgreSQL (most apps), Railway MongoDB (StaffHub), Firebase RTDB (Pitch Side), Supabase (GrowthMap)

**Diagnosis:**
1. Check if the API server can connect: Look for connection errors in Railway logs.
2. Check Railway dashboard for database service health.
3. Verify `DATABASE_URL` environment variable is correct and not expired.

**Resolution -- Railway PostgreSQL:**
- **Connection refused:**
  1. Check Railway dashboard > database service > is it running?
  2. If stopped, restart from dashboard.
  3. If connection string changed, update `DATABASE_URL` in the backend service.
- **Database corrupted:**
  1. Railway provides daily snapshots. Restore from the latest snapshot via Railway dashboard.
  2. Check data integrity after restore.
- **Connection limit exceeded:**
  1. Check for connection leaks in code (Prisma connection pool).
  2. Restart the backend service to release connections.
  3. Consider adding connection pooling configuration.

**Resolution -- Railway MongoDB (StaffHub):**
- Same diagnostic process as PostgreSQL.
- MongoDB connection string format: `mongodb://[user]:[pass]@[host]:[port]/[db]`
- Check Mongoose connection event handlers for error details.

**Resolution -- Firebase RTDB (Pitch Side):**
1. Check Firebase Console: https://console.firebase.google.com/
2. Verify Firebase project is active and not suspended.
3. Check Firebase rules -- ensure they allow the required operations.
4. Check usage quotas (free Spark plan has limits).

**Resolution -- Supabase (GrowthMap):**
1. Check Supabase dashboard for project status.
2. If project is paused (free tier inactivity), resume it.
3. Verify connection string in environment variables.

**Recovery time:** 10-60 minutes. Snapshot restore may take longer.

---

### 3.4 Shopify Webhook Failures

**Diagnosis:**
1. Log in to Shopify Partners: https://partners.shopify.com
2. Navigate to Apps > [Your App] > Webhooks.
3. Check webhook delivery status -- look for failed deliveries.
4. Check the backend logs for webhook processing errors.

**Common Causes:**
- **Backend is down:** Shopify cannot reach the webhook endpoint. Fix the backend first.
- **Webhook URL changed:** If the backend URL changed (Railway redeploy with new URL), update webhook URLs in the Shopify app configuration.
- **Timeout:** Webhook handler takes too long (>5 seconds). Optimise the handler or process asynchronously.
- **Signature verification failing:** HMAC verification code is wrong or using the wrong secret.

**Resolution:**
1. Fix the underlying cause (server down, timeout, etc.).
2. Shopify retries failed webhooks for 48 hours. Most will auto-recover.
3. If webhooks need to be re-registered, use the Shopify API or reinstall the app on the development store.
4. Check GDPR webhooks specifically -- these are checked during app review.

**Recovery time:** Automatic (Shopify retries) once the underlying issue is fixed.

---

### 3.5 Email Not Working

**Setup:** Cloudflare Email Routing -> mooja77@gmail.com, Gmail Send As for john@jmsdevlab.com

**Diagnosis -- Receiving (hello@ or john@ not arriving):**
1. Check Cloudflare dashboard > Email > Email Routing.
2. Verify routing rules are active (hello@ -> mooja77@gmail.com).
3. Check Gmail spam folder.
4. Send a test email from a different account.

**Diagnosis -- Sending (john@jmsdevlab.com Send As not working):**
1. Open Gmail > Settings > Accounts and Import > Send mail as.
2. Check that john@jmsdevlab.com is listed and verified.
3. If "Authentication failed," the Gmail app password may have expired.

**Resolution:**
- **Routing broken:** Re-check Cloudflare Email Routing rules. Re-add if necessary.
- **App password expired:**
  1. Go to Google Account > Security > App Passwords.
  2. Generate a new app password.
  3. Update Gmail Send As configuration with the new password.
- **DNS records wrong:** Check MX, SPF, DKIM records in Cloudflare DNS:
  - MX records should route through Cloudflare Email Routing.
  - SPF: `v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all`
  - DKIM: MailerLite DKIM records must be present for authenticated sending.

**Recovery time:** 5-30 minutes. DNS changes may take up to 48 hours to propagate.

---

### 3.6 Security Incident

**This is always P1 -- Critical. Act immediately.**

**Types of Security Incidents:**
- Secret (API key, password, database URL) exposed in code, logs, or public repository.
- Unauthorised access to accounts or infrastructure.
- Data breach (user data exposed or stolen).
- Malicious code injection.

**Immediate Response:**

#### Secret Exposure

1. **Rotate the secret immediately.** Do not investigate first.
   - Shopify API key/secret: Regenerate in Partners dashboard.
   - Database URL: Change password in Railway dashboard, update connection string.
   - Gmail app password: Revoke and regenerate in Google Account.
   - Cloudflare API token: Revoke and regenerate.
2. **Check `.gitignore`:** Ensure `.env`, `.env.*`, and sensitive files are listed.
3. **Check git history:** If the secret was committed:
   ```bash
   git log --all --full-history -- ".env*"
   ```
   If found, remove from history using BFG Repo Cleaner or `git filter-branch`.
4. **Audit access:** Check for any unauthorised API calls or logins during the exposure window.

**Learned from experience:** Commit `3a86f58` in the JMS Dev Lab repo was a security cleanup after secrets (`.env.production`, Playwright MCP logs) were committed to git history. The `.gitignore` was updated to prevent recurrence. Commit `69b3f50` removed `node_modules` that contained an exposed API key.

#### Unauthorised Access

1. Change passwords on all affected accounts immediately.
2. Enable 2FA on any accounts where it is not already active.
3. Check audit logs (GitHub, Cloudflare, Railway, Shopify Partners).
4. Revoke any active sessions.

#### Data Breach

1. Follow the GDPR breach notification process (see [GDPR Compliance](../standards/73-gdpr-compliance.md)).
2. Notify the Irish Data Protection Commission within 72 hours if user data is involved.
3. Notify affected users.
4. Document everything.

**Recovery time:** Varies. Secret rotation is immediate. Full investigation and remediation may take days.

---

## 4. Monitoring and Detection

### Current Monitoring

| What | How | Frequency |
|------|-----|-----------|
| Website uptime | Manual check + Google Search Console | Daily |
| API health | Health endpoint check | Manual (no automated monitoring) |
| Shopify webhooks | Shopify Partners dashboard | Check after deployments |
| Email delivery | Send test emails | Weekly |
| GitHub repo | Dependabot alerts | As notified |

### Gaps (Known Risks)

- **No automated uptime monitoring.** If the website or API goes down at night, nobody knows until morning.
- **No error alerting.** Server errors are logged but do not trigger notifications.
- **No performance monitoring.** Slow API responses are not detected proactively.

### Recommended Improvements (When Budget Allows)

- UptimeRobot (free tier: 50 monitors, 5-minute interval) for all production URLs.
- Sentry (free tier) for error tracking on backend and frontend.
- Railway metrics dashboard for resource usage alerts.

---

## 5. Escalation

There is no escalation path. John Moore handles everything.

### External Support Contacts

| Service | Support Channel | Response Time |
|---------|----------------|---------------|
| Shopify Partners | partners@shopify.com, Partners dashboard | 1-3 business days |
| Railway | Railway Discord, support@railway.app | Hours to 1 day |
| Vercel | Vercel support (free tier limited) | 1-3 business days |
| Cloudflare | Cloudflare dashboard, community forums | Varies |
| Firebase | Firebase support (free tier limited) | Varies |
| Google (OAuth, Search Console) | Google Cloud support | Varies |

### When to Contact External Support

- Infrastructure is down and it is not your code (check status pages first).
- Account suspended or access revoked unexpectedly.
- Billing disputes or unexpected charges.
- Shopify app review questions (use the review response mechanism, not email).

---

## 6. Post-Incident Checklist

After resolving any P1 or P2 incident:

- [ ] Root cause identified and documented.
- [ ] Fix deployed and verified in production.
- [ ] Affected users notified (if applicable).
- [ ] Monitoring gap addressed (if the incident could have been detected earlier).
- [ ] This runbook updated if a new incident type or resolution step was discovered.
- [ ] Preventive measures implemented (test, guard, alert).
- [ ] Git history checked for any secrets committed during the incident.

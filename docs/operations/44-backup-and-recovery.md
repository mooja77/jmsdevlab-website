# 44 -- Backup and Recovery

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Incident Response](43-incident-response.md) | [GDPR Compliance](../standards/73-gdpr-compliance.md)

---

## Overview

This document covers the backup strategy and recovery procedures for all JMS Dev Lab systems. As a sole trader operation, there is no dedicated backup infrastructure -- backups rely on the built-in capabilities of each hosting platform plus local copies of code.

**Key risk:** Environment variables are NOT systematically backed up. This is the single biggest recovery risk across the portfolio.

---

## 1. Backup Inventory

### Code Repositories

| What | Where | Backup Method | Frequency | Retention |
|------|-------|--------------|-----------|-----------|
| All app source code | GitHub (mooja77, private repos) | Git push | Every commit | Full history |
| Local copies | `C:\JM Programs\` | Local filesystem | Real-time (working copies) | Until deleted |

**Recovery:** Clone from GitHub. All repos are private under the `mooja77` account. Every app has its own repository.

**Risk:** If John's GitHub account is compromised or suspended, all code is at risk. Local copies on the development machine provide a secondary backup, but are not offsite.

### Databases

| Database | Platform | App(s) | Backup Method | Frequency | Retention |
|----------|----------|--------|--------------|-----------|-----------|
| PostgreSQL | Railway | SmartCash, RepairDesk, SpamShield, TaxMatch, ProfitShield, ThemeSweep, Jewel Value, JewelryStudioManager | Railway automatic snapshots | Daily | 7 days (free tier) |
| MongoDB | Railway | StaffHub | Railway automatic snapshots | Daily | 7 days (free tier) |
| Firebase RTDB | Firebase (Google) | Pitch Side | Firebase automatic backups | Daily (Blaze plan) or manual export (Spark plan) | Varies by plan |
| Supabase PostgreSQL | Supabase | GrowthMap | Supabase automatic backups | Daily | 7 days (free tier) |

#### Railway PostgreSQL Recovery

1. Log in to Railway dashboard: https://railway.app/dashboard
2. Navigate to the PostgreSQL service.
3. Go to Backups tab.
4. Select the snapshot to restore from.
5. Click Restore.
6. Verify data integrity after restore.

**Manual backup (if needed):**
```bash
# Get connection string from Railway dashboard
pg_dump "postgresql://[user]:[pass]@[host]:[port]/[db]" > backup_$(date +%Y%m%d).sql
```

#### Railway MongoDB Recovery

1. Same process as PostgreSQL via Railway dashboard.
2. Manual backup:
```bash
mongodump --uri="mongodb://[user]:[pass]@[host]:[port]/[db]" --out=backup_$(date +%Y%m%d)
```

#### Firebase Export

1. Go to Firebase Console: https://console.firebase.google.com/
2. Navigate to the Pitch Side project.
3. Realtime Database > Export JSON.
4. Save the JSON file locally.

**Automated backups require Blaze (pay-as-you-go) plan.** On the free Spark plan, exports must be done manually.

#### Supabase Recovery

1. Log in to Supabase dashboard.
2. Navigate to the GrowthMap project.
3. Settings > Database > Backups.
4. Download or restore from available backup point.

**Manual backup:**
```bash
pg_dump "postgresql://[connection-string]" > supabase_backup_$(date +%Y%m%d).sql
```

---

### Website

| What | Where | Backup Method |
|------|-------|--------------|
| JMS Dev Lab website | Cloudflare Pages + local + GitHub | Git repo |
| App marketing websites | Cloudflare Pages / Vercel + local + GitHub | Git repo |

**Recovery:** Redeploy from the git repository to Cloudflare Pages:
```bash
cd "C:\JM Programs\JMS Dev Lab Website"
npx wrangler pages deploy . --project-name=jmsdevlab
```

The website is static HTML/CSS/JS with no build process. Recovery is essentially instant via redeploy.

---

### Environment Variables

| What | Where | Backup Method | Status |
|------|-------|--------------|--------|
| `.env` files | Local machine (`C:\JM Programs\[app]\.env`) | **NOT BACKED UP** | **RISK** |
| Railway env vars | Railway dashboard (per service) | Platform-managed | Accessible via dashboard |
| Vercel env vars | Vercel dashboard (per project) | Platform-managed | Accessible via dashboard |
| Cloudflare env vars | Cloudflare dashboard | Platform-managed | Accessible via dashboard |
| Firebase config | Firebase Console | Platform-managed | Accessible via console |
| Supabase config | Supabase dashboard | Platform-managed | Accessible via dashboard |

**CRITICAL RISK:** Local `.env` files are the authoritative source for many environment variables. If the development machine fails:

- Some variables can be recovered from platform dashboards (Railway, Vercel, Cloudflare).
- Some variables would need to be regenerated (API keys, secrets).
- There is no single document listing all env vars and their values.
- `.env.example` files list variable names but not values.

**Recommended Mitigation (Not Yet Implemented):**
1. Create an encrypted backup of all `.env` files using GPG or age.
2. Store the encrypted backup in a secure location (separate from the code repos).
3. Update the backup after any env var changes.
4. Document the encryption key in a password manager (separate from the backup).

---

### Email

| What | Where | Backup Method |
|------|-------|--------------|
| All email | Gmail (mooja77@gmail.com) | Google's infrastructure |
| Email routing config | Cloudflare dashboard | Platform-managed |
| MailerLite contacts | MailerLite dashboard | Platform-managed |
| MailerLite email sequences | MailerLite dashboard | Platform-managed |

**Recovery:** Email is stored in Gmail and managed by Google's infrastructure. No additional backup is needed. If Gmail access is lost, recovery is through Google's account recovery process.

**Risk:** If the mooja77@gmail.com account is compromised, email access, Cloudflare routing, and MailerLite sending are all affected. 2FA should be enabled on this account.

---

### DNS and Domain Configuration

| What | Where | Backup Method |
|------|-------|--------------|
| DNS records | Cloudflare | Platform-managed |
| Domain registrations | Various registrars | Registrar accounts |
| SSL certificates | Cloudflare (auto-managed) | Automatic |

**Recovery:** DNS records are managed in Cloudflare. If records are accidentally deleted, they would need to be reconfigured manually. There is no automated backup of DNS records.

**Recommended:** Periodically export DNS records for all domains as a reference.

---

## 2. Recovery Priority Order

If everything goes down simultaneously, recover in this order:

| Priority | System | Why | Recovery Method | Estimated Time |
|----------|--------|-----|----------------|---------------|
| 1 | **JMS Dev Lab website** | Public face of the business | Redeploy from git to Cloudflare Pages | 5 minutes |
| 2 | **Backend APIs** | Apps depend on these | Push to GitHub, Railway auto-deploys | 10-15 minutes |
| 3 | **Databases** | Data persistence | Restore from Railway/Supabase/Firebase snapshots | 15-30 minutes |
| 4 | **Frontends** | User-facing apps | Push to GitHub, Vercel/Cloudflare auto-deploys | 10-15 minutes |
| 5 | **Email** | Communication | Check Cloudflare routing, Gmail app passwords | 5-30 minutes |
| 6 | **App marketing sites** | Lower priority | Redeploy from git | 10-15 minutes |

**Rationale:**
- The website comes first because it is the public-facing brand. Potential clients check it.
- Backend APIs come second because Shopify apps (and standalone apps) depend on them.
- Databases come third because data loss is the worst outcome. Restore from latest snapshot.
- Frontends can be redeployed quickly from git and are less critical than the APIs they depend on.
- Email is important but not immediately critical -- a few hours of email downtime is tolerable.

---

## 3. Disaster Recovery Scenarios

### Scenario 1: Development Machine Failure

**Impact:** Local code, `.env` files, and working state lost.

**Recovery:**
1. Set up a new development machine.
2. Install Node.js, npm/pnpm, Git, VS Code/Cursor.
3. Clone all repositories from GitHub (mooja77).
4. Recover `.env` files:
   - Railway: Copy env vars from Railway dashboard for each service.
   - Vercel: Copy env vars from Vercel dashboard.
   - Firebase: Download service account key from Firebase Console.
   - Shopify: Retrieve API key/secret from Shopify Partners dashboard.
   - **Some values may need to be regenerated** (app passwords, custom secrets).
5. Run `npm install` in each project.
6. Test each app locally.

**Estimated recovery time:** 4-8 hours (including environment reconstruction).

### Scenario 2: GitHub Account Compromise

**Impact:** Code repositories could be deleted, made public, or modified.

**Recovery:**
1. Contact GitHub support immediately.
2. If repos are deleted, restore from local copies on development machine.
3. Change GitHub password and enable 2FA.
4. Revoke all personal access tokens and SSH keys.
5. Audit repo settings (visibility, collaborators, deploy keys).

**Prevention:** Enable 2FA on GitHub. Use strong, unique password.

### Scenario 3: Railway Goes Down

**Impact:** Backend APIs and databases for most apps are offline.

**Recovery:**
1. Check Railway status: https://status.railway.app/
2. If prolonged outage, consider migrating to alternatives:
   - Backend: Render (free tier), Fly.io, or Vercel serverless functions.
   - Database: Supabase (PostgreSQL), Neon (PostgreSQL), MongoDB Atlas.
3. Update DNS/URLs to point to new hosting.
4. Update environment variables in remaining services.

**Prevention:** Railway has been reliable, but having a mental model of migration paths is important.

### Scenario 4: Cloudflare Goes Down

**Impact:** Website, DNS, email routing, and some app hosting affected.

**Recovery:**
1. Check Cloudflare status: https://www.cloudflarestatus.com/
2. Wait for Cloudflare to resolve (no alternative for DNS during outage).
3. If prolonged, consider:
   - Moving DNS to another provider (requires domain registrar changes).
   - Moving email routing to a different provider.
   - Moving Pages hosting to Vercel/Netlify.

**Prevention:** Cloudflare outages are rare and typically short. Accept the risk.

### Scenario 5: Data Breach

**Impact:** User/merchant data exposed.

**Recovery:**
1. Follow [Incident Response](43-incident-response.md) security incident runbook.
2. Follow [GDPR Compliance](../standards/73-gdpr-compliance.md) breach notification process.
3. Rotate all secrets and credentials.
4. Audit all access logs.
5. Notify affected users and Irish DPC within 72 hours.

---

## 4. Backup Schedule

### Automated (No Action Required)

| System | Frequency | Provider |
|--------|-----------|----------|
| Railway PostgreSQL snapshots | Daily | Railway |
| Railway MongoDB snapshots | Daily | Railway |
| Supabase backups | Daily | Supabase |
| Git pushes (code) | Every commit | GitHub |

### Manual (Periodic Action Required)

| Task | Frequency | Procedure |
|------|-----------|-----------|
| Firebase RTDB export (Pitch Side) | Weekly | Firebase Console > RTDB > Export JSON |
| Local `.env` backup | After any change | Copy `.env` files to encrypted backup location |
| DNS record export | Monthly | Cloudflare > DNS > Export |
| MailerLite contact export | Monthly | MailerLite > Subscribers > Export |

---

## 5. Testing Backups

Backups are worthless if they cannot be restored. Periodically verify:

| Test | Frequency | Procedure |
|------|-----------|-----------|
| Clone repo and build | Monthly | Clone any repo, run `npm install && npm run build` |
| Database restore | Quarterly | Restore a Railway snapshot to a test database, verify data |
| Website redeploy | Monthly | Redeploy from git to verify the process works |
| Firebase export/import | Quarterly | Export JSON, import to a test project |

---

## 6. Risk Summary

| Risk | Likelihood | Impact | Mitigation Status |
|------|-----------|--------|-------------------|
| `.env` files lost (machine failure) | Medium | High | **NOT MITIGATED -- create encrypted backup** |
| GitHub account compromised | Low | Critical | 2FA recommended, local copies exist |
| Railway outage | Low | High | Daily snapshots, migration path known |
| Cloudflare outage | Very Low | High | Accept risk, no practical mitigation |
| Data breach | Low | Critical | GDPR process documented, secrets management improving |
| Local machine failure | Medium | Medium | Code in GitHub, env vars partially recoverable |

**Top priority action:** Create an encrypted backup of all `.env` files and store securely offsite.

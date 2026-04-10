# 73 -- GDPR Compliance

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Coding Standards](71-coding-standards.md) | [App Build Playbook](70-app-build-playbook.md) | [Shopify Submission Runbook](../operations/42-shopify-submission-runbook.md)

---

## Overview

GDPR compliance is mandatory for all JMS Dev Lab applications. For Shopify apps, this includes implementing three mandatory webhooks. For standalone web apps, this means providing data export and deletion capabilities. Non-compliance is a common reason for Shopify app rejection and a legal liability under EU law.

JMS Dev Lab is based in Ireland (EU member state), making GDPR compliance non-optional regardless of where merchants or users are located.

---

## 1. Shopify Mandatory Webhooks

Shopify requires every app to handle three GDPR webhooks. These are checked during app review and must be functional, not just registered.

### 1.1 customers/data_request

**Purpose:** A merchant's customer requests their personal data. Shopify sends this webhook so your app can return any data it stores about that customer.

**Payload:**
```json
{
  "shop_id": 123456,
  "shop_domain": "example.myshopify.com",
  "orders_requested": [123, 456],
  "customer": {
    "id": 789,
    "email": "customer@example.com",
    "phone": "+1234567890"
  },
  "data_request": {
    "id": 101112
  }
}
```

**Required Response:**
- Query your database for all data associated with the customer ID and shop.
- Compile a JSON report of stored data.
- Email the report to the merchant (or make it available via your app's UI).
- Respond with HTTP 200 to acknowledge receipt.

**Implementation Checklist:**
- [ ] Webhook endpoint registered in Shopify app configuration.
- [ ] Handler queries all tables/collections for customer data.
- [ ] Response compiled and delivered to merchant.
- [ ] Endpoint returns 200 within Shopify's timeout (5 seconds).
- [ ] Error handling: log failures, retry if possible.

### 1.2 customers/redact

**Purpose:** A merchant's customer requests deletion of their personal data. Your app must delete or anonymise all stored personal data for that customer.

**Payload:**
```json
{
  "shop_id": 123456,
  "shop_domain": "example.myshopify.com",
  "customer": {
    "id": 789,
    "email": "customer@example.com",
    "phone": "+1234567890"
  },
  "orders_to_redact": [123, 456]
}
```

**Required Actions:**
- Delete all personally identifiable information (PII) for the customer.
- If deletion would break data integrity, anonymise instead (replace with "REDACTED").
- Retain non-personal aggregate data if needed for analytics.
- Log the redaction for audit purposes (without PII).
- Respond with HTTP 200.

**Implementation Checklist:**
- [ ] Handler identifies all PII fields for the customer.
- [ ] PII deleted or anonymised.
- [ ] Redaction logged (timestamp, shop_id, customer_id -- no PII in log).
- [ ] Endpoint returns 200 within timeout.

### 1.3 shop/redact

**Purpose:** 48 hours after a merchant uninstalls your app, Shopify sends this webhook. Your app must delete all data for that shop.

**Payload:**
```json
{
  "shop_id": 123456,
  "shop_domain": "example.myshopify.com"
}
```

**Required Actions:**
- Delete ALL data associated with the shop_id.
- This includes: shop settings, customer data, order data, configuration, analytics.
- Cancel any active subscriptions or background jobs for the shop.
- Respond with HTTP 200.

**Implementation Checklist:**
- [ ] Handler deletes all records scoped to shop_id.
- [ ] Background jobs/cron for the shop cancelled.
- [ ] Billing subscription cancelled (if not already handled by app/uninstalled webhook).
- [ ] Endpoint returns 200.
- [ ] Deletion is complete -- no orphaned data remains.

---

## 2. Per-App GDPR Compliance Matrix

### Shopify Apps

| App | customers/data_request | customers/redact | shop/redact | Privacy Policy | Status |
|-----|----------------------|-----------------|------------|----------------|--------|
| SmartCash | Implemented | Implemented | Implemented | Live (smartcashapp.net/privacy) | Compliant |
| ProfitShield | Implemented | Implemented | Implemented | Live (profitshield.app/privacy) | Compliant |
| Jewel Value | Implemented | Implemented | Implemented | Live (jewelvalue.app/privacy) | Compliant |
| ThemeSweep | Implemented | Implemented | Implemented | Live (themesweep.app/privacy) | Compliant |
| **RepairDesk** | **Needs verification** | **Needs verification** | **Needs verification** | Live (repairdeskapp.net/privacy) | **CRITICAL -- Verify** |
| SpamShield | Implemented | Implemented | Implemented | Needs URL | Partial |
| GrowthMap | Implemented | Implemented | Implemented | Live (mygrowthmap.net/privacy) | Compliant |
| JewelryStudioManager | Implemented | Implemented | Implemented | Live (jewelrystudiomanager.com/privacy) | Compliant |
| StaffHub | Implemented | Implemented | Implemented | Live (staffhubapp.com/privacy) | Compliant |
| TaxMatch | Implemented | Implemented | Implemented | Needs URL | Partial |

### Standalone Apps

| App | Data Export | Data Deletion | Privacy Policy | Status |
|-----|-----------|--------------|----------------|--------|
| **Pitch Side** | **Not implemented** | **Not implemented** | Live (pitchsideapp.net/privacy) | **CRITICAL -- No user data export/delete** |
| QualCanvas | Implemented | Implemented | Live (qualcanvas.com/privacy) | Compliant |

---

## 3. CRITICAL Gaps

### RepairDesk -- GDPR Webhooks Need Verification

- RepairDesk was built before the standardised monorepo pattern.
- GDPR webhook handlers may exist but have not been verified as functional.
- **Action required:** Test all 3 webhooks on a development store. Verify they actually process and delete data.
- **Priority:** High -- app is submitted for Shopify review.

### Pitch Side -- No User Data Export or Deletion

- Pitch Side uses Firebase (Realtime Database + Auth) for user data.
- There is currently no mechanism for users to:
  - Export their data (coaching plans, match history).
  - Request deletion of their account and associated data.
- **Action required:** Build a data export feature (JSON download) and account deletion flow.
- **Priority:** Medium -- app is not on Shopify (no webhook requirement), but GDPR still applies as JMS Dev Lab is EU-based.

---

## 4. Standalone Web App Requirements

Even though standalone web apps are not subject to Shopify's webhook requirements, GDPR still mandates:

### Data Export (Right of Access)

- Users must be able to export all their personal data.
- Provide a "Download My Data" button in account settings.
- Export format: JSON or CSV.
- Include: profile information, app-specific data, usage history.
- Deliver within 30 days of request (automated export is ideal).

### Data Deletion (Right to Erasure)

- Users must be able to request account and data deletion.
- Provide a "Delete My Account" button in account settings.
- Confirm with the user (irreversible action).
- Delete or anonymise all personal data.
- Send confirmation email after deletion.
- Retain only what is legally required (invoices, tax records).

### Consent

- Cookie consent banner on marketing websites.
- Clear opt-in for email marketing (MailerLite).
- No pre-checked consent boxes.

---

## 5. Privacy Policy Requirements

Every app must have a publicly accessible privacy policy. It must include:

### Required Sections

1. **What data is collected** -- Enumerate specific data types (name, email, shop URL, order data, etc.).
2. **How data is used** -- Specific purposes (provide the service, analytics, support).
3. **Data sharing** -- Third parties who receive data (Shopify, payment processors, hosting providers).
4. **Data retention** -- How long data is kept and when it is deleted.
5. **User rights** -- Right to access, rectify, delete, restrict processing, data portability.
6. **Contact information** -- john@jmsdevlab.com for data-related requests.
7. **Cookie policy** -- What cookies are used and why.
8. **Changes to policy** -- How users are notified of updates.

### Hosting

- Privacy policy hosted on the app's marketing website.
- URL format: `https://appname.com/privacy` or `https://appname.com/privacy-policy`.
- Must be accessible without authentication.
- Link provided in Shopify app listing and app footer.

---

## 6. Data Retention Policy

### Shopify Apps

| Event | Retention Action |
|-------|-----------------|
| App installed | Store shop data, begin data collection |
| App uninstalled | Retain data for 48 hours (Shopify sends shop/redact after 48h) |
| shop/redact received | Delete ALL shop data immediately |
| customers/redact received | Delete customer PII immediately, retain anonymised aggregate data |

### Standalone Apps

| Event | Retention Action |
|-------|-----------------|
| Account created | Store user data |
| Account deleted | Delete all PII within 30 days, retain anonymised analytics |
| Subscription cancelled | Retain data for 90 days (re-activation window), then delete |
| Legal requirement | Retain invoices/tax records for 6 years (Irish Revenue requirement) |

---

## 7. Data Processing Inventory

### Data Types Commonly Stored

| Data Type | Category | Sensitivity | Retention |
|-----------|----------|------------|-----------|
| Shop domain, name | Business | Low | Until uninstall + shop/redact |
| Merchant email | Personal | Medium | Until uninstall + shop/redact |
| Customer names | Personal (PII) | High | Until customers/redact |
| Customer emails | Personal (PII) | High | Until customers/redact |
| Order data | Business | Medium | Until shop/redact |
| App settings | Configuration | Low | Until shop/redact |
| Usage analytics | Aggregate | Low | Indefinite (anonymised) |

### Data Storage Locations

| Platform | Apps Using It | Data Type |
|----------|--------------|-----------|
| Railway PostgreSQL | SmartCash, RepairDesk, SpamShield, TaxMatch, ProfitShield | All app data |
| Railway MongoDB | StaffHub | All app data |
| Firebase RTDB | Pitch Side | User profiles, coaching data |
| Supabase | GrowthMap | User data, marketing plans |
| Vercel | StaffHub admin frontend | No persistent data (frontend only) |
| Cloudflare Pages | Marketing websites | No persistent data (static sites) |

---

## 8. Incident Response for Data Breaches

If a data breach is suspected:

1. **Contain** -- Immediately revoke compromised credentials, rotate API keys.
2. **Assess** -- Determine what data was exposed and how many users are affected.
3. **Notify** -- Under GDPR, notify the Data Protection Commission (DPC) within 72 hours if the breach risks user rights.
4. **Communicate** -- Inform affected users with clear, honest communication.
5. **Remediate** -- Fix the vulnerability, update security practices.
6. **Document** -- Record the breach, response, and lessons learned.

**Irish DPC Contact:** https://www.dataprotection.ie/

See [Incident Response](../operations/43-incident-response.md) for the full incident response playbook.

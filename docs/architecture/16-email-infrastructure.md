# 16 — Email Infrastructure

> **Last Updated:** 2026-03-25
> **Maintainer:** John Moore (john@jmsdevlab.com)
> **Status:** LIVE

---

## Overview

JMS Dev Lab uses a combination of Cloudflare Email Routing, Gmail, and MailerLite to handle inbound and outbound email across the business and its apps. This document covers all email addresses, routing rules, DNS records, and marketing email configuration.

---

## 1. Business Email Addresses

### hello@jmsdevlab.com (Primary Business Contact)

| Direction | Method | Details |
|-----------|--------|---------|
| **Inbound** | Cloudflare Email Routing | Routes to `mooja77@gmail.com` |
| **Outbound** | MailerLite SMTP | Sends via MailerLite authenticated SMTP |

Used for: Website contact forms, newsletter sending, general business inquiries.

### john@jmsdevlab.com (Personal Business Email)

| Direction | Method | Details |
|-----------|--------|---------|
| **Inbound** | Cloudflare Email Routing | Routes to `mooja77@gmail.com` |
| **Outbound** | Gmail "Send mail as" | Uses Google App Password (named "JMS Dev Lab Email") |

Used for: Direct client communication, invoicing, platform account registrations, professional correspondence.

#### Gmail "Send mail as" Setup

1. Gmail Settings > Accounts and Import > Send mail as
2. Added `john@jmsdevlab.com` as a sending address
3. SMTP server: `smtp.gmail.com`, port 587, TLS
4. Authentication: Google App Password (not the main Google password)
5. App Password label: **"JMS Dev Lab Email"**
6. Emails sent from Gmail show `john@jmsdevlab.com` as the From address

---

## 2. App Support Email Addresses

| Email Address | App | Routing |
|--------------|-----|---------|
| `support@smartcashapp.net` | SmartCash | Domain-specific routing |
| `support@staffhubapp.com` | StaffHub | Domain-specific routing |
| `support@jewelrystudiomanager.com` | JSM | Domain-specific routing |

These addresses are listed in app documentation, Shopify app listings, and privacy policies as the support contact for each respective app.

---

## 3. DNS Email Records (jmsdevlab.com)

All DNS records are managed through Cloudflare.

### SPF Record

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com include:_spf.mlsend.com ~all
```

This authorises both Gmail and MailerLite to send email on behalf of `jmsdevlab.com`.

### DKIM Records

#### Gmail DKIM

```
Type: TXT
Name: google._domainkey
Value: [Google-generated DKIM public key]
```

#### MailerLite DKIM

```
Type: CNAME
Name: ml._domainkey
Value: [MailerLite-provided DKIM CNAME target]
```

*Two DKIM records are required — one for Gmail sending (john@) and one for MailerLite sending (hello@/newsletters).*

### DMARC Record

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:mooja77@gmail.com
```

| DMARC Setting | Value | Meaning |
|---------------|-------|---------|
| `p=none` | Monitor mode | No emails rejected; reports collected |
| `rua` | `mooja77@gmail.com` | Aggregate reports sent here |

> **Note:** DMARC is in monitor mode (`p=none`). Once email delivery is confirmed stable, this should be tightened to `p=quarantine` or `p=reject`.

### MX Records

Cloudflare Email Routing configures MX records automatically:

```
Type: MX
Name: @
Priority: Various
Value: [Cloudflare Email Routing MX servers]
```

---

## 4. Cloudflare Email Routing

| Setting | Value |
|---------|-------|
| Domain | `jmsdevlab.com` |
| Provider | Cloudflare Email Routing (free) |
| Catch-all | Disabled (only explicit routes) |

### Routing Rules

| From | To | Purpose |
|------|-----|---------|
| `hello@jmsdevlab.com` | `mooja77@gmail.com` | Business inquiries |
| `john@jmsdevlab.com` | `mooja77@gmail.com` | Personal business email |

All inbound email for `jmsdevlab.com` arrives in the `mooja77@gmail.com` inbox. There is no separate mailbox — Gmail serves as the unified inbox.

---

## 5. MailerLite Configuration

| Setting | Value |
|---------|-------|
| Account | Free plan |
| Sending domain | `jmsdevlab.com` (authenticated) |
| Domain authentication | SPF + DKIM verified |
| From address | `hello@jmsdevlab.com` |
| Reply-to | `hello@jmsdevlab.com` |

### Newsletter Signup Forms

- Embedded in **all page footers** on jmsdevlab.com
- Simple email-only signup (no name field)
- Connected to MailerLite subscriber list

### Welcome Drip Sequence

A 5-email automated sequence triggered when a new subscriber joins:

| Email # | Timing | Content Focus |
|---------|--------|---------------|
| 1 | Immediate | Welcome, intro to JMS Dev Lab, what to expect |
| 2 | Day 2 | Featured app spotlight |
| 3 | Day 4 | Blog content highlights, industry tips |
| 4 | Day 7 | Free tools showcase (calculators, assessments) |
| 5 | Day 10 | Soft CTA — explore apps, book a call |

### Newsletter Strategy

- Frequency: As-needed (no fixed schedule yet)
- Content: New blog posts, app updates, industry insights
- List hygiene: MailerLite handles bounces and unsubscribes automatically

---

## 6. Email Flow Diagram

```
INBOUND:
  [Sender] → hello@jmsdevlab.com → Cloudflare Email Routing → mooja77@gmail.com
  [Sender] → john@jmsdevlab.com  → Cloudflare Email Routing → mooja77@gmail.com

OUTBOUND (Business/Personal):
  Gmail (mooja77@gmail.com) → "Send mail as" john@jmsdevlab.com → smtp.gmail.com → [Recipient]

OUTBOUND (Marketing/Newsletter):
  MailerLite → hello@jmsdevlab.com → MailerLite SMTP → [Subscriber]

OUTBOUND (App Support):
  Per-app email addresses → respective domain routing → [Customer]
```

---

## 7. Troubleshooting

| Issue | Check |
|-------|-------|
| Emails not arriving | Verify Cloudflare Email Routing rules are active |
| Emails going to spam | Check SPF/DKIM/DMARC alignment; use mail-tester.com |
| Gmail "Send as" not working | Verify Google App Password "JMS Dev Lab Email" is still valid |
| MailerLite delivery issues | Check domain authentication status in MailerLite dashboard |
| Bounce rate high | Review subscriber list quality in MailerLite |

---

## Cross-References

- [10-technical-architecture.md](10-technical-architecture.md) — Third-party integrations overview
- [12-website-architecture.md](12-website-architecture.md) — MailerLite forms on jmsdevlab.com
- [13-infrastructure-and-hosting.md](13-infrastructure-and-hosting.md) — Cloudflare DNS management
- [../business/01-business-overview.md](../business/01-business-overview.md) — Business contact details
- [../platforms/50-platform-accounts-registry.md](../platforms/50-platform-accounts-registry.md) — MailerLite, Gmail, Cloudflare account details

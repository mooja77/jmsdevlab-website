# 03 -- Financial Operations

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Business Overview](01-business-overview.md) | [Pricing and Revenue](02-pricing-and-revenue.md) | [Government Procurement](../platforms/53-government-procurement.md)

---

## 1. Tax Status

| Field | Value |
|-------|-------|
| Legal structure | Sole Trader |
| Tax reference (PPSN) | 7305338A |
| VAT registered | No |
| VAT threshold (services) | EUR 42,500 |
| Tax year | Calendar year (January--December) |
| Tax return | Form 11 (self-assessed income tax) |
| Revenue Online Service (ROS) | Active |
| Preliminary tax | Due 31 October each year |

### VAT implications

JMS Dev Lab is not VAT registered because annual turnover is below the EUR 42,500 services threshold.

| Implication | Detail |
|-------------|--------|
| Client benefit | Clients do not pay 23% VAT on invoices -- makes JMS Dev Lab 23% cheaper than VAT-registered competitors |
| JMS Dev Lab cost | Cannot reclaim VAT on purchases (hosting, software, equipment) |
| Monitoring | Check revenue quarterly; register for VAT if approaching threshold |
| Registration trigger | Mandatory once annual services turnover exceeds EUR 42,500 |

---

## 2. PSWT -- Professional Services Withholding Tax

### What it is

PSWT is a 20% withholding tax applied by public sector clients (government bodies, state agencies, local authorities) on payments for professional services including software development.

### How it works

| Step | Detail |
|------|--------|
| 1. Invoice submitted | JMS Dev Lab invoices the public sector client for the full amount |
| 2. Payment received | Client pays 80% of the invoice amount |
| 3. PSWT withheld | Client withholds 20% and remits it to Revenue |
| 4. F45 certificate | Client issues an F45 certificate confirming the PSWT withheld |
| 5. Tax credit | JMS Dev Lab claims the PSWT as a tax credit on the Form 11 annual return |
| 6. Recovery | Excess PSWT is refunded by Revenue after the tax return is processed |

### Example: Vegrify milestone payment

| Item | Amount |
|------|--------|
| Milestone invoice | EUR 4,812 |
| PSWT withheld (20%) | EUR 962 |
| Cash received | EUR 3,850 |
| Recovered via Form 11 | EUR 962 (6-12 months later) |

### Cash flow impact

PSWT creates a cash flow gap on government contracts. For the full Vegrify contract:

| Item | Amount |
|------|--------|
| Total contract value | EUR 28,875 |
| Total PSWT withheld (20%) | EUR 5,775 |
| Cash received during project | EUR 23,100 |
| PSWT recovered via tax return | EUR 5,775 |

This means EUR 5,775 is tied up until the annual tax return is processed. Factor this into cash flow planning for any public sector work.

---

## 3. Invoicing

### Trading entity

| Field | Value |
|-------|-------|
| Invoice as | JMS Dev Lab (sole trader) |
| NOT through | Aideil Ltd |

**Important:** JMS Dev Lab previously invoiced through Aideil Ltd (VAT IE9657715M). This arrangement has ended. All invoices are now issued as sole trader JMS Dev Lab.

### Invoice details

| Field | Value |
|-------|-------|
| From | JMS Dev Lab, John Moore |
| Address | 22 Nova Court, Carrigaline, Co. Cork, Ireland |
| Tax reference | 7305338A |
| VAT number | N/A (not registered) |
| Email | john@jmsdevlab.com |
| Payment terms | 30 days (or per milestone agreement) |

### Invoice template contents

Every invoice should include:
- Invoice number (sequential: JMS-2026-001, JMS-2026-002, etc.)
- Date of issue
- Client name and address
- Description of services provided
- Amount (EUR)
- VAT: "Not VAT registered -- below EUR 42,500 threshold"
- Payment terms
- Bank details
- PSWT note (for public sector clients): "Subject to 20% PSWT withholding"

---

## 4. Revenue Status

### Current status (March 2026)

| Metric | Value |
|--------|-------|
| Total revenue to date | EUR 0 |
| Status | Pre-revenue |
| Operating on | Personal savings |
| Monthly fixed costs | Minimal (no office, no employees) |

### Pending revenue sources

| Source | Potential value | Timeline | Probability |
|--------|----------------|----------|-------------|
| Vegrify contract | EUR 28,875 | Decision pending | 35-45% |
| Shopify app approvals | Variable MRR | In review (6 apps) | Medium (approval timing unknown) |
| Bark leads | EUR 500--5K per lead | Ongoing daily leads | Low (quality mixed) |
| Upwork projects | Variable | As applied | Low-Medium |

### Cost structure

| Cost | Amount | Frequency | Notes |
|------|--------|-----------|-------|
| Cloudflare | Free | -- | Pages, DNS, email routing, Workers |
| Railway | Free tier / ~$5-20/mo | Monthly | Backend hosting (SmartCash, StaffHub, SpamShield) |
| Vercel | Free tier | -- | Frontend hosting (StaffHub admin, Vegrify) |
| GitHub | Free (private repos) | -- | Code hosting |
| Firebase | Free tier | -- | Pitch Side backend |
| Supabase | Free tier | -- | GrowthMap auth |
| MailerLite | Free tier | -- | Email marketing |
| Google Workspace | Free (personal Gmail) | -- | Email via Send As |
| Domain renewals | ~EUR 100-150/yr | Annual | Multiple domains |
| Plausible Analytics | ~EUR 9/mo | Monthly | Website analytics |

### Break-even analysis

With minimal fixed costs (estimated EUR 50-100/mo for hosting and tools), break-even requires very little revenue. Even a single custom dev project at EUR 3,000 covers more than a year of operating costs.

---

## 5. Shopify Revenue Share

### How Shopify billing works

| Field | Value |
|-------|-------|
| Billing method | Shopify Billing API (RecurringApplicationCharge) |
| Revenue share | Shopify takes 20% of app revenue |
| Payout | Shopify pays 80% to developer via Shopify Partner payout |
| Payout schedule | Net 30 after billing cycle |
| Currency | USD |

### Revenue example per app

| Scenario | Monthly users | Avg tier | Gross MRR | Shopify cut (20%) | Net MRR |
|----------|--------------|----------|-----------|-------------------|---------|
| Low | 5 | $9.99 | $49.95 | $9.99 | $39.96 |
| Medium | 25 | $19.99 | $499.75 | $99.95 | $399.80 |
| High | 100 | $24.99 | $2,499 | $499.80 | $1,999.20 |

With 7 Shopify apps, even modest adoption (5-10 users each) generates meaningful recurring revenue.

---

## 6. Financial Records

### Record keeping requirements

As a sole trader, John must maintain:
- All invoices issued
- All receipts for business expenses
- Bank statements
- Records of all income and expenditure
- Copies of tax returns (Form 11)
- PSWT certificates (F45) from public sector clients
- Records must be retained for 6 years

### Accounting

| Field | Value |
|-------|-------|
| Accounting method | Cash basis (record income when received, expenses when paid) |
| Accounting software | TBD (manual tracking for now) |
| Tax advisor | TBD |
| Year end | 31 December |

### Key tax dates

| Date | Event |
|------|-------|
| 31 October | Preliminary tax payment due for current year |
| 31 October | Form 11 filing deadline for previous year (paper) |
| Mid-November | Form 11 extended deadline (ROS filing) |

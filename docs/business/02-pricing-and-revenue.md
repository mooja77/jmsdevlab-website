# 02 -- Pricing and Revenue

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Business Overview](01-business-overview.md) | [Financial Operations](03-financial-operations.md) | [App Catalogue](../architecture/11-app-catalogue.md)

---

## 1. App Pricing Matrix

All apps use a 14-day free trial. No free tier is offered -- the business cannot afford free users at this stage.

### Shopify Apps

| App | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Trial | Billing |
|-----|--------|--------|--------|--------|-------|---------|
| SmartCash | Starter $9.99/mo | Professional $24.99/mo | Enterprise $49.99/mo | -- | 14 days | Shopify Billing API |
| ProfitShield | Starter $19/mo | Pro $49/mo | Business $149/mo | -- | 14 days | Shopify Billing API |
| Jewel Value | Basic $9.99/mo | Professional $29.99/mo | Enterprise $59.99/mo | -- | 14 days | Shopify Billing API |
| RepairDesk | Starter $9.99/mo | Professional $19.99/mo | Business $29.99/mo | -- | 14 days | Shopify Billing API |
| StaffHub | Basic $4.99/mo | Pro $9.99/mo | Enterprise $29.99/mo | -- | 14 days | Shopify Billing API |
| GrowthMap | Starter $9.99/mo | Professional $19.99/mo | Enterprise $29.99/mo | -- | 14 days | Shopify Billing API |
| JewelryStudioManager | Starter $9.99/mo | Professional $19.99/mo | Enterprise $29.99/mo | -- | 14 days | Shopify Billing API |
| TaxMatch | Standard $9.99/mo | Pro $19.99/mo | Premium $24.99/mo | -- | 14 days | Shopify Billing API |
| SpamShield | Starter $9/mo | Pro $29/mo | Enterprise $99/mo | -- | 14 days | Shopify Billing API (NOT enforced -- critical gap) |
| ThemeSweep | TBD | TBD | TBD | -- | 14 days | Shopify Billing API |

### Standalone Apps

| App | Tier 1 | Tier 2 | Tier 3 | Trial | Billing |
|-----|--------|--------|--------|-------|---------|
| QualCanvas | Free (1 canvas, 2 transcripts, 5 codes) | Pro $12/mo | Team $29/mo (40% .edu discount) | -- | Stripe |
| Pitch Side | Free (completely free) | -- | -- | -- | N/A |

### Notes

- **ProfitShield** has a "Free 100 orders/mo" tier listed but this should be converted to a trial (no free tier policy)
- **SpamShield** billing is displayed but NOT enforced -- this is a critical gap that must be fixed before Shopify approval
- **QualCanvas** is the exception to the no-free-tier rule -- it has a limited free tier as a research tool with academic audience
- **Pitch Side** is intentionally free -- it is a community coaching tool, not a revenue product
- All prices are in USD for Shopify apps (Shopify standard)
- Shopify takes a 20% revenue share on app billing

---

## 2. Custom Development Pricing

Published on jmsdevlab.com/pricing.html.

### Pricing tiers

| Tier | Name | Price | Timeline | Typical project |
|------|------|-------|----------|-----------------|
| Starter | Spreadsheet Replacement | From EUR 3,000 | 3-4 weeks | Replace a spreadsheet or basic internal tool with a proper web app |
| Growth | Business Tool / Portal | From EUR 6,000 | 4-8 weeks | Customer portal, booking system, inventory management, CRM |
| Scale | Custom Software | From EUR 12,000 | 8-12 weeks | Full SaaS product, multi-user platform, complex business logic |

### Support retainer

| Item | Price |
|------|-------|
| Monthly support and maintenance | From EUR 300/mo |
| Includes | Bug fixes, minor feature updates, hosting monitoring, security patches |

### Hourly and daily rates

| Rate type | Amount | Context |
|-----------|--------|---------|
| Hourly | EUR 70/hr | Used on Freelancermap profile, reference rate |
| Daily | EUR 500/day | Used on Freelancermap profile |
| Vegrify rate | EUR 525/day | Quoted for 7.5-hour days on Vegrify RFQ |

---

## 3. Pricing Principles

| Principle | Detail |
|-----------|--------|
| Fixed pricing | Clients know the total cost before committing -- no hourly billing surprises |
| No free tier | 14-day free trial only (except Pitch Side which is free, and QualCanvas limited free) |
| Scope-match guarantee | If the delivered product does not match the agreed scope, the client does not pay the final instalment |
| No VAT | Below EUR 42,500 threshold -- saves clients 23% vs VAT-registered competitors |
| LEO voucher compatible | Grow Digital Voucher (50% up to EUR 5K) can reduce client's effective cost |
| No paid upgrades | No spending on premium tools or services until JMS Dev Lab has revenue |

---

## 4. LEO Grow Digital Voucher

| Field | Value |
|-------|-------|
| Programme | Grow Digital Voucher |
| Provider | Local Enterprise Office (LEO) |
| Funding | 50% of project cost, up to EUR 5,000 |
| Eligibility | Irish small businesses with fewer than 10 employees |
| Application | Client applies to their local LEO before the project starts |
| Payment flow | JMS Dev Lab invoices client for full amount; LEO reimburses client 50% |

### How to use in sales

When quoting custom development:

| Tier | Full price | Client cost with voucher |
|------|-----------|-------------------------|
| Starter | EUR 3,000 | EUR 1,500 (voucher covers EUR 1,500) |
| Growth | EUR 6,000 | EUR 3,500 (voucher covers EUR 2,500 -- capped) or EUR 1,000 (if EUR 5K voucher) |
| Scale | EUR 12,000 | EUR 7,000 (voucher covers EUR 5,000 -- capped) |

The voucher is a powerful sales tool. Mentioning it on the pricing page and in proposals reduces the perceived cost barrier significantly.

---

## 5. Scope-Match Guarantee

### How it works

1. **Scope agreement:** Before development begins, a written scope document defines exactly what will be built
2. **Milestone payments:** Payment is split across milestones (typically 3-6 depending on project size)
3. **Final instalment:** The last payment is withheld until the client confirms the delivered product matches the agreed scope
4. **Guarantee:** If the product does not match the scope, the client does not pay the final instalment

### Purpose

- Reduces buyer risk for first-time clients
- Builds trust with clients who have been burned by agencies that over-promise and under-deliver
- Forces disciplined scope management on JMS Dev Lab's side
- Differentiator: most agencies and freelancers require full payment regardless of outcome

### Limitations

- Covers scope match only -- not subjective quality preferences
- Does not cover scope changes requested by the client after agreement
- Final instalment is typically 15-20% of total project value

---

## 6. Revenue Targets

### Current status

| Metric | Value |
|--------|-------|
| Revenue to date | EUR 0 (pre-revenue) |
| First potential revenue | Vegrify contract (EUR 28,875) or Shopify app approval (recurring MRR) |
| Monthly burn rate | Low (no office, no employees, no paid tools) |

### Revenue scenarios

| Scenario | Annual revenue | Source |
|----------|---------------|--------|
| Shopify apps only (10 paying users per app avg) | ~$6,000--12,000/yr | App subscriptions |
| Custom dev only (4 projects/yr) | EUR 12,000--48,000/yr | Project-based |
| Combined (apps + custom dev) | EUR 20,000--60,000/yr | Mixed |
| Vegrify win + apps | EUR 40,000--70,000/yr | Contract + subscriptions |

### VAT threshold watch

If annual revenue from services exceeds EUR 42,500, VAT registration becomes mandatory. Monitor quarterly. At that point, pricing would need to increase by 23% (or absorb the cost).

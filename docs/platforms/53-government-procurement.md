# 53 -- Government Procurement

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Client Acquisition Playbook](../marketing/63-client-acquisition-playbook.md) | [Financial Operations](../business/03-financial-operations.md)

---

## 1. Platform Registrations

| Platform | Account | Status | Purpose |
|----------|---------|--------|---------|
| eTenders.gov.ie | jmsdevlab | Active, alerts configured | Irish government tender notifications |
| public-procurement.ie | Registered | Active | RFQ discovery and submission |

---

## 2. eTenders.gov.ie

### Account details

| Field | Value |
|-------|-------|
| Username | jmsdevlab |
| Registration | Complete |
| Alerts | Active for software development, web development, IT services |
| Monitoring frequency | Daily |

### How eTenders works

1. Government bodies publish tenders and RFQs on etenders.gov.ie
2. Suppliers register and set up email alerts for relevant CPV codes
3. When a matching tender is published, an email alert is sent
4. Supplier downloads tender documents, prepares response, submits before deadline
5. Evaluation criteria vary by tender (price, quality, experience, or combination)

### Target contract size

| Size | Suitability | Notes |
|------|-------------|-------|
| Under EUR 5K | Good | Quick turnaround, low competition |
| EUR 5K--25K | Ideal | Right size for solo developer, manageable scope |
| EUR 25K--50K | Possible | Larger scope, may need subcontracting |
| Over EUR 50K | Unlikely | Too large for solo operation, insurance requirements |

### CPV codes of interest

| Code | Description |
|------|-------------|
| 72000000 | IT services: consulting, software development, Internet and support |
| 72200000 | Software programming and consultancy services |
| 72210000 | Programming services of packaged software products |
| 72212000 | Programming services of application software |
| 72300000 | Data services |
| 48000000 | Software package and information systems |

---

## 3. Vegrify Case Study

The Vegrify RFQ is JMS Dev Lab's first government procurement opportunity and serves as a template for future submissions.

### Timeline

| Date | Event |
|------|-------|
| 2026-03-14 | RFQ received from Kate Meaun via public-procurement.ie |
| 2026-03-18 | Response submitted from john@jmsdevlab.com |
| 2026-03-20 12:00 | Submission deadline (met) |
| 2026-03-20 15:45 | Video call with Kate Meaun (Google Meet) |
| TBD | Decision pending |

### Project details

| Field | Value |
|-------|-------|
| Client | Vegrify (Asiera) |
| Project | Lead Product Engineer -- Vegrify MVP |
| Description | Food-tech mobile app: scan ingredient labels via OCR, classify vegan/not-vegan with explainable AI |
| Funding | LEO Feasibility Grant (50% co-funding up to EUR 15,000) |
| Tech stack | Expo SDK 55, React Native, TypeScript, ML Kit OCR, WatermelonDB |

### Pricing breakdown

| Item | Value |
|------|-------|
| Total price | EUR 28,875 |
| Day rate | EUR 525/day |
| Duration | 55 days |
| Work packages | 6 |
| Milestone payments | 6 x ~EUR 4,812 |
| VAT | Not applicable (below threshold) |
| PSWT | 20% withheld per payment |

### Evaluation criteria

The RFQ uses a two-stage evaluation:
1. **Form completeness** -- pass/fail
2. **Experience** -- pass/fail (minimum threshold)
3. **Price** -- lowest price wins (among those who pass stages 1 and 2)

### Competitive advantage

- Working prototype delivered: web demo (https://vegrify-mvp.vercel.app) + Android APK
- No VAT saves client 23% vs VAT-registered competitors
- 6,413 ingredients in database, 4-tier classification pipeline
- Offline-first architecture, sub-10ms response time
- Explainable output (not just yes/no, but why)

### Win probability

Estimated 35-45%. Prototype is the strongest differentiator. Price competitiveness depends on number of bidders.

### Documents submitted

| Document | Format | Detail |
|----------|--------|--------|
| RFQ response | PDF | vegrify/RFQ-RESPONSE-VEGRIFY.md (.pdf) |
| CV | PDF | vegrify/CV-JOHN-MOORE.md (.pdf) |
| HTML templates | HTML | vegrify/cv.html, vegrify/rfq.html |
| Cover email | Email | Sent from john@jmsdevlab.com |

### Key contact

| Field | Value |
|-------|-------|
| Name | Kate Meaun |
| Role | Procurement & Contracts Manager, Asiera/Vegrify |
| Email | kate.meaun@public-procurement.ie |
| Phone | +353 89 985 6572 |
| LinkedIn | linkedin.com/in/katemeaunprocurement |

---

## 4. LEO Supports

### Grow Digital Voucher

| Field | Value |
|-------|-------|
| Provider | Local Enterprise Office (LEO) |
| Amount | 50% funding up to EUR 5,000 |
| Purpose | Digital transformation projects for SMEs |
| Eligibility | Irish small businesses with fewer than 10 employees |
| Relevance to JMS Dev Lab | Can be offered to prospective clients to reduce their effective cost |

**How to use in sales:**
- When quoting a Starter tier project (EUR 3,000), highlight that the client may qualify for the Grow Digital Voucher
- Effective client cost with voucher: EUR 1,500 (for a EUR 3,000 project)
- JMS Dev Lab receives full payment; the voucher reimburses the client
- Client must apply to their local LEO before the project starts

### Feasibility Grant

| Field | Value |
|-------|-------|
| Provider | Local Enterprise Office (LEO) |
| Amount | 50% co-funding up to EUR 15,000 |
| Purpose | Feasibility studies for new product/service development |
| Relevance | Vegrify is funded via this grant |

### Free mentoring

| Field | Value |
|-------|-------|
| Provider | Local Enterprise Office (LEO) |
| Cost | Free |
| Purpose | One-to-one business mentoring |
| Status | Planned for post-May 2026 |

---

## 5. An Post QS 0037

### Assessment

| Field | Value |
|-------|-------|
| Tender | An Post QS 0037 |
| Type | Framework agreement |
| Status | Reviewed -- NOT suitable |

### Why not suitable

| Requirement | JMS Dev Lab capability |
|-------------|----------------------|
| Insurance: EUR 13M cover required | Far beyond solo developer scale |
| Scale: Enterprise-level framework | Designed for large IT consultancies |
| Team: Multi-person delivery expected | Solo developer |
| Revenue: Significant turnover implied | Pre-revenue |

**Conclusion:** This tender is designed for established IT companies with 50+ employees. Not a target for JMS Dev Lab now or in the foreseeable future.

---

## 6. PSWT -- Professional Services Withholding Tax

### How it works

| Field | Value |
|-------|-------|
| Rate | 20% |
| Applied by | Public sector clients (government bodies, local authorities, state agencies) |
| Withheld from | Each payment for professional services |
| Recovery | Via annual tax return (Form 11) |
| Impact | Cash flow reduction on public sector projects |

### Example: Vegrify contract

| Item | Amount |
|------|--------|
| Milestone payment | EUR 4,812 |
| PSWT withheld (20%) | EUR 962 |
| Net received | EUR 3,850 |
| Recovery | EUR 962 claimed back on Form 11 |

### Cash flow planning

For any government contract, factor in that only 80% of each payment is received at the time of invoicing. The remaining 20% is recovered through the annual tax return, which may take 6-12 months.

---

## 7. Future Government Opportunities

### Strategy

| Action | Detail |
|--------|--------|
| Monitor eTenders daily | Check alerts for software development RFQs |
| Focus on EUR 5K--25K contracts | Right size for solo developer |
| Prototype-first approach | Build quick prototypes/demos to differentiate from paper-only responses |
| Highlight no-VAT advantage | 23% saving vs VAT-registered competitors |
| Reference Vegrify experience | Once complete, use as case study for government capability |
| Apply to LEO panels | Register on LEO supplier panels when available |

### Types of government work to target

| Type | Example | Fit |
|------|---------|-----|
| MVP development | Mobile apps, web portals for state-funded projects | Strong |
| Data dashboards | Internal reporting tools for government departments | Strong |
| Small web applications | Booking systems, form processing, citizen portals | Strong |
| IT consulting | Technology assessments, feasibility studies | Moderate |
| Large frameworks | Multi-year, multi-vendor agreements | Not suitable |

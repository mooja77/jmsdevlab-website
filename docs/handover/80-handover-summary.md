# 80 -- Handover Summary

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Purpose:** Bus factor document -- everything someone needs to know if John is unavailable

---

## 1. What is JMS Dev Lab?

JMS Dev Lab is a sole trader software development practice operated by John Moore from Cork, Ireland. It has two revenue streams:

1. **SaaS applications** -- 9 production web/mobile apps (7 Shopify embedded, 2 standalone) sold as monthly subscriptions
2. **Custom development** -- bespoke software built for businesses, priced at fixed rates (EUR 3K / 6K / 12K)

As of March 2026, the business is **pre-revenue**. Six Shopify apps are submitted for review. One government contract (Vegrify, EUR 28,875) is pending decision.

John is the sole employee. There are no other team members, contractors, or stakeholders.

---

## 2. Critical Systems

If John is unavailable, these are the systems that need monitoring or may need attention.

| System | What it does | Where it runs | Urgency if down |
|--------|-------------|---------------|-----------------|
| jmsdevlab.com | Marketing website | Cloudflare Pages | Low -- static site, rarely goes down |
| SmartCash backend | Cash flow app API | Railway | Medium -- affects active users (if any) |
| StaffHub backend | Team management API | Railway | Medium -- affects active users (if any) |
| SpamShield backend | Spam filtering API | Railway | Medium -- affects active users (if any) |
| StaffHub admin | Admin frontend | Vercel | Low -- auto-deployed |
| Vegrify MVP | Prototype demo | Vercel + Cloudflare Workers | Low -- demo only |
| Pitch Side | Coaching app | Firebase Hosting | Low -- free app, no revenue |
| Email | Business email routing | Cloudflare Email Routing to Gmail | Medium -- missed emails = missed leads |
| MailerLite | Email drip sequences | MailerLite (SaaS) | Low -- runs automatically |

### Auto-recovery

All backends on Railway and Vercel auto-deploy from GitHub on push to main. If a service goes down:
- Railway: Auto-restarts containers; check railway.app dashboard
- Vercel: Static deploys; rarely fail
- Cloudflare Pages: Static site; rarely fails
- Firebase: Managed service; auto-heals

**In most cases, doing nothing is fine.** These services auto-run and auto-recover.

---

## 3. Access Required

Anyone taking over would need access to these accounts. All are under mooja77@gmail.com unless noted.

| Service | Account | Purpose | Access method |
|---------|---------|---------|---------------|
| GitHub | mooja77 | All source code (private repos) | GitHub login |
| Railway | mooja77@gmail.com | Backend hosting | Railway dashboard |
| Vercel | mooja77@gmail.com | Frontend hosting | Vercel dashboard |
| Cloudflare | mooja77@gmail.com | DNS, Pages, Workers, email routing | Cloudflare dashboard |
| Google (Gmail) | mooja77@gmail.com | Email, Search Console, Analytics, Business Profile | Google login |
| Shopify Partners | Partner ID 4100630 | App listings, reviews, billing | Shopify Partners dashboard |
| Firebase | mooja77@gmail.com | Pitch Side backend | Firebase console |
| Supabase | mooja77@gmail.com | GrowthMap auth | Supabase dashboard |
| MailerLite | hello@jmsdevlab.com | Email marketing | MailerLite dashboard |
| Stripe | mooja77@gmail.com | Payment processing (QualCanvas) | Stripe dashboard |

See [Credentials and Access](81-credentials-and-access.md) for detailed access information.

---

## 4. Revenue Status

| Item | Status | Value | Detail |
|------|--------|-------|--------|
| Current revenue | EUR 0 | Pre-revenue | Operating on personal savings |
| Vegrify contract | Pending decision | EUR 28,875 | RFQ submitted, call completed, awaiting decision |
| Shopify apps | In review | Variable MRR | 6 apps submitted, awaiting Shopify approval |
| Bark leads | Active | EUR 500-5K each | Daily leads, mixed quality |

---

## 5. If John is Unavailable

### Immediate (first 48 hours)

| Action | Detail |
|--------|--------|
| Do nothing to backends | They auto-run on Railway/Vercel/Cloudflare |
| Monitor email | Check mooja77@gmail.com for urgent messages |
| Check Shopify Partner dashboard | If a Shopify app review response is needed, there is a 14-day deadline to respond |

### Short-term (1-2 weeks)

| Action | Detail |
|--------|--------|
| Respond to Bark leads | Log into Bark and respond to any qualified leads (EUR 3K+) |
| Check Railway dashboard | Ensure backends are running (green status) |
| Monitor eTenders alerts | Check email for government tender notifications |

### Long-term (1+ month)

| Action | Detail |
|--------|--------|
| Shopify reviews | If Shopify requests changes to an app, someone technical would need to implement them |
| Customer support | If apps have users, support emails will come to hello@jmsdevlab.com |
| Invoice processing | If Vegrify contract is won, milestone invoices need to be issued |
| Domain renewals | Check Cloudflare for upcoming domain renewal dates |

### Critical deadline

**Shopify App Review:** If Shopify sends review feedback requesting changes, there is a **14-day deadline** to respond. Missing this deadline may result in the app submission being rejected and needing to restart the review process.

---

## 6. Key Documents

| Document | Location | Content |
|----------|----------|---------|
| Full documentation set | C:\JM Programs\JMS Dev Lab\docs\ | 50+ documents covering business, architecture, apps, operations, platforms, marketing |
| App Build Playbook | C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md | Standard process for building new apps |
| SEO Fixes | C:\JM Programs\JMS Dev Lab Website\SEO-FIXES-PER-APP.md | SEO audit and fixes per app |
| Vegrify RFQ | C:\JM Programs\JMS Dev Lab\vegrify\ | Complete RFQ submission, CV, prototype details |
| Memory files | C:\Users\Moores Home PC\.claude\projects\... | AI assistant context and project memory |

---

## 7. Business Context

John Moore is transitioning from running **Moores Jewellers** (multi-site jewelry retail in Cork) to full-time software development. Moores Jewellers is expected to close around May 2026.

Until Moores closes:
- LinkedIn is not updated (to avoid confusion)
- Proactive marketing outreach is paused
- John's attention is split between both businesses
- Inbound opportunities (RFQs, Bark leads) are still being pursued

After Moores closes:
- Full attention shifts to JMS Dev Lab
- LinkedIn will be updated
- Proactive outreach begins (LEO mentoring, cold emails, directory completion)
- Community and charity work for portfolio building

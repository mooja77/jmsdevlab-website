# POST 3: Dev.to Article
**Date:** Wednesday 9 April 2026
**App:** SpamShield
**Platform:** Dev.to (cross-post to Medium if desired)

---

```
---
title: How I Built a Spam Filter That Uses 4 Layers of Detection Instead of Just a CAPTCHA
published: true
tags: webdev, security, typescript, saas
cover_image: 
---
```

Most contact form spam filters use simple keyword matching or CAPTCHAs. Keywords miss sophisticated spam. CAPTCHAs annoy real customers.

I wanted something smarter. So I built SpamShield with a multi-layered detection engine that handles everything from obvious bot spam to subtle, human-like submissions.

## The Problem

If you run any website with a contact form, you know the drill. You wake up to 47 "submissions" — 45 of them are SEO link farms, crypto pitches, or bots testing if your form actually sends email.

For Shopify stores, it's worse. Bots test stolen credit cards against checkout. Fake accounts get created for credential stuffing. Contact forms get hammered by automated scripts.

CAPTCHAs solve part of this, but they also block real customers. Google's own research shows reCAPTCHA causes 10-15% form abandonment. That's real revenue walking away.

## The Architecture

The solution needed to be:
- **Fast** — real submissions should feel instant
- **Invisible** — no friction for legitimate users
- **Transparent** — merchants want to see what's being caught and why
- **Layered** — cheap filters first, expensive ones last

### Layer 1: Content Analysis

Pattern matching against known spam indicators. This is the fastest, cheapest layer.

- URLs in unexpected fields (name field containing a link = spam)
- Excessive capitalisation or special characters
- Known spam phrases and patterns
- Email domain reputation checks

This catches 60-70% of spam with near-zero latency. It runs in under 5ms.

### Layer 2: Geo-Detection

IP-based geographic analysis. This isn't about blocking countries — it's about building a risk score.

If a Shopify store only ships to Ireland and gets a contact form submission from an IP that's never been associated with Irish traffic, that's a signal. Not a block — a signal that feeds into the overall score.

```typescript
const geoScore = calculateGeoRisk({
  submitterCountry: geoLookup(ip),
  storeCountries: store.shippingZones,
  historicalTraffic: store.trafficPatterns,
});
// Returns 0-25 risk points
```

### Layer 3: Behavioural Patterns

This is where it gets interesting. Bots have behaviours that humans don't:

- **Speed**: Bots fill forms faster than humanly possible. A form filled in under 2 seconds? Suspicious.
- **Repetition**: Same IP submitting 5 forms in 10 minutes? Suspicious.
- **Patterns**: Identical submission structure across different forms? Bot network.
- **Honeypots**: Hidden fields that bots fill but humans never see. Any value in the honeypot = instant quarantine.

```typescript
const behaviourScore = calculateBehaviourRisk({
  timeToFill: submission.endTime - submission.startTime,
  recentSubmissions: await getRecentFromIP(ip, '10m'),
  honeypotValue: submission.fields['_hp_field'],
  formFieldOrder: submission.fieldInteractionOrder,
});
```

### Layer 4: AI Classification (Optional)

For submissions that pass layers 1-3 but still look suspicious, an optional AI layer classifies the content using Anthropic's Claude API.

This is deliberately the last layer because:
1. It's the slowest (~500ms vs <5ms for content analysis)
2. It's the most expensive (API calls cost money)
3. It's the most powerful — it catches the sophisticated spam that pattern matching misses

The merchant can bring their own API key or use a built-in allocation.

```typescript
if (totalRiskScore > THRESHOLD && totalRiskScore < AUTO_BLOCK) {
  const aiVerdict = await classifyWithAI(submission);
  // AI returns: 'legitimate', 'spam', or 'uncertain'
}
```

## The Quarantine System

This is the part merchants actually care about most.

Instead of silently blocking submissions (which means you might miss a real customer), suspicious submissions go to a quarantine queue. The merchant reviews them, clicks "release" or "block", and the system learns from the decision.

The real-time dashboard shows:
- Total submissions vs spam caught (with percentages)
- Geographic breakdown of submissions
- Spam trends over time
- Individual submission audit trail with risk scores per layer

**Why quarantine matters more than detection rate:** A 99% detection rate sounds great until you realise the 1% false positive was a €5,000 custom order inquiry that got silently blocked. The quarantine approach means nothing is ever truly lost.

## The Tech Stack

- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL for submissions and audit trail
- **Cache**: Redis for rate limiting and pattern detection
- **Frontend**: React 18 with Vite and Tailwind CSS
- **Shopify integration**: Remix + App Bridge (embedded app)
- **Standalone integration**: One-line JavaScript embed

For standalone websites (non-Shopify), integration is deliberately simple — swap your form's `action` URL to point at SpamShield's endpoint. The embed handles submission, runs it through all four layers, and either delivers it to your inbox or quarantines it for review.

## What I Learned Building This

**1. False positives are worse than false negatives.**

Blocking a real customer inquiry is infinitely worse than letting a spam message through. Every design decision in SpamShield prioritises avoiding false positives. The quarantine system exists specifically because of this principle.

**2. AI is the wrong first layer.**

It's tempting to throw everything at Claude and let it decide. But AI calls are slow and expensive. Using it as a backstop after cheap, fast filters have already caught the obvious stuff means:
- 95% of spam never hits the AI layer
- Real submissions get through in <10ms
- The AI budget lasts 10x longer

**3. Merchants want visibility, not just automation.**

The first version of SpamShield had no dashboard. It just... filtered. Merchants hated it. They wanted to SEE what was being blocked and WHY. The audit log and real-time dashboard matter more than the detection rate.

**4. Every website has different spam patterns.**

A jewellery store gets different spam than a SaaS landing page. The layered approach with configurable thresholds means each merchant can tune the sensitivity without touching code.

## Try It

SpamShield is live and works on Shopify stores and any website with a contact form.

- Shopify: Install from the Shopify App Store
- Any website: One-line JavaScript embed

Built by [JMS Dev Lab](https://jmsdevlab.com) — I'm a solo developer in Cork, Ireland building niche tools for problems I've experienced firsthand running retail businesses for 22 years.

Questions? Happy to dive deeper into any of the layers in the comments.

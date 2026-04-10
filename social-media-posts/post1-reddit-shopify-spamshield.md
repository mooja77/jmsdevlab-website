# POST 1: Reddit r/shopify
**Date:** Tuesday 8 April 2026
**App:** SpamShield
**Subreddit:** r/shopify

---

## Title

PSA: If you're getting spam orders or fake signups, here's what's actually happening and how to stop it

## Body

I see posts about spam orders, fake accounts, and bot signups in here constantly, so I wanted to break down what's actually going on and what your options are.

**Why it's happening:**

Shopify stores are targets because they have public-facing forms (contact, account creation, checkout) that bots can hit. Most spam comes from:

- Bots testing stolen credit cards against your checkout
- Form-fill bots harvesting your contact form for phishing
- Fake account creation for credential stuffing
- Competitors or trolls submitting garbage orders

**What Shopify gives you natively (free):**

- Bot protection on checkout (enabled by default, but not foolproof)
- Customer account approval (Settings > Customer accounts > require approval)
- Fraud analysis on orders (the coloured indicators in Orders)

**What it doesn't give you:**

- Contact form spam filtering (Shopify's contact form has no CAPTCHA by default)
- Pattern detection across submissions (repeat offenders, geo-blocking)
- A quarantine/review queue for suspicious submissions
- Real-time dashboards showing what's being blocked

**What I've seen work:**

1. Enable customer account approval immediately — it's free and stops fake signups
2. Add a honeypot field to your contact form (hidden field that bots fill but humans don't)
3. For serious spam: use a multi-layered filter that checks content, geo, patterns, and optionally AI classification

Full disclosure: I built an app for #3 called SpamShield. It works on Shopify stores and standalone websites. But even if you just do #1 and #2, you'll block 70%+ of the garbage.

What spam problems are you dealing with? Happy to help troubleshoot.

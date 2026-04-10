# POST 4: X/Twitter Thread
**Date:** Wednesday 9 April 2026
**App:** SpamShield
**Platform:** X/Twitter
**Post after:** Dev.to article is published (Post 3)

---

## Tweet 1

I built a spam filter that uses 4 layers of detection instead of just a CAPTCHA.

Layer 1: Content analysis
Layer 2: Geo-detection
Layer 3: Behavioural patterns
Layer 4: AI classification (optional, via Anthropic)

Why? Because CAPTCHAs annoy customers and keyword filters miss everything.

Thread on the architecture:

## Tweet 2

The key insight: AI should be the LAST layer, not the first.

It's slow and expensive. Use fast, cheap filters first (patterns, geo, content). Only invoke the AI for submissions that pass everything else but still look suspicious.

Result: 95%+ detection with near-zero latency for real customers.

## Tweet 3

The other thing merchants told me: they don't want silent blocking.

They want to SEE what's being caught. A quarantine queue with release/block lets them verify nothing real was missed.

Visibility > automation.

## Tweet 4

Full technical breakdown on Dev.to:
[PASTE DEV.TO LINK HERE]

SpamShield works on Shopify stores and any website (one-line JS embed).

Built as a solo dev in Ireland. More at jmsdevlab.com

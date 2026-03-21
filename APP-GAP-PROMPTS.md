# App Gap Prompts

Paste these into the Claude Code instance for each app to fix the missing items.

---

## SmartCash (15/16) — `C:\JM Programs\CashFlowAppV2`

### 1. Geographic requirements
```
Check if this app has any region-specific features (currency, tax rules, language, address formats). If it does, update the Shopify app listing to state the geographic requirements under section 4.3.8. If the app is truly global, no action needed — just confirm.
```

---

## ProfitShield (14/16) — `C:\JM Programs\ProfitShield`

### 1. Promo video script
```
Create a 60-second promo video script for ProfitShield — text only, no camera needed. Highlight the core value prop (profit protection, order validation, checkout blocking for unprofitable orders), show the key features, and end with a call to action. Keep it punchy and merchant-focused.
```

### 2. Clarify pricing model
```
Review the current pricing tiers. There's a free tier at 100 orders/month alongside paid tiers (Starter $19, Pro $49, Business $149). We don't want a permanent free tier — we can't afford to run apps for free. Change the free tier to a 14-day trial, then require a paid plan. Update the pricing page, billing enforcement middleware, and any marketing copy.
```

---

## Jewel Value (13/16) — `C:\JM Programs\Valuation App\jewel-value`

### 1. Mascot
```
Provide a NanoBanana prompt to create a mascot for this app who will be used in promo videos for this app, Pixar style — square image. The mascot should relate to jewelry valuation — maybe a friendly gemstone character or a jeweller's loupe with personality.
```

### 2. Test plan document
```
Create a formal test plan document covering every feature end-to-end. Structure it by feature area (auth, onboarding, valuations, certificates, team management, billing, settings). For each feature, list the test steps, expected results, and which subscription tier it applies to. Save it as TEST-PLAN.md in the project root.
```

### 3. Geographic requirements
```
This app has Eircode fields and Irish county address formats. Shopify flagged our StaffHub app for exactly this issue (requirement 4.3.8). Check all forms for region-specific fields. Either make them optional/configurable for international use, or add geographic requirements to the Shopify listing stating the app works best in Ireland/UK. Do this proactively before the reviewer flags it.
```

---

## ThemeSweep (12/16) — `C:\JM Programs\themesweep`

### 1. JMS Dev Lab footer
```
Add a "Created by JMS Dev Lab" footer with a link to https://www.jmsdevlab.com/ on all pages — both the web app and the marketing website. Match the style used in the SmartCash app: "Made by JMS Dev Lab" with a subtle link.
```

### 2. Promo video script
```
Create a 60-second promo video script for ThemeSweep — text only. Feature the Sweepy mascot (see CHARACTER-GUIDE.md for personality and poses). Highlight the core value prop (clean up unused themes, identify bloat, optimise store performance), show key features, and end with a call to action.
```

### 3. Screencast
```
We need a screencast video for the Shopify submission. Make sure the guided tour has a demo mode that auto-advances through all steps. Then I will run the tour on screen and use screen capture software to record it. Set up the demo tour mode if it doesn't exist, seed the app with plausible demo data, and walk me through how to record it.
```

---

## RepairDesk (11/16) — `C:\JM Programs\Repair Desk`

### 1. GDPR webhooks (CRITICAL)
```
Implement the 3 mandatory Shopify GDPR compliance webhooks. This is blocking — Shopify requires these for all apps:

1. customers/data_request — receive a request, compile all data for that customer, and return it
2. customers/redact — delete all personal data for that customer
3. shop/redact — delete ALL data for that shop (triggered on app uninstall)

Register them in shopify.app.toml and create the route handlers. Include proper logging and response codes. Test each one.
```

### 2. Screencast
```
We need a screencast video for the Shopify submission. Make sure the guided tour has a demo mode that auto-advances through all steps. Then I will run the tour on screen and use screen capture software to record it. Set up the demo tour mode if it doesn't exist, seed the app with plausible demo data, and walk me through how to record it.
```

### 3. Geographic requirements
```
Check if this app has any region-specific features (currency, address formats, tax rules). If it does, update the Shopify app listing to state the geographic requirements. If truly global, confirm.
```

---

## SpamShield (11/16) — `C:\JM Programs\SpamShield`

### 1. Billing enforcement (CRITICAL)
```
The landing page shows 3 paid tiers (Starter $9, Pro $29, Enterprise $99) but there's no billing enforcement in the backend. Implement full subscription billing:

1. Shopify Billing API integration for Shopify users (GraphQL recurring charge)
2. Stripe integration for web SaaS users
3. Plan enforcement middleware that checks subscription status on every protected API route
4. Graceful handling of expired/cancelled subscriptions (show upgrade prompt, don't break the app)
5. 14-day trial, then paid only — no permanent free tier

Test the full billing flow on our Shopify dev store.
```

### 2. Mascot
```
Provide a NanoBanana prompt to create a mascot for this app who will be used in promo videos for this app, Pixar style — square image. The mascot should relate to spam protection — maybe a friendly shield character or a guard dog with personality.
```

### 3. Promo video script
```
Create a 60-second promo video script for SpamShield — text only. Highlight the core value prop (protect your store from spam content, automated filtering, real-time detection), show key features, and end with a call to action.
```

### 4. Screencast
```
We need a screencast video for the Shopify submission. Make sure the guided tour has a demo mode that auto-advances through all steps. Then I will run the tour on screen and use screen capture software to record it. Set up the demo tour mode if it doesn't exist, seed the app with plausible demo data, and walk me through how to record it.
```

---

## GrowthMap (10/16) — `C:\JM Programs\marketingapp`

### 1. Google OAuth
```
Add a Google login option. We have a Google Cloud account with multiple apps already configured. Open a browser and I will log you in. Add Google OAuth as an additional sign-in method alongside the existing Supabase magic links. Users should be able to sign in with either method and access the same account.
```

### 2. Mascot
```
Provide a NanoBanana prompt to create a mascot for this app who will be used in promo videos for this app, Pixar style — square image. The mascot should relate to marketing and growth — maybe a friendly compass character, a growing plant with personality, or a treasure map guide.
```

### 3. Promo video script
```
Create a 60-second promo video script for GrowthMap — text only. Position it as "Like Duolingo, but for marketing." Highlight the core value prop (daily marketing quests, step-by-step plan execution, learning system, progress tracking), show key features, and end with a call to action.
```

### 4. Screencast
```
We need a screencast video for the Shopify submission. Make sure the guided tour has a demo mode that auto-advances through all steps. Then I will run the tour on screen and use screen capture software to record it. Set up the demo tour mode if it doesn't exist, seed the app with plausible demo data, and walk me through how to record it.
```

### 5. Separate marketing website
```
Create a world-class marketing website for this app. Currently the landing page is embedded in the app itself. Create a separate marketing site — users should be able to sign in to the web-based version from the website. Put a footer that this app is created by JMS Dev Lab. Make it responsive and SEO-friendly.
```

---

## TaxMatch (10/16) — `C:\JM Programs\TaxMatch`

### 1. Guided tour (PRIORITY)
```
Create a tutorial and a guided tour inside the app. Use react-joyride or similar. The tour should cover all main features: dashboard, tax reconciliation, order matching, reports, settings. It should auto-start on first visit and be restartable from a help menu. Include a demo mode that auto-advances for screencast recording.
```

### 2. Tutorial system
```
Build an interactive tutorial system inside the app. Beyond the guided tour, add contextual help tooltips and a step-by-step walkthrough for each major feature. New users should understand how to use the app without reading any documentation.
```

### 3. Mascot
```
Provide a NanoBanana prompt to create a mascot for this app who will be used in promo videos for this app, Pixar style — square image. The mascot should relate to tax/finance — maybe a friendly calculator character, a receipt with personality, or a match-making character (since the app matches orders to payouts).
```

### 4. Promo video script
```
Create a 60-second promo video script for TaxMatch — text only. Highlight the core value prop (automatically reconcile Shopify orders with tax filings, catch discrepancies, simplify IRS compliance), show key features, and end with a call to action. Target audience is US Shopify merchants.
```

### 5. Screencast
```
We need a screencast video for the Shopify submission. Make sure the guided tour has a demo mode that auto-advances through all steps. Then I will run the tour on screen and use screen capture software to record it. Set up the demo tour mode if it doesn't exist, seed the app with plausible demo data, and walk me through how to record it.
```

### 6. Geographic requirements (IMPORTANT)
```
This app is US/IRS-specific — it deals with US tax reconciliation. Update the Shopify app listing to state the geographic requirement: this app is designed for merchants in the United States who need to reconcile Shopify orders with IRS tax filings. This is Shopify requirement 4.3.8 — failing to state this will cause review rejection.
```

### 7. GDPR webhooks
```
The GDPR webhook handlers are commented out awaiting Shopify API approval. Check if the approval has come through. If yes, uncomment and test them. If not, apply for the required API access. These are mandatory for Shopify submission.
```

---

## Jewelry Studio Manager (10/16) — `C:\JM Programs\Custom Design Tool - Customer Manager`

### 1. Google OAuth
```
Add a Google login option. We have a Google Cloud account with multiple apps already configured. Open a browser and I will log you in. Add Google OAuth as an additional sign-in method alongside the existing email/password JWT auth. Users should be able to sign in with either method and access the same account.
```

### 2. JMS Dev Lab footer
```
Add a "Created by JMS Dev Lab" footer with a link to https://www.jmsdevlab.com/ on all pages — both the app and the marketing website. Match the style used in the SmartCash app.
```

### 3. Screencast
```
We need a screencast video for the Shopify submission. Make sure the guided tour has a demo mode that auto-advances through all steps. The app has 3 tour variants (Owner, Staff, Client) — use the Owner tour for the screencast. Seed the app with plausible demo data and walk me through how to record it.
```

### 4. Mascot
```
Provide a NanoBanana prompt to create a mascot for this app who will be used in promo videos for this app, Pixar style — square image. The mascot should relate to jewelry crafting — maybe a friendly gemstone character, a ring with personality, or a jeweller's bench companion.
```

---

## StaffHub (9/16) — `C:\JM Programs\Staff Hub`

### 1. Fix Shopify review issues (CRITICAL — do these first)
```
Shopify review (Reference: 102157) flagged 4 issues that must be fixed before the app can be approved. Fix all of these:

1. GEOGRAPHIC REQUIREMENTS (4.3.8): The app has Eircode and Irish county address fields in the valuation section. Either make these optional/international, or add geographic requirements to the Shopify listing stating the app is designed for Ireland/UK.

2. ERROR CREATING VALUATIONS (2.1.2): There is an error when creating valuations. Find and fix the bug. Test creating a valuation from scratch on a fresh install.

3. TRAINING SETTINGS NOT SAVING (2.1.2): Training settings changes are not persisting. Find and fix the bug. Verify settings save and reload correctly.

4. STAFF PORTAL NOT VISIBLE (2.1.2): The testing instructions mention a staff portal with credentials, but the reviewer can't find it in the app UI. Either make the staff portal accessible and visible in the UI, or update the testing instructions to remove the reference.

After fixing all 4, reply to the Shopify review email at hello@jmsdevlab.com confirming all issues are resolved. We have 14 days from the review email or the app gets paused.
```

### 2. Mascot
```
Provide a NanoBanana prompt to create a mascot for this app who will be used in promo videos for this app, Pixar style — square image. The mascot should relate to staff training and team management — maybe a friendly clipboard character, a coach whistle with personality, or a team captain figure.
```

### 3. Promo video script
```
Create a 60-second promo video script for StaffHub — text only. Highlight the core value prop (staff training, onboarding, progress tracking, team communication), show key features, and end with a call to action.
```

### 4. Screencast
```
We need a screencast video for the Shopify submission. Make sure the guided tour has a demo mode that auto-advances through all steps. Then I will run the tour on screen and use screen capture software to record it. Set up the demo tour mode if it doesn't exist, seed the app with plausible demo data, and walk me through how to record it.
```

### 5. Web SaaS marketing
```
The web SaaS version exists but isn't marketed separately. Create a branded landing page for the standalone web version at staffhubapp.com that highlights it as an independent product (not just a Shopify addon). Users should be able to sign up and use it without Shopify.
```

---

## Pitch Side (9/16) — `C:\JM Programs\Football Coaching App`

### 1. GDPR data export/deletion
```
Implement GDPR data export and deletion functionality. Users must be able to:
1. Export all their data (squads, sessions, drills, formations, etc.) as a downloadable file
2. Request deletion of their account and all associated data

Add these as Firebase Cloud Functions. Add a "Your Data" section in settings with "Export My Data" and "Delete My Account" buttons. This is a legal requirement under GDPR.
```

### 2. Mascot
```
Provide a NanoBanana prompt to create a mascot for this app who will be used in promo videos for this app, Pixar style — square image. The mascot should relate to grassroots football coaching — maybe a friendly football/soccer ball character with a whistle, a cone with personality, or a coaching clipboard figure.
```

### 3. Promo video script
```
Create a 60-second promo video script for Pitch Side — text only. Highlight that it's completely free. Core value prop: session planning, 75+ drills library, formation builder, squad management, matchday tools — all free, no subscriptions. Target audience is grassroots football coaches and parents helping out at training.
```

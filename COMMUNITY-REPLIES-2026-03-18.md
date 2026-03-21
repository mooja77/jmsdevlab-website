# Community Reply Drafts — 18 March 2026

**Rules:**
- Zero links in first 10+ posts
- Pure helpful advice only
- Sign off as "— John" (no company name until trusted)
- No product mentions until well-established
- Build reputation first, link later

---

## 1. Best way to manage retail staff in Shopify POS?
**URL:** https://community.shopify.com/t/best-way-to-manage-retail-staff-in-shopify-pos/592033
**Posted:** ~Mar 14, 2026 | **Replies:** 0

```
Hey — this is something I've dealt with across a few retail setups.

Shopify POS handles basic staff permissions but doesn't really
cover training, onboarding, or shift management natively.

What most store owners end up doing is a combination of:

- Shopify POS staff permissions for till access and discounting
- A separate tool for SOPs, training checklists, and onboarding
  (even a shared Google Doc works at small scale)
- A scheduling app like Homebase or Deputy for shifts and hours

The bit that usually gets missed is training — making sure new
hires actually know your products, your processes, and your
returns policy before they go on the floor. That's where the
real cost is when it's missing.

If you're managing across multiple locations, my advice would be
to standardise your onboarding checklist first. Once you know
exactly what every new hire needs to learn, the tool choice
becomes much easier.

Happy to share more on what's worked for the retail teams I've
worked with.

— John
```

---

## 2. App Store submission blocked: TAE check failing
**URL:** https://community.shopify.dev/t/app-store-submission-blocked-use-theme-app-extensions-check-failing/32190
**Posted:** Mar 2026

```
Had this exact issue. The automated check looks for specific
patterns in your extension configuration, and it can fail even
when you're using TAE correctly.

A few things to check:

1. Make sure your shopify.app.toml references the extension
   correctly and your extension directory structure matches what
   the CLI expects
2. If you're using an App Embed block (not an App Block), the
   checker sometimes doesn't recognise it — try adding a simple
   App Block as well, even if it's minimal
3. Check that your theme extension's schema is valid JSON and
   your block targets are correct
4. Run `shopify app config link` to make sure your local config
   is synced with the Partner Dashboard

If none of that works, reply to the review rejection email with
a screenshot of your extension in the theme editor — the review
team can override the automated check manually.

— John
```

---

## 3. Enabling theme extensions for dev shop
**URL:** https://community.shopify.dev/t/enabling-theme-extensions-for-dev-shop/32198
**Posted:** Mar 2026

```
The UI for this moved recently with the new Dev Dashboard.

Here's the current flow:

1. Go to your app in the Partner Dashboard
2. Click "Extensions" in the left nav
3. Your theme extension should be listed there
4. Install the app on your dev store
5. In the dev store admin: Online Store > Themes > Customize
6. Look for "App embeds" in the left sidebar (bottom section)
7. Toggle your extension on

The key thing that catches people out: if you're running
`shopify app dev`, the extension is served locally but won't
appear in the theme editor. You need to run `shopify app deploy`
first for it to show up there.

— John
```

---

## 4. New Shopify Store for Employees To Use
**URL:** https://community.shopify.com/t/new-shopify-store-for-employees-to-use/587567
**Posted:** ~Feb 6, 2026

```
This is a common need. A few approaches depending on your scale:

1. Password-protected store — simplest option. Set a store
   password and share it with employees. Takes 10 minutes.

2. Draft orders — if volume is low, just create draft orders
   manually in admin when someone requests something.

3. Discount codes — create an employee-only discount code
   (100% off or whatever your policy is) and share it with
   your team. They order through the normal store.

4. Shopify B2B — if you're on Plus, you can create a
   wholesale/B2B channel with employee-specific pricing.

For most teams under 50 people, option 3 (discount code +
normal store) is the fastest and simplest. No extra setup,
everyone uses the same checkout flow, and you get proper
order tracking.

— John
```

---

## 5. Disabled custom app per 1 Jan 2026
**URL:** https://community.shopify.com/t/disabled-custom-app-per-1-jan-2026/586904
**Posted:** ~Feb 2, 2026

```
This caught a lot of people out. Shopify deprecated the old
custom app flow where you generated API credentials directly
in the store admin.

What you need to do now:

1. Create the app in the Partner Dashboard (not the store admin)
2. Use the standard OAuth flow for authentication
3. Install it on your store via the Partner Dashboard

If your existing custom app was disabled, your data is still
there — you just need to recreate the app properly and
re-authenticate. The API credentials will be different, so
update any integrations that were using the old keys.

The Shopify docs on authentication cover the new flow well.
Search for "Shopify app authentication" in the dev docs.

It's annoying but the new flow is actually better for security
long-term.

— John
```

---

## 6. Looking to Hire a Shopify Developer
**URL:** https://community.shopify.com/t/looking-to-hire-a-shopify-developer/584595
**Posted:** ~Jan 2026

```
A few things that'll help you find the right person:

1. Be specific about what you need — "theme customisation"
   and "custom app development" are very different skill sets.
   Liquid/CSS work is one thing, building a full Shopify app
   with webhooks and APIs is another.

2. Ask for examples of similar work — not just a portfolio,
   but specifically "have you built something like this before?"

3. Get a fixed quote, not hourly — for defined scope work,
   fixed pricing protects you from scope creep and surprise
   invoices.

4. Check they know the current stack — Shopify has changed a
   lot recently (Remix, Functions, new checkout extensibility).
   Make sure they're not still building with deprecated tools.

5. Ask about post-launch support — the person who built it
   should be available to fix bugs after launch, not disappear.

Red flags: no portfolio, refusal to give a fixed quote, heavy
jargon without clear explanations, wanting to start coding
immediately without understanding your business first.

— John
```

---

## 7. Replace my spreadsheet: track cost, revenue, margin
**URL:** https://community.shopify.com/t/replace-my-spreadsheet-track-cost-revenue-and-margin-in-shopify/567219
**Posted:** Sept 23, 2025

```
5 years of data in a spreadsheet — I've seen this exact
situation many times. The honest answer depends on complexity.

If your spreadsheet is mainly tracking COGS + revenue + margins:
Shopify's built-in reports have improved a lot. Go to Analytics >
Reports > Finances. You can track cost per item using the "Cost
per item" field on each product variant. Not perfect, but it's
free and native.

If you're also tracking supplier orders, delivery dates, and
customer-level data:
You're probably outgrowing what Shopify reports can do natively.
At that point you're looking at either:
- A profit tracking app (BeProfit, TrueProfit, Lifetimely)
- A proper accounting integration (Xero or QuickBooks connected
  to Shopify)
- A custom solution if your workflow is truly unique

The key question is: are you spending more than 5 hours/week
maintaining the spreadsheet? If yes, the ROI on replacing it is
almost always positive within 6 months.

Start by listing every column in your spreadsheet and marking
which ones Shopify already tracks natively. You'll quickly see
where the gaps are.

— John
```

---

## 8. Shopify Finance Summary Report changed
**URL:** https://community.shopify.com/t/shopify-has-changed-their-finance-summary-report-no-longer-a-report/414614
**Posted:** Recent

```
This frustrated a lot of store owners. The old tabular report
was genuinely useful for accounting — the new chart-based view
looks nice but is harder to export and reconcile.

A few workarounds:

1. Analytics > Reports > Finances still has some tabular views
   you can export to CSV

2. If you're doing proper bookkeeping, syncing to Xero or
   QuickBooks gives you better reports than Shopify ever did —
   and your accountant will thank you

3. The Shopify API (Orders and Transactions endpoints) gives
   you everything you need if you're technical enough to pull
   it into a spreadsheet or dashboard

4. Third-party profit tracking apps can generate the detailed
   P&L breakdowns the old report used to show

The core issue is that Shopify is optimising their analytics
for visual dashboards, not for the detailed export-to-accountant
workflow that many store owners actually need. Hopefully they'll
bring back a proper export option.

— John
```

---

## 9. Jewelry repair orders in Shopify
**URL:** https://community.shopify.com/t/how-can-we-manage-jewelry-repair-orders-using-shopify/244942
**Posted:** Ongoing (active replies)

```
This is a really common challenge for brick-and-mortar jewellers.
Shopify isn't designed for repair workflows out of the box —
there's no concept of "receive item in, track repair status,
return to customer."

What I've seen work:

1. Draft orders as repair tickets — create a draft order for
   each repair, use tags for status (received / in-progress /
   ready / collected), add notes for repair details. It's
   manual but free.

2. Metaobjects — if you're on a plan that supports them, you
   can create a custom "Repair" content type with fields for
   item description, status, estimated completion date, etc.

3. A simple spreadsheet with columns for: customer name, item,
   issue, date received, estimated date, status, price. This
   works fine up to about 20-30 active repairs.

The key things jewellers need that Shopify doesn't handle:
- Intake form (item description, photos, what needs doing)
- Status tracking with customer notifications
- Parts ordering linked to the repair
- Printable job tickets

I come from the jewelry industry so I've lived this problem
firsthand. Happy to chat about what workflows have worked.

— John
```

---

## POSTING STRATEGY

**Phase 1 (first 10 posts): Zero links, pure advice**
- Post replies 1-9 above
- Also find and answer a few simple questions (theme help,
  basic Shopify admin questions) to build post count

**Phase 2 (posts 11-20): Occasional blog links**
- Start adding a single relevant blog link where it genuinely
  helps (e.g., "I wrote about this in more detail here: ...")
- Still lead with the full answer in the post itself

**Phase 3 (posts 20+): Light product mentions**
- "I actually built an app for this" when directly relevant
- Always frame as "I built this because I had the same problem"
- Never link to app store listing, only mention by name

**Phase 4 (established): Full profile**
- Update profile bio with JMS Dev Lab and links
- Community will have enough post history to see you're genuine

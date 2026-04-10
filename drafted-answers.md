# Drafted Answers for Quora and Reddit

## Guidelines
- Written as John Moore, developer and former retail business owner (22 years in jewelry retail)
- Tone: practical, honest, no hype
- No links in Reddit answers
- Quora: max one link, only if genuinely helpful
- Each answer: 150-300 words

---

## QUORA ANSWER 1

**Question:** "How much does it cost to build a custom app for a small business?"

I've been building custom software for small businesses for a while now, and I ran a retail business for 22 years before that, so I'll give you the numbers I wish someone had given me.

For a small business, custom software typically falls into three buckets:

- **Spreadsheet replacement** (turning a messy spreadsheet into a proper system): 3,000-6,000 EUR / 3,000-6,500 USD
- **Client portal or dashboard** (login-based system with different user roles): 6,000-12,000 EUR / 6,500-13,000 USD
- **Full custom application** (a complete tool built around your workflow): 12,000-25,000 EUR / 13,000-27,000 USD

What pushes the price up: integrations with other tools (Shopify, Xero, etc.), complex business logic, multiple user roles needing different views, and mobile-friendly design.

What people forget to budget for: hosting (5-50/month) and ongoing maintenance (roughly 10-15% of the build cost per year for updates and fixes).

Honest advice: don't go custom if your needs are generic. Need invoicing? Use Xero. Need a basic CRM? HubSpot's free tier is fine. Custom only makes sense when off-the-shelf tools don't fit how your business actually works.

Also, always insist on a fixed-price quote. Hourly billing means you carry all the risk if the project takes longer than expected. A developer who can't give you a fixed price probably doesn't understand the project well enough yet.

---

## QUORA ANSWER 2

**Question:** "Should I hire a freelancer or an agency to build my app?"

Having been on both sides of this -- as a business owner hiring developers and now as a solo developer building for businesses -- here's my honest take.

**Freelancers:**
- Lower cost (no agency overheads baked into the price)
- You're talking directly to the person who writes the code, so less gets lost in translation
- More flexible on scope and timelines
- Risk: if they get sick, go on holiday, or disappear, your project stalls. There's no team behind them.

**Agencies:**
- More resources -- designers, project managers, multiple developers
- Better for large, complex projects with many moving parts
- Risk: you're often paying for a lot of overhead (office, account managers, salespeople) that doesn't directly improve your software. And the person you pitch to is rarely the person who builds it.

**My recommendation for small businesses:** start with a freelancer or a micro-studio (1-3 people) for anything under 25,000 in budget. You'll get more direct communication, less bureaucracy, and typically faster turnaround.

Before you hire anyone, check these things:
- Can they show you similar projects they've actually built and shipped?
- Will they give you a fixed price, or do they bill hourly?
- Who owns the code when it's done? (The answer should be you.)
- What happens after launch -- do they offer maintenance?

The biggest mistake I see: choosing based on price alone. The cheapest quote often means corners get cut, and you end up paying twice when it needs rebuilding.

---

## QUORA ANSWER 3

**Question:** "Is it worth replacing my spreadsheet with custom software?"

I ran a multi-site retail business for 22 years. We lived and died by spreadsheets. So I know exactly when a spreadsheet is fine and when it's silently costing you money.

**Signs you've outgrown your spreadsheet:**
- Multiple people edit it and things keep breaking
- You've got colour-coded tabs that only one person understands
- Someone sorted a column and wiped out half your formulas
- You're emailing copies around and nobody knows which version is current
- You spend hours at month-end fixing data before you can run reports

**When it's NOT worth replacing:**
- Only 1-2 people use it and it works fine
- The process it tracks is simple and stable
- You can't clearly describe what's wrong with it (if you can't articulate the problem, you're not ready)
- You need a solution running by next week (custom takes 3-4 weeks minimum)

**When it IS worth it:**
If your team loses even a few hours a week to spreadsheet headaches -- fixing errors, merging versions, manually entering the same data twice -- a custom replacement in the 3,000-6,000 range typically pays for itself within 6-12 months in time saved alone.

The practical approach: don't try to replace everything at once. Identify the one workflow that causes the most pain. Start there. A focused tool that solves one problem well is infinitely better than trying to digitise your entire business in one go.

---

## REDDIT ANSWER 4

**Subreddit:** r/shopify
**Post:** "I need a custom feature my Shopify theme can't do, what are my options?"

You've basically got three paths, in order of complexity and cost:

**1. Liquid/theme customization**
If what you need is front-end (how things look, conditional content, custom page layouts), a good Shopify developer can often do it with Liquid, CSS, and JavaScript directly in your theme. This is the cheapest option -- usually a few hundred to maybe 1,500 depending on complexity. The limitation is that Liquid can only work with data Shopify already has. If you need new data types or backend logic, Liquid won't cut it.

**2. Existing Shopify apps**
Before going custom, search the app store thoroughly. There are 10,000+ apps and there might already be one that does what you need. Check reviews carefully though -- a lot of apps look great in the listing but are buggy or have terrible support. Also watch out for apps that charge per-use fees that scale fast.

**3. Custom Shopify app (public or private)**
If your requirement is genuinely unique -- custom business logic, integration with an external system, a workflow that no existing app covers -- you'll need a custom app built against Shopify's APIs. This is the most expensive option (typically several thousand and up) but gives you exactly what you need with no compromises.

Before jumping to option 3, try to be really specific about what you need. "I want a custom feature" is vague. "I need customers to upload a design file during checkout and have it routed to our production team with specific metadata" is something a developer can actually quote.

Also worth knowing: Shopify has a decent developer community. Post your specific requirement and someone might point you to an app or approach you hadn't considered.

---

## REDDIT ANSWER 5

**Subreddit:** r/smallbusiness
**Post:** "We're running everything on spreadsheets and it's getting out of hand. What should we do?"

I ran a retail business for 22 years and went through exactly this. Here's what I'd tell past-me:

**Don't try to fix everything at once.** Pick the ONE spreadsheet that causes the most pain -- the one with broken formulas, the one that three people edit and nobody trusts, the one you spend hours fixing every month. Start there.

**Before going custom, check if existing software solves it.** For accounting, use Xero or QuickBooks. For CRM, try HubSpot free tier. For project management, Asana or Monday. Don't pay thousands to rebuild something that already exists and works well.

**The signs you actually need custom software:**
- Your process is unique to your industry or business
- You've tried off-the-shelf tools and they don't fit how you work
- You're duct-taping three different tools together with manual copy-pasting
- Multiple people need different views of the same data

**Realistic costs:** A spreadsheet replacement runs roughly 3,000-6,000. A more complex system with multiple user roles and integrations runs 6,000-15,000. Budget 10-15% per year for maintenance after that.

**What to look for in a developer:**
- Fixed-price quotes, not hourly billing (hourly means you carry the risk)
- Someone who asks about your business process, not just the technical requirements
- Ownership of the code when it's done
- A clear plan for what happens after launch

**One thing most people get wrong:** they try to digitise their entire business at once. That's how you end up with an 18-month project that's over budget and nobody uses. Build one small tool, get your team using it, learn from it, then tackle the next problem.

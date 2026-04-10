---
title: How I Built 7 Shopify Apps as a Solo Developer in Ireland
published: false
description: A 47-year-old former jeweller and Sun Microsystems engineer on building 7 production apps solo, the problems that drove each one, and what he learned shipping real software after 22 years in retail.
tags: shopify, webdev, typescript, indie
---

# How I Built 7 Shopify Apps as a Solo Developer in Ireland

I am not a 22-year-old fresh out of college with a laptop and a dream. I am 47, I have been running a jewellery retail business in Cork, Ireland for over two decades, and I am only now — after closing that business — turning back to software full time. This is the story of how I built seven production applications as a solo developer, and why it took running shops for 22 years to figure out what software actually needed to exist.

## The Long Way Round

I studied Computer Science at University College Cork, graduating in 2001. My first job was at Sun Microsystems, where I spent three years working on enterprise systems. It was rigorous, disciplined work. I learned how large-scale software gets built properly.

Then in 2004, I took over the family jewellery business — Moores Jewellers, a multi-site retail operation across Cork. I ran it for 22 years. Four locations at our peak: Douglas Court, Mahon Point, Carrigaline, and Bandon. I served on the board of the Association of Fine Jewellers and held the role of Vice President.

During those 22 years, I never stopped thinking like an engineer. Every spreadsheet I maintained, every process I cobbled together with paper and manual effort, every problem I watched other retailers struggle with — I filed it away. When the time came to wind down the business in 2026 and launch JMS Dev Lab as a software development practice, I did not need to guess what to build. I had a list.

## Why Seven Apps

The honest answer: because I kept finding problems that existing software did not solve, or solved badly, or solved at a price point that made no sense for small retailers.

Each app started the same way. I would hit a wall in my own business, look for a tool, find nothing adequate, and think: I could build this. After a while, the pattern became a pipeline. Here is what came out of it.

### SmartCash — Cashflow Management

Every small retailer I know has the same problem: they can tell you their revenue, but they cannot tell you their actual cash position next month. SmartCash is a Shopify embedded app that does cashflow forecasting with AI-powered projections. It connects to a merchant's Shopify data and turns sales history into forward-looking cash visibility. This was the app I wished I had during every January when jewellery retail goes quiet and the bills do not.

### Jewel Value — Jewelry Valuations

Insurance valuations are bread and butter for any jeweller, but the process is archaic. Most shops still type certificates in Word documents. Jewel Value generates professional valuation certificates directly from a Shopify store, with support for 13 languages. I built it because I was tired of the formatting headaches and because jewellers everywhere have the same problem.

### RepairDesk — Repair Ticket Management

Repairs are a significant revenue stream for jewellers and watchmakers, but tracking them is chaos in most shops. Handwritten tickets, no status updates for customers, items lost in the back room. RepairDesk is a repair ticket management system built specifically for this workflow. It tracks items from intake through to collection, with status updates and a clear audit trail.

### StaffHub — Team Training

Training retail staff is repetitive and inconsistent. Every new hire gets a different version of the same information depending on who trains them. StaffHub is a team training and management app that standardises onboarding and ongoing development. I built it after watching the same training problems recur across multiple shop locations for years.

### GrowthMap — Marketing Planner

Small retailers know they should be doing marketing but have no idea where to start. GrowthMap breaks marketing down into structured, actionable tasks — like Duolingo, but for marketing plans. It guides merchants through execution rather than just telling them to "do social media."

### JewelryStudioManager — CRM

Custom jewellery work involves long conversations with customers, design iterations, approvals, and timelines. Managing all of that in email and notebooks is a recipe for missed details and unhappy clients. JewelryStudioManager is a CRM built specifically for jewellery studios handling custom and bespoke work.

### Pitch Side — Football Coaching (The Odd One Out)

Not every app comes from retail. I coach underage football at Carrigaline AFC, and I found the same tooling gap there. Pitch Side is a free coaching companion for grassroots football — session planning, squad management, that sort of thing. It is built on Next.js with Firebase and Capacitor for mobile. No Shopify involvement, no subscription, completely free. I built it because grassroots sports clubs should not have to pay for basic organisational tools.

## The Tech Stack

All six Shopify apps are built with TypeScript, React, and Node.js. Beyond that, the specifics vary by app:

- **Frameworks:** Next.js for most frontends, NestJS for some backends, Express for others
- **Databases:** PostgreSQL with Prisma ORM for most apps, MongoDB for StaffHub, Supabase for GrowthMap, Firebase for Pitch Side
- **Shopify integration:** App Bridge, Polaris UI components, Shopify Billing API, session tokens
- **Hosting:** Railway for backends, Vercel and Cloudflare Pages for frontends
- **Architecture:** Most apps use a monorepo structure (apps/shopify, apps/web, apps/backend, packages/shared) so the Shopify embedded version and a standalone web version can share code and data

I settled on TypeScript early and have not looked back. Strict mode everywhere. The type safety pays for itself when you are the only person reviewing your own code.

## What I Learned

**Domain expertise is an unfair advantage.** I did not need to interview jewellers to understand their problems. I was the jeweller. I knew which workflows were painful because I had lived them for two decades. If you are building software for an industry, there is no substitute for having actually worked in it.

**Solo does not mean sloppy.** When there is no team to catch your mistakes, you build habits fast. Automated testing, strict linting, proper error handling, GDPR compliance — these are not optional extras when you are the only engineer, the only support person, and the only one who gets the email when something breaks at 2am.

**Ship before it is perfect.** Every one of these apps has rough edges I know about. The alternative was shipping nothing. I chose to get working software in front of real users and iterate from there.

**Seven apps is probably too many.** I will be honest about this. Building seven apps means spreading attention thin. Each app needs documentation, support, marketing, updates, and ongoing Shopify review compliance. If I were advising someone else, I would say pick two or three and go deep. But these apps exist because the problems exist, and I could not bring myself to leave them half-built.

**The Shopify review process is thorough.** Submitting apps to the Shopify App Store is not a rubber stamp. They check for GDPR webhook compliance, geographic requirements, UI consistency, and more. It is demanding, but it forces a quality standard that benefits merchants.

## Where Things Stand

I am not going to dress this up with vanity metrics. I have no thousands of installs to report. These apps are newly submitted, the business is newly launched, and I am still winding down Moores Jewellers. What I have is seven working applications, each solving a real problem I experienced firsthand, built to production standard with proper architecture.

JMS Dev Lab is a sole trader software development practice based in Cork, Ireland. I build Shopify apps and custom software for small businesses. If you are a developer thinking about building for Shopify, or a retailer wondering whether your workflow problems have software solutions, I am happy to talk.

You can find everything at [jmsdevlab.com](https://jmsdevlab.com).

---

*John Moore is the founder of JMS Dev Lab, a software development practice in Cork, Ireland. He builds Shopify apps and custom business software. Previously, he spent 22 years running Moores Jewellers and 3 years as a software engineer at Sun Microsystems.*

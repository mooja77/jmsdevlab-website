# Marketing Companion App — Architecture Document

## Purpose

This document is a complete architectural brief for building a marketing plan execution app. It should contain everything needed for a developer (or AI instance) to build the app from scratch.

The app is called **"Marketing Companion"** (working title). It takes a marketing plan as input and transforms it into a guided, step-by-step execution interface for non-marketing-expert, non-technical users. Think "Duolingo for marketing" — friendly, structured, zero jargon.

---

## The Problem

Small business owners and indie developers create (or receive) marketing plans, then never execute them. The plan sits in a Google Doc or markdown file, overwhelming and untouched. The reasons:

1. **Plans are walls of text** — no clear "do this next" signal
2. **Marketing jargon is intimidating** — "ARIMA forecasting funnel optimization" means nothing to a jeweler
3. **No progress visibility** — you can't see what you've done or what's left
4. **Context switching** — the plan says "post on Twitter" but you have to leave the doc, open Twitter, figure out what to write, come back
5. **No guidance** — the plan says "optimize meta descriptions" but doesn't walk you through it
6. **Accountability gap** — nobody's checking if you did it

## The Solution

A web app that:
- **Ingests** a marketing plan (markdown, paste, or structured input)
- **Parses** it into phases, tasks, and milestones
- **Presents** a clean, guided interface — one task at a time if needed
- **Explains** each task in plain English with step-by-step guidance
- **Connects** to social media and tools so you can execute without leaving the app
- **Tracks** progress with satisfying visual feedback
- **Nudges** you with smart reminders and encouragement

---

## Target Users

### Primary: Small Business Owner
- Runs a Shopify store, local service business, or indie product
- Has 0-2 employees
- Not a marketer — they make jewelry, coach football, sell products
- Comfortable with phones and basic web apps but not "techy"
- Time-poor — needs 15-minute sessions, not 2-hour deep dives
- Gets overwhelmed by options — needs "do this one thing next"

### Secondary: Freelancer / Indie Developer
- Building a SaaS or app, knows code but not marketing
- Understands the importance of marketing but doesn't enjoy it
- Wants structure and accountability

---

## Core Principles

1. **One thing at a time** — Never show the full plan upfront. Show the current task, with context.
2. **Plain English always** — Every marketing term gets a plain-language explanation. "SEO" becomes "helping people find you on Google."
3. **Do it here** — If the task is "write a social media post," the app should let you draft and publish it without leaving.
4. **Progress is visible** — Big, satisfying progress bars. Celebrate completions.
5. **Opinionated defaults** — Don't ask "which social platform?" — suggest one based on their business. They can change it.
6. **Mobile-first** — Most small business owners will use this on their phone between tasks.
7. **No marketing degree required** — The app IS the marketing expert. The user just follows the steps.

---

## Feature Specification

### F1: Plan Ingestion

**What it does:** Takes a marketing plan and converts it into structured, actionable data.

**Input methods (priority order):**
1. **Paste markdown/text** — User pastes their plan, AI parses it into structured tasks
2. **Upload file** — .md, .txt, .pdf, .docx
3. **Guided builder** — If they don't have a plan, walk them through creating one with a questionnaire:
   - What's your business?
   - What do you sell?
   - Who are your customers?
   - What's your budget (time and money)?
   - What platforms are you already on?

**AI parsing logic:**
The parser should extract:
- **Phases** (timeline-based groupings)
- **Tasks** (actionable items with checkbox-like status)
- **Strategic context** (background info that explains WHY a task matters)
- **Dependencies** (Task B can't start until Task A is done)
- **External tools referenced** (Twitter, Google, Shopify, etc.)
- **Metrics/KPIs** (what success looks like)
- **Templates** (email copy, outreach scripts, content outlines)
- **Personas** (who the marketing targets)

**Output:** A structured JSON plan object stored in the database. See Data Model section.

### F2: Dashboard — "Mission Control"

**What the user sees when they open the app.**

Layout (top to bottom):
```
┌─────────────────────────────────────────┐
│  👋 Good morning, James               │
│  Phase 2 of 5: Build Demand            │
│  ████████████░░░░░░░ 62% complete       │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  🎯 TODAY'S FOCUS               │    │
│  │                                 │    │
│  │  Write your first blog post     │    │
│  │  ~25 mins · Content · Phase 2   │    │
│  │                                 │    │
│  │  [Start Task →]                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │  12  │ │  5   │ │  3   │            │
│  │ Done │ │ This │ │Streak│            │
│  │      │ │ Week │ │ Days │            │
│  └──────┘ └──────┘ └──────┘            │
│                                         │
│  COMING UP                              │
│  ○ Set up Google Business Profile       │
│  ○ Draft outreach email to 3 agencies   │
│  ○ Schedule 2 social posts              │
└─────────────────────────────────────────┘
```

**Key elements:**
- **Greeting + phase indicator** — Where they are in the big picture
- **Overall progress bar** — Satisfying, always visible
- **Today's Focus card** — THE one thing to do. AI-selected based on priority, dependencies, and what's overdue. Estimated time shown.
- **Quick stats** — Tasks completed, weekly activity, streak
- **Coming Up** — Next 3-5 tasks (collapsed, not overwhelming)

### F3: Task Execution View

**When the user taps "Start Task," they enter a guided execution flow.**

Each task has:
1. **What** — Plain English description of the task
2. **Why** — One sentence explaining why this matters (e.g., "This helps people find you when they search Google for jewelry valuations")
3. **How** — Step-by-step walkthrough, broken into sub-steps
4. **Do** — Interactive area to actually complete the task (compose a post, fill in a form, preview output)
5. **Done** — Confirm completion, optional notes, celebrate

**Example: "Optimize your homepage meta description"**
```
WHAT: Update the short description search engines show for your homepage.

WHY: When someone Googles your business, this is the text they see
     below your link. A good one gets more clicks.

HOW:
  Step 1 of 3: Review your current description
  ┌──────────────────────────────────────┐
  │ Current: "Welcome to JMS Dev Lab"    │
  │                                      │
  │ ⚠️ This is too short and doesn't     │
  │ tell people what you actually do.    │
  └──────────────────────────────────────┘

  Step 2 of 3: Write a better one
  ┌──────────────────────────────────────┐
  │ Tips:                                │
  │ • Keep it under 160 characters       │
  │ • Include what you do + who for      │
  │ • Include your location if local     │
  │                                      │
  │ [AI Suggest] or write your own:      │
  │ ┌──────────────────────────────────┐ │
  │ │                                  │ │
  │ └──────────────────────────────────┘ │
  │ 0/160 characters                     │
  └──────────────────────────────────────┘

  Step 3 of 3: Apply the change
  ┌──────────────────────────────────────┐
  │ Copy this and paste it into your     │
  │ website's <head> section:            │
  │                                      │
  │ <meta name="description"             │
  │   content="Your new description">    │
  │                                      │
  │ [Copy to Clipboard]                  │
  │                                      │
  │ Not sure how? [Show me →]            │
  └──────────────────────────────────────┘

  [Mark as Complete ✓]
```

### F4: Social Media Composer

**Built-in tool for creating and scheduling social posts.**

Features:
- **Multi-platform composer** — Write once, adapt for Twitter/X, LinkedIn, Facebook, Instagram
- **AI assistance** — "Suggest a post about [topic]" generates platform-appropriate copy
- **Character count** — Per-platform limits shown in real-time
- **Preview** — See how the post will look on each platform
- **Schedule or publish** — Connect accounts via OAuth, post directly or schedule
- **Content calendar view** — See all scheduled posts on a calendar
- **Post templates** — Pre-built templates from the marketing plan (e.g., "Build in Public" update, product announcement, tip/insight)

**Integration approach:**
- Twitter/X API (OAuth 2.0)
- LinkedIn API (OAuth 2.0)
- Facebook/Instagram Graph API (OAuth 2.0)
- Buffer or Hootsuite API as fallback (if direct APIs are too restrictive)

### F5: Email Outreach Tool

**For executing outreach campaigns from the marketing plan.**

Features:
- **Template library** — Pre-loaded from the marketing plan's outreach templates
- **Variable substitution** — `{{name}}`, `{{company}}`, `{{product}}` auto-filled
- **Contact list** — Simple CRM: name, email, company, status (not contacted / sent / replied / converted)
- **Send via user's email** — Connect Gmail/Outlook via OAuth, send as them
- **Follow-up reminders** — "You emailed Sarah 5 days ago. Send a follow-up?"
- **Tracking** — Open/click tracking (optional, with privacy note)

### F6: Content Workshop

**Guided content creation for blog posts, lead magnets, and website copy.**

Features:
- **Topic suggestions** — AI-generated based on the marketing plan's content calendar and keyword targets
- **Outline generator** — Given a topic, generate a blog post outline with H2s and key points
- **Draft assistant** — AI helps write sections, user edits and approves
- **SEO checker** — Simple traffic-light system: meta description ✓, headings ✓, keyword usage ✓, length ✓
- **Export** — Copy as HTML, markdown, or plain text for pasting into their CMS

### F7: Progress & Analytics

**Visual progress tracking that feels rewarding.**

- **Phase progress** — Which phase they're in, percentage complete per phase
- **Overall completion** — Big progress ring/bar on dashboard
- **Streak tracking** — "You've worked on marketing 5 days in a row!"
- **Weekly summary** — Email digest: "This week you completed 4 tasks, wrote 2 posts, and sent 3 outreach emails"
- **Before/after metrics** — If they connect analytics (Plausible, GA4), show real impact: "Website visits this month: 340 (+23% since you started)"
- **Milestone celebrations** — Confetti/animation when completing a phase or hitting a streak

### F8: Guidance Library

**Always-available help that explains marketing concepts in plain English.**

- **Glossary** — Every marketing term defined simply. "SEO: Making your website easier to find on Google."
- **Mini-guides** — 2-minute reads on topics like "What is a meta description?", "How to write a good tweet", "What makes a good outreach email?"
- **Video walkthroughs** — (Future) Short screen recordings showing how to do common tasks
- **Contextual help** — Each task links to relevant glossary/guide entries

### F9: Integrations Hub

**Connect external tools to reduce context-switching.**

Priority integrations:
1. **Social media** — Twitter/X, LinkedIn, Facebook, Instagram (post & schedule)
2. **Email** — Gmail, Outlook (send outreach)
3. **Analytics** — Plausible, GA4 (show website traffic impact)
4. **Shopify** — Pull store data for context (product names, URLs)
5. **Google Business Profile** — Manage listing, respond to reviews
6. **Canva** — Create social media graphics (via Canva Button API)

Each integration:
- OAuth-based connection
- Clear "why connect this?" explanation
- One-tap disconnect
- Data stays in user's control

---

## Data Model

### Plan
```
{
  id: uuid,
  userId: uuid,
  title: string,
  rawContent: text,              // Original pasted/uploaded plan
  status: "active" | "completed" | "archived",
  createdAt: timestamp,
  updatedAt: timestamp,

  businessContext: {
    name: string,
    industry: string,
    website: string,
    platforms: string[],         // ["shopify", "twitter", "instagram"]
    targetAudience: string,
    location: string
  }
}
```

### Phase
```
{
  id: uuid,
  planId: uuid,
  title: string,                 // "Fix the Foundation"
  description: text,             // Strategic context
  order: integer,
  status: "locked" | "active" | "completed",
  estimatedWeeks: integer,
  startDate: date | null,
  completedDate: date | null
}
```

### Task
```
{
  id: uuid,
  phaseId: uuid,
  planId: uuid,
  title: string,                 // "Optimize homepage meta description"
  description: text,             // Plain English explanation
  whyItMatters: text,            // One-line motivation
  category: enum,                // "content" | "social" | "seo" | "outreach" | "analytics" | "website" | "advertising" | "admin"
  type: enum,                    // "actionable" | "strategic" | "recurring"
  status: "pending" | "active" | "completed" | "skipped",
  priority: "high" | "medium" | "low",
  estimatedMinutes: integer,
  order: integer,

  // Dependencies
  dependsOn: uuid[],            // Task IDs that must complete first

  // Guided steps
  steps: [
    {
      order: integer,
      instruction: text,
      type: "info" | "input" | "action" | "review",
      helpLink: string | null,   // Link to guidance library entry
      completed: boolean
    }
  ],

  // Recurrence (for recurring tasks like "post on social media weekly")
  recurrence: {
    frequency: "daily" | "weekly" | "biweekly" | "monthly" | null,
    dayOfWeek: integer | null,
    nextDue: date | null
  },

  // Metadata
  externalTool: string | null,   // "twitter" | "google" | "shopify" etc.
  template: text | null,         // Pre-filled content (email template, post draft)
  completedAt: timestamp | null,
  notes: text | null,            // User's notes on completion

  // AI-generated guidance
  guidance: {
    plainEnglish: text,          // Jargon-free explanation
    stepByStep: text[],          // Numbered walkthrough
    commonMistakes: text[],      // "Don't forget to..."
    exampleOutput: text | null   // What good looks like
  }
}
```

### SocialPost
```
{
  id: uuid,
  taskId: uuid | null,           // Linked task if created from a task
  planId: uuid,
  platform: "twitter" | "linkedin" | "facebook" | "instagram",
  content: text,
  mediaUrls: string[],
  status: "draft" | "scheduled" | "published" | "failed",
  scheduledFor: timestamp | null,
  publishedAt: timestamp | null,
  metrics: {
    likes: integer,
    shares: integer,
    clicks: integer
  } | null
}
```

### OutreachContact
```
{
  id: uuid,
  planId: uuid,
  name: string,
  email: string,
  company: string | null,
  role: string | null,
  status: "not_contacted" | "sent" | "followed_up" | "replied" | "converted" | "declined",
  lastContactedAt: timestamp | null,
  notes: text | null
}
```

### OutreachEmail
```
{
  id: uuid,
  contactId: uuid,
  taskId: uuid | null,
  subject: string,
  body: text,
  templateId: uuid | null,
  status: "draft" | "sent" | "opened" | "replied",
  sentAt: timestamp | null
}
```

### ContentDraft
```
{
  id: uuid,
  taskId: uuid | null,
  planId: uuid,
  type: "blog_post" | "lead_magnet" | "website_copy" | "email_newsletter",
  title: string,
  outline: text | null,
  body: text,
  seoScore: {
    metaDescription: boolean,
    headings: boolean,
    keywordUsage: boolean,
    length: boolean
  } | null,
  status: "draft" | "review" | "published",
  publishedUrl: string | null
}
```

### UserProgress
```
{
  id: uuid,
  userId: uuid,
  planId: uuid,
  currentPhaseId: uuid,
  tasksCompleted: integer,
  tasksTotal: integer,
  currentStreak: integer,        // Consecutive days with activity
  longestStreak: integer,
  lastActiveAt: timestamp,
  weeklyDigestEnabled: boolean
}
```

### Integration
```
{
  id: uuid,
  userId: uuid,
  platform: string,              // "twitter" | "gmail" | "plausible" etc.
  accessToken: encrypted_string,
  refreshToken: encrypted_string,
  expiresAt: timestamp,
  status: "connected" | "expired" | "revoked",
  connectedAt: timestamp
}
```

### GlossaryEntry
```
{
  id: uuid,
  term: string,                  // "SEO"
  plainDefinition: text,         // "Helping people find you on Google"
  fullExplanation: text,         // 2-3 paragraph guide
  relatedTerms: string[],
  category: string               // "search" | "social" | "email" | "content" | "analytics"
}
```

---

## Tech Stack Recommendation

### Frontend
- **Framework:** Next.js 14+ (App Router)
  - Why: SSR for fast initial load, React for rich interactivity, great mobile experience
  - File-based routing keeps architecture simple
- **Styling:** Tailwind CSS
  - Why: Rapid UI development, consistent design system, great for responsive/mobile-first
- **UI Components:** shadcn/ui
  - Why: Beautiful, accessible, customisable. Not a heavy library — copy-paste components you own.
- **State Management:** Zustand (lightweight) or React Context for simple state
- **Animations:** Framer Motion (for celebrations, transitions, progress animations)
- **Charts:** Recharts (simple, React-native charting for analytics views)
- **Rich Text:** Tiptap (for content workshop editing)
- **Drag & Drop:** dnd-kit (for reordering tasks if needed)

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes (co-located with frontend)
- **Database:** PostgreSQL (via Supabase or Neon)
  - Why: Relational data model fits naturally, good JSON support for flexible fields
  - Supabase adds auth, real-time, and storage out of the box
- **ORM:** Prisma
  - Why: Type-safe, great migrations, works perfectly with Next.js
- **Auth:** Supabase Auth (or NextAuth.js)
  - Magic link (email) as primary — no passwords, lowest friction
  - Google OAuth as secondary
- **AI:** Claude API (Anthropic)
  - Plan parsing (markdown → structured tasks)
  - Content suggestions (social posts, blog outlines, email drafts)
  - Plain-English explanations for marketing concepts
  - "AI Suggest" buttons throughout the app
- **File Upload:** Supabase Storage (for plan uploads, media)
- **Email Sending:** Resend (for weekly digests and notifications)
- **Job Queue:** Inngest or Trigger.dev (for scheduled posts, email follow-up reminders)

### Infrastructure
- **Hosting:** Vercel (natural fit for Next.js, free tier to start)
- **Database:** Supabase (free tier: 500MB, 50k monthly active users)
- **CDN:** Vercel Edge (automatic)
- **Monitoring:** Vercel Analytics + Sentry (error tracking)
- **CI/CD:** Vercel Git integration (push to deploy)

### Why This Stack
1. **Fast to build** — Next.js + Supabase + Tailwind is the fastest path from zero to production
2. **Low cost to start** — Vercel free tier + Supabase free tier = $0/month until real traction
3. **Scales when needed** — All these tools scale to millions of users
4. **Great DX** — Type-safe end-to-end, hot reload, great error messages
5. **Mobile-first ready** — Next.js + Tailwind make responsive design effortless

---

## App Structure (File Layout)

```
marketing-companion/
├── prisma/
│   └── schema.prisma            # Database schema
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout (nav, auth wrapper)
│   │   ├── page.tsx             # Landing/login page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx
│   │   ├── (app)/               # Authenticated app routes
│   │   │   ├── layout.tsx       # App shell (sidebar, bottom nav)
│   │   │   ├── dashboard/page.tsx        # F2: Mission Control
│   │   │   ├── plan/
│   │   │   │   ├── page.tsx              # Plan overview (phases)
│   │   │   │   ├── import/page.tsx       # F1: Plan ingestion
│   │   │   │   └── [phaseId]/page.tsx    # Phase detail (task list)
│   │   │   ├── task/
│   │   │   │   └── [taskId]/page.tsx     # F3: Task execution view
│   │   │   ├── social/
│   │   │   │   ├── page.tsx              # F4: Social media hub
│   │   │   │   ├── compose/page.tsx      # Compose new post
│   │   │   │   └── calendar/page.tsx     # Content calendar
│   │   │   ├── outreach/
│   │   │   │   ├── page.tsx              # F5: Outreach dashboard
│   │   │   │   ├── contacts/page.tsx     # Contact list
│   │   │   │   └── compose/page.tsx      # Email composer
│   │   │   ├── content/
│   │   │   │   ├── page.tsx              # F6: Content workshop
│   │   │   │   └── [draftId]/page.tsx    # Edit draft
│   │   │   ├── progress/page.tsx         # F7: Analytics & progress
│   │   │   ├── learn/
│   │   │   │   ├── page.tsx              # F8: Guidance library
│   │   │   │   └── [termId]/page.tsx     # Glossary entry
│   │   │   └── settings/
│   │   │       ├── page.tsx              # Account settings
│   │   │       └── integrations/page.tsx # F9: Integrations hub
│   │   └── api/
│   │       ├── plan/
│   │       │   ├── parse/route.ts        # AI plan parsing endpoint
│   │       │   └── route.ts              # Plan CRUD
│   │       ├── task/route.ts             # Task CRUD + status updates
│   │       ├── social/
│   │       │   ├── publish/route.ts      # Post to social platforms
│   │       │   └── schedule/route.ts     # Schedule posts
│   │       ├── outreach/route.ts         # Send emails
│   │       ├── ai/
│   │       │   ├── suggest/route.ts      # AI content suggestions
│   │       │   └── explain/route.ts      # Plain-English explanations
│   │       ├── integrations/
│   │       │   ├── [platform]/callback/route.ts  # OAuth callbacks
│   │       │   └── route.ts              # Integration management
│   │       └── webhooks/
│   │           └── scheduled/route.ts     # Cron jobs (digests, reminders)
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── dashboard/
│   │   │   ├── TodaysFocus.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── QuickStats.tsx
│   │   │   └── UpcomingTasks.tsx
│   │   ├── task/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── StepWizard.tsx
│   │   │   ├── CompletionCelebration.tsx
│   │   │   └── GuidancePanel.tsx
│   │   ├── social/
│   │   │   ├── PostComposer.tsx
│   │   │   ├── PlatformPreview.tsx
│   │   │   └── CalendarView.tsx
│   │   ├── outreach/
│   │   │   ├── EmailComposer.tsx
│   │   │   ├── ContactList.tsx
│   │   │   └── TemplateSelector.tsx
│   │   ├── content/
│   │   │   ├── ContentEditor.tsx
│   │   │   ├── SeoChecker.tsx
│   │   │   └── OutlineBuilder.tsx
│   │   ├── plan/
│   │   │   ├── PhaseTimeline.tsx
│   │   │   ├── PlanImporter.tsx
│   │   │   └── TaskList.tsx
│   │   └── shared/
│   │       ├── Navigation.tsx    # Bottom nav (mobile) / sidebar (desktop)
│   │       ├── StreakBadge.tsx
│   │       ├── AiSuggestButton.tsx
│   │       └── PlainEnglishTooltip.tsx
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── parsePlan.ts     # Claude API: markdown → structured plan
│   │   │   ├── suggestContent.ts # Claude API: generate suggestions
│   │   │   └── explainTerm.ts   # Claude API: plain-English definitions
│   │   ├── integrations/
│   │   │   ├── twitter.ts
│   │   │   ├── linkedin.ts
│   │   │   ├── gmail.ts
│   │   │   ├── plausible.ts
│   │   │   └── shopify.ts
│   │   ├── db.ts                # Prisma client
│   │   ├── auth.ts              # Auth helpers
│   │   └── utils.ts             # Shared utilities
│   │
│   └── styles/
│       └── globals.css          # Tailwind base + custom styles
│
├── public/
│   ├── icons/                   # Platform icons, category icons
│   └── animations/              # Lottie files for celebrations
│
├── .env.local                   # Environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## UI/UX Design Specification

### Design Language
- **Aesthetic:** Clean, warm, friendly. NOT corporate. Think Notion meets Duolingo.
- **Colour palette:**
  - Primary: Soft blue (#3B82F6) — trust, calm, professional
  - Success: Green (#22C55E) — completions, progress
  - Warning: Amber (#F59E0B) — overdue, attention needed
  - Background: Off-white (#FAFAFA) with white cards
  - Text: Slate (#1E293B) primary, (#64748B) secondary
  - Accents per category:
    - Content: Purple (#8B5CF6)
    - Social: Sky (#0EA5E9)
    - SEO: Emerald (#10B981)
    - Outreach: Orange (#F97316)
    - Analytics: Indigo (#6366F1)
- **Typography:**
  - Headings: Inter (600-700 weight)
  - Body: Inter (400-500 weight)
  - Monospace: JetBrains Mono (for code snippets in guidance)
- **Border radius:** Generous (12-16px for cards, 8px for buttons)
- **Shadows:** Subtle, layered (sm for cards, md for modals)
- **Spacing:** Generous whitespace. Never cramped.

### Navigation Pattern

**Mobile (primary):**
```
┌─────────────────────────────┐
│         App Content          │
│                              │
│                              │
├──────┬──────┬──────┬────────┤
│  🏠  │  📋  │  ✍️  │  📊   │
│ Home │ Plan │  Do  │ Stats  │
└──────┴──────┴──────┴────────┘
```
- Bottom tab bar with 4 tabs
- Home = Dashboard, Plan = Phases/Tasks, Do = Social/Outreach/Content (action hub), Stats = Progress
- Floating action button for quick-add (new post, new contact, new draft)

**Desktop:**
- Left sidebar with same navigation
- Wider layout uses 2-column where appropriate (task list + detail)
- Sidebar collapses to icons on smaller screens

### Key Interaction Patterns

1. **Task completion** — Tap checkbox → checkmark animates in → confetti burst → card slides away → next task appears
2. **AI suggestions** — Blue sparkle button → loading shimmer → suggestion appears in-place with "Use this" / "Try another" / "Edit"
3. **Progress updates** — Number counters animate up, progress bars fill smoothly
4. **Phase transitions** — Full-screen celebration when completing a phase: "Phase 1 Complete! 🎉 You've built your foundation."
5. **Empty states** — Friendly illustrations + clear call to action. Never a blank screen.
6. **Error states** — Warm, human language. "That didn't work — here's what to try" not "Error 500"

### Responsive Breakpoints
- Mobile: < 768px (primary experience)
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## AI Integration Detail

### Plan Parser (Core Feature)

**Prompt strategy for Claude API:**

When a user pastes their marketing plan, send it to Claude with a system prompt like:

```
You are a marketing plan parser. Given a marketing plan document, extract
structured data. Return JSON with this schema:

{
  "title": "Plan title",
  "phases": [
    {
      "title": "Phase name",
      "description": "What this phase achieves",
      "estimatedWeeks": 2,
      "tasks": [
        {
          "title": "Task name (imperative verb, under 60 chars)",
          "description": "Plain English explanation (2-3 sentences, no jargon)",
          "whyItMatters": "One sentence: why a non-marketer should care",
          "category": "seo|content|social|outreach|analytics|website|advertising|admin",
          "type": "actionable|strategic|recurring",
          "priority": "high|medium|low",
          "estimatedMinutes": 15,
          "dependsOn": ["title of dependency task"],
          "externalTool": "twitter|google|shopify|null",
          "recurrence": null | { "frequency": "weekly", "dayOfWeek": 1 },
          "steps": [
            {
              "instruction": "Step description in plain English",
              "type": "info|input|action|review"
            }
          ],
          "guidance": {
            "plainEnglish": "Explain like I'm a jeweler, not a marketer",
            "commonMistakes": ["Don't forget to..."],
            "exampleOutput": "What good looks like"
          },
          "template": "Pre-filled content if applicable"
        }
      ]
    }
  ],
  "personas": [...],
  "keywords": [...],
  "metrics": [...]
}

Rules:
- Every task title must start with a verb (Write, Create, Set up, Connect, etc.)
- Every description must be understandable by someone who has never done marketing
- Replace all jargon with plain language
- Estimate time conservatively (most tasks: 10-30 mins)
- Mark dependencies accurately (you can't "schedule social posts" before "connect social accounts")
- Group related tasks into logical phases
- Separate one-time tasks from recurring tasks
```

### Content Suggestion Engine

Used throughout the app when user taps "AI Suggest":
- **Social posts:** Given business context + topic, generate platform-appropriate copy
- **Email drafts:** Given template + contact info, personalise the email
- **Blog outlines:** Given topic + keywords, generate H2 structure with key points
- **Meta descriptions:** Given page content, suggest SEO-friendly description
- **Explain this:** Given a marketing term, explain in plain English with an analogy

### AI Cost Management
- Cache common explanations (glossary terms don't need real-time AI)
- Use Haiku for simple tasks (explanations, short suggestions)
- Use Sonnet for complex tasks (plan parsing, long-form content)
- Rate limit: ~20 AI suggestions per day on free tier, unlimited on paid

---

## Authentication & Onboarding Flow

### First-Time User Flow
```
1. Landing page → "Get Started Free" button
2. Magic link email (or Google sign-in)
3. Welcome screen: "Let's set up your marketing companion"
4. Business context (3 quick questions):
   - What's your business name?
   - What do you do? (dropdown: online store, local service, SaaS, etc.)
   - What's your website URL? (optional)
5. Plan import:
   - "Do you have a marketing plan?"
     → Yes: Paste or upload
     → No: "No problem! Answer a few questions and we'll create one"
       → 5-question guided builder → AI generates a starter plan
6. Dashboard with first task highlighted
```

**Time to value: Under 3 minutes.**

---

## Monetisation (Future)

### Free Tier
- 1 marketing plan
- 50 tasks
- 10 AI suggestions per day
- Basic progress tracking
- No integrations

### Pro ($14.99/mo)
- Unlimited plans
- Unlimited tasks
- Unlimited AI suggestions
- All integrations (social, email, analytics)
- Content calendar
- Email outreach tool
- Weekly progress digests
- Priority support

### Team ($29.99/mo)
- Everything in Pro
- 5 team members
- Shared plans
- Task assignment
- Team progress dashboard

---

## MVP Scope (Phase 1 Build)

**Build these features first (4-6 week sprint):**

1. ✅ Auth (magic link via Supabase)
2. ✅ Plan import (paste markdown → AI parse → structured tasks)
3. ✅ Dashboard (today's focus, progress bar, quick stats)
4. ✅ Task execution view (guided steps, mark complete)
5. ✅ Phase timeline (see all phases, expand to see tasks)
6. ✅ Basic guidance (inline explanations, no separate library yet)
7. ✅ Progress tracking (completion %, streak)
8. ✅ Mobile-responsive design

**Defer to Phase 2:**
- Social media composer + publishing
- Email outreach tool
- Content workshop
- Integrations (OAuth connections)
- Analytics import
- Guided plan builder (for users without a plan)
- Weekly digest emails
- Team features

**Defer to Phase 3:**
- Canva integration
- Video walkthroughs
- AI-powered plan generation from scratch
- White-label option
- API for third-party integrations

---

## Development Sequence (MVP)

### Week 1: Foundation
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind + shadcn/ui
- [ ] Set up Supabase (auth + database)
- [ ] Define Prisma schema (Plan, Phase, Task, UserProgress)
- [ ] Run migrations
- [ ] Build auth flow (magic link + Google)
- [ ] Build root layout with navigation shell

### Week 2: Plan Ingestion
- [ ] Build PlanImporter component (paste area + file upload)
- [ ] Build AI plan parser (Claude API integration)
- [ ] Build plan storage (save parsed plan to DB)
- [ ] Build plan overview page (phase timeline)
- [ ] Build phase detail page (task list)
- [ ] Handle edge cases (empty plan, parsing errors, very large plans)

### Week 3: Task Execution
- [ ] Build TaskCard component
- [ ] Build StepWizard component (guided step-by-step)
- [ ] Build GuidancePanel (plain-English help)
- [ ] Build task completion flow (status update + animation)
- [ ] Build AI suggest button (inline content suggestions)
- [ ] Build task dependency logic (unlock next tasks)

### Week 4: Dashboard & Progress
- [ ] Build Dashboard page (TodaysFocus, ProgressRing, QuickStats, UpcomingTasks)
- [ ] Build task selection algorithm (which task to show as "Today's Focus")
- [ ] Build streak tracking logic
- [ ] Build phase completion celebrations
- [ ] Build CompletionCelebration component (confetti, animations)

### Week 5: Polish & Mobile
- [ ] Mobile-first responsive pass on all pages
- [ ] Bottom navigation bar for mobile
- [ ] Empty states for all views
- [ ] Error states and loading skeletons
- [ ] Onboarding flow (welcome → business context → import)
- [ ] Performance optimization (lazy loading, image optimization)

### Week 6: Testing & Launch
- [ ] End-to-end testing with real marketing plan
- [ ] Fix bugs and edge cases
- [ ] Set up Vercel deployment
- [ ] Set up error monitoring (Sentry)
- [ ] Write landing page
- [ ] Soft launch

---

## Reference: Marketing Plan Structure (Real Example)

The marketing plan that inspired this app (MARKETING-PLAN.md) has this structure. The parser should handle all of these patterns:

**14 sections:**
1. Executive Summary (prose + bullets)
2. Positioning Audit (prose + table with columns: Area, Strength, Weakness, Impact, Fix Effort)
3. Target Personas (narrative per persona with JTBD)
4. Competitive Landscape (comparison table)
5. Channel Strategy (6 subsections with mixed prose, checklists, tables)
6. Funnel Design (ASCII flowcharts + tactics)
7. Website Improvements (numbered audit items)
8. Content Calendar (8-week table: Week, Article 1, Article 2)
9. Lead Magnets (structured specs: format, promise, CTA)
10. Service Packaging (hero + deliverables + CTA per package)
11. Outreach Templates (3 email templates with variables)
12. Measurement System (event lists + KPI lists)
13. Budget Scenarios (3 tiers: Low/Medium/High)
14. Phased Roadmap (5 phases with `- [ ]` checkbox tasks)

**Task types found:**
- One-time technical (add sitemap.xml)
- One-time creative (write a blog post)
- Recurring (post on social media weekly)
- Research (identify 20 agencies to contact)
- Strategic (define positioning for X market)
- Setup (connect Google Analytics)

**External tools referenced:**
- Plausible, GA4, ConvertKit, Buttondown, Shopify, Reddit, Hacker News, Twitter/X, DEV.to, Discord, Google Business Profile, Canva

---

## Key Design Decisions & Rationale

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js | SSR + React + API routes in one package |
| Database | PostgreSQL (Supabase) | Relational model fits, free tier generous, auth included |
| AI | Claude API | Best at understanding nuanced text, great at structured output |
| Auth | Magic link (primary) | Zero friction, no password to forget, works on mobile |
| Styling | Tailwind + shadcn/ui | Fastest to build, consistent, accessible by default |
| Mobile approach | Responsive web app | No app store approval needed, instant updates, cross-platform |
| Deployment | Vercel | Zero-config for Next.js, free tier, global CDN |
| State | Server components + Zustand | Minimal client state, most data server-rendered |

---

## Success Metrics

- **Activation:** User imports plan and completes first task within 10 minutes
- **Retention:** 40%+ weekly active users after 4 weeks
- **Completion:** Average user completes 60%+ of their plan
- **NPS:** 50+ (users would recommend to others)
- **Time to value:** Under 3 minutes from signup to seeing their structured plan

---

## Open Questions (For Builder to Decide)

1. **App name** — "Marketing Companion" is a working title. Consider: "LaunchPad", "MarketMate", "PlanPilot", "GrowthMap", "NextStep"
2. **Plan format flexibility** — Should the AI parser handle wildly different plan formats, or should we provide a template?
3. **Offline support** — PWA with service worker for mobile use, or online-only for MVP?
4. **Multi-language** — English only for MVP, or plan for i18n from the start?
5. **White-label potential** — Could marketing agencies use this for their clients? (Affects data model)

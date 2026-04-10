# 70 -- App Build Playbook

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Coding Standards](71-coding-standards.md) | [Design Standards](72-design-standards.md) | [GDPR Compliance](73-gdpr-compliance.md) | [Claude Code Conventions](74-claude-code-conventions.md) | [Shopify Submission Runbook](../operations/42-shopify-submission-runbook.md)

---

## Overview

This is the canonical build process for all JMS Dev Lab applications. Every app -- whether Shopify embedded, standalone web SaaS, or mobile -- follows this 9-phase lifecycle. The process is designed for a solo developer (John Moore) working with Claude Code as the primary development assistant.

Each phase has a corresponding set of Claude Code prompts (24 in total) that can be executed sequentially to build a complete, production-ready application from concept to launch.

---

## Phase 1: Concept (Prompts 1-3)

**Goal:** Validate the idea, identify the market, and define positioning before writing any code.

### Activities

1. **Market Research** -- Analyse the Shopify App Store (or target platform) for competing apps. Document:
   - Direct competitors (same problem space)
   - Indirect competitors (adjacent solutions)
   - Pricing benchmarks across the category
   - Review sentiment (what users complain about in existing apps)

2. **Gap Analysis** -- Identify underserved niches or feature gaps using the APP-GAP-PROMPTS methodology:
   - Search for categories with fewer than 10 apps
   - Look for apps with low ratings but high install counts (unmet demand)
   - Check for missing integrations that merchants request

3. **Positioning Statement** -- Define the app's unique angle:
   - One-sentence value proposition
   - Target merchant profile (industry, size, geography)
   - Pricing tier strategy (Starter / Professional / Enterprise, 14-day trial, no free tier)
   - Differentiation from top 3 competitors

### Deliverables

- [ ] Market research document
- [ ] Competitor matrix (features vs. pricing)
- [ ] Positioning statement
- [ ] Initial pricing tiers

### Claude Code Prompts

- **Prompt 1:** Market research and competitor analysis
- **Prompt 2:** Gap identification and opportunity sizing
- **Prompt 3:** Positioning document and feature prioritisation

---

## Phase 2: Architecture (Prompts 4-6)

**Goal:** Set up the monorepo structure, choose the tech stack, and define the data model.

### Activities

1. **Monorepo Initialisation** -- Standard structure:
   ```
   app-name/
   ├── apps/
   │   ├── shopify/     # Shopify embedded frontend (React + Polaris)
   │   ├── web/         # Standalone web SaaS (Next.js or React)
   │   └── backend/     # API server (Express or NestJS)
   ├── packages/
   │   └── shared/      # Shared types, utils, constants
   ├── package.json     # Root workspace config
   ├── tsconfig.json    # Root TypeScript config (strict mode)
   └── CLAUDE.md        # Per-project Claude Code instructions
   ```

2. **Tech Stack Decisions** -- Based on app requirements:
   - Backend: Express (simpler apps) or NestJS (complex apps with DI needs)
   - ORM: Prisma (PostgreSQL on Railway) or Mongoose (MongoDB)
   - Frontend: React with Polaris (Shopify), Next.js (standalone web)
   - State management: TanStack Query (server state) + Zustand (client state)
   - Auth: Shopify session tokens (embedded) + Google OAuth (web SaaS)

3. **Data Model Design** -- Schema for the core domain:
   - Prisma schema or Mongoose models
   - Shopify data mapping (shop, products, orders as needed)
   - Multi-tenant design (shop-scoped data isolation)

### Deliverables

- [ ] Monorepo scaffolded with all workspace packages
- [ ] TypeScript strict mode configured
- [ ] Database schema defined
- [ ] CLAUDE.md created with project-specific instructions

### Claude Code Prompts

- **Prompt 4:** Monorepo scaffold and workspace configuration
- **Prompt 5:** Database schema design and ORM setup
- **Prompt 6:** Shared package types and utilities

---

## Phase 3: Backend (Prompts 7-10)

**Goal:** Build the API server with authentication, Shopify integration, and core business logic.

### Activities

1. **Server Setup** -- Express or NestJS application:
   - Middleware stack: CORS, helmet, rate limiting, request logging
   - Error handling: Centralised error middleware with typed error classes
   - Health check endpoint: `GET /health`

2. **Authentication Layer:**
   - Shopify session token verification (for embedded app requests)
   - Google OAuth flow (for standalone web SaaS users)
   - JWT token management and refresh logic
   - Shop-scoped middleware (ensure data isolation per shop)

3. **Shopify Integration:**
   - App installation flow (OAuth callback)
   - Webhook registration (orders, products, app/uninstalled as needed)
   - Billing API integration (create subscription, check active plan)
   - App Bridge token exchange

4. **Core Business Logic:**
   - Domain-specific API endpoints
   - Input validation (Zod schemas)
   - Database queries via Prisma/Mongoose
   - Background job processing if needed

### Deliverables

- [ ] API server running locally
- [ ] Auth flows working (Shopify + Google OAuth)
- [ ] Core CRUD endpoints implemented
- [ ] Shopify webhooks registered and handling events
- [ ] Rate limiting and error handling in place

### Claude Code Prompts

- **Prompt 7:** Express/NestJS server with middleware stack
- **Prompt 8:** Shopify OAuth and session management
- **Prompt 9:** Core business logic endpoints
- **Prompt 10:** Webhook handlers and billing integration

---

## Phase 4: Frontend (Prompts 11-14)

**Goal:** Build the user interface for both Shopify embedded and standalone web experiences.

### Activities

1. **Shopify Embedded App (apps/shopify):**
   - Polaris design system components
   - App Bridge integration for navigation, modals, toasts
   - Responsive layout (works in Shopify admin on all devices)
   - Plan-gated features (check subscription tier)

2. **Standalone Web App (apps/web):**
   - React or Next.js application
   - Custom design system (JMS Dev Lab branding where appropriate)
   - Google OAuth sign-in flow
   - Same core functionality as embedded, different shell

3. **Shared UI Patterns:**
   - Loading states (skeleton screens, spinners)
   - Empty states (helpful messaging with CTAs)
   - Error states (retry buttons, support contact)
   - Data tables with sorting, filtering, pagination
   - Form validation with inline error messages

4. **State Management:**
   - TanStack Query for all server data (caching, refetching, optimistic updates)
   - Zustand for client-only state (UI state, form drafts)
   - No Redux -- keep it simple

### Deliverables

- [ ] Shopify embedded app with all core screens
- [ ] Web SaaS app with matching functionality
- [ ] All screens have loading, empty, and error states
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1024px+)

### Claude Code Prompts

- **Prompt 11:** Shopify embedded app shell and navigation
- **Prompt 12:** Core feature screens (Polaris components)
- **Prompt 13:** Standalone web app with Google OAuth
- **Prompt 14:** Shared components and state management

---

## Phase 5: Integration (Prompts 15-16)

**Goal:** Wire up Shopify-specific features: App Bridge, billing, and GDPR compliance.

### Activities

1. **Shopify App Bridge:**
   - Navigation bar integration
   - Toast notifications (success, error)
   - Modal dialogs (confirmation, forms)
   - Resource picker (products, collections)
   - Redirect helpers

2. **Billing Integration:**
   - Subscription plan creation via Shopify Billing API
   - Plan selection screen with feature comparison
   - Upgrade/downgrade flow
   - 14-day free trial activation
   - Grace period handling

3. **GDPR Webhooks (Mandatory):**
   - `customers/data_request` -- Return stored customer data
   - `customers/redact` -- Delete customer personal data
   - `shop/redact` -- Clean up all shop data after uninstall
   - See [GDPR Compliance](73-gdpr-compliance.md) for full requirements

### Deliverables

- [ ] App Bridge working for navigation and UI
- [ ] Billing plans created and subscription flow tested
- [ ] All 3 GDPR webhooks implemented and verified
- [ ] 14-day trial enforced (no free tier)

### Claude Code Prompts

- **Prompt 15:** App Bridge integration and billing flow
- **Prompt 16:** GDPR webhooks and data compliance

---

## Phase 6: Quality (Prompts 17-19)

**Goal:** Comprehensive testing to catch bugs before submission.

### Activities

1. **Unit Tests:**
   - Business logic functions (calculations, transformations)
   - Utility functions in packages/shared
   - API route handlers (mocked database)
   - Minimum coverage target: 80% on business logic

2. **Integration Tests:**
   - API endpoint testing with real database (test database)
   - Shopify webhook payload processing
   - Authentication flows (valid/invalid tokens)
   - Billing state transitions

3. **End-to-End Tests (Playwright):**
   - Installation flow on development store
   - Core user journeys (create, read, update, delete)
   - Plan upgrade/downgrade
   - Settings persistence across page reloads
   - Responsive testing (mobile, tablet, desktop viewports)

4. **Test Plan Document:**
   - Written test plan for Shopify reviewers
   - Development store credentials
   - Step-by-step testing instructions
   - Known limitations documented

### Deliverables

- [ ] Unit test suite passing
- [ ] Integration test suite passing
- [ ] Playwright e2e tests for critical paths
- [ ] Test plan document ready for Shopify submission

### Claude Code Prompts

- **Prompt 17:** Unit tests for business logic and utilities
- **Prompt 18:** Integration tests for API endpoints
- **Prompt 19:** Playwright e2e tests and test plan document

---

## Phase 7: Polish (Prompts 20-21)

**Goal:** Add the finishing touches that differentiate a professional app from a prototype.

### Activities

1. **Guided Tour / Onboarding:**
   - First-run experience using react-joyride or nextstepjs
   - Step-by-step walkthrough of key features
   - Restartable from Settings page
   - Skip option for experienced users

2. **Demo Mode:**
   - Sample data pre-loaded for new installs
   - Clear labelling that data is demo/sample
   - One-click removal of demo data
   - Useful for Shopify reviewers testing the app

3. **Edge Case States:**
   - Every screen must handle: Loading, Empty, Error
   - Network failure recovery (retry buttons)
   - Session expiry handling (re-auth prompt)
   - Large dataset performance (pagination, virtual scrolling)

4. **Branding:**
   - "Made by JMS Dev Lab" footer on all screens
   - App icon 1200x1200px
   - Consistent colour scheme within the app

### Deliverables

- [ ] Guided tour implemented and restartable
- [ ] Demo mode with sample data
- [ ] All edge case states handled
- [ ] JMS Dev Lab branding applied

### Claude Code Prompts

- **Prompt 20:** Guided tour and onboarding wizard
- **Prompt 21:** Demo mode, edge states, and branding polish

---

## Phase 8: Pre-Submission (Prompts 22-23)

**Goal:** Prepare everything needed for Shopify App Store submission.

### Activities

1. **Shopify App Store Listing:**
   - App name and tagline
   - Detailed description (benefits, not just features)
   - Key benefits (3-5 bullet points)
   - Category selection
   - Pricing plan descriptions

2. **Required Assets:**
   - App icon: 1200x1200px PNG
   - Screenshots: Desktop and mobile (annotated with callouts)
   - Screencast video: 2-3 minute walkthrough
   - Promotional video (YouTube): Feature highlights

3. **Compliance Checklist:**
   - Privacy policy URL (hosted on app website)
   - GDPR webhooks verified working
   - No hardcoded geographic assumptions (or documented as intentional, e.g., TaxMatch is US-only)
   - Settings persist across page navigation
   - No console errors in browser dev tools
   - All API endpoints return proper error codes
   - Rate limiting in place

4. **App Website:**
   - Marketing landing page
   - Features overview
   - Pricing page
   - Privacy policy
   - Terms of service
   - Contact/support information

### Deliverables

- [ ] App listing draft complete
- [ ] All required assets created
- [ ] Compliance checklist passed
- [ ] App website live

### Claude Code Prompts

- **Prompt 22:** App listing copy and asset preparation
- **Prompt 23:** Pre-submission compliance audit

---

## Phase 9: Launch (Prompt 24)

**Goal:** Submit to Shopify and manage the review process.

### Activities

1. **Submission:**
   - Submit via Shopify Partners dashboard
   - Include test plan document
   - Provide development store with test data
   - Attach all required assets

2. **Review Management:**
   - Monitor email for reviewer feedback
   - **14-day response window** -- Shopify gives 14 days to respond to review feedback
   - Common rejection reasons (see [Shopify Submission Runbook](../operations/42-shopify-submission-runbook.md)):
     - 4.3.8: Geographic requirements not documented
     - 2.1.2: UI bugs or broken flows
     - GDPR: Missing or non-functional webhooks
     - Settings not persisting

3. **Post-Launch:**
   - Monitor app store listing analytics
   - Set up Shopify app review notifications
   - Respond to merchant reviews promptly
   - Plan first update based on reviewer/merchant feedback

### Deliverables

- [ ] App submitted to Shopify
- [ ] Review feedback addressed within 14 days
- [ ] App published on Shopify App Store

### Claude Code Prompt

- **Prompt 24:** Submit, monitor, and respond to review

---

## 24-Prompt Sequence Summary

| # | Phase | Prompt Purpose |
|---|-------|---------------|
| 1 | Concept | Market research and competitor analysis |
| 2 | Concept | Gap identification and opportunity sizing |
| 3 | Concept | Positioning document and feature prioritisation |
| 4 | Architecture | Monorepo scaffold and workspace configuration |
| 5 | Architecture | Database schema design and ORM setup |
| 6 | Architecture | Shared package types and utilities |
| 7 | Backend | Express/NestJS server with middleware stack |
| 8 | Backend | Shopify OAuth and session management |
| 9 | Backend | Core business logic endpoints |
| 10 | Backend | Webhook handlers and billing integration |
| 11 | Frontend | Shopify embedded app shell and navigation |
| 12 | Frontend | Core feature screens (Polaris components) |
| 13 | Frontend | Standalone web app with Google OAuth |
| 14 | Frontend | Shared components and state management |
| 15 | Integration | App Bridge integration and billing flow |
| 16 | Integration | GDPR webhooks and data compliance |
| 17 | Quality | Unit tests for business logic and utilities |
| 18 | Quality | Integration tests for API endpoints |
| 19 | Quality | Playwright e2e tests and test plan document |
| 20 | Polish | Guided tour and onboarding wizard |
| 21 | Polish | Demo mode, edge states, and branding polish |
| 22 | Pre-Submission | App listing copy and asset preparation |
| 23 | Pre-Submission | Pre-submission compliance audit |
| 24 | Launch | Submit, monitor, and respond to review |

---

## Notes

- This playbook assumes TypeScript strict mode throughout. See [Coding Standards](71-coding-standards.md).
- Every app should support both Shopify embedded and standalone web SaaS modes where applicable.
- No free tier on any app. 14-day trial only. See pricing policy in [Business Overview](../business/01-business-overview.md).
- The 24-prompt sequence is designed for Claude Code execution. Each prompt builds on the output of the previous one.

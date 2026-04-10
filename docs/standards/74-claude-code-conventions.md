# 74 -- Claude Code Conventions

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [App Build Playbook](70-app-build-playbook.md) | [Coding Standards](71-coding-standards.md)

---

## Overview

Claude Code is the primary development assistant for all JMS Dev Lab projects. John Moore works with Claude Code to build, maintain, and deploy all applications. This document defines the conventions, rules, and patterns for working with Claude Code across the portfolio.

---

## 1. Absolute Rules

### NEVER use `killall`

This command is **strictly forbidden** in all contexts, all projects, without exception.

This rule is enforced via `CLAUDE.md` in the root of the JMS Dev Lab project and must be present in every per-project `CLAUDE.md` file.

**Why:** The `killall` command can terminate critical processes beyond the intended target. As a solo developer running multiple services locally, an accidental `killall node` could bring down development servers, database connections, and background processes simultaneously.

### No Secrets in Output

- Never display API keys, passwords, or tokens in Claude Code output.
- When working with `.env` files, reference variable names only.
- If a secret is accidentally displayed, flag it immediately for rotation.

---

## 2. Per-Project CLAUDE.md Files

Every app project must have a `CLAUDE.md` file in its root directory. This file provides Claude Code with project-specific context and rules.

### Required Contents

```markdown
# Project Rules

## Forbidden Commands
- **NEVER use `killall`** -- this command is strictly forbidden in all contexts

## Project Overview
- [Brief description of the app]
- [Tech stack summary]
- [Key directories and their purposes]

## Development Commands
- `npm run dev` -- Start development server
- `npm run build` -- Build for production
- `npm run test` -- Run test suite
- [Other project-specific commands]

## Deployment
- [Platform: Railway/Vercel/Cloudflare Pages]
- [Deploy command or process]

## Important Notes
- [Project-specific gotchas]
- [Known issues]
- [Conventions that differ from standard]
```

### Existing CLAUDE.md Files

The following projects should have (or do have) their own `CLAUDE.md`:

| Project | Path | Status |
|---------|------|--------|
| JMS Dev Lab (root) | `C:\JM Programs\JMS Dev Lab\CLAUDE.md` | Active |
| SmartCash | `C:\JM Programs\CashFlowAppV2\CLAUDE.md` | Check |
| Jewel Value | `C:\JM Programs\Valuation App\jewel-value\CLAUDE.md` | Check |
| RepairDesk | `C:\JM Programs\Repair Desk\CLAUDE.md` | Check |
| StaffHub | `C:\JM Programs\Staff Hub\CLAUDE.md` | Check |
| GrowthMap | `C:\JM Programs\marketingapp\CLAUDE.md` | Check |
| JewelryStudioManager | `C:\JM Programs\Custom Design Tool - Customer Manager\CLAUDE.md` | Check |
| Pitch Side | `C:\JM Programs\Football Coaching App\CLAUDE.md` | Check |
| ProfitShield | `C:\JM Programs\ProfitShield\CLAUDE.md` | Check |
| QualCanvas | TBD | Check |
| TaxMatch | `C:\JM Programs\TaxMatch\CLAUDE.md` | Check |
| SpamShield | `C:\JM Programs\SpamShield\CLAUDE.md` | Check |
| ThemeSweep | `C:\JM Programs\themesweep\CLAUDE.md` | Check |

---

## 3. Permitted Commands

### JMS Dev Lab Website Project

The following commands are explicitly permitted in the JMS Dev Lab project:

```
npx wrangler pages deploy . --project-name=jmsdevlab
npx wrangler:*
```

These are for deploying the JMS Dev Lab website to Cloudflare Pages.

### General Permitted Patterns

| Command | Context | Notes |
|---------|---------|-------|
| `npm run dev` | All projects | Start development server |
| `npm run build` | All projects | Build for production |
| `npm run test` | All projects | Run tests |
| `npx prisma migrate dev` | Projects with Prisma | Database migrations |
| `npx prisma studio` | Projects with Prisma | Database GUI |
| `npx playwright test` | Projects with Playwright | E2E tests |
| `git` commands | All projects | Version control |
| `npx wrangler` | JMS Dev Lab website | Cloudflare deployment |

### Explicitly Forbidden

| Command | Reason |
|---------|--------|
| `killall` | Absolute rule -- can terminate critical processes |
| `rm -rf /` | Obviously destructive |
| `git push --force` on main/master | Risk of losing history |
| Any command that exposes secrets | Security |

---

## 4. Memory System

Claude Code uses a file-based memory system to persist context across conversations. Memory files are stored in:

```
C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\
```

### Memory File Categories

| File | Purpose |
|------|---------|
| `user_profile_complete.md` | John Moore's personal details, career history, skills |
| `user_personality.md` | Personality traits (shy, avoids public-facing marketing) |
| `user_background.md` | Moores Jewellers background, jewelry industry expertise |
| `business_jmsdevlab.md` | JMS Dev Lab business details, tax, email, infrastructure |
| `business_moores_jewellers.md` | Moores Jewellers retail business (closing ~May 2026) |
| `apps_portfolio.md` | All 12 apps: status, pricing, URLs, tech stack, audit scores |
| `project_vegrify_rfq.md` | Vegrify MVP contract details |
| `project_leo_deferred.md` | LEO outreach deferred until Moores closes |
| `project_indexing_requests.md` | Google Search Console indexing tracker |
| `session_20260323_platforms.md` | Platform setup session notes |
| `feedback_free_only.md` | No paid upgrades until business has income |
| `feedback_jhj_facebook.md` | JHJ Facebook group rules |
| `feedback_linkedin_wait.md` | LinkedIn deferred until Moores Jewellers closed |
| `reference_email_john.md` | Email configuration details |

### Memory Rules

- Memory files are point-in-time snapshots -- they may be outdated.
- Always verify memory claims against current code/files.
- Memory files use frontmatter (YAML) with `name`, `description`, and `type` fields.
- Do not store secrets, passwords, or API keys in memory files.

---

## 5. 24-Prompt Build Sequence

The App Build Playbook defines a sequence of 24 Claude Code prompts that build a complete app from concept to launch. See [App Build Playbook](70-app-build-playbook.md) for the full sequence.

### How to Use

1. Start a new Claude Code session for each prompt (or continue if context is still relevant).
2. Provide the prompt number and purpose.
3. Claude Code executes the prompt, writing code and documentation.
4. Review the output before moving to the next prompt.
5. Each prompt builds on the previous one -- they must be executed in order.

### Prompt Mapping

| Prompts | Phase | Description |
|---------|-------|-------------|
| 1-3 | Concept | Market research, gap analysis, positioning |
| 4-6 | Architecture | Monorepo setup, schema, shared packages |
| 7-10 | Backend | Server, auth, business logic, webhooks |
| 11-14 | Frontend | Shopify embedded, web SaaS, state management |
| 15-16 | Integration | App Bridge, billing, GDPR |
| 17-19 | Quality | Unit tests, integration tests, Playwright e2e |
| 20-21 | Polish | Guided tour, demo mode, edge states |
| 22-23 | Pre-Submission | App listing, compliance audit |
| 24 | Launch | Submit and manage review |

---

## 6. Conversation Conventions

### Starting a Session

When starting a Claude Code session for a JMS Dev Lab project:

1. Claude Code reads the project's `CLAUDE.md` for project-specific rules.
2. Claude Code accesses memory files for business context.
3. The user provides the task or prompt number.

### During Development

- **Be explicit about file paths.** Always use absolute paths on Windows (e.g., `C:\JM Programs\CashFlowAppV2\apps\backend\src\index.ts`).
- **Confirm destructive operations.** Before deleting files, resetting databases, or force-pushing, confirm with John.
- **No fake data.** Never generate placeholder testimonials, fake reviews, or fabricated metrics. All content must be real.
- **No free tiers.** All apps use 14-day trials. Do not implement or suggest free tiers (JMS Dev Lab cannot afford to support free users).

### Code Generation Preferences

- TypeScript strict mode always.
- Prefer named exports over default exports.
- Use Zod for validation.
- Use TanStack Query for data fetching.
- Use Zustand for client state.
- Polaris for Shopify UIs.
- Express for backend (unless NestJS is already in use).
- Prisma for PostgreSQL.

---

## 7. Security Practices with Claude Code

### Secret Management

- Never display `.env` file contents in full.
- When debugging environment issues, reference variable names: "Check that `DATABASE_URL` is set correctly."
- If a secret is accidentally exposed in Claude Code output, immediately:
  1. Rotate the secret.
  2. Check `.gitignore` to ensure `.env` is excluded.
  3. If committed to git, use `git filter-branch` or BFG Repo Cleaner to remove from history.

### Learned Lessons

- **Commit 3a86f58** (JMS Dev Lab repo): Secrets were committed to git history. Had to remove tracked secrets, `.env.production`, and Playwright MCP logs. Updated `.gitignore` to prevent recurrence.
- **Commit 69b3f50**: Node modules with exposed API key were committed. Fixed by adding `.gitignore` and removing `node_modules`.

### Pre-Commit Checks

Before any `git add` or `git commit`, Claude Code should:

1. Verify `.gitignore` exists and covers `.env*`, `node_modules/`, etc.
2. Check staged files for potential secrets (API keys, passwords, tokens).
3. Never commit `.env` files, even `.env.example` with real values.

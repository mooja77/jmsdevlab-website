# 71 -- Coding Standards

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [App Build Playbook](70-app-build-playbook.md) | [Design Standards](72-design-standards.md) | [Claude Code Conventions](74-claude-code-conventions.md)

---

## Overview

These are the coding standards for all JMS Dev Lab projects. Every application, library, and script must follow these conventions unless there is a documented exception. Consistency across the portfolio (12 apps and growing) is critical for maintainability by a solo developer.

---

## 1. TypeScript

### Configuration

- **Strict mode everywhere.** Every `tsconfig.json` must include:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true,
      "forceConsistentCasingInFileNames": true,
      "esModuleInterop": true,
      "skipLibCheck": true
    }
  }
  ```
- **No `any` type.** Use `unknown` and narrow with type guards. If `any` is truly unavoidable, add a `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment with justification.
- **No `ts-ignore` or `ts-expect-error`** without an accompanying comment explaining why.
- **Path aliases** using `@/` prefix for project-internal imports:
  ```json
  {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
  ```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables, functions | camelCase | `getUserById`, `isActive` |
| Types, interfaces | PascalCase | `ShopSettings`, `OrderLine` |
| Enums | PascalCase (members UPPER_SNAKE) | `OrderStatus.PENDING` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Files (components) | PascalCase | `OrderList.tsx` |
| Files (utilities) | camelCase | `formatCurrency.ts` |
| Files (tests) | Match source + `.test` | `formatCurrency.test.ts` |

### Code Style

- Prefer `const` over `let`. Never use `var`.
- Prefer arrow functions for callbacks and inline functions.
- Use named exports (not default exports) for better refactoring support.
- Prefer early returns over nested conditionals.
- Maximum function length: ~50 lines. Extract helper functions for anything longer.
- Use template literals for string interpolation, not concatenation.

---

## 2. Monorepo Structure

### Standard Layout

```
app-name/
├── apps/
│   ├── shopify/          # Shopify embedded frontend
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── web/              # Standalone web SaaS
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── backend/          # API server
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── models/
│       │   └── index.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/           # Shared types, utils, constants
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── package.json          # Root workspace config
├── tsconfig.json         # Root TypeScript config
├── .gitignore
├── .env.example          # Template (never .env itself)
├── CLAUDE.md             # Claude Code project instructions
└── README.md
```

### Workspace Configuration

- **npm workspaces** (most apps) or **pnpm workspaces** (Jewel Value, apps using Turbo):
  ```json
  {
    "workspaces": ["apps/*", "packages/*"]
  }
  ```
- Shared package referenced via workspace protocol: `"@app-name/shared": "workspace:*"` (pnpm) or `"@app-name/shared": "*"` (npm).
- Each workspace package has its own `package.json` and `tsconfig.json`.

### Exceptions to Monorepo

Some older apps do not follow the monorepo pattern. These should be migrated when time permits:

| App | Current Structure | Migration Priority |
|-----|------------------|-------------------|
| RepairDesk | Express + TypeScript + Prisma (single package) | Medium |
| StaffHub | Express + MongoDB + React (separate repos) | Low (in review) |
| GrowthMap | Next.js single app | Low |

---

## 3. Backend

### Framework Choice

- **Express** -- Default for most apps. Lightweight, well-understood.
- **NestJS** -- Used for apps requiring dependency injection, decorators, or complex module organisation (e.g., Jewel Value).

### Project Structure (Express)

```
src/
├── index.ts              # Server entry point
├── app.ts                # Express app configuration
├── routes/
│   ├── index.ts          # Route aggregation
│   ├── shopify.routes.ts # Shopify-specific endpoints
│   └── api.routes.ts     # Core API endpoints
├── middleware/
│   ├── auth.ts           # Session/token verification
│   ├── errorHandler.ts   # Centralised error handling
│   ├── rateLimiter.ts    # Rate limiting
│   └── shopifyAuth.ts    # Shopify session verification
├── services/
│   ├── shopify.service.ts
│   └── billing.service.ts
├── models/               # Prisma client or Mongoose models
└── utils/
    ├── logger.ts
    └── validators.ts
```

### Middleware Stack (Order Matters)

1. `helmet()` -- Security headers
2. `cors()` -- CORS configuration
3. `express.json()` -- Body parsing (with size limit)
4. Rate limiter -- Per-route or global
5. Request logging -- Structured JSON logs
6. Auth middleware -- Per-route
7. Route handlers
8. Error handler -- Must be last

### Error Handling

- Use typed error classes:
  ```typescript
  class AppError extends Error {
    constructor(
      message: string,
      public statusCode: number,
      public code: string,
    ) {
      super(message);
    }
  }
  ```
- Centralised error middleware catches all thrown errors.
- Always return consistent error response shape:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Human-readable description",
      "details": {}
    }
  }
  ```
- Never leak stack traces in production.

### Rate Limiting

- Default: 100 requests per 15 minutes per IP.
- Shopify webhook endpoints: Higher limits (webhooks come in bursts).
- Authentication endpoints: Lower limits (10 per 15 minutes).
- Use `express-rate-limit` with Redis store in production, memory store in development.

### Database (Prisma)

- Schema lives in `apps/backend/prisma/schema.prisma`.
- All models scoped by `shopId` (multi-tenant isolation).
- Use migrations for schema changes: `npx prisma migrate dev`.
- Seed script for development and demo data.
- Connection pooling via Prisma's built-in connection pool.

### Database (Mongoose)

- Used only for StaffHub (MongoDB on Railway).
- Models in `src/models/` with TypeScript interfaces.
- Indexes defined in schema for query performance.

### Input Validation

- Use **Zod** for request body/query validation.
- Validate at the route handler level, before passing to services.
- Return 400 with specific field errors on validation failure.

---

## 4. Frontend

### Framework

- **React** -- All Shopify embedded apps and most standalone apps.
- **Next.js** -- Used for GrowthMap, Jewel Value web app, app marketing websites.
- **Polaris** -- Mandatory for all Shopify embedded app UIs.

### Component Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   ├── features/         # Feature-specific components
│   └── layouts/          # Page layouts
├── hooks/                # Custom React hooks
├── pages/                # Route-level components
├── services/             # API client functions
├── store/                # Zustand stores
├── types/                # TypeScript types
└── utils/                # Frontend utilities
```

### State Management

- **TanStack Query (React Query)** -- All server state (API data fetching, caching, mutations):
  ```typescript
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', shopId],
    queryFn: () => fetchOrders(shopId),
  });
  ```
- **Zustand** -- Client-only state (UI preferences, form drafts, modal state):
  ```typescript
  const useUIStore = create<UIState>((set) => ({
    sidebarOpen: false,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  }));
  ```
- **No Redux.** TanStack Query + Zustand covers all needs with less boilerplate.

### Polaris Usage (Shopify Apps)

- Use Polaris components exclusively within `apps/shopify`. Do not use custom CSS for standard UI patterns.
- Follow Shopify's design guidelines for layout, spacing, and interaction patterns.
- Use `AppProvider` at the root with the correct i18n translations.
- Use `Page`, `Layout`, `Card`, `DataTable`, `IndexTable` for standard layouts.

### API Client

- Centralise all API calls in `src/services/api.ts`.
- Use `fetch` or `axios` with a configured base URL.
- Include auth token in headers automatically.
- Type all request and response payloads.

---

## 5. Testing

### Strategy

| Level | What to Test | Tool | Coverage Target |
|-------|-------------|------|-----------------|
| Unit | Business logic, utilities, pure functions | Vitest or Jest | 80%+ on business logic |
| Integration | API endpoints, database operations | Vitest/Jest + Supertest | All CRUD operations |
| End-to-End | User journeys, critical paths | Playwright | Core flows (install, create, settings) |

### Unit Tests

- Co-locate test files with source: `formatCurrency.ts` / `formatCurrency.test.ts`.
- Test pure functions exhaustively (edge cases, boundary values).
- Mock external dependencies (database, API calls).
- Use descriptive test names: `it('returns formatted price with currency symbol for positive amounts')`.

### Integration Tests

- Use a test database (separate from dev/prod).
- Test the full request/response cycle through Express middleware.
- Verify auth middleware rejects unauthenticated requests.
- Test webhook signature verification.

### End-to-End Tests (Playwright)

- Test against a Shopify development store.
- Cover: Installation, onboarding, core feature CRUD, settings, plan upgrade.
- Run in CI before deployment (when CI is configured).
- See [Design Standards](72-design-standards.md) for viewport sizes to test.

### Test File Naming

```
src/utils/formatCurrency.ts        -> src/utils/formatCurrency.test.ts
src/routes/orders.routes.ts        -> src/routes/orders.routes.test.ts
e2e/                               -> e2e/installation.spec.ts
```

---

## 6. Git Conventions

### Repository Management

- All repos on **GitHub** under the `mooja77` account.
- All repos are **private** (no public repos for app source code).
- One repo per app (monorepo contains all workspaces for that app).

### Branching

- `main` or `master` -- Production branch. Always deployable.
- Feature branches: `feature/add-billing-flow`, `fix/settings-persistence`.
- No formal Git Flow -- solo developer, keep it simple.

### Commits

- Write meaningful commit messages. First line is a summary (imperative mood, under 72 chars).
- Examples:
  - `Add billing subscription flow with 14-day trial`
  - `Fix settings not persisting across page navigation`
  - `Implement GDPR customer data request webhook`
- **Never commit secrets.** No `.env` files, no API keys, no passwords in history.
  - Learned the hard way: commit `3a86f58` was a security cleanup after secrets were committed.
  - Always check `.gitignore` before first commit.

### .gitignore (Minimum)

```
node_modules/
.env
.env.*
!.env.example
dist/
build/
.next/
*.log
.DS_Store
```

---

## 7. Package Management

### Tool Selection

- **npm** -- Default for most apps. Uses `package-lock.json`.
- **pnpm** -- Used for apps with Turbo (Jewel Value). Uses `pnpm-lock.yaml`.
- Do not mix within a single project. Pick one and stick with it.

### Rules

- **Always commit the lockfile** (`package-lock.json` or `pnpm-lock.yaml`).
- Use exact versions for critical dependencies (Shopify API, Prisma).
- Use caret ranges (`^`) for non-critical dependencies.
- Run `npm audit` or `pnpm audit` periodically. Fix critical vulnerabilities.
- Prefer well-maintained packages with active communities. Avoid packages with no updates in 12+ months.

### Common Dependencies (Across Portfolio)

| Package | Purpose | Version Policy |
|---------|---------|---------------|
| `@shopify/shopify-api` | Shopify API client | Pin major |
| `@shopify/polaris` | UI components | Pin major |
| `@shopify/app-bridge-react` | App Bridge integration | Pin major |
| `prisma` / `@prisma/client` | Database ORM | Pin major |
| `express` | HTTP server | Pin major |
| `zod` | Validation | Caret range |
| `@tanstack/react-query` | Server state | Caret range |
| `zustand` | Client state | Caret range |
| `playwright` | E2E testing | Caret range |

---

## 8. Code Quality Tools

### Linting

- ESLint with TypeScript plugin.
- Extend `@typescript-eslint/recommended`.
- Shopify apps: Extend `@shopify/eslint-plugin` where available.

### Formatting

- Prettier with default settings (or project-specific overrides).
- Format on save in VS Code / Cursor.
- `.prettierrc`:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100
  }
  ```

### Pre-Commit

- Not currently enforced via hooks (solo developer).
- Consider adding Husky + lint-staged when any app reaches significant user base.

---

## 9. Environment Variables

### Rules

- **Never commit `.env` files.** Ever.
- Provide `.env.example` with all required variable names (no values).
- Document each variable's purpose in `.env.example`:
  ```
  # Shopify API credentials
  SHOPIFY_API_KEY=
  SHOPIFY_API_SECRET=

  # Database connection
  DATABASE_URL=

  # Railway/hosting
  PORT=3000
  ```
- Access via `process.env.VARIABLE_NAME` with validation at startup.
- Validate all required env vars exist on server boot. Fail fast if missing.

### Known Risk

Environment variables are **not systematically backed up** across all projects. This is a documented risk area. See [Backup and Recovery](../operations/44-backup-and-recovery.md).

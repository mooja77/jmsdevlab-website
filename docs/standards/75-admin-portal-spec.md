# Standard Developer Management Portal Specification

Last Updated: 2026-03-27

## Purpose

Every JMS Dev Lab app must have an admin/developer portal that allows us to monitor users, revenue, health, and usage across all our apps from a single interface pattern.

## Required Dashboard Sections

### 1. Overview Dashboard (`GET /api/admin/dashboard`)

Response:
```json
{
  "totalUsers": 0,
  "activeUsers": 0,
  "newSignups7d": 0,
  "newSignups30d": 0,
  "mrr": 0,
  "errorCount24h": 0,
  "activeSessions": 0,
  "planDistribution": {
    "free": 0,
    "starter": 0,
    "pro": 0,
    "enterprise": 0
  },
  "topFeatures": [
    { "name": "feature_name", "usageCount": 0 }
  ]
}
```

### 2. User Management (`GET /api/admin/users?search=&page=&limit=`)

- Paginated user list with search
- Fields: id, email, name, plan, signupDate, lastLogin, totalActions, status
- `GET /api/admin/users/:id` — Full user detail with activity log
- `POST /api/admin/users/:id/impersonate` — Generate temp token for debugging (optional)

### 3. Billing Metrics (`GET /api/admin/billing`)

Response:
```json
{
  "mrr": 0,
  "arr": 0,
  "totalPaying": 0,
  "totalFree": 0,
  "trialCount": 0,
  "trialConversionRate": 0,
  "churnRate30d": 0,
  "planBreakdown": [
    { "plan": "starter", "count": 0, "revenue": 0 }
  ],
  "recentTransactions": [
    { "date": "2026-01-01", "user": "email", "amount": 0, "type": "subscription" }
  ]
}
```

### 4. System Health (`GET /api/admin/health`)

Response:
```json
{
  "status": "healthy",
  "uptime": 0,
  "dbConnected": true,
  "dbResponseMs": 0,
  "memoryUsageMb": 0,
  "errorRate24h": 0,
  "avgResponseMs": 0,
  "version": "1.0.0",
  "lastDeployment": "2026-01-01T00:00:00Z"
}
```

### 5. Activity Log (`GET /api/admin/activity?page=&limit=&type=`)

Response:
```json
{
  "activities": [
    { "timestamp": "2026-01-01T00:00:00Z", "userId": "id", "action": "login", "details": "...", "ip": "0.0.0.0" }
  ],
  "total": 0,
  "page": 1
}
```

### 6. Feature Usage (`GET /api/admin/features`)

Response:
```json
{
  "features": [
    { "name": "feature_name", "totalUses": 0, "uniqueUsers": 0, "lastUsed": "2026-01-01T00:00:00Z" }
  ]
}
```

## Authentication

- Protect all `/api/admin/*` routes with middleware
- Auth method: Check `x-admin-key` header against env var `ADMIN_API_KEY`
- OR: Check user role === 'superadmin' from JWT
- Rate limit: 30 req/min

## Backend Implementation Pattern (Express + Prisma)

```typescript
// routes/admin.ts
import { Router } from 'express';
const router = Router();

// Middleware: verify admin access
router.use((req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (key !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
});

router.get('/dashboard', async (req, res) => { /* aggregate metrics */ });
router.get('/users', async (req, res) => { /* paginated user list */ });
router.get('/users/:id', async (req, res) => { /* user detail */ });
router.get('/billing', async (req, res) => { /* billing metrics */ });
router.get('/health', async (req, res) => { /* system health */ });
router.get('/activity', async (req, res) => { /* activity log */ });
router.get('/features', async (req, res) => { /* feature usage */ });

export default router;
```

## Frontend Pattern

- Route: `/admin` in web SaaS
- Tabs: Dashboard | Users | Billing | Health | Activity | Features
- Auto-refresh: 60 seconds
- Charts: Recharts (already in most apps)
- Tables: Sortable, paginated, searchable
- Export: CSV download for users, activity, billing

## Reference Implementations

- SmartCash admin routes: `C:\JM Programs\Smart Cash\apps\backend\src\routes\admin.ts`
- JSM analytics: `C:\JM Programs\Custom Jewellery Manager\backend\src\routes\analytics.ts`
- StaffHub admin pages: `C:\JM Programs\Staff Hub\frontend\src\pages\admin\`

## Environment Variables Required

```
ADMIN_API_KEY=<generate-random-32-char-string>
```

## Apps by Priority

1. ProfitShield, GrowthMap, TaxMatch, PitchSide — build from scratch
2. RepairDesk, SpamShield, ThemeSweep, QualCanvas — extend existing
3. SmartCash, JSM, StaffHub — standardise existing to match spec

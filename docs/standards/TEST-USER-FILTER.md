# Standard: Test User Filtering in Admin Portal Endpoints

**Date:** 2026-03-28
**Applies to:** All 12 apps' `/api/admin/dashboard` and `/api/admin/users` endpoints

## Rule

Admin dashboard metrics (totalUsers, activeUsers, newSignups, MRR) must NEVER count test accounts. Only real, paying or trialing customers should be counted.

## Test User Patterns to Exclude

Any user matching ANY of these patterns is a test account:

### Email domain patterns
```
@example.com
@test.com
@mailinator.com
@x.com
*.test          (any .test TLD — e.g., @testjewellers.test, @spamshield.test)
@shopify.com    (Shopify reviewer test accounts)
```

### Internal/team accounts
```
@staffhubtest.com
@spamshield.app
@customdesign.com      (JSM seed data)
@customdesigncrm.com   (JSM internal)
@testorg.com
@jewelvalue.app
@smartcashapp.net
@staffhubapp.com
@mygrowthmap.net
mooja77@gmail.com
mooja77+*@gmail.com
john@mooresjewellers.com
john@jmsdevlab.com
```

### Email content patterns
```
test (anywhere in email)
demo (anywhere in email)
e2e (anywhere in email)
smoke (anywhere in email)
qa (anywhere in email)
cors-test
check@
fake
seed
```

## Implementation

### For Prisma (SmartCash, RepairDesk, QualCanvas, ThemeSweep, SpamShield, TaxMatch, ProfitShield, JSM, JewelValue)

Add this helper and use it in every admin query:

```typescript
const TEST_EMAIL_PATTERNS = [
  '@example.com', '@test.com', '@mailinator.com', '@x.com',
  '@staffhubtest.com', '@spamshield.app', '@jewelvalue.app',
  '@smartcashapp.net', '@staffhubapp.com', '@mygrowthmap.net',
  '@shopify.com',
];

const TEST_EMAIL_CONTAINS = [
  'test', 'demo', 'e2e', 'smoke', 'qa', 'cors-', 'fake', 'seed',
];

const INTERNAL_EMAILS = [
  'mooja77@gmail.com', 'john@mooresjewellers.com', 'john@jmsdevlab.com',
];

function isTestEmail(email: string): boolean {
  if (!email) return true;
  const lower = email.toLowerCase();
  if (INTERNAL_EMAILS.includes(lower)) return true;
  if (lower.endsWith('.test')) return true;
  if (TEST_EMAIL_PATTERNS.some(p => lower.endsWith(p))) return true;
  if (TEST_EMAIL_CONTAINS.some(p => lower.includes(p))) return true;
  if (lower.match(/mooja77\+.*@gmail\.com/)) return true;
  return false;
}
```

### For Prisma WHERE clause:
```typescript
const realUsersWhere = {
  email: {
    not: { in: INTERNAL_EMAILS },
    notIn: INTERNAL_EMAILS,
  },
  AND: [
    { email: { not: { contains: 'test' } } },
    { email: { not: { contains: 'demo' } } },
    { email: { not: { contains: 'e2e' } } },
    { email: { not: { endsWith: '.test' } } },
    { email: { not: { endsWith: '@example.com' } } },
    { email: { not: { endsWith: '@mailinator.com' } } },
    { email: { not: { endsWith: '@x.com' } } },
    { email: { not: { endsWith: '@shopify.com' } } },
  ],
};

// Use in dashboard:
const totalUsers = await prisma.user.count({ where: realUsersWhere });
```

### For MongoDB/Mongoose (StaffHub):
```javascript
const testEmailRegex = /test|demo|e2e|smoke|qa|cors-|fake|seed|example\.com|mailinator\.com|\.test$|@x\.com|@shopify\.com|mooja77|@staffhubtest\.com|@staffhubapp\.com/i;

const realUsersFilter = {
  email: { $not: testEmailRegex }
};

const totalUsers = await User.countDocuments(realUsersFilter);
```

### For Supabase (GrowthMap):
```typescript
const { count } = await supabase
  .from('profiles')
  .select('*', { count: 'exact', head: true })
  .not('email', 'like', '%test%')
  .not('email', 'like', '%demo%')
  .not('email', 'like', '%example.com')
  .not('email', 'like', '%mailinator.com')
  .not('email', 'like', '%mygrowthmap.net');
```

### For Firebase (PitchSide):
```typescript
// Firebase Auth doesn't support query filters, so filter in code:
const allUsers = await auth.listUsers(1000);
const realUsers = allUsers.users.filter(u => !isTestEmail(u.email || ''));
```

## /api/admin/users endpoint

The users list should include ALL users (including test) but mark them:
```json
{
  "users": [
    { "email": "real@customer.com", "isTest": false, ... },
    { "email": "test@example.com", "isTest": true, ... }
  ],
  "total": 15,
  "realUsers": 2,
  "testUsers": 13
}
```

## /api/admin/dashboard endpoint

Dashboard counts MUST only include real users:
```json
{
  "totalUsers": 2,      // real only
  "testUsers": 13,      // shown separately
  "activeUsers": 1,     // real only
  "mrr": 0,             // real subscriptions only
  ...
}
```

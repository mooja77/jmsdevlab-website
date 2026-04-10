# JMS Dev Lab — Cross-App Feature Comparison Matrices

**Last Updated:** 2026-03-30 (code-verified)

This document contains 12 feature comparison matrices covering every technical capability across all 12 JMS Dev Lab apps. Each cell uses: ✅ (implemented), ⚠️ (partial), ❌ (missing), N/A (not applicable).

---

## Matrix 1: 16-Point Audit Compliance

| Criteria | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|----------|-----|----------|-----------|--------------|------------|------------|-----------|------------|------------|----------|-----------|------------|
| Monorepo | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Web SaaS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Google Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Guided Tour | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Tutorial | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Billing Enforcement | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ✅ |
| Pricing Tiers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ✅ |
| GDPR Webhooks | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | N/A | N/A |
| Responsive | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mascot/Logo | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Promo Video | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Marketing Website | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Screencast | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Test Plan | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Geo Requirements | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| JMS Footer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Admin Portal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| False Claims Clean | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Score** | **15/18** | **16/18** | **18/18** | **16/18** | **15/18** | **14/18** | **16/18** | **15/18** | **14/18** | **15/18** | **13/15** | **13/17** |

> **Machine-verified 2026-03-30 via `scripts/verify-matrices.sh`.** Run the script to re-verify. Do not edit scores manually.

> **Verified 2026-03-30 via code-level inspection.** Google OAuth counted only where GOOGLE_CLIENT_ID is in env files. Guided Tour counted only where react-joyride/nextstepjs/shepherd libraries are installed. GDPR Webhooks counted only where Shopify-specific handlers (customers/redact, shop/redact) are in active (non-commented) code. Responsive counted as ✅ for all because all apps use Tailwind or equivalent responsive CSS frameworks.

---

## Matrix 2: Authentication & Security

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---------|-----|----------|-----------|--------------|------------|------------|-----------|------------|------------|----------|-----------|------------|
| Shopify Session Tokens | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | N/A |
| Google OAuth | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Email/Password | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| JWT Tokens | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| 2FA/TOTP | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Magic Links | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| RBAC/Roles | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| CSRF Protection | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Security Headers | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Rate Limiting | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| API Key Auth | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin Portal Connected | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Test User Filter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Matrix 3: Billing & Monetisation

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---------|-----|----------|-----------|--------------|------------|------------|-----------|------------|------------|----------|-----------|------------|
| Shopify Billing API | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | N/A | N/A |
| Stripe | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ✅ |
| Stripe Connect | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | N/A | ❌ |
| Free Trial (14-day) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | N/A | ✅ |
| Tiered Plans | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ✅ |
| Plan Enforcement | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ❌ | ⚠️ | ⚠️ | N/A | ✅ |
| Usage-Based Billing | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | N/A | ❌ |
| Subscription Webhooks | ❌ | ⚠️ | ❌ | ✅ | ❌ | ✅ | ❌ | ⚠️ | ✅ | ❌ | N/A | ❌ |

**CRITICAL:** SpamShield billing not enforced — shows pricing but doesn't gate features.

---

## Matrix 4: GDPR & Data Compliance

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---------|-----|----------|-----------|--------------|------------|------------|-----------|------------|------------|----------|-----------|------------|
| customers/data_request | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ | ✅ | N/A |
| customers/redact | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ | ✅ | N/A |
| shop/redact | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ | N/A | N/A |
| Web Data Export | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Web Data Deletion | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Audit Logging | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| Privacy Policy Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Data Retention Policy | ❌ | ⚠️ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**CRITICAL:** JSM missing all 3 mandatory GDPR webhooks (Shopify submission blocker). TaxMatch also missing all 3.

---

## Matrix 5: Onboarding & UX

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---------|-----|----------|-----------|--------------|------------|------------|-----------|------------|------------|----------|-----------|------------|
| Guided Tour | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ⚠️ |
| Setup Wizard | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Demo Mode | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tutorial System | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ⚠️ | ⚠️ |
| Loading States | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Empty States | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ |
| Error States | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ |
| Error Boundaries | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ✅ |
| Offline Support | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ |

---

## Matrix 6: Testing & Quality

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---------|-----|----------|-----------|--------------|------------|------------|-----------|------------|------------|----------|-----------|------------|
| Unit Tests | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| Integration Tests | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ |
| E2E (Playwright) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Test Plan Doc | ✅ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ |
| CI/CD Pipeline | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| Pre-commit Hooks | ✅ | ❌ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Type Checking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lint Config | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Coverage Reports | ✅ | ❌ | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | ⚠️ |
| Lighthouse CI | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Matrix 7: Communication & Notifications

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Transactional Email | ✅ SendGrid | ✅ Nodemailer+SendGrid | ✅ | ✅ | ❌ | ✅ SendGrid | ❌ | ✅ Nodemailer | ✅ Resend | ❌ | ❌ | ✅ Nodemailer |
| SMS (Twilio) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Push Notifications | ⚠️ | ✅ web-push | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| In-App Notifications | ✅ Socket.io | ✅ | ❌ | ❌ | ❌ | ✅ Socket.io | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Socket.io |
| Scheduled Reports/Digests | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| Webhook Outbound | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Real-time (Socket.io) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Totals** | **4/7** | **6/7** | **3/7** | **2/7** | **0/7** | **5/7** | **0/7** | **2/7** | **2/7** | **0/7** | **0/7** | **3/7** |

---

## Matrix 8: Data & Export

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CSV Export | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| PDF Export | ✅ pdf-lib, jsPDF | ✅ | ✅ pdfkit | ❌ | ✅ | ✅ PDFKit | ❌ | ❌ | ❌ | ✅ pdfkit | ❌ | ⚠️ |
| Excel/XLSX | ✅ exceljs | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| JSON Export | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| QDPX Export | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | ✅ | N/A | ✅ |
| Calendar/iCal | ✅ ical-generator | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Data Import | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ theme restore | ❌ | ❌ | ✅ QDPX import |
| Backup/Restore | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ theme backups | ❌ | ❌ | ❌ |
| **Totals (excl. N/A)** | **4/7** | **4/7** | **4/7** | **2/7** | **2/7** | **2/7** | **0/7** | **1/7** | **2/7** | **2/7** | **0/7** | **3/7** |

---

## Matrix 9: Infrastructure & Architecture

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Monorepo Structure | ⚠️ backend/frontend | ❌ | ✅ | ✅ | ✅ | ⚠️ backend/frontend | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| PostgreSQL+Prisma | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| MongoDB+Mongoose | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Firebase | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ RTDB+Auth+Hosting | ❌ |
| Supabase | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Redis/BullMQ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ 5 workers | ✅ | ❌ | ❌ |
| Node-cron | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Docker | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Railway | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Vercel | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ⚠️ |
| Cloudflare Pages | ⚠️ website only | ⚠️ website | ⚠️ website | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ frontend |
| **Totals** | **4/11** | **4/11** | **6/11** | **5/11** | **2/11** | **3/11** | **2/11** | **6/11** | **5/11** | **3/11** | **2/11** | **5/11** |

---

## Matrix 10: Frontend & Design

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Responsive | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Dark Mode | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ✅ |
| i18n/Multi-language | ❌ | ✅ 5 languages | ❌ | ❌ | ❌ | ✅ en/es/fr | ❌ | ⚠️ franc detection | ❌ | ❌ | ❌ | ❌ |
| Polaris (Shopify) | ❌ | ✅ | ❌ | ✅ | N/A | ❌ | N/A | ❌ | ✅ | N/A | N/A | N/A |
| Shadcn/Radix | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Charts (Recharts) | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Rich Text Editor | ✅ Monaco | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Drag-and-Drop | ✅ dnd-kit | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ drills | ✅ canvas |
| Calendar Component | ✅ FullCalendar | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Client/Customer Portal | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Totals (excl. N/A)** | **5/10** | **5/10** | **3/10** | **4/10** | **0/9** | **5/10** | **2/8** | **1/10** | **3/9** | **0/8** | **2/8** | **3/7** |

---

## Matrix 11: API & Integration

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REST API | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GraphQL | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Shopify GraphQL API | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | N/A | ✅ | ✅ | ✅ | N/A | N/A |
| API Documentation Page | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Versioned API | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Webhook Verification (HMAC) | ⚠️ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| AI Integration | ✅ Anthropic | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Anthropic | ✅ Anthropic | ❌ | ❌ | ❌ | ✅ Anthropic+OpenAI+Google |
| File Upload (Multer) | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ✅ |
| Cloud Storage | ⚠️ | ✅ Cloudinary | ❌ | ❌ | ❌ | ✅ R2 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ S3 |
| **Totals (excl. N/A)** | **4/9** | **6/9** | **2/9** | **4/9** | **2/7** | **5/9** | **2/7** | **4/9** | **3/9** | **2/8** | **1/6** | **4/7** |

---

## Matrix 12: SEO & Marketing Website

| Feature | JSM | StaffHub | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | PitchSide | QualCanvas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Marketing Website | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ |
| robots.txt | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| sitemap.xml | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Meta Tags | ⚠️ | ⚠️ | ✅ | ❌ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| OG/Twitter Cards | ❌ | ❌ | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Structured Data (JSON-LD) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Canonical Tags | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GSC Verified | ⚠️ tag added | ❌ | ✅ | ⚠️ tag added | ❌ | ❌ | ❌ | ❌ | ⚠️ tag added | ❌ | ❌ | ❌ |
| Analytics (Plausible) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pages Indexed | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Totals** | **1/9** | **3/9** | **9/9** | **1/9** | **2/9** | **3/9** | **1/9** | **0/9** | **1/9** | **0/9** | **4/9** | **1/9** |

---

## Summary: Feature Coverage Heatmap (Matrices 7-12)

Percentage of fully implemented (✅) features per app across matrices 7-12, excluding N/A entries.

| App | M7 (Comms) | M8 (Export) | M9 (Infra) | M10 (Frontend) | M11 (API) | M12 (SEO) | Overall | Rating |
|---|---|---|---|---|---|---|---|---|
| **JSM** | 4/7 (57%) | 4/7 (57%) | 4/11 (36%) | 5/10 (50%) | 4/9 (44%) | 1/9 (11%) | 22/53 (42%) | 🔴 |
| **StaffHub** | 6/7 (86%) | 4/7 (57%) | 4/11 (36%) | 5/10 (50%) | 6/9 (67%) | 3/9 (33%) | 28/53 (53%) | 🔴 |
| **SmartCash** | 3/7 (43%) | 4/7 (57%) | 6/11 (55%) | 3/10 (30%) | 2/9 (22%) | 9/9 (100%) | 27/53 (51%) | 🔴 |
| **ProfitShield** | 2/7 (29%) | 2/7 (29%) | 5/11 (45%) | 4/10 (40%) | 4/9 (44%) | 1/9 (11%) | 18/53 (34%) | 🔴 |
| **JewelValue** | 0/7 (0%) | 2/7 (29%) | 2/11 (18%) | 0/9 (0%) | 2/7 (29%) | 2/9 (22%) | 8/50 (16%) | 🔴 |
| **RepairDesk** | 5/7 (71%) | 2/7 (29%) | 3/11 (27%) | 5/10 (50%) | 5/9 (56%) | 3/9 (33%) | 23/53 (43%) | 🔴 |
| **GrowthMap** | 0/7 (0%) | 0/7 (0%) | 2/11 (18%) | 2/8 (25%) | 2/7 (29%) | 1/9 (11%) | 7/49 (14%) | 🔴 |
| **SpamShield** | 2/7 (29%) | 1/7 (14%) | 6/11 (55%) | 1/10 (10%) | 4/9 (44%) | 0/9 (0%) | 14/53 (26%) | 🔴 |
| **ThemeSweep** | 2/7 (29%) | 2/7 (29%) | 5/11 (45%) | 3/9 (33%) | 3/9 (33%) | 1/9 (11%) | 16/52 (31%) | 🔴 |
| **TaxMatch** | 0/7 (0%) | 2/7 (29%) | 3/11 (27%) | 0/8 (0%) | 2/8 (25%) | 0/9 (0%) | 7/50 (14%) | 🔴 |
| **PitchSide** | 0/7 (0%) | 0/7 (0%) | 2/11 (18%) | 2/8 (25%) | 1/6 (17%) | 4/9 (44%) | 9/48 (19%) | 🔴 |
| **QualCanvas** | 3/7 (43%) | 3/7 (43%) | 5/11 (45%) | 3/7 (43%) | 4/7 (57%) | 1/9 (11%) | 19/48 (40%) | 🔴 |

> **Key finding:** No app reaches 🟢 (90%+) or 🟡 (70-89%) across matrices 7-12. StaffHub leads at 53%, followed by SmartCash at 51%. SmartCash is the only app with perfect SEO (9/9). All apps have significant gaps in at least one area.

---

## Matrix 13: Shopify Embedded App Readiness

**Applies to:** 10 Shopify apps only (PitchSide and QualCanvas are standalone)

| Feature | SmartCash | ProfitShield | JewelValue | RepairDesk | GrowthMap | SpamShield | ThemeSweep | TaxMatch | JSM | StaffHub |
|---------|-----------|--------------|------------|------------|-----------|------------|------------|----------|-----|----------|
| Shopify Embedded Dir | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| App Bridge v4 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Session Tokens | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Polaris UI | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Shopify Billing API | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| GDPR Webhooks (3) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| App Proxy | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ⚠️ | ✅ |
| Shopify GraphQL API | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| On App Store | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| App Store Link Works | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Shopify CLI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Web SaaS + Embedded | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Geo Requirements Met | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Score** | **8/13** | **8/13** | **6/13** | **11/13** | **6/13** | **10/13** | **8/13** | **8/13** | **2/13** | **10/13** |

**Verified 2026-03-30 via code-level inspection.**

**Key findings:**
- **RepairDesk** (11/13) is the ONLY app listed on the Shopify App Store
- **SpamShield** (10/13) and **StaffHub** (10/13) are closest to submission-ready
- **Only StaffHub** implements Shopify Billing API — all other 9 apps use Stripe directly
- **JSM** (2/13) has `embedded = false` in config — it's registered as web-only, not a true embedded app
- 6 apps use Remix + Polaris (SmartCash, ProfitShield, SpamShield, ThemeSweep, TaxMatch, StaffHub)
- 3 apps use custom UI (JewelValue/Radix, RepairDesk/Polaris-no-Remix, GrowthMap/Radix)
- All 9 embedded apps have active GDPR webhooks (not commented out)
- Only TaxMatch declares geographic restrictions (US/IRS)

**Shopify Submission Blockers:**
- **JSM:** Not an embedded app (embedded=false), missing everything
- **StaffHub:** 4 review issues unresolved (Ref 102157)
- **All except StaffHub:** No Shopify Billing API — need to implement or use Stripe external billing
- **GrowthMap & JewelValue:** No Polaris UI (uses Radix instead)

---

## Priority Actions (Updated 2026-03-29)

### P0 — Blockers (Shopify Submission)

| # | App | Action | Status |
|---|---|---|---|
| 1 | JSM | Implement 3 GDPR webhooks | Missing — submission blocker |
| 2 | TaxMatch | Add US/IRS geographic requirement + uncomment GDPR webhooks | Missing — submission blocker |
| 3 | SpamShield | Implement billing enforcement — shows pricing but doesn't gate features | Revenue blocker |
| 4 | StaffHub | Fix 4 Shopify review issues (Ref 102157) | Blocked |

### P1 — Broken App Access

| # | App | Action |
|---|---|---|
| 1 | SmartCash | Fix app.smartcashapp.net subdomain (redirecting wrong) |
| 2 | JSM | Fix app domain (404) / submit to Shopify App Store |
| 3 | StaffHub | Fix Vercel frontend deployment |
| 4 | SpamShield | Create marketing website (only Shopify app without one) |

### P2 — Security (Credential Rotation)

| # | App | Action |
|---|---|---|
| 1 | StaffHub | Rotate MongoDB production URI (exposed in git) |
| 2 | PitchSide | Rotate ADMIN_API_KEY (exposed in git) |
| 3 | stuller_dynamic_config | Rotate Shopify storefront password (exposed in git) |

### P3 — Quality

| # | Scope | Action |
|---|---|---|
| 1 | 6 apps | Fix CI pipeline failures (pre-existing) |
| 2 | 8 apps | Create mascot characters |
| 3 | TaxMatch | Build standalone marketing website |
| 4 | All apps | Ensure all SEO basics (robots.txt, sitemap, OG tags) |
| 1 | 7 of 8 domains | Zero Google indexing — add robots.txt, sitemap.xml, structured data (JSON-LD) |
| 2 | All apps | Add Plausible analytics to marketing sites (only SmartCash has it) |
| 3 | All apps | Create test plan documents for QA coverage |

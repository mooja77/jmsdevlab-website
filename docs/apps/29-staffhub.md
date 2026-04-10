# StaffHub

**Last Updated:** 2026-03-25

---

## Overview

StaffHub is a Shopify embedded app for team training, scheduling, and performance management. It helps Shopify merchants onboard new staff, deliver structured training modules with quizzes, manage shift schedules, facilitate team messaging, and conduct performance reviews. The app supports five languages, making it suitable for international teams.

StaffHub is currently blocked from Shopify App Store approval due to four critical issues identified during review (Reference 102157). Resolving these issues is the highest priority for this app.

## Status

- **Phase:** Submitted for Shopify review -- **BLOCKED**
- **Audit Score:** 9/16
- **Shopify App Store:** Review blocked (Reference 102157)
- **CRITICAL -- 4 Review Issues:**
  1. **Geographic requirements** not properly declared
  2. **Valuation error** encountered during review
  3. **Settings not saving** -- reviewer could not persist configuration changes
  4. **Staff portal not visible** -- reviewer could not access the staff-facing portal
- **Priority:** Fix all 4 review issues before any other work on this app

## URLs

| Resource           | URL                                              |
|--------------------|--------------------------------------------------|
| Marketing Website  | https://staffhubapp.com                          |
| Admin Dashboard    | https://staff-hub-admin.vercel.app               |
| Backend API        | Railway-hosted (dynamic URL)                     |
| GitHub Repository  | https://github.com/mooja77/Staff-Hub             |
| YouTube Promo      | https://youtu.be/G0h2KE1lm3c                    |
| YouTube Tour       | https://youtu.be/wjk1IPHltl4                     |

## Local Path

```
C:\JM Programs\Staff Hub
```

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Backend      | Express.js (Node.js)                    |
| Database     | MongoDB                                 |
| File Storage | Cloudinary (images, training media)     |
| Frontend     | React                                   |
| Hosting      | Vercel (frontend) + Railway (backend)   |
| Auth         | Shopify session tokens                  |
| Language     | JavaScript / TypeScript                 |

## Architecture

StaffHub does **not** follow the standard JMS Dev Lab monorepo pattern. It uses a separated architecture with independently deployed frontend and backend services:

```
Staff Hub/
├── backend/               # Express API server
│   ├── models/            # MongoDB/Mongoose models
│   ├── routes/            # API route handlers
│   ├── middleware/        # Auth, Shopify verification
│   ├── services/          # Business logic, Cloudinary integration
│   └── server.js
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── i18n/          # Internationalization (5 languages)
│   │   └── contexts/
│   └── package.json
└── README.md
```

**Deployment topology:**
- Frontend (React) is deployed to Vercel (Project ID: `prj_0i9SaoW5bVJUNs8aqZrHcEtKv0if`)
- Backend (Express) is deployed to Railway
- MongoDB is hosted externally (likely MongoDB Atlas)
- Media assets (training images, videos) are stored on Cloudinary

## Key Features

- **Training Modules & Quizzes:** Create structured training courses with multiple modules, each containing lessons and assessment quizzes. Track completion rates and scores per staff member.
- **Team Messaging:** Built-in messaging system for team communication, announcements, and direct messages between managers and staff.
- **Shift Scheduling:** Visual shift scheduler with drag-and-drop, availability tracking, shift swap requests, and conflict detection.
- **Performance Reviews:** Structured review templates, goal setting, review scheduling, and historical performance tracking per employee.
- **5 Language Support:** Full internationalization with support for multiple languages, enabling merchants with international teams to deploy training in their staff's preferred language.
- **Staff Onboarding:** Guided onboarding flows for new team members with progress tracking.
- **Role-Based Access:** Separate views and permissions for store owners/managers and staff members.

## Pricing Tiers

All plans include a **14-day free trial**. No free tier is offered.

| Plan       | Price      | Features                                          |
|------------|------------|---------------------------------------------------|
| Basic      | $4.99/mo   | Up to 5 staff, basic training modules, messaging  |
| Pro        | $9.99/mo   | Up to 25 staff, quizzes, scheduling, reviews      |
| Enterprise | $29.99/mo  | Unlimited staff, priority support, custom branding, API access |

## Deployment

- **Frontend Hosting:** Vercel
  - Project ID: `prj_0i9SaoW5bVJUNs8aqZrHcEtKv0if`
  - URL: `staff-hub-admin.vercel.app`
- **Backend Hosting:** Railway
  - Auto-deploys from GitHub on push to main branch
- **Database:** MongoDB (external, likely MongoDB Atlas)
- **Media Storage:** Cloudinary account for training media uploads
- **Environment Variables:**
  - `MONGODB_URI` -- MongoDB connection string
  - `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` -- Shopify app credentials
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` -- Media storage
  - `SESSION_SECRET` -- Express session encryption
  - `FRONTEND_URL` -- CORS origin

## Known Gaps

- **CRITICAL -- Shopify Review Blocked (Ref 102157):** Four issues must be resolved before the app can be approved:
  1. Geographic requirements need to be declared in the app listing
  2. A valuation error occurs during the review process
  3. Settings changes do not persist (save functionality broken)
  4. The staff portal is not accessible to the reviewer
- **Monorepo Migration:** App does not follow the standard JMS Dev Lab monorepo structure. Should be migrated for consistency.
- **Web SaaS Marketing:** No standalone marketing strategy or web SaaS version beyond the Shopify embedded app.
- **Mascot:** No app mascot designed.
- **Promo Video:** YouTube videos exist (2 published), but may need updating after review issues are fixed.
- **Screencast:** No dedicated walkthrough screencast.
- **GDPR Webhooks:** Status unclear -- need to verify the three mandatory Shopify GDPR endpoints are implemented and active.

## Related Documents

- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- App Instance Instructions: `C:\JM Programs\JMS Dev Lab Website\APP-INSTANCE-INSTRUCTIONS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

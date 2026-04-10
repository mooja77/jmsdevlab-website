# Pitch Side

**Last Updated:** 2026-03-25

---

## Overview

Pitch Side is a completely free coaching companion app for grassroots football (soccer), built with an Irish football (FAI) context in mind. It helps volunteer and amateur coaches plan training sessions, manage squads, build formations, and track match day performance. The app runs as a web application and also targets native iOS and Android via Capacitor.

Pitch Side is **not a Shopify app**. It is a standalone product with no subscriptions, no ads, and no monetization. It exists as a community contribution to grassroots sport, reflecting JMS Dev Lab's commitment to giving back.

## Status

- **Phase:** Live / Active
- **Audit Score:** 9/16
- **Shopify App Store:** N/A -- this is not a Shopify app
- **Monetization:** None (completely free)
- **Mobile:** Capacitor builds for iOS and Android (native wrappers around the web app)

## URLs

| Resource           | URL                                              |
|--------------------|--------------------------------------------------|
| Marketing Website  | https://pitchsideapp.net                         |
| GitHub Repository  | https://github.com/mooja77/Football-Coaching-App |

## Local Path

```
C:\JM Programs\PitchSide
```

> Note: The apps portfolio memory references `C:\JM Programs\Football Coaching App` as the original directory name. Both may exist; the canonical path is `PitchSide`.

## Tech Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Framework    | Next.js 16                                    |
| UI Library   | React 19                                      |
| Backend/DB   | Firebase (Realtime Database)                  |
| Auth         | Firebase Authentication                       |
| Hosting      | Firebase Hosting + Vercel                     |
| Mobile       | Capacitor (iOS + Android native wrappers)     |
| Language     | TypeScript                                    |

## Architecture

Pitch Side is a Next.js application that uses Firebase as its entire backend -- Realtime Database for data persistence, Firebase Auth for user authentication, and Firebase Hosting for deployment. A parallel Vercel deployment exists for the web version. Capacitor wraps the web app into native mobile shells for iOS and Android.

```
PitchSide/
├── src/
│   ├── app/               # Next.js 16 app router pages
│   ├── components/
│   │   ├── squad/         # Squad management components
│   │   ├── sessions/      # Training session planning
│   │   ├── drills/        # Drill library (75+ drills)
│   │   ├── formations/    # Formation builder
│   │   ├── matchday/      # Match day tools
│   │   └── analytics/     # Season analytics
│   ├── lib/
│   │   ├── firebase/      # Firebase config & helpers
│   │   └── utils/
│   └── types/
├── ios/                   # Capacitor iOS project
├── android/               # Capacitor Android project
├── capacitor.config.ts
├── firebase.json          # Firebase hosting config
├── next.config.js
└── package.json
```

**Hosting topology:**
- Firebase Hosting serves the primary web app
- Vercel (Project ID: `prj_iTbxdQuekR2TuQ91XkY45iqVqbns`) provides an additional deployment
- Firebase Realtime Database stores all application data (squads, sessions, drills, match data)
- Firebase Auth handles user registration and login

## Key Features

- **Squad Management:** Create and manage player rosters with positions, availability, contact details, and skill ratings. Support for multiple squads/teams.
- **Session Planning:** Plan training sessions with structured warm-up, main activity, and cool-down phases. Assign drills to each phase with timing and equipment notes.
- **75+ Drills Library:** Pre-built library of over 75 coaching drills categorized by skill focus (passing, shooting, defending, fitness, etc.), age group, and difficulty level. Coaches can also create custom drills.
- **Formation Builder:** Visual formation builder supporting pitch sizes from 5-a-side through 11-a-side (5v5, 7v7, 9v9, 11v11). Drag-and-drop player positioning with formation templates.
- **Match Day Tools:** Live match day management including lineup selection, substitution tracking, event logging (goals, cards, injuries), and half-time notes.
- **Season Analytics:** Track season-level statistics including results, player appearances, goal scorers, training attendance, and performance trends over time.
- **FAI/Irish Football Context:** Terminology, age groups (U7 through Senior), and competition structures aligned with Football Association of Ireland standards.
- **Offline Capable:** Designed for pitch-side use where connectivity may be limited.
- **Mobile Apps:** Native iOS and Android apps via Capacitor provide a native-feeling experience with push notifications and device features.

## Pricing Tiers

**Pitch Side is completely free.** There are no subscriptions, no in-app purchases, no advertisements, and no premium tiers.

| Plan | Price | Features     |
|------|-------|--------------|
| Free | $0    | Everything   |

This is a deliberate choice -- the app serves volunteer coaches in grassroots football who should not face financial barriers to accessing quality coaching tools.

## Deployment

- **Primary Hosting:** Firebase Hosting
  - Configured via `firebase.json`
  - Auto-deploys via Firebase CLI
- **Secondary Hosting:** Vercel
  - Project ID: `prj_iTbxdQuekR2TuQ91XkY45iqVqbns`
  - URL: https://pitchsideapp.net
- **Database:** Firebase Realtime Database (NoSQL, JSON-structured)
- **Auth:** Firebase Authentication (email/password, potentially Google OAuth)
- **Mobile Builds:**
  - iOS: Built via Capacitor, distributed through Xcode / TestFlight
  - Android: Built via Capacitor, APK generation
- **Environment Variables:**
  - `NEXT_PUBLIC_FIREBASE_API_KEY` -- Firebase project API key
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` -- Firebase auth domain
  - `NEXT_PUBLIC_FIREBASE_DATABASE_URL` -- Realtime Database URL
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` -- Firebase project ID
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` -- Firebase storage bucket
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` -- FCM sender ID
  - `NEXT_PUBLIC_FIREBASE_APP_ID` -- Firebase app ID

## Known Gaps

- **GDPR Data Export/Delete:** No mechanism for users to export or delete their data in compliance with GDPR. This is a legal requirement for EU users and must be addressed.
- **Mascot:** No app mascot designed.
- **Promo Video:** No promotional video created for marketing or social media.
- **Privacy Policy:** Needs to be verified as complete and GDPR-compliant, especially given the Firebase data storage and the Irish/EU user base.
- **App Store Distribution:** Capacitor builds exist but the app has not been published to the Apple App Store or Google Play Store.

## Related Documents

- App Build Playbook: `C:\JM Programs\JMS Dev Lab Website\APP-BUILD-PLAYBOOK.md`
- App Gap Prompts: `C:\JM Programs\JMS Dev Lab Website\APP-GAP-PROMPTS.md`
- App Instance Instructions: `C:\JM Programs\JMS Dev Lab Website\APP-INSTANCE-INSTRUCTIONS.md`
- Apps Portfolio: `C:\Users\Moores Home PC\.claude\projects\C--JM-Programs-JMS-Dev-Lab\memory\apps_portfolio.md`

# Pawsure

**Be sure, whoever's caring.** A pet-care companion that tells owners whether
planned care actually happened today, alerts them when it didn't, and finds
trusted cover from their own friends. Built from the Pawsure PRD v1.3.

Android app + web from one Expo codebase; Supabase (Postgres, Mumbai region) backend.

## Layout

```
apps/mobile/            Expo app (Android + web), Expo Router, SDK 58
  src/app/              Screens: Today, Find cover, Friends, Pet, Me, return check, style guide
  src/design/           Component library (see docs/design-system.md)
  src/demo/             Demo household used until the backend is wired
packages/domain/        Every PRD rule as pure, tested TypeScript
packages/design-tokens/ Colours, type, spacing + WCAG contrast tests
supabase/migrations/    P0 schema with row-level security
docs/                   Design system, build status
```

## Run it

```bash
npm install
```

```bash
npm test
```

```bash
npm run web
```

```bash
npm run mobile
```

`npm run mobile` starts Expo; scan the QR code with Expo Go on Android.

**Demo sign-in:** enter any 10-digit Indian mobile number, tick the terms, and use code `123456`. No SMS is sent; you land in the shared demo household on the dev Supabase project.

## What the rules engine covers (`packages/domain`)

| Module | PRD |
|---|---|
| `confidence.ts`: rule set v1, visit vs task evidence, late/duplicate/wrong-code handling, return check | 5.1, 10.3, 10.5, PS-030, PS-122 |
| `taskLifecycle.ts`: statuses, append-only history | PS-121 |
| `coveredDay.ts`: North Star, Trusted mode, household roll-up, rate | PS-111, 16.3 |
| `escalation.ts`: ladder defaults + overrides, severity matrix | PS-101, 10.4, 10.6, PS-124 |
| `friendMatching.ts`: eligibility filter, nearest-first ranking with reasons | 9.2, PS-057, PS-058, PS-066 |
| `friendRequest.ts`: request state machine, timers, idempotent webhooks | 9.4, PS-123, PS-068 |
| `codeCard.ts`: monthly food-box codes, rotation | PS-109 |
| `rewards.ts`: points, monthly cap, mismatch holds, expiry | PS-126 |

Each test names the PRD scenario it checks (mostly 17.1).

See `docs/status.md` for what is built, what is demo-only, and what's next.

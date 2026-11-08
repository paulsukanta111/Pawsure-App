# Prototype v2 coverage

Live: https://claude.ai/artifact/U15qxCc74YpqjCSpafYLXV (private until shared). v1 stays at https://claude.ai/artifact/3zUBcJEdAyzaaXh5VZFLA7.

Source of truth: Pawsure PRD v1.3. Everything that would talk to the outside world (SMS OTP, WhatsApp, IVR, LLM) is simulated and labelled in the app.

## Represented

- **A. Onboarding**: Welcome slides, mobile + OTP (simulated), registration, privacy notice and alert consent, pet profile with photo, care details, vet and 24x7 clinic, routine, helper invite, co-owner invite (PS-001 to PS-006)
- **B. Today**: Who's caring today, routine with confidence labels, upcoming health, alerts, covered care day, can't-come action, 30-second leaving check, multiple pets (PS-007, PS-013 to PS-016)
- **C. Pet profile**: Photo art, details, feeding, walks, medicine, allergies, vet, emergency card, health calendar and history (PS-003, PS-035, PS-040, PS-046)
- **D. Own helper**: Invite with language, why check-ins, method, WhatsApp preview, consent status, performance and history; helper side: consent, method choice, prompts, photo and voice uploads, missed call + code, problem report, points history, withdraw and rejoin, two households (PS-020 to PS-029, PS-104, PS-105, PS-110)
- **E. Trust engine**: Confirmed, Likely, Not confirmed, Missed, Matched; visit vs task status; evidence timeline; food-box code card; missed alert and escalation ladder; return check; mismatch, helper response and owner decision (PS-030 to PS-034, PS-101, PS-102, PS-109, PS-121, PS-122)
- **F. AI Friend Finder**: Ask Pawsure conversation with simulated parsing, editable interpretation that blocks on unclear time, key or medicine, friends-first rule-based matching, top 3 with reasons, per-language previews, owner approval, reply parsing, sent, reminder, expiry, provisional hold, proposed time, late reply, no-match, friend cancellation, confirmation, form fallback, friend profile and settings, owner privacy, nearby fallback shown disabled (PS-050 to PS-069, PS-123, PS-125)
- **G. Emergency and health**: Emergency card, contacts, S1-S3 incident reporting with escalation plan and status, incident log, medicine and vaccination reminders, vet details; no diagnosis (PS-035, PS-036, PS-039, PS-040, PS-106, PS-124)
- **H. Rewards**: Wallet: spendable, on hold, redeemed, coupon progress and redemption, expiry warning, history; 5 points per task, 125 cap, 500 = ₹20, 6-month expiry, 7-day holds, no cash; pilot points-group toggle (PS-042 to PS-045, PS-126)
- **P1 / P2 previews**: Day-care cards, profile with 100-point breakdown, booking preview, drop-off and pickup cards, stay and show me now, live score, certificate, staff views, private audit; carer cards, profile with ID-verification status and levels, visit preview. All labelled previews, none bookable

## Not yet represented

- **Real integrations**: No real SMS OTP, WhatsApp, IVR, LLM, maps or payments: all simulated and labelled
- **Persistence**: The demo day lives in the browser; only sign-in and the household name have a Supabase backend (in the app build)
- **Owner UI in Hindi and Marathi**: Helper and friend messages are translated; owner screens are English only (a listed cut-order item)
- **Admin console**: Ops dashboard, audit-log viewer, method-mix BI dashboard (PS-070 to PS-072, PS-117) are not built; pilot switches are shown read-only
- **Rights requests flow**: Entry points exist; the request form, grievance tracking and breach runbook (PS-119, PS-120) are not built
- **Shareable helper record**: Switched off for the pilot (PS-104); helper sees "not switched on yet"
- **Camera look-in, steps challenge, thank-you points**: Pilot switches off; not represented beyond the switch list
- **Live location during a visit**: Setting exists; no map or tracking UI (open privacy question in the PRD)
- **Translations review**: Hindi and Marathi strings are drafts and need native-speaker review

## Quality gate (automated, on the single-file page, offline)

- All 20 master-prompt scenarios pass end to end (`apps/mobile/e2e/scenarios.cjs`):
  - 1 onboarding: welcome, OTP, 6 steps
  - 4 owner invites helper (language, why, preview)
  - 5 helper consents and picks a method
  - 2 owner adds a pet (empty state)
  - 3 owner configures routine (adds 8 pm feed)
  - 6 photo check-in → walk Likely, lunch Confirmed
  - 10 missed alert at 7:30 (toilet pad)
  - 7 voice-note check-in (late) → pad Likely
  - 8 missed call + code → Likely; 9 visit only → Not confirmed
  - 11 owner return check → evening feed Matched
  - 12 mismatch → helper disputes → owner releases
  - 13 Trusted helper mode → Covered
  - 14 Ask Pawsure: parse, clarify key, top 3, approve
  - 15 friend accepts → owner confirms
  - 16 friend rejects + proposes a time (reply parsing)
  - 17 no friends available (medicine tomorrow 2 pm)
  - 18 emergency reported by helper → urgent alert
  - 19 day report
  - 20 rewards wallet
- All 43 routes render at 390, 768 and 1280 px with no horizontal overflow and no page errors (`e2e/routes.cjs`).
- Helper consent withdrawal stops evidence counting and the owner can re-invite (`e2e/withdraw.cjs`).
- No network requests leave the page; P1/P2 previews have no booking or payment actions.
- Domain: 98 unit tests; design tokens: 22 WCAG contrast tests.

Run: `npm run build:prototype -w @pawsure/mobile`, then `node apps/mobile/e2e/scenarios.cjs apps/mobile/dist-prototype/pawsure-prototype-v2.html /tmp`.

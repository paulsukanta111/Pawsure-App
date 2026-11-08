/** Requirement coverage for the v2 prototype (master prompt deliverable 10). Shared by the in-app screen and docs. */
export const COVERED: [string, string][] = [
  ['A. Onboarding', 'Welcome slides, mobile + OTP (simulated), registration, privacy notice and alert consent, pet profile with photo, care details, vet and 24x7 clinic, routine, helper invite, co-owner invite (PS-001 to PS-006)'],
  ['B. Today', "Who's caring today, routine with confidence labels, upcoming health, alerts, covered care day, can't-come action, 30-second leaving check, multiple pets (PS-007, PS-013 to PS-016)"],
  ['C. Pet profile', 'Photo art, details, feeding, walks, medicine, allergies, vet, emergency card, health calendar and history (PS-003, PS-035, PS-040, PS-046)'],
  ['D. Own helper', 'Invite with language, why check-ins, method, WhatsApp preview, consent status, performance and history; helper side: consent, method choice, prompts, photo and voice uploads, missed call + code, problem report, points history, withdraw and rejoin, two households (PS-020 to PS-029, PS-104, PS-105, PS-110)'],
  ['E. Trust engine', 'Confirmed, Likely, Not confirmed, Missed, Matched; visit vs task status; evidence timeline; food-box code card; missed alert and escalation ladder; return check; mismatch, helper response and owner decision (PS-030 to PS-034, PS-101, PS-102, PS-109, PS-121, PS-122)'],
  ['F. AI Friend Finder', 'Ask Pawsure conversation with simulated parsing, editable interpretation that blocks on unclear time, key or medicine, friends-first rule-based matching, top 3 with reasons, per-language previews, owner approval, reply parsing, sent, reminder, expiry, provisional hold, proposed time, late reply, no-match, friend cancellation, confirmation, form fallback, friend profile and settings, owner privacy, nearby fallback shown disabled (PS-050 to PS-069, PS-123, PS-125)'],
  ['G. Emergency and health', 'Emergency card, contacts, S1-S3 incident reporting with escalation plan and status, incident log, medicine and vaccination reminders, vet details; no diagnosis (PS-035, PS-036, PS-039, PS-040, PS-106, PS-124)'],
  ['H. Rewards', 'Wallet: spendable, on hold, redeemed, coupon progress and redemption, expiry warning, history; 5 points per task, 125 cap, 500 = ₹20, 6-month expiry, 7-day holds, no cash; pilot points-group toggle (PS-042 to PS-045, PS-126)'],
  ['P1 / P2 previews', 'Day-care cards, profile with 100-point breakdown, booking preview, drop-off and pickup cards, stay and show me now, live score, certificate, staff views, private audit; carer cards, profile with ID-verification status and levels, visit preview. All labelled previews, none bookable'],
];

export const NOT_YET: [string, string][] = [
  ['Real integrations', 'No real SMS OTP, WhatsApp, IVR, LLM, maps or payments: all simulated and labelled'],
  ['Persistence', 'The demo day lives in the browser; only sign-in and the household name have a Supabase backend (in the app build)'],
  ['Owner UI in Hindi and Marathi', 'Helper and friend messages are translated; owner screens are English only (a listed cut-order item)'],
  ['Admin console', 'Ops dashboard, audit-log viewer, method-mix BI dashboard (PS-070 to PS-072, PS-117) are not built; pilot switches are shown read-only'],
  ['Rights requests flow', 'Entry points exist; the request form, grievance tracking and breach runbook (PS-119, PS-120) are not built'],
  ['Shareable helper record', 'Switched off for the pilot (PS-104); helper sees "not switched on yet"'],
  ['Camera look-in, steps challenge, thank-you points', 'Pilot switches off; not represented beyond the switch list'],
  ['Live location during a visit', 'Setting exists; no map or tracking UI (open privacy question in the PRD)'],
  ['Translations review', 'Hindi and Marathi strings are drafts and need native-speaker review'],
];

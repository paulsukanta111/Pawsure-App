# Build status

## Done

- **Rules engine** (`packages/domain`): all P0 trust, escalation, Friend Finder, covered-day, code-card and rewards rules, with 68 tests from the PRD's tables and section 17.1.
- **Schema** (`supabase/migrations/20261107000001_p0_core_schema.sql`): section 12.2 entities, RLS on every table, append-only audit and task history, `create_household()` RPC, pilot feature switches with PRD defaults. **Applied to the dev Supabase project** (`kwuswszyhyulnlfsqzce`, Tokyo) with the advisor fixes in `20261107000002_advisor_fixes.sql`. Verified live: one owner cannot read or write another household; anonymous users read nothing and cannot call `create_household`; RLS helper functions are not exposed over the API.
- **Design system**: tokens package with contrast tests, component library, in-app style guide (`docs/design-system.md`).
- **Demo sign-in**: welcome → mobile number + language + terms consent → code (shown on screen, `123456`) → signed in to a real Supabase demo account (`supabase/seed/demo_account.sql`). Session persists across reloads; sign-out is per device; consent is recorded (PS-002). Set `EXPO_PUBLIC_AUTH_MODE=otp` for real SMS OTP once a provider is configured. Signed-out users can't reach app screens.
- **App screens** (sample data except Me, which reads the household from Supabase): Today (who's caring, leaving check, timeline with confidence labels, health, day report), Find cover (PS-125 form → ranked friends → approval → live request state), Friends, Pet (health metric, reminders, routine, emergency card), Me, return check. Builds for web and Android (Hermes bundle).

## Next

1. Real OTP: enable an SMS provider in Supabase Auth (DLT-registered for India), then build with `EXPO_PUBLIC_AUTH_MODE=otp`. New real users need an onboarding step that creates their `people` row and household. Replace sample data on Today/Pet/Friends with Supabase reads.
   - **Web hosting:** the web build is a single-page app; the host must rewrite unknown paths to `index.html`.
   - **Before the pilot:** create a Mumbai (ap-south-1) project and re-run both migrations; the dev project is in Tokyo and the PRD requires data in India.
2. Edge functions: confidence evaluation on signal ingest, durable timer runner for `scheduled_jobs`, care-day computation at IST midnight.
3. WhatsApp and IVR adapters + local simulators (vendor still to be chosen).
4. Ask Pawsure LLM parser with 8 s timeout → form fallback (PS-125).
5. Onboarding (O1), routine builder, care-circle invite and helper consent (W1–W5), admin console, rights requests.
6. Hindi and Marathi strings.

## Open decisions carried from the PRD

Vendors (WhatsApp BSP, IVR, SMS/DLT, LLM), ID check for nearby members, counsel sign-off on retention, final illustrations.

One rule interpretation to confirm: PRD 5.1 says Confirmed needs "task evidence plus visit evidence from a different channel", while the 10.5 table lists only *photo with today's code* + visit evidence. The engine follows the stricter table: a photo **without** a code plus a full visit is Likely, not Confirmed.

## Demo account

Dev project only. `demo.owner@example.com` / `pawsure-demo-2026`, owner of "Neha's home" with Bruno, Sunita and Bruno's routine. These credentials are in the app bundle by design; they unlock only the demo household. **Never run `supabase/seed/demo_account.sql` on the pilot project.**

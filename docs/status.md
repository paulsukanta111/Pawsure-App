# Build status

## Done

- **Rules engine** (`packages/domain`): all P0 trust, escalation, Friend Finder, covered-day, code-card and rewards rules, with 68 tests from the PRD's tables and section 17.1.
- **Schema** (`supabase/migrations/20261107000001_p0_core_schema.sql`): section 12.2 entities, RLS on every table, append-only audit and task history, `create_household()` RPC, pilot feature switches with PRD defaults. **Applied to the dev Supabase project** (`kwuswszyhyulnlfsqzce`, Tokyo) with the advisor fixes in `20261107000002_advisor_fixes.sql`. Verified live: one owner cannot read or write another household; anonymous users read nothing and cannot call `create_household`; RLS helper functions are not exposed over the API.
- **Design system**: tokens package with contrast tests, component library, in-app style guide (`docs/design-system.md`).
- **App screens** (demo data, no backend yet): Today (who's caring, leaving check, timeline with confidence labels, health, day report), Find cover (PS-125 form → ranked friends → approval → live request state), Friends, Pet (health metric, reminders, routine, emergency card), Me, return check. Builds for web and Android (Hermes bundle).

## Next

1. Phone OTP sign-in: needs an SMS provider enabled in Supabase Auth (DLT-registered for India). Client, types and OTP helpers are in `apps/mobile/src/lib/`. Then replace demo data.
   - **Before the pilot:** create a Mumbai (ap-south-1) project and re-run both migrations; the dev project is in Tokyo and the PRD requires data in India.
2. Edge functions: confidence evaluation on signal ingest, durable timer runner for `scheduled_jobs`, care-day computation at IST midnight.
3. WhatsApp and IVR adapters + local simulators (vendor still to be chosen).
4. Ask Pawsure LLM parser with 8 s timeout → form fallback (PS-125).
5. Onboarding (O1), routine builder, care-circle invite and helper consent (W1–W5), admin console, rights requests.
6. Hindi and Marathi strings.

## Open decisions carried from the PRD

Vendors (WhatsApp BSP, IVR, SMS/DLT, LLM), ID check for nearby members, counsel sign-off on retention, final illustrations.

One rule interpretation to confirm: PRD 5.1 says Confirmed needs "task evidence plus visit evidence from a different channel", while the 10.5 table lists only *photo with today's code* + visit evidence. The engine follows the stricter table: a photo **without** a code plus a full visit is Likely, not Confirmed.

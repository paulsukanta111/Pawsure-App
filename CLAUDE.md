# Pawsure: notes for Claude

- Source of truth is the Pawsure PRD v1.3. Cite requirement IDs (PS-xxx) in code comments and tests.
- Business rules live in `packages/domain` as pure functions. Change the rule and its test together; never put rule logic in screens or SQL.
- Screens use only `apps/mobile/src/design` components and semantic tokens. Add new colours to `packages/design-tokens` and add the pairing to the contrast test.
- Expo SDK 58: `Stack` comes from `expo-router/js-stack` and `Tabs` from `expo-router/js-tabs`. See `apps/mobile/AGENTS.md`.
- Install Expo packages with `npx expo install` (use `EXPO_OFFLINE=1` if the Expo API is unreachable).
- Check with `npm test` and `npx tsc --noEmit -p apps/mobile`. Build web with `npm run export:web -w @pawsure/mobile`.
- All day boundaries are IST (`packages/domain/src/time.ts`).

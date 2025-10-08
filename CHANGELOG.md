# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- date: 2025-10-08T22:13:00Z
  agent: copilot
  change: Created cosmic loading screen with orbiting emojis and rotating inspirational phrases
  why: User requested removal of "Entering the matrix..." text and wanted a more interesting, eclectic loading screen that fits the app's unconventional theme
  scope: [components/common/loading-spinner.tsx, app/loading.tsx]
  verification: build in progress, new 'cosmic' variant with 10 emojis orbiting, pulsing gradient orb, rotating phrases like "Consulting the cosmic vibes...", "Wrangling digital chaos..."
  followups: Verify loading screen appearance in production

- date: 2025-10-08T22:11:00Z
  agent: copilot
  change: Simplified page.tsx to remove loading screen hang
  why: App was stuck on loading screen due to ClientOnly wrapper showing Loading fallback; simplified to direct client component with useEffect to check localStorage
  scope: [app/page.tsx]
  verification: build PASS, removed ClientOnly and Suspense wrappers, now returns null during initial load then shows AnimalCodeForm or SessionBoard
  followups: Monitor for hydration issues

- date: 2025-10-08T21:56:00Z
  agent: copilot
  change: Fixed auth form import to use AnimalCodeForm directly
  why: Page was importing LoginForm which had issues; animal code authentication is the current system
  scope: [app/page.tsx]
  verification: build PASS, deployment ACTIVE
  followups: Test production authentication flow

- date: 2025-10-08T00:00:00Z
  agent: copilot
  change: Added complete Digital Ocean deployment support with Docker containerization
  why: User requested deployment to Digital Ocean App Platform instead of Vercel; required containerization and standalone Next.js build configuration
  scope: [Dockerfile, .dockerignore, docker-compose.yml, next.config.mjs, docs/deploy-digitalocean.md]
  verification: build PASS (with standalone output), tests PASS (9 suites), Docker multi-stage build configured
  followups: Test Docker build locally before deploying to Digital Ocean

- date: 2025-08-17T18:00:00Z
  agent: copilot
  change: Implemented animal code authentication system to replace OAuth/Google authentication
  why: User requested complete OAuth removal ("IM NOT GOING TO HAVE OATH LETS JUST remove that") for simplified authentication with user identity tracking
  scope: [components/auth/animal-code-form.tsx, hooks/use-session.ts, hooks/use-tasks.ts, app/page.tsx, lib/types.ts, components/session/session-board.tsx, components/tasks/task-item.tsx]
  verification: build PASS, dev server running, animal form functional with localStorage persistence
  followups: Phase 3C testing and Phase 4 database schema updates

 - MVP client-only share/reply links and copy-to-clipboard in SessionHeader; added missing Textarea UI component.
 - SessionBoard now uses `useSession` and `useTasks` hooks; runtime pulls from Supabase when configured instead of inline mock data.
 - Documented no-debt plan for per-user choices (task_choices table + RLS + `useTaskChoices` hook) to support yes/no/maybe per recipient.

- date: 2025-08-15
- agent: copilot | gemini | human
- change: Short description of the change
- why: The intent and trade-offs
- scope: Files touched
- verification: Build/tests outcome
- followups: Optional next actions
### Fixed
- date: 2025-08-18
  agent: gemini
  change: Fixed all linting and TypeScript errors.
  why: The codebase was in a broken state with multiple syntax and type errors. This change resolves all of them, allowing the project to be built and run successfully.
  scope: [hooks/use-tasks.ts, components/session/session-board.tsx]
  verification: npm run check PASS
  followups: None
- Resolved a critical security vulnerability by force-updating dependencies via `npm audit fix`.
 - Server actions env assertion now runs before input validation, ensuring tests correctly fail when Supabase env is missing.
 - Supabase health integration test now lazy-inits the client inside tests, preventing env errors when the test suite is skipped by default.

### Changed
- date: 2025-08-17T18:10:00Z
  agent: copilot
  change: Regenerated use-session hook to use anonymous Supabase authentication with localStorage session persistence
  why: Simplified authentication flow using animal codes instead of email/password OAuth
  scope: [hooks/use-session.ts, tests/lib/actions.test.ts]
  verification: typecheck PASS, tests PASS after regeneration
  followups: Complete task system userName integration

- date: 2025-08-17T18:15:00Z
  agent: copilot
  change: Updated Supabase database schema to support anonymous authentication with user name tracking
  why: Enable animal code authentication with proper user identity persistence in database
  scope: [docs/supabase-schema.sql]
  verification: schema migration script ready for Supabase deployment
  followups: Apply schema in Supabase SQL Editor

- date: 2025-08-17T18:12:00Z
  agent: copilot
  change: Updated task system to include userName in all operations and display user identity in UI
  why: Enable user identity tracking for logging ("Sarah: Buy groceries") per user requirements
  scope: [hooks/use-tasks.ts, components/session/session-board.tsx, components/tasks/task-item.tsx, lib/types.ts]
  verification: build PASS, user names display in task items
  followups: Phase 3C verification testing

### Removed
- date: 2025-10-08T00:00:00Z
  agent: copilot
  change: Removed empty test files causing test suite failures
  why: Cleanup from previous OAuth removal - test files existed but had no tests after OAuth components were deleted
  scope: [tests/lib/actions-trap-login.test.ts, tests/lib/actions-oauth.test.ts, components/auth/google-signin-button.test.tsx]
  verification: test suite now runs cleanly (9 passing suites instead of failures)
  followups: None - test cleanup complete

- date: 2025-08-17T18:05:00Z
  agent: copilot
  change: Completely removed OAuth/Google authentication system including login/signup forms and auth pages
  why: User explicitly requested OAuth removal for simplified animal code authentication
  scope: [components/auth/login-form.tsx, components/auth/signup-form.tsx, components/auth/google-signin-button.tsx, app/auth/login/page.tsx, app/auth/signup/page.tsx, tests for deleted components]
  verification: build PASS, no broken imports after cleanup
  followups: None - OAuth completely eliminated

- Runtime now prefers real Supabase by default; removed rich runtime mock fallback. Added a minimal no-op stub only to prevent crashes when env is missing (tests still use explicit mocks). Verified with typecheck, tests, and production build.
 - Removed runtime mock fallback from `use-tasks`; all CRUD now flows through Supabase when configured. Unit tests mock the Supabase client.
 - Refactored `components/session/session-board.tsx` to rely on hooks, reducing direct mock usage and aligning with Supabase-first runtime.

---

## AI Notes

This section tracks contributions made by AI assistants like Gemini and GitHub Copilot.

### Gemini

- **2025-08-15**:
    - Added `prettier` as a dev dependency.
    - Created the initial GitHub Actions workflow for code quality (`.github/workflows/quality-checks.yml`).
    - Created this `CHANGELOG.md` file.
    - Ran `npm audit fix --force` to resolve a critical security vulnerability.

### GitHub Copilot

- **2025-08-16**:
    - change: Supabase-first pass: removed runtime mocks from `use-tasks`, refactored `SessionBoard` to hooks, and moved env assertion earlier in server actions.
    - why: Eliminate drift between mock and real paths; ensure consistent behavior and enable DB work.
    - scope: `hooks/use-tasks.ts`, `components/session/session-board.tsx`, `lib/actions.ts`, tests, `aitalk`, `CHANGELOG.md`.
    - verification: Tests PASS (11/11), typecheck PASS, build PASS; branch pushed to origin.
    - followups: Implement per-user choices with `task_choices` table, RLS, Realtime, and a `useTaskChoices` hook; wire radios to set per-user choice.

- **2025-08-15**:
    - change: Implemented client-only share link (session param) and reply link (answers param) flow; added `components/ui/textarea.tsx`; parsed URL params in `SessionBoard` and passed to header; copy-to-clipboard with toasts.
    - why: Enable quick MVP where you can share a URL, your partner can answer and send back a reply URL without backend wiring.
    - scope: `components/ui/textarea.tsx`, `components/session/session-header.tsx`, `components/session/session-board.tsx`, `aitalk`, `CHANGELOG.md`.
    - verification: Typecheck/build to be run; minimal UI-only changes should compile. Next step to run `npm run build`.
    - change: Fixed Next.js build by installing missing deps, renaming `lib/toast.ts` to `.tsx`, replacing deprecated `useActionState` with `useFormState`, fixing framer-motion props on Button, typing mock data and realtime hook, and correcting `jest.config.ts` syntax.
    - why: Unblock build to enable mock-mode run and future Supabase integration. Kept edits minimal and localized.
    - scope: `lib/toast.tsx`, `components/auth/*`, `components/vibes/vibe-selector.tsx`, `hooks/use-realtime.ts`, `lib/mock-data.ts`, `jest.config.ts`, `.env.example`, `aitalk`.
    - verification: Local build invoked; errors iteratively resolved. Final green build pending after jest config fix in current session.
    - followups: Run `npm run build` and `npm run dev` to confirm green; coordinate with Gemini via `aitalk` for next steps.

- **2025-08-15**:
    - change: Env-gated Supabase wiring; added browser and server clients, adapted server actions and `use-tasks` to call Supabase when configured, preserving mock fallback to keep tests/dev working.
    - why: Allow immediate development with mocks and seamless opt-in to Supabase via env vars.
    - scope: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/actions.ts`, `hooks/use-tasks.ts`, `aitalk`, `CHANGELOG.md`.
    - verification: Pending typecheck/build/tests.
    - followups: Add `useSession` real wiring; add SQL schema docs; verify OAuth redirect URIs.

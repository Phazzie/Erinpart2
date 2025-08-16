# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Identified undocumented code and created a list of suggestions (`docs/documentation-suggestions.md`).
- Expanded Gemini parallel tasking and coordination in `aitalk`; updated lock TTL and guidance (agent=copilot).
- Polished share/reply docs with examples and caveats (`docs/share-reply.md`).
- Added unit tests for `use-session` hook (mock Supabase).
- Ensured CI runs jest tests and typecheck (`.github/workflows/quality-checks.yml`).
- Documented env setup and OAuth redirects (`README.md`, `.env.example`).
- Authored SQL schema and RLS policies for Supabase (`docs/supabase-schema.md`).
- Resolved lint/type issues within allowed scope.
- Drafted RFC for Supabase integration (`docs/supabase-wiring.md`).
- Setup GitHub Actions for code quality checks (linting, type-checking, formatting).
 - MVP client-only share/reply links and copy-to-clipboard in SessionHeader; added missing Textarea UI component.
- Env-gated Supabase wiring (client + server clients, server actions integration, optional Supabase path in `use-tasks`), preserving mock fallback.
 - SessionBoard now uses `useSession` and `useTasks` hooks; runtime pulls from Supabase when configured instead of inline mock data.

### Changelog Entry Template
- date: 2025-08-15
- agent: copilot | gemini | human
- change: Short description of the change
- why: The intent and trade-offs
- scope: Files touched
- verification: Build/tests outcome
- followups: Optional next actions

### Fixed
- Resolved a critical security vulnerability by force-updating dependencies via `npm audit fix`.
 - Server actions env assertion now runs before input validation, ensuring tests correctly fail when Supabase env is missing.

### Changed
- Runtime now prefers real Supabase by default; removed rich runtime mock fallback. Added a minimal no-op stub only to prevent crashes when env is missing (tests still use explicit mocks). Verified with typecheck, tests, and production build.

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

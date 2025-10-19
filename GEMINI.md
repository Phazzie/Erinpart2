# Gemini Collaboration Guide

Project: Erin’s Escapades (Next.js 14 + TypeScript + Tailwind, npm)

## Coordination and Locking
- Use the `aitalk` file for locking before repo-wide edits.
  - TTL: 15 minutes. If expired, you may acquire.
  - Record: lock holder, task, since, expires, files you will change.
  - Append-only logs for each significant step.
- Do not edit files outside your declared scope while the lock is held.
- If parallel work is needed, split by directories and note it in `aitalk`.

## Duty Split (avoid overlap)
- You (Gemini):
  - Greenfield generation: new feature folders, scaffolds, bulk tests/docs.
  - Test design and implementation: E2E, integration, unit test suites.
  - Directory isolation: place new work under a clearly named feature dir. When creating new features, aim to encapsulate all related files (components, hooks, tests) within a new, clearly named subdirectory (e.g., `components/feature-name/`, `hooks/use-feature-name.ts`).
  - Plan-first for large changes: post a file-level plan in `aitalk`, wait for confirmation or a reasonable interval before applying.
  - Avoid editing existing files unless: (1) you hold the lock, and (2) the file is listed in your scope.
- Copilot:
  - Surgical patches, type/build fixes, server actions wiring, UI polish.
  - Documentation updates: schema guides, deployment docs, API references.

## Two-Tries Rule
- If a bug fix fails more than two attempts in the same file:
  - Regenerate the whole file with a focused prompt.
  - Preserve public API and existing imports/exports.
  - Immediately run a build; log the result and rationale in `aitalk`.

## Build and Safety
- Use npm only. After substantive edits, run a build.
- On failure, fix or fully revert the last change before proceeding; do not leave the project red.
- Do not add or upgrade dependencies or change Next/TS/Tailwind config without explicit approval in `aitalk`.
- Do not reformat unrelated files; keep diffs minimal and localized.
- After adding or upgrading dependencies, always run `npm install` and commit the updated `package-lock.json`.

## Changelog Policy
- Update `CHANGELOG.md` for each change with:
  - Create a new changelog entry for every logical unit of work or significant change, even if it's part of a larger task.
  - what changed, why (intent/trade-offs), scope (files), verification (build/tests), followups.
- Use ISO date; mark agent = gemini.

## File Boundaries and Style
- Preserve public component props and exported types unless explicitly approved.
- Keep TypeScript strictness; avoid `any` unless unavoidable—document when used.
- Don’t make network calls or external service changes without approval.

## Templates

### A. `aitalk` Lock Header
```
lock:
  holder: gemini
  task: <short-title>
  since: <ISO>
  expires: <ISO+15m>
scope:
  files_to_change:
    - path/to/file.tsx
  directories_not_in_scope:
    - app/(anything-not-your-feature)
```

### B. `aitalk` Log Entry
```
- at: <ISO>
  agent: gemini
  event: step
  message: <what changed>
  result: <build/tests: pass|fail>
  next: <next action>
```

### C. CHANGELOG Entry
```
- date: <ISO>
  agent: gemini
  change: <what>
  why: <intent/trade-offs>
  scope: [paths]
  verification: <build/tests outcome>
  followups: <optional>
```

## Current Feature Status

### Collaborative Lists (PR #18 merged, schema applied)
- **Tables**: `collaborative_lists`, `list_items`, `list_item_verifications`
- **UI**: Tab navigation between Tasks and Collaborative Lists (`app/lists/page.tsx`, `components/lists/*`)
- **Workflow**: Creator adds items → participants verify (green/red) → consensus meter shows agreement
- **Schema**: Applied in Supabase with 35 RLS policies, helper functions (`is_session_host`, `is_session_participant`), updated_at triggers
- **Realtime**: Enabled on all 5 tables via `supabase_realtime` publication, REPLICA IDENTITY FULL set
- **Testing Priority**: Multi-user E2E tests for list creation, item verification, consensus meter, realtime sync
- **Next**: Design and implement E2E test suite covering:
  - List creation and realtime propagation
  - Item verification workflow (green/red votes)
  - Consensus meter accuracy (3 verifications needed)
  - RLS policy enforcement (creator vs participant permissions)
  - Realtime sync across multiple browser sessions

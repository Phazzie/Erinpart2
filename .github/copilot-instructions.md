# Copilot Collaboration Guide

Project: Erin’s Escapades (Next.js 14 + TypeScript + Tailwind, npm)

## Coordination and Locking
- Use the `aitalk` file to acquire a lock before repo-wide edits.
  - TTL 15 minutes; include task, since, expires, and files you will change.
  - Append-only logs for each step; release or extend lock as needed.
- Keep edits within your declared scope while locked.

## Duty Split (avoid overlap)
- You (Copilot):
  - Small, surgical patches; fix build/type errors; server actions wiring; UI polish.
  - After 3–5 edits or >3 files changed, checkpoint in `aitalk` (what changed, next).
  - Documentation updates: schema guides, deployment docs, API references.
- Gemini:
  - New feature scaffolds, bulk content (tests/docs), large codegen in isolated dirs.
  - Test design and implementation: E2E, integration, unit test suites.

## Two-Tries Rule
- If a specific bug takes more than two attempts in a file:
  - Regenerate the whole file with a focused prompt while preserving public APIs.
  - Immediately run a build; log outcome and rationale in `aitalk`.

## Build and Safety
- Use npm only. After substantive code changes, run a build.
- If build fails, fix or revert immediately. Do not leave the repo red.
- Don’t add/upgrade dependencies or change config (Next/TS/Tailwind) without explicit approval in `aitalk`.
- Don’t reformat unrelated files; keep diffs minimal and localized.
- After adding or upgrading dependencies, always run `npm install` and commit the updated `package-lock.json`.

## Changelog Policy
- For every change, update `CHANGELOG.md` with:
  - Create a new changelog entry for every logical unit of work or significant change, even if it's part of a larger task.
  - what changed, why, scope (files), verification (build/tests), followups.
  - Use ISO date; agent = copilot.

## Style and Boundaries
- Preserve component APIs and exported types unless approved.
- Maintain TypeScript strict mode; avoid `any` unless necessary—document when used.
- No external network calls or service changes without approval.

## Database Schema Changes
- Schema migrations are applied in Supabase cloud project via SQL Editor.
- After schema changes, update `docs/supabase-apply.md` if the schema evolved.
- Document helper functions, triggers, and indexes in the apply guide.
- Verify realtime publication membership after adding new tables.
- Log schema application in `CHANGELOG.md` and `aitalk` with verification details.

## Templates

### A. `aitalk` Lock Header
```
lock:
  holder: copilot
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
  agent: copilot
  event: step
  message: <what changed>
  result: <build/tests: pass|fail>
  next: <next action>
```

### C. CHANGELOG Entry
```
- date: <ISO>
  agent: copilot
  change: <what>
  why: <intent/trade-offs>
  scope: [paths]
  verification: <build/tests outcome>
  followups: <optional>
```

## Current Feature Status

### Collaborative Lists (PR #18 merged, schema applied)
- **Tables**: `collaborative_lists`, `list_items`, `list_item_verifications`
- **UI**: Tab navigation between Tasks and Collaborative Lists
- **Workflow**: Creator adds items → participants verify (green/red) → consensus meter shows agreement
- **Schema**: Applied in Supabase with 35 RLS policies, helper functions, updated_at triggers
- **Realtime**: Enabled on all 5 tables (tasks, task_choices, collaborative_lists, list_items, list_item_verifications)
- **Next**: E2E testing with multiple users, monitor realtime sync and RLS behaviors

# GitHub Coding Agent - Deep QA Audit Handoff

## Your Assignment

Read and execute the comprehensive code audit specified in **`DEEP_QA_AUDIT_TASK.md`**.

## Critical Starting Point

**BEFORE ANYTHING ELSE**, read these Supabase files completely:

1. `lib/supabase/client.ts` - Supabase initialization and configuration
2. `docs/supabase-schema.sql` - Database schema (source of truth)
3. `supabase-schema-TO-APPLY.sql` - RLS policies and constraints
4. Search entire codebase for all Supabase method calls:
   - `.from('tasks')` - Find all task queries
   - `.from('sessions')` - Find all session queries
   - `.insert(`, `.update(`, `.delete(`, `.select(` - Verify error handling

## Why Supabase First?

Supabase is the backend database. If this integration is broken:
- Tasks won't save
- Users can't join sessions
- Realtime sync won't work
- RLS policies might block legitimate operations
- App might crash when Supabase is not configured

## Your Deliverables

Create a PR with:
- ✅ All critical bugs fixed (especially Supabase-related)
- ✅ All E2E tests passing (4/4 in multi-user.spec.ts)
- ✅ No TypeScript errors
- ✅ No infinite recursion errors
- ✅ Updated BUG_AUDIT.md with findings
- ✅ Updated CHANGELOG.md with all fixes
- ✅ Updated TESTING_CHECKLIST.md with test results

## Recent Context

### Just Fixed
- ✅ PR #13 merged - Infinite recursion in task creation (useCallback dependencies)
- ✅ E2E test selectors fixed - Changed textarea → input (not yet verified to pass)

### Known Issues to Investigate
1. **E2E Tests** - 4 tests were failing with timeouts, selectors fixed but need to verify they pass
2. **Session ID Race Condition** - Multiple users might create same session
3. **Anonymous Auth** - Might create duplicate users
4. **Task Creation** - Verify `created_by` field always set (RLS requirement)
5. **Realtime Sync** - Check for race conditions between optimistic updates and Supabase

### Files Recently Modified
- `hooks/use-tasks.ts` - Fixed infinite recursion
- `tests/e2e/multi-user.spec.ts` - Fixed selectors
- `components/session/session-board.tsx` - May still have issues

## Success Criteria

Run these commands and get all green:
```bash
npm run build              # No errors
npx tsc --noEmit          # No TypeScript errors
npx playwright test       # All tests pass
npm test                  # Unit tests pass
```

Manual testing:
- Create a session with animal codes
- Add tasks (should not get infinite recursion)
- Have second user join same session
- Verify realtime sync works
- Check browser console for errors (should be none)

## Coordination

- Update `aitalk` file every 30 minutes with progress
- Mark items in `DEEP_QA_AUDIT_TASK.md` as you complete them
- Document all bugs found in `BUG_AUDIT.md`
- Document all fixes in `CHANGELOG.md`

## Remember

**Code is source of truth.** Don't trust:
- Comments (they lie)
- Documentation (it's outdated)
- Variable names (they're misleading)
- Type assertions (`as Task`, `as any`)

**Read the actual implementation.** Trace data flows. Test your theories. Fix root causes.

Good hunting! 🐛🔫

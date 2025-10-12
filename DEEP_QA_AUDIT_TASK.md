# Deep QA & Code Audit Task for GitHub Coding Agent

## Mission
Perform **extensive quality assurance, code auditing, and bug fixing** across the entire Erin's Escapades codebase. Your job is to be a relentless bug hunter and code quality enforcer.

## 🚨 **CRITICAL: READ ALL SUPABASE CODE FIRST**
Before anything else, read these files completely:
1. `lib/supabase/client.ts` - How Supabase is initialized
2. `docs/supabase-schema.sql` - The ACTUAL database schema
3. `supabase-schema-TO-APPLY.sql` - RLS policies and constraints
4. Search codebase for ALL `.from('tasks')` and `.from('sessions')` calls
5. Verify EVERY Supabase call has error handling and "not configured" checks

**Why this matters:** Supabase is the backend. If this is wrong, everything breaks.

## Critical Rules
1. **CODE IS SOURCE OF TRUTH** - Do NOT rely on docs, comments, or assumptions. Read the actual implementation.
2. **VERIFY EVERYTHING** - Test your theories by reading the actual code paths, not inferring from names.
3. **FOLLOW THE DATA** - Trace how data flows through the app from user input → state → database (Supabase) → UI.
4. **CHECK ALL EDGE CASES** - Empty states, loading states, error states, race conditions, null/undefined handling.
5. **NO SUPERFICIAL FIXES** - Don't just add null checks. Understand WHY something might be null and fix the root cause.
6. **SUPABASE DOUBLE-CHECK** - Every data operation must work both WITH and WITHOUT Supabase configured.

## Audit Areas (In Priority Order)

### 1. **Critical Data Flow Bugs** 🔴
Trace these data flows end-to-end by reading the actual code:

#### Task Creation Flow
- [ ] Read `components/session/session-board.tsx` → `handleAddTask` implementation
- [ ] Trace to `hooks/use-tasks.ts` → `addTask` function
- [ ] Check optimistic updates vs. Supabase reality
- [ ] Verify `created_by` field is always set correctly (RLS requirement)
- [ ] Check error handling - what happens if Supabase insert fails?
- [ ] Check infinite recursion potential in useCallback dependencies

#### Session Creation & Joining Flow
- [ ] Read `components/auth/animal-code-form.tsx` → form submission
- [ ] Trace how `sessionId` is generated (localStorage? URL params? both?)
- [ ] Check for race conditions: What if two users create same animal combo simultaneously?
- [ ] Verify localStorage sync with URL params - can they get out of sync?
- [ ] Check `use-session.ts` → how does it handle existing sessions vs. new sessions?
- [ ] Verify anonymous auth doesn't create duplicate users on every page load

#### Realtime Sync
- [ ] Read `hooks/use-realtime.ts` implementation line by line
- [ ] Check if realtime updates can arrive BEFORE optimistic updates complete
- [ ] Verify no duplicate tasks from race between optimistic + realtime
- [ ] Check unsubscribe logic - memory leaks possible?
- [ ] Trace what happens when Supabase is not configured

### 2. **Type Safety & Runtime Type Mismatches** 🟡
TypeScript lies. Runtime is truth.

- [ ] Read `lib/types.ts` - compare Task type to actual Supabase schema
- [ ] Check every place Tasks are created - do they match the type exactly?
- [ ] Look for `as Task` or `as any` type assertions - these are lies
- [ ] Find places where optional fields might be missing at runtime
- [ ] Check `session_id` field - is it always present when expected?
- [ ] Verify `created_by` field existence in all task objects

### 3. **React Hooks & Re-render Loops** 🟡
Read the actual dependency arrays and useState/useCallback usage:

- [ ] Check EVERY `useCallback` in the codebase - are dependencies correct?
- [ ] Check EVERY `useEffect` - are dependencies correct?
- [ ] Look for `setState` calls that might trigger re-renders
- [ ] Find places where object/array references change on every render
- [ ] Check for infinite loops in effect chains
- [ ] Verify `useTransition()` is not used with imperative navigation

**Files to audit line-by-line:**
- `hooks/use-tasks.ts` - Already fixed once, might have more issues
- `hooks/use-session.ts` - Session management is critical
- `hooks/use-realtime.ts` - Complex lifecycle
- `components/session/session-board.tsx` - Main orchestration

### 4. **Error Handling Gaps** 🟡
Find every place where errors are swallowed or not handled:

- [ ] Search for `catch` blocks - what do they actually do?
- [ ] Find `try/catch` without proper error messages
- [ ] Check if errors show user-friendly toasts vs. just console.error
- [ ] Look for promises without `.catch()` or try/catch
- [ ] Find async functions that don't handle errors
- [ ] Check if Supabase errors are properly surfaced to users

### 5. **E2E Test Failures** 🔴
The tests are telling you something - listen to them:

- [ ] Run `npx playwright test tests/e2e/multi-user.spec.ts`
- [ ] Read test output carefully - what's ACTUALLY failing, not what you think
- [ ] Check if test selectors match actual HTML (like textarea vs input)
- [ ] Verify test assumptions about timing (waits, animations, transitions)
- [ ] Look for race conditions in tests (check the actual page state)
- [ ] Make tests pass by fixing THE CODE, not just changing tests

**Test files:**
- `tests/e2e/multi-user.spec.ts` - Multi-user session joining (recently fixed selectors)
- Any other Playwright tests in `tests/e2e/`

### 6. **State Management & localStorage** 🟢
Read how state is persisted and retrieved:

- [ ] Check `animal-code-form.tsx` - how is user data stored in localStorage?
- [ ] Verify localStorage keys are consistent across files
- [ ] Check for localStorage.getItem without null checks
- [ ] Look for JSON.parse without try/catch
- [ ] Verify localStorage is checked before `window` access (SSR safety)
- [ ] Check if localStorage can get stale/out-of-sync with server

### 7. **Supabase Integration Issues** � **CRITICAL - READ ALL SUPABASE CODE**
Read EVERY file that touches Supabase:

**Core Supabase Files (READ LINE BY LINE):**
- [ ] `lib/supabase/client.ts` - How is client initialized? What's the `isSupabaseConfigured` logic?
- [ ] `docs/supabase-schema.sql` - What's the ACTUAL database schema? What fields are required?
- [ ] `docs/supabase-wiring.md` - Read the documentation but VERIFY against actual code

**RLS (Row Level Security) Policies:**
- [ ] Read `supabase-schema-TO-APPLY.sql` - What RLS policies exist?
- [ ] Check if `created_by` field is ALWAYS set when creating tasks
- [ ] Verify users can only access their own sessions (or sessions they joined)
- [ ] Check if anonymous users work with RLS policies
- [ ] Look for `auth.uid()` usage in RLS - does it match our auth flow?

**Supabase Method Calls (FIND ALL OCCURRENCES):**
- [ ] Search for `.from('tasks')` - List all places that query tasks table
- [ ] Search for `.from('sessions')` - List all places that query sessions table  
- [ ] Search for `.insert(` - Check if all required fields are provided
- [ ] Search for `.update(` - Check if updates can affect wrong rows
- [ ] Search for `.delete(` - Check if deletes are properly scoped
- [ ] Search for `.select(` - Check if queries handle empty results

**Realtime Subscriptions:**
- [ ] Read `hooks/use-realtime.ts` completely - How does it work?
- [ ] Check if subscriptions are cleaned up on unmount
- [ ] Verify subscription filters match data queries
- [ ] Check if realtime works when Supabase is not configured
- [ ] Look for duplicate subscription setup

**Error Handling:**
- [ ] Find every Supabase query - do they all have error handling?
- [ ] Check if Supabase errors show user-friendly messages
- [ ] Look for `.single()` calls - what happens if no rows or multiple rows?
- [ ] Check if network errors are handled gracefully

**"Not Configured" Mode:**
- [ ] What happens when `NEXT_PUBLIC_SUPABASE_URL` is missing?
- [ ] Does app work in local-only mode without Supabase?
- [ ] Check if `isSupabaseConfigured` is checked before EVERY Supabase call
- [ ] Verify localStorage fallback works correctly

**Database Schema Mismatches:**
- [ ] Compare `lib/types.ts` Task interface to `docs/supabase-schema.sql`
- [ ] Check if optional fields in TypeScript are nullable in database
- [ ] Verify all required fields are always provided
- [ ] Look for type assertions that hide schema mismatches

### 8. **Loading & Error States** 🟢
Check every component for proper state handling:

- [ ] Find components that show data without checking loading state
- [ ] Look for missing loading spinners
- [ ] Check if error states show helpful messages
- [ ] Verify empty states (no tasks, no sessions, etc.)
- [ ] Check "Loading..." text vs actual loading state logic

### 9. **Security & Data Validation** 🟡
- [ ] Check user input sanitization before Supabase insert
- [ ] Verify SQL injection isn't possible (Supabase should handle this)
- [ ] Check if users can access/modify other users' sessions
- [ ] Verify session IDs can't be guessed/brute-forced
- [ ] Check if secret tasks are properly hidden from non-owners

### 10. **Performance & Memory Leaks** 🟢
- [ ] Look for event listeners that aren't cleaned up
- [ ] Check realtime subscriptions - are they unsubscribed?
- [ ] Find large objects in state that could be optimized
- [ ] Check for unnecessary re-renders (React DevTools?)
- [ ] Look for leaked setInterval/setTimeout

## How to Execute This Audit

### Step 1: Build & Test Baseline
```bash
# Make sure everything compiles
npm run build

# Run all tests to see current state
npm test
npx playwright test

# Check for TypeScript errors
npx tsc --noEmit
```

### Step 2: Systematic Code Reading
For each file, read EVERY line:
1. Start with entry points: `app/page.tsx`, `app/layout.tsx`
2. Follow imports to understand dependencies
3. Read hooks next: `hooks/use-tasks.ts`, `use-session.ts`, `use-realtime.ts`
4. Read components: Start with `session-board.tsx`
5. Read server actions: `lib/actions.ts`

### Step 3: Test Your Findings
- Don't just report bugs - **FIX THEM**
- Write tests for bugs you find
- Verify fixes don't break other things
- Run the app locally and test manually

### Step 4: Document Everything
Update these files as you go:
- `BUG_AUDIT.md` - Add new bugs you find, mark fixed ones
- `CHANGELOG.md` - Document every fix with proper format
- `TESTING_CHECKLIST.md` - Update test results
- `aitalk` - Log your progress every 30 minutes

## Expected Output

Create a PR with:
1. **All critical bugs fixed** (red 🔴 items)
2. **All E2E tests passing** (4/4 tests in multi-user.spec.ts)
3. **Updated BUG_AUDIT.md** with findings and fixes
4. **Updated CHANGELOG.md** with all changes
5. **Test coverage** for bugs you fixed

## Success Criteria
- ✅ `npm run build` succeeds with no errors
- ✅ `npx playwright test` shows 4/4 tests passing
- ✅ No infinite recursion errors
- ✅ Tasks can be created, updated, deleted without errors
- ✅ Multiple users can join same session
- ✅ Realtime sync works correctly
- ✅ No TypeScript errors (`npx tsc --noEmit`)
- ✅ No console errors when using the app

## Red Flags to Watch For
- **"This should work"** - No, read the code and VERIFY it works
- **"The docs say..."** - Docs lie, code is truth
- **"I'll assume..."** - Never assume, always verify
- **Type assertions** - `as Task`, `as any` - These are lies hiding bugs
- **Silent failures** - `catch(err) { console.error(err) }` without user feedback
- **Magic numbers** - Hardcoded timeouts, array indices, etc.
- **Copy-paste code** - Same logic repeated = bug breeding ground

## Tools at Your Disposal
- `grep_search` - Find patterns across codebase
- `read_file` - Read actual source code
- `semantic_search` - Find related code
- `get_errors` - Check TypeScript/lint errors
- `run_in_terminal` - Run tests, build, etc.
- `replace_string_in_file` - Fix bugs

## Remember
You are a **relentless bug hunter**. Your job is to make this codebase rock-solid. Don't stop until:
- All tests pass
- No TypeScript errors
- No runtime errors
- No infinite loops
- Data flows correctly end-to-end
- Users can't break the app no matter what they do

**Trust the code, not the comments. Verify everything. Fix root causes, not symptoms.**

Good hunting! 🐛🔫

# Complete Fix List for Animal Code Authentication

## Issues Found:
1. Incomplete file cleanup (auth files still exist)
2. Broken tests importing deleted functions
3. Incomplete task system updates (userName not wired through)
4. Database schema not updated yet

## Complete Fix Plan:

### Phase A: Complete Cleanup (15 minutes)
- [ ] Delete remaining auth files:
  - [ ] `components/auth/google-signin-button.tsx`
  - [ ] `components/auth/login-form.tsx` 
  - [ ] `components/auth/google-signin-button.test.tsx` (empty)
- [ ] Delete/fix broken test files:
  - [ ] `tests/lib/actions-trap-login.test.ts` (DELETE - tests removed signIn)
  - [ ] `tests/lib/actions.test.ts` (REGENERATE - remove auth function tests)
  - [ ] `tests/lib/actions-oauth.test.ts` (DELETE - tests removed signInWithGoogle)
  - [ ] `tests/app-auth-callback.test.ts` (CHECK - might be OK)

### Phase B: Complete Task System Integration (30 minutes)
- [ ] Update `hooks/use-tasks.ts`:
  - [ ] Add userName parameter to addTask function
  - [ ] Add userName parameter to updateTask function
  - [ ] Pass userName to server actions
- [ ] Update `components/session/session-board.tsx`:
  - [ ] Get userName from useSession hook
  - [ ] Pass userName to task operations
  - [ ] Update task display to show user names
- [ ] Update `components/tasks/task-form.tsx`:
  - [ ] Accept userName prop and pass to addTask
- [ ] Update `components/tasks/task-item.tsx`:
  - [ ] Display user name in tasks: "Sarah: Buy groceries"
  - [ ] Pass userName to update operations

### Phase C: Verify Core Flow (15 minutes)
- [ ] Test animal form → localStorage storage
- [ ] Test session board detection of localStorage
- [ ] Test task creation with user names
- [ ] Test page refresh persistence
- [ ] Verify build still works
- [ ] Run fixed tests

### Phase D: Database Schema (10 minutes) - AFTER EVERYTHING WORKS
- [ ] Update `docs/supabase-schema.sql` with user_name columns
- [ ] Apply schema in Supabase
- [ ] Test database integration

## Regeneration Targets:
If any file takes >2 debugging attempts, REGENERATE completely:
- `tests/lib/actions.test.ts` (likely candidate)
- `hooks/use-tasks.ts` (if userName integration gets messy)
- `components/session/session-board.tsx` (if userName passing gets complex)

## Success Criteria:
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Animal form works: pick animals + name → join session
- [ ] Tasks show user names: "Sarah: Task text"
- [ ] Multiple users can join same session
- [ ] Page refresh preserves session
- [ ] No authentication required

## Risk Areas:
- TypeScript errors when updating hooks
- React hooks rules violations
- localStorage SSR issues
- Anonymous Supabase auth setup

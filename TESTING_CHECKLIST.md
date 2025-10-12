# Testing Checklist

This document tracks the progress of implementing a robust testing suite for this application.
Our chosen tools are **Jest** and **React Testing Library**.

**Last Updated:** 2025-10-12T10:15:00Z  
**Test Status:** 10/15 suites passing (67%), 48/54 tests passing (89%)

---

## Test Results Summary

### ✅ Passing Test Suites (10)
- `components/tasks/task-form.test.tsx`
- `tests/hooks/use-task-choices.test.ts`
- `tests/hooks/use-tasks-realtime.test.ts`
- `tests/hooks/use-task-choices-realtime.test.ts`
- `components/tasks/task-list.test.tsx`
- `tests/lib/actions.test.ts`
- `tests/hooks/use-realtime.test.ts`
- `tests/app-auth-callback.test.ts`
- `components/common/error-message.test.tsx`
- (1 skipped: supabase-health - requires live Supabase connection)

### ❌ Failing Test Suites (4)
1. **tests/e2e/multi-user.spec.ts** - Playwright E2E test, fails in Jest environment (needs separate Playwright runner)
2. **components/tasks/task-item.test.tsx** - Choice radio button test fails (UI structure mismatch)
3. **tests/hooks/use-session.test.ts** - Loading state test fails, window.location mock issue
4. **hooks/use-tasks.test.ts** - Tasks initialization test fails (Supabase mock issue)

---

## Needed Tests (High Priority)

These tests are critical for ensuring the application's core functionality is stable and reliable.

### Utilities (`lib/utils.ts`)
- [ ] Unit test each utility function for correct output.

### Core Hooks (`hooks/`)
- [x] **`use-tasks.ts`**: Unit test adding a task.
- [x] **`use-tasks.ts`**: Unit test removing a task.
- [x] **`use-tasks.ts`**: Unit test updating a task.
- [ ] **`use-tasks.ts`**: Mock Supabase client and test loading/error states.
- [ ] **`use-session.ts`**: Unit test login/logout logic.
- [ ] **`use-session.ts`**: Unit test session state management.

### Forms (`components/`)
- [x] **`login-form.tsx`**: Integration test successful submission.
- [x] **`login-form.tsx`**: Integration test validation errors with bad input.
- [x] **`signup-form.tsx`**: Integration test successful submission.
- [x] **`signup-form.tsx`**: Integration test validation errors with bad input.
- [x] **task-form.tsx`**: Integration test successful task creation.

---

## Nice-to-Have Tests (Medium Priority)

These tests cover more isolated components and interactions, adding another layer of confidence.

### Components (`components/`)
- [x] **`error-message.tsx`**: Unit test rendering with and without a message.
- [x] **`task-list.tsx`**: Integration test rendering a list of tasks.
- [x] **`task-list.tsx`**: Integration test rendering the empty state.
- [x] **`task-item.tsx`**: Unit test that it renders task data correctly.
- [x] **`task-item.tsx`**: Unit test that its buttons can be clicked.
- [ ] **`day-toggle.tsx`**: Unit test that clicking it calls the theme change function.
- [ ] **`presence-indicator.tsx`**: Unit test UI for `online` vs `offline` props.

### Pages (`app/`)
- [ ] **`page.tsx`**: Integration test that the main page renders its primary child components.

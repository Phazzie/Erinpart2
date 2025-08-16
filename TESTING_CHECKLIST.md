# Testing Checklist

This document tracks the progress of implementing a robust testing suite for this application.
Our chosen tools are **Jest** and **React Testing Library**.

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

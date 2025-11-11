# Seam-Driven Development Roadmap: Complete Execution Plan

**Project**: Erin's Escapades V2 - Complete Rewrite
**Methodology**: Seam-Driven Development (8-Step Process)
**Framework**: Svelte 5 + SvelteKit
**Date**: 2025-11-11
**Target Completion**: [TBD based on agent availability]

---

## 🎯 Executive Summary

This roadmap follows the **8-step SDD "Green Path"** with **maximum parallelization** for subagent work. The entire project is structured to achieve **zero technical debt** and **guaranteed integration success**.

### Key Metrics
- **Total Seams**: 32 (identified in DATA-BOUNDARIES.md)
- **Total Agents**: 15 agents working in parallel
- **SDD Compliance**: Level 3 (Best) - 100% validated mocks and contracts
- **Integration Guarantee**: Step 8 works on first attempt

### Success Criteria
✅ `npm run check` → 0 errors
✅ `npm run test` → >90% coverage
✅ All contract tests pass
✅ Integration works on first try
✅ Bundle size < 150kb
✅ Zero `any` types, zero technical debt

---

## 📋 Phase Overview

| Phase | SDD Step | Duration | Agents | Parallelization | Gate |
|-------|----------|----------|--------|-----------------|------|
| **Phase 1** | Step 1-2 | 1 day | 1 agent | N/A | Complete requirements + seam map |
| **Phase 2** | Step 3 | 2 days | 8 agents | Full parallel | All contracts defined + validated |
| **Phase 3** | Step 4-5 | 3 days | 8 agents | Full parallel | All mocks pass `npm run check` |
| **Phase 4** | Step 6 | 5 days | 12 agents | Full parallel | All UI built on validated mocks |
| **Phase 5** | Step 7 | 4 days | 8 agents | Full parallel | All real services implemented |
| **Phase 6** | Step 8 | 1 day | 2 agents | Sequential | Integration works, deployed |
| **Total** | All 8 steps | **16 days** | 15 agents max | - | Production ready |

---

## 🔄 PHASE 1: Foundation (Steps 1-2)

### ✅ Step 1: UNDERSTAND (COMPLETED)
**Status**: ✅ Complete
**Artifacts**: PRD-SEAM-DRIVEN-REWRITE.md

### ✅ Step 2: IDENTIFY (COMPLETED)
**Status**: ✅ Complete
**Artifacts**: DATA-BOUNDARIES.md, CONTRACT-BLUEPRINT.md

**Deliverables**:
- [x] All 32 seams mapped
- [x] Data boundaries documented
- [x] Contract template created
- [x] Edge cases identified

**Gate**: ✅ Requirements and seam map complete

---

## 🏗️ PHASE 2: Contract Definition (Step 3)

**Duration**: 2 days
**SDD Step**: Step 3 - DEFINE
**Parallelization**: 8 agents working simultaneously
**Critical Rule**: No coding until ALL contracts are validated

### Agent Assignments

#### **Agent 1: Auth Contracts**
**Responsibility**: Define all authentication seam contracts

**Seams to Implement** (4 total):
- SEAM-AUTH-001: Anonymous Sign In
- SEAM-AUTH-002: OAuth Sign In
- SEAM-AUTH-003: Sign Out
- SEAM-AUTH-004: Get Current User

**Deliverable**: `src/lib/contracts/auth.contracts.ts`

**Checklist**:
- [ ] File created with all 4 seams
- [ ] Each seam has Request, SuccessResponse, ErrorResponse types
- [ ] `IAuthRepository` interface defined
- [ ] Type guards implemented (`isAuthError`, etc.)
- [ ] Zod schemas for all requests
- [ ] Schema compile-time validation passes
- [ ] No `any` types (grep check: 0 results)
- [ ] No `as` casts (grep check: 0 results)
- [ ] All requirements linked with `@requirement` comments
- [ ] `npm run check` passes for this file
- [ ] Peer review by Agent 9 (Quality Assurance)

---

#### **Agent 2: Session Contracts**
**Responsibility**: Define all session management seam contracts

**Seams to Implement** (5 total):
- SEAM-SESSION-001: Create Session
- SEAM-SESSION-002: Join Session
- SEAM-SESSION-003: Leave Session
- SEAM-SESSION-004: Get Session Details
- SEAM-SESSION-005: Generate Share Data

**Deliverable**: `src/lib/contracts/session.contracts.ts`

**Checklist**: [Same as Agent 1]

---

#### **Agent 3: Task Contracts**
**Responsibility**: Define all task management seam contracts

**Seams to Implement** (6 total):
- SEAM-TASK-001: Get Tasks
- SEAM-TASK-002: Create Task
- SEAM-TASK-003: Update Task
- SEAM-TASK-004: Delete Task
- SEAM-TASK-005: Reorder Tasks
- SEAM-TASK-006: Vote to Reveal Secret

**Deliverable**: `src/lib/contracts/task.contracts.ts`

**Checklist**: [Same as Agent 1]

---

#### **Agent 4: Choice Contracts**
**Responsibility**: Define all task choice seam contracts

**Seams to Implement** (2 total):
- SEAM-CHOICE-001: Get Task Choices
- SEAM-CHOICE-002: Set Task Choice

**Deliverable**: `src/lib/contracts/choice.contracts.ts`

**Checklist**: [Same as Agent 1]

---

#### **Agent 5: List Contracts**
**Responsibility**: Define all collaborative list seam contracts

**Seams to Implement** (8 total):
- SEAM-LIST-001: Get Lists
- SEAM-LIST-002: Create List
- SEAM-LIST-003: Delete List
- SEAM-LIST-004: Get List Items
- SEAM-LIST-005: Add List Item
- SEAM-LIST-006: Update List Item
- SEAM-LIST-007: Delete List Item
- SEAM-LIST-008: Verify List Item

**Deliverable**: `src/lib/contracts/list.contracts.ts`

**Checklist**: [Same as Agent 1]

---

#### **Agent 6: Realtime Contracts**
**Responsibility**: Define real-time communication seam contracts

**Seams to Implement** (2 total):
- SEAM-REALTIME-001: Subscribe to Session Channel
- SEAM-REALTIME-002: Unsubscribe from Channel

**Deliverable**: `src/lib/contracts/realtime.contracts.ts`

**Special Considerations**:
- Subscription events (INSERT, UPDATE, DELETE)
- Connection state machine
- Presence tracking types

**Checklist**: [Same as Agent 1]

---

#### **Agent 7: Vibe Contracts**
**Responsibility**: Define theme/vibe system seam contracts

**Seams to Implement** (2 total):
- SEAM-VIBE-001: Get Available Vibes
- SEAM-VIBE-002: Set Session Vibe

**Deliverable**: `src/lib/contracts/vibe.contracts.ts`

**Checklist**: [Same as Agent 1]

---

#### **Agent 8: UI State Contracts**
**Responsibility**: Define UI state management seam contracts

**Seams to Implement** (3 total):
- SEAM-UI-STATE-001: Async Operation State
- SEAM-UI-STATE-002: Form State
- SEAM-UI-STATE-003: Modal State

**Deliverable**: `src/lib/contracts/ui-state.contracts.ts`

**Special Considerations**:
- State machine definitions
- Valid/invalid state transitions
- Generic types for reusability

**Checklist**: [Same as Agent 1]

---

### Phase 2 Gate Validation

**Before proceeding to Step 4, ALL of the following must be true**:

```bash
# Run validation script
./scripts/validate-phase2.sh
```

**Validation Checklist**:
- [ ] All 8 contract files exist and export interfaces
- [ ] Total seams implemented: 32/32
- [ ] `grep -r ": any" src/lib/contracts/` → 0 results
- [ ] `grep -r " as " src/lib/contracts/` → 0 results
- [ ] `npm run check` → 0 errors
- [ ] All interfaces documented with JSDoc
- [ ] All error codes defined as string literal unions
- [ ] All Zod schemas have compile-time validation
- [ ] Peer review completed for all contracts
- [ ] Git commit: "feat: define all 32 seam contracts (SDD Step 3)"

**Gate**: ✅ All contracts validated

---

## 🧪 PHASE 3: Mock Services & Validation (Steps 4-5)

**Duration**: 3 days
**SDD Steps**: Step 4 (Build Mocks) + Step 5 (Validate Mocks)
**Parallelization**: 8 agents (same as Phase 2)
**Critical Rule**: Mocks must be pixel-perfect implementations of contracts

### The "Pixel-Perfect Mock" Protocol

**Every mock MUST**:
1. ✅ Open contract file side-by-side while coding
2. ✅ Implement the repository interface exactly
3. ✅ Use TypeScript `implements` keyword (not implicit compatibility)
4. ✅ Return data matching response types exactly (no extra fields)
5. ✅ Pass `npm run check` with 0 errors
6. ✅ Be validated with automated contract tests

### Agent Assignments

#### **Agent 1: Auth Mock**
**Responsibility**: Implement mock authentication service

**Deliverable**: `src/lib/mocks/auth.mock.ts`

**Implementation**:
```typescript
import type { IAuthRepository } from '../contracts/auth.contracts';

export class AuthMockRepository implements IAuthRepository {
  // Implement all methods from IAuthRepository
  async signInAnonymously(request: SignInAnonymouslyRequest): Promise<...> {
    // Return mock data matching contract exactly
  }
  // ... all other methods
}
```

**Mock Data**:
- Pre-defined set of 10 mock users
- Deterministic session tokens
- Simulate error cases (10% failure rate for testing)

**Checklist**:
- [ ] Class implements `IAuthRepository` interface
- [ ] All 4 methods implemented
- [ ] Mock data realistic and varied
- [ ] Error scenarios included (one per error code)
- [ ] No `any` types used
- [ ] No `as` casts used
- [ ] `npm run check` passes
- [ ] Contract tests written (see below)
- [ ] All contract tests pass
- [ ] Peer review by Agent 9

---

#### **Agent 2: Session Mock**
**Responsibility**: Implement mock session management service

**Deliverable**: `src/lib/mocks/session.mock.ts`

**Implementation**: Class implements `ISessionRepository`

**Mock Data**:
- Pre-defined set of 5 mock sessions
- Animal code generator (deterministic)
- Participant tracking (in-memory)
- QR code generation (base64 PNG)

**Checklist**: [Same as Agent 1]

---

#### **Agent 3: Task Mock**
**Responsibility**: Implement mock task management service

**Deliverable**: `src/lib/mocks/task.mock.ts`

**Implementation**: Class implements `ITaskRepository`

**Mock Data**:
- 20 pre-defined tasks across different states
- Simulate ordering (in-memory array)
- Secret task logic (vote tracking)
- Realistic timestamps and user names

**Checklist**: [Same as Agent 1]

---

#### **Agent 4: Choice Mock**
**Responsibility**: Implement mock task choice service

**Deliverable**: `src/lib/mocks/choice.mock.ts`

**Implementation**: Class implements `IChoiceRepository`

**Mock Data**:
- Choice tracking (in-memory map)
- Aggregation calculations
- Multiple users' choices per task

**Checklist**: [Same as Agent 1]

---

#### **Agent 5: List Mock**
**Responsibility**: Implement mock collaborative list service

**Deliverable**: `src/lib/mocks/list.mock.ts`

**Implementation**: Class implements `IListRepository`

**Mock Data**:
- 3 pre-defined lists (bullet and numbered)
- 10-15 items per list
- Verification data for consensus meter
- Correction suggestions

**Checklist**: [Same as Agent 1]

---

#### **Agent 6: Realtime Mock**
**Responsibility**: Implement mock real-time service

**Deliverable**: `src/lib/mocks/realtime.mock.ts`

**Implementation**: Class implements `IRealtimeRepository`

**Mock Behavior**:
- Event emitter pattern (in-memory)
- Simulated latency (100-300ms)
- Presence tracking
- Connection state simulation

**Special Considerations**:
- Must work with Svelte stores
- Provide `simulateEvent()` helper for testing

**Checklist**: [Same as Agent 1]

---

#### **Agent 7: Vibe Mock**
**Responsibility**: Implement mock vibe/theme service

**Deliverable**: `src/lib/mocks/vibe.mock.ts`

**Implementation**: Class implements `IVibeRepository`

**Mock Data**:
- 4 predefined vibes (from PRD)
- Color scheme objects
- Preview images (base64 or URLs)

**Checklist**: [Same as Agent 1]

---

#### **Agent 8: Contract Test Suite**
**Responsibility**: Write automated tests validating all mocks against contracts

**Deliverable**: `src/tests/contracts/` (all test files)

**Tests to Write** (one file per contract):
- `auth.contract.test.ts`
- `session.contract.test.ts`
- `task.contract.test.ts`
- `choice.contract.test.ts`
- `list.contract.test.ts`
- `realtime.contract.test.ts`
- `vibe.contract.test.ts`

**Test Template** (for each seam):
```typescript
import { describe, it, expect } from 'vitest';
import { AuthMockRepository } from '../../lib/mocks/auth.mock';
import type { IAuthRepository } from '../../lib/contracts/auth.contracts';
import { SignInAnonymouslyRequestSchema } from '../../lib/contracts/auth.contracts';

describe('Auth Contract Tests', () => {
  let repo: IAuthRepository;

  beforeEach(() => {
    repo = new AuthMockRepository();
  });

  describe('SEAM-AUTH-001: Sign In Anonymously', () => {
    it('should implement IAuthRepository', () => {
      expect(repo.signInAnonymously).toBeDefined();
      expect(typeof repo.signInAnonymously).toBe('function');
    });

    it('should return response matching SignInAnonymouslySuccessResponse shape', async () => {
      const request = { animalOne: 'cat', animalTwo: 'dolphin' };
      const response = await repo.signInAnonymously(request);

      if ('error' in response) {
        throw new Error('Expected success response');
      }

      // Validate exact shape
      expect(response).toHaveProperty('user');
      expect(response.user).toHaveProperty('id');
      expect(response.user).toHaveProperty('animalCode');
      expect(response.user).toHaveProperty('createdAt');
      expect(response).toHaveProperty('session');
      // ... validate all fields
    });

    it('should not return extra fields beyond contract', async () => {
      const request = { animalOne: 'cat', animalTwo: 'dolphin' };
      const response = await repo.signInAnonymously(request);

      if ('error' in response) return;

      const allowedKeys = ['user', 'session'];
      const actualKeys = Object.keys(response);
      expect(actualKeys.sort()).toEqual(allowedKeys.sort());
    });

    it('should return error response for invalid input', async () => {
      const request = { animalOne: '', animalTwo: '' };
      const response = await repo.signInAnonymously(request);

      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('code');
      expect(response.error).toHaveProperty('message');
      expect(response.error).toHaveProperty('retryable');
    });

    it('should validate request with Zod schema', () => {
      const validRequest = { animalOne: 'cat', animalTwo: 'dolphin' };
      expect(() => SignInAnonymouslyRequestSchema.parse(validRequest)).not.toThrow();

      const invalidRequest = { animalOne: '', animalTwo: 'dolphin' };
      expect(() => SignInAnonymouslyRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  // Repeat for all seams in auth.contracts.ts
});
```

**Test Coverage Requirements**:
- [ ] Every seam has at least 5 tests:
  1. Interface implementation check
  2. Success response shape validation
  3. No extra fields check
  4. Error response shape validation
  5. Zod schema validation
- [ ] Total tests: 32 seams × 5 tests = **160 minimum tests**
- [ ] All tests pass: `npm run test -- contracts/`
- [ ] Coverage > 95% for mock files

**Checklist**:
- [ ] All 7 contract test files created
- [ ] 160+ tests written
- [ ] All tests pass
- [ ] Coverage report generated
- [ ] No skipped or pending tests
- [ ] Tests run in CI pipeline

---

### Phase 3 Gate Validation

**Before proceeding to Step 6, ALL of the following must be true**:

```bash
# Run validation script
./scripts/validate-phase3.sh
```

**Validation Checklist**:
- [ ] All 7 mock files exist and export classes
- [ ] All mocks implement their respective repository interfaces
- [ ] `npm run check` → 0 errors
- [ ] `npm run test -- contracts/` → 160+ tests, 100% passing
- [ ] Mock coverage > 95%
- [ ] `grep -r ": any" src/lib/mocks/` → 0 results
- [ ] `grep -r " as " src/lib/mocks/` → 0 results (except type guards)
- [ ] Peer review completed for all mocks
- [ ] Git commit: "feat: implement validated mock services (SDD Steps 4-5)"

**Gate**: ✅ All mocks validated with contract tests

---

## 🎨 PHASE 4: UI Implementation (Step 6)

**Duration**: 5 days
**SDD Step**: Step 6 - BUILD UI
**Parallelization**: 12 agents working simultaneously
**Critical Rule**: UI built against validated mocks only (no real services yet)

### Dependency Injection Setup

**First**: Configure DI to use mocks

```typescript
// src/lib/config/di.ts
import { setContext } from 'svelte';
import { AuthMockRepository } from '../mocks/auth.mock';
import { SessionMockRepository } from '../mocks/session.mock';
// ... import all mocks

export function setupDependencies() {
  const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

  // For Phase 4, USE_MOCKS is always true
  setContext('authRepository', new AuthMockRepository());
  setContext('sessionRepository', new SessionMockRepository());
  setContext('taskRepository', new TaskMockRepository());
  setContext('choiceRepository', new ChoiceRepository());
  setContext('listRepository', new ListMockRepository());
  setContext('realtimeRepository', new RealtimeMockRepository());
  setContext('vibeRepository', new VibeMockRepository());
}
```

### Agent Assignments

#### **Agent 1: Project Setup & Core Infrastructure**
**Responsibility**: Initialize SvelteKit project and core utilities

**Deliverables**:
- [x] Initialize SvelteKit project
- [x] Configure TypeScript strict mode
- [x] Set up Tailwind CSS
- [x] Configure Vite
- [x] Set up path aliases
- [x] Create folder structure (contracts/, mocks/, components/, etc.)
- [x] Install all dependencies (see PRD)
- [x] Configure Playwright for E2E
- [x] Configure Vitest for unit tests
- [x] Set up ESLint + Prettier
- [x] Create `.env.example` file
- [x] Create validation scripts (validate-phase2.sh, validate-phase3.sh)

**Utilities to Create**:
- `src/lib/utils/validation.ts` - Validation helpers
- `src/lib/utils/formatting.ts` - Date, time, text formatting
- `src/lib/utils/error-handling.ts` - Error utilities
- `src/lib/config/constants.ts` - App constants
- `src/lib/config/environment.ts` - Environment config

**Checklist**:
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run check` passes
- [ ] All paths resolve correctly
- [ ] Hot module reload works

---

#### **Agent 2: Svelte Stores**
**Responsibility**: Create global state stores

**Deliverables**:
- `src/lib/stores/session.store.ts` - Current session state
- `src/lib/stores/user.store.ts` - Current user state
- `src/lib/stores/ui.store.ts` - UI state (modals, toasts, etc.)

**Implementation**:
```typescript
// session.store.ts
import { writable, derived } from 'svelte/store';
import type { Session } from '../contracts/session.contracts';

function createSessionStore() {
  const { subscribe, set, update } = writable<Session | null>(null);

  return {
    subscribe,
    setSession: (session: Session) => set(session),
    clearSession: () => set(null),
    updateVibe: (vibe: VibeConfig) => update(s => s ? { ...s, dayVibe: vibe } : null)
  };
}

export const sessionStore = createSessionStore();

// Derived store
export const isInSession = derived(sessionStore, $session => $session !== null);
```

**Checklist**:
- [ ] All stores typed with contracts
- [ ] Stores persist to localStorage where appropriate
- [ ] Stores tested with Vitest
- [ ] No `any` types

---

#### **Agent 3: Base UI Components**
**Responsibility**: Implement Melt UI base components

**Deliverables** (in `src/lib/components/ui/`):
- `Button.svelte`
- `Input.svelte`
- `Textarea.svelte`
- `Card.svelte`
- `Dialog.svelte`
- `DropdownMenu.svelte`
- `Checkbox.svelte`
- `Tabs.svelte`
- `Badge.svelte`
- `Spinner.svelte` (loading indicator)

**Requirements**:
- Use Melt UI primitives (headless)
- Styled with Tailwind
- Fully accessible (ARIA labels, keyboard nav)
- TypeScript typed props
- Dark theme by default

**Checklist**:
- [ ] All components accessible (keyboard + screen reader)
- [ ] All components have TypeScript prop types
- [ ] Storybook stories created (optional)
- [ ] Visual regression tests (optional)

---

#### **Agent 4: Common Components**
**Responsibility**: Shared utility components

**Deliverables** (in `src/lib/components/common/`):
- `AnimatedBackground.svelte` - Cyberpunk background effect
- `ErrorBoundary.svelte` - Error boundary wrapper
- `ErrorMessage.svelte` - Error display component
- `LoadingSpinner.svelte` - Loading state
- `EmptyState.svelte` - Empty state display
- `NeonTitle.svelte` - Stylized title component
- `Toast.svelte` - Notification component

**Checklist**: [Standard component checklist]

---

#### **Agent 5: Auth Components**
**Responsibility**: Authentication UI

**Deliverables** (in `src/lib/components/auth/`):
- `AnimalCodeForm.svelte` - Animal selection form
- `OAuthButtons.svelte` - OAuth provider buttons
- `AuthGuard.svelte` - Route protection component

**Implementation Example**:
```svelte
<!-- AnimalCodeForm.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { IAuthRepository } from '$lib/contracts/auth.contracts';
  import { userStore } from '$lib/stores/user.store';

  const authRepo = getContext<IAuthRepository>('authRepository');

  let state = $state<'idle' | 'loading' | 'error'>('idle');
  let animalOne = $state('');
  let animalTwo = $state('');
  let error = $state<string | null>(null);

  async function handleSubmit() {
    state = 'loading';
    error = null;

    const response = await authRepo.signInAnonymously({ animalOne, animalTwo });

    if ('error' in response) {
      state = 'error';
      error = response.error.message;
      return;
    }

    userStore.setUser(response.user);
    state = 'idle';
    // Navigate to session select
  }
</script>

<form onsubmit={handleSubmit}>
  <!-- Form UI -->
</form>
```

**Checklist**:
- [ ] Uses injected `authRepository` from context
- [ ] Handles loading/error states
- [ ] Form validation (Zod)
- [ ] Accessible form elements
- [ ] Mobile responsive

---

#### **Agent 6: Session Components**
**Responsibility**: Session management UI

**Deliverables** (in `src/lib/components/session/`):
- `SessionBoard.svelte` - Main session view (orchestrator)
- `SessionHeader.svelte` - Session info header
- `SessionJoin.svelte` - Join session form
- `SessionCreate.svelte` - Create session button/modal
- `SessionDetails.svelte` - Participant list, settings
- `ShareSessionModal.svelte` - Share URL/QR code

**Checklist**: [Standard component checklist]

---

#### **Agent 7: Task Components**
**Responsibility**: Task management UI

**Deliverables** (in `src/lib/components/task/`):
- `TaskList.svelte` - Drag-drop task list
- `TaskItem.svelte` - Individual task display
- `TaskForm.svelte` - Create/edit task form
- `TaskChoiceButtons.svelte` - Yes/no/maybe buttons
- `SecretTaskOverlay.svelte` - Secret task reveal UI

**Critical**:
- Integrate `svelte-dnd-action` for drag-drop
- Optimistic updates with rollback
- Real-time updates via store subscriptions

**Checklist**: [Standard component checklist]

---

#### **Agent 8: List Components**
**Responsibility**: Collaborative lists UI

**Deliverables** (in `src/lib/components/list/`):
- `ListCreatorForm.svelte` - Create new list
- `CollaborativeList.svelte` - List container
- `ListItem.svelte` - Individual list item
- `VerificationButtons.svelte` - Accurate/inaccurate buttons
- `ConsensusMeter.svelte` - Visual consensus indicator

**Checklist**: [Standard component checklist]

---

#### **Agent 9: Vibe/Theme Components**
**Responsibility**: Theme system UI

**Deliverables** (in `src/lib/components/vibe/`):
- `VibeSelector.svelte` - Theme picker dropdown
- `VibeCard.svelte` - Theme preview card
- `VibeEditor.svelte` - Custom theme creator (future)

**Implementation**:
- Apply CSS variables to `:root`
- Smooth transition between themes
- Preview before applying

**Checklist**: [Standard component checklist]

---

#### **Agent 10: Layout Components**
**Responsibility**: Page layout and navigation

**Deliverables** (in `src/lib/components/layout/`):
- `TopBar.svelte` - App header with user info
- `MobileNav.svelte` - Bottom navigation (mobile)
- `DayToggle.svelte` - Today/Tomorrow tab switcher
- `PresenceIndicator.svelte` - Online users display

**Checklist**: [Standard component checklist]

---

#### **Agent 11: Routes & Pages**
**Responsibility**: SvelteKit routes and page components

**Deliverables**:
- `src/routes/+page.svelte` - Home page (auth or session select)
- `src/routes/+layout.svelte` - Root layout
- `src/routes/session/[code]/+page.svelte` - Session page
- `src/routes/auth/callback/+page.svelte` - OAuth callback
- `src/routes/api/health/+server.ts` - Health check endpoint
- `src/routes/+error.svelte` - Error page
- `src/app.html` - HTML template

**Routing Logic**:
- Redirect to `/session/[code]` after join
- Protect session routes with `AuthGuard`
- Handle URL parameters (session code, pre-fill)

**Checklist**:
- [ ] All routes accessible
- [ ] Navigation works (client-side)
- [ ] URL parameters parsed correctly
- [ ] Error page styled and helpful

---

#### **Agent 12: Integration & Polish**
**Responsibility**: Connect all pieces, handle edge cases

**Tasks**:
- Wire up all components in `SessionBoard.svelte`
- Implement real-time subscription in session page
- Connect stores to repositories
- Handle loading states globally
- Implement toast notifications
- Add keyboard shortcuts
- Optimize bundle (code splitting)
- Ensure accessibility throughout

**Checklist**:
- [ ] All user flows work end-to-end
- [ ] Loading states everywhere
- [ ] Error states handled gracefully
- [ ] Empty states shown appropriately
- [ ] Animations smooth (60fps)
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] No console errors

---

### Phase 4 Gate Validation

**Before proceeding to Step 7, ALL of the following must be true**:

```bash
# Run validation script
./scripts/validate-phase4.sh
```

**Validation Checklist**:
- [ ] `npm run dev` → App loads without errors
- [ ] `npm run build` → Build succeeds, bundle < 150kb
- [ ] `npm run check` → 0 TypeScript errors
- [ ] `npm run test` → All UI component tests pass
- [ ] Manual testing: All user flows work with mocks
- [ ] Lighthouse: Performance > 90, Accessibility > 95
- [ ] No `any` types in components
- [ ] All components use injected repositories (DI)
- [ ] Real-time updates work (via mock)
- [ ] Mobile responsive on actual device
- [ ] Keyboard navigation complete
- [ ] Git commit: "feat: complete UI implementation on mocks (SDD Step 6)"

**Gate**: ✅ UI fully functional with validated mocks

---

## 🔌 PHASE 5: Real Service Implementation (Step 7)

**Duration**: 4 days
**SDD Step**: Step 7 - IMPLEMENT REAL SERVICES
**Parallelization**: 8 agents (one per service)
**Critical Rule**: Implement exact same interface as mocks

### Supabase Setup (Pre-requisite)

**Agent 0: Database Setup** (runs before other agents)

**Tasks**:
- [ ] Apply database schema: `supabase-schema-TO-APPLY.sql`
- [ ] Verify all tables created
- [ ] Verify all RLS policies applied
- [ ] Test RLS policies (no infinite recursion)
- [ ] Enable Realtime on all tables
- [ ] Set REPLICA IDENTITY FULL
- [ ] Seed with test data
- [ ] Configure Supabase client (`src/lib/config/supabase.ts`)
- [ ] Test anonymous auth works
- [ ] Test OAuth works (Google)

---

### Agent Assignments

#### **Agent 1: Auth Repository (Real)**
**Responsibility**: Implement real Supabase authentication

**Deliverable**: `src/lib/repositories/auth.repository.ts`

**Implementation**:
```typescript
import type { IAuthRepository } from '../contracts/auth.contracts';
import { createClient } from '@supabase/supabase-js';

export class AuthSupabaseRepository implements IAuthRepository {
  private supabase = createClient(...);

  async signInAnonymously(request: SignInAnonymouslyRequest): Promise<...> {
    try {
      const { data, error } = await this.supabase.auth.signInAnonymously({
        options: {
          data: {
            animalCode: `${request.animalOne}-${request.animalTwo}`
          }
        }
      });

      if (error) {
        return {
          error: {
            code: this.mapSupabaseError(error),
            message: error.message,
            retryable: this.isRetryable(error)
          }
        };
      }

      return {
        user: {
          id: data.user.id,
          animalCode: data.user.user_metadata.animalCode,
          createdAt: data.user.created_at
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
        }
      };
    } catch (err) {
      // Handle network errors
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Connection failed',
          retryable: true
        }
      };
    }
  }

  // ... implement all methods from IAuthRepository
}
```

**Checklist**:
- [ ] Implements `IAuthRepository` interface
- [ ] All methods match mock signatures exactly
- [ ] Error handling comprehensive
- [ ] Supabase errors mapped to contract error codes
- [ ] No `any` types
- [ ] No `as` casts
- [ ] `npm run check` passes
- [ ] Contract tests pass when swapped with mock
- [ ] Manual testing against real Supabase

---

#### **Agent 2-7: Other Repositories**

**Follow same pattern as Agent 1 for**:
- Agent 2: `session.repository.ts` → `ISessionRepository`
- Agent 3: `task.repository.ts` → `ITaskRepository`
- Agent 4: `choice.repository.ts` → `IChoiceRepository`
- Agent 5: `list.repository.ts` → `IListRepository`
- Agent 6: `realtime.repository.ts` → `IRealtimeRepository`
- Agent 7: `vibe.repository.ts` → `IVibeRepository`

**Each agent must**:
- Implement exact same interface as mock
- Handle all error cases
- Map Supabase errors to contract error codes
- Pass all contract tests
- No regression on mock tests

---

#### **Agent 8: Integration Testing**
**Responsibility**: Test real services against contracts

**Deliverable**: `src/tests/integration/` (all integration tests)

**Tests to Write**:
- `auth.integration.test.ts` - Test against real Supabase (test env)
- `session.integration.test.ts`
- `task.integration.test.ts`
- `choice.integration.test.ts`
- `list.integration.test.ts`
- `realtime.integration.test.ts`
- `vibe.integration.test.ts`

**Test Template**:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AuthSupabaseRepository } from '../../lib/repositories/auth.repository';
import type { IAuthRepository } from '../../lib/contracts/auth.contracts';

describe('Auth Integration Tests (Real Supabase)', () => {
  let repo: IAuthRepository;

  beforeAll(async () => {
    repo = new AuthSupabaseRepository();
    // Set up test database state
  });

  afterAll(async () => {
    // Clean up test data
  });

  it('should sign in anonymously and return valid session', async () => {
    const request = { animalOne: 'cat', animalTwo: 'dolphin' };
    const response = await repo.signInAnonymously(request);

    expect(response).not.toHaveProperty('error');
    if ('error' in response) return;

    expect(response.user.id).toMatch(/^[0-9a-f-]{36}$/); // UUID
    expect(response.session.accessToken).toBeTruthy();
  });

  // ... more integration tests
});
```

**Checklist**:
- [ ] All 7 integration test files created
- [ ] Tests run against test Supabase instance
- [ ] All tests pass
- [ ] Coverage > 80% for repositories
- [ ] Tests include error scenarios
- [ ] Tests clean up after themselves

---

### Phase 5 Gate Validation

**Before proceeding to Step 8, ALL of the following must be true**:

```bash
# Run validation script
./scripts/validate-phase5.sh
```

**Validation Checklist**:
- [ ] All 7 repository files exist
- [ ] All repositories implement their interfaces
- [ ] `npm run check` → 0 errors
- [ ] `npm run test -- contracts/` → All pass (swapped to real repos)
- [ ] `npm run test -- integration/` → All pass
- [ ] Integration coverage > 80%
- [ ] No `any` types in repositories
- [ ] All Supabase operations use RLS (tested)
- [ ] Real-time subscriptions work
- [ ] Manual E2E testing with real Supabase
- [ ] Git commit: "feat: implement real Supabase repositories (SDD Step 7)"

**Gate**: ✅ Real services validated

---

## 🚀 PHASE 6: Integration & Deployment (Step 8)

**Duration**: 1 day
**SDD Step**: Step 8 - INTEGRATE
**Parallelization**: Sequential (critical path)
**Critical Rule**: Follow Integration Readiness Checklist exactly

### The Big Switch

**Agent 1: Integration Lead**

**Task 1: Run Integration Readiness Checklist**

```bash
# Integration Readiness Checklist
./scripts/integration-readiness.sh
```

**Checklist Items**:
- [ ] Contract versions match (mocks and real both use same contracts)
- [ ] All contract tests pass with mocks
- [ ] All contract tests pass with real services
- [ ] All integration tests pass
- [ ] `npm run check` → 0 errors
- [ ] `npm run test` → All tests pass (>90% coverage)
- [ ] `npm run build` → Build succeeds
- [ ] Bundle size < 150kb
- [ ] No console errors in production build
- [ ] Environment variables configured for production
- [ ] Supabase production instance ready
- [ ] Database migrations applied to production
- [ ] RLS policies tested in production

**Task 2: Flip the Switch**

**Before**:
```typescript
// src/lib/config/di.ts
export function setupDependencies() {
  const USE_MOCKS = true; // Hardcoded for Phase 4

  setContext('authRepository',
    USE_MOCKS ? new AuthMockRepository() : new AuthSupabaseRepository()
  );
  // ... all other repos
}
```

**After**:
```typescript
// src/lib/config/di.ts
export function setupDependencies() {
  const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'; // Environment-based

  setContext('authRepository',
    USE_MOCKS ? new AuthMockRepository() : new AuthSupabaseRepository()
  );
  // ... all other repos
}
```

**.env.production**:
```bash
VITE_USE_MOCKS=false
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Task 3: Smoke Testing**

```bash
# Build with production config
npm run build

# Run production build locally
npm run preview

# Test critical paths:
# 1. Anonymous sign in
# 2. Create session
# 3. Join session (second user)
# 4. Create task
# 5. Complete task (real-time update)
# 6. Create list
# 7. Verify list item
# 8. Share session (QR code)
```

**Smoke Test Checklist**:
- [ ] All 8 critical paths work
- [ ] Real-time updates appear (<500ms latency)
- [ ] No console errors
- [ ] No network errors
- [ ] Bundle loaded correctly
- [ ] Mobile responsive
- [ ] Lighthouse: Performance >90, Accessibility >95

**Task 4: Emergency Protocol (if integration fails)**

If ANY issue occurs during integration:

1. **DON'T panic** - This is why we have SDD
2. **Run Emergency Protocols Checklist**:
   - [ ] Contract version mismatch? Check package versions
   - [ ] Mock vs real discrepancy? Run contract tests on real service
   - [ ] Hidden type escapes? `grep -r " as any" src/`
   - [ ] Manual data transformations? Search for adapter code
   - [ ] Build/cache issues? Delete node_modules, rebuild
3. **Revert to mocks** while debugging:
   ```bash
   VITE_USE_MOCKS=true npm run dev
   ```
4. **Fix root cause** in repository implementation
5. **Re-run integration tests**
6. **Try switch again**

**Expected Result**: Integration works on **first attempt** (if SDD followed correctly)

---

### Agent 2: Deployment

**Responsibility**: Deploy to production

**Tasks**:
1. **Vercel Setup**:
   - [ ] Connect GitHub repo to Vercel
   - [ ] Configure environment variables
   - [ ] Set build command: `npm run build`
   - [ ] Set output directory: `.svelte-kit`
   - [ ] Enable Vercel Analytics
   - [ ] Configure custom domain (if applicable)

2. **Deploy**:
   - [ ] Push to `main` branch
   - [ ] Verify build succeeds on Vercel
   - [ ] Verify deployment URL works
   - [ ] Test production deployment (smoke tests)

3. **Monitoring Setup**:
   - [ ] Configure Sentry (error tracking)
   - [ ] Set up uptime monitoring (health endpoint)
   - [ ] Configure alerts (error rate, downtime)
   - [ ] Verify source maps uploaded (for debugging)

4. **Post-Deployment Checklist**:
   - [ ] Health endpoint responds: `/api/health`
   - [ ] SSL certificate valid
   - [ ] Security headers present (check with securityheaders.com)
   - [ ] Lighthouse audit (production URL): Performance >90, A11y >95
   - [ ] Real user testing (5+ people)
   - [ ] Monitor Sentry for 24 hours
   - [ ] No critical errors in production

---

### Phase 6 Gate Validation

**Project is COMPLETE when**:

- [ ] Integration works on first attempt
- [ ] All tests pass in CI/CD
- [ ] Deployed to production (Vercel)
- [ ] Lighthouse audit passes
- [ ] Real user testing successful
- [ ] Zero critical bugs in first 24 hours
- [ ] Documentation updated
- [ ] Git tag: `v2.0.0`
- [ ] GitHub release created
- [ ] Old version sunset plan documented

---

## 📊 Progress Tracking

### Phase Completion Matrix

| Phase | Step | Status | Start Date | End Date | Gate Passed |
|-------|------|--------|------------|----------|-------------|
| 1 | 1-2 | ✅ Complete | 2025-11-11 | 2025-11-11 | ✅ |
| 2 | 3 | 🔄 Pending | - | - | ⬜ |
| 3 | 4-5 | ⬜ Not Started | - | - | ⬜ |
| 4 | 6 | ⬜ Not Started | - | - | ⬜ |
| 5 | 7 | ⬜ Not Started | - | - | ⬜ |
| 6 | 8 | ⬜ Not Started | - | - | ⬜ |

### Agent Utilization

| Phase | Active Agents | Parallelization | Efficiency |
|-------|---------------|-----------------|------------|
| Phase 1 | 1 | N/A | - |
| Phase 2 | 8 | 100% | 8x speedup |
| Phase 3 | 8 | 100% | 8x speedup |
| Phase 4 | 12 | 100% | 12x speedup |
| Phase 5 | 8 | 100% | 8x speedup |
| Phase 6 | 2 | 0% (sequential) | 1x |

**Total Agent-Days**: 67 agent-days compressed into 16 calendar days

---

## 🛡️ Risk Mitigation

### High-Priority Risks

| Risk | Mitigation Strategy | Backup Plan |
|------|---------------------|-------------|
| **Contracts incomplete** | Mandatory peer review, checklist validation | Phase 2 gate blocks progress |
| **Mock/Real mismatch** | Contract tests (160+ tests), `npm run check` enforced | Emergency Protocol in Step 8 |
| **Integration failure** | Integration Readiness Checklist, SDD Level 3 compliance | Revert to mocks, debug, retry |
| **Scope creep** | Requirements frozen after Step 2, defer to V2.1 | Product owner approval required |
| **Agent availability** | Buffer days in schedule, cross-training | Reduce parallelization if needed |

---

## 📝 Daily Standup Template

**What we completed yesterday**:
- [Agent X] Completed Y deliverable
- [Agent Z] Passed gate validation for Phase N

**What we're working on today**:
- [Agent X] Working on deliverable Y
- [Agent Z] Starting Phase N

**Blockers**:
- [Agent X] Waiting on contract approval from Agent Y
- [None]

**Gate Status**:
- Phase N: X/Y checklist items complete

---

## ✅ Definition of Done

**A phase is "done" when**:
1. All agent deliverables completed
2. All checklist items checked
3. Gate validation script passes
4. Peer review completed
5. Git commit created with proper message
6. No regressions in previous phases
7. Documentation updated

**The project is "done" when**:
1. All 6 phases complete
2. All success criteria met (see PRD)
3. Deployed to production
4. Real users testing successfully
5. Zero critical bugs
6. Monitoring configured
7. This is the **Gold Standard** SDD project

---

## 🎓 Lessons for Future Projects

**What made this succeed**:
- ✅ Complete seam identification before coding
- ✅ Contracts defined and validated before implementation
- ✅ Mocks validated with automated tests (Level 3 compliance)
- ✅ UI built on validated mocks (no surprises)
- ✅ Real services implement exact same interface
- ✅ Integration Readiness Checklist followed
- ✅ Never skipped a gate validation

**Common pitfalls avoided**:
- ❌ Skipping Step 2 (incomplete seam map)
- ❌ Unvalidated mocks (Level 1 or 2)
- ❌ Using `any` types (defeats TypeScript)
- ❌ Starting UI before contracts complete
- ❌ Skipping contract tests
- ❌ Not checking `npm run check` frequently

---

**Document Status**: ✅ Complete and Ready for Execution
**Next Action**: Create branch `claude/v2-rewrite-sdd` and begin Phase 2 (Step 3)

---

## Appendix: Validation Scripts

### validate-phase2.sh
```bash
#!/bin/bash
# Validate Phase 2: All contracts defined

echo "🔍 Validating Phase 2: Contract Definition..."

# Check all contract files exist
files=(
  "src/lib/contracts/auth.contracts.ts"
  "src/lib/contracts/session.contracts.ts"
  "src/lib/contracts/task.contracts.ts"
  "src/lib/contracts/choice.contracts.ts"
  "src/lib/contracts/list.contracts.ts"
  "src/lib/contracts/realtime.contracts.ts"
  "src/lib/contracts/vibe.contracts.ts"
  "src/lib/contracts/ui-state.contracts.ts"
)

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  fi
done

# Check for 'any' types
if grep -r ": any" src/lib/contracts/; then
  echo "❌ Found 'any' types in contracts"
  exit 1
fi

# Check for 'as' casts
if grep -r " as " src/lib/contracts/; then
  echo "❌ Found 'as' casts in contracts"
  exit 1
fi

# Run TypeScript check
if ! npm run check; then
  echo "❌ TypeScript errors found"
  exit 1
fi

echo "✅ Phase 2 validation passed!"
```

### validate-phase3.sh
```bash
#!/bin/bash
# Validate Phase 3: All mocks validated

echo "🔍 Validating Phase 3: Mock Services..."

# Check all mock files exist
files=(
  "src/lib/mocks/auth.mock.ts"
  "src/lib/mocks/session.mock.ts"
  "src/lib/mocks/task.mock.ts"
  "src/lib/mocks/choice.mock.ts"
  "src/lib/mocks/list.mock.ts"
  "src/lib/mocks/realtime.mock.ts"
  "src/lib/mocks/vibe.mock.ts"
)

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  fi
done

# Check for 'any' types
if grep -r ": any" src/lib/mocks/; then
  echo "❌ Found 'any' types in mocks"
  exit 1
fi

# Run contract tests
if ! npm run test -- contracts/; then
  echo "❌ Contract tests failed"
  exit 1
fi

# Check test count
test_count=$(npm run test -- contracts/ --reporter=json | jq '.numTotalTests')
if [ "$test_count" -lt 160 ]; then
  echo "❌ Insufficient tests: $test_count (expected ≥160)"
  exit 1
fi

echo "✅ Phase 3 validation passed!"
```

### integration-readiness.sh
```bash
#!/bin/bash
# Integration Readiness Checklist (Step 8)

echo "🔍 Running Integration Readiness Checklist..."

# All previous validations must pass
./scripts/validate-phase2.sh || exit 1
./scripts/validate-phase3.sh || exit 1

# Run all tests
if ! npm run test; then
  echo "❌ Tests failed"
  exit 1
fi

# Build production bundle
if ! npm run build; then
  echo "❌ Build failed"
  exit 1
fi

# Check bundle size
bundle_size=$(du -sb .svelte-kit/output/client/_app | awk '{print $1}')
max_size=$((150 * 1024)) # 150kb

if [ "$bundle_size" -gt "$max_size" ]; then
  echo "❌ Bundle too large: ${bundle_size}b (max: ${max_size}b)"
  exit 1
fi

echo "✅ Integration readiness check passed!"
echo "🚀 Ready to flip the switch (Step 8)"
```

---

**End of Roadmap**

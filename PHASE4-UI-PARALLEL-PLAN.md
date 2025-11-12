# Phase 4: UI Implementation - Parallel Deployment Strategy

**Date**: 2025-11-12
**Phase**: SDD Step 6 - BUILD UI
**Approach**: Wave-based Parallel Deployment with Dependency Management

---

## 🎯 Strategy Overview

**Core Principle**: Deploy agents in **waves**, where each wave consists of agents working in parallel on components with no inter-dependencies. Each subsequent wave depends only on completed waves.

**Total Agents**: 18 agents across 4 waves
**Estimated Duration**: 3-4 days (waves run sequentially, agents within waves run in parallel)

---

## 📊 Dependency Analysis

```
Wave 1 (Foundation) - No dependencies
  ↓
Wave 2 (Feature Components) - Depends on Wave 1
  ↓
Wave 3 (Integration Components) - Depends on Waves 1-2
  ↓
Wave 4 (Routes & Polish) - Depends on Waves 1-3
```

---

## 🌊 WAVE 1: Foundation Layer (6 Agents in Parallel)

**No dependencies - Can all work simultaneously**

### Agent 1: Base UI Components (Melt UI Wrappers)
**Deliverables**: `/src/lib/components/ui/`
- `Button.svelte` - Primary, secondary, ghost variants
- `Input.svelte` - Text, password, with validation states
- `Textarea.svelte` - With character counter
- `Card.svelte` - With Header, Content, Footer slots
- `Badge.svelte` - For status indicators
- `Checkbox.svelte` - Accessible checkbox
- `Label.svelte` - Form labels
- `Dialog.svelte` - Modal dialog
- `DropdownMenu.svelte` - Context menus
- `Tabs.svelte` - Tab navigation

**Requirements**:
- Use Melt UI primitives (headless components)
- Style with Tailwind CSS
- Dark theme by default
- Full keyboard accessibility
- ARIA labels on all interactive elements

**Validation**:
- [ ] All components render without errors
- [ ] Keyboard navigation works
- [ ] TypeScript types exported
- [ ] Props documented with JSDoc

---

### Agent 2: Common Components
**Deliverables**: `/src/lib/components/common/`
- `LoadingSpinner.svelte` - With size variants (sm, md, lg)
- `ErrorMessage.svelte` - With retry button
- `EmptyState.svelte` - With icon, message, CTA
- `Toast.svelte` - Notification toast
- `AnimatedBackground.svelte` - Cyberpunk background
- `NeonTitle.svelte` - Stylized title with glow

**Requirements**:
- Use Svelte transitions (fade, slide)
- Respect `prefers-reduced-motion`
- Toast stacking support
- Error boundary integration

**Validation**:
- [ ] Animations smooth (60fps)
- [ ] Toast queue works
- [ ] Reduced motion respected

---

### Agent 3: Layout Components
**Deliverables**: `/src/lib/components/layout/`
- `TopBar.svelte` - App header with logo, user info
- `MobileNav.svelte` - Bottom navigation (mobile)
- `Sidebar.svelte` - Side navigation (desktop)
- `DayToggle.svelte` - Today/Tomorrow switcher
- `PresenceIndicator.svelte` - Online users display

**Requirements**:
- Responsive breakpoints (<640px, 640-1024px, >1024px)
- Mobile-first design
- Fixed positioning for nav
- Smooth transitions

**Validation**:
- [ ] Responsive on all screen sizes
- [ ] Fixed positioning works
- [ ] No layout shift

---

### Agent 4: Svelte Stores
**Deliverables**: `/src/lib/stores/`
- `session.store.ts` - Current session state
- `user.store.ts` - Current user state
- `ui.store.ts` - UI state (modals, toasts, loading)
- `realtime.store.ts` - Real-time connection state

**Requirements**:
- Use Svelte `writable` stores
- Persist session/user to localStorage
- Derived stores where appropriate
- Type-safe store contracts

**Implementation**:
```typescript
// session.store.ts
import { writable } from 'svelte/store';
import type { SessionWithContext } from '$lib/contracts/session.contracts';

function createSessionStore() {
  const { subscribe, set, update } = writable<SessionWithContext | null>(null);

  return {
    subscribe,
    setSession: (session: SessionWithContext) => set(session),
    clearSession: () => set(null),
    updateParticipants: (participants) => update(s => s ? {...s, participants} : null)
  };
}

export const sessionStore = createSessionStore();
```

**Validation**:
- [ ] All stores type-safe
- [ ] Persistence works
- [ ] Derived stores compute correctly

---

### Agent 5: Dependency Injection Setup
**Deliverables**: `/src/lib/config/di.ts`
- DI container using Svelte context
- Environment-based toggle (USE_MOCKS)
- Repository instance creation
- Context providers

**Implementation**:
```typescript
// di.ts
import { setContext, getContext } from 'svelte';
import { AuthMockRepository } from '$lib/mocks/auth.mock';
import { AuthSupabaseRepository } from '$lib/repositories/auth.repository';
// ... all other repos

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export function setupDependencies() {
  setContext('authRepository', USE_MOCKS ? new AuthMockRepository() : new AuthSupabaseRepository());
  setContext('sessionRepository', USE_MOCKS ? new SessionMockRepository() : new SessionSupabaseRepository());
  // ... all other repos
}

export function getAuthRepository() {
  return getContext<IAuthRepository>('authRepository');
}
// ... getters for all repos
```

**Validation**:
- [ ] Mock toggle works
- [ ] All repositories injectable
- [ ] Type safety maintained

---

### Agent 6: Utility Functions & Helpers
**Deliverables**: `/src/lib/utils/`
- `validation.ts` - Form validation helpers
- `formatting.ts` - Date, time, text formatting
- `error-handling.ts` - Error message formatting
- `cn.ts` - Class name utility (clsx + tailwind-merge)

**Implementation**:
```typescript
// cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// formatting.ts
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  // ... etc
}
```

**Validation**:
- [ ] All utilities have tests
- [ ] Type-safe exports
- [ ] Edge cases handled

---

## 🌊 WAVE 2: Feature Components (7 Agents in Parallel)

**Dependencies**: Wave 1 must be complete

### Agent 7: Auth Components
**Deliverables**: `/src/lib/components/auth/`
- `AnimalCodeForm.svelte` - Animal selection dropdowns
- `OAuthButtons.svelte` - Google/GitHub buttons
- `AuthGuard.svelte` - Route protection wrapper

**Requirements**:
- Uses `authRepository` from DI
- Uses `userStore` for state
- Form validation with Zod
- Loading states during auth
- Error display with retry

**Integration**:
```svelte
<script lang="ts">
  import { getAuthRepository } from '$lib/config/di';
  import { userStore } from '$lib/stores/user.store';
  import { AnonymousSignInRequestSchema } from '$lib/contracts/auth.contracts';

  const authRepo = getAuthRepository();
  let state = $state<'idle' | 'loading' | 'error'>('idle');
  let animalOne = $state('');
  let animalTwo = $state('');
  let error = $state<string | null>(null);

  async function handleSubmit() {
    state = 'loading';
    const request = { animalOne, animalTwo };

    // Validate
    const validation = AnonymousSignInRequestSchema.safeParse(request);
    if (!validation.success) {
      error = validation.error.errors[0].message;
      state = 'error';
      return;
    }

    // Sign in
    const response = await authRepo.anonymousSignIn(request);

    if ('error' in response) {
      error = response.error.message;
      state = 'error';
      return;
    }

    userStore.setUser(response.user);
    state = 'idle';
  }
</script>

<form onsubmit={handleSubmit}>
  <!-- Form UI -->
</form>
```

**Validation**:
- [ ] Auth flow works end-to-end
- [ ] Loading states show
- [ ] Errors display properly
- [ ] AuthGuard redirects correctly

---

### Agent 8: Session Components
**Deliverables**: `/src/lib/components/session/`
- `SessionHeader.svelte` - Session info display
- `SessionJoin.svelte` - Join session form
- `SessionCreate.svelte` - Create session button/modal
- `SessionDetails.svelte` - Participant list, settings
- `ShareSessionModal.svelte` - Share URL/QR code

**Requirements**:
- Uses `sessionRepository` from DI
- Uses `sessionStore` for state
- QR code display
- Copy-to-clipboard for share URL
- Participant limit indicator (X/10)

**Validation**:
- [ ] Create session works
- [ ] Join session works
- [ ] QR code displays
- [ ] Share URL copies

---

### Agent 9: Task Components (Core)
**Deliverables**: `/src/lib/components/task/`
- `TaskList.svelte` - Scrollable task list
- `TaskItem.svelte` - Individual task with all features
- `TaskForm.svelte` - Create/edit task form
- `SecretTaskOverlay.svelte` - Secret task UI

**Requirements**:
- Uses `taskRepository` from DI
- Real-time updates via `realtimeRepository`
- Optimistic updates with rollback
- Complete/uncomplete toggle
- Edit inline (contenteditable)
- Delete with confirmation

**Validation**:
- [ ] Tasks display correctly
- [ ] Complete toggle works
- [ ] Inline edit works
- [ ] Delete confirmation shows

---

### Agent 10: Task Components (Drag-Drop)
**Deliverables**: Extension of Agent 9's work
- Integrate drag-drop with `svelte-dnd-action`
- Reorder tasks within day
- Visual drag feedback
- Persist order via `reorderTasks()`

**Requirements**:
- Install `svelte-dnd-action`
- Smooth animations during drag
- Update `order_index` on drop
- Optimistic reordering

**Implementation**:
```svelte
<script lang="ts">
  import { dndzone } from 'svelte-dnd-action';

  let items = $state([...tasks]);

  function handleSort(e: CustomEvent) {
    items = e.detail.items;
  }

  async function handleFinalize(e: CustomEvent) {
    items = e.detail.items;

    // Build reorder request
    const taskOrdering = items.map((item, idx) => ({
      taskId: item.id,
      newOrderIndex: idx
    }));

    // Persist
    await taskRepo.reorderTasks({ sessionId, day, taskOrdering });
  }
</script>

<div use:dndzone={{items}} on:consider={handleSort} on:finalize={handleFinalize}>
  {#each items as task (task.id)}
    <TaskItem {task} />
  {/each}
</div>
```

**Validation**:
- [ ] Drag works smoothly
- [ ] Order persists
- [ ] No flickering

---

### Agent 11: Choice Components
**Deliverables**: `/src/lib/components/choice/`
- `ChoiceButtons.svelte` - Yes/No/Maybe buttons
- `ChoiceAggregation.svelte` - Vote count display

**Requirements**:
- Uses `choiceRepository` from DI
- Highlight current user's choice
- Show aggregation (3 yes, 2 no, 1 maybe)
- Optimistic updates

**Validation**:
- [ ] Choice selection works
- [ ] Aggregation displays
- [ ] Current user highlighted

---

### Agent 12: List Components
**Deliverables**: `/src/lib/components/list/`
- `ListCreatorForm.svelte` - Create list form
- `CollaborativeList.svelte` - List container
- `ListItem.svelte` - List item with verification
- `VerificationButtons.svelte` - ✓/✗ buttons
- `ConsensusMeter.svelte` - Progress bar

**Requirements**:
- Uses `listRepository` from DI
- List type selection (bullet/numbered)
- Item verification with colors (green/red/neutral)
- Consensus percentage calculation
- Correction text input

**Validation**:
- [ ] List creation works
- [ ] Items add/edit/delete
- [ ] Verification updates consensus
- [ ] Colors update correctly

---

### Agent 13: Vibe Components
**Deliverables**: `/src/lib/components/vibe/`
- `VibeSelector.svelte` - Dropdown selector
- `VibeCard.svelte` - Preview card
- `VibeApplier.svelte` - Apply CSS variables

**Requirements**:
- Uses `vibeRepository` from DI
- Apply theme to `:root` CSS variables
- Smooth color transitions
- Preview before applying

**Implementation**:
```svelte
<script lang="ts">
  import { vibeRepository } from '$lib/config/di';

  async function applyVibe(vibeId: string) {
    const result = await vibeRepo.setSessionVibe({ sessionId, vibeConfig: { id: vibeId, ... } });

    if ('error' in result) return;

    // Apply CSS variables
    const colors = result.updatedVibe.colorScheme;
    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-secondary', colors.secondary);
    // ... etc
  }
</script>
```

**Validation**:
- [ ] Theme applies correctly
- [ ] Transitions smooth
- [ ] Preview works

---

## 🌊 WAVE 3: Integration Components (3 Agents in Parallel)

**Dependencies**: Waves 1-2 must be complete

### Agent 14: SessionBoard (Main Orchestrator)
**Deliverables**: `/src/lib/components/session/SessionBoard.svelte`

**This is the main page component that integrates everything**

- Renders SessionHeader
- Renders DayToggle
- Renders TaskList (with drag-drop)
- Renders TaskForm
- Renders ChoiceButtons for each task
- Handles real-time subscriptions
- Manages session state

**Requirements**:
- Subscribe to real-time events on mount
- Update UI on INSERT/UPDATE/DELETE events
- Handle connection state (online/offline indicator)
- Coordinate all child components

**Structure**:
```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { sessionStore } from '$lib/stores/session.store';
  import { getRealtimeRepository, getTaskRepository } from '$lib/config/di';

  const realtimeRepo = getRealtimeRepository();
  const taskRepo = getTaskRepository();

  let subscription: Subscription | null = null;
  let currentDay = $state<'today' | 'tomorrow'>('today');

  onMount(async () => {
    // Subscribe to real-time
    const result = await realtimeRepo.subscribeToSession({
      sessionId: $sessionStore.id,
      eventTypes: ['task', 'choice', 'list']
    });

    if ('subscription' in result) {
      subscription = result.subscription;
      subscription.onEvent(handleRealtimeEvent);
    }
  });

  onDestroy(() => {
    if (subscription) {
      realtimeRepo.unsubscribeFromChannel({ channelId: subscription.channelId });
    }
  });

  function handleRealtimeEvent(event: RealtimeEvent) {
    if (isTaskEvent(event)) {
      // Refresh tasks
    }
  }
</script>

<div class="session-board">
  <SessionHeader />
  <DayToggle bind:selected={currentDay} />
  <TaskList day={currentDay} />
  <TaskForm day={currentDay} />
</div>
```

**Validation**:
- [ ] Real-time updates work
- [ ] All features integrated
- [ ] Performance good (no lag)

---

### Agent 15: Lists Page
**Deliverables**: `/src/routes/lists/+page.svelte`

**Full page for collaborative lists**

- Renders ListCreatorForm
- Renders all lists
- Each list shows items with verification
- Consensus meters
- Real-time list updates

**Validation**:
- [ ] Lists page works
- [ ] Real-time updates
- [ ] Consensus displays

---

### Agent 16: Error Boundaries & Loading States
**Deliverables**: Global error handling

- `+error.svelte` - SvelteKit error page
- `+loading.svelte` - SvelteKit loading page
- Error boundary components
- Global toast notifications

**Validation**:
- [ ] Errors caught and displayed
- [ ] Loading states show
- [ ] Toasts stack correctly

---

## 🌊 WAVE 4: Routes & Polish (2 Agents in Parallel)

**Dependencies**: Waves 1-3 must be complete

### Agent 17: Routes & Navigation
**Deliverables**: All SvelteKit routes

- `src/routes/+page.svelte` - Home (auth or session select)
- `src/routes/+layout.svelte` - Root layout with DI setup
- `src/routes/session/[code]/+page.svelte` - Session page
- `src/routes/auth/callback/+page.svelte` - OAuth callback
- `src/routes/api/health/+server.ts` - Health check

**Requirements**:
- Setup DI in root layout
- Auth guards on protected routes
- URL parameter handling
- Redirects (authenticated → session, unauthenticated → auth)

**Validation**:
- [ ] Routing works
- [ ] Guards work
- [ ] Redirects correct

---

### Agent 18: Polish & Accessibility
**Deliverables**: Final polish

- Accessibility audit (keyboard nav, ARIA, screen reader)
- Performance optimization (code splitting, lazy loading)
- Animation polish (smooth 60fps)
- Mobile responsiveness fixes
- Bundle size optimization

**Tasks**:
- [ ] Run Lighthouse audit (Performance >90, A11y >95)
- [ ] Test keyboard navigation on all pages
- [ ] Test screen reader (VoiceOver/NVDA)
- [ ] Optimize images (if any)
- [ ] Add React.lazy for code splitting
- [ ] Check bundle size (<150kb target)

---

## 📦 Deployment Sequence

### Wave 1: Start (All in Parallel)
```bash
# Deploy 6 agents simultaneously
Agent 1: Base UI Components
Agent 2: Common Components
Agent 3: Layout Components
Agent 4: Svelte Stores
Agent 5: Dependency Injection
Agent 6: Utility Functions
```

**Wait for completion, validate, commit**

### Wave 2: Start (All in Parallel)
```bash
# Deploy 7 agents simultaneously (depends on Wave 1)
Agent 7: Auth Components
Agent 8: Session Components
Agent 9: Task Components (Core)
Agent 10: Task Components (Drag-Drop)
Agent 11: Choice Components
Agent 12: List Components
Agent 13: Vibe Components
```

**Wait for completion, validate, commit**

### Wave 3: Start (All in Parallel)
```bash
# Deploy 3 agents simultaneously (depends on Waves 1-2)
Agent 14: SessionBoard (Main Orchestrator)
Agent 15: Lists Page
Agent 16: Error Boundaries & Loading
```

**Wait for completion, validate, commit**

### Wave 4: Start (All in Parallel)
```bash
# Deploy 2 agents simultaneously (depends on Waves 1-3)
Agent 17: Routes & Navigation
Agent 18: Polish & Accessibility
```

**Wait for completion, validate, commit**

---

## ✅ Validation Gates

### After Wave 1:
- [ ] `npm run check` → 0 errors
- [ ] All base components render
- [ ] Stores work correctly
- [ ] DI setup complete

### After Wave 2:
- [ ] `npm run check` → 0 errors
- [ ] All feature components render
- [ ] Components use DI correctly
- [ ] Mock data displays

### After Wave 3:
- [ ] `npm run check` → 0 errors
- [ ] SessionBoard integrates all features
- [ ] Real-time updates work
- [ ] Lists page works

### After Wave 4:
- [ ] `npm run check` → 0 errors
- [ ] `npm run build` → succeeds
- [ ] Bundle size < 150kb
- [ ] Lighthouse: Performance >90, A11y >95
- [ ] All routes work
- [ ] Mobile responsive

---

## 🚀 Success Metrics

**Phase 4 Complete When**:
- ✅ All 18 agents complete
- ✅ All validation gates passed
- ✅ App runs on mocks end-to-end
- ✅ `npm run dev` starts without errors
- ✅ All user flows functional
- ✅ Lighthouse scores met
- ✅ Bundle size < 150kb
- ✅ 0 TypeScript errors
- ✅ Mobile responsive (tested on actual device)

**Total Agents**: 18
**Total Waves**: 4
**Parallel Efficiency**: 6+7+3+2 agents per wave
**Estimated Duration**: 3-4 days

---

## 🎯 Why This Plan is Genius

1. **Maximum Parallelization**: 18 agents, but only 4 sequential steps
2. **Clear Dependencies**: Each wave depends only on previous waves, never within waves
3. **Incremental Validation**: Validate after each wave, catch issues early
4. **Logical Grouping**: Components grouped by functionality and dependency
5. **Risk Mitigation**: Foundation first, integration last
6. **SDD Compliance**: UI built on validated mocks, guaranteed to work with real services

---

**Ready to deploy Wave 1 (6 agents in parallel)?**

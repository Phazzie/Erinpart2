# Product Requirements Document: Erin's Escapades - Complete Rewrite

**Version**: 2.0.0
**Date**: 2025-11-11
**Methodology**: Seam-Driven Development (SDD)
**Framework**: Svelte + SvelteKit
**Status**: Pre-Implementation

---

## Executive Summary

### Purpose
Complete rewrite of Erin's Escapades collaborative task management application to eliminate technical debt, improve performance, and establish a maintainable, testable codebase using Seam-Driven Development.

### Current State
- **Tech Stack**: React + Next.js 14
- **Lines of Code**: ~1,200 lines (tasks feature alone)
- **Bundle Size**: ~250kb
- **Type Safety**: 19+ instances of `any` type
- **Test Coverage**: <20%
- **Technical Debt**: High (see current analysis)

### Target State
- **Tech Stack**: Svelte 5 + SvelteKit
- **Lines of Code**: ~700 lines (40% reduction)
- **Bundle Size**: ~120kb (50% reduction)
- **Type Safety**: 100% strict TypeScript, 0 `any` types
- **Test Coverage**: >90%
- **Technical Debt**: Zero

### Success Metrics
- ✅ All 8 SDD steps completed with validation
- ✅ `npm run check` passes with 0 errors
- ✅ All contract tests pass (>90% coverage)
- ✅ Integration works on first attempt
- ✅ Performance: First Contentful Paint < 1.2s
- ✅ Bundle size < 150kb
- ✅ Zero runtime type errors in production
- ✅ All accessibility requirements met (WCAG 2.1 AA)

---

## 1. Functional Requirements

### 1.1 Authentication System (@AUTH)

#### @AUTH-001: Anonymous Authentication via Animal Codes
- **Description**: Users authenticate using two random animal names (e.g., "cat-dolphin")
- **Flow**:
  1. User visits app (not authenticated)
  2. System displays animal code form
  3. User selects or is assigned two animals
  4. System creates anonymous Supabase session
  5. User is authenticated and can access sessions
- **Data**: 46 animals across 4 categories (classic, quirky, mythical, exotic)
- **Validation**: Animal combination must be unique per session
- **Error States**: Network failure, Supabase unavailable, duplicate code

#### @AUTH-002: OAuth Authentication (Optional)
- **Description**: Users can optionally sign in with OAuth providers
- **Providers**: Google (initially), extensible for others
- **Flow**:
  1. User clicks "Sign in with Google"
  2. OAuth redirect to provider
  3. Callback returns to `/auth/callback`
  4. Session created with user profile
- **Error States**: OAuth rejection, network failure, callback timeout

#### @AUTH-003: Session Persistence
- **Description**: User sessions persist across browser refreshes
- **Storage**: HTTP-only cookies via Supabase
- **Duration**: 30 days (configurable)
- **Logout**: Explicit logout clears session

### 1.2 Session Management (@SESSION)

#### @SESSION-001: Create Session
- **Description**: Authenticated users can create new collaborative sessions
- **Flow**:
  1. User clicks "Create Session"
  2. System generates unique session code (animal pair)
  3. System creates session record in database
  4. User becomes session host
  5. User redirected to session view
- **Data**: Session ID, host user ID, created timestamp, session code
- **Validation**: Session code uniqueness
- **Error States**: Database failure, code collision (retry with new code)

#### @SESSION-002: Join Session
- **Description**: Users can join existing sessions via code or URL
- **Flow**:
  1. User receives session code or URL
  2. User enters code or clicks URL
  3. System validates session exists
  4. System checks participant limit (not exceeded)
  5. User added to session participants
  6. User redirected to session view
- **Participant Limit**: 10 users per session
- **Validation**: Session exists, limit not exceeded, user not already participant
- **Error States**: Invalid code, session full, session not found

#### @SESSION-003: Leave Session
- **Description**: Users can leave sessions
- **Flow**:
  1. User clicks "Leave Session"
  2. System confirms action
  3. User removed from participants
  4. User redirected to home
- **Host Behavior**: If host leaves, oldest participant becomes new host
- **Error States**: Database failure

#### @SESSION-004: Session Sharing
- **Description**: Users can share sessions via URL or QR code
- **Mechanisms**:
  - Shareable URL: `app.example.com/?session=cat-dolphin`
  - QR code generation for URL
  - Optional pre-filled parameters: `?session=cat-dolphin&answer=yes`
- **Error States**: QR generation failure

### 1.3 Task Management (@TASK)

#### @TASK-001: View Tasks
- **Description**: Users see all tasks for current session, organized by day
- **Organization**:
  - "Today" tab: Tasks for current day
  - "Tomorrow" tab: Tasks for next day
- **Display**: List ordered by `order_index`, newest first
- **Real-time**: Auto-updates when any user modifies tasks
- **Empty State**: "No tasks yet. Create one to get started."
- **Loading State**: Skeleton UI with shimmer effect
- **Error States**: Database connection failure, subscription failure

#### @TASK-002: Create Task
- **Description**: Users can add new tasks
- **Flow**:
  1. User clicks "Add Task"
  2. Form appears with text input
  3. User enters task text (1-500 chars)
  4. User selects day (today/tomorrow)
  5. User optionally marks as secret
  6. User clicks "Save"
  7. Task created and appears in list
- **Validation**:
  - Text: Required, 1-500 characters
  - Day: Required, enum ('today', 'tomorrow')
- **Optimistic Update**: Task appears immediately, rollback on error
- **Error States**: Validation failure, database failure

#### @TASK-003: Update Task
- **Description**: Task creator or session host can edit tasks
- **Editable Fields**: Text, day, is_secret, is_complete
- **Flow**:
  1. User clicks edit icon (only if creator or host)
  2. Inline editor appears
  3. User modifies field(s)
  4. User clicks save or presses Enter
  5. Task updated
- **Optimistic Update**: Update appears immediately, rollback on error
- **Permissions**: Only creator or host can edit
- **Error States**: Permission denied, validation failure, database failure

#### @TASK-004: Delete Task
- **Description**: Task creator or session host can delete tasks
- **Flow**:
  1. User clicks delete icon (only if creator or host)
  2. Confirmation modal appears
  3. User confirms
  4. Task deleted
- **Optimistic Update**: Task removed immediately, rollback on error
- **Permissions**: Only creator or host can delete
- **Error States**: Permission denied, database failure

#### @TASK-005: Complete Task
- **Description**: Any participant can mark tasks as complete
- **Flow**:
  1. User clicks checkbox
  2. Task marked complete with timestamp
  3. Visual indication (strikethrough, checkmark)
- **Behavior**: Completed tasks remain visible (not archived)
- **Optimistic Update**: Completion appears immediately, rollback on error
- **Error States**: Database failure

#### @TASK-006: Reorder Tasks
- **Description**: Users can drag-drop to reorder tasks
- **Flow**:
  1. User drags task to new position
  2. System updates `order_index` for affected tasks
  3. New order persists and syncs to all users
- **Library**: `@dnd-kit/svelte` or `svelte-dnd-action`
- **Optimistic Update**: Reorder appears immediately, rollback on error
- **Error States**: Database failure

#### @TASK-007: Secret Tasks
- **Description**: Tasks can be marked as secret, requiring votes to reveal
- **Behavior**:
  - Creator marks task as secret during creation
  - Other users see "Secret Task" placeholder
  - Users can vote to reveal (vote button)
  - When ≥2 votes, task text revealed to all
- **Voting**: Array of user IDs who voted
- **Error States**: Database failure

#### @TASK-008: Task Comments
- **Description**: Users can add optional comments to tasks
- **Field**: `comments` (text, optional)
- **Display**: Below task text when present
- **Edit**: Creator or host can modify
- **Error States**: Validation failure (max 1000 chars)

### 1.4 Task Choices (@CHOICE)

#### @CHOICE-001: User Task Preferences
- **Description**: Each user can mark personal preference for tasks (yes/no/maybe)
- **Flow**:
  1. User views task
  2. User clicks choice button (yes/no/maybe)
  3. Choice saved for this user + task
  4. Visual indicator shows user's choice
- **Display**: Badge or colored border indicating choice
- **Data**: `task_id`, `user_id`, `choice` (enum)
- **Constraint**: One choice per user per task (upsert behavior)
- **Real-time**: Other users see updated choice counts
- **Error States**: Database failure

#### @CHOICE-002: Choice Aggregation
- **Description**: Display summary of all users' choices for each task
- **Display**: "3 yes, 1 no, 2 maybe" or progress bar
- **Calculation**: Real-time count from `task_choices` table
- **Error States**: None (degrades gracefully)

### 1.5 Collaborative Lists (@LIST)

#### @LIST-001: Create List
- **Description**: Users can create collaborative lists for the session
- **Types**: Bullet list or numbered list
- **Flow**:
  1. User clicks "Create List"
  2. Form appears
  3. User enters list title (1-200 chars)
  4. User selects type (bullet/numbered)
  5. User clicks "Create"
  6. Empty list created
- **Validation**: Title required, type required
- **Error States**: Validation failure, database failure

#### @LIST-002: Add List Items
- **Description**: Users can add items to lists
- **Flow**:
  1. User types in "Add item" input
  2. User presses Enter or clicks Add
  3. Item appended to list
  4. Input cleared for next item
- **Ordering**: Items have `order_index` (sequential)
- **Validation**: Text required (1-500 chars)
- **Optimistic Update**: Item appears immediately
- **Error States**: Validation failure, database failure

#### @LIST-003: Verify List Items
- **Description**: Users can mark items as accurate (green) or inaccurate (red)
- **Flow**:
  1. User views list item
  2. User clicks ✓ (accurate) or ✗ (inaccurate)
  3. Verification recorded with user ID
  4. Item border color changes based on consensus
- **Consensus Calculation**:
  - >50% accurate votes = green border
  - >50% inaccurate votes = red border
  - Tie or no votes = neutral
- **Corrections**: If marking inaccurate, user can provide correction text
- **Constraint**: One verification per user per item (upsert)
- **Error States**: Database failure

#### @LIST-004: Consensus Meter
- **Description**: Visual gamification showing agreement level
- **Display**: Progress bar or percentage
- **Calculation**: (accurate votes / total votes) * 100
- **Thresholds**:
  - 0-40%: Low consensus (red)
  - 41-70%: Medium consensus (yellow)
  - 71-100%: High consensus (green)

#### @LIST-005: Delete List
- **Description**: List creator or session host can delete lists
- **Flow**:
  1. User clicks delete icon (only if creator or host)
  2. Confirmation modal
  3. List and all items deleted
- **Cascade**: Deleting list deletes all items and verifications
- **Error States**: Permission denied, database failure

### 1.6 Vibe/Theme System (@VIBE)

#### @VIBE-001: Predefined Themes
- **Description**: Users can select from predefined visual themes ("vibes")
- **Available Themes**:
  - Chaos Gremlin (neon pink/purple, high energy)
  - Zen Master (calm blues/greens, minimal)
  - Productivity Beast (orange/yellow, motivational)
  - Default Dark (cyberpunk aesthetic)
- **Data**: JSON in `day_vibe` column of sessions table
- **Application**: CSS variables applied to entire session view
- **Persistence**: Theme saved per session
- **Error States**: None (falls back to default)

#### @VIBE-002: Custom Themes (Future)
- **Description**: Users can create custom color schemes
- **Fields**: Primary color, secondary color, accent color, background
- **Validation**: Valid hex colors
- **Preview**: Live preview before saving
- **Note**: Deprioritized for initial launch

### 1.7 Real-time Collaboration (@REALTIME)

#### @REALTIME-001: Task Updates
- **Description**: All users see task changes in real-time
- **Events**: INSERT, UPDATE, DELETE on tasks table
- **Behavior**:
  - New task appears for all users instantly
  - Task edit reflects immediately
  - Task deletion removes from all views
- **Technology**: Supabase Realtime (Postgres CDC)
- **Channel**: One channel per session (`session:{session_id}`)
- **Error States**: Subscription failure, connection lost

#### @REALTIME-002: Task Choice Updates
- **Description**: Choice changes appear instantly for all users
- **Events**: INSERT, UPDATE, DELETE on task_choices table
- **Error States**: Subscription failure

#### @REALTIME-003: List Updates
- **Description**: List and item changes sync in real-time
- **Events**: All operations on collaborative_lists, list_items, list_item_verifications
- **Error States**: Subscription failure

#### @REALTIME-004: Presence Indicators
- **Description**: Users see who else is currently in the session
- **Display**: Avatars or animal icons in top bar
- **Technology**: Supabase Presence
- **Update Frequency**: Every 30 seconds
- **Error States**: Presence failure (degrades gracefully)

#### @REALTIME-005: Connection State
- **Description**: Users are notified of real-time connection status
- **States**:
  - Connected (green indicator)
  - Connecting (yellow, spinner)
  - Disconnected (red, "Reconnecting..." message)
- **Auto-reconnect**: Exponential backoff (1s, 2s, 4s, 8s, 16s max)
- **Error States**: Permanent connection failure (manual retry button)

### 1.8 User Experience (@UX)

#### @UX-001: Mobile Responsive
- **Breakpoints**:
  - Mobile: <640px
  - Tablet: 640-1024px
  - Desktop: >1024px
- **Behavior**:
  - Mobile: Bottom navigation, single column
  - Tablet: Side navigation, single column
  - Desktop: Side navigation, multi-column support
- **Testing**: Must test on actual devices, not just DevTools

#### @UX-002: Loading States
- **Requirement**: All async operations show loading state
- **Types**:
  - Skeleton screens (initial load)
  - Spinners (actions)
  - Progress bars (multi-step)
  - Shimmer effects (placeholders)
- **Duration**: If >300ms, show loading indicator

#### @UX-003: Error States
- **Requirement**: All errors shown to user with actionable message
- **Components**:
  - Toast notifications (transient errors)
  - Error boundaries (critical failures)
  - Inline validation (form errors)
- **Message Quality**: User-friendly, not technical (e.g., "Couldn't save task" not "500 Internal Server Error")
- **Actions**: All errors include recovery action (retry, dismiss, contact support)

#### @UX-004: Empty States
- **Requirement**: All lists/tables have meaningful empty states
- **Elements**:
  - Illustration or icon
  - Descriptive message ("No tasks yet")
  - Call to action ("Create your first task")

#### @UX-005: Accessibility
- **Standard**: WCAG 2.1 AA compliance
- **Requirements**:
  - Keyboard navigation (tab order, focus indicators)
  - Screen reader support (ARIA labels, semantic HTML)
  - Color contrast ≥4.5:1 for text
  - Focus management (modals, dropdowns)
  - No color-only information (use icons + color)
- **Testing**: Automated (axe, pa11y) + manual (keyboard, screen reader)

#### @UX-006: Animations
- **Principle**: Smooth but not distracting
- **Uses**:
  - Page transitions (fade)
  - List reordering (position animation)
  - Task completion (checkmark animation)
  - Theme switching (color transition)
- **Performance**: 60fps, GPU-accelerated (transform, opacity only)
- **Accessibility**: Respect `prefers-reduced-motion`

---

## 2. Non-Functional Requirements

### 2.1 Performance (@PERF)

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | <1.2s | Lighthouse |
| Time to Interactive (TTI) | <2.5s | Lighthouse |
| Total Bundle Size | <150kb (gzipped) | Webpack analyzer |
| Largest Contentful Paint (LCP) | <2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | <0.1 | Lighthouse |
| API Response Time (p95) | <200ms | Monitoring |
| Real-time Event Latency | <500ms | Custom metric |

### 2.2 Security (@SEC)

#### @SEC-001: Authentication Security
- **Requirements**:
  - HTTP-only cookies for session tokens
  - CSRF protection (Supabase built-in)
  - No session tokens in localStorage or sessionStorage
  - Session timeout: 30 days (configurable)
  - Logout invalidates server-side session

#### @SEC-002: Authorization (RLS)
- **Requirements**:
  - All database operations enforce Row Level Security (RLS)
  - Policies tested with automated tests
  - No infinite recursion in RLS policies (fixed in current version)
  - Principle of least privilege (users can only access their sessions)

#### @SEC-003: Input Validation
- **Requirements**:
  - Client-side validation (Zod schemas)
  - Server-side validation (Supabase constraints + RLS)
  - SQL injection prevention (parameterized queries only)
  - XSS prevention (sanitize user input, use framework escaping)
  - Content-Type validation

#### @SEC-004: Rate Limiting
- **Requirements**:
  - API rate limits: 100 requests/minute per user
  - Authentication attempts: 5 failed attempts = 15 min lockout
  - Session creation: 5 per hour per user
  - Implemented via Supabase Edge Functions or middleware

#### @SEC-005: Security Headers
- **Requirements** (defined in `vercel.json` or middleware):
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy

### 2.3 Reliability (@REL)

#### @REL-001: Error Recovery
- **Requirement**: All user actions are recoverable
- **Mechanisms**:
  - Optimistic updates with rollback
  - Retry logic for transient failures (exponential backoff)
  - Offline detection (disable actions when offline)
  - Conflict resolution (last-write-wins for now)

#### @REL-002: Data Integrity
- **Requirements**:
  - Database constraints prevent invalid states
  - Transactions for multi-step operations
  - Foreign key constraints enforced
  - Unique constraints for codes, choices

#### @REL-003: Monitoring
- **Requirements**:
  - Error tracking (Sentry or similar)
  - Performance monitoring (Vercel Analytics)
  - Uptime monitoring (health endpoint + external monitor)
  - Real-time subscription health checks

### 2.4 Testing (@TEST)

#### @TEST-001: Unit Tests
- **Coverage Target**: >90% for all modules
- **Framework**: Vitest (Svelte's preferred test runner)
- **Scope**:
  - All utility functions (100% coverage)
  - All business logic (100% coverage)
  - All Svelte stores (100% coverage)
  - All contract implementations (100% coverage)

#### @TEST-002: Integration Tests
- **Coverage Target**: >80% of user flows
- **Framework**: Vitest + Testing Library
- **Scope**:
  - Auth flow (anonymous, OAuth)
  - Session flow (create, join, leave)
  - Task CRUD flow
  - Real-time updates flow

#### @TEST-003: E2E Tests
- **Coverage Target**: All critical user journeys
- **Framework**: Playwright
- **Scope**:
  - Happy path: Create session → Add task → Complete task
  - Collaboration: Two users in same session
  - Error scenarios: Network failure, invalid input
  - Mobile scenarios: Touch interactions

#### @TEST-004: Contract Tests
- **Coverage Target**: 100% of all seams
- **Framework**: Vitest
- **Scope**:
  - Mock validates against contract interface
  - Mock output shape matches contract exactly
  - No extra fields in mock responses
  - All error states tested

### 2.5 Maintainability (@MAINT)

#### @MAINT-001: Code Quality
- **Requirements**:
  - ESLint: 0 warnings, 0 errors
  - Prettier: All files formatted
  - TypeScript strict mode: 0 `any` types
  - `npm run check`: 0 errors
  - No console.log in production code (use proper logging)

#### @MAINT-002: Documentation
- **Requirements**:
  - All public APIs documented (JSDoc)
  - All seams documented (comments in contract files)
  - README with setup instructions
  - Architecture decision records (ADRs) for major choices
  - Troubleshooting guide

#### @MAINT-003: Dependency Management
- **Requirements**:
  - Automated dependency updates (Renovate or Dependabot)
  - Security audits (npm audit, Snyk)
  - License compliance check
  - No unused dependencies

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Frontend Framework** | Svelte | 5.x | 40% less code, 50% smaller bundles |
| **Meta-Framework** | SvelteKit | 2.x | SSR, routing, API routes |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Styling** | Tailwind CSS | 4.x | Utility-first, consistent |
| **UI Components** | Melt UI | 0.x | Headless, accessible (Radix equivalent) |
| **Animations** | Svelte Motion | 0.x | Native Svelte animations |
| **Drag-Drop** | svelte-dnd-action | 0.x | Lightweight, Svelte-native |
| **Forms** | Svelte Forms Lib | 2.x | + Zod validation |
| **Database** | Supabase (Postgres) | - | Real-time, auth, RLS |
| **Auth** | Supabase Auth | - | Anonymous + OAuth |
| **Real-time** | Supabase Realtime | - | Postgres CDC |
| **State Management** | Svelte Stores | Built-in | Native reactivity |
| **Testing (Unit)** | Vitest | 2.x | Fast, Vite-native |
| **Testing (E2E)** | Playwright | 1.x | Cross-browser |
| **Deployment** | Vercel | - | Edge functions, analytics |
| **Monitoring** | Sentry | - | Error tracking |

### 3.2 Folder Structure (Seam-Driven)

```
erins-escapades-v2/
├── src/
│   ├── lib/
│   │   ├── contracts/           # ALL SEAMS DEFINED HERE (Step 3)
│   │   │   ├── auth.contracts.ts
│   │   │   ├── session.contracts.ts
│   │   │   ├── task.contracts.ts
│   │   │   ├── choice.contracts.ts
│   │   │   ├── list.contracts.ts
│   │   │   ├── realtime.contracts.ts
│   │   │   ├── vibe.contracts.ts
│   │   │   └── ui-state.contracts.ts
│   │   │
│   │   ├── repositories/        # Real implementations (Step 7)
│   │   │   ├── auth.repository.ts
│   │   │   ├── session.repository.ts
│   │   │   ├── task.repository.ts
│   │   │   ├── choice.repository.ts
│   │   │   ├── list.repository.ts
│   │   │   └── realtime.repository.ts
│   │   │
│   │   ├── mocks/               # Mock implementations (Step 4)
│   │   │   ├── auth.mock.ts
│   │   │   ├── session.mock.ts
│   │   │   ├── task.mock.ts
│   │   │   ├── choice.mock.ts
│   │   │   ├── list.mock.ts
│   │   │   └── realtime.mock.ts
│   │   │
│   │   ├── stores/              # Svelte stores (State management)
│   │   │   ├── session.store.ts
│   │   │   ├── user.store.ts
│   │   │   └── ui.store.ts
│   │   │
│   │   ├── components/          # UI components (Step 6)
│   │   │   ├── auth/
│   │   │   ├── session/
│   │   │   ├── task/
│   │   │   ├── choice/
│   │   │   ├── list/
│   │   │   ├── vibe/
│   │   │   └── common/
│   │   │
│   │   ├── utils/               # Utilities
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   └── error-handling.ts
│   │   │
│   │   └── config/              # Configuration
│   │       ├── supabase.ts
│   │       ├── constants.ts
│   │       └── environment.ts
│   │
│   ├── routes/                  # SvelteKit routes
│   │   ├── +page.svelte         # Home
│   │   ├── +layout.svelte       # Root layout
│   │   ├── auth/
│   │   │   └── callback/
│   │   └── api/
│   │       └── health/
│   │
│   ├── tests/                   # Tests (Step 5)
│   │   ├── contracts/           # Contract validation tests
│   │   ├── unit/                # Unit tests
│   │   ├── integration/         # Integration tests
│   │   └── e2e/                 # Playwright E2E tests
│   │
│   └── app.html                 # HTML template
│
├── docs/
│   ├── DATA-BOUNDARIES.md       # Step 2 output
│   ├── CONTRACT-BLUEPRINT.md    # Step 3 template
│   ├── ADR/                     # Architecture decisions
│   └── API.md                   # API documentation
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── playwright.config.ts
└── package.json
```

### 3.3 Dependency Injection Pattern

**Pattern**: Context-based DI (Svelte's `setContext`/`getContext`)

```typescript
// app.ts (root)
import { setContext } from 'svelte';
import {
  USE_MOCKS,  // Environment flag
  createAuthRepository,
  createAuthMock
} from './lib';

// Step 8: The Switch (toggle between mock and real)
const authRepository = USE_MOCKS
  ? createAuthMock()
  : createAuthRepository();

setContext('authRepository', authRepository);

// components/auth/LoginForm.svelte
import { getContext } from 'svelte';
const authRepository = getContext('authRepository'); // Seam!
```

### 3.4 Data Flow

```
User Action
  → UI Component
  → Repository Interface (Seam)
  → Mock OR Real Implementation
  → Supabase
  → Real-time Event
  → Svelte Store Update
  → UI Re-renders
```

---

## 4. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Contract incompleteness** | Medium | Critical | Step 2 review by multiple agents, checklist validation |
| **Mock/Real mismatch** | Medium | Critical | Automated contract tests (Step 5), mandatory `npm run check` |
| **Integration failure** | Low (if SDD followed) | Critical | Integration Readiness Checklist (Step 8) |
| **Realtime library for Svelte** | Low | Medium | Supabase JS client works with Svelte, well-documented |
| **Drag-drop library maturity** | Low | Low | Multiple Svelte DnD libraries available, fallback to HTML5 |
| **Scope creep** | Medium | Medium | Freeze requirements after Step 2, defer new features |
| **Test writing time** | Medium | Low | Parallelize test writing (Agent 7 starts after Step 4) |
| **Learning curve (Svelte)** | Low | Low | Svelte simpler than React, excellent docs |

---

## 5. Requirement Traceability Matrix

| Requirement ID | Feature | Seam | Test ID | Status |
|----------------|---------|------|---------|--------|
| @AUTH-001 | Anonymous Auth | AuthSeam | TEST-AUTH-001 | Pending |
| @AUTH-002 | OAuth Auth | AuthSeam | TEST-AUTH-002 | Pending |
| @SESSION-001 | Create Session | SessionSeam | TEST-SESSION-001 | Pending |
| @SESSION-002 | Join Session | SessionSeam | TEST-SESSION-002 | Pending |
| @TASK-001 | View Tasks | TaskSeam | TEST-TASK-001 | Pending |
| @TASK-002 | Create Task | TaskSeam | TEST-TASK-002 | Pending |
| ... | ... | ... | ... | ... |

_(Full matrix in separate document)_

---

## 6. Out of Scope (V1)

**Explicitly excluded from this rewrite** (defer to future versions):

- ❌ Custom theme creation (@VIBE-002)
- ❌ Task templates or recurring tasks
- ❌ File attachments to tasks
- ❌ @ mentions in comments
- ❌ Email notifications
- ❌ Mobile native apps (iOS/Android)
- ❌ Offline-first capability (future PWA enhancement)
- ❌ Internationalization (i18n) - English only for V1
- ❌ Dark/light mode toggle (dark only for V1)
- ❌ Export to CSV/PDF
- ❌ Advanced analytics/reporting

---

## 7. Success Criteria

**The rewrite is complete when**:

1. ✅ All 8 SDD steps completed and validated
2. ✅ `npm run check` → 0 errors
3. ✅ `npm run test` → >90% coverage, all passing
4. ✅ `npm run test:e2e` → All critical journeys passing
5. ✅ `npm run build` → Bundle size <150kb
6. ✅ Lighthouse score: Performance >90, Accessibility >95
7. ✅ All functional requirements (@AUTH through @REALTIME) implemented
8. ✅ All non-functional requirements (@PERF, @SEC, @REL, @TEST, @MAINT) met
9. ✅ Integration works on first attempt (Step 8)
10. ✅ Zero technical debt (no TODOs, no `any` types, no hacks)
11. ✅ Deployed to production (Vercel)
12. ✅ Monitoring configured (Sentry)

---

## Appendix A: Glossary

- **Seam**: A data boundary where behavior can be altered without modifying code
- **Contract**: TypeScript interface defining the exact shape of data at a seam
- **Mock**: A contract-compliant implementation returning static/generated data
- **Repository**: The real implementation of a contract, accessing actual data sources
- **DI (Dependency Injection)**: Pattern for providing implementations to consumers
- **RLS (Row Level Security)**: Postgres feature for row-level access control
- **CDC (Change Data Capture)**: Mechanism for real-time database change notifications
- **SDD (Seam-Driven Development)**: Methodology for zero-integration-debt development

---

## Appendix B: References

- Seam-Driven Development Guide (provided)
- SvelteKit Documentation: https://kit.svelte.dev/docs
- Supabase Documentation: https://supabase.com/docs
- WCAG 2.1 AA Guidelines: https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa

---

**Document End**

_This PRD is a living document. All changes must be reviewed and approved before implementation begins._

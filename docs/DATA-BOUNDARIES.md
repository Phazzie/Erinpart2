# Data Boundaries Map (SDD Step 2)

**Project**: Erin's Escapades V2 Rewrite
**Date**: 2025-11-11
**SDD Phase**: Step 2 - IDENTIFY

> This document maps EVERY data boundary (seam) in the application. Each seam will have a corresponding contract definition in Step 3.

---

## Seam Identification Checklist

- [x] Frontend ↔ Backend API boundaries
- [x] Service ↔ Service communication
- [x] UI Component State Transitions
- [x] Real-time Event boundaries
- [x] Error state boundaries
- [x] Loading state boundaries

---

## 1. Authentication Seams

### SEAM-AUTH-001: Anonymous Sign In
**Boundary**: UI Component → Auth Service
**Direction**: Bidirectional (Request → Response)

**Request Data**:
```typescript
{
  animalOne: string,    // e.g., "cat"
  animalTwo: string     // e.g., "dolphin"
}
```

**Response Data (Success)**:
```typescript
{
  user: {
    id: string,
    animalCode: string,
    createdAt: string
  },
  session: {
    accessToken: string,
    refreshToken: string,
    expiresAt: string
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'DUPLICATE_CODE' | 'NETWORK_ERROR' | 'SERVICE_UNAVAILABLE',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `loading` | `success` | `error`

---

### SEAM-AUTH-002: OAuth Sign In
**Boundary**: UI Component → Auth Service → OAuth Provider
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  provider: 'google' | 'github' // Extensible
}
```

**Response Data (Success)**:
```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    avatarUrl: string | null
  },
  session: {
    accessToken: string,
    refreshToken: string,
    expiresAt: string
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'OAUTH_REJECTED' | 'OAUTH_TIMEOUT' | 'NETWORK_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `redirecting` | `success` | `error`

---

### SEAM-AUTH-003: Sign Out
**Boundary**: UI Component → Auth Service
**Direction**: Unidirectional (fire-and-forget)

**Request Data**: `void` (uses existing session)

**Response Data (Success)**:
```typescript
{
  success: true
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'ALREADY_SIGNED_OUT' | 'NETWORK_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `loading` | `success` | `error`

---

### SEAM-AUTH-004: Get Current User
**Boundary**: UI Component → Auth Service
**Direction**: Query (read-only)

**Request Data**: `void`

**Response Data (Authenticated)**:
```typescript
{
  user: {
    id: string,
    animalCode?: string,
    email?: string,
    name?: string,
    avatarUrl?: string | null
  }
}
```

**Response Data (Not Authenticated)**:
```typescript
{
  user: null
}
```

**UI States**: `loading` | `authenticated` | `unauthenticated`

---

## 2. Session Management Seams

### SEAM-SESSION-001: Create Session
**Boundary**: UI Component → Session Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  userId: string,
  userName: string    // Animal code or user name
}
```

**Response Data (Success)**:
```typescript
{
  session: {
    id: string,
    code: string,       // e.g., "cat-dolphin"
    hostId: string,
    createdAt: string,
    participantCount: number,
    dayVibe: VibeConfig | null
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'CODE_COLLISION' | 'DATABASE_ERROR' | 'RATE_LIMIT_EXCEEDED',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `creating` | `success` | `error`

---

### SEAM-SESSION-002: Join Session
**Boundary**: UI Component → Session Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  sessionCode: string,  // e.g., "cat-dolphin"
  userId: string,
  userName: string
}
```

**Response Data (Success)**:
```typescript
{
  session: {
    id: string,
    code: string,
    hostId: string,
    createdAt: string,
    participantCount: number,
    dayVibe: VibeConfig | null,
    isUserHost: boolean
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'SESSION_NOT_FOUND' | 'SESSION_FULL' | 'ALREADY_PARTICIPANT' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean,
    metadata?: {
      currentParticipants?: number,
      maxParticipants?: number
    }
  }
}
```

**UI States**: `idle` | `joining` | `success` | `error`

---

### SEAM-SESSION-003: Leave Session
**Boundary**: UI Component → Session Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  sessionId: string,
  userId: string
}
```

**Response Data (Success)**:
```typescript
{
  success: true,
  newHostId?: string  // If user was host and ownership transferred
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'NOT_PARTICIPANT' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `leaving` | `success` | `error`

---

### SEAM-SESSION-004: Get Session Details
**Boundary**: UI Component → Session Service
**Direction**: Query (read-only)

**Request Data**:
```typescript
{
  sessionId: string
}
```

**Response Data (Success)**:
```typescript
{
  session: {
    id: string,
    code: string,
    hostId: string,
    createdAt: string,
    participantCount: number,
    dayVibe: VibeConfig | null,
    isUserHost: boolean,
    participants: Array<{
      id: string,
      name: string,
      joinedAt: string,
      isOnline: boolean
    }>
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'SESSION_NOT_FOUND' | 'UNAUTHORIZED' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `loading` | `loaded` | `error`

---

### SEAM-SESSION-005: Generate Share Data
**Boundary**: UI Component → Session Service
**Direction**: Query (read-only)

**Request Data**:
```typescript
{
  sessionId: string,
  includeQR?: boolean,
  preFillAnswers?: Record<string, string>
}
```

**Response Data (Success)**:
```typescript
{
  shareUrl: string,      // Full URL with params
  qrCodeDataUrl?: string // Base64 PNG if requested
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'QR_GENERATION_FAILED' | 'INVALID_SESSION',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `generating` | `ready` | `error`

---

## 3. Task Management Seams

### SEAM-TASK-001: Get Tasks
**Boundary**: UI Component → Task Service
**Direction**: Query (read-only)

**Request Data**:
```typescript
{
  sessionId: string,
  day?: 'today' | 'tomorrow',  // Filter by day
  includeCompleted?: boolean   // Default: true
}
```

**Response Data (Success)**:
```typescript
{
  tasks: Array<{
    id: string,
    sessionId: string,
    text: string,
    isComplete: boolean,
    completedAt: string | null,
    day: 'today' | 'tomorrow',
    orderIndex: number,
    isSecret: boolean,
    votes: string[],  // User IDs who voted to reveal
    comments: string | null,
    createdBy: string,
    createdByName: string,
    createdAt: string,
    updatedAt: string,
    canEdit: boolean,    // Derived: is creator or host
    canDelete: boolean   // Derived: is creator or host
  }>,
  total: number,
  hasMore: boolean  // For future pagination
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'SESSION_NOT_FOUND' | 'UNAUTHORIZED' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `loading` | `loaded` | `error` | `empty`

---

### SEAM-TASK-002: Create Task
**Boundary**: UI Component → Task Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  sessionId: string,
  text: string,         // 1-500 chars
  day: 'today' | 'tomorrow',
  isSecret: boolean,
  comments?: string,    // 0-1000 chars
  createdBy: string,
  createdByName: string
}
```

**Response Data (Success)**:
```typescript
{
  task: {
    id: string,
    sessionId: string,
    text: string,
    isComplete: false,
    completedAt: null,
    day: 'today' | 'tomorrow',
    orderIndex: number,  // Auto-assigned
    isSecret: boolean,
    votes: [],
    comments: string | null,
    createdBy: string,
    createdByName: string,
    createdAt: string,
    updatedAt: string,
    canEdit: true,
    canDelete: true
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'DATABASE_ERROR' | 'RATE_LIMIT_EXCEEDED',
    message: string,
    retryable: boolean,
    validationErrors?: Record<string, string[]>  // Field-level errors
  }
}
```

**UI States**: `idle` | `creating` | `success` | `error`

---

### SEAM-TASK-003: Update Task
**Boundary**: UI Component → Task Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  taskId: string,
  updates: {
    text?: string,
    day?: 'today' | 'tomorrow',
    isSecret?: boolean,
    isComplete?: boolean,
    comments?: string
  }
}
```

**Response Data (Success)**:
```typescript
{
  task: {
    // Full task object with updates applied
    id: string,
    // ... all fields from SEAM-TASK-001
    updatedAt: string  // New timestamp
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean,
    validationErrors?: Record<string, string[]>
  }
}
```

**UI States**: `idle` | `updating` | `success` | `error`

---

### SEAM-TASK-004: Delete Task
**Boundary**: UI Component → Task Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  taskId: string
}
```

**Response Data (Success)**:
```typescript
{
  success: true,
  deletedId: string
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `deleting` | `success` | `error`

---

### SEAM-TASK-005: Reorder Tasks
**Boundary**: UI Component → Task Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  sessionId: string,
  day: 'today' | 'tomorrow',
  taskOrdering: Array<{
    taskId: string,
    newOrderIndex: number
  }>
}
```

**Response Data (Success)**:
```typescript
{
  success: true,
  updatedTasks: Array<{
    id: string,
    orderIndex: number
  }>
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'UNAUTHORIZED' | 'INVALID_ORDERING' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `reordering` | `success` | `error`

---

### SEAM-TASK-006: Vote to Reveal Secret
**Boundary**: UI Component → Task Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  taskId: string,
  userId: string
}
```

**Response Data (Success)**:
```typescript
{
  task: {
    id: string,
    votes: string[],  // Updated vote array
    isRevealed: boolean,  // Derived: votes.length >= 2
    revealedText?: string  // Only if isRevealed = true
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'UNAUTHORIZED' | 'NOT_SECRET_TASK' | 'ALREADY_VOTED' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `voting` | `success` | `error`

---

## 4. Task Choice Seams

### SEAM-CHOICE-001: Get Task Choices
**Boundary**: UI Component → Choice Service
**Direction**: Query (read-only)

**Request Data**:
```typescript
{
  taskId: string
}
```

**Response Data (Success)**:
```typescript
{
  choices: Array<{
    id: string,
    taskId: string,
    userId: string,
    userName: string,
    choice: 'yes' | 'no' | 'maybe',
    createdAt: string,
    updatedAt: string
  }>,
  aggregation: {
    yes: number,
    no: number,
    maybe: number,
    total: number
  },
  currentUserChoice: 'yes' | 'no' | 'maybe' | null
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'TASK_NOT_FOUND' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `loading` | `loaded` | `error`

---

### SEAM-CHOICE-002: Set Task Choice
**Boundary**: UI Component → Choice Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  taskId: string,
  userId: string,
  userName: string,
  choice: 'yes' | 'no' | 'maybe'
}
```

**Response Data (Success)**:
```typescript
{
  choice: {
    id: string,
    taskId: string,
    userId: string,
    userName: string,
    choice: 'yes' | 'no' | 'maybe',
    createdAt: string,
    updatedAt: string
  },
  aggregation: {
    yes: number,
    no: number,
    maybe: number,
    total: number
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'TASK_NOT_FOUND' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `saving` | `success` | `error`

---

## 5. Collaborative List Seams

### SEAM-LIST-001: Get Lists
**Boundary**: UI Component → List Service
**Direction**: Query (read-only)

**Request Data**:
```typescript
{
  sessionId: string
}
```

**Response Data (Success)**:
```typescript
{
  lists: Array<{
    id: string,
    sessionId: string,
    title: string,
    listType: 'bullet' | 'numbered',
    creatorId: string,
    creatorName: string,
    createdAt: string,
    updatedAt: string,
    itemCount: number,
    canDelete: boolean  // Derived: is creator or host
  }>
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'SESSION_NOT_FOUND' | 'UNAUTHORIZED' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `loading` | `loaded` | `error` | `empty`

---

### SEAM-LIST-002: Create List
**Boundary**: UI Component → List Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  sessionId: string,
  title: string,        // 1-200 chars
  listType: 'bullet' | 'numbered',
  creatorId: string,
  creatorName: string
}
```

**Response Data (Success)**:
```typescript
{
  list: {
    id: string,
    sessionId: string,
    title: string,
    listType: 'bullet' | 'numbered',
    creatorId: string,
    creatorName: string,
    createdAt: string,
    updatedAt: string,
    itemCount: 0,
    canDelete: true
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean,
    validationErrors?: Record<string, string[]>
  }
}
```

**UI States**: `idle` | `creating` | `success` | `error`

---

### SEAM-LIST-003: Delete List
**Boundary**: UI Component → List Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  listId: string
}
```

**Response Data (Success)**:
```typescript
{
  success: true,
  deletedId: string,
  deletedItemCount: number  // Cascade count
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `deleting` | `success` | `error`

---

### SEAM-LIST-004: Get List Items
**Boundary**: UI Component → List Service
**Direction**: Query (read-only)

**Request Data**:
```typescript
{
  listId: string
}
```

**Response Data (Success)**:
```typescript
{
  items: Array<{
    id: string,
    listId: string,
    text: string,
    orderIndex: number,
    createdAt: string,
    updatedAt: string,
    verificationStatus: 'neutral' | 'accurate' | 'inaccurate',  // Derived from consensus
    verificationCount: {
      accurate: number,
      inaccurate: number,
      total: number
    },
    consensusPercentage: number,  // 0-100
    corrections: Array<{
      userId: string,
      userName: string,
      correctionText: string
    }>
  }>
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'LIST_NOT_FOUND' | 'UNAUTHORIZED' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `loading` | `loaded` | `error` | `empty`

---

### SEAM-LIST-005: Add List Item
**Boundary**: UI Component → List Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  listId: string,
  text: string  // 1-500 chars
}
```

**Response Data (Success)**:
```typescript
{
  item: {
    id: string,
    listId: string,
    text: string,
    orderIndex: number,  // Auto-assigned (max + 1)
    createdAt: string,
    updatedAt: string,
    verificationStatus: 'neutral',
    verificationCount: {
      accurate: 0,
      inaccurate: 0,
      total: 0
    },
    consensusPercentage: 0,
    corrections: []
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'LIST_NOT_FOUND' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean,
    validationErrors?: Record<string, string[]>
  }
}
```

**UI States**: `idle` | `adding` | `success` | `error`

---

### SEAM-LIST-006: Update List Item
**Boundary**: UI Component → List Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  itemId: string,
  text: string
}
```

**Response Data (Success)**:
```typescript
{
  item: {
    // Full item object with updated text and timestamp
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `updating` | `success` | `error`

---

### SEAM-LIST-007: Delete List Item
**Boundary**: UI Component → List Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  itemId: string
}
```

**Response Data (Success)**:
```typescript
{
  success: true,
  deletedId: string
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'NOT_FOUND' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `deleting` | `success` | `error`

---

### SEAM-LIST-008: Verify List Item
**Boundary**: UI Component → List Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  itemId: string,
  userId: string,
  userName: string,
  isAccurate: boolean,
  correctionText?: string  // Required if isAccurate = false
}
```

**Response Data (Success)**:
```typescript
{
  verification: {
    id: string,
    itemId: string,
    userId: string,
    userName: string,
    isAccurate: boolean,
    correctionText: string | null,
    createdAt: string,
    updatedAt: string
  },
  updatedItem: {
    id: string,
    verificationStatus: 'neutral' | 'accurate' | 'inaccurate',
    verificationCount: {
      accurate: number,
      inaccurate: number,
      total: number
    },
    consensusPercentage: number
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'VALIDATION_ERROR' | 'ITEM_NOT_FOUND' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean,
    validationErrors?: Record<string, string[]>
  }
}
```

**UI States**: `idle` | `verifying` | `success` | `error`

---

## 6. Vibe/Theme Seams

### SEAM-VIBE-001: Get Available Vibes
**Boundary**: UI Component → Vibe Service
**Direction**: Query (read-only)

**Request Data**: `void`

**Response Data (Success)**:
```typescript
{
  vibes: Array<{
    id: string,
    name: string,
    description: string,
    colorScheme: {
      primary: string,    // Hex color
      secondary: string,
      accent: string,
      background: string
    },
    previewImage?: string
  }>
}
```

**Response Data (Error)**: N/A (static data, no errors)

**UI States**: `loaded`

---

### SEAM-VIBE-002: Set Session Vibe
**Boundary**: UI Component → Vibe Service
**Direction**: Bidirectional

**Request Data**:
```typescript
{
  sessionId: string,
  vibeConfig: {
    id: string,
    colorScheme: {
      primary: string,
      secondary: string,
      accent: string,
      background: string
    }
  }
}
```

**Response Data (Success)**:
```typescript
{
  success: true,
  updatedVibe: {
    id: string,
    colorScheme: { /* ... */ }
  }
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'UNAUTHORIZED' | 'INVALID_VIBE' | 'DATABASE_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `idle` | `applying` | `success` | `error`

---

## 7. Real-time Seams

### SEAM-REALTIME-001: Subscribe to Session Channel
**Boundary**: UI Component → Realtime Service
**Direction**: Subscription (long-lived)

**Request Data**:
```typescript
{
  sessionId: string,
  eventTypes: Array<'task' | 'choice' | 'list' | 'presence'>
}
```

**Subscription Events (Task)**:
```typescript
{
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  table: 'tasks',
  record: {
    // Full task object from SEAM-TASK-001
  },
  old_record?: {
    // Previous state (UPDATE/DELETE only)
  }
}
```

**Subscription Events (Choice)**:
```typescript
{
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  table: 'task_choices',
  record: {
    // Full choice object from SEAM-CHOICE-001
  }
}
```

**Subscription Events (List)**:
```typescript
{
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  table: 'collaborative_lists' | 'list_items' | 'list_item_verifications',
  record: {
    // Full object from respective seam
  }
}
```

**Subscription Events (Presence)**:
```typescript
{
  type: 'join' | 'leave' | 'sync',
  userId: string,
  userName: string,
  timestamp: string
}
```

**Connection States**:
```typescript
{
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed',
  lastConnected?: string,
  reconnectAttempts?: number
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'SUBSCRIPTION_FAILED' | 'UNAUTHORIZED' | 'CHANNEL_ERROR',
    message: string,
    retryable: boolean
  }
}
```

**UI States**: `connecting` | `connected` | `disconnected` | `reconnecting` | `error`

---

### SEAM-REALTIME-002: Unsubscribe from Channel
**Boundary**: UI Component → Realtime Service
**Direction**: Unidirectional

**Request Data**:
```typescript
{
  channelId: string
}
```

**Response Data (Success)**:
```typescript
{
  success: true
}
```

**Response Data (Error)**:
```typescript
{
  error: {
    code: 'CHANNEL_NOT_FOUND',
    message: string,
    retryable: false
  }
}
```

---

## 8. UI Component State Seams

### SEAM-UI-STATE-001: Async Operation State
**Boundary**: Internal Component State
**Direction**: Unidirectional (state machine)

**State Definition**:
```typescript
type AsyncState<T, E = Error> =
  | { status: 'idle', data: null, error: null }
  | { status: 'loading', data: null, error: null, startedAt: string }
  | { status: 'success', data: T, error: null, loadedAt: string }
  | { status: 'error', data: null, error: E, failedAt: string, retryable: boolean };
```

**Valid Transitions**:
- `idle` → `loading`
- `loading` → `success` | `error`
- `success` → `loading` (refresh)
- `error` → `loading` (retry)
- `error` → `idle` (reset)

**Invalid Transitions** (will throw error):
- `idle` → `success`
- `loading` → `idle`
- `success` → `error`

---

### SEAM-UI-STATE-002: Form State
**Boundary**: Internal Component State
**Direction**: Unidirectional

**State Definition**:
```typescript
type FormState<T> = {
  values: T,
  errors: Record<keyof T, string[]>,
  touched: Record<keyof T, boolean>,
  isDirty: boolean,
  isValid: boolean,
  isSubmitting: boolean,
  submitCount: number
};
```

---

### SEAM-UI-STATE-003: Modal State
**Boundary**: Internal Component State
**Direction**: Unidirectional

**State Definition**:
```typescript
type ModalState = {
  isOpen: boolean,
  content: ModalContent | null,
  onClose: (() => void) | null,
  closeOnBackdrop: boolean,
  closeOnEscape: boolean
};
```

---

## 9. Error Boundary Seams

### SEAM-ERROR-001: Global Error Handler
**Boundary**: Error Boundary Component → Error Service
**Direction**: Unidirectional (fire-and-forget)

**Input Data**:
```typescript
{
  error: Error,
  errorInfo: {
    componentStack: string
  },
  context: {
    userId?: string,
    sessionId?: string,
    route: string,
    timestamp: string
  }
}
```

**Output Data** (to monitoring service):
```typescript
{
  errorId: string,
  logged: boolean,
  notified: boolean
}
```

---

## 10. Validation Seams

### SEAM-VALIDATION-001: Input Validation
**Boundary**: Form Input → Validation Service
**Direction**: Synchronous

**Input Data**: `any` (field value)

**Output Data**:
```typescript
{
  isValid: boolean,
  errors: string[],  // Array of error messages
  sanitizedValue: any  // XSS-sanitized, trimmed, normalized
}
```

---

## Summary Statistics

**Total Seams Identified**: 32

**Breakdown by Category**:
- Authentication: 4 seams
- Session Management: 5 seams
- Task Management: 6 seams
- Task Choices: 2 seams
- Collaborative Lists: 8 seams
- Vibe/Theme: 2 seams
- Real-time: 2 seams
- UI State: 3 seams

**Async Seams**: 24 (require loading/error states)
**Sync Seams**: 5 (immediate response)
**Subscription Seams**: 2 (long-lived connections)
**Unidirectional Seams**: 6 (fire-and-forget)

---

## Next Step: Define Contracts (Step 3)

All identified seams will now have TypeScript contracts defined in:
- `src/lib/contracts/auth.contracts.ts`
- `src/lib/contracts/session.contracts.ts`
- `src/lib/contracts/task.contracts.ts`
- `src/lib/contracts/choice.contracts.ts`
- `src/lib/contracts/list.contracts.ts`
- `src/lib/contracts/realtime.contracts.ts`
- `src/lib/contracts/vibe.contracts.ts`
- `src/lib/contracts/ui-state.contracts.ts`

Each contract file will implement all seams in its category with 100% type safety.

---

**Document Status**: ✅ Complete (Step 2)
**Next Step**: Step 3 - DEFINE (Contract Blueprint)

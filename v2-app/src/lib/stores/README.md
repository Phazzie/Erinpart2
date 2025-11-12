# Stores

This directory contains Svelte 5 rune-based stores for state management.

## Available Stores

### 1. **sessionStore** (`session.store.ts`)
Manages current session state and participants.

**State:**
- `currentSession`: Current session details (SessionDetails | null)
- `participants`: Array of session participants
- `loading`: Loading state
- `error`: Error message

**Derived:**
- `isInSession`: Whether user is in a session
- `participantCount`: Number of participants
- `sessionCode`: Current session code
- `isHost`: Whether current user is host

**Actions:**
- `setSession(session, participants)`: Set current session
- `clearSession()`: Clear current session
- `updateParticipants(participants)`: Update participant list
- `addParticipant(participant)`: Add a participant
- `removeParticipant(id)`: Remove a participant
- `updateParticipantStatus(id, isOnline)`: Update participant status

### 2. **userStore** (`user.store.ts`)
Manages authenticated user state.

**State:**
- `currentUser`: Current user (CurrentUser | null)
- `authSession`: Auth session (AuthSession | null)
- `loading`: Loading state
- `error`: Error message

**Derived:**
- `isAuthenticated`: Whether user is authenticated
- `isAnonymous`: Whether user is anonymous (animal code)
- `isOAuth`: Whether user is OAuth authenticated
- `displayName`: User display name
- `userId`: Current user ID

**Actions:**
- `setUser(user, session)`: Set current user and session
- `clearUser()`: Clear user and session
- `updateUser(updates)`: Partial user update

### 3. **uiStore** (`ui.store.ts`)
Manages UI state (modals, toasts, layout).

**State:**
- `modals`: Map of modal states
- `toasts`: Array of toast notifications
- `sidebarCollapsed`: Sidebar state

**Derived:**
- `hasOpenModals`: Whether any modals are open
- `toastCount`: Number of active toasts

**Actions:**
- `openModal(id, content, options)`: Open a modal
- `closeModal(id)`: Close a modal
- `closeAllModals()`: Close all modals
- `addToast(toast)`: Add a toast notification
- `removeToast(id)`: Remove a toast
- `showSuccess(message)`: Show success toast
- `showError(message)`: Show error toast
- `showInfo(message)`: Show info toast
- `showWarning(message)`: Show warning toast
- `toggleSidebar()`: Toggle sidebar

### 4. **realtimeStore** (`realtime.store.ts`)
Manages realtime connection state and events.

**State:**
- `connectionState`: Connection state with status
- `subscribedSessions`: Set of subscribed session IDs
- `eventQueue`: Recent realtime events (last 100)

**Derived:**
- `isConnected`: Whether connected
- `isConnecting`: Whether connecting/reconnecting
- `isDisconnected`: Whether disconnected
- `hasSubscriptions`: Whether has subscriptions
- `subscriptionCount`: Number of subscriptions
- `eventCount`: Number of queued events

**Actions:**
- `setConnectionState(state)`: Set connection state
- `updateConnectionStatus(status)`: Update status only
- `markConnected()`: Mark as connected
- `markDisconnected()`: Mark as disconnected
- `addSubscription(sessionId)`: Add subscription
- `removeSubscription(sessionId)`: Remove subscription
- `addEvent(event)`: Add event to queue
- `clearEvents()`: Clear event queue

## Usage

```typescript
import { sessionStore, userStore, uiStore, realtimeStore } from '$lib/stores';

// Access state (reactive)
console.log(sessionStore.currentSession);
console.log(userStore.isAuthenticated);
console.log(uiStore.toasts);
console.log(realtimeStore.isConnected);

// Use derived values (reactive)
console.log(sessionStore.isInSession);
console.log(userStore.displayName);

// Call actions
sessionStore.setSession(sessionData, participants);
userStore.setUser(userData, sessionData);
uiStore.showSuccess('Task completed!');
realtimeStore.addSubscription(sessionId);

// Use in components
<script>
  import { sessionStore } from '$lib/stores';

  // Access state directly (reactive in Svelte 5)
  {#if sessionStore.isInSession}
    <p>Session: {sessionStore.sessionCode}</p>
    <p>Participants: {sessionStore.participantCount}</p>
  {/if}
</script>
```

## Architecture

All stores follow these patterns:

1. **Svelte 5 Runes**: Use `$state` and `$derived` (NOT writable/readable)
2. **Class-based**: Each store is a class with state properties
3. **Singleton**: Exported as a single instance
4. **TypeScript**: Full type safety with contract types
5. **Methods**: Actions are class methods that update state
6. **Reactive**: State changes automatically trigger UI updates

## Type Safety

All stores import types from the contract files:
- `session.store.ts` → `session.contracts.ts`
- `user.store.ts` → `auth.contracts.ts`
- `ui.store.ts` → `ui-state.contracts.ts`
- `realtime.store.ts` → `realtime.contracts.ts`

This ensures type consistency across the entire application.

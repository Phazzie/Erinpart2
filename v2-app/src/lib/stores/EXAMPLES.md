# Store Usage Examples

## Session Store Examples

```typescript
import { sessionStore } from '$lib/stores';

// Create a session
sessionStore.setSession(
  {
    id: 'session-123',
    code: 'cat-dolphin',
    hostId: 'user-456',
    createdAt: new Date().toISOString(),
    participantCount: 2,
    dayVibe: null,
    isUserHost: true,
    participants: []
  },
  [
    {
      id: 'user-456',
      name: 'cat-dolphin',
      joinedAt: new Date().toISOString(),
      isOnline: true
    }
  ]
);

// Check session state
console.log(sessionStore.isInSession); // true
console.log(sessionStore.sessionCode); // 'cat-dolphin'
console.log(sessionStore.participantCount); // 1

// Add participant
sessionStore.addParticipant({
  id: 'user-789',
  name: 'dog-eagle',
  joinedAt: new Date().toISOString(),
  isOnline: true
});

// Update participant status
sessionStore.updateParticipantStatus('user-789', false);

// Clear session
sessionStore.clearSession();
```

## User Store Examples

```typescript
import { userStore } from '$lib/stores';

// Anonymous sign in
userStore.setUser(
  {
    id: 'user-123',
    animalCode: 'cat-dolphin'
  },
  {
    accessToken: 'token-abc',
    refreshToken: 'token-xyz',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }
);

// Check user state
console.log(userStore.isAuthenticated); // true
console.log(userStore.isAnonymous); // true
console.log(userStore.displayName); // 'cat-dolphin'

// OAuth sign in
userStore.setUser(
  {
    id: 'user-456',
    email: 'user@example.com',
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg'
  },
  {
    accessToken: 'token-abc',
    refreshToken: 'token-xyz',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  }
);

console.log(userStore.isOAuth); // true
console.log(userStore.displayName); // 'John Doe'

// Sign out
userStore.clearUser();
```

## UI Store Examples

```typescript
import { uiStore } from '$lib/stores';

// Show toasts
uiStore.showSuccess('Task completed!');
uiStore.showError('Failed to save');
uiStore.showInfo('New update available');
uiStore.showWarning('Unsaved changes');

// Custom toast with duration
uiStore.addToast({
  message: 'This will disappear in 5 seconds',
  type: 'info',
  duration: 5000
});

// Open modal
uiStore.openModal('confirm-delete', {
  title: 'Delete Task',
  message: 'Are you sure?',
  onConfirm: () => console.log('Deleted')
});

// Close modal
uiStore.closeModal('confirm-delete');

// Toggle sidebar
uiStore.toggleSidebar();

// Check state
console.log(uiStore.hasOpenModals); // false
console.log(uiStore.toastCount); // 0
console.log(uiStore.sidebarCollapsed); // false
```

## Realtime Store Examples

```typescript
import { realtimeStore } from '$lib/stores';

// Connect to realtime
realtimeStore.markConnected();
console.log(realtimeStore.isConnected); // true

// Subscribe to session
realtimeStore.addSubscription('session-123');
console.log(realtimeStore.hasSubscriptions); // true
console.log(realtimeStore.subscriptionCount); // 1

// Add events
realtimeStore.addEvent({
  type: 'INSERT',
  table: 'tasks',
  record: {
    id: 'task-123',
    session_id: 'session-123',
    text: 'New task',
    is_complete: false,
    completed_at: null,
    day: 'today',
    order_index: 0,
    is_secret: false,
    votes: [],
    comments: null,
    created_by: 'user-456',
    created_by_name: 'cat-dolphin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  timestamp: new Date().toISOString()
});

console.log(realtimeStore.eventCount); // 1

// Handle reconnection
realtimeStore.incrementReconnectAttempts();
console.log(realtimeStore.connectionState.reconnectAttempts); // 1

// Disconnect
realtimeStore.markDisconnected();
console.log(realtimeStore.isDisconnected); // true
```

## Component Usage

### In Svelte Components

```svelte
<script>
  import { sessionStore, userStore, uiStore } from '$lib/stores';

  function handleJoinSession() {
    sessionStore.setLoading(true);
    // ... API call
    sessionStore.setLoading(false);
  }

  function handleSignOut() {
    userStore.clearUser();
    sessionStore.clearSession();
    uiStore.showInfo('Signed out successfully');
  }
</script>

{#if sessionStore.loading}
  <p>Loading...</p>
{:else if sessionStore.isInSession}
  <div>
    <h1>Session: {sessionStore.sessionCode}</h1>
    <p>Host: {sessionStore.isHost ? 'Yes' : 'No'}</p>
    <p>Participants: {sessionStore.participantCount}</p>
  </div>
{:else}
  <button onclick={handleJoinSession}>Join Session</button>
{/if}

{#if userStore.isAuthenticated}
  <div>
    <p>Welcome, {userStore.displayName}!</p>
    <button onclick={handleSignOut}>Sign Out</button>
  </div>
{/if}

<!-- Toasts -->
<div class="toasts">
  {#each uiStore.toasts as toast (toast.id)}
    <div class="toast toast-{toast.type}">
      {toast.message}
      <button onclick={() => uiStore.removeToast(toast.id)}>×</button>
    </div>
  {/each}
</div>

<!-- Connection status -->
{#if realtimeStore.isConnected}
  <div class="status-connected">Connected</div>
{:else if realtimeStore.isConnecting}
  <div class="status-connecting">Connecting...</div>
{:else}
  <div class="status-disconnected">Disconnected</div>
{/if}
```

## Advanced Patterns

### Combining Multiple Stores

```typescript
import { sessionStore, userStore, realtimeStore } from '$lib/stores';

// Initialize app state
function initializeApp() {
  // Load user
  userStore.setLoading(true);
  // ... load user
  userStore.setLoading(false);

  // If user has session, load it
  if (userStore.currentUser) {
    sessionStore.setLoading(true);
    // ... load session
    sessionStore.setLoading(false);

    // Connect to realtime
    if (sessionStore.currentSession) {
      realtimeStore.markConnected();
      realtimeStore.addSubscription(sessionStore.currentSession.id);
    }
  }
}

// Cleanup on logout
function cleanup() {
  realtimeStore.clearSubscriptions();
  realtimeStore.markDisconnected();
  sessionStore.clearSession();
  userStore.clearUser();
}
```

### Reactive Computations

```typescript
import { sessionStore, userStore } from '$lib/stores';

// Derived values are automatically reactive
$effect(() => {
  console.log('User changed:', userStore.displayName);
});

$effect(() => {
  console.log('Session changed:', sessionStore.sessionCode);
});

$effect(() => {
  // Auto-sync participant count
  if (sessionStore.currentSession) {
    console.log(`Session has ${sessionStore.participantCount} participants`);
  }
});
```

# Animal Code Sessions with Clerk Authentication

This document explains how animal code sessions work in Erin's Escapades and how they integrate with Clerk authentication.

---

## Overview

Erin's Escapades uses a **dual session system** that combines:
1. **Animal Code Sessions** (e.g., "cat-dog-bird") - for collaborative session management
2. **Clerk Authentication** - for user identity and authentication

These two systems are **decoupled** - you can join an animal code session whether you're signed in or not.

---

## How It Works

### Animal Code = Session ID

An animal code (like "cat-dog-bird") is simply a **session identifier** that allows multiple users to collaborate on the same planning board. It's NOT tied to user authentication.

### User Authentication = Separate

User authentication is handled entirely by Clerk. Users can:
- Sign in with Clerk (email, OAuth, etc.)
- Use the app as a guest without signing in

### Combined Flow

```
┌─────────────────────────────────────────────────────────┐
│                   User Visits App                       │
└─────────────────────┬───────────────────────────────────┘
                      │
           ┌──────────▼──────────┐
           │  Join/Create Session │
           │  (Animal Code)       │
           └──────────┬───────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
   ┌────▼────┐                 ┌────▼────┐
   │ Signed  │                 │  Guest  │
   │   In    │                 │  User   │
   │ (Clerk) │                 │         │
   └────┬────┘                 └────┬────┘
        │                            │
        └─────────────┬──────────────┘
                      │
              ┌───────▼────────┐
              │ Session Board  │
              │ (Collaborative)│
              └────────────────┘
```

---

## User Identity

### Authenticated Users (Clerk)

When a user is signed in with Clerk:

```typescript
{
  id: clerkUser.id,              // e.g., "user_abc123xyz"
  name: clerkUser.firstName      // e.g., "Alice"
}
```

- **User ID**: Clerk user ID (permanent across sessions)
- **Name**: From Clerk profile (firstName, username, or fallback)
- **Persistence**: User data persists across sessions and devices

### Guest Users (Animal Code Only)

When a user joins without signing in:

```typescript
{
  id: `guest-${sessionId}`,      // e.g., "guest-cat-dog-bird"
  name: sessionData.userName     // e.g., "Bob" (from join form)
}
```

- **User ID**: Temporary, based on session ID
- **Name**: Provided when joining the session
- **Persistence**: Only persists in localStorage on that device

---

## localStorage Pattern

### SessionData Structure

```typescript
type SessionData = {
  sessionId: string   // e.g., "cat-dog-bird"
  userName: string    // e.g., "Alice"
  joinedAt: string    // ISO timestamp
}
```

### Storage Location

```javascript
// Stored in browser localStorage
localStorage.setItem('sessionData', JSON.stringify({
  sessionId: 'cat-dog-bird',
  userName: 'Alice',
  joinedAt: '2025-11-14T10:30:00.000Z'
}))
```

### Why localStorage?

- **Persists across page refreshes** - users don't lose their session
- **Device-specific** - each device has its own session
- **No server required** - works offline for initial join

---

## Hook Implementation: `useSession`

### Key Features

```typescript
export const useSession = (): SessionHook => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // ... (implementation details)

  return {
    sessionId: sessionData?.sessionId || '',
    isOwner: true,
    user: userId ? { id: userId, name: userName } : null,
    loading: loading || !clerkLoaded,
  }
}
```

### Return Values

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | `string` | The animal code session ID (e.g., "cat-dog-bird") |
| `isOwner` | `boolean` | Whether user is session owner (currently always `true`) |
| `user` | `{ id, name } \| null` | Combined user from Clerk or guest session |
| `loading` | `boolean` | Whether session/auth is still loading |

### User ID Logic

```typescript
// Priority order:
if (clerkUser) {
  // 1. Clerk authenticated user (highest priority)
  userId = clerkUser.id
  userName = clerkUser.firstName || clerkUser.username || sessionData?.userName || 'User'
} else if (sessionData) {
  // 2. Guest with animal code session
  userId = `guest-${sessionData.sessionId}`
  userName = sessionData.userName
} else {
  // 3. No user (loading or not joined)
  user = null
}
```

---

## User Flows

### Flow 1: Guest User Joins Session

1. User visits app (not signed in)
2. Enters name and session ID (e.g., "cat-dog-bird")
3. `localStorage.setItem('sessionData', {...})`
4. `useSession` returns:
   ```javascript
   {
     sessionId: 'cat-dog-bird',
     user: {
       id: 'guest-cat-dog-bird',
       name: 'Alice'
     }
   }
   ```
5. User can now collaborate on the session board

### Flow 2: Authenticated User Joins Session

1. User signs in with Clerk
2. Enters session ID (e.g., "cat-dog-bird")
3. `localStorage.setItem('sessionData', {...})`
4. `useSession` returns:
   ```javascript
   {
     sessionId: 'cat-dog-bird',
     user: {
       id: 'user_abc123xyz',  // Clerk ID
       name: 'Alice'           // From Clerk profile
     }
   }
   ```
5. User's actions are tied to their Clerk ID (persists across devices)

### Flow 3: Guest Upgrades to Authenticated

1. Guest user is in a session
2. User clicks "Sign In" button
3. Completes Clerk sign-in flow
4. Session data remains in localStorage
5. `useSession` **automatically switches** from guest ID to Clerk ID
6. **Future actions use Clerk ID** (but past actions remain under guest ID)

**Note**: There is currently no automatic migration of guest data to authenticated user. Past actions remain attributed to the guest ID.

---

## URL-Based Sessions

### Guest Access via URL

Users can access a session directly via URL without localStorage:

```
https://app.example.com/?session=cat-dog-bird
```

When this happens:
1. `useSession` reads the `session` query parameter
2. Creates temporary guest session (not saved to localStorage)
3. User can view the session **read-only**

To enable full participation, the user must:
- Enter their name and formally join
- Or sign in with Clerk

---

## Migration Guide: Guest → Authenticated

### Current Behavior

When a guest user signs in:
- **Their user ID changes** from `guest-{sessionId}` to `user_{clerkId}`
- **Past actions remain** attributed to the guest ID
- **New actions** are attributed to the Clerk ID

### Future Enhancement Options

To migrate guest data to authenticated user:

```typescript
// Potential future implementation
async function migrateGuestToAuthenticated(
  guestId: string,
  clerkUserId: string
) {
  // Update all tasks created by guest
  await supabase
    .from('tasks')
    .update({ created_by: clerkUserId })
    .eq('created_by', guestId)

  // Update all task choices
  await supabase
    .from('task_choices')
    .update({ user_id: clerkUserId })
    .eq('user_id', guestId)

  // etc...
}
```

This is **not currently implemented** but could be added in the future.

---

## Technical Implementation Details

### Effect Hook 1: Initialize Session

```typescript
useEffect(() => {
  const initSession = async (urlSessionId?: string) => {
    // Check localStorage first
    const stored = localStorage.getItem('sessionData')
    if (stored) {
      setSessionData(JSON.parse(stored))
    } else if (urlSessionId) {
      // URL fallback for guest access
      setSessionData({
        sessionId: urlSessionId,
        userName: 'Guest',
        joinedAt: new Date().toISOString()
      })
    }
  }

  // Parse URL for session parameter
  const urlSessionId = new URLSearchParams(window.location.search).get('session')
  initSession(urlSessionId)
}, [])
```

### Effect Hook 2: Listen for Storage Changes

```typescript
useEffect(() => {
  const handleStorageChange = () => {
    const stored = localStorage.getItem('sessionData')
    if (stored) {
      setSessionData(JSON.parse(stored))
    }
  }

  window.addEventListener('storage', handleStorageChange)
  return () => window.removeEventListener('storage', handleStorageChange)
}, [])
```

This enables **cross-tab synchronization** - if a user joins a session in one tab, other tabs automatically update.

---

## Breaking Changes from Supabase Auth

### What Changed

| Old (Supabase) | New (Clerk) |
|----------------|-------------|
| `supabase.auth.signInAnonymously()` | Guest IDs (`guest-{sessionId}`) |
| `supabase.auth.getSession()` | `useUser()` from Clerk |
| Supabase user ID | Clerk user ID or guest ID |

### What Stayed the Same

- **SessionData interface** - unchanged
- **localStorage pattern** - unchanged
- **Hook return type** - unchanged
- **Animal code system** - unchanged

### Migration Impact

Components using `useSession()` **do not need to change** because:
- The hook signature is identical
- Return values have the same structure
- Guest users still work without authentication
- Clerk users get persistent IDs instead of anonymous Supabase IDs

---

## Best Practices

### For Developers

1. **Always use `user?.id`** - it might be null during loading
2. **Check `loading` state** before rendering user-dependent UI
3. **Use `sessionId` for session scoping** - it's independent of user auth
4. **Don't assume Clerk user** - support guest users gracefully

### For Users

1. **Sign in for persistence** - guest sessions are device-specific
2. **Save your session ID** - you can rejoin from any device
3. **Share session URLs** - others can view without signing in

---

## Examples

### Example 1: Component Using useSession

```typescript
'use client'

import { useSession } from '@/hooks/use-session'

export function MyComponent() {
  const { user, sessionId, loading } = useSession()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please join a session</div>
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Session: {sessionId}</p>
      <p>User ID: {user.id}</p>
      {user.id.startsWith('guest-') && (
        <p>Sign in to save your data across devices</p>
      )}
    </div>
  )
}
```

### Example 2: Creating a Task

```typescript
async function createTask(text: string) {
  const { user, sessionId } = useSession()

  if (!user) {
    throw new Error('Must be in a session to create tasks')
  }

  await supabase.from('tasks').insert({
    session_id: sessionId,      // Animal code session
    created_by: user.id,         // Clerk ID or guest ID
    user_name: user.name,        // Display name
    text: text,
    // ...
  })
}
```

---

## Troubleshooting

### Issue: User is null but I'm signed in

**Check:**
1. Is `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set in `.env.local`?
2. Is `ClerkProvider` wrapping your app in `layout.tsx`?
3. Is the component marked with `'use client'`?

### Issue: sessionId is empty

**Check:**
1. Has the user joined a session?
2. Is `sessionData` in localStorage?
3. Is there a `?session=` parameter in the URL?

### Issue: Guest ID changes after refresh

**This is normal!** Guest IDs are based on the session ID:
- Same session = same guest ID
- Different session = different guest ID
- To get a permanent ID, the user must sign in with Clerk

---

## Summary

| Feature | Implementation |
|---------|----------------|
| **Animal Codes** | Session IDs stored in localStorage |
| **User Auth** | Clerk (authenticated) or guest (unauthenticated) |
| **User ID** | Clerk ID (permanent) or `guest-{sessionId}` (temporary) |
| **Persistence** | localStorage (device) + Clerk (cross-device) |
| **Migration** | Automatic ID switching, no data migration (yet) |

**Key Takeaway**: Animal codes are for sessions, Clerk is for users. They work together but independently.

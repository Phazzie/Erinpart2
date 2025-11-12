# Dependency Injection Usage

## Importing Repositories

```typescript
import { getRepository } from '$lib/config';

// Get repository instance
const authRepo = getRepository('auth');
const sessionRepo = getRepository('session');
const taskRepo = getRepository('task');
```

## Using in Components

```svelte
<script lang="ts">
  import { getRepository } from '$lib/config';
  import { onMount } from 'svelte';

  let user = $state(null);

  onMount(async () => {
    const authRepo = getRepository('auth');
    const response = await authRepo.getCurrentUser();
    if ('user' in response && response.user) {
      user = response.user;
    }
  });
</script>

{#if user}
  <p>Welcome, {user.displayName}!</p>
{/if}
```

## Using in Server Routes

```typescript
// src/routes/api/tasks/+server.ts
import { getRepository } from '$lib/config';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const taskRepo = getRepository('task');
  const userId = locals.user?.id;

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await taskRepo.getTasksForUser(userId);

  if ('tasks' in response) {
    return json(response.tasks);
  }

  return json({ error: response.error }, { status: 500 });
};
```

## Available Repositories

- **auth**: User authentication (sign in, sign out, current user)
- **session**: Session management (active session, session state)
- **task**: Task operations (CRUD, assignment, completion)
- **choice**: Choice operations (CRUD, associations)
- **list**: List operations (CRUD for task lists)
- **realtime**: Real-time subscriptions (tasks, choices, sessions)
- **vibe**: Vibe operations (CRUD, associations)

## Phase 6: Switching to Real

When real repositories are built (Phase 5), integration is ONE line change:

```typescript
// di.ts
const USE_MOCKS = false; // Changed from true to false
```

That's it. No other code changes needed. Guaranteed to work because
mocks and real implementations share the same contracts.

## SDD Benefits

1. **Type Safety**: Full TypeScript support ensures compile-time validation
2. **Testability**: Easy to mock repositories in tests using `clearRepositories()`
3. **Flexibility**: Switch implementations without touching UI code
4. **Zero Technical Debt**: Mock-to-real transition guaranteed to work
5. **Single Responsibility**: DI system handles instantiation, components handle logic

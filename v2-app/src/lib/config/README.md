# Dependency Injection System

## Overview

This directory contains the Dependency Injection (DI) system for Erin's Escapades V2 rewrite. The DI system is the **critical SEAM** between mock and real repository implementations, enabling zero-debt integration in Phase 6.

## Files

- **di.ts** (159 lines): Main DI system with repository registry and singleton pattern
- **index.ts** (5 lines): Public API exports
- **USAGE.md** (91 lines): Usage documentation and examples

## Registered Repositories

All 7 repositories are registered and ready for use:

1. **auth** - `IAuthRepository` → `AuthMockRepository`
2. **session** - `ISessionRepository` → `SessionMockRepository`
3. **task** - `ITaskRepository` → `TaskMockRepository`
4. **choice** - `IChoiceRepository` → `ChoiceMockRepository`
5. **list** - `IListRepository` → `ListMockRepository`
6. **realtime** - `IRealtimeRepository` → `RealtimeMockRepository`
7. **vibe** - `IVibeRepository` → `VibeMockRepository`

## Type Safety

- Full TypeScript support with generics
- Type inference works correctly: `getRepository('auth')` returns `IAuthRepository`
- Compile-time validation ensures contract compliance
- Singleton pattern prevents duplicate instances

## Current Status

- **Phase**: 4 (UI Development with Mocks)
- **USE_MOCKS**: true
- **TypeScript Errors**: 0
- **Ready for**: Phase 4 UI implementation

## Phase 6 Integration

When real repositories are built in Phase 5, switching to production is ONE line change:

```typescript
// di.ts line 43
const USE_MOCKS = false; // Changed from true to false
```

This guarantees zero technical debt because mocks and real implementations share the same contracts (SDD Level 3 guarantee).

## Usage

```typescript
import { getRepository } from '$lib/config';

// Get repository instance
const authRepo = getRepository('auth');

// Use repository methods (fully typed)
const response = await authRepo.getCurrentUser();
```

See **USAGE.md** for more examples.

## SDD Benefits

1. **Separation of Concerns**: DI handles instantiation, components handle logic
2. **Testability**: Easy to mock in unit tests using `clearRepositories()`
3. **Flexibility**: Switch implementations without touching UI code
4. **Type Safety**: Full TypeScript support prevents runtime errors
5. **Zero Technical Debt**: Mock-to-real transition guaranteed to work

## Next Steps

Phase 4 teams can now import and use repositories in:
- SvelteKit routes (`+page.ts`, `+page.server.ts`)
- Svelte components (`*.svelte`)
- Service layers (`*.service.ts`)
- API endpoints (`+server.ts`)

All repository access is type-safe and uses mocks until Phase 6 integration.

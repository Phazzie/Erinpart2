/**
 * Dependency Injection Configuration
 *
 * This is the SEAM between mock and real implementations.
 * To switch from mock to real: Change USE_MOCKS to false.
 *
 * SDD Level 3 Guarantee: Integration will work on first attempt
 * because mocks and real implementations share the same contracts.
 */

import type { IAuthRepository } from '$lib/contracts/auth.contracts';
import type { ISessionRepository } from '$lib/contracts/session.contracts';
import type { ITaskRepository } from '$lib/contracts/task.contracts';
import type { IChoiceRepository } from '$lib/contracts/choice.contracts';
import type { IListRepository } from '$lib/contracts/list.contracts';
import type { IRealtimeRepository } from '$lib/contracts/realtime.contracts';
import type { IVibeRepository } from '$lib/contracts/vibe.contracts';

// Mock implementations (Phase 3 - already built)
import { AuthMockRepository } from '$lib/mocks/auth.mock';
import { SessionMockRepository } from '$lib/mocks/session.mock';
import { TaskMockRepository } from '$lib/mocks/task.mock';
import { ChoiceMockRepository } from '$lib/mocks/choice.mock';
import { ListMockRepository } from '$lib/mocks/list.mock';
import { RealtimeMockRepository } from '$lib/mocks/realtime.mock';
import { VibeMockRepository } from '$lib/mocks/vibe.mock';

// Real implementations (Phase 5 - not built yet)
// import { AuthRepository } from '$lib/repositories/auth.repository';
// import { SessionRepository } from '$lib/repositories/session.repository';
// import { TaskRepository } from '$lib/repositories/task.repository';
// import { ChoiceRepository } from '$lib/repositories/choice.repository';
// import { ListRepository } from '$lib/repositories/list.repository';
// import { RealtimeRepository } from '$lib/repositories/realtime.repository';
// import { VibeRepository } from '$lib/repositories/vibe.repository';

/**
 * Toggle between mock and real implementations
 *
 * Phase 4: USE_MOCKS = true (building UI with mocks)
 * Phase 6: USE_MOCKS = false (switch to real, guaranteed to work)
 */
const USE_MOCKS = true; // TODO: Change to false in Phase 6

/**
 * Repository type map
 * Maps repository names to their interface types
 */
type RepositoryMap = {
	auth: IAuthRepository;
	session: ISessionRepository;
	task: ITaskRepository;
	choice: IChoiceRepository;
	list: IListRepository;
	realtime: IRealtimeRepository;
	vibe: IVibeRepository;
};

/**
 * Repository instances (singletons)
 */
class RepositoryRegistry {
	private static instances = new Map<keyof RepositoryMap, any>();

	/**
	 * Get repository instance (singleton)
	 */
	static get<K extends keyof RepositoryMap>(name: K): RepositoryMap[K] {
		if (!this.instances.has(name)) {
			this.instances.set(name, this.createRepository(name));
		}
		return this.instances.get(name)!;
	}

	/**
	 * Create repository instance
	 */
	private static createRepository<K extends keyof RepositoryMap>(
		name: K
	): RepositoryMap[K] {
		if (USE_MOCKS) {
			// Return mock implementation
			switch (name) {
				case 'auth':
					return new AuthMockRepository() as unknown as RepositoryMap[K];
				case 'session':
					return new SessionMockRepository() as unknown as RepositoryMap[K];
				case 'task':
					return new TaskMockRepository() as unknown as RepositoryMap[K];
				case 'choice':
					return new ChoiceMockRepository() as unknown as RepositoryMap[K];
				case 'list':
					return new ListMockRepository() as unknown as RepositoryMap[K];
				case 'realtime':
					return new RealtimeMockRepository() as unknown as RepositoryMap[K];
				case 'vibe':
					return new VibeMockRepository() as unknown as RepositoryMap[K];
				default:
					throw new Error(`Unknown repository: ${name}`);
			}
		} else {
			// Return real implementation (Phase 5 - not built yet)
			throw new Error(
				`Real repositories not implemented yet. Set USE_MOCKS = true or build repositories in Phase 5.`
			);

			// Phase 6 code (uncomment when ready):
			// switch (name) {
			//   case 'auth':
			//     return new AuthRepository(supabaseClient) as unknown as RepositoryMap[K];
			//   case 'session':
			//     return new SessionRepository(supabaseClient) as unknown as RepositoryMap[K];
			//   case 'task':
			//     return new TaskRepository(supabaseClient) as unknown as RepositoryMap[K];
			//   case 'choice':
			//     return new ChoiceRepository(supabaseClient) as unknown as RepositoryMap[K];
			//   case 'list':
			//     return new ListRepository(supabaseClient) as unknown as RepositoryMap[K];
			//   case 'realtime':
			//     return new RealtimeRepository(supabaseClient) as unknown as RepositoryMap[K];
			//   case 'vibe':
			//     return new VibeRepository(supabaseClient) as unknown as RepositoryMap[K];
			//   default:
			//     throw new Error(`Unknown repository: ${name}`);
			// }
		}
	}

	/**
	 * Clear all instances (useful for testing)
	 */
	static clear() {
		this.instances.clear();
	}
}

/**
 * Get repository instance
 *
 * Usage:
 * ```typescript
 * import { getRepository } from '$lib/config';
 *
 * const authRepo = getRepository('auth');
 * await authRepo.anonymousSignIn({ animalOne: 'cat', animalTwo: 'dolphin' });
 * ```
 */
export function getRepository<K extends keyof RepositoryMap>(
	name: K
): RepositoryMap[K] {
	return RepositoryRegistry.get(name);
}

/**
 * Clear repository cache (for testing)
 */
export function clearRepositories() {
	RepositoryRegistry.clear();
}

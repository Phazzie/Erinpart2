/**
 * User Store
 *
 * Manages authenticated user state using Svelte 5 runes.
 * Tracks current user, auth session, loading states, and errors.
 *
 * @module user.store
 */

import type { CurrentUser, AuthSession } from '$lib/contracts/auth.contracts';

/**
 * User store class using Svelte 5 runes
 */
class UserStore {
	// State properties
	currentUser = $state<CurrentUser | null>(null);
	authSession = $state<AuthSession | null>(null);
	loading = $state(false);
	error = $state<string | null>(null);

	// Derived values
	isAuthenticated = $derived(this.currentUser !== null);
	isAnonymous = $derived(
		this.currentUser?.animalCode !== undefined && this.currentUser?.email === undefined
	);
	isOAuth = $derived(
		this.currentUser?.email !== undefined && this.currentUser?.animalCode === undefined
	);
	displayName = $derived(
		this.currentUser?.name ?? this.currentUser?.animalCode ?? 'Guest'
	);
	userId = $derived(this.currentUser?.id ?? null);

	/**
	 * Set the current user and session
	 * @param user - Current user
	 * @param session - Auth session
	 */
	setUser(user: CurrentUser, session: AuthSession) {
		this.currentUser = user;
		this.authSession = session;
		this.error = null;
	}

	/**
	 * Clear the current user and session
	 */
	clearUser() {
		this.currentUser = null;
		this.authSession = null;
		this.error = null;
	}

	/**
	 * Update user data (partial update)
	 * @param updates - Partial user updates
	 */
	updateUser(updates: Partial<CurrentUser>) {
		if (this.currentUser) {
			this.currentUser = { ...this.currentUser, ...updates };
		}
	}

	/**
	 * Set loading state
	 * @param loading - Loading state
	 */
	setLoading(loading: boolean) {
		this.loading = loading;
	}

	/**
	 * Set error message
	 * @param error - Error message or null
	 */
	setError(error: string | null) {
		this.error = error;
	}
}

// Export singleton instance
export const userStore = new UserStore();

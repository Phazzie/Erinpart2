/**
 * Session Store
 *
 * Manages current session state and participants using Svelte 5 runes.
 * Tracks active session, participants, loading states, and errors.
 *
 * @module session.store
 */

import type { SessionDetails, SessionParticipant } from '$lib/contracts/session.contracts';

/**
 * Session store class using Svelte 5 runes
 */
class SessionStore {
	// State properties
	currentSession = $state<SessionDetails | null>(null);
	participants = $state<SessionParticipant[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);

	// Derived values
	isInSession = $derived(this.currentSession !== null);
	participantCount = $derived(this.participants.length);
	sessionCode = $derived(this.currentSession?.code ?? null);
	isHost = $derived(this.currentSession?.isUserHost ?? false);

	/**
	 * Set the current session and participants
	 * @param session - Session details with context
	 * @param participants - List of session participants
	 */
	setSession(session: SessionDetails, participants: SessionParticipant[]) {
		this.currentSession = session;
		this.participants = participants;
		this.error = null;
	}

	/**
	 * Clear the current session
	 */
	clearSession() {
		this.currentSession = null;
		this.participants = [];
		this.error = null;
	}

	/**
	 * Update participants list
	 * @param participants - Updated participants list
	 */
	updateParticipants(participants: SessionParticipant[]) {
		this.participants = participants;
	}

	/**
	 * Add a single participant
	 * @param participant - Participant to add
	 */
	addParticipant(participant: SessionParticipant) {
		this.participants = [...this.participants, participant];
	}

	/**
	 * Remove a participant by ID
	 * @param participantId - ID of participant to remove
	 */
	removeParticipant(participantId: string) {
		this.participants = this.participants.filter((p) => p.id !== participantId);
	}

	/**
	 * Update participant online status
	 * @param participantId - ID of participant
	 * @param isOnline - Online status
	 */
	updateParticipantStatus(participantId: string, isOnline: boolean) {
		this.participants = this.participants.map((p) =>
			p.id === participantId ? { ...p, isOnline } : p
		);
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
export const sessionStore = new SessionStore();

/**
 * Realtime Store
 *
 * Manages real-time connection state and event queue using Svelte 5 runes.
 * Tracks connection status, subscribed sessions, and recent events.
 *
 * @module realtime.store
 */

import type { ConnectionState, RealtimeEvent } from '$lib/contracts/realtime.contracts';

/**
 * Realtime store class using Svelte 5 runes
 */
class RealtimeStore {
	// State properties
	connectionState = $state<ConnectionState>({
		status: 'disconnected',
		timestamp: new Date().toISOString()
	});
	subscribedSessions = $state<Set<string>>(new Set());
	eventQueue = $state<RealtimeEvent[]>([]);

	// Derived values
	isConnected = $derived(this.connectionState.status === 'connected');
	isConnecting = $derived(
		this.connectionState.status === 'connecting' ||
		this.connectionState.status === 'reconnecting'
	);
	isDisconnected = $derived(this.connectionState.status === 'disconnected');
	hasSubscriptions = $derived(this.subscribedSessions.size > 0);
	subscriptionCount = $derived(this.subscribedSessions.size);
	eventCount = $derived(this.eventQueue.length);

	/**
	 * Set connection state
	 * @param state - Connection state
	 */
	setConnectionState(state: ConnectionState) {
		this.connectionState = state;
	}

	/**
	 * Update connection status
	 * @param status - Connection status
	 */
	updateConnectionStatus(status: ConnectionState['status']) {
		this.connectionState = {
			...this.connectionState,
			status,
			timestamp: new Date().toISOString()
		};
	}

	/**
	 * Mark connection as connected
	 */
	markConnected() {
		this.connectionState = {
			status: 'connected',
			lastConnected: new Date().toISOString(),
			reconnectAttempts: 0,
			timestamp: new Date().toISOString()
		};
	}

	/**
	 * Mark connection as disconnected
	 */
	markDisconnected() {
		this.connectionState = {
			status: 'disconnected',
			timestamp: new Date().toISOString()
		};
	}

	/**
	 * Increment reconnect attempts
	 */
	incrementReconnectAttempts() {
		const attempts = (this.connectionState.reconnectAttempts ?? 0) + 1;
		this.connectionState = {
			...this.connectionState,
			status: 'reconnecting',
			reconnectAttempts: attempts,
			timestamp: new Date().toISOString()
		};
	}

	/**
	 * Add a session subscription
	 * @param sessionId - Session ID to subscribe to
	 */
	addSubscription(sessionId: string) {
		this.subscribedSessions = new Set([...this.subscribedSessions, sessionId]);
	}

	/**
	 * Remove a session subscription
	 * @param sessionId - Session ID to unsubscribe from
	 */
	removeSubscription(sessionId: string) {
		const newSet = new Set(this.subscribedSessions);
		newSet.delete(sessionId);
		this.subscribedSessions = newSet;
	}

	/**
	 * Check if subscribed to a session
	 * @param sessionId - Session ID to check
	 * @returns True if subscribed
	 */
	isSubscribed(sessionId: string): boolean {
		return this.subscribedSessions.has(sessionId);
	}

	/**
	 * Clear all subscriptions
	 */
	clearSubscriptions() {
		this.subscribedSessions = new Set();
	}

	/**
	 * Add an event to the queue
	 * @param event - Realtime event
	 */
	addEvent(event: RealtimeEvent) {
		this.eventQueue = [...this.eventQueue, event];

		// Keep only last 100 events
		if (this.eventQueue.length > 100) {
			this.eventQueue = this.eventQueue.slice(-100);
		}
	}

	/**
	 * Clear the event queue
	 */
	clearEvents() {
		this.eventQueue = [];
	}

	/**
	 * Get recent events (last N)
	 * @param count - Number of recent events to get
	 * @returns Array of recent events
	 */
	getRecentEvents(count: number): RealtimeEvent[] {
		return this.eventQueue.slice(-count);
	}
}

// Export singleton instance
export const realtimeStore = new RealtimeStore();

/**
 * @seam SEAM-REALTIME-001 through SEAM-REALTIME-002
 * @description Real-time communication contracts for session collaboration
 * @requirement @REALTIME-001 through @REALTIME-005
 * @boundary UI Component ↔ Realtime Service
 */

import { z } from 'zod';

// ============================================================================
// SHARED TYPES
// ============================================================================

/**
 * Event types for database change notifications
 * @requirement @REALTIME-001
 */
export type DatabaseEventType = 'INSERT' | 'UPDATE' | 'DELETE';

/**
 * Table names that can emit real-time events
 * @requirement @REALTIME-001, @REALTIME-002, @REALTIME-003
 */
export type RealtimeTable =
	| 'tasks'
	| 'task_choices'
	| 'collaborative_lists'
	| 'list_items'
	| 'list_item_verifications';

/**
 * Event type categories for subscription filtering
 * @requirement @REALTIME-001
 */
export type RealtimeEventCategory = 'task' | 'choice' | 'list' | 'presence';

// ============================================================================
// CONNECTION STATE TYPES
// ============================================================================

/**
 * Real-time connection status
 * @requirement @REALTIME-005
 */
export type ConnectionStatus =
	| 'connecting' // Initial connection attempt
	| 'connected' // Successfully connected
	| 'disconnected' // Connection lost
	| 'reconnecting' // Attempting to reconnect
	| 'failed'; // Permanent connection failure

/**
 * Complete connection state including metadata
 * @requirement @REALTIME-005
 */
export interface ConnectionState {
	/**
	 * Current connection status
	 * @requirement @REALTIME-005
	 */
	status: ConnectionStatus;

	/**
	 * Timestamp of last successful connection
	 * @requirement @REALTIME-005
	 * @example "2025-11-12T10:30:00Z"
	 */
	lastConnected?: string;

	/**
	 * Number of reconnection attempts made
	 * @requirement @REALTIME-005
	 * @validation 0 or positive integer
	 */
	reconnectAttempts?: number;

	/**
	 * Timestamp when connection state changed
	 * @requirement @REALTIME-005
	 */
	timestamp: string;
}

// ============================================================================
// TASK EVENT TYPES
// ============================================================================

/**
 * Task record structure from database
 * @requirement @REALTIME-001
 */
export interface TaskRecord {
	id: string;
	session_id: string;
	text: string;
	is_complete: boolean;
	completed_at: string | null;
	day: 'today' | 'tomorrow';
	order_index: number;
	is_secret: boolean;
	votes: string[]; // Array of user IDs
	comments: string | null;
	created_by: string;
	created_by_name: string;
	created_at: string;
	updated_at: string;
}

/**
 * Task real-time event
 * @requirement @REALTIME-001
 */
export interface TaskEvent {
	/**
	 * Type of database operation
	 */
	type: DatabaseEventType;

	/**
	 * Table name
	 */
	table: 'tasks';

	/**
	 * Current/new record state
	 */
	record: TaskRecord;

	/**
	 * Previous record state (only for UPDATE and DELETE)
	 */
	old_record?: TaskRecord;

	/**
	 * Timestamp of event
	 */
	timestamp: string;
}

// ============================================================================
// CHOICE EVENT TYPES
// ============================================================================

/**
 * Task choice record structure from database
 * @requirement @REALTIME-002
 */
export interface ChoiceRecord {
	id: string;
	task_id: string;
	user_id: string;
	user_name: string;
	choice: 'yes' | 'no' | 'maybe';
	created_at: string;
	updated_at: string;
}

/**
 * Task choice real-time event
 * @requirement @REALTIME-002
 */
export interface ChoiceEvent {
	/**
	 * Type of database operation
	 */
	type: DatabaseEventType;

	/**
	 * Table name
	 */
	table: 'task_choices';

	/**
	 * Current/new record state
	 */
	record: ChoiceRecord;

	/**
	 * Previous record state (only for UPDATE and DELETE)
	 */
	old_record?: ChoiceRecord;

	/**
	 * Timestamp of event
	 */
	timestamp: string;
}

// ============================================================================
// LIST EVENT TYPES
// ============================================================================

/**
 * Collaborative list record structure from database
 * @requirement @REALTIME-003
 */
export interface ListRecord {
	id: string;
	session_id: string;
	title: string;
	list_type: 'bullet' | 'numbered';
	creator_id: string;
	creator_name: string;
	created_at: string;
	updated_at: string;
}

/**
 * List item record structure from database
 * @requirement @REALTIME-003
 */
export interface ListItemRecord {
	id: string;
	list_id: string;
	text: string;
	order_index: number;
	created_at: string;
	updated_at: string;
}

/**
 * List item verification record structure from database
 * @requirement @REALTIME-003
 */
export interface ListItemVerificationRecord {
	id: string;
	item_id: string;
	user_id: string;
	user_name: string;
	is_accurate: boolean;
	correction_text: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * List real-time event (for collaborative_lists table)
 * @requirement @REALTIME-003
 */
export interface ListEvent {
	/**
	 * Type of database operation
	 */
	type: DatabaseEventType;

	/**
	 * Table name
	 */
	table: 'collaborative_lists';

	/**
	 * Current/new record state
	 */
	record: ListRecord;

	/**
	 * Previous record state (only for UPDATE and DELETE)
	 */
	old_record?: ListRecord;

	/**
	 * Timestamp of event
	 */
	timestamp: string;
}

/**
 * List item real-time event
 * @requirement @REALTIME-003
 */
export interface ListItemEvent {
	/**
	 * Type of database operation
	 */
	type: DatabaseEventType;

	/**
	 * Table name
	 */
	table: 'list_items';

	/**
	 * Current/new record state
	 */
	record: ListItemRecord;

	/**
	 * Previous record state (only for UPDATE and DELETE)
	 */
	old_record?: ListItemRecord;

	/**
	 * Timestamp of event
	 */
	timestamp: string;
}

/**
 * List item verification real-time event
 * @requirement @REALTIME-003
 */
export interface ListItemVerificationEvent {
	/**
	 * Type of database operation
	 */
	type: DatabaseEventType;

	/**
	 * Table name
	 */
	table: 'list_item_verifications';

	/**
	 * Current/new record state
	 */
	record: ListItemVerificationRecord;

	/**
	 * Previous record state (only for UPDATE and DELETE)
	 */
	old_record?: ListItemVerificationRecord;

	/**
	 * Timestamp of event
	 */
	timestamp: string;
}

// ============================================================================
// PRESENCE EVENT TYPES
// ============================================================================

/**
 * Presence event types
 * @requirement @REALTIME-004
 */
export type PresenceEventType = 'join' | 'leave' | 'sync';

/**
 * Presence event data
 * @requirement @REALTIME-004
 */
export interface PresenceEvent {
	/**
	 * Type of presence event
	 */
	type: PresenceEventType;

	/**
	 * User ID who joined/left
	 */
	userId: string;

	/**
	 * Display name of user
	 */
	userName: string;

	/**
	 * Timestamp of presence event
	 * @example "2025-11-12T10:30:00Z"
	 */
	timestamp: string;

	/**
	 * Additional metadata (for sync events)
	 */
	metadata?: {
		/**
		 * List of all currently present users (only for sync)
		 */
		presentUsers?: Array<{
			userId: string;
			userName: string;
			joinedAt: string;
		}>;
	};
}

// ============================================================================
// UNIFIED EVENT TYPE
// ============================================================================

/**
 * Union type of all possible real-time events
 * @requirement @REALTIME-001, @REALTIME-002, @REALTIME-003, @REALTIME-004
 */
export type RealtimeEvent =
	| TaskEvent
	| ChoiceEvent
	| ListEvent
	| ListItemEvent
	| ListItemVerificationEvent
	| PresenceEvent;

// ============================================================================
// SEAM-REALTIME-001: SUBSCRIBE TO SESSION CHANNEL
// ============================================================================

/**
 * Request to subscribe to a session's real-time channel
 * @requirement @REALTIME-001
 */
export interface SubscribeToSessionRequest {
	/**
	 * Session ID to subscribe to
	 * @requirement @REALTIME-001
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 * @validation Must be valid UUID
	 */
	sessionId: string;

	/**
	 * Event types to subscribe to
	 * @requirement @REALTIME-001
	 * @validation Array must not be empty
	 */
	eventTypes: RealtimeEventCategory[];

	/**
	 * Current user ID (for presence tracking)
	 * @requirement @REALTIME-004
	 */
	userId?: string;

	/**
	 * Current user name (for presence tracking)
	 * @requirement @REALTIME-004
	 */
	userName?: string;
}

/**
 * Subscription handle returned after successful subscription
 * @requirement @REALTIME-001
 */
export interface Subscription {
	/**
	 * Unique channel identifier
	 */
	channelId: string;

	/**
	 * Session ID this subscription is for
	 */
	sessionId: string;

	/**
	 * Current connection state
	 */
	connectionState: ConnectionState;

	/**
	 * Event callback registration function
	 * @param callback - Function to call when events are received
	 * @returns Unsubscribe function
	 */
	onEvent: (callback: (event: RealtimeEvent) => void) => () => void;

	/**
	 * Connection state change callback registration
	 * @param callback - Function to call when connection state changes
	 * @returns Unsubscribe function
	 */
	onConnectionStateChange: (callback: (state: ConnectionState) => void) => () => void;
}

/**
 * Success response for subscription
 * @requirement @REALTIME-001
 */
export interface SubscribeToSessionSuccessResponse {
	subscription: Subscription;
}

/**
 * Error codes for subscription
 * @requirement @REALTIME-001
 */
export type SubscribeToSessionErrorCode =
	| 'SUBSCRIPTION_FAILED' // Failed to establish subscription
	| 'UNAUTHORIZED' // User not authorized to access session
	| 'CHANNEL_ERROR' // Channel creation/configuration error
	| 'INVALID_SESSION' // Session does not exist
	| 'NETWORK_ERROR'; // Network connectivity issue

/**
 * Error response for subscription
 * @requirement @REALTIME-001
 */
export interface SubscribeToSessionErrorResponse {
	error: {
		code: SubscribeToSessionErrorCode;
		message: string;
		retryable: boolean;
		metadata?: {
			sessionId?: string;
			eventTypes?: RealtimeEventCategory[];
		};
	};
}

/**
 * UI state for subscription operation
 * @requirement @UX-002
 */
export type SubscribeToSessionState = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Complete async state for subscription
 */
export type SubscribeToSessionAsyncState =
	| { status: 'connecting'; data: null; error: null; startedAt: string }
	| {
			status: 'connected';
			data: Subscription;
			error: null;
			connectedAt: string;
	  }
	| {
			status: 'disconnected';
			data: Subscription | null;
			error: null;
			disconnectedAt: string;
	  }
	| {
			status: 'error';
			data: null;
			error: SubscribeToSessionErrorResponse;
			failedAt: string;
	  };

// ============================================================================
// SEAM-REALTIME-002: UNSUBSCRIBE FROM CHANNEL
// ============================================================================

/**
 * Request to unsubscribe from a channel
 * @requirement @REALTIME-002
 */
export interface UnsubscribeFromChannelRequest {
	/**
	 * Channel ID to unsubscribe from
	 * @example "session:550e8400-e29b-41d4-a716-446655440000"
	 * @validation Must be valid channel ID
	 */
	channelId: string;
}

/**
 * Success response for unsubscribe
 * @requirement @REALTIME-002
 */
export interface UnsubscribeFromChannelSuccessResponse {
	success: true;
	channelId: string;
}

/**
 * Error codes for unsubscribe
 * @requirement @REALTIME-002
 */
export type UnsubscribeFromChannelErrorCode =
	| 'CHANNEL_NOT_FOUND' // Channel does not exist or already unsubscribed
	| 'UNSUBSCRIBE_FAILED'; // Failed to cleanly unsubscribe

/**
 * Error response for unsubscribe
 * @requirement @REALTIME-002
 */
export interface UnsubscribeFromChannelErrorResponse {
	error: {
		code: UnsubscribeFromChannelErrorCode;
		message: string;
		retryable: boolean;
		metadata?: {
			channelId?: string;
		};
	};
}

/**
 * UI state for unsubscribe operation
 * @requirement @UX-002
 */
export type UnsubscribeFromChannelState = 'idle' | 'unsubscribing' | 'success' | 'error';

/**
 * Complete async state for unsubscribe
 */
export type UnsubscribeFromChannelAsyncState =
	| { status: 'idle'; data: null; error: null }
	| {
			status: 'unsubscribing';
			data: null;
			error: null;
			startedAt: string;
	  }
	| {
			status: 'success';
			data: UnsubscribeFromChannelSuccessResponse;
			error: null;
			completedAt: string;
	  }
	| {
			status: 'error';
			data: null;
			error: UnsubscribeFromChannelErrorResponse;
			failedAt: string;
	  };

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Realtime repository interface
 * MUST be implemented by both RealtimeMockRepository and RealtimeSupabaseRepository
 * @requirement @MAINT-001
 */
export interface IRealtimeRepository {
	/**
	 * Subscribe to a session's real-time channel
	 * @param request - Subscription parameters
	 * @returns Promise resolving to subscription handle or error
	 * @throws Never throws - always returns typed response
	 */
	subscribeToSession(
		request: SubscribeToSessionRequest
	): Promise<SubscribeToSessionSuccessResponse | SubscribeToSessionErrorResponse>;

	/**
	 * Unsubscribe from a channel
	 * @param request - Unsubscribe parameters
	 * @returns Promise resolving to success or error
	 * @throws Never throws - always returns typed response
	 */
	unsubscribeFromChannel(
		request: UnsubscribeFromChannelRequest
	): Promise<UnsubscribeFromChannelSuccessResponse | UnsubscribeFromChannelErrorResponse>;

	/**
	 * Get current connection state for a channel
	 * @param channelId - Channel identifier
	 * @returns Current connection state or null if not subscribed
	 */
	getConnectionState(channelId: string): ConnectionState | null;

	/**
	 * Get all active subscriptions
	 * @returns Array of active subscription channel IDs
	 */
	getActiveSubscriptions(): string[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if subscription response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isSubscribeToSessionError(
	response: SubscribeToSessionSuccessResponse | SubscribeToSessionErrorResponse
): response is SubscribeToSessionErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if subscription response is successful
 * @param response - Response to check
 * @returns True if response is successful
 */
export function isSubscribeToSessionSuccess(
	response: SubscribeToSessionSuccessResponse | SubscribeToSessionErrorResponse
): response is SubscribeToSessionSuccessResponse {
	return 'subscription' in response;
}

/**
 * Type guard to check if unsubscribe response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isUnsubscribeFromChannelError(
	response: UnsubscribeFromChannelSuccessResponse | UnsubscribeFromChannelErrorResponse
): response is UnsubscribeFromChannelErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if unsubscribe response is successful
 * @param response - Response to check
 * @returns True if response is successful
 */
export function isUnsubscribeFromChannelSuccess(
	response: UnsubscribeFromChannelSuccessResponse | UnsubscribeFromChannelErrorResponse
): response is UnsubscribeFromChannelSuccessResponse {
	return 'success' in response;
}

/**
 * Type guard to check if an event is a task event
 * @param event - Event to check
 * @returns True if event is a task event
 */
export function isTaskEvent(event: RealtimeEvent): event is TaskEvent {
	return 'table' in event && event.table === 'tasks';
}

/**
 * Type guard to check if an event is a choice event
 * @param event - Event to check
 * @returns True if event is a choice event
 */
export function isChoiceEvent(event: RealtimeEvent): event is ChoiceEvent {
	return 'table' in event && event.table === 'task_choices';
}

/**
 * Type guard to check if an event is a list event
 * @param event - Event to check
 * @returns True if event is a list event
 */
export function isListEvent(event: RealtimeEvent): event is ListEvent {
	return 'table' in event && event.table === 'collaborative_lists';
}

/**
 * Type guard to check if an event is a list item event
 * @param event - Event to check
 * @returns True if event is a list item event
 */
export function isListItemEvent(event: RealtimeEvent): event is ListItemEvent {
	return 'table' in event && event.table === 'list_items';
}

/**
 * Type guard to check if an event is a list item verification event
 * @param event - Event to check
 * @returns True if event is a list item verification event
 */
export function isListItemVerificationEvent(
	event: RealtimeEvent
): event is ListItemVerificationEvent {
	return 'table' in event && event.table === 'list_item_verifications';
}

/**
 * Type guard to check if an event is a presence event
 * @param event - Event to check
 * @returns True if event is a presence event
 */
export function isPresenceEvent(event: RealtimeEvent): event is PresenceEvent {
	return 'type' in event && ['join', 'leave', 'sync'].includes(event.type);
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

/**
 * Zod schema for database event type
 */
export const DatabaseEventTypeSchema = z.enum(['INSERT', 'UPDATE', 'DELETE']);

/**
 * Zod schema for realtime event category
 */
export const RealtimeEventCategorySchema = z.enum(['task', 'choice', 'list', 'presence']);

/**
 * Zod schema for connection status
 */
export const ConnectionStatusSchema = z.enum([
	'connecting',
	'connected',
	'disconnected',
	'reconnecting',
	'failed'
]);

/**
 * Zod schema for connection state
 */
export const ConnectionStateSchema = z.object({
	status: ConnectionStatusSchema,
	lastConnected: z.string().datetime().optional(),
	reconnectAttempts: z.number().int().min(0).optional(),
	timestamp: z.string().datetime()
});

/**
 * Zod schema for subscription request
 */
export const SubscribeToSessionRequestSchema = z.object({
	sessionId: z.string().uuid(),
	eventTypes: z.array(RealtimeEventCategorySchema).min(1),
	userId: z.string().uuid().optional(),
	userName: z.string().min(1).max(100).optional()
});

/**
 * Zod schema for unsubscribe request
 */
export const UnsubscribeFromChannelRequestSchema = z.object({
	channelId: z.string().min(1)
});

/**
 * Zod schema for task record
 */
export const TaskRecordSchema = z.object({
	id: z.string().uuid(),
	session_id: z.string().uuid(),
	text: z.string().min(1).max(500),
	is_complete: z.boolean(),
	completed_at: z.string().datetime().nullable(),
	day: z.enum(['today', 'tomorrow']),
	order_index: z.number().int().min(0),
	is_secret: z.boolean(),
	votes: z.array(z.string().uuid()),
	comments: z.string().max(1000).nullable(),
	created_by: z.string().uuid(),
	created_by_name: z.string().min(1).max(100),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime()
});

/**
 * Zod schema for choice record
 */
export const ChoiceRecordSchema = z.object({
	id: z.string().uuid(),
	task_id: z.string().uuid(),
	user_id: z.string().uuid(),
	user_name: z.string().min(1).max(100),
	choice: z.enum(['yes', 'no', 'maybe']),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime()
});

/**
 * Zod schema for list record
 */
export const ListRecordSchema = z.object({
	id: z.string().uuid(),
	session_id: z.string().uuid(),
	title: z.string().min(1).max(200),
	list_type: z.enum(['bullet', 'numbered']),
	creator_id: z.string().uuid(),
	creator_name: z.string().min(1).max(100),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime()
});

/**
 * Zod schema for list item record
 */
export const ListItemRecordSchema = z.object({
	id: z.string().uuid(),
	list_id: z.string().uuid(),
	text: z.string().min(1).max(500),
	order_index: z.number().int().min(0),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime()
});

/**
 * Zod schema for list item verification record
 */
export const ListItemVerificationRecordSchema = z.object({
	id: z.string().uuid(),
	item_id: z.string().uuid(),
	user_id: z.string().uuid(),
	user_name: z.string().min(1).max(100),
	is_accurate: z.boolean(),
	correction_text: z.string().max(1000).nullable(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime()
});

/**
 * Zod schema for presence event type
 */
export const PresenceEventTypeSchema = z.enum(['join', 'leave', 'sync']);

/**
 * Zod schema for presence event
 */
export const PresenceEventSchema = z.object({
	type: PresenceEventTypeSchema,
	userId: z.string().uuid(),
	userName: z.string().min(1).max(100),
	timestamp: z.string().datetime(),
	metadata: z
		.object({
			presentUsers: z
				.array(
					z.object({
						userId: z.string().uuid(),
						userName: z.string().min(1).max(100),
						joinedAt: z.string().datetime()
					})
				)
				.optional()
		})
		.optional()
});

// ============================================================================
// COMPILE-TIME VALIDATION
// ============================================================================

/**
 * Type assertion: SubscribeToSessionRequest schema matches interface
 * This will cause a compile error if they diverge
 */
type ValidateSubscribeSchema =
	z.infer<typeof SubscribeToSessionRequestSchema> extends SubscribeToSessionRequest
		? SubscribeToSessionRequest extends z.infer<typeof SubscribeToSessionRequestSchema>
			? true
			: false
		: false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const subscribeSchemaIsValid: ValidateSubscribeSchema = true;

/**
 * Type assertion: UnsubscribeFromChannelRequest schema matches interface
 * This will cause a compile error if they diverge
 */
type ValidateUnsubscribeSchema =
	z.infer<typeof UnsubscribeFromChannelRequestSchema> extends UnsubscribeFromChannelRequest
		? UnsubscribeFromChannelRequest extends z.infer<typeof UnsubscribeFromChannelRequestSchema>
			? true
			: false
		: false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unsubscribeSchemaIsValid: ValidateUnsubscribeSchema = true;

/**
 * Type assertion: ConnectionState schema matches interface
 * This will cause a compile error if they diverge
 */
type ValidateConnectionStateSchema =
	z.infer<typeof ConnectionStateSchema> extends ConnectionState
		? ConnectionState extends z.infer<typeof ConnectionStateSchema>
			? true
			: false
		: false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const connectionStateSchemaIsValid: ValidateConnectionStateSchema = true;

/**
 * Session Management Seam Contracts
 *
 * This file defines all session-related data boundaries (seams) for the
 * Erin's Escapades V2 application. All session operations flow through
 * these contracts.
 *
 * @module session.contracts
 * @requirement @SESSION-001, @SESSION-002, @SESSION-003, @SESSION-004
 */

import { z } from 'zod';

// ============================================================================
// SHARED TYPES
// ============================================================================

/**
 * Vibe/Theme configuration for a session
 * @requirement @VIBE-001
 */
export interface VibeConfig {
	/**
	 * Unique identifier for the vibe preset
	 * @example "chaos-gremlin"
	 */
	id: string;

	/**
	 * Color scheme for the vibe
	 */
	colorScheme: {
		/** Primary color (hex) */
		primary: string;
		/** Secondary color (hex) */
		secondary: string;
		/** Accent color (hex) */
		accent: string;
		/** Background color (hex) */
		background: string;
	};
}

/**
 * Participant information in a session
 */
export interface SessionParticipant {
	/** Unique user ID */
	id: string;
	/** Display name (animal code or user name) */
	name: string;
	/** Timestamp when user joined session */
	joinedAt: string;
	/** Whether user is currently online */
	isOnline: boolean;
}

/**
 * Core session data structure
 */
export interface SessionData {
	/** Unique session ID */
	id: string;
	/** Human-readable session code (e.g., "cat-dolphin") */
	code: string;
	/** User ID of session host */
	hostId: string;
	/** ISO 8601 timestamp of session creation */
	createdAt: string;
	/** Number of participants in session */
	participantCount: number;
	/** Current vibe/theme configuration */
	dayVibe: VibeConfig | null;
}

// ============================================================================
// SEAM-SESSION-001: Create Session
// ============================================================================

/**
 * @seam SEAM-SESSION-001
 * @description Create a new collaborative session
 * @requirement @SESSION-001
 * @boundary UI Component ↔ Session Service
 */

/**
 * Input data for creating a session
 * @requirement @SESSION-001
 */
export interface CreateSessionRequest {
	/**
	 * ID of user creating the session
	 * @requirement @SESSION-001
	 * @validation Must be valid UUID
	 */
	userId: string;

	/**
	 * Display name for the user (animal code or user name)
	 * @requirement @SESSION-001
	 * @example "cat-dolphin"
	 * @validation 1-100 characters
	 */
	userName: string;
}

/**
 * Success response for session creation
 * @requirement @SESSION-001
 */
export interface CreateSessionSuccessResponse {
	session: SessionData;
}

/**
 * Error codes for session creation
 * @requirement @UX-003
 */
export type CreateSessionErrorCode =
	| 'CODE_COLLISION'       // Generated session code already exists (retry)
	| 'DATABASE_ERROR'       // Database operation failed
	| 'RATE_LIMIT_EXCEEDED'; // User created too many sessions too quickly

/**
 * Error response for session creation
 */
export interface CreateSessionErrorResponse {
	error: {
		code: CreateSessionErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for session creation operation
 * @requirement @UX-002
 */
export type CreateSessionState = 'idle' | 'creating' | 'success' | 'error';

/**
 * Complete async state for session creation
 */
export type CreateSessionAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'creating'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: SessionData; error: null; createdAt: string }
	| { status: 'error'; data: null; error: CreateSessionErrorResponse; failedAt: string };

// ============================================================================
// SEAM-SESSION-002: Join Session
// ============================================================================

/**
 * @seam SEAM-SESSION-002
 * @description Join an existing session via code
 * @requirement @SESSION-002
 * @boundary UI Component ↔ Session Service
 */

/**
 * Session data with user-specific context
 */
export interface SessionWithContext extends SessionData {
	/** Whether the current user is the session host */
	isUserHost: boolean;
}

/**
 * Input data for joining a session
 * @requirement @SESSION-002
 */
export interface JoinSessionRequest {
	/**
	 * Session code to join
	 * @requirement @SESSION-002
	 * @example "cat-dolphin"
	 * @validation Must match animal-animal pattern
	 */
	sessionCode: string;

	/**
	 * ID of user joining the session
	 * @requirement @SESSION-002
	 * @validation Must be valid UUID
	 */
	userId: string;

	/**
	 * Display name for the user
	 * @requirement @SESSION-002
	 * @validation 1-100 characters
	 */
	userName: string;
}

/**
 * Success response for joining a session
 * @requirement @SESSION-002
 */
export interface JoinSessionSuccessResponse {
	session: SessionWithContext;
}

/**
 * Error codes for joining a session
 * @requirement @UX-003
 */
export type JoinSessionErrorCode =
	| 'SESSION_NOT_FOUND'   // Session code doesn't exist
	| 'SESSION_FULL'        // Session has reached participant limit
	| 'ALREADY_PARTICIPANT' // User already in this session
	| 'DATABASE_ERROR';     // Database operation failed

/**
 * Error response for joining a session
 */
export interface JoinSessionErrorResponse {
	error: {
		code: JoinSessionErrorCode;
		message: string;
		retryable: boolean;
		metadata?: {
			/** Current number of participants (for SESSION_FULL) */
			currentParticipants?: number;
			/** Maximum allowed participants (for SESSION_FULL) */
			maxParticipants?: number;
		};
	};
}

/**
 * UI state for join session operation
 * @requirement @UX-002
 */
export type JoinSessionState = 'idle' | 'joining' | 'success' | 'error';

/**
 * Complete async state for joining session
 */
export type JoinSessionAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'joining'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: SessionWithContext; error: null; joinedAt: string }
	| { status: 'error'; data: null; error: JoinSessionErrorResponse; failedAt: string };

// ============================================================================
// SEAM-SESSION-003: Leave Session
// ============================================================================

/**
 * @seam SEAM-SESSION-003
 * @description Leave a session (with host transfer if needed)
 * @requirement @SESSION-003
 * @boundary UI Component ↔ Session Service
 */

/**
 * Input data for leaving a session
 * @requirement @SESSION-003
 */
export interface LeaveSessionRequest {
	/**
	 * Session ID to leave
	 * @requirement @SESSION-003
	 * @validation Must be valid UUID
	 */
	sessionId: string;

	/**
	 * ID of user leaving the session
	 * @requirement @SESSION-003
	 * @validation Must be valid UUID
	 */
	userId: string;
}

/**
 * Success response for leaving a session
 * @requirement @SESSION-003
 */
export interface LeaveSessionSuccessResponse {
	success: true;
	/**
	 * New host ID if user was host and ownership transferred
	 * @requirement @SESSION-003
	 */
	newHostId?: string;
}

/**
 * Error codes for leaving a session
 * @requirement @UX-003
 */
export type LeaveSessionErrorCode =
	| 'NOT_PARTICIPANT'  // User is not a participant in this session
	| 'DATABASE_ERROR';  // Database operation failed

/**
 * Error response for leaving a session
 */
export interface LeaveSessionErrorResponse {
	error: {
		code: LeaveSessionErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for leave session operation
 * @requirement @UX-002
 */
export type LeaveSessionState = 'idle' | 'leaving' | 'success' | 'error';

/**
 * Complete async state for leaving session
 */
export type LeaveSessionAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'leaving'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: LeaveSessionSuccessResponse; error: null; leftAt: string }
	| { status: 'error'; data: null; error: LeaveSessionErrorResponse; failedAt: string };

// ============================================================================
// SEAM-SESSION-004: Get Session Details
// ============================================================================

/**
 * @seam SEAM-SESSION-004
 * @description Retrieve complete session details including participants
 * @requirement @SESSION-001 (viewing session state)
 * @boundary UI Component ↔ Session Service
 */

/**
 * Complete session details with participants
 */
export interface SessionDetails extends SessionWithContext {
	/** List of all participants in the session */
	participants: SessionParticipant[];
}

/**
 * Input data for getting session details
 */
export interface GetSessionDetailsRequest {
	/**
	 * Session ID to retrieve
	 * @validation Must be valid UUID
	 */
	sessionId: string;
}

/**
 * Success response for getting session details
 */
export interface GetSessionDetailsSuccessResponse {
	session: SessionDetails;
}

/**
 * Error codes for getting session details
 * @requirement @UX-003
 */
export type GetSessionDetailsErrorCode =
	| 'SESSION_NOT_FOUND' // Session doesn't exist
	| 'UNAUTHORIZED'      // User not authorized to view this session
	| 'DATABASE_ERROR';   // Database operation failed

/**
 * Error response for getting session details
 */
export interface GetSessionDetailsErrorResponse {
	error: {
		code: GetSessionDetailsErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for get session details operation
 * @requirement @UX-002
 */
export type GetSessionDetailsState = 'loading' | 'loaded' | 'error';

/**
 * Complete async state for getting session details
 */
export type GetSessionDetailsAsyncState =
	| { status: 'loading'; data: null; error: null; startedAt: string }
	| { status: 'loaded'; data: SessionDetails; error: null; loadedAt: string }
	| { status: 'error'; data: null; error: GetSessionDetailsErrorResponse; failedAt: string };

// ============================================================================
// SEAM-SESSION-005: Generate Share Data
// ============================================================================

/**
 * @seam SEAM-SESSION-005
 * @description Generate shareable URL and optional QR code for session
 * @requirement @SESSION-004
 * @boundary UI Component ↔ Session Service
 */

/**
 * Input data for generating share data
 * @requirement @SESSION-004
 */
export interface GenerateShareDataRequest {
	/**
	 * Session ID to generate share data for
	 * @validation Must be valid UUID
	 */
	sessionId: string;

	/**
	 * Whether to generate QR code
	 * @requirement @SESSION-004
	 * @default false
	 */
	includeQR?: boolean;

	/**
	 * Optional pre-filled parameters for share URL
	 * @requirement @SESSION-004
	 * @example { "answer": "yes" }
	 */
	preFillAnswers?: Record<string, string>;
}

/**
 * Success response for generating share data
 * @requirement @SESSION-004
 */
export interface GenerateShareDataSuccessResponse {
	/**
	 * Full shareable URL with parameters
	 * @example "https://app.example.com/?session=cat-dolphin&answer=yes"
	 */
	shareUrl: string;

	/**
	 * Base64-encoded PNG QR code data URL (if requested)
	 * @example "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
	 */
	qrCodeDataUrl?: string;
}

/**
 * Error codes for generating share data
 * @requirement @UX-003
 */
export type GenerateShareDataErrorCode =
	| 'QR_GENERATION_FAILED' // QR code generation failed
	| 'INVALID_SESSION';     // Session doesn't exist or invalid

/**
 * Error response for generating share data
 */
export interface GenerateShareDataErrorResponse {
	error: {
		code: GenerateShareDataErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for generate share data operation
 * @requirement @UX-002
 */
export type GenerateShareDataState = 'idle' | 'generating' | 'ready' | 'error';

/**
 * Complete async state for generating share data
 */
export type GenerateShareDataAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'generating'; data: null; error: null; startedAt: string }
	| { status: 'ready'; data: GenerateShareDataSuccessResponse; error: null; generatedAt: string }
	| { status: 'error'; data: null; error: GenerateShareDataErrorResponse; failedAt: string };

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Session repository interface
 *
 * This interface MUST be implemented by both SessionMockRepository and
 * SessionSupabaseRepository to ensure contract compliance.
 *
 * @requirement @MAINT-001
 */
export interface ISessionRepository {
	/**
	 * Create a new session
	 * @param request - Session creation parameters
	 * @returns Promise resolving to created session or error
	 * @throws Never throws - always returns typed response
	 */
	createSession(
		request: CreateSessionRequest
	): Promise<CreateSessionSuccessResponse | CreateSessionErrorResponse>;

	/**
	 * Join an existing session
	 * @param request - Session join parameters
	 * @returns Promise resolving to session data or error
	 * @throws Never throws - always returns typed response
	 */
	joinSession(
		request: JoinSessionRequest
	): Promise<JoinSessionSuccessResponse | JoinSessionErrorResponse>;

	/**
	 * Leave a session
	 * @param request - Session leave parameters
	 * @returns Promise resolving to success confirmation or error
	 * @throws Never throws - always returns typed response
	 */
	leaveSession(
		request: LeaveSessionRequest
	): Promise<LeaveSessionSuccessResponse | LeaveSessionErrorResponse>;

	/**
	 * Get complete session details
	 * @param request - Session details request parameters
	 * @returns Promise resolving to session details or error
	 * @throws Never throws - always returns typed response
	 */
	getSessionDetails(
		request: GetSessionDetailsRequest
	): Promise<GetSessionDetailsSuccessResponse | GetSessionDetailsErrorResponse>;

	/**
	 * Generate share data for a session
	 * @param request - Share data generation parameters
	 * @returns Promise resolving to share data or error
	 * @throws Never throws - always returns typed response
	 */
	generateShareData(
		request: GenerateShareDataRequest
	): Promise<GenerateShareDataSuccessResponse | GenerateShareDataErrorResponse>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard: Check if create session response is an error
 */
export function isCreateSessionError(
	response: CreateSessionSuccessResponse | CreateSessionErrorResponse
): response is CreateSessionErrorResponse {
	return 'error' in response;
}

/**
 * Type guard: Check if create session response is successful
 */
export function isCreateSessionSuccess(
	response: CreateSessionSuccessResponse | CreateSessionErrorResponse
): response is CreateSessionSuccessResponse {
	return 'session' in response;
}

/**
 * Type guard: Check if join session response is an error
 */
export function isJoinSessionError(
	response: JoinSessionSuccessResponse | JoinSessionErrorResponse
): response is JoinSessionErrorResponse {
	return 'error' in response;
}

/**
 * Type guard: Check if join session response is successful
 */
export function isJoinSessionSuccess(
	response: JoinSessionSuccessResponse | JoinSessionErrorResponse
): response is JoinSessionSuccessResponse {
	return 'session' in response;
}

/**
 * Type guard: Check if leave session response is an error
 */
export function isLeaveSessionError(
	response: LeaveSessionSuccessResponse | LeaveSessionErrorResponse
): response is LeaveSessionErrorResponse {
	return 'error' in response;
}

/**
 * Type guard: Check if leave session response is successful
 */
export function isLeaveSessionSuccess(
	response: LeaveSessionSuccessResponse | LeaveSessionErrorResponse
): response is LeaveSessionSuccessResponse {
	return 'success' in response && response.success === true;
}

/**
 * Type guard: Check if get session details response is an error
 */
export function isGetSessionDetailsError(
	response: GetSessionDetailsSuccessResponse | GetSessionDetailsErrorResponse
): response is GetSessionDetailsErrorResponse {
	return 'error' in response;
}

/**
 * Type guard: Check if get session details response is successful
 */
export function isGetSessionDetailsSuccess(
	response: GetSessionDetailsSuccessResponse | GetSessionDetailsErrorResponse
): response is GetSessionDetailsSuccessResponse {
	return 'session' in response;
}

/**
 * Type guard: Check if generate share data response is an error
 */
export function isGenerateShareDataError(
	response: GenerateShareDataSuccessResponse | GenerateShareDataErrorResponse
): response is GenerateShareDataErrorResponse {
	return 'error' in response;
}

/**
 * Type guard: Check if generate share data response is successful
 */
export function isGenerateShareDataSuccess(
	response: GenerateShareDataSuccessResponse | GenerateShareDataErrorResponse
): response is GenerateShareDataSuccessResponse {
	return 'shareUrl' in response;
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

/**
 * Zod schema for VibeConfig validation
 */
export const VibeConfigSchema = z.object({
	id: z.string().min(1),
	colorScheme: z.object({
		primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
		secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
		accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
		background: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
	})
});

/**
 * Zod schema for CreateSessionRequest validation
 * Ensures runtime type safety matches compile-time types
 */
export const CreateSessionRequestSchema = z.object({
	userId: z.string().uuid(),
	userName: z.string().min(1).max(100).trim()
});

/**
 * Zod schema for JoinSessionRequest validation
 */
export const JoinSessionRequestSchema = z.object({
	sessionCode: z.string().min(1).max(100),
	userId: z.string().uuid(),
	userName: z.string().min(1).max(100).trim()
});

/**
 * Zod schema for LeaveSessionRequest validation
 */
export const LeaveSessionRequestSchema = z.object({
	sessionId: z.string().uuid(),
	userId: z.string().uuid()
});

/**
 * Zod schema for GetSessionDetailsRequest validation
 */
export const GetSessionDetailsRequestSchema = z.object({
	sessionId: z.string().uuid()
});

/**
 * Zod schema for GenerateShareDataRequest validation
 */
export const GenerateShareDataRequestSchema = z.object({
	sessionId: z.string().uuid(),
	includeQR: z.boolean().optional(),
	preFillAnswers: z.record(z.string(), z.string()).optional()
});

// ============================================================================
// COMPILE-TIME SCHEMA VALIDATION
// ============================================================================

/**
 * Type assertion: CreateSessionRequestSchema matches CreateSessionRequest
 * This will cause a compile error if they diverge
 */
type ValidateCreateSessionSchema =
	z.infer<typeof CreateSessionRequestSchema> extends CreateSessionRequest
		? CreateSessionRequest extends z.infer<typeof CreateSessionRequestSchema>
			? true
			: false
		: false;

const createSessionSchemaValid: ValidateCreateSessionSchema = true;

/**
 * Type assertion: JoinSessionRequestSchema matches JoinSessionRequest
 */
type ValidateJoinSessionSchema =
	z.infer<typeof JoinSessionRequestSchema> extends JoinSessionRequest
		? JoinSessionRequest extends z.infer<typeof JoinSessionRequestSchema>
			? true
			: false
		: false;

const joinSessionSchemaValid: ValidateJoinSessionSchema = true;

/**
 * Type assertion: LeaveSessionRequestSchema matches LeaveSessionRequest
 */
type ValidateLeaveSessionSchema =
	z.infer<typeof LeaveSessionRequestSchema> extends LeaveSessionRequest
		? LeaveSessionRequest extends z.infer<typeof LeaveSessionRequestSchema>
			? true
			: false
		: false;

const leaveSessionSchemaValid: ValidateLeaveSessionSchema = true;

/**
 * Type assertion: GetSessionDetailsRequestSchema matches GetSessionDetailsRequest
 */
type ValidateGetSessionDetailsSchema =
	z.infer<typeof GetSessionDetailsRequestSchema> extends GetSessionDetailsRequest
		? GetSessionDetailsRequest extends z.infer<typeof GetSessionDetailsRequestSchema>
			? true
			: false
		: false;

const getSessionDetailsSchemaValid: ValidateGetSessionDetailsSchema = true;

/**
 * Type assertion: GenerateShareDataRequestSchema matches GenerateShareDataRequest
 */
type ValidateGenerateShareDataSchema =
	z.infer<typeof GenerateShareDataRequestSchema> extends GenerateShareDataRequest
		? GenerateShareDataRequest extends z.infer<typeof GenerateShareDataRequestSchema>
			? true
			: false
		: false;

const generateShareDataSchemaValid: ValidateGenerateShareDataSchema = true;

// ============================================================================
// EXPORTS
// ============================================================================

// Prevent unused variable warnings for compile-time checks
export const __schemaValidation = {
	createSessionSchemaValid,
	joinSessionSchemaValid,
	leaveSessionSchemaValid,
	getSessionDetailsSchemaValid,
	generateShareDataSchemaValid
};

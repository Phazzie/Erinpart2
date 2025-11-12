/**
 * Authentication Seam Contracts
 *
 * This file defines ALL authentication-related seams for Erin's Escapades V2.
 * It includes anonymous authentication, OAuth authentication, sign out, and user retrieval.
 *
 * @module auth.contracts
 * @category Contracts
 */

import { z } from 'zod';

// ============================================================================
// SEAM-AUTH-001: ANONYMOUS SIGN IN
// ============================================================================

/**
 * @seam SEAM-AUTH-001
 * @description Authenticate user with two animal names (e.g., "cat-dolphin")
 * @requirement @AUTH-001
 * @boundary AnimalCodeForm Component ↔ Auth Repository
 */

// REQUEST TYPES

/**
 * Input data for anonymous sign in
 * @requirement @AUTH-001
 */
export interface AnonymousSignInRequest {
	/**
	 * First animal name
	 * @requirement @AUTH-001
	 * @example "cat"
	 * @validation Must be one of 46 predefined animals
	 */
	animalOne: string;

	/**
	 * Second animal name
	 * @requirement @AUTH-001
	 * @example "dolphin"
	 * @validation Must be one of 46 predefined animals
	 */
	animalTwo: string;
}

// RESPONSE TYPES (SUCCESS)

/**
 * Represents an anonymous user created via animal code
 * @requirement @AUTH-001
 */
export interface AnonymousUser {
	/**
	 * Unique user identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * Combined animal code (animalOne-animalTwo)
	 * @example "cat-dolphin"
	 */
	animalCode: string;

	/**
	 * User creation timestamp (ISO 8601)
	 * @example "2025-11-12T10:30:00.000Z"
	 */
	createdAt: string;
}

/**
 * Session information returned after successful authentication
 * @requirement @AUTH-003
 */
export interface AuthSession {
	/**
	 * Access token for API requests
	 * @requirement @AUTH-003
	 */
	accessToken: string;

	/**
	 * Refresh token for extending session
	 * @requirement @AUTH-003
	 */
	refreshToken: string;

	/**
	 * Session expiration timestamp (ISO 8601)
	 * @requirement @AUTH-003
	 * @example "2025-12-12T10:30:00.000Z"
	 */
	expiresAt: string;
}

/**
 * Success response for anonymous sign in
 * @requirement @AUTH-001
 */
export interface AnonymousSignInSuccessResponse {
	user: AnonymousUser;
	session: AuthSession;
}

// RESPONSE TYPES (ERROR)

/**
 * Error codes for anonymous sign in
 * @requirement @UX-003
 */
export type AnonymousSignInErrorCode =
	| 'DUPLICATE_CODE' // Animal code combination already in use
	| 'NETWORK_ERROR' // Network request failed
	| 'SERVICE_UNAVAILABLE'; // Authentication service unavailable

/**
 * Error response for anonymous sign in
 */
export interface AnonymousSignInErrorResponse {
	error: {
		code: AnonymousSignInErrorCode;
		message: string;
		retryable: boolean;
	};
}

// STATE TYPES

/**
 * UI state for anonymous sign in operation
 * @requirement @UX-002
 */
export type AnonymousSignInState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Complete async state for anonymous sign in
 */
export type AnonymousSignInAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'loading'; data: null; error: null; startedAt: string }
	| {
			status: 'success';
			data: { user: AnonymousUser; session: AuthSession };
			error: null;
			loadedAt: string;
	  }
	| {
			status: 'error';
			data: null;
			error: AnonymousSignInErrorResponse;
			failedAt: string;
	  };

// ============================================================================
// SEAM-AUTH-002: OAUTH SIGN IN
// ============================================================================

/**
 * @seam SEAM-AUTH-002
 * @description Authenticate user via OAuth provider (Google, GitHub, etc.)
 * @requirement @AUTH-002
 * @boundary OAuthButton Component ↔ Auth Repository
 */

// REQUEST TYPES

/**
 * OAuth provider type (extensible)
 * @requirement @AUTH-002
 */
export type OAuthProvider = 'google' | 'github';

/**
 * Input data for OAuth sign in
 * @requirement @AUTH-002
 */
export interface OAuthSignInRequest {
	/**
	 * OAuth provider to use
	 * @requirement @AUTH-002
	 * @example "google"
	 * @validation Must be supported OAuth provider
	 */
	provider: OAuthProvider;
}

// RESPONSE TYPES (SUCCESS)

/**
 * Represents an OAuth-authenticated user
 * @requirement @AUTH-002
 */
export interface OAuthUser {
	/**
	 * Unique user identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * User's email from OAuth provider
	 * @example "user@example.com"
	 */
	email: string;

	/**
	 * User's display name from OAuth provider
	 * @example "John Doe"
	 */
	name: string;

	/**
	 * User's avatar URL from OAuth provider (nullable)
	 * @example "https://lh3.googleusercontent.com/a/..."
	 */
	avatarUrl: string | null;
}

/**
 * Success response for OAuth sign in
 * @requirement @AUTH-002
 */
export interface OAuthSignInSuccessResponse {
	user: OAuthUser;
	session: AuthSession;
}

// RESPONSE TYPES (ERROR)

/**
 * Error codes for OAuth sign in
 * @requirement @UX-003
 */
export type OAuthSignInErrorCode =
	| 'OAUTH_REJECTED' // User rejected OAuth consent
	| 'OAUTH_TIMEOUT' // OAuth callback timeout
	| 'NETWORK_ERROR'; // Network request failed

/**
 * Error response for OAuth sign in
 */
export interface OAuthSignInErrorResponse {
	error: {
		code: OAuthSignInErrorCode;
		message: string;
		retryable: boolean;
	};
}

// STATE TYPES

/**
 * UI state for OAuth sign in operation
 * @requirement @UX-002
 */
export type OAuthSignInState = 'idle' | 'redirecting' | 'success' | 'error';

/**
 * Complete async state for OAuth sign in
 */
export type OAuthSignInAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'redirecting'; data: null; error: null; startedAt: string }
	| {
			status: 'success';
			data: { user: OAuthUser; session: AuthSession };
			error: null;
			loadedAt: string;
	  }
	| {
			status: 'error';
			data: null;
			error: OAuthSignInErrorResponse;
			failedAt: string;
	  };

// ============================================================================
// SEAM-AUTH-003: SIGN OUT
// ============================================================================

/**
 * @seam SEAM-AUTH-003
 * @description Sign out current user and invalidate session
 * @requirement @AUTH-003
 * @boundary SignOutButton Component ↔ Auth Repository
 */

// REQUEST TYPES

/**
 * Input data for sign out (uses existing session)
 * @requirement @AUTH-003
 */
export type SignOutRequest = void;

// RESPONSE TYPES (SUCCESS)

/**
 * Success response for sign out
 * @requirement @AUTH-003
 */
export interface SignOutSuccessResponse {
	success: true;
}

// RESPONSE TYPES (ERROR)

/**
 * Error codes for sign out
 * @requirement @UX-003
 */
export type SignOutErrorCode =
	| 'ALREADY_SIGNED_OUT' // No active session to sign out
	| 'NETWORK_ERROR'; // Network request failed

/**
 * Error response for sign out
 */
export interface SignOutErrorResponse {
	error: {
		code: SignOutErrorCode;
		message: string;
		retryable: boolean;
	};
}

// STATE TYPES

/**
 * UI state for sign out operation
 * @requirement @UX-002
 */
export type SignOutState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Complete async state for sign out
 */
export type SignOutAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'loading'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: { success: true }; error: null; loadedAt: string }
	| { status: 'error'; data: null; error: SignOutErrorResponse; failedAt: string };

// ============================================================================
// SEAM-AUTH-004: GET CURRENT USER
// ============================================================================

/**
 * @seam SEAM-AUTH-004
 * @description Retrieve current authenticated user (if any)
 * @requirement @AUTH-003
 * @boundary UserContext Component ↔ Auth Repository
 */

// REQUEST TYPES

/**
 * Input data for getting current user (no parameters needed)
 * @requirement @AUTH-003
 */
export type GetCurrentUserRequest = void;

// RESPONSE TYPES (SUCCESS)

/**
 * Represents the current authenticated user (union of anonymous and OAuth users)
 * @requirement @AUTH-001, @AUTH-002
 */
export interface CurrentUser {
	/**
	 * Unique user identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * Animal code (only present for anonymous users)
	 * @example "cat-dolphin"
	 */
	animalCode?: string;

	/**
	 * Email (only present for OAuth users)
	 * @example "user@example.com"
	 */
	email?: string;

	/**
	 * Display name (only present for OAuth users)
	 * @example "John Doe"
	 */
	name?: string;

	/**
	 * Avatar URL (only present for OAuth users, nullable)
	 * @example "https://lh3.googleusercontent.com/a/..."
	 */
	avatarUrl?: string | null;
}

/**
 * Success response when user is authenticated
 * @requirement @AUTH-003
 */
export interface GetCurrentUserAuthenticatedResponse {
	user: CurrentUser;
}

/**
 * Success response when user is not authenticated
 * @requirement @AUTH-003
 */
export interface GetCurrentUserUnauthenticatedResponse {
	user: null;
}

/**
 * Combined response type for getting current user
 */
export type GetCurrentUserResponse =
	| GetCurrentUserAuthenticatedResponse
	| GetCurrentUserUnauthenticatedResponse;

// STATE TYPES

/**
 * UI state for get current user operation
 * @requirement @UX-002
 */
export type GetCurrentUserState = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Complete async state for get current user
 */
export type GetCurrentUserAsyncState =
	| { status: 'loading'; data: null; error: null; startedAt: string }
	| {
			status: 'authenticated';
			data: { user: CurrentUser };
			error: null;
			loadedAt: string;
	  }
	| {
			status: 'unauthenticated';
			data: { user: null };
			error: null;
			loadedAt: string;
	  };

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Authentication repository interface
 * This interface MUST be implemented by both AuthMockRepository and AuthSupabaseRepository
 * @requirement @MAINT-001
 */
export interface IAuthRepository {
	/**
	 * Authenticate user with anonymous animal code
	 * @param request - Animal code selection
	 * @returns Promise resolving to authenticated user or error
	 * @throws Never throws - always returns typed response
	 */
	anonymousSignIn(
		request: AnonymousSignInRequest
	): Promise<AnonymousSignInSuccessResponse | AnonymousSignInErrorResponse>;

	/**
	 * Authenticate user via OAuth provider
	 * @param request - OAuth provider selection
	 * @returns Promise resolving to authenticated user or error
	 * @throws Never throws - always returns typed response
	 */
	oauthSignIn(
		request: OAuthSignInRequest
	): Promise<OAuthSignInSuccessResponse | OAuthSignInErrorResponse>;

	/**
	 * Sign out current user and invalidate session
	 * @returns Promise resolving to success confirmation or error
	 * @throws Never throws - always returns typed response
	 */
	signOut(): Promise<SignOutSuccessResponse | SignOutErrorResponse>;

	/**
	 * Get current authenticated user (if any)
	 * @returns Promise resolving to current user or null
	 * @throws Never throws - always returns typed response
	 */
	getCurrentUser(): Promise<GetCurrentUserResponse>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if anonymous sign in response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isAnonymousSignInError(
	response: AnonymousSignInSuccessResponse | AnonymousSignInErrorResponse
): response is AnonymousSignInErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if anonymous sign in response is successful
 * @param response - Response to check
 * @returns True if response is successful
 */
export function isAnonymousSignInSuccess(
	response: AnonymousSignInSuccessResponse | AnonymousSignInErrorResponse
): response is AnonymousSignInSuccessResponse {
	return 'user' in response && 'session' in response;
}

/**
 * Type guard to check if OAuth sign in response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isOAuthSignInError(
	response: OAuthSignInSuccessResponse | OAuthSignInErrorResponse
): response is OAuthSignInErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if OAuth sign in response is successful
 * @param response - Response to check
 * @returns True if response is successful
 */
export function isOAuthSignInSuccess(
	response: OAuthSignInSuccessResponse | OAuthSignInErrorResponse
): response is OAuthSignInSuccessResponse {
	return 'user' in response && 'session' in response;
}

/**
 * Type guard to check if sign out response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isSignOutError(
	response: SignOutSuccessResponse | SignOutErrorResponse
): response is SignOutErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if sign out response is successful
 * @param response - Response to check
 * @returns True if response is successful
 */
export function isSignOutSuccess(
	response: SignOutSuccessResponse | SignOutErrorResponse
): response is SignOutSuccessResponse {
	return 'success' in response;
}

/**
 * Type guard to check if user is authenticated
 * @param response - Response to check
 * @returns True if user is authenticated
 */
export function isUserAuthenticated(
	response: GetCurrentUserResponse
): response is GetCurrentUserAuthenticatedResponse {
	return response.user !== null;
}

/**
 * Type guard to check if user is unauthenticated
 * @param response - Response to check
 * @returns True if user is not authenticated
 */
export function isUserUnauthenticated(
	response: GetCurrentUserResponse
): response is GetCurrentUserUnauthenticatedResponse {
	return response.user === null;
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

/**
 * Zod schema for anonymous sign in request validation
 * Ensures runtime type safety matches compile-time types
 */
export const AnonymousSignInRequestSchema = z.object({
	animalOne: z.string().min(1).max(50),
	animalTwo: z.string().min(1).max(50)
});

/**
 * Type assertion: Zod schema must match TypeScript interface
 * This will cause a compile error if they diverge
 */
type ValidateAnonymousSignInSchema =
	z.infer<typeof AnonymousSignInRequestSchema> extends AnonymousSignInRequest
		? AnonymousSignInRequest extends z.infer<typeof AnonymousSignInRequestSchema>
			? true
			: false
		: false;

const anonymousSignInSchemaValid: ValidateAnonymousSignInSchema = true;

/**
 * Zod schema for OAuth sign in request validation
 */
export const OAuthSignInRequestSchema = z.object({
	provider: z.enum(['google', 'github'])
});

/**
 * Type assertion: Zod schema must match TypeScript interface
 */
type ValidateOAuthSignInSchema = z.infer<typeof OAuthSignInRequestSchema> extends OAuthSignInRequest
	? OAuthSignInRequest extends z.infer<typeof OAuthSignInRequestSchema>
		? true
		: false
	: false;

const oauthSignInSchemaValid: ValidateOAuthSignInSchema = true;

// Prevent unused variable warnings
export const _schemaValidations = {
	anonymousSignInSchemaValid,
	oauthSignInSchemaValid
};

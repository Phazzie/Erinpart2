/**
 * Vibe/Theme System Contracts
 *
 * This module defines all contracts for the vibe/theme system seams.
 * Vibes control the visual appearance and color scheme of sessions.
 *
 * @module contracts/vibe
 */

import { z } from 'zod';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Color scheme configuration for a vibe
 * @requirement @VIBE-001
 */
export interface VibeColorScheme {
	/**
	 * Primary color (hex format)
	 * @example "#ff00ff"
	 * @validation Must be valid hex color
	 */
	primary: string;

	/**
	 * Secondary color (hex format)
	 * @example "#00ffff"
	 * @validation Must be valid hex color
	 */
	secondary: string;

	/**
	 * Accent color (hex format)
	 * @example "#ffff00"
	 * @validation Must be valid hex color
	 */
	accent: string;

	/**
	 * Background color (hex format)
	 * @example "#000000"
	 * @validation Must be valid hex color
	 */
	background: string;
}

/**
 * Vibe configuration for a session
 * Stored in sessions.day_vibe column as JSON
 * @requirement @VIBE-001
 */
export interface VibeConfig {
	/**
	 * Unique identifier for the vibe
	 * @example "chaos-gremlin"
	 */
	id: string;

	/**
	 * Color scheme for this vibe
	 */
	colorScheme: VibeColorScheme;
}

/**
 * Complete vibe entity with metadata
 * @requirement @VIBE-001
 */
export interface Vibe {
	/**
	 * Unique identifier for the vibe
	 * @example "chaos-gremlin"
	 */
	id: string;

	/**
	 * Display name of the vibe
	 * @example "Chaos Gremlin"
	 */
	name: string;

	/**
	 * Description of the vibe's aesthetic
	 * @example "Neon pink/purple with high energy vibes"
	 */
	description: string;

	/**
	 * Color scheme for this vibe
	 */
	colorScheme: VibeColorScheme;

	/**
	 * Optional preview image URL
	 * @example "/images/vibes/chaos-gremlin.png"
	 */
	previewImage?: string;
}

// ============================================================================
// SEAM-VIBE-001: GET AVAILABLE VIBES
// ============================================================================

/**
 * @seam SEAM-VIBE-001
 * @description Get list of all available predefined vibes
 * @requirement @VIBE-001
 * @boundary UI Component ↔ Vibe Repository
 */

/**
 * Request for getting available vibes
 * @requirement @VIBE-001
 */
export type GetAvailableVibesRequest = void;

/**
 * Success response for getting available vibes
 * @requirement @VIBE-001
 */
export interface GetAvailableVibesSuccessResponse {
	/**
	 * Array of all available vibes
	 * Contains predefined themes: Chaos Gremlin, Zen Master, Productivity Beast, Default Dark
	 */
	vibes: Vibe[];
}

/**
 * No error response for getting available vibes
 * This seam always succeeds as it returns static data
 * @requirement @VIBE-001
 */
// No error type - this seam cannot fail (static data)

/**
 * UI state for getting available vibes
 * Only 'loaded' state as this is synchronous static data
 * @requirement @UX-002
 */
export type GetAvailableVibesState = 'loaded';

// ============================================================================
// SEAM-VIBE-002: SET SESSION VIBE
// ============================================================================

/**
 * @seam SEAM-VIBE-002
 * @description Set the vibe/theme for a session
 * @requirement @VIBE-001
 * @boundary UI Component ↔ Vibe Repository
 */

/**
 * Request for setting a session's vibe
 * @requirement @VIBE-001
 */
export interface SetSessionVibeRequest {
	/**
	 * ID of the session to update
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 * @validation Must be valid UUID
	 */
	sessionId: string;

	/**
	 * Vibe configuration to apply
	 * @requirement @VIBE-001
	 */
	vibeConfig: VibeConfig;
}

/**
 * Success response for setting a session's vibe
 * @requirement @VIBE-001
 */
export interface SetSessionVibeSuccessResponse {
	/**
	 * Indicates the operation was successful
	 */
	success: true;

	/**
	 * The vibe configuration that was applied
	 */
	updatedVibe: VibeConfig;
}

/**
 * Error codes for setting session vibe
 * @requirement @UX-003
 */
export type SetSessionVibeErrorCode =
	| 'UNAUTHORIZED' // User is not session host
	| 'INVALID_VIBE' // Vibe ID doesn't exist or invalid color scheme
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for setting a session's vibe
 */
export interface SetSessionVibeErrorResponse {
	error: {
		/**
		 * Error code indicating what went wrong
		 */
		code: SetSessionVibeErrorCode;

		/**
		 * User-friendly error message
		 * @example "You must be the session host to change the vibe"
		 */
		message: string;

		/**
		 * Whether the operation can be retried
		 * - true for DATABASE_ERROR
		 * - false for UNAUTHORIZED, INVALID_VIBE
		 */
		retryable: boolean;
	};
}

/**
 * UI state for setting session vibe operation
 * @requirement @UX-002
 */
export type SetSessionVibeState = 'idle' | 'applying' | 'success' | 'error';

/**
 * Complete async state for setting session vibe
 */
export type SetSessionVibeAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'applying'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: VibeConfig; error: null; appliedAt: string }
	| {
			status: 'error';
			data: null;
			error: SetSessionVibeErrorResponse;
			failedAt: string;
	  };

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Vibe repository interface
 * MUST be implemented by both VibeMockRepository and VibeSupabaseRepository
 * @requirement @MAINT-001
 */
export interface IVibeRepository {
	/**
	 * Get all available predefined vibes
	 * @returns Array of available vibes (always succeeds)
	 * @throws Never throws - always returns data
	 */
	getAvailableVibes(): GetAvailableVibesSuccessResponse;

	/**
	 * Set the vibe/theme for a session
	 * @param request - Session ID and vibe configuration
	 * @returns Promise resolving to success or error response
	 * @throws Never throws - always returns typed response
	 */
	setSessionVibe(
		request: SetSessionVibeRequest
	): Promise<SetSessionVibeSuccessResponse | SetSessionVibeErrorResponse>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isSetSessionVibeError(
	response: SetSessionVibeSuccessResponse | SetSessionVibeErrorResponse
): response is SetSessionVibeErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if response is successful
 * @param response - Response to check
 * @returns True if response is successful
 */
export function isSetSessionVibeSuccess(
	response: SetSessionVibeSuccessResponse | SetSessionVibeErrorResponse
): response is SetSessionVibeSuccessResponse {
	return 'success' in response && response.success === true;
}

/**
 * Type guard to check if a value is a valid VibeColorScheme
 * @param value - Value to check
 * @returns True if value is a valid VibeColorScheme
 */
export function isVibeColorScheme(value: unknown): value is VibeColorScheme {
	if (typeof value !== 'object' || value === null) return false;
	const obj = value as Record<string, unknown>;
	return (
		typeof obj.primary === 'string' &&
		typeof obj.secondary === 'string' &&
		typeof obj.accent === 'string' &&
		typeof obj.background === 'string' &&
		/^#[0-9A-Fa-f]{6}$/.test(obj.primary) &&
		/^#[0-9A-Fa-f]{6}$/.test(obj.secondary) &&
		/^#[0-9A-Fa-f]{6}$/.test(obj.accent) &&
		/^#[0-9A-Fa-f]{6}$/.test(obj.background)
	);
}

/**
 * Type guard to check if a value is a valid VibeConfig
 * @param value - Value to check
 * @returns True if value is a valid VibeConfig
 */
export function isVibeConfig(value: unknown): value is VibeConfig {
	if (typeof value !== 'object' || value === null) return false;
	const obj = value as Record<string, unknown>;
	return typeof obj.id === 'string' && isVibeColorScheme(obj.colorScheme);
}

/**
 * Type guard to check if a value is a valid Vibe
 * @param value - Value to check
 * @returns True if value is a valid Vibe
 */
export function isVibe(value: unknown): value is Vibe {
	if (typeof value !== 'object' || value === null) return false;
	const obj = value as Record<string, unknown>;
	return (
		typeof obj.id === 'string' &&
		typeof obj.name === 'string' &&
		typeof obj.description === 'string' &&
		isVibeColorScheme(obj.colorScheme) &&
		(obj.previewImage === undefined || typeof obj.previewImage === 'string')
	);
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

/**
 * Zod schema for hex color validation
 */
const hexColorSchema = z
	.string()
	.regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #ff00ff)');

/**
 * Zod schema for VibeColorScheme validation
 * Ensures runtime type safety matches compile-time types
 */
export const VibeColorSchemeSchema = z.object({
	primary: hexColorSchema,
	secondary: hexColorSchema,
	accent: hexColorSchema,
	background: hexColorSchema
});

/**
 * Zod schema for VibeConfig validation
 */
export const VibeConfigSchema = z.object({
	id: z.string().min(1),
	colorScheme: VibeColorSchemeSchema
});

/**
 * Zod schema for Vibe validation
 */
export const VibeSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1).max(100),
	description: z.string().min(1).max(500),
	colorScheme: VibeColorSchemeSchema,
	previewImage: z.string().url().optional()
});

/**
 * Zod schema for SetSessionVibeRequest validation
 */
export const SetSessionVibeRequestSchema = z.object({
	sessionId: z.string().uuid('Session ID must be a valid UUID'),
	vibeConfig: VibeConfigSchema
});

// ============================================================================
// SCHEMA VALIDATION (COMPILE-TIME CHECKS)
// ============================================================================

/**
 * Type assertion: VibeColorScheme schema must match interface
 * This will cause a compile error if they diverge
 */
type ValidateVibeColorSchemeSchema = z.infer<typeof VibeColorSchemeSchema> extends VibeColorScheme
	? VibeColorScheme extends z.infer<typeof VibeColorSchemeSchema>
		? true
		: false
	: false;

const vibeColorSchemeSchemaValid: ValidateVibeColorSchemeSchema = true;

/**
 * Type assertion: VibeConfig schema must match interface
 */
type ValidateVibeConfigSchema = z.infer<typeof VibeConfigSchema> extends VibeConfig
	? VibeConfig extends z.infer<typeof VibeConfigSchema>
		? true
		: false
	: false;

const vibeConfigSchemaValid: ValidateVibeConfigSchema = true;

/**
 * Type assertion: SetSessionVibeRequest schema must match interface
 */
type ValidateSetSessionVibeRequestSchema = z.infer<
	typeof SetSessionVibeRequestSchema
> extends SetSessionVibeRequest
	? SetSessionVibeRequest extends z.infer<typeof SetSessionVibeRequestSchema>
		? true
		: false
	: false;

const setSessionVibeRequestSchemaValid: ValidateSetSessionVibeRequestSchema = true;

// Prevent unused variable warnings (these are compile-time checks only)
export const __schemaValidation = {
	vibeColorSchemeSchemaValid,
	vibeConfigSchemaValid,
	setSessionVibeRequestSchemaValid
};

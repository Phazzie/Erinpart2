/**
 * @fileoverview Task Choice Contracts - Defines all seams for task choice functionality
 * @seam SEAM-CHOICE-001, SEAM-CHOICE-002
 * @description User preferences for tasks (yes/no/maybe) and choice aggregation
 * @requirement @CHOICE-001, @CHOICE-002
 */

import { z } from 'zod';

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Valid choice values for task preferences
 * @requirement @CHOICE-001
 */
export type ChoiceValue = 'yes' | 'no' | 'maybe';

/**
 * Represents a single user's choice on a task
 * @requirement @CHOICE-001
 */
export interface Choice {
	/**
	 * Unique identifier for this choice
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * ID of the task this choice is for
	 * @example "660e8400-e29b-41d4-a716-446655440001"
	 */
	taskId: string;

	/**
	 * ID of the user who made this choice
	 * @example "770e8400-e29b-41d4-a716-446655440002"
	 */
	userId: string;

	/**
	 * Display name of the user who made this choice
	 * @example "cat-dolphin"
	 */
	userName: string;

	/**
	 * The user's choice value
	 * @requirement @CHOICE-001
	 */
	choice: ChoiceValue;

	/**
	 * ISO 8601 timestamp when choice was created
	 * @example "2025-11-11T10:30:00.000Z"
	 */
	createdAt: string;

	/**
	 * ISO 8601 timestamp when choice was last updated
	 * @example "2025-11-11T10:35:00.000Z"
	 */
	updatedAt: string;
}

/**
 * Aggregation of all choices for a task
 * @requirement @CHOICE-002
 */
export interface ChoiceAggregation {
	/**
	 * Count of 'yes' choices
	 * @minimum 0
	 */
	yes: number;

	/**
	 * Count of 'no' choices
	 * @minimum 0
	 */
	no: number;

	/**
	 * Count of 'maybe' choices
	 * @minimum 0
	 */
	maybe: number;

	/**
	 * Total number of choices
	 * @minimum 0
	 */
	total: number;
}

// ============================================================================
// SEAM-CHOICE-001: Get Task Choices
// ============================================================================

/**
 * @seam SEAM-CHOICE-001
 * @description Get all choices for a task with aggregation
 * @requirement @CHOICE-001, @CHOICE-002
 * @boundary UI Component ↔ Choice Service
 */

/**
 * Request to get all choices for a task
 * @requirement @CHOICE-001
 */
export interface GetTaskChoicesRequest {
	/**
	 * ID of the task to get choices for
	 * @validation Must be valid UUID
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	taskId: string;
}

/**
 * Success response for getting task choices
 * @requirement @CHOICE-001, @CHOICE-002
 */
export interface GetTaskChoicesSuccessResponse {
	/**
	 * Array of all choices for this task
	 */
	choices: Choice[];

	/**
	 * Aggregated choice counts
	 * @requirement @CHOICE-002
	 */
	aggregation: ChoiceAggregation;

	/**
	 * Current user's choice for this task, if any
	 * @requirement @CHOICE-002
	 */
	currentUserChoice: ChoiceValue | null;
}

/**
 * Error codes for getting task choices
 * @requirement @UX-003
 */
export type GetTaskChoicesErrorCode = 'TASK_NOT_FOUND' | 'DATABASE_ERROR';

/**
 * Error response for getting task choices
 */
export interface GetTaskChoicesErrorResponse {
	error: {
		code: GetTaskChoicesErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for get task choices operation
 * @requirement @UX-002
 */
export type GetTaskChoicesState = 'loading' | 'loaded' | 'error';

/**
 * Complete async state for get task choices
 */
export type GetTaskChoicesAsyncState =
	| { status: 'loading'; data: null; error: null; startedAt: string }
	| {
			status: 'loaded';
			data: GetTaskChoicesSuccessResponse;
			error: null;
			loadedAt: string;
	  }
	| {
			status: 'error';
			data: null;
			error: GetTaskChoicesErrorResponse;
			failedAt: string;
	  };

// ============================================================================
// SEAM-CHOICE-002: Set Task Choice
// ============================================================================

/**
 * @seam SEAM-CHOICE-002
 * @description Set or update a user's choice for a task
 * @requirement @CHOICE-001
 * @boundary UI Component ↔ Choice Service
 */

/**
 * Request to set or update a task choice
 * @requirement @CHOICE-001
 */
export interface SetTaskChoiceRequest {
	/**
	 * ID of the task to set choice for
	 * @validation Must be valid UUID
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	taskId: string;

	/**
	 * ID of the user making the choice
	 * @validation Must be valid UUID
	 * @example "770e8400-e29b-41d4-a716-446655440002"
	 */
	userId: string;

	/**
	 * Display name of the user making the choice
	 * @validation 1-100 characters
	 * @example "cat-dolphin"
	 */
	userName: string;

	/**
	 * The choice value to set
	 * @validation Must be 'yes', 'no', or 'maybe'
	 * @requirement @CHOICE-001
	 */
	choice: ChoiceValue;
}

/**
 * Success response for setting task choice
 * @requirement @CHOICE-001, @CHOICE-002
 */
export interface SetTaskChoiceSuccessResponse {
	/**
	 * The created or updated choice
	 */
	choice: Choice;

	/**
	 * Updated aggregation after this choice
	 * @requirement @CHOICE-002
	 */
	aggregation: ChoiceAggregation;
}

/**
 * Error codes for setting task choice
 * @requirement @UX-003
 */
export type SetTaskChoiceErrorCode = 'VALIDATION_ERROR' | 'TASK_NOT_FOUND' | 'DATABASE_ERROR';

/**
 * Error response for setting task choice
 */
export interface SetTaskChoiceErrorResponse {
	error: {
		code: SetTaskChoiceErrorCode;
		message: string;
		retryable: boolean;
		validationErrors?: {
			taskId?: string[];
			userId?: string[];
			userName?: string[];
			choice?: string[];
		};
	};
}

/**
 * UI state for set task choice operation
 * @requirement @UX-002
 */
export type SetTaskChoiceState = 'idle' | 'saving' | 'success' | 'error';

/**
 * Complete async state for set task choice
 */
export type SetTaskChoiceAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'saving'; data: null; error: null; startedAt: string }
	| {
			status: 'success';
			data: SetTaskChoiceSuccessResponse;
			error: null;
			savedAt: string;
	  }
	| {
			status: 'error';
			data: null;
			error: SetTaskChoiceErrorResponse;
			failedAt: string;
	  };

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Choice repository interface
 * MUST be implemented by both ChoiceMockRepository and ChoiceSupabaseRepository
 * @requirement @MAINT-001
 */
export interface IChoiceRepository {
	/**
	 * Get all choices for a task with aggregation
	 * @param request - Task ID to get choices for
	 * @returns Promise resolving to choices with aggregation or error
	 * @throws Never throws - always returns typed response
	 */
	getTaskChoices(
		request: GetTaskChoicesRequest
	): Promise<GetTaskChoicesSuccessResponse | GetTaskChoicesErrorResponse>;

	/**
	 * Set or update a user's choice for a task
	 * @param request - Choice data to set
	 * @returns Promise resolving to created/updated choice or error
	 * @throws Never throws - always returns typed response
	 */
	setTaskChoice(
		request: SetTaskChoiceRequest
	): Promise<SetTaskChoiceSuccessResponse | SetTaskChoiceErrorResponse>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if get choices response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isGetTaskChoicesError(
	response: GetTaskChoicesSuccessResponse | GetTaskChoicesErrorResponse
): response is GetTaskChoicesErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if get choices response is successful
 * @param response - Response to check
 * @returns True if response is successful
 */
export function isGetTaskChoicesSuccess(
	response: GetTaskChoicesSuccessResponse | GetTaskChoicesErrorResponse
): response is GetTaskChoicesSuccessResponse {
	return !isGetTaskChoicesError(response);
}

/**
 * Type guard to check if set choice response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isSetTaskChoiceError(
	response: SetTaskChoiceSuccessResponse | SetTaskChoiceErrorResponse
): response is SetTaskChoiceErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if set choice response is successful
 * @param response - Response to check
 * @returns True if response is successful
 */
export function isSetTaskChoiceSuccess(
	response: SetTaskChoiceSuccessResponse | SetTaskChoiceErrorResponse
): response is SetTaskChoiceSuccessResponse {
	return !isSetTaskChoiceError(response);
}

/**
 * Type guard to check if a value is a valid choice
 * @param value - Value to check
 * @returns True if value is a valid ChoiceValue
 */
export function isValidChoice(value: unknown): value is ChoiceValue {
	return value === 'yes' || value === 'no' || value === 'maybe';
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

/**
 * Zod schema for choice value validation
 */
export const ChoiceValueSchema = z.enum(['yes', 'no', 'maybe']);

/**
 * Zod schema for Choice entity validation
 */
export const ChoiceSchema = z.object({
	id: z.string().uuid(),
	taskId: z.string().uuid(),
	userId: z.string().uuid(),
	userName: z.string().min(1).max(100),
	choice: ChoiceValueSchema,
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime()
});

/**
 * Zod schema for ChoiceAggregation validation
 */
export const ChoiceAggregationSchema = z.object({
	yes: z.number().int().min(0),
	no: z.number().int().min(0),
	maybe: z.number().int().min(0),
	total: z.number().int().min(0)
});

/**
 * Zod schema for GetTaskChoicesRequest validation
 */
export const GetTaskChoicesRequestSchema = z.object({
	taskId: z.string().uuid()
});

/**
 * Zod schema for SetTaskChoiceRequest validation
 */
export const SetTaskChoiceRequestSchema = z.object({
	taskId: z.string().uuid(),
	userId: z.string().uuid(),
	userName: z.string().min(1).max(100),
	choice: ChoiceValueSchema
});

/**
 * Zod schema for GetTaskChoicesSuccessResponse validation
 */
export const GetTaskChoicesSuccessResponseSchema = z.object({
	choices: z.array(ChoiceSchema),
	aggregation: ChoiceAggregationSchema,
	currentUserChoice: ChoiceValueSchema.nullable()
});

/**
 * Zod schema for SetTaskChoiceSuccessResponse validation
 */
export const SetTaskChoiceSuccessResponseSchema = z.object({
	choice: ChoiceSchema,
	aggregation: ChoiceAggregationSchema
});

// ============================================================================
// COMPILE-TIME SCHEMA VALIDATION
// ============================================================================

/**
 * Type assertion: GetTaskChoicesRequest schema must match interface
 * This will cause a compile error if they diverge
 */
type ValidateGetTaskChoicesRequestSchema = z.infer<typeof GetTaskChoicesRequestSchema> extends GetTaskChoicesRequest
	? GetTaskChoicesRequest extends z.infer<typeof GetTaskChoicesRequestSchema>
		? true
		: false
	: false;

const getTaskChoicesRequestSchemaValid: ValidateGetTaskChoicesRequestSchema = true;

/**
 * Type assertion: SetTaskChoiceRequest schema must match interface
 * This will cause a compile error if they diverge
 */
type ValidateSetTaskChoiceRequestSchema = z.infer<typeof SetTaskChoiceRequestSchema> extends SetTaskChoiceRequest
	? SetTaskChoiceRequest extends z.infer<typeof SetTaskChoiceRequestSchema>
		? true
		: false
	: false;

const setTaskChoiceRequestSchemaValid: ValidateSetTaskChoiceRequestSchema = true;

/**
 * Type assertion: Choice schema must match interface
 * This will cause a compile error if they diverge
 */
type ValidateChoiceSchema = z.infer<typeof ChoiceSchema> extends Choice
	? Choice extends z.infer<typeof ChoiceSchema>
		? true
		: false
	: false;

const choiceSchemaValid: ValidateChoiceSchema = true;

/**
 * Type assertion: ChoiceAggregation schema must match interface
 * This will cause a compile error if they diverge
 */
type ValidateChoiceAggregationSchema = z.infer<typeof ChoiceAggregationSchema> extends ChoiceAggregation
	? ChoiceAggregation extends z.infer<typeof ChoiceAggregationSchema>
		? true
		: false
	: false;

const choiceAggregationSchemaValid: ValidateChoiceAggregationSchema = true;

// Prevent unused variable warnings
export const _schemaValidations = {
	getTaskChoicesRequestSchemaValid,
	setTaskChoiceRequestSchemaValid,
	choiceSchemaValid,
	choiceAggregationSchemaValid
};

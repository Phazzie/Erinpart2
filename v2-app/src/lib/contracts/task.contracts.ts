/**
 * Task Management Contracts
 *
 * Defines all seam contracts for task management operations including
 * creation, retrieval, updates, deletion, reordering, and secret task voting.
 *
 * @module task.contracts
 */

import { z } from 'zod';

// ============================================================================
// SHARED TYPES
// ============================================================================

/**
 * Day type for task scheduling
 * @requirement @TASK-001
 */
export type Day = 'today' | 'tomorrow';

/**
 * Represents a task entity
 * @requirement @TASK-001
 * @seam SEAM-TASK-001
 */
export interface Task {
	/**
	 * Unique task identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * Session this task belongs to
	 * @requirement @TASK-002
	 */
	sessionId: string;

	/**
	 * Task text content
	 * @requirement @TASK-002
	 * @validation 1-500 characters
	 */
	text: string;

	/**
	 * Whether task is marked complete
	 * @requirement @TASK-005
	 */
	isComplete: boolean;

	/**
	 * Timestamp when task was completed
	 * @requirement @TASK-005
	 */
	completedAt: string | null;

	/**
	 * Which day the task is scheduled for
	 * @requirement @TASK-002
	 */
	day: Day;

	/**
	 * Position in task list (for ordering)
	 * @requirement @TASK-006
	 */
	orderIndex: number;

	/**
	 * Whether task is secret (requires votes to reveal)
	 * @requirement @TASK-007
	 */
	isSecret: boolean;

	/**
	 * User IDs who voted to reveal this secret task
	 * @requirement @TASK-007
	 */
	votes: string[];

	/**
	 * Optional comments/notes on the task
	 * @requirement @TASK-008
	 * @validation 0-1000 characters if provided
	 */
	comments: string | null;

	/**
	 * ID of user who created the task
	 * @requirement @TASK-002
	 */
	createdBy: string;

	/**
	 * Display name of user who created the task
	 * @requirement @TASK-002
	 */
	createdByName: string;

	/**
	 * ISO 8601 timestamp when task was created
	 * @requirement @TASK-001
	 */
	createdAt: string;

	/**
	 * ISO 8601 timestamp when task was last updated
	 * @requirement @TASK-001
	 */
	updatedAt: string;

	/**
	 * Derived: True if current user is creator or session host
	 * @requirement @TASK-003
	 */
	canEdit: boolean;

	/**
	 * Derived: True if current user is creator or session host
	 * @requirement @TASK-004
	 */
	canDelete: boolean;
}

// ============================================================================
// SEAM-TASK-001: Get Tasks
// ============================================================================

/**
 * @seam SEAM-TASK-001
 * @description Get all tasks for a session with optional filtering
 * @requirement @TASK-001
 * @boundary TaskList Component ↔ Task Repository
 */

/**
 * Request data for getting tasks
 * @requirement @TASK-001
 */
export interface GetTasksRequest {
	/**
	 * Session ID to get tasks for
	 * @requirement @TASK-001
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	sessionId: string;

	/**
	 * Optional filter by day
	 * @requirement @TASK-001
	 */
	day?: Day;

	/**
	 * Whether to include completed tasks
	 * @requirement @TASK-001
	 * @default true
	 */
	includeCompleted?: boolean;
}

/**
 * Success response for getting tasks
 * @requirement @TASK-001
 */
export interface GetTasksSuccessResponse {
	/**
	 * Array of tasks matching the request criteria
	 */
	tasks: Task[];

	/**
	 * Total number of tasks (including those not returned)
	 */
	total: number;

	/**
	 * Whether there are more tasks available (for pagination)
	 */
	hasMore: boolean;
}

/**
 * Error codes for getting tasks
 * @requirement @UX-003
 */
export type GetTasksErrorCode =
	| 'SESSION_NOT_FOUND' // Session doesn't exist
	| 'UNAUTHORIZED' // User not authenticated or not session participant
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for getting tasks
 */
export interface GetTasksErrorResponse {
	error: {
		code: GetTasksErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for getting tasks operation
 * @requirement @UX-002
 */
export type GetTasksState = 'loading' | 'loaded' | 'error' | 'empty';

/**
 * Complete async state for getting tasks
 */
export type GetTasksAsyncState =
	| { status: 'loading'; data: null; error: null }
	| { status: 'loaded'; data: Task[]; error: null; loadedAt: string }
	| { status: 'empty'; data: []; error: null }
	| { status: 'error'; data: null; error: GetTasksErrorResponse; failedAt: string };

// ============================================================================
// SEAM-TASK-002: Create Task
// ============================================================================

/**
 * @seam SEAM-TASK-002
 * @description Create a new task in a session
 * @requirement @TASK-002
 * @boundary TaskForm Component ↔ Task Repository
 */

/**
 * Input data for creating a task
 * @requirement @TASK-002
 */
export interface CreateTaskRequest {
	/**
	 * Session ID where task will be created
	 * @requirement @TASK-002
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 * @validation Must be valid UUID
	 */
	sessionId: string;

	/**
	 * Task text content
	 * @requirement @TASK-002
	 * @example "Buy groceries for dinner"
	 * @validation 1-500 characters, trimmed
	 */
	text: string;

	/**
	 * Which day the task is for
	 * @requirement @TASK-002
	 * @validation Must be 'today' or 'tomorrow'
	 */
	day: Day;

	/**
	 * Whether task is secret (requires votes to reveal)
	 * @requirement @TASK-007
	 */
	isSecret: boolean;

	/**
	 * Optional comments/notes on the task
	 * @requirement @TASK-008
	 * @validation 0-1000 characters if provided
	 */
	comments?: string;

	/**
	 * ID of user creating the task
	 * @requirement @TASK-002
	 */
	createdBy: string;

	/**
	 * Display name of user creating the task
	 * @requirement @TASK-002
	 */
	createdByName: string;
}

/**
 * Success response for creating a task
 * @requirement @TASK-002
 */
export interface CreateTaskSuccessResponse {
	/**
	 * The newly created task
	 */
	task: Task;
}

/**
 * Error codes for task creation
 * @requirement @UX-003
 */
export type CreateTaskErrorCode =
	| 'VALIDATION_ERROR' // Invalid input data
	| 'UNAUTHORIZED' // User not authenticated or not session participant
	| 'DATABASE_ERROR' // Database operation failed
	| 'RATE_LIMIT_EXCEEDED'; // User created too many tasks too quickly

/**
 * Error response for task creation
 */
export interface CreateTaskErrorResponse {
	error: {
		code: CreateTaskErrorCode;
		message: string;
		retryable: boolean;
		validationErrors?: {
			text?: string[];
			day?: string[];
			comments?: string[];
		};
	};
}

/**
 * UI state for task creation operation
 * @requirement @UX-002
 */
export type CreateTaskState = 'idle' | 'creating' | 'success' | 'error';

/**
 * Complete async state for task creation
 */
export type CreateTaskAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'creating'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: Task; error: null; createdAt: string }
	| { status: 'error'; data: null; error: CreateTaskErrorResponse; failedAt: string };

// ============================================================================
// SEAM-TASK-003: Update Task
// ============================================================================

/**
 * @seam SEAM-TASK-003
 * @description Update an existing task
 * @requirement @TASK-003
 * @boundary TaskItem Component ↔ Task Repository
 */

/**
 * Request data for updating a task
 * @requirement @TASK-003
 */
export interface UpdateTaskRequest {
	/**
	 * ID of task to update
	 * @requirement @TASK-003
	 */
	taskId: string;

	/**
	 * Fields to update (partial update)
	 * @requirement @TASK-003
	 */
	updates: {
		/**
		 * Updated task text
		 * @validation 1-500 characters if provided
		 */
		text?: string;

		/**
		 * Updated day
		 */
		day?: Day;

		/**
		 * Updated secret status
		 */
		isSecret?: boolean;

		/**
		 * Updated completion status
		 */
		isComplete?: boolean;

		/**
		 * Updated comments
		 * @validation 0-1000 characters if provided
		 */
		comments?: string;
	};
}

/**
 * Success response for updating a task
 * @requirement @TASK-003
 */
export interface UpdateTaskSuccessResponse {
	/**
	 * The updated task with all fields
	 */
	task: Task;
}

/**
 * Error codes for task update
 * @requirement @UX-003
 */
export type UpdateTaskErrorCode =
	| 'VALIDATION_ERROR' // Invalid input data
	| 'UNAUTHORIZED' // User not creator or host
	| 'NOT_FOUND' // Task doesn't exist
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for task update
 */
export interface UpdateTaskErrorResponse {
	error: {
		code: UpdateTaskErrorCode;
		message: string;
		retryable: boolean;
		validationErrors?: Record<string, string[]>;
	};
}

/**
 * UI state for task update operation
 * @requirement @UX-002
 */
export type UpdateTaskState = 'idle' | 'updating' | 'success' | 'error';

/**
 * Complete async state for task update
 */
export type UpdateTaskAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'updating'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: Task; error: null; updatedAt: string }
	| { status: 'error'; data: null; error: UpdateTaskErrorResponse; failedAt: string };

// ============================================================================
// SEAM-TASK-004: Delete Task
// ============================================================================

/**
 * @seam SEAM-TASK-004
 * @description Delete a task
 * @requirement @TASK-004
 * @boundary TaskItem Component ↔ Task Repository
 */

/**
 * Request data for deleting a task
 * @requirement @TASK-004
 */
export interface DeleteTaskRequest {
	/**
	 * ID of task to delete
	 * @requirement @TASK-004
	 */
	taskId: string;
}

/**
 * Success response for deleting a task
 * @requirement @TASK-004
 */
export interface DeleteTaskSuccessResponse {
	/**
	 * Indicates successful deletion
	 */
	success: true;

	/**
	 * ID of the deleted task
	 */
	deletedId: string;
}

/**
 * Error codes for task deletion
 * @requirement @UX-003
 */
export type DeleteTaskErrorCode =
	| 'UNAUTHORIZED' // User not creator or host
	| 'NOT_FOUND' // Task doesn't exist
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for task deletion
 */
export interface DeleteTaskErrorResponse {
	error: {
		code: DeleteTaskErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for task deletion operation
 * @requirement @UX-002
 */
export type DeleteTaskState = 'idle' | 'deleting' | 'success' | 'error';

/**
 * Complete async state for task deletion
 */
export type DeleteTaskAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'deleting'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: { deletedId: string }; error: null; deletedAt: string }
	| { status: 'error'; data: null; error: DeleteTaskErrorResponse; failedAt: string };

// ============================================================================
// SEAM-TASK-005: Reorder Tasks
// ============================================================================

/**
 * @seam SEAM-TASK-005
 * @description Reorder tasks within a day
 * @requirement @TASK-006
 * @boundary TaskList Component ↔ Task Repository
 */

/**
 * Individual task ordering update
 */
export interface TaskOrderUpdate {
	/**
	 * ID of task to reorder
	 */
	taskId: string;

	/**
	 * New position in the list
	 */
	newOrderIndex: number;
}

/**
 * Request data for reordering tasks
 * @requirement @TASK-006
 */
export interface ReorderTasksRequest {
	/**
	 * Session ID containing the tasks
	 * @requirement @TASK-006
	 */
	sessionId: string;

	/**
	 * Day to reorder tasks within
	 * @requirement @TASK-006
	 */
	day: Day;

	/**
	 * Array of task reordering instructions
	 * @requirement @TASK-006
	 */
	taskOrdering: TaskOrderUpdate[];
}

/**
 * Task with updated order index
 */
export interface TaskOrderResult {
	/**
	 * Task ID
	 */
	id: string;

	/**
	 * New order index
	 */
	orderIndex: number;
}

/**
 * Success response for reordering tasks
 * @requirement @TASK-006
 */
export interface ReorderTasksSuccessResponse {
	/**
	 * Indicates successful reordering
	 */
	success: true;

	/**
	 * Array of tasks with their new order indices
	 */
	updatedTasks: TaskOrderResult[];
}

/**
 * Error codes for task reordering
 * @requirement @UX-003
 */
export type ReorderTasksErrorCode =
	| 'UNAUTHORIZED' // User not session participant
	| 'INVALID_ORDERING' // Invalid ordering data
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for task reordering
 */
export interface ReorderTasksErrorResponse {
	error: {
		code: ReorderTasksErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for task reordering operation
 * @requirement @UX-002
 */
export type ReorderTasksState = 'idle' | 'reordering' | 'success' | 'error';

/**
 * Complete async state for task reordering
 */
export type ReorderTasksAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'reordering'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: TaskOrderResult[]; error: null; reorderedAt: string }
	| { status: 'error'; data: null; error: ReorderTasksErrorResponse; failedAt: string };

// ============================================================================
// SEAM-TASK-006: Vote to Reveal Secret
// ============================================================================

/**
 * @seam SEAM-TASK-006
 * @description Vote to reveal a secret task
 * @requirement @TASK-007
 * @boundary SecretTask Component ↔ Task Repository
 */

/**
 * Request data for voting to reveal a secret task
 * @requirement @TASK-007
 */
export interface VoteToRevealRequest {
	/**
	 * ID of secret task to vote on
	 * @requirement @TASK-007
	 */
	taskId: string;

	/**
	 * ID of user voting
	 * @requirement @TASK-007
	 */
	userId: string;
}

/**
 * Partial task data returned after voting
 */
export interface RevealVoteResult {
	/**
	 * Task ID
	 */
	id: string;

	/**
	 * Updated array of user IDs who voted
	 */
	votes: string[];

	/**
	 * Whether task is now revealed (≥2 votes)
	 */
	isRevealed: boolean;

	/**
	 * Revealed text (only if isRevealed = true)
	 */
	revealedText?: string;
}

/**
 * Success response for voting to reveal
 * @requirement @TASK-007
 */
export interface VoteToRevealSuccessResponse {
	/**
	 * Updated task vote information
	 */
	task: RevealVoteResult;
}

/**
 * Error codes for voting to reveal
 * @requirement @UX-003
 */
export type VoteToRevealErrorCode =
	| 'UNAUTHORIZED' // User not session participant
	| 'NOT_SECRET_TASK' // Task is not marked as secret
	| 'ALREADY_VOTED' // User already voted on this task
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for voting to reveal
 */
export interface VoteToRevealErrorResponse {
	error: {
		code: VoteToRevealErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for voting operation
 * @requirement @UX-002
 */
export type VoteToRevealState = 'idle' | 'voting' | 'success' | 'error';

/**
 * Complete async state for voting to reveal
 */
export type VoteToRevealAsyncState =
	| { status: 'idle'; data: null; error: null }
	| { status: 'voting'; data: null; error: null; startedAt: string }
	| { status: 'success'; data: RevealVoteResult; error: null; votedAt: string }
	| { status: 'error'; data: null; error: VoteToRevealErrorResponse; failedAt: string };

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Task repository interface
 * This interface MUST be implemented by both TaskMockRepository and TaskSupabaseRepository
 * @requirement @MAINT-001
 */
export interface ITaskRepository {
	/**
	 * Get tasks for a session
	 * @param request - Task retrieval parameters
	 * @returns Promise resolving to tasks array or error
	 * @throws Never throws - always returns typed response
	 */
	getTasks(request: GetTasksRequest): Promise<GetTasksSuccessResponse | GetTasksErrorResponse>;

	/**
	 * Create a new task
	 * @param request - Task creation parameters
	 * @returns Promise resolving to created task or error
	 * @throws Never throws - always returns typed response
	 */
	createTask(
		request: CreateTaskRequest
	): Promise<CreateTaskSuccessResponse | CreateTaskErrorResponse>;

	/**
	 * Update an existing task
	 * @param request - Task update parameters
	 * @returns Promise resolving to updated task or error
	 * @throws Never throws - always returns typed response
	 */
	updateTask(
		request: UpdateTaskRequest
	): Promise<UpdateTaskSuccessResponse | UpdateTaskErrorResponse>;

	/**
	 * Delete a task
	 * @param request - Task deletion parameters
	 * @returns Promise resolving to success confirmation or error
	 * @throws Never throws - always returns typed response
	 */
	deleteTask(
		request: DeleteTaskRequest
	): Promise<DeleteTaskSuccessResponse | DeleteTaskErrorResponse>;

	/**
	 * Reorder tasks within a day
	 * @param request - Task reordering parameters
	 * @returns Promise resolving to updated order or error
	 * @throws Never throws - always returns typed response
	 */
	reorderTasks(
		request: ReorderTasksRequest
	): Promise<ReorderTasksSuccessResponse | ReorderTasksErrorResponse>;

	/**
	 * Vote to reveal a secret task
	 * @param request - Vote parameters
	 * @returns Promise resolving to vote result or error
	 * @throws Never throws - always returns typed response
	 */
	voteToReveal(
		request: VoteToRevealRequest
	): Promise<VoteToRevealSuccessResponse | VoteToRevealErrorResponse>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if GetTasks response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isGetTasksError(
	response: GetTasksSuccessResponse | GetTasksErrorResponse
): response is GetTasksErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if GetTasks response is successful
 */
export function isGetTasksSuccess(
	response: GetTasksSuccessResponse | GetTasksErrorResponse
): response is GetTasksSuccessResponse {
	return 'tasks' in response;
}

/**
 * Type guard to check if CreateTask response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isCreateTaskError(
	response: CreateTaskSuccessResponse | CreateTaskErrorResponse
): response is CreateTaskErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if CreateTask response is successful
 */
export function isCreateTaskSuccess(
	response: CreateTaskSuccessResponse | CreateTaskErrorResponse
): response is CreateTaskSuccessResponse {
	return 'task' in response;
}

/**
 * Type guard to check if UpdateTask response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isUpdateTaskError(
	response: UpdateTaskSuccessResponse | UpdateTaskErrorResponse
): response is UpdateTaskErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if UpdateTask response is successful
 */
export function isUpdateTaskSuccess(
	response: UpdateTaskSuccessResponse | UpdateTaskErrorResponse
): response is UpdateTaskSuccessResponse {
	return 'task' in response;
}

/**
 * Type guard to check if DeleteTask response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isDeleteTaskError(
	response: DeleteTaskSuccessResponse | DeleteTaskErrorResponse
): response is DeleteTaskErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if DeleteTask response is successful
 */
export function isDeleteTaskSuccess(
	response: DeleteTaskSuccessResponse | DeleteTaskErrorResponse
): response is DeleteTaskSuccessResponse {
	return 'success' in response;
}

/**
 * Type guard to check if ReorderTasks response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isReorderTasksError(
	response: ReorderTasksSuccessResponse | ReorderTasksErrorResponse
): response is ReorderTasksErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if ReorderTasks response is successful
 */
export function isReorderTasksSuccess(
	response: ReorderTasksSuccessResponse | ReorderTasksErrorResponse
): response is ReorderTasksSuccessResponse {
	return 'success' in response;
}

/**
 * Type guard to check if VoteToReveal response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function isVoteToRevealError(
	response: VoteToRevealSuccessResponse | VoteToRevealErrorResponse
): response is VoteToRevealErrorResponse {
	return 'error' in response;
}

/**
 * Type guard to check if VoteToReveal response is successful
 */
export function isVoteToRevealSuccess(
	response: VoteToRevealSuccessResponse | VoteToRevealErrorResponse
): response is VoteToRevealSuccessResponse {
	return 'task' in response;
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

/**
 * Zod schema for Day type
 */
export const DaySchema = z.enum(['today', 'tomorrow']);

/**
 * Zod schema for GetTasks request validation
 */
export const GetTasksRequestSchema = z.object({
	sessionId: z.string().uuid(),
	day: DaySchema.optional(),
	includeCompleted: z.boolean().optional()
});

/**
 * Zod schema for CreateTask request validation
 */
export const CreateTaskRequestSchema = z.object({
	sessionId: z.string().uuid(),
	text: z.string().min(1).max(500).trim(),
	day: DaySchema,
	isSecret: z.boolean(),
	comments: z.string().max(1000).trim().optional(),
	createdBy: z.string().uuid(),
	createdByName: z.string().min(1).max(100)
});

/**
 * Zod schema for UpdateTask request validation
 */
export const UpdateTaskRequestSchema = z.object({
	taskId: z.string().uuid(),
	updates: z.object({
		text: z.string().min(1).max(500).trim().optional(),
		day: DaySchema.optional(),
		isSecret: z.boolean().optional(),
		isComplete: z.boolean().optional(),
		comments: z.string().max(1000).trim().optional()
	})
});

/**
 * Zod schema for DeleteTask request validation
 */
export const DeleteTaskRequestSchema = z.object({
	taskId: z.string().uuid()
});

/**
 * Zod schema for TaskOrderUpdate validation
 */
export const TaskOrderUpdateSchema = z.object({
	taskId: z.string().uuid(),
	newOrderIndex: z.number().int().min(0)
});

/**
 * Zod schema for ReorderTasks request validation
 */
export const ReorderTasksRequestSchema = z.object({
	sessionId: z.string().uuid(),
	day: DaySchema,
	taskOrdering: z.array(TaskOrderUpdateSchema).min(1)
});

/**
 * Zod schema for VoteToReveal request validation
 */
export const VoteToRevealRequestSchema = z.object({
	taskId: z.string().uuid(),
	userId: z.string().uuid()
});

// ============================================================================
// COMPILE-TIME VALIDATION
// ============================================================================

/**
 * Type assertion: Zod schema must match TypeScript interface
 * This will cause a compile error if they diverge
 */
type ValidateGetTasksSchema = z.infer<typeof GetTasksRequestSchema> extends GetTasksRequest
	? GetTasksRequest extends z.infer<typeof GetTasksRequestSchema>
		? true
		: false
	: false;
const getTasksSchemaValid: ValidateGetTasksSchema = true;

type ValidateCreateTaskSchema = z.infer<typeof CreateTaskRequestSchema> extends CreateTaskRequest
	? CreateTaskRequest extends z.infer<typeof CreateTaskRequestSchema>
		? true
		: false
	: false;
const createTaskSchemaValid: ValidateCreateTaskSchema = true;

type ValidateUpdateTaskSchema = z.infer<typeof UpdateTaskRequestSchema> extends UpdateTaskRequest
	? UpdateTaskRequest extends z.infer<typeof UpdateTaskRequestSchema>
		? true
		: false
	: false;
const updateTaskSchemaValid: ValidateUpdateTaskSchema = true;

type ValidateDeleteTaskSchema = z.infer<typeof DeleteTaskRequestSchema> extends DeleteTaskRequest
	? DeleteTaskRequest extends z.infer<typeof DeleteTaskRequestSchema>
		? true
		: false
	: false;
const deleteTaskSchemaValid: ValidateDeleteTaskSchema = true;

type ValidateReorderTasksSchema = z.infer<
	typeof ReorderTasksRequestSchema
> extends ReorderTasksRequest
	? ReorderTasksRequest extends z.infer<typeof ReorderTasksRequestSchema>
		? true
		: false
	: false;
const reorderTasksSchemaValid: ValidateReorderTasksSchema = true;

type ValidateVoteToRevealSchema = z.infer<typeof VoteToRevealRequestSchema> extends VoteToRevealRequest
	? VoteToRevealRequest extends z.infer<typeof VoteToRevealRequestSchema>
		? true
		: false
	: false;
const voteToRevealSchemaValid: ValidateVoteToRevealSchema = true;

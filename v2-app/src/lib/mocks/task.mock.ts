/**
 * Task Management Mock Repository
 *
 * This file implements the ITaskRepository interface with deterministic mock data.
 * Used for UI development and testing before integrating with real Supabase backend.
 *
 * Features:
 * - 20 pre-defined tasks with realistic data
 * - In-memory ordering simulation
 * - Secret task voting logic (2+ votes to reveal)
 * - Day filtering (today vs tomorrow)
 * - Complete error scenario handling
 *
 * @module task.mock
 * @category Mocks
 */

import type {
	ITaskRepository,
	Task,
	GetTasksRequest,
	GetTasksSuccessResponse,
	GetTasksErrorResponse,
	CreateTaskRequest,
	CreateTaskSuccessResponse,
	CreateTaskErrorResponse,
	UpdateTaskRequest,
	UpdateTaskSuccessResponse,
	UpdateTaskErrorResponse,
	DeleteTaskRequest,
	DeleteTaskSuccessResponse,
	DeleteTaskErrorResponse,
	ReorderTasksRequest,
	ReorderTasksSuccessResponse,
	ReorderTasksErrorResponse,
	VoteToRevealRequest,
	VoteToRevealSuccessResponse,
	VoteToRevealErrorResponse,
	Day
} from '../contracts/task.contracts';

/**
 * Mock task repository implementing ITaskRepository interface
 * @implements {ITaskRepository}
 */
export class TaskMockRepository implements ITaskRepository {
	/**
	 * In-memory task storage
	 */
	private tasks: Task[] = [];

	/**
	 * Mock session IDs that exist in the system
	 */
	private validSessionIds: Set<string> = new Set([
		'550e8400-e29b-41d4-a716-446655440001', // Primary test session
		'550e8400-e29b-41d4-a716-446655440002', // Secondary test session
		'550e8400-e29b-41d4-a716-446655440003', // Empty session
		'770e8400-e29b-41d4-a716-446655440002' // Contract test session
	]);

	/**
	 * Mock user IDs for authorization checks
	 */
	private mockUsers = {
		host: '650e8400-e29b-41d4-a716-446655440011', // Session host
		alice: '650e8400-e29b-41d4-a716-446655440012',
		bob: '650e8400-e29b-41d4-a716-446655440013',
		charlie: '650e8400-e29b-41d4-a716-446655440014',
		diana: '650e8400-e29b-41d4-a716-446655440015'
	};

	/**
	 * Current user context for permission checks
	 * In a real app, this would come from auth context
	 */
	private currentUserId: string = this.mockUsers.alice;

	constructor() {
		this.initializeMockTasks();
	}

	/**
	 * Initialize 20 pre-defined mock tasks
	 */
	private initializeMockTasks(): void {
		const sessionId = '550e8400-e29b-41d4-a716-446655440001';
		const baseTime = new Date('2025-11-12T08:00:00.000Z').getTime();

		this.tasks = [
			// Contract test task
			{
				id: '880e8400-e29b-41d4-a716-446655440003',
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				text: 'Contract test task',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 0,
				isSecret: true,
				votes: [],
				comments: null,
				createdBy: this.mockUsers.alice,
				createdByName: 'Alice',
				createdAt: new Date(baseTime).toISOString(),
				updatedAt: new Date(baseTime).toISOString(),
				canEdit: true,
				canDelete: true
			},
			// TODAY TASKS (12 tasks)
			{
				id: '750e8400-e29b-41d4-a716-446655440001',
				sessionId,
				text: 'Buy groceries for dinner',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 0,
				isSecret: false,
				votes: [],
				comments: null,
				createdBy: this.mockUsers.alice,
				createdByName: 'Alice',
				createdAt: new Date(baseTime).toISOString(),
				updatedAt: new Date(baseTime).toISOString(),
				canEdit: true,
				canDelete: true
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440002',
				sessionId,
				text: 'Call dentist to schedule appointment',
				isComplete: true,
				completedAt: new Date(baseTime + 3600000).toISOString(), // 1 hour later
				day: 'today',
				orderIndex: 1,
				isSecret: false,
				votes: [],
				comments: 'Scheduled for next Tuesday',
				createdBy: this.mockUsers.bob,
				createdByName: 'Bob',
				createdAt: new Date(baseTime + 600000).toISOString(),
				updatedAt: new Date(baseTime + 3600000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440003',
				sessionId,
				text: 'This is a secret surprise party plan',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 2,
				isSecret: true,
				votes: [], // Not yet revealed (0 votes)
				comments: null,
				createdBy: this.mockUsers.charlie,
				createdByName: 'Charlie',
				createdAt: new Date(baseTime + 1200000).toISOString(),
				updatedAt: new Date(baseTime + 1200000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440004',
				sessionId,
				text: 'Pick up dry cleaning',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 3,
				isSecret: false,
				votes: [],
				comments: null,
				createdBy: this.mockUsers.alice,
				createdByName: 'Alice',
				createdAt: new Date(baseTime + 1800000).toISOString(),
				updatedAt: new Date(baseTime + 1800000).toISOString(),
				canEdit: true,
				canDelete: true
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440005',
				sessionId,
				text: 'Secret gift idea: buy concert tickets',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 4,
				isSecret: true,
				votes: [this.mockUsers.alice], // 1 vote - not revealed yet
				comments: null,
				createdBy: this.mockUsers.diana,
				createdByName: 'Diana',
				createdAt: new Date(baseTime + 2400000).toISOString(),
				updatedAt: new Date(baseTime + 2400000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440006',
				sessionId,
				text: 'Plan weekend getaway',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 5,
				isSecret: true,
				votes: [this.mockUsers.alice, this.mockUsers.bob], // 2 votes - REVEALED
				comments: 'Looking at beach resorts',
				createdBy: this.mockUsers.charlie,
				createdByName: 'Charlie',
				createdAt: new Date(baseTime + 3000000).toISOString(),
				updatedAt: new Date(baseTime + 3000000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440007',
				sessionId,
				text: 'Prepare presentation slides',
				isComplete: true,
				completedAt: new Date(baseTime + 4000000).toISOString(),
				day: 'today',
				orderIndex: 6,
				isSecret: false,
				votes: [],
				comments: null,
				createdBy: this.mockUsers.bob,
				createdByName: 'Bob',
				createdAt: new Date(baseTime + 3600000).toISOString(),
				updatedAt: new Date(baseTime + 4000000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440008',
				sessionId,
				text: 'Water the plants',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 7,
				isSecret: false,
				votes: [],
				comments: null,
				createdBy: this.mockUsers.alice,
				createdByName: 'Alice',
				createdAt: new Date(baseTime + 4200000).toISOString(),
				updatedAt: new Date(baseTime + 4200000).toISOString(),
				canEdit: true,
				canDelete: true
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440009',
				sessionId,
				text: 'Review budget spreadsheet',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 8,
				isSecret: false,
				votes: [],
				comments: 'Need to cut expenses by 10%',
				createdBy: this.mockUsers.diana,
				createdByName: 'Diana',
				createdAt: new Date(baseTime + 4800000).toISOString(),
				updatedAt: new Date(baseTime + 4800000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440010',
				sessionId,
				text: 'Order birthday cake',
				isComplete: true,
				completedAt: new Date(baseTime + 5500000).toISOString(),
				day: 'today',
				orderIndex: 9,
				isSecret: true,
				votes: [this.mockUsers.alice, this.mockUsers.bob, this.mockUsers.charlie], // 3 votes - REVEALED
				comments: 'Chocolate with vanilla frosting',
				createdBy: this.mockUsers.alice,
				createdByName: 'Alice',
				createdAt: new Date(baseTime + 5400000).toISOString(),
				updatedAt: new Date(baseTime + 5500000).toISOString(),
				canEdit: true,
				canDelete: true
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440011',
				sessionId,
				text: 'Send thank you cards',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 10,
				isSecret: false,
				votes: [],
				comments: null,
				createdBy: this.mockUsers.charlie,
				createdByName: 'Charlie',
				createdAt: new Date(baseTime + 6000000).toISOString(),
				updatedAt: new Date(baseTime + 6000000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440012',
				sessionId,
				text: 'Update resume',
				isComplete: false,
				completedAt: null,
				day: 'today',
				orderIndex: 11,
				isSecret: false,
				votes: [],
				comments: 'Add recent projects',
				createdBy: this.mockUsers.bob,
				createdByName: 'Bob',
				createdAt: new Date(baseTime + 6600000).toISOString(),
				updatedAt: new Date(baseTime + 6600000).toISOString(),
				canEdit: false,
				canDelete: false
			},

			// TOMORROW TASKS (8 tasks)
			{
				id: '750e8400-e29b-41d4-a716-446655440013',
				sessionId,
				text: 'Morning workout at gym',
				isComplete: false,
				completedAt: null,
				day: 'tomorrow',
				orderIndex: 0,
				isSecret: false,
				votes: [],
				comments: null,
				createdBy: this.mockUsers.alice,
				createdByName: 'Alice',
				createdAt: new Date(baseTime + 7200000).toISOString(),
				updatedAt: new Date(baseTime + 7200000).toISOString(),
				canEdit: true,
				canDelete: true
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440014',
				sessionId,
				text: 'Team meeting at 10am',
				isComplete: false,
				completedAt: null,
				day: 'tomorrow',
				orderIndex: 1,
				isSecret: false,
				votes: [],
				comments: 'Bring project updates',
				createdBy: this.mockUsers.bob,
				createdByName: 'Bob',
				createdAt: new Date(baseTime + 7800000).toISOString(),
				updatedAt: new Date(baseTime + 7800000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440015',
				sessionId,
				text: 'Secret anniversary dinner reservation',
				isComplete: false,
				completedAt: null,
				day: 'tomorrow',
				orderIndex: 2,
				isSecret: true,
				votes: [], // Not revealed
				comments: null,
				createdBy: this.mockUsers.charlie,
				createdByName: 'Charlie',
				createdAt: new Date(baseTime + 8400000).toISOString(),
				updatedAt: new Date(baseTime + 8400000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440016',
				sessionId,
				text: 'Lunch with Sarah',
				isComplete: false,
				completedAt: null,
				day: 'tomorrow',
				orderIndex: 3,
				isSecret: false,
				votes: [],
				comments: 'Italian restaurant downtown',
				createdBy: this.mockUsers.diana,
				createdByName: 'Diana',
				createdAt: new Date(baseTime + 9000000).toISOString(),
				updatedAt: new Date(baseTime + 9000000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440017',
				sessionId,
				text: 'Fix kitchen faucet',
				isComplete: false,
				completedAt: null,
				day: 'tomorrow',
				orderIndex: 4,
				isSecret: false,
				votes: [],
				comments: null,
				createdBy: this.mockUsers.alice,
				createdByName: 'Alice',
				createdAt: new Date(baseTime + 9600000).toISOString(),
				updatedAt: new Date(baseTime + 9600000).toISOString(),
				canEdit: true,
				canDelete: true
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440018',
				sessionId,
				text: 'Research vacation destinations',
				isComplete: false,
				completedAt: null,
				day: 'tomorrow',
				orderIndex: 5,
				isSecret: true,
				votes: [this.mockUsers.alice, this.mockUsers.diana], // 2 votes - REVEALED
				comments: 'Considering Japan or Iceland',
				createdBy: this.mockUsers.bob,
				createdByName: 'Bob',
				createdAt: new Date(baseTime + 10200000).toISOString(),
				updatedAt: new Date(baseTime + 10200000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440019',
				sessionId,
				text: 'Renew car insurance',
				isComplete: false,
				completedAt: null,
				day: 'tomorrow',
				orderIndex: 6,
				isSecret: false,
				votes: [],
				comments: 'Compare quotes from 3 providers',
				createdBy: this.mockUsers.charlie,
				createdByName: 'Charlie',
				createdAt: new Date(baseTime + 10800000).toISOString(),
				updatedAt: new Date(baseTime + 10800000).toISOString(),
				canEdit: false,
				canDelete: false
			},
			{
				id: '750e8400-e29b-41d4-a716-446655440020',
				sessionId,
				text: 'Read book chapter 5-7',
				isComplete: false,
				completedAt: null,
				day: 'tomorrow',
				orderIndex: 7,
				isSecret: false,
				votes: [],
				comments: null,
				createdBy: this.mockUsers.diana,
				createdByName: 'Diana',
				createdAt: new Date(baseTime + 11400000).toISOString(),
				updatedAt: new Date(baseTime + 11400000).toISOString(),
				canEdit: false,
				canDelete: false
			}
		];
	}

	/**
	 * Simulate network latency
	 */
	private async simulateLatency(ms: number = 200): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Simulate network errors (5% failure rate)
	 */
	private shouldSimulateNetworkError(): boolean {
		return Math.random() < 0.05;
	}

	/**
	 * Generate deterministic UUID
	 */
	private generateUUID(seed: string): string {
		let hash = 0;
		for (let i = 0; i < seed.length; i++) {
			hash = (hash << 5) - hash + seed.charCodeAt(i);
			hash = hash & hash;
		}
		const hashStr = Math.abs(hash).toString(16).padStart(12, '0');
		return `750e8400-e29b-41d4-a716-${hashStr.slice(0, 12)}`;
	}

	/**
	 * Check if user can edit/delete task
	 */
	private canModifyTask(task: Task): boolean {
		// User can modify if they are creator or session host
		return task.createdBy === this.currentUserId || this.currentUserId === this.mockUsers.host;
	}

	/**
	 * Get tasks for a session with optional filtering
	 */
	async getTasks(
		request: GetTasksRequest
	): Promise<GetTasksSuccessResponse | GetTasksErrorResponse> {
		await this.simulateLatency();

		// Simulate network error
		if (this.shouldSimulateNetworkError()) {
			return {
				error: {
					code: 'DATABASE_ERROR',
					message: 'Failed to retrieve tasks. Please try again.',
					retryable: true
				}
			};
		}

		// Check if session exists
		if (!this.validSessionIds.has(request.sessionId)) {
			return {
				error: {
					code: 'SESSION_NOT_FOUND',
					message: 'Session not found. Please check the session ID and try again.',
					retryable: false
				}
			};
		}

		// Filter tasks by session
		let filteredTasks = this.tasks.filter((task) => task.sessionId === request.sessionId);

		// Filter by day if specified
		if (request.day) {
			filteredTasks = filteredTasks.filter((task) => task.day === request.day);
		}

		// Filter by completion status (default: include completed)
		const includeCompleted = request.includeCompleted !== false;
		if (!includeCompleted) {
			filteredTasks = filteredTasks.filter((task) => !task.isComplete);
		}

		// Sort by orderIndex
		filteredTasks.sort((a, b) => a.orderIndex - b.orderIndex);

		// Update canEdit and canDelete based on current user
		const tasksWithPermissions = filteredTasks.map((task) => ({
			...task,
			canEdit: this.canModifyTask(task),
			canDelete: this.canModifyTask(task)
		}));

		return {
			tasks: tasksWithPermissions,
			total: tasksWithPermissions.length,
			hasMore: false // No pagination in mock
		};
	}

	/**
	 * Create a new task
	 */
	async createTask(
		request: CreateTaskRequest
	): Promise<CreateTaskSuccessResponse | CreateTaskErrorResponse> {
		await this.simulateLatency();

		// Simulate network error
		if (this.shouldSimulateNetworkError()) {
			return {
				error: {
					code: 'DATABASE_ERROR',
					message: 'Failed to create task. Please try again.',
					retryable: true
				}
			};
		}

		// Validate session exists
		if (!this.validSessionIds.has(request.sessionId)) {
			return {
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid session ID.',
					retryable: false
				}
			};
		}

		// Validate text length
		const trimmedText = request.text.trim();
		if (trimmedText.length === 0 || trimmedText.length > 500) {
			return {
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Task text must be between 1 and 500 characters.',
					retryable: false,
					validationErrors: {
						text: ['Text must be between 1 and 500 characters']
					}
				}
			};
		}

		// Validate comments length if provided
		if (request.comments && request.comments.length > 1000) {
			return {
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Comments must not exceed 1000 characters.',
					retryable: false,
					validationErrors: {
						comments: ['Comments must not exceed 1000 characters']
					}
				}
			};
		}

		// Find max orderIndex for the given day
		const tasksInDay = this.tasks.filter(
			(t) => t.sessionId === request.sessionId && t.day === request.day
		);
		const maxOrderIndex = tasksInDay.length > 0 ? Math.max(...tasksInDay.map((t) => t.orderIndex)) : -1;

		// Create new task
		const now = new Date().toISOString();
		const newTask: Task = {
			id: this.generateUUID(`${request.sessionId}-${trimmedText}-${now}`),
			sessionId: request.sessionId,
			text: trimmedText,
			isComplete: false,
			completedAt: null,
			day: request.day,
			orderIndex: maxOrderIndex + 1,
			isSecret: request.isSecret,
			votes: [],
			comments: request.comments || null,
			createdBy: request.createdBy,
			createdByName: request.createdByName,
			createdAt: now,
			updatedAt: now,
			canEdit: this.canModifyTask({ createdBy: request.createdBy } as Task),
			canDelete: this.canModifyTask({ createdBy: request.createdBy } as Task)
		};

		// Add to in-memory storage
		this.tasks.push(newTask);

		return {
			task: newTask
		};
	}

	/**
	 * Update an existing task
	 */
	async updateTask(
		request: UpdateTaskRequest
	): Promise<UpdateTaskSuccessResponse | UpdateTaskErrorResponse> {
		await this.simulateLatency();

		// Simulate network error
		if (this.shouldSimulateNetworkError()) {
			return {
				error: {
					code: 'DATABASE_ERROR',
					message: 'Failed to update task. Please try again.',
					retryable: true
				}
			};
		}

		// Find task
		const taskIndex = this.tasks.findIndex((t) => t.id === request.taskId);
		if (taskIndex === -1) {
			return {
				error: {
					code: 'NOT_FOUND',
					message: 'Task not found.',
					retryable: false
				}
			};
		}

		const task = this.tasks[taskIndex];

		// Check authorization
		if (!this.canModifyTask(task)) {
			return {
				error: {
					code: 'UNAUTHORIZED',
					message: 'You do not have permission to update this task.',
					retryable: false
				}
			};
		}

		// Validate text if provided
		if (request.updates.text !== undefined) {
			const trimmedText = request.updates.text.trim();
			if (trimmedText.length === 0 || trimmedText.length > 500) {
				return {
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Task text must be between 1 and 500 characters.',
						retryable: false,
						validationErrors: {
							text: ['Text must be between 1 and 500 characters']
						}
					}
				};
			}
		}

		// Validate comments if provided
		if (request.updates.comments !== undefined && request.updates.comments.length > 1000) {
			return {
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Comments must not exceed 1000 characters.',
					retryable: false,
					validationErrors: {
						comments: ['Comments must not exceed 1000 characters']
					}
				}
			};
		}

		// Apply updates
		const updatedTask: Task = {
			...task,
			text: request.updates.text?.trim() ?? task.text,
			day: request.updates.day ?? task.day,
			isSecret: request.updates.isSecret ?? task.isSecret,
			isComplete: request.updates.isComplete ?? task.isComplete,
			comments: request.updates.comments ?? task.comments,
			completedAt:
				request.updates.isComplete === true && !task.isComplete
					? new Date().toISOString()
					: request.updates.isComplete === false
						? null
						: task.completedAt,
			updatedAt: new Date().toISOString(),
			canEdit: this.canModifyTask(task),
			canDelete: this.canModifyTask(task)
		};

		// Update in storage
		this.tasks[taskIndex] = updatedTask;

		return {
			task: updatedTask
		};
	}

	/**
	 * Delete a task
	 */
	async deleteTask(
		request: DeleteTaskRequest
	): Promise<DeleteTaskSuccessResponse | DeleteTaskErrorResponse> {
		await this.simulateLatency();

		// Simulate network error
		if (this.shouldSimulateNetworkError()) {
			return {
				error: {
					code: 'DATABASE_ERROR',
					message: 'Failed to delete task. Please try again.',
					retryable: true
				}
			};
		}

		// Find task
		const taskIndex = this.tasks.findIndex((t) => t.id === request.taskId);
		if (taskIndex === -1) {
			return {
				error: {
					code: 'NOT_FOUND',
					message: 'Task not found.',
					retryable: false
				}
			};
		}

		const task = this.tasks[taskIndex];

		// Check authorization
		if (!this.canModifyTask(task)) {
			return {
				error: {
					code: 'UNAUTHORIZED',
					message: 'You do not have permission to delete this task.',
					retryable: false
				}
			};
		}

		// Remove from storage
		this.tasks.splice(taskIndex, 1);

		return {
			success: true,
			deletedId: request.taskId
		};
	}

	/**
	 * Reorder tasks within a day
	 */
	async reorderTasks(
		request: ReorderTasksRequest
	): Promise<ReorderTasksSuccessResponse | ReorderTasksErrorResponse> {
		await this.simulateLatency();

		// Simulate network error
		if (this.shouldSimulateNetworkError()) {
			return {
				error: {
					code: 'DATABASE_ERROR',
					message: 'Failed to reorder tasks. Please try again.',
					retryable: true
				}
			};
		}

		// Validate task ordering array is not empty
		if (request.taskOrdering.length === 0) {
			return {
				error: {
					code: 'INVALID_ORDERING',
					message: 'Task ordering array cannot be empty.',
					retryable: false
				}
			};
		}

		// Update order indices for specified tasks
		const updatedTasks = [];
		for (const orderUpdate of request.taskOrdering) {
			const taskIndex = this.tasks.findIndex((t) => t.id === orderUpdate.taskId);
			if (taskIndex !== -1) {
				const task = this.tasks[taskIndex];
				// Verify task belongs to the specified session and day
				if (task.sessionId === request.sessionId && task.day === request.day) {
					this.tasks[taskIndex] = {
						...task,
						orderIndex: orderUpdate.newOrderIndex,
						updatedAt: new Date().toISOString()
					};
					updatedTasks.push({
						id: orderUpdate.taskId,
						orderIndex: orderUpdate.newOrderIndex
					});
				}
			}
		}

		return {
			success: true,
			updatedTasks
		};
	}

	/**
	 * Vote to reveal a secret task
	 */
	async voteToReveal(
		request: VoteToRevealRequest
	): Promise<VoteToRevealSuccessResponse | VoteToRevealErrorResponse> {
		await this.simulateLatency();

		// Simulate network error
		if (this.shouldSimulateNetworkError()) {
			return {
				error: {
					code: 'DATABASE_ERROR',
					message: 'Failed to register vote. Please try again.',
					retryable: true
				}
			};
		}

		// Find task
		const taskIndex = this.tasks.findIndex((t) => t.id === request.taskId);
		if (taskIndex === -1) {
			return {
				error: {
					code: 'UNAUTHORIZED',
					message: 'Task not found.',
					retryable: false
				}
			};
		}

		const task = this.tasks[taskIndex];

		// Check if task is secret
		if (!task.isSecret) {
			return {
				error: {
					code: 'NOT_SECRET_TASK',
					message: 'This task is not marked as secret.',
					retryable: false
				}
			};
		}

		// Check if user already voted
		if (task.votes.includes(request.userId)) {
			return {
				error: {
					code: 'ALREADY_VOTED',
					message: 'You have already voted to reveal this task.',
					retryable: false
				}
			};
		}

		// Add vote
		const updatedVotes = [...task.votes, request.userId];
		const isRevealed = updatedVotes.length >= 2; // Requires 2+ votes to reveal

		// Update task
		this.tasks[taskIndex] = {
			...task,
			votes: updatedVotes,
			updatedAt: new Date().toISOString()
		};

		// Return vote result
		return {
			task: {
				id: task.id,
				votes: updatedVotes,
				isRevealed,
				revealedText: isRevealed ? task.text : undefined
			}
		};
	}

	/**
	 * Helper method for testing: Reset mock state
	 * This is not part of the ITaskRepository interface but useful for tests
	 */
	reset(): void {
		this.initializeMockTasks();
	}

	/**
	 * Helper method for testing: Set current user context
	 * This is not part of the ITaskRepository interface but useful for tests
	 */
	setCurrentUser(userId: string): void {
		this.currentUserId = userId;
	}

	/**
	 * Helper method for testing: Add a valid session ID
	 * This is not part of the ITaskRepository interface but useful for tests
	 */
	addValidSession(sessionId: string): void {
		this.validSessionIds.add(sessionId);
	}

	/**
	 * Helper method for testing: Get all tasks (bypass filtering)
	 * This is not part of the ITaskRepository interface but useful for tests
	 */
	getAllTasks(): Task[] {
		return [...this.tasks];
	}
}

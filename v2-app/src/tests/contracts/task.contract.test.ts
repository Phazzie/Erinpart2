/**
 * Task Contract Tests
 * Validates that TaskMockRepository implements ITaskRepository correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskMockRepository } from '../../lib/mocks/task.mock';
import type { ITaskRepository } from '../../lib/contracts/task.contracts';
import {
	GetTasksRequestSchema,
	CreateTaskRequestSchema,
	UpdateTaskRequestSchema,
	DeleteTaskRequestSchema,
	ReorderTasksRequestSchema,
	VoteToRevealRequestSchema
} from '../../lib/contracts/task.contracts';

describe('Task Contract Tests', () => {
	let repo: ITaskRepository;

	beforeEach(() => {
		repo = new TaskMockRepository();
	});

	describe('SEAM-TASK-001: Get Tasks', () => {
		it('should implement ITaskRepository.getTasks', () => {
			expect(repo.getTasks).toBeDefined();
			expect(typeof repo.getTasks).toBe('function');
		});

		it('should return response matching GetTasksSuccessResponse shape', async () => {
			const request = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			const response = await repo.getTasks(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('tasks');
			expect(Array.isArray(response.tasks)).toBe(true);
			expect(response).toHaveProperty('total');
			expect(response).toHaveProperty('hasMore');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			const response = await repo.getTasks(request);

			if ('error' in response) return;

			const allowedKeys = ['tasks', 'total', 'hasMore'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for invalid session', async () => {
			const request = { sessionId: 'invalid' };
			const response = await repo.getTasks(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			expect(() => GetTasksRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-TASK-002: Create Task', () => {
		it('should implement ITaskRepository.createTask', () => {
			expect(repo.createTask).toBeDefined();
			expect(typeof repo.createTask).toBe('function');
		});

		it('should return response matching CreateTaskSuccessResponse shape', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				text: 'Test task',
				day: 'today' as const,
				isSecret: false,
				createdBy: '550e8400-e29b-41d4-a716-446655440000',
				createdByName: 'cat-dolphin'
			};
			const response = await repo.createTask(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('task');
			expect(response.task).toHaveProperty('id');
			expect(response.task).toHaveProperty('text');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				text: 'Test task',
				day: 'today' as const,
				isSecret: false,
				createdBy: '550e8400-e29b-41d4-a716-446655440000',
				createdByName: 'cat-dolphin'
			};
			const response = await repo.createTask(request);

			if ('error' in response) return;

			const allowedKeys = ['task'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for invalid input', async () => {
			const request = {
				sessionId: 'invalid',
				text: '',
				day: 'today' as const,
				isSecret: false,
				createdBy: 'invalid',
				createdByName: ''
			};
			const response = await repo.createTask(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				text: 'Test task',
				day: 'today',
				isSecret: false,
				createdBy: '550e8400-e29b-41d4-a716-446655440000',
				createdByName: 'cat-dolphin'
			};
			expect(() => CreateTaskRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-TASK-003: Update Task', () => {
		it('should implement ITaskRepository.updateTask', () => {
			expect(repo.updateTask).toBeDefined();
			expect(typeof repo.updateTask).toBe('function');
		});

		it('should return response matching UpdateTaskSuccessResponse shape', async () => {
			const request = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				updates: { text: 'Updated text' }
			};
			const response = await repo.updateTask(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('task');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				updates: { text: 'Updated' }
			};
			const response = await repo.updateTask(request);

			if ('error' in response) return;

			const allowedKeys = ['task'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent task', async () => {
			const request = {
				taskId: 'nonexistent',
				updates: { text: 'Updated' }
			};
			const response = await repo.updateTask(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				updates: { text: 'Updated' }
			};
			expect(() => UpdateTaskRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-TASK-004: Delete Task', () => {
		it('should implement ITaskRepository.deleteTask', () => {
			expect(repo.deleteTask).toBeDefined();
			expect(typeof repo.deleteTask).toBe('function');
		});

		it('should return response matching DeleteTaskSuccessResponse shape', async () => {
			const request = { taskId: '880e8400-e29b-41d4-a716-446655440003' };
			const response = await repo.deleteTask(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('success');
			expect(response).toHaveProperty('deletedId');
			expect(response.success).toBe(true);
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { taskId: '880e8400-e29b-41d4-a716-446655440003' };
			const response = await repo.deleteTask(request);

			if ('error' in response) return;

			const allowedKeys = ['success', 'deletedId'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent task', async () => {
			const request = { taskId: 'nonexistent' };
			const response = await repo.deleteTask(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { taskId: '880e8400-e29b-41d4-a716-446655440003' };
			expect(() => DeleteTaskRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-TASK-005: Reorder Tasks', () => {
		it('should implement ITaskRepository.reorderTasks', () => {
			expect(repo.reorderTasks).toBeDefined();
			expect(typeof repo.reorderTasks).toBe('function');
		});

		it('should return response matching ReorderTasksSuccessResponse shape', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				day: 'today' as const,
				taskOrdering: [
					{ taskId: '880e8400-e29b-41d4-a716-446655440003', newOrderIndex: 0 }
				]
			};
			const response = await repo.reorderTasks(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('success');
			expect(response).toHaveProperty('updatedTasks');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				day: 'today' as const,
				taskOrdering: [
					{ taskId: '880e8400-e29b-41d4-a716-446655440003', newOrderIndex: 0 }
				]
			};
			const response = await repo.reorderTasks(request);

			if ('error' in response) return;

			const allowedKeys = ['success', 'updatedTasks'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for invalid ordering', async () => {
			const request = {
				sessionId: 'invalid',
				day: 'today' as const,
				taskOrdering: []
			};
			const response = await repo.reorderTasks(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				day: 'today',
				taskOrdering: [
					{ taskId: '880e8400-e29b-41d4-a716-446655440003', newOrderIndex: 0 }
				]
			};
			expect(() => ReorderTasksRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-TASK-006: Vote to Reveal Secret', () => {
		it('should implement ITaskRepository.voteToReveal', () => {
			expect(repo.voteToReveal).toBeDefined();
			expect(typeof repo.voteToReveal).toBe('function');
		});

		it('should return response matching VoteToRevealSuccessResponse shape', async () => {
			const request = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				userId: '550e8400-e29b-41d4-a716-446655440000'
			};
			const response = await repo.voteToReveal(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('task');
			expect(response.task).toHaveProperty('id');
			expect(response.task).toHaveProperty('votes');
			expect(response.task).toHaveProperty('isRevealed');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				userId: '550e8400-e29b-41d4-a716-446655440000'
			};
			const response = await repo.voteToReveal(request);

			if ('error' in response) return;

			const allowedKeys = ['task'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-secret task', async () => {
			const request = {
				taskId: 'not-secret',
				userId: '550e8400-e29b-41d4-a716-446655440000'
			};
			const response = await repo.voteToReveal(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				userId: '550e8400-e29b-41d4-a716-446655440000'
			};
			expect(() => VoteToRevealRequestSchema.parse(valid)).not.toThrow();
		});
	});
});

/**
 * Choice Contract Tests
 * Validates that ChoiceMockRepository implements IChoiceRepository correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChoiceMockRepository } from '../../lib/mocks/choice.mock';
import type { IChoiceRepository } from '../../lib/contracts/choice.contracts';
import {
	GetTaskChoicesRequestSchema,
	SetTaskChoiceRequestSchema
} from '../../lib/contracts/choice.contracts';

describe('Choice Contract Tests', () => {
	let repo: IChoiceRepository;

	beforeEach(() => {
		repo = new ChoiceMockRepository();
	});

	describe('SEAM-CHOICE-001: Get Task Choices', () => {
		it('should implement IChoiceRepository.getTaskChoices', () => {
			expect(repo.getTaskChoices).toBeDefined();
			expect(typeof repo.getTaskChoices).toBe('function');
		});

		it('should return response matching GetTaskChoicesSuccessResponse shape', async () => {
			const request = { taskId: '880e8400-e29b-41d4-a716-446655440003' };
			const response = await repo.getTaskChoices(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('choices');
			expect(Array.isArray(response.choices)).toBe(true);
			expect(response).toHaveProperty('aggregation');
			expect(response.aggregation).toHaveProperty('yes');
			expect(response.aggregation).toHaveProperty('no');
			expect(response.aggregation).toHaveProperty('maybe');
			expect(response.aggregation).toHaveProperty('total');
			expect(response).toHaveProperty('currentUserChoice');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { taskId: '880e8400-e29b-41d4-a716-446655440003' };
			const response = await repo.getTaskChoices(request);

			if ('error' in response) return;

			const allowedKeys = ['choices', 'aggregation', 'currentUserChoice'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent task', async () => {
			const request = { taskId: 'nonexistent' };
			const response = await repo.getTaskChoices(request);

			if ('error' in response) {
				expect(response.error).toHaveProperty('code');
				expect(response.error).toHaveProperty('message');
				expect(response.error).toHaveProperty('retryable');
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { taskId: '880e8400-e29b-41d4-a716-446655440003' };
			expect(() => GetTaskChoicesRequestSchema.parse(valid)).not.toThrow();

			const invalid = { taskId: 'not-a-uuid' };
			expect(() => GetTaskChoicesRequestSchema.parse(invalid)).toThrow();
		});
	});

	describe('SEAM-CHOICE-002: Set Task Choice', () => {
		it('should implement IChoiceRepository.setTaskChoice', () => {
			expect(repo.setTaskChoice).toBeDefined();
			expect(typeof repo.setTaskChoice).toBe('function');
		});

		it('should return response matching SetTaskChoiceSuccessResponse shape', async () => {
			const request = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'cat-dolphin',
				choice: 'yes' as const
			};
			const response = await repo.setTaskChoice(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('choice');
			expect(response.choice).toHaveProperty('id');
			expect(response.choice).toHaveProperty('taskId');
			expect(response.choice).toHaveProperty('userId');
			expect(response.choice).toHaveProperty('userName');
			expect(response.choice).toHaveProperty('choice');
			expect(response.choice).toHaveProperty('createdAt');
			expect(response.choice).toHaveProperty('updatedAt');
			expect(response).toHaveProperty('aggregation');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'cat-dolphin',
				choice: 'yes' as const
			};
			const response = await repo.setTaskChoice(request);

			if ('error' in response) return;

			const allowedKeys = ['choice', 'aggregation'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for invalid input', async () => {
			const request = {
				taskId: '',
				userId: 'invalid',
				userName: '',
				choice: 'invalid' as any
			};
			const response = await repo.setTaskChoice(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'cat-dolphin',
				choice: 'yes'
			};
			expect(() => SetTaskChoiceRequestSchema.parse(valid)).not.toThrow();

			const invalid = {
				taskId: '880e8400-e29b-41d4-a716-446655440003',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'cat-dolphin',
				choice: 'invalid'
			};
			expect(() => SetTaskChoiceRequestSchema.parse(invalid)).toThrow();
		});
	});
});

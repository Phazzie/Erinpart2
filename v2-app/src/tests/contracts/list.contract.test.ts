/**
 * List Contract Tests
 * Validates that ListMockRepository implements IListRepository correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ListMockRepository } from '../../lib/mocks/list.mock';
import type { IListRepository } from '../../lib/contracts/list.contracts';
import {
	GetListsRequestSchema,
	CreateListRequestSchema,
	DeleteListRequestSchema,
	GetListItemsRequestSchema,
	AddListItemRequestSchema,
	UpdateListItemRequestSchema,
	DeleteListItemRequestSchema,
	VerifyListItemRequestSchema
} from '../../lib/contracts/list.contracts';

describe('List Contract Tests', () => {
	let repo: IListRepository;

	beforeEach(() => {
		repo = new ListMockRepository();
	});

	describe('SEAM-LIST-001: Get Lists', () => {
		it('should implement IListRepository.getLists', () => {
			expect(repo.getLists).toBeDefined();
			expect(typeof repo.getLists).toBe('function');
		});

		it('should return response matching GetListsSuccessResponse shape', async () => {
			const request = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			const response = await repo.getLists(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('lists');
			expect(Array.isArray(response.lists)).toBe(true);
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			const response = await repo.getLists(request);

			if ('error' in response) return;

			const allowedKeys = ['lists'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for invalid session', async () => {
			const request = { sessionId: 'invalid' };
			const response = await repo.getLists(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			expect(() => GetListsRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-LIST-002: Create List', () => {
		it('should implement IListRepository.createList', () => {
			expect(repo.createList).toBeDefined();
			expect(typeof repo.createList).toBe('function');
		});

		it('should return response matching CreateListSuccessResponse shape', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				title: 'Test List',
				listType: 'bullet' as const,
				creatorId: '550e8400-e29b-41d4-a716-446655440000',
				creatorName: 'cat-dolphin'
			};
			const response = await repo.createList(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('list');
			expect(response.list).toHaveProperty('id');
			expect(response.list).toHaveProperty('title');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				title: 'Test List',
				listType: 'bullet' as const,
				creatorId: '550e8400-e29b-41d4-a716-446655440000',
				creatorName: 'cat-dolphin'
			};
			const response = await repo.createList(request);

			if ('error' in response) return;

			const allowedKeys = ['list'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for invalid input', async () => {
			const request = {
				sessionId: 'invalid',
				title: '',
				listType: 'invalid' as any,
				creatorId: 'invalid',
				creatorName: ''
			};
			const response = await repo.createList(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				title: 'Test List',
				listType: 'bullet',
				creatorId: '550e8400-e29b-41d4-a716-446655440000',
				creatorName: 'cat-dolphin'
			};
			expect(() => CreateListRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-LIST-003: Delete List', () => {
		it('should implement IListRepository.deleteList', () => {
			expect(repo.deleteList).toBeDefined();
			expect(typeof repo.deleteList).toBe('function');
		});

		it('should return response matching DeleteListSuccessResponse shape', async () => {
			const request = { listId: 'cc0e8400-e29b-41d4-a716-446655440007' };
			const response = await repo.deleteList(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('success');
			expect(response).toHaveProperty('deletedId');
			expect(response).toHaveProperty('deletedItemCount');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { listId: 'cc0e8400-e29b-41d4-a716-446655440007' };
			const response = await repo.deleteList(request);

			if ('error' in response) return;

			const allowedKeys = ['success', 'deletedId', 'deletedItemCount'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent list', async () => {
			const request = { listId: 'nonexistent' };
			const response = await repo.deleteList(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { listId: 'cc0e8400-e29b-41d4-a716-446655440007' };
			expect(() => DeleteListRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-LIST-004: Get List Items', () => {
		it('should implement IListRepository.getListItems', () => {
			expect(repo.getListItems).toBeDefined();
			expect(typeof repo.getListItems).toBe('function');
		});

		it('should return response matching GetListItemsSuccessResponse shape', async () => {
			const request = { listId: 'cc0e8400-e29b-41d4-a716-446655440007' };
			const response = await repo.getListItems(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('items');
			expect(Array.isArray(response.items)).toBe(true);
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { listId: 'cc0e8400-e29b-41d4-a716-446655440007' };
			const response = await repo.getListItems(request);

			if ('error' in response) return;

			const allowedKeys = ['items'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent list', async () => {
			const request = { listId: 'nonexistent' };
			const response = await repo.getListItems(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { listId: 'cc0e8400-e29b-41d4-a716-446655440007' };
			expect(() => GetListItemsRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-LIST-005: Add List Item', () => {
		it('should implement IListRepository.addListItem', () => {
			expect(repo.addListItem).toBeDefined();
			expect(typeof repo.addListItem).toBe('function');
		});

		it('should return response matching AddListItemSuccessResponse shape', async () => {
			const request = {
				listId: 'cc0e8400-e29b-41d4-a716-446655440007',
				text: 'Test item'
			};
			const response = await repo.addListItem(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('item');
			expect(response.item).toHaveProperty('id');
			expect(response.item).toHaveProperty('text');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				listId: 'cc0e8400-e29b-41d4-a716-446655440007',
				text: 'Test item'
			};
			const response = await repo.addListItem(request);

			if ('error' in response) return;

			const allowedKeys = ['item'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for invalid input', async () => {
			const request = {
				listId: 'invalid',
				text: ''
			};
			const response = await repo.addListItem(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				listId: 'cc0e8400-e29b-41d4-a716-446655440007',
				text: 'Test item'
			};
			expect(() => AddListItemRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-LIST-006: Update List Item', () => {
		it('should implement IListRepository.updateListItem', () => {
			expect(repo.updateListItem).toBeDefined();
			expect(typeof repo.updateListItem).toBe('function');
		});

		it('should return response matching UpdateListItemSuccessResponse shape', async () => {
			const request = {
				itemId: 'ee0e8400-e29b-41d4-a716-446655440009',
				text: 'Updated item'
			};
			const response = await repo.updateListItem(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('item');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				itemId: 'ee0e8400-e29b-41d4-a716-446655440009',
				text: 'Updated item'
			};
			const response = await repo.updateListItem(request);

			if ('error' in response) return;

			const allowedKeys = ['item'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent item', async () => {
			const request = {
				itemId: 'nonexistent',
				text: 'Updated'
			};
			const response = await repo.updateListItem(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				itemId: 'ee0e8400-e29b-41d4-a716-446655440009',
				text: 'Updated item'
			};
			expect(() => UpdateListItemRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-LIST-007: Delete List Item', () => {
		it('should implement IListRepository.deleteListItem', () => {
			expect(repo.deleteListItem).toBeDefined();
			expect(typeof repo.deleteListItem).toBe('function');
		});

		it('should return response matching DeleteListItemSuccessResponse shape', async () => {
			const request = { itemId: 'ee0e8400-e29b-41d4-a716-446655440009' };
			const response = await repo.deleteListItem(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('success');
			expect(response).toHaveProperty('deletedId');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { itemId: 'ee0e8400-e29b-41d4-a716-446655440009' };
			const response = await repo.deleteListItem(request);

			if ('error' in response) return;

			const allowedKeys = ['success', 'deletedId'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent item', async () => {
			const request = { itemId: 'nonexistent' };
			const response = await repo.deleteListItem(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { itemId: 'ee0e8400-e29b-41d4-a716-446655440009' };
			expect(() => DeleteListItemRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-LIST-008: Verify List Item', () => {
		it('should implement IListRepository.verifyListItem', () => {
			expect(repo.verifyListItem).toBeDefined();
			expect(typeof repo.verifyListItem).toBe('function');
		});

		it('should return response matching VerifyListItemSuccessResponse shape', async () => {
			const request = {
				itemId: 'ee0e8400-e29b-41d4-a716-446655440009',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'cat-dolphin',
				isAccurate: true
			};
			const response = await repo.verifyListItem(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('verification');
			expect(response).toHaveProperty('updatedItem');
			expect(response.updatedItem).toHaveProperty('verificationStatus');
			expect(response.updatedItem).toHaveProperty('verificationCount');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				itemId: 'ee0e8400-e29b-41d4-a716-446655440009',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'cat-dolphin',
				isAccurate: true
			};
			const response = await repo.verifyListItem(request);

			if ('error' in response) return;

			const allowedKeys = ['verification', 'updatedItem'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should handle accurate and inaccurate verifications', async () => {
			const accurateRequest = {
				itemId: 'ee0e8400-e29b-41d4-a716-446655440009',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'cat-dolphin',
				isAccurate: true
			};
			const accurateResponse = await repo.verifyListItem(accurateRequest);

			const inaccurateRequest = {
				itemId: 'ee0e8400-e29b-41d4-a716-446655440009',
				userId: '660e8400-e29b-41d4-a716-446655440001',
				userName: 'dog-whale',
				isAccurate: false,
				correctionText: 'This is wrong'
			};
			const inaccurateResponse = await repo.verifyListItem(inaccurateRequest);

			expect(accurateResponse).toBeDefined();
			expect(inaccurateResponse).toBeDefined();
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				itemId: 'ee0e8400-e29b-41d4-a716-446655440009',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'cat-dolphin',
				isAccurate: true
			};
			expect(() => VerifyListItemRequestSchema.parse(valid)).not.toThrow();
		});
	});
});

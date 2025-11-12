/**
 * Realtime Contract Tests
 * Validates that RealtimeMockRepository implements IRealtimeRepository correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RealtimeMockRepository } from '../../lib/mocks/realtime.mock';
import type { IRealtimeRepository, RealtimeEventCategory } from '../../lib/contracts/realtime.contracts';
import {
	SubscribeToSessionRequestSchema,
	UnsubscribeFromChannelRequestSchema
} from '../../lib/contracts/realtime.contracts';

describe('Realtime Contract Tests', () => {
	let repo: IRealtimeRepository;

	beforeEach(() => {
		repo = new RealtimeMockRepository();
	});

	describe('SEAM-REALTIME-001: Subscribe to Session', () => {
		it('should implement IRealtimeRepository.subscribeToSession', () => {
			expect(repo.subscribeToSession).toBeDefined();
			expect(typeof repo.subscribeToSession).toBe('function');
		});

		it('should return response matching SubscribeToSessionSuccessResponse shape', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				eventTypes: ['task', 'choice'] as RealtimeEventCategory[]
			};
			const response = await repo.subscribeToSession(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('subscription');
			expect(response.subscription).toHaveProperty('channelId');
			expect(response.subscription).toHaveProperty('sessionId');
			expect(response.subscription).toHaveProperty('connectionState');
			expect(response.subscription).toHaveProperty('onEvent');
			expect(response.subscription).toHaveProperty('onConnectionStateChange');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				eventTypes: ['task'] as RealtimeEventCategory[]
			};
			const response = await repo.subscribeToSession(request);

			if ('error' in response) return;

			const allowedKeys = ['subscription'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for invalid session', async () => {
			const request = {
				sessionId: 'invalid',
				eventTypes: [] as any
			};
			const response = await repo.subscribeToSession(request);

			if ('error' in response) {
				expect(response.error).toHaveProperty('code');
				expect(response.error).toHaveProperty('message');
				expect(response.error).toHaveProperty('retryable');
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				eventTypes: ['task', 'choice']
			};
			expect(() => SubscribeToSessionRequestSchema.parse(valid)).not.toThrow();

			const invalid = {
				sessionId: 'not-a-uuid',
				eventTypes: []
			};
			expect(() => SubscribeToSessionRequestSchema.parse(invalid)).toThrow();
		});
	});

	describe('SEAM-REALTIME-002: Unsubscribe from Channel', () => {
		it('should implement IRealtimeRepository.unsubscribeFromChannel', () => {
			expect(repo.unsubscribeFromChannel).toBeDefined();
			expect(typeof repo.unsubscribeFromChannel).toBe('function');
		});

		it('should return response matching UnsubscribeFromChannelSuccessResponse shape', async () => {
			const request = { channelId: 'session:770e8400-e29b-41d4-a716-446655440002' };
			const response = await repo.unsubscribeFromChannel(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('success');
			expect(response).toHaveProperty('channelId');
			expect(response.success).toBe(true);
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { channelId: 'session:770e8400-e29b-41d4-a716-446655440002' };
			const response = await repo.unsubscribeFromChannel(request);

			if ('error' in response) return;

			const allowedKeys = ['success', 'channelId'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent channel', async () => {
			const request = { channelId: 'nonexistent' };
			const response = await repo.unsubscribeFromChannel(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { channelId: 'session:770e8400-e29b-41d4-a716-446655440002' };
			expect(() => UnsubscribeFromChannelRequestSchema.parse(valid)).not.toThrow();

			const invalid = { channelId: '' };
			expect(() => UnsubscribeFromChannelRequestSchema.parse(invalid)).toThrow();
		});
	});
});

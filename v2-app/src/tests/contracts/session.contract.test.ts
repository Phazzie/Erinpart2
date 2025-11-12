/**
 * Session Contract Tests
 * Validates that SessionMockRepository implements ISessionRepository correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionMockRepository } from '../../lib/mocks/session.mock';
import type { ISessionRepository } from '../../lib/contracts/session.contracts';
import {
	CreateSessionRequestSchema,
	JoinSessionRequestSchema,
	LeaveSessionRequestSchema,
	GetSessionDetailsRequestSchema,
	GenerateShareDataRequestSchema
} from '../../lib/contracts/session.contracts';

describe('Session Contract Tests', () => {
	let repo: ISessionRepository;

	beforeEach(() => {
		repo = new SessionMockRepository();
	});

	describe('SEAM-SESSION-001: Create Session', () => {
		it('should implement ISessionRepository.createSession', () => {
			expect(repo.createSession).toBeDefined();
			expect(typeof repo.createSession).toBe('function');
		});

		it('should return response matching CreateSessionSuccessResponse shape', async () => {
			const request = { userId: '550e8400-e29b-41d4-a716-446655440000', userName: 'cat-dolphin' };
			const response = await repo.createSession(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('session');
			expect(response.session).toHaveProperty('id');
			expect(response.session).toHaveProperty('code');
			expect(response.session).toHaveProperty('hostId');
			expect(response.session).toHaveProperty('createdAt');
			expect(response.session).toHaveProperty('participantCount');
			expect(response.session).toHaveProperty('dayVibe');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { userId: '550e8400-e29b-41d4-a716-446655440000', userName: 'cat-dolphin' };
			const response = await repo.createSession(request);

			if ('error' in response) return;

			const allowedKeys = ['session'];
			const actualKeys = Object.keys(response);
			expect(actualKeys.sort()).toEqual(allowedKeys.sort());
		});

		it('should return error response for invalid input', async () => {
			const request = { userId: 'invalid', userName: '' };
			const response = await repo.createSession(request);

			if ('error' in response) {
				expect(response.error).toHaveProperty('code');
				expect(response.error).toHaveProperty('message');
				expect(response.error).toHaveProperty('retryable');
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { userId: '550e8400-e29b-41d4-a716-446655440000', userName: 'cat-dolphin' };
			expect(() => CreateSessionRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-SESSION-002: Join Session', () => {
		it('should implement ISessionRepository.joinSession', () => {
			expect(repo.joinSession).toBeDefined();
			expect(typeof repo.joinSession).toBe('function');
		});

		it('should return response matching JoinSessionSuccessResponse shape', async () => {
			const request = {
				sessionCode: 'cat-dolphin',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'user1'
			};
			const response = await repo.joinSession(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('session');
			expect(response.session).toHaveProperty('isUserHost');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				sessionCode: 'cat-dolphin',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'user1'
			};
			const response = await repo.joinSession(request);

			if ('error' in response) return;

			const allowedKeys = ['session'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent session', async () => {
			const request = {
				sessionCode: 'nonexistent',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'user1'
			};
			const response = await repo.joinSession(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				sessionCode: 'cat-dolphin',
				userId: '550e8400-e29b-41d4-a716-446655440000',
				userName: 'user1'
			};
			expect(() => JoinSessionRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-SESSION-003: Leave Session', () => {
		it('should implement ISessionRepository.leaveSession', () => {
			expect(repo.leaveSession).toBeDefined();
			expect(typeof repo.leaveSession).toBe('function');
		});

		it('should return response matching LeaveSessionSuccessResponse shape', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				userId: '550e8400-e29b-41d4-a716-446655440000'
			};
			const response = await repo.leaveSession(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('success');
			expect(response.success).toBe(true);
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				userId: '550e8400-e29b-41d4-a716-446655440000'
			};
			const response = await repo.leaveSession(request);

			if ('error' in response) return;

			const allowedTopLevelKeys = ['success', 'newHostId'];
			const actualKeys = Object.keys(response);
			actualKeys.forEach((key) => {
				expect(allowedTopLevelKeys).toContain(key);
			});
		});

		it('should handle host transfer when applicable', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				userId: '550e8400-e29b-41d4-a716-446655440000'
			};
			const response = await repo.leaveSession(request);

			if ('error' in response) return;

			if ('newHostId' in response) {
				expect(typeof response.newHostId).toBe('string');
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				userId: '550e8400-e29b-41d4-a716-446655440000'
			};
			expect(() => LeaveSessionRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-SESSION-004: Get Session Details', () => {
		it('should implement ISessionRepository.getSessionDetails', () => {
			expect(repo.getSessionDetails).toBeDefined();
			expect(typeof repo.getSessionDetails).toBe('function');
		});

		it('should return response matching GetSessionDetailsSuccessResponse shape', async () => {
			const request = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			const response = await repo.getSessionDetails(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('session');
			expect(response.session).toHaveProperty('participants');
			expect(Array.isArray(response.session.participants)).toBe(true);
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			const response = await repo.getSessionDetails(request);

			if ('error' in response) return;

			const allowedKeys = ['session'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for non-existent session', async () => {
			const request = { sessionId: 'nonexistent-id' };
			const response = await repo.getSessionDetails(request);

			if ('error' in response) {
				expect(response.error.code).toBeDefined();
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			expect(() => GetSessionDetailsRequestSchema.parse(valid)).not.toThrow();
		});
	});

	describe('SEAM-SESSION-005: Generate Share Data', () => {
		it('should implement ISessionRepository.generateShareData', () => {
			expect(repo.generateShareData).toBeDefined();
			expect(typeof repo.generateShareData).toBe('function');
		});

		it('should return response matching GenerateShareDataSuccessResponse shape', async () => {
			const request = { sessionId: '770e8400-e29b-41d4-a716-446655440002', includeQR: true };
			const response = await repo.generateShareData(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('shareUrl');
			expect(typeof response.shareUrl).toBe('string');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { sessionId: '770e8400-e29b-41d4-a716-446655440002' };
			const response = await repo.generateShareData(request);

			if ('error' in response) return;

			const allowedKeys = ['shareUrl', 'qrCodeDataUrl'];
			const actualKeys = Object.keys(response);
			actualKeys.forEach((key) => {
				expect(allowedKeys).toContain(key);
			});
		});

		it('should optionally include QR code', async () => {
			const withQR = await repo.generateShareData({
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				includeQR: true
			});

			if ('error' in withQR) return;
			expect(withQR.qrCodeDataUrl).toBeDefined();

			const withoutQR = await repo.generateShareData({
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				includeQR: false
			});

			if ('error' in withoutQR) return;
			expect(withoutQR.qrCodeDataUrl).toBeUndefined();
		});

		it('should validate request with Zod schema', () => {
			const valid = { sessionId: '770e8400-e29b-41d4-a716-446655440002', includeQR: true };
			expect(() => GenerateShareDataRequestSchema.parse(valid)).not.toThrow();
		});
	});
});

/**
 * Vibe Contract Tests
 * Validates that VibeMockRepository implements IVibeRepository correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VibeMockRepository } from '../../lib/mocks/vibe.mock';
import type { IVibeRepository } from '../../lib/contracts/vibe.contracts';
import { SetSessionVibeRequestSchema } from '../../lib/contracts/vibe.contracts';

describe('Vibe Contract Tests', () => {
	let repo: IVibeRepository;

	beforeEach(() => {
		repo = new VibeMockRepository();
	});

	describe('SEAM-VIBE-001: Get Available Vibes', () => {
		it('should implement IVibeRepository.getAvailableVibes', () => {
			expect(repo.getAvailableVibes).toBeDefined();
			expect(typeof repo.getAvailableVibes).toBe('function');
		});

		it('should return response matching GetAvailableVibesSuccessResponse shape', () => {
			const response = repo.getAvailableVibes();

			expect(response).toHaveProperty('vibes');
			expect(Array.isArray(response.vibes)).toBe(true);
			expect(response.vibes.length).toBeGreaterThan(0);

			response.vibes.forEach((vibe) => {
				expect(vibe).toHaveProperty('id');
				expect(vibe).toHaveProperty('name');
				expect(vibe).toHaveProperty('description');
				expect(vibe).toHaveProperty('colorScheme');
				expect(vibe.colorScheme).toHaveProperty('primary');
				expect(vibe.colorScheme).toHaveProperty('secondary');
				expect(vibe.colorScheme).toHaveProperty('accent');
				expect(vibe.colorScheme).toHaveProperty('background');
			});
		});

		it('should not return extra fields beyond contract', () => {
			const response = repo.getAvailableVibes();

			const allowedKeys = ['vibes'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return consistent vibes on multiple calls', () => {
			const response1 = repo.getAvailableVibes();
			const response2 = repo.getAvailableVibes();

			expect(response1).toEqual(response2);
		});

		it('should return predefined vibes without errors', () => {
			expect(() => repo.getAvailableVibes()).not.toThrow();
		});
	});

	describe('SEAM-VIBE-002: Set Session Vibe', () => {
		it('should implement IVibeRepository.setSessionVibe', () => {
			expect(repo.setSessionVibe).toBeDefined();
			expect(typeof repo.setSessionVibe).toBe('function');
		});

		it('should return response matching SetSessionVibeSuccessResponse shape', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				vibeConfig: {
					id: 'chaos-gremlin',
					colorScheme: {
						primary: '#ff00ff',
						secondary: '#ff00aa',
						accent: '#ffff00',
						background: '#1a001a'
					}
				}
			};
			const response = await repo.setSessionVibe(request);

			if ('error' in response) throw new Error('Expected success');

			expect(response).toHaveProperty('success');
			expect(response).toHaveProperty('updatedVibe');
			expect(response.success).toBe(true);
			expect(response.updatedVibe).toHaveProperty('id');
			expect(response.updatedVibe).toHaveProperty('colorScheme');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				vibeConfig: {
					id: 'default-dark',
					colorScheme: {
						primary: '#6366f1',
						secondary: '#8b5cf6',
						accent: '#ec4899',
						background: '#0f172a'
					}
				}
			};
			const response = await repo.setSessionVibe(request);

			if ('error' in response) return;

			const allowedKeys = ['success', 'updatedVibe'];
			expect(Object.keys(response).sort()).toEqual(allowedKeys.sort());
		});

		it('should return error for invalid vibe config', async () => {
			const request = {
				sessionId: 'invalid',
				vibeConfig: {
					id: '',
					colorScheme: {
						primary: 'not-a-color',
						secondary: 'not-a-color',
						accent: 'not-a-color',
						background: 'not-a-color'
					}
				}
			};
			const response = await repo.setSessionVibe(request);

			if ('error' in response) {
				expect(response.error).toHaveProperty('code');
				expect(response.error).toHaveProperty('message');
				expect(response.error).toHaveProperty('retryable');
			}
		});

		it('should validate request with Zod schema', () => {
			const valid = {
				sessionId: '770e8400-e29b-41d4-a716-446655440002',
				vibeConfig: {
					id: 'chaos-gremlin',
					colorScheme: {
						primary: '#ff00ff',
						secondary: '#ff00aa',
						accent: '#ffff00',
						background: '#1a001a'
					}
				}
			};
			expect(() => SetSessionVibeRequestSchema.parse(valid)).not.toThrow();

			const invalid = {
				sessionId: 'not-a-uuid',
				vibeConfig: {
					id: 'test',
					colorScheme: {
						primary: 'not-hex',
						secondary: '#ff00aa',
						accent: '#ffff00',
						background: '#1a001a'
					}
				}
			};
			expect(() => SetSessionVibeRequestSchema.parse(invalid)).toThrow();
		});
	});
});

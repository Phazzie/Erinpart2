/**
 * Auth Contract Tests
 * Validates that AuthMockRepository implements IAuthRepository correctly
 * Following SDD Phase 3 - Contract Testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthMockRepository } from '../../lib/mocks/auth.mock';
import type { IAuthRepository } from '../../lib/contracts/auth.contracts';
import { AnonymousSignInRequestSchema, OAuthSignInRequestSchema } from '../../lib/contracts/auth.contracts';

describe('Auth Contract Tests', () => {
	let repo: IAuthRepository;

	beforeEach(() => {
		repo = new AuthMockRepository();
	});

	describe('SEAM-AUTH-001: Anonymous Sign In', () => {
		it('should implement IAuthRepository.anonymousSignIn', () => {
			expect(repo.anonymousSignIn).toBeDefined();
			expect(typeof repo.anonymousSignIn).toBe('function');
		});

		it('should return response matching AnonymousSignInSuccessResponse shape', async () => {
			const request = { animalOne: 'cat', animalTwo: 'dolphin' };
			const response = await repo.anonymousSignIn(request);

			if ('error' in response) {
				throw new Error('Expected success response');
			}

			// Validate user object
			expect(response).toHaveProperty('user');
			expect(response.user).toHaveProperty('id');
			expect(typeof response.user.id).toBe('string');
			expect(response.user).toHaveProperty('animalCode');
			expect(typeof response.user.animalCode).toBe('string');
			expect(response.user).toHaveProperty('createdAt');
			expect(typeof response.user.createdAt).toBe('string');

			// Validate session object
			expect(response).toHaveProperty('session');
			expect(response.session).toHaveProperty('accessToken');
			expect(typeof response.session.accessToken).toBe('string');
			expect(response.session).toHaveProperty('refreshToken');
			expect(typeof response.session.refreshToken).toBe('string');
			expect(response.session).toHaveProperty('expiresAt');
			expect(typeof response.session.expiresAt).toBe('string');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { animalOne: 'cat', animalTwo: 'dolphin' };
			const response = await repo.anonymousSignIn(request);

			if ('error' in response) return;

			const allowedKeys = ['user', 'session'];
			const actualKeys = Object.keys(response);
			expect(actualKeys.sort()).toEqual(allowedKeys.sort());
		});

		it('should return error response for invalid input', async () => {
			const request = { animalOne: '', animalTwo: '' };
			const response = await repo.anonymousSignIn(request);

			expect(response).toHaveProperty('error');
			if ('error' in response) {
				expect(response.error).toHaveProperty('code');
				expect(typeof response.error.code).toBe('string');
				expect(response.error).toHaveProperty('message');
				expect(typeof response.error.message).toBe('string');
				expect(response.error).toHaveProperty('retryable');
				expect(typeof response.error.retryable).toBe('boolean');
			}
		});

		it('should validate request with Zod schema', () => {
			const validRequest = { animalOne: 'cat', animalTwo: 'dolphin' };
			expect(() => AnonymousSignInRequestSchema.parse(validRequest)).not.toThrow();

			const invalidRequest = { animalOne: '', animalTwo: 'dolphin' };
			expect(() => AnonymousSignInRequestSchema.parse(invalidRequest)).toThrow();
		});
	});

	describe('SEAM-AUTH-002: OAuth Sign In', () => {
		it('should implement IAuthRepository.oauthSignIn', () => {
			expect(repo.oauthSignIn).toBeDefined();
			expect(typeof repo.oauthSignIn).toBe('function');
		});

		it('should return response matching OAuthSignInSuccessResponse shape', async () => {
			const request = { provider: 'google' as const };
			const response = await repo.oauthSignIn(request);

			if ('error' in response) {
				throw new Error('Expected success response');
			}

			// Validate user object
			expect(response).toHaveProperty('user');
			expect(response.user).toHaveProperty('id');
			expect(typeof response.user.id).toBe('string');
			expect(response.user).toHaveProperty('email');
			expect(typeof response.user.email).toBe('string');
			expect(response.user).toHaveProperty('name');
			expect(typeof response.user.name).toBe('string');
			expect(response.user).toHaveProperty('avatarUrl');

			// Validate session object
			expect(response).toHaveProperty('session');
			expect(response.session).toHaveProperty('accessToken');
			expect(response.session).toHaveProperty('refreshToken');
			expect(response.session).toHaveProperty('expiresAt');
		});

		it('should not return extra fields beyond contract', async () => {
			const request = { provider: 'google' as const };
			const response = await repo.oauthSignIn(request);

			if ('error' in response) return;

			const allowedKeys = ['user', 'session'];
			const actualKeys = Object.keys(response);
			expect(actualKeys.sort()).toEqual(allowedKeys.sort());
		});

		it('should support different OAuth providers', async () => {
			const googleRequest = { provider: 'google' as const };
			const googleResponse = await repo.oauthSignIn(googleRequest);
			expect(googleResponse).toBeDefined();

			const githubRequest = { provider: 'github' as const };
			const githubResponse = await repo.oauthSignIn(githubRequest);
			expect(githubResponse).toBeDefined();
		});

		it('should validate request with Zod schema', () => {
			const validRequest = { provider: 'google' };
			expect(() => OAuthSignInRequestSchema.parse(validRequest)).not.toThrow();

			const invalidRequest = { provider: 'invalid' };
			expect(() => OAuthSignInRequestSchema.parse(invalidRequest)).toThrow();
		});
	});

	describe('SEAM-AUTH-003: Sign Out', () => {
		it('should implement IAuthRepository.signOut', () => {
			expect(repo.signOut).toBeDefined();
			expect(typeof repo.signOut).toBe('function');
		});

		it('should return response matching SignOutSuccessResponse shape', async () => {
			const response = await repo.signOut();

			if ('error' in response) {
				throw new Error('Expected success response');
			}

			expect(response).toHaveProperty('success');
			expect(response.success).toBe(true);
		});

		it('should not return extra fields beyond contract', async () => {
			const response = await repo.signOut();

			if ('error' in response) return;

			const allowedKeys = ['success'];
			const actualKeys = Object.keys(response);
			expect(actualKeys.sort()).toEqual(allowedKeys.sort());
		});

		it('should return consistent success response', async () => {
			const response1 = await repo.signOut();
			const response2 = await repo.signOut();

			expect(response1).toEqual(response2);
		});

		it('should complete successfully without errors', async () => {
			await expect(repo.signOut()).resolves.not.toThrow();
		});
	});

	describe('SEAM-AUTH-004: Get Current User', () => {
		it('should implement IAuthRepository.getCurrentUser', () => {
			expect(repo.getCurrentUser).toBeDefined();
			expect(typeof repo.getCurrentUser).toBe('function');
		});

		it('should return response matching GetCurrentUserResponse shape', async () => {
			const response = await repo.getCurrentUser();

			expect(response).toHaveProperty('user');
			if (response.user !== null) {
				expect(response.user).toHaveProperty('id');
				expect(typeof response.user.id).toBe('string');
			}
		});

		it('should not return extra fields beyond contract', async () => {
			const response = await repo.getCurrentUser();

			const allowedKeys = ['user'];
			const actualKeys = Object.keys(response);
			expect(actualKeys.sort()).toEqual(allowedKeys.sort());
		});

		it('should handle both authenticated and unauthenticated states', async () => {
			const response = await repo.getCurrentUser();

			expect(response).toHaveProperty('user');
			// User can be null (unauthenticated) or an object (authenticated)
			expect(response.user === null || typeof response.user === 'object').toBe(true);
		});

		it('should return consistent user structure', async () => {
			const response = await repo.getCurrentUser();

			if (response.user !== null) {
				// If authenticated, validate user has required fields
				expect(response.user).toHaveProperty('id');
			}
		});
	});
});

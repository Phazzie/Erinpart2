/**
 * Mock implementation of IAuthRepository
 */

import type {
	IAuthRepository,
	AnonymousSignInRequest,
	AnonymousSignInSuccessResponse,
	AnonymousSignInErrorResponse,
	OAuthSignInRequest,
	OAuthSignInSuccessResponse,
	OAuthSignInErrorResponse,
	SignOutSuccessResponse,
	SignOutErrorResponse,
	GetCurrentUserResponse
} from '../contracts/auth.contracts';

export class AuthMockRepository implements IAuthRepository {
	async anonymousSignIn(
		request: AnonymousSignInRequest
	): Promise<AnonymousSignInSuccessResponse | AnonymousSignInErrorResponse> {
		if (!request.animalOne || !request.animalTwo) {
			return {
				error: {
					code: 'NETWORK_ERROR',
					message: 'Animal names cannot be empty',
					retryable: false
				}
			};
		}

		return {
			user: {
				id: '550e8400-e29b-41d4-a716-446655440000',
				animalCode: `${request.animalOne}-${request.animalTwo}`,
				createdAt: new Date().toISOString()
			},
			session: {
				accessToken: 'mock-access-token',
				refreshToken: 'mock-refresh-token',
				expiresAt: new Date(Date.now() + 3600000).toISOString()
			}
		};
	}

	async oauthSignIn(
		request: OAuthSignInRequest
	): Promise<OAuthSignInSuccessResponse | OAuthSignInErrorResponse> {
		return {
			user: {
				id: '660e8400-e29b-41d4-a716-446655440001',
				email: 'test@example.com',
				name: 'Test User',
				avatarUrl: 'https://example.com/avatar.png'
			},
			session: {
				accessToken: 'mock-oauth-access-token',
				refreshToken: 'mock-oauth-refresh-token',
				expiresAt: new Date(Date.now() + 3600000).toISOString()
			}
		};
	}

	async signOut(): Promise<SignOutSuccessResponse | SignOutErrorResponse> {
		return { success: true };
	}

	async getCurrentUser(): Promise<GetCurrentUserResponse> {
		return {
			user: {
				id: '550e8400-e29b-41d4-a716-446655440000',
				animalCode: 'cat-dolphin'
			}
		};
	}
}

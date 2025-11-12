/**
 * Mock implementation of ISessionRepository
 */

import type {
	ISessionRepository,
	CreateSessionRequest,
	CreateSessionSuccessResponse,
	CreateSessionErrorResponse,
	JoinSessionRequest,
	JoinSessionSuccessResponse,
	JoinSessionErrorResponse,
	LeaveSessionRequest,
	LeaveSessionSuccessResponse,
	LeaveSessionErrorResponse,
	GetSessionDetailsRequest,
	GetSessionDetailsSuccessResponse,
	GetSessionDetailsErrorResponse,
	GenerateShareDataRequest,
	GenerateShareDataSuccessResponse,
	GenerateShareDataErrorResponse
} from '../contracts/session.contracts';

export class SessionMockRepository implements ISessionRepository {
	async createSession(
		request: CreateSessionRequest
	): Promise<CreateSessionSuccessResponse | CreateSessionErrorResponse> {
		return {
			session: {
				id: '770e8400-e29b-41d4-a716-446655440002',
				code: 'cat-dolphin',
				hostId: request.userId,
				createdAt: new Date().toISOString(),
				participantCount: 1,
				dayVibe: null
			}
		};
	}

	async joinSession(
		request: JoinSessionRequest
	): Promise<JoinSessionSuccessResponse | JoinSessionErrorResponse> {
		return {
			session: {
				id: '770e8400-e29b-41d4-a716-446655440002',
				code: request.sessionCode,
				hostId: '550e8400-e29b-41d4-a716-446655440000',
				createdAt: new Date().toISOString(),
				participantCount: 2,
				dayVibe: null,
				isUserHost: false
			}
		};
	}

	async leaveSession(
		request: LeaveSessionRequest
	): Promise<LeaveSessionSuccessResponse | LeaveSessionErrorResponse> {
		return {
			success: true
		};
	}

	async getSessionDetails(
		request: GetSessionDetailsRequest
	): Promise<GetSessionDetailsSuccessResponse | GetSessionDetailsErrorResponse> {
		return {
			session: {
				id: request.sessionId,
				code: 'cat-dolphin',
				hostId: '550e8400-e29b-41d4-a716-446655440000',
				createdAt: new Date().toISOString(),
				participantCount: 2,
				dayVibe: null,
				isUserHost: true,
				participants: [
					{
						id: '550e8400-e29b-41d4-a716-446655440000',
						name: 'cat-dolphin',
						joinedAt: new Date().toISOString(),
						isOnline: true
					}
				]
			}
		};
	}

	async generateShareData(
		request: GenerateShareDataRequest
	): Promise<GenerateShareDataSuccessResponse | GenerateShareDataErrorResponse> {
		const response: GenerateShareDataSuccessResponse = {
			shareUrl: 'https://example.com?session=' + request.sessionId
		};

		if (request.includeQR) {
			response.qrCodeDataUrl = 'data:image/png;base64,iVBORw0KGgo=';
		}

		return response;
	}
}

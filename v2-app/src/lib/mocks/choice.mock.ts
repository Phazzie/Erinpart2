/**
 * Mock implementation of IChoiceRepository
 */

import type {
	IChoiceRepository,
	GetTaskChoicesRequest,
	GetTaskChoicesSuccessResponse,
	GetTaskChoicesErrorResponse,
	SetTaskChoiceRequest,
	SetTaskChoiceSuccessResponse,
	SetTaskChoiceErrorResponse
} from '../contracts/choice.contracts';

export class ChoiceMockRepository implements IChoiceRepository {
	async getTaskChoices(
		request: GetTaskChoicesRequest
	): Promise<GetTaskChoicesSuccessResponse | GetTaskChoicesErrorResponse> {
		return {
			choices: [
				{
					id: 'aa0e8400-e29b-41d4-a716-446655440005',
					taskId: request.taskId,
					userId: '550e8400-e29b-41d4-a716-446655440000',
					userName: 'cat-dolphin',
					choice: 'yes',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}
			],
			aggregation: {
				yes: 1,
				no: 0,
				maybe: 0,
				total: 1
			},
			currentUserChoice: 'yes'
		};
	}

	async setTaskChoice(
		request: SetTaskChoiceRequest
	): Promise<SetTaskChoiceSuccessResponse | SetTaskChoiceErrorResponse> {
		return {
			choice: {
				id: 'bb0e8400-e29b-41d4-a716-446655440006',
				taskId: request.taskId,
				userId: request.userId,
				userName: request.userName,
				choice: request.choice,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			},
			aggregation: {
				yes: request.choice === 'yes' ? 1 : 0,
				no: request.choice === 'no' ? 1 : 0,
				maybe: request.choice === 'maybe' ? 1 : 0,
				total: 1
			}
		};
	}
}

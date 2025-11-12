/**
 * Mock implementation of IListRepository
 */

import type {
	IListRepository,
	GetListsRequest,
	GetListsSuccessResponse,
	GetListsErrorResponse,
	CreateListRequest,
	CreateListSuccessResponse,
	CreateListErrorResponse,
	DeleteListRequest,
	DeleteListSuccessResponse,
	DeleteListErrorResponse,
	GetListItemsRequest,
	GetListItemsSuccessResponse,
	GetListItemsErrorResponse,
	AddListItemRequest,
	AddListItemSuccessResponse,
	AddListItemErrorResponse,
	UpdateListItemRequest,
	UpdateListItemSuccessResponse,
	UpdateListItemErrorResponse,
	DeleteListItemRequest,
	DeleteListItemSuccessResponse,
	DeleteListItemErrorResponse,
	VerifyListItemRequest,
	VerifyListItemSuccessResponse,
	VerifyListItemErrorResponse
} from '../contracts/list.contracts';

export class ListMockRepository implements IListRepository {
	async getLists(
		request: GetListsRequest
	): Promise<GetListsSuccessResponse | GetListsErrorResponse> {
		return {
			lists: [
				{
					id: 'cc0e8400-e29b-41d4-a716-446655440007',
					sessionId: request.sessionId,
					title: 'Sample List',
					listType: 'bullet',
					creatorId: '550e8400-e29b-41d4-a716-446655440000',
					creatorName: 'cat-dolphin',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					itemCount: 0,
					canDelete: true
				}
			]
		};
	}

	async createList(
		request: CreateListRequest
	): Promise<CreateListSuccessResponse | CreateListErrorResponse> {
		return {
			list: {
				id: 'dd0e8400-e29b-41d4-a716-446655440008',
				sessionId: request.sessionId,
				title: request.title,
				listType: request.listType,
				creatorId: request.creatorId,
				creatorName: request.creatorName,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				itemCount: 0,
				canDelete: true
			}
		};
	}

	async deleteList(
		request: DeleteListRequest
	): Promise<DeleteListSuccessResponse | DeleteListErrorResponse> {
		return {
			success: true,
			deletedId: request.listId,
			deletedItemCount: 0
		};
	}

	async getListItems(
		request: GetListItemsRequest
	): Promise<GetListItemsSuccessResponse | GetListItemsErrorResponse> {
		return {
			items: [
				{
					id: 'ee0e8400-e29b-41d4-a716-446655440009',
					listId: request.listId,
					text: 'Sample item',
					orderIndex: 0,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					verificationStatus: 'neutral',
					verificationCount: {
						accurate: 0,
						inaccurate: 0,
						total: 0
					},
					consensusPercentage: 0,
					corrections: []
				}
			]
		};
	}

	async addListItem(
		request: AddListItemRequest
	): Promise<AddListItemSuccessResponse | AddListItemErrorResponse> {
		return {
			item: {
				id: 'ff0e8400-e29b-41d4-a716-446655440010',
				listId: request.listId,
				text: request.text,
				orderIndex: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				verificationStatus: 'neutral',
				verificationCount: {
					accurate: 0,
					inaccurate: 0,
					total: 0
				},
				consensusPercentage: 0,
				corrections: []
			}
		};
	}

	async updateListItem(
		request: UpdateListItemRequest
	): Promise<UpdateListItemSuccessResponse | UpdateListItemErrorResponse> {
		return {
			item: {
				id: request.itemId,
				listId: 'cc0e8400-e29b-41d4-a716-446655440007',
				text: request.text,
				orderIndex: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				verificationStatus: 'neutral',
				verificationCount: {
					accurate: 0,
					inaccurate: 0,
					total: 0
				},
				consensusPercentage: 0,
				corrections: []
			}
		};
	}

	async deleteListItem(
		request: DeleteListItemRequest
	): Promise<DeleteListItemSuccessResponse | DeleteListItemErrorResponse> {
		return {
			success: true,
			deletedId: request.itemId
		};
	}

	async verifyListItem(
		request: VerifyListItemRequest
	): Promise<VerifyListItemSuccessResponse | VerifyListItemErrorResponse> {
		return {
			verification: {
				id: '000e8400-e29b-41d4-a716-446655440011',
				itemId: request.itemId,
				userId: request.userId,
				userName: request.userName,
				isAccurate: request.isAccurate,
				correctionText: request.correctionText || null,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			},
			updatedItem: {
				id: request.itemId,
				verificationStatus: request.isAccurate ? 'accurate' : 'inaccurate',
				verificationCount: {
					accurate: request.isAccurate ? 1 : 0,
					inaccurate: request.isAccurate ? 0 : 1,
					total: 1
				},
				consensusPercentage: request.isAccurate ? 100 : 0
			}
		};
	}
}

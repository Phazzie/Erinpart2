/**
 * @file Collaborative List Contracts
 * @description Complete contract definitions for all collaborative list seams (SEAM-LIST-001 through SEAM-LIST-008)
 * @requirements @LIST-001, @LIST-002, @LIST-003, @LIST-004, @LIST-005
 * @sdd-step Step 3 - DEFINE
 */

import { z } from 'zod';

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * List type enumeration
 * @requirement @LIST-001
 */
export type ListType = 'bullet' | 'numbered';

/**
 * Verification status for list items
 * Derived from consensus calculation
 * @requirement @LIST-003
 */
export type VerificationStatus = 'neutral' | 'accurate' | 'inaccurate';

/**
 * Represents a collaborative list entity
 * @requirement @LIST-001
 */
export interface CollaborativeList {
	/**
	 * Unique identifier for the list
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * Session this list belongs to
	 * @requirement @LIST-001
	 */
	sessionId: string;

	/**
	 * List title
	 * @requirement @LIST-001
	 * @validation 1-200 characters
	 */
	title: string;

	/**
	 * Type of list (bullet or numbered)
	 * @requirement @LIST-001
	 */
	listType: ListType;

	/**
	 * User who created the list
	 * @requirement @LIST-001
	 */
	creatorId: string;

	/**
	 * Display name of creator
	 * @requirement @LIST-001
	 */
	creatorName: string;

	/**
	 * ISO 8601 timestamp of creation
	 * @example "2025-11-12T10:30:00.000Z"
	 */
	createdAt: string;

	/**
	 * ISO 8601 timestamp of last update
	 * @example "2025-11-12T10:30:00.000Z"
	 */
	updatedAt: string;

	/**
	 * Number of items in the list
	 * @requirement @LIST-001
	 */
	itemCount: number;

	/**
	 * Whether current user can delete this list
	 * Derived: true if user is creator or session host
	 * @requirement @LIST-005
	 */
	canDelete: boolean;
}

/**
 * Verification count aggregation
 * @requirement @LIST-003, @LIST-004
 */
export interface VerificationCount {
	/**
	 * Number of accurate votes
	 */
	accurate: number;

	/**
	 * Number of inaccurate votes
	 */
	inaccurate: number;

	/**
	 * Total number of votes
	 */
	total: number;
}

/**
 * Correction submitted by a user
 * @requirement @LIST-003
 */
export interface Correction {
	/**
	 * User who submitted the correction
	 */
	userId: string;

	/**
	 * Display name of user
	 */
	userName: string;

	/**
	 * Suggested correction text
	 * @validation 1-500 characters
	 */
	correctionText: string;
}

/**
 * Represents a list item entity
 * @requirement @LIST-002
 */
export interface ListItem {
	/**
	 * Unique identifier for the item
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * List this item belongs to
	 * @requirement @LIST-002
	 */
	listId: string;

	/**
	 * Item text content
	 * @requirement @LIST-002
	 * @validation 1-500 characters
	 */
	text: string;

	/**
	 * Position in the list (0-indexed)
	 * @requirement @LIST-002
	 */
	orderIndex: number;

	/**
	 * ISO 8601 timestamp of creation
	 * @example "2025-11-12T10:30:00.000Z"
	 */
	createdAt: string;

	/**
	 * ISO 8601 timestamp of last update
	 * @example "2025-11-12T10:30:00.000Z"
	 */
	updatedAt: string;

	/**
	 * Verification status derived from consensus
	 * - neutral: No verifications or tie
	 * - accurate: >50% accurate votes
	 * - inaccurate: >50% inaccurate votes
	 * @requirement @LIST-003
	 */
	verificationStatus: VerificationStatus;

	/**
	 * Aggregated verification counts
	 * @requirement @LIST-003, @LIST-004
	 */
	verificationCount: VerificationCount;

	/**
	 * Consensus percentage (0-100)
	 * Calculated as: (accurate / total) * 100
	 * @requirement @LIST-004
	 */
	consensusPercentage: number;

	/**
	 * Array of corrections submitted by users
	 * Only populated when item has inaccurate verifications
	 * @requirement @LIST-003
	 */
	corrections: Correction[];
}

/**
 * Represents a verification record
 * @requirement @LIST-003
 */
export interface ListItemVerification {
	/**
	 * Unique identifier for the verification
	 */
	id: string;

	/**
	 * Item being verified
	 */
	itemId: string;

	/**
	 * User who submitted the verification
	 */
	userId: string;

	/**
	 * Display name of user
	 */
	userName: string;

	/**
	 * Whether user marked item as accurate
	 * true = accurate (green), false = inaccurate (red)
	 * @requirement @LIST-003
	 */
	isAccurate: boolean;

	/**
	 * Correction text provided if marking inaccurate
	 * Required when isAccurate = false
	 * @requirement @LIST-003
	 */
	correctionText: string | null;

	/**
	 * ISO 8601 timestamp of creation
	 */
	createdAt: string;

	/**
	 * ISO 8601 timestamp of last update
	 */
	updatedAt: string;
}

// ============================================================================
// SEAM-LIST-001: Get Lists
// ============================================================================

/**
 * @seam SEAM-LIST-001
 * @description Get all lists for a session
 * @requirement @LIST-001
 * @boundary UI Component ↔ List Repository
 */

/**
 * Request to get lists for a session
 * @requirement @LIST-001
 */
export interface GetListsRequest {
	/**
	 * Session ID to get lists for
	 * @validation Must be valid UUID
	 */
	sessionId: string;
}

/**
 * Success response for getting lists
 * @requirement @LIST-001
 */
export interface GetListsSuccessResponse {
	lists: CollaborativeList[];
}

/**
 * Error codes for getting lists
 * @requirement @UX-003
 */
export type GetListsErrorCode =
	| 'SESSION_NOT_FOUND' // Session doesn't exist
	| 'UNAUTHORIZED' // User not authenticated or not session participant
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for getting lists
 */
export interface GetListsErrorResponse {
	error: {
		code: GetListsErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for getting lists
 * @requirement @UX-002
 */
export type GetListsState = 'loading' | 'loaded' | 'error' | 'empty';

// ============================================================================
// SEAM-LIST-002: Create List
// ============================================================================

/**
 * @seam SEAM-LIST-002
 * @description Create a new collaborative list
 * @requirement @LIST-001
 * @boundary UI Component ↔ List Repository
 */

/**
 * Request to create a new list
 * @requirement @LIST-001
 */
export interface CreateListRequest {
	/**
	 * Session to create list in
	 * @validation Must be valid UUID
	 */
	sessionId: string;

	/**
	 * List title
	 * @validation 1-200 characters, trimmed
	 * @example "Packing list for trip"
	 */
	title: string;

	/**
	 * Type of list
	 * @validation Must be 'bullet' or 'numbered'
	 */
	listType: ListType;

	/**
	 * User creating the list
	 * @validation Must be valid UUID
	 */
	creatorId: string;

	/**
	 * Display name of creator
	 * @validation 1-100 characters
	 */
	creatorName: string;
}

/**
 * Success response for creating a list
 * @requirement @LIST-001
 */
export interface CreateListSuccessResponse {
	list: CollaborativeList;
}

/**
 * Error codes for creating a list
 * @requirement @UX-003
 */
export type CreateListErrorCode =
	| 'VALIDATION_ERROR' // Invalid input data
	| 'UNAUTHORIZED' // User not authenticated or not session participant
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for creating a list
 */
export interface CreateListErrorResponse {
	error: {
		code: CreateListErrorCode;
		message: string;
		retryable: boolean;
		validationErrors?: {
			title?: string[];
			listType?: string[];
		};
	};
}

/**
 * UI state for creating a list
 * @requirement @UX-002
 */
export type CreateListState = 'idle' | 'creating' | 'success' | 'error';

// ============================================================================
// SEAM-LIST-003: Delete List
// ============================================================================

/**
 * @seam SEAM-LIST-003
 * @description Delete a list and all its items
 * @requirement @LIST-005
 * @boundary UI Component ↔ List Repository
 */

/**
 * Request to delete a list
 * @requirement @LIST-005
 */
export interface DeleteListRequest {
	/**
	 * List ID to delete
	 * @validation Must be valid UUID
	 */
	listId: string;
}

/**
 * Success response for deleting a list
 * @requirement @LIST-005
 */
export interface DeleteListSuccessResponse {
	/**
	 * Operation success indicator
	 */
	success: true;

	/**
	 * ID of the deleted list
	 */
	deletedId: string;

	/**
	 * Number of items that were cascade deleted
	 */
	deletedItemCount: number;
}

/**
 * Error codes for deleting a list
 * @requirement @UX-003
 */
export type DeleteListErrorCode =
	| 'UNAUTHORIZED' // User not creator or host
	| 'NOT_FOUND' // List doesn't exist
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for deleting a list
 */
export interface DeleteListErrorResponse {
	error: {
		code: DeleteListErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for deleting a list
 * @requirement @UX-002
 */
export type DeleteListState = 'idle' | 'deleting' | 'success' | 'error';

// ============================================================================
// SEAM-LIST-004: Get List Items
// ============================================================================

/**
 * @seam SEAM-LIST-004
 * @description Get all items for a list
 * @requirement @LIST-002
 * @boundary UI Component ↔ List Repository
 */

/**
 * Request to get items for a list
 * @requirement @LIST-002
 */
export interface GetListItemsRequest {
	/**
	 * List ID to get items for
	 * @validation Must be valid UUID
	 */
	listId: string;
}

/**
 * Success response for getting list items
 * @requirement @LIST-002
 */
export interface GetListItemsSuccessResponse {
	items: ListItem[];
}

/**
 * Error codes for getting list items
 * @requirement @UX-003
 */
export type GetListItemsErrorCode =
	| 'LIST_NOT_FOUND' // List doesn't exist
	| 'UNAUTHORIZED' // User not authorized to view list
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for getting list items
 */
export interface GetListItemsErrorResponse {
	error: {
		code: GetListItemsErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for getting list items
 * @requirement @UX-002
 */
export type GetListItemsState = 'loading' | 'loaded' | 'error' | 'empty';

// ============================================================================
// SEAM-LIST-005: Add List Item
// ============================================================================

/**
 * @seam SEAM-LIST-005
 * @description Add a new item to a list
 * @requirement @LIST-002
 * @boundary UI Component ↔ List Repository
 */

/**
 * Request to add an item to a list
 * @requirement @LIST-002
 */
export interface AddListItemRequest {
	/**
	 * List to add item to
	 * @validation Must be valid UUID
	 */
	listId: string;

	/**
	 * Item text content
	 * @validation 1-500 characters, trimmed
	 * @example "Buy milk"
	 */
	text: string;
}

/**
 * Success response for adding a list item
 * @requirement @LIST-002
 */
export interface AddListItemSuccessResponse {
	item: ListItem;
}

/**
 * Error codes for adding a list item
 * @requirement @UX-003
 */
export type AddListItemErrorCode =
	| 'VALIDATION_ERROR' // Invalid input data
	| 'LIST_NOT_FOUND' // List doesn't exist
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for adding a list item
 */
export interface AddListItemErrorResponse {
	error: {
		code: AddListItemErrorCode;
		message: string;
		retryable: boolean;
		validationErrors?: {
			text?: string[];
		};
	};
}

/**
 * UI state for adding a list item
 * @requirement @UX-002
 */
export type AddListItemState = 'idle' | 'adding' | 'success' | 'error';

// ============================================================================
// SEAM-LIST-006: Update List Item
// ============================================================================

/**
 * @seam SEAM-LIST-006
 * @description Update a list item's text
 * @requirement @LIST-002
 * @boundary UI Component ↔ List Repository
 */

/**
 * Request to update a list item
 * @requirement @LIST-002
 */
export interface UpdateListItemRequest {
	/**
	 * Item ID to update
	 * @validation Must be valid UUID
	 */
	itemId: string;

	/**
	 * New text content
	 * @validation 1-500 characters, trimmed
	 */
	text: string;
}

/**
 * Success response for updating a list item
 * @requirement @LIST-002
 */
export interface UpdateListItemSuccessResponse {
	item: ListItem;
}

/**
 * Error codes for updating a list item
 * @requirement @UX-003
 */
export type UpdateListItemErrorCode =
	| 'VALIDATION_ERROR' // Invalid input data
	| 'NOT_FOUND' // Item doesn't exist
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for updating a list item
 */
export interface UpdateListItemErrorResponse {
	error: {
		code: UpdateListItemErrorCode;
		message: string;
		retryable: boolean;
		validationErrors?: {
			text?: string[];
		};
	};
}

/**
 * UI state for updating a list item
 * @requirement @UX-002
 */
export type UpdateListItemState = 'idle' | 'updating' | 'success' | 'error';

// ============================================================================
// SEAM-LIST-007: Delete List Item
// ============================================================================

/**
 * @seam SEAM-LIST-007
 * @description Delete a list item
 * @requirement @LIST-002
 * @boundary UI Component ↔ List Repository
 */

/**
 * Request to delete a list item
 * @requirement @LIST-002
 */
export interface DeleteListItemRequest {
	/**
	 * Item ID to delete
	 * @validation Must be valid UUID
	 */
	itemId: string;
}

/**
 * Success response for deleting a list item
 * @requirement @LIST-002
 */
export interface DeleteListItemSuccessResponse {
	/**
	 * Operation success indicator
	 */
	success: true;

	/**
	 * ID of the deleted item
	 */
	deletedId: string;
}

/**
 * Error codes for deleting a list item
 * @requirement @UX-003
 */
export type DeleteListItemErrorCode =
	| 'NOT_FOUND' // Item doesn't exist
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for deleting a list item
 */
export interface DeleteListItemErrorResponse {
	error: {
		code: DeleteListItemErrorCode;
		message: string;
		retryable: boolean;
	};
}

/**
 * UI state for deleting a list item
 * @requirement @UX-002
 */
export type DeleteListItemState = 'idle' | 'deleting' | 'success' | 'error';

// ============================================================================
// SEAM-LIST-008: Verify List Item
// ============================================================================

/**
 * @seam SEAM-LIST-008
 * @description Submit verification for a list item
 * @requirement @LIST-003, @LIST-004
 * @boundary UI Component ↔ List Repository
 */

/**
 * Request to verify a list item
 * @requirement @LIST-003
 */
export interface VerifyListItemRequest {
	/**
	 * Item being verified
	 * @validation Must be valid UUID
	 */
	itemId: string;

	/**
	 * User submitting verification
	 * @validation Must be valid UUID
	 */
	userId: string;

	/**
	 * Display name of user
	 * @validation 1-100 characters
	 */
	userName: string;

	/**
	 * Whether item is accurate
	 * true = accurate (green), false = inaccurate (red)
	 * @requirement @LIST-003
	 */
	isAccurate: boolean;

	/**
	 * Correction text if marking inaccurate
	 * Required when isAccurate = false
	 * @validation 1-500 characters if provided
	 */
	correctionText?: string;
}

/**
 * Success response for verifying a list item
 * @requirement @LIST-003
 */
export interface VerifyListItemSuccessResponse {
	/**
	 * The verification record created/updated
	 */
	verification: ListItemVerification;

	/**
	 * Updated item with new verification status
	 */
	updatedItem: {
		id: string;
		verificationStatus: VerificationStatus;
		verificationCount: VerificationCount;
		consensusPercentage: number;
	};
}

/**
 * Error codes for verifying a list item
 * @requirement @UX-003
 */
export type VerifyListItemErrorCode =
	| 'VALIDATION_ERROR' // Invalid input data
	| 'ITEM_NOT_FOUND' // Item doesn't exist
	| 'DATABASE_ERROR'; // Database operation failed

/**
 * Error response for verifying a list item
 */
export interface VerifyListItemErrorResponse {
	error: {
		code: VerifyListItemErrorCode;
		message: string;
		retryable: boolean;
		validationErrors?: {
			correctionText?: string[];
		};
	};
}

/**
 * UI state for verifying a list item
 * @requirement @UX-002
 */
export type VerifyListItemState = 'idle' | 'verifying' | 'success' | 'error';

// ============================================================================
// REPOSITORY INTERFACE
// ============================================================================

/**
 * List repository interface
 * MUST be implemented by both ListMockRepository and ListSupabaseRepository
 * @requirement @MAINT-001
 */
export interface IListRepository {
	/**
	 * Get all lists for a session
	 * @param request - Session ID to get lists for
	 * @returns Promise resolving to lists or error
	 * @throws Never throws - always returns typed response
	 */
	getLists(
		request: GetListsRequest
	): Promise<GetListsSuccessResponse | GetListsErrorResponse>;

	/**
	 * Create a new list
	 * @param request - List creation parameters
	 * @returns Promise resolving to created list or error
	 * @throws Never throws - always returns typed response
	 */
	createList(
		request: CreateListRequest
	): Promise<CreateListSuccessResponse | CreateListErrorResponse>;

	/**
	 * Delete a list and all its items
	 * @param request - List ID to delete
	 * @returns Promise resolving to success or error
	 * @throws Never throws - always returns typed response
	 */
	deleteList(
		request: DeleteListRequest
	): Promise<DeleteListSuccessResponse | DeleteListErrorResponse>;

	/**
	 * Get all items for a list
	 * @param request - List ID to get items for
	 * @returns Promise resolving to items or error
	 * @throws Never throws - always returns typed response
	 */
	getListItems(
		request: GetListItemsRequest
	): Promise<GetListItemsSuccessResponse | GetListItemsErrorResponse>;

	/**
	 * Add a new item to a list
	 * @param request - Item creation parameters
	 * @returns Promise resolving to created item or error
	 * @throws Never throws - always returns typed response
	 */
	addListItem(
		request: AddListItemRequest
	): Promise<AddListItemSuccessResponse | AddListItemErrorResponse>;

	/**
	 * Update a list item's text
	 * @param request - Item update parameters
	 * @returns Promise resolving to updated item or error
	 * @throws Never throws - always returns typed response
	 */
	updateListItem(
		request: UpdateListItemRequest
	): Promise<UpdateListItemSuccessResponse | UpdateListItemErrorResponse>;

	/**
	 * Delete a list item
	 * @param request - Item ID to delete
	 * @returns Promise resolving to success or error
	 * @throws Never throws - always returns typed response
	 */
	deleteListItem(
		request: DeleteListItemRequest
	): Promise<DeleteListItemSuccessResponse | DeleteListItemErrorResponse>;

	/**
	 * Verify a list item (mark as accurate/inaccurate)
	 * @param request - Verification parameters
	 * @returns Promise resolving to verification or error
	 * @throws Never throws - always returns typed response
	 */
	verifyListItem(
		request: VerifyListItemRequest
	): Promise<VerifyListItemSuccessResponse | VerifyListItemErrorResponse>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for GetLists error response
 */
export function isGetListsError(
	response: GetListsSuccessResponse | GetListsErrorResponse
): response is GetListsErrorResponse {
	return 'error' in response;
}

/**
 * Type guard for GetLists success response
 */
export function isGetListsSuccess(
	response: GetListsSuccessResponse | GetListsErrorResponse
): response is GetListsSuccessResponse {
	return 'lists' in response;
}

/**
 * Type guard for CreateList error response
 */
export function isCreateListError(
	response: CreateListSuccessResponse | CreateListErrorResponse
): response is CreateListErrorResponse {
	return 'error' in response;
}

/**
 * Type guard for CreateList success response
 */
export function isCreateListSuccess(
	response: CreateListSuccessResponse | CreateListErrorResponse
): response is CreateListSuccessResponse {
	return 'list' in response;
}

/**
 * Type guard for DeleteList error response
 */
export function isDeleteListError(
	response: DeleteListSuccessResponse | DeleteListErrorResponse
): response is DeleteListErrorResponse {
	return 'error' in response;
}

/**
 * Type guard for DeleteList success response
 */
export function isDeleteListSuccess(
	response: DeleteListSuccessResponse | DeleteListErrorResponse
): response is DeleteListSuccessResponse {
	return 'success' in response && response.success === true;
}

/**
 * Type guard for GetListItems error response
 */
export function isGetListItemsError(
	response: GetListItemsSuccessResponse | GetListItemsErrorResponse
): response is GetListItemsErrorResponse {
	return 'error' in response;
}

/**
 * Type guard for GetListItems success response
 */
export function isGetListItemsSuccess(
	response: GetListItemsSuccessResponse | GetListItemsErrorResponse
): response is GetListItemsSuccessResponse {
	return 'items' in response;
}

/**
 * Type guard for AddListItem error response
 */
export function isAddListItemError(
	response: AddListItemSuccessResponse | AddListItemErrorResponse
): response is AddListItemErrorResponse {
	return 'error' in response;
}

/**
 * Type guard for AddListItem success response
 */
export function isAddListItemSuccess(
	response: AddListItemSuccessResponse | AddListItemErrorResponse
): response is AddListItemSuccessResponse {
	return 'item' in response;
}

/**
 * Type guard for UpdateListItem error response
 */
export function isUpdateListItemError(
	response: UpdateListItemSuccessResponse | UpdateListItemErrorResponse
): response is UpdateListItemErrorResponse {
	return 'error' in response;
}

/**
 * Type guard for UpdateListItem success response
 */
export function isUpdateListItemSuccess(
	response: UpdateListItemSuccessResponse | UpdateListItemErrorResponse
): response is UpdateListItemSuccessResponse {
	return 'item' in response;
}

/**
 * Type guard for DeleteListItem error response
 */
export function isDeleteListItemError(
	response: DeleteListItemSuccessResponse | DeleteListItemErrorResponse
): response is DeleteListItemErrorResponse {
	return 'error' in response;
}

/**
 * Type guard for DeleteListItem success response
 */
export function isDeleteListItemSuccess(
	response: DeleteListItemSuccessResponse | DeleteListItemErrorResponse
): response is DeleteListItemSuccessResponse {
	return 'success' in response && response.success === true;
}

/**
 * Type guard for VerifyListItem error response
 */
export function isVerifyListItemError(
	response: VerifyListItemSuccessResponse | VerifyListItemErrorResponse
): response is VerifyListItemErrorResponse {
	return 'error' in response;
}

/**
 * Type guard for VerifyListItem success response
 */
export function isVerifyListItemSuccess(
	response: VerifyListItemSuccessResponse | VerifyListItemErrorResponse
): response is VerifyListItemSuccessResponse {
	return 'verification' in response;
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

/**
 * Zod schema for ListType
 */
export const ListTypeSchema = z.enum(['bullet', 'numbered']);

/**
 * Zod schema for VerificationStatus
 */
export const VerificationStatusSchema = z.enum(['neutral', 'accurate', 'inaccurate']);

/**
 * Zod schema for GetListsRequest
 */
export const GetListsRequestSchema = z.object({
	sessionId: z.string().uuid()
});

/**
 * Zod schema for CreateListRequest
 */
export const CreateListRequestSchema = z.object({
	sessionId: z.string().uuid(),
	title: z.string().min(1).max(200).trim(),
	listType: ListTypeSchema,
	creatorId: z.string().uuid(),
	creatorName: z.string().min(1).max(100)
});

/**
 * Zod schema for DeleteListRequest
 */
export const DeleteListRequestSchema = z.object({
	listId: z.string().uuid()
});

/**
 * Zod schema for GetListItemsRequest
 */
export const GetListItemsRequestSchema = z.object({
	listId: z.string().uuid()
});

/**
 * Zod schema for AddListItemRequest
 */
export const AddListItemRequestSchema = z.object({
	listId: z.string().uuid(),
	text: z.string().min(1).max(500).trim()
});

/**
 * Zod schema for UpdateListItemRequest
 */
export const UpdateListItemRequestSchema = z.object({
	itemId: z.string().uuid(),
	text: z.string().min(1).max(500).trim()
});

/**
 * Zod schema for DeleteListItemRequest
 */
export const DeleteListItemRequestSchema = z.object({
	itemId: z.string().uuid()
});

/**
 * Zod schema for VerifyListItemRequest
 */
export const VerifyListItemRequestSchema = z
	.object({
		itemId: z.string().uuid(),
		userId: z.string().uuid(),
		userName: z.string().min(1).max(100),
		isAccurate: z.boolean(),
		correctionText: z.string().min(1).max(500).trim().optional()
	})
	.refine(
		(data) => {
			// If marking as inaccurate, correctionText is required
			if (!data.isAccurate && !data.correctionText) {
				return false;
			}
			return true;
		},
		{
			message: 'Correction text is required when marking item as inaccurate',
			path: ['correctionText']
		}
	);

// ============================================================================
// SCHEMA VALIDATION (COMPILE-TIME CHECKS)
// ============================================================================

/**
 * Compile-time validation that Zod schemas match TypeScript interfaces
 */

type ValidateGetListsRequest = z.infer<typeof GetListsRequestSchema> extends GetListsRequest
	? GetListsRequest extends z.infer<typeof GetListsRequestSchema>
		? true
		: false
	: false;
const getListsRequestValid: ValidateGetListsRequest = true;

type ValidateCreateListRequest = z.infer<typeof CreateListRequestSchema> extends CreateListRequest
	? CreateListRequest extends z.infer<typeof CreateListRequestSchema>
		? true
		: false
	: false;
const createListRequestValid: ValidateCreateListRequest = true;

type ValidateDeleteListRequest = z.infer<typeof DeleteListRequestSchema> extends DeleteListRequest
	? DeleteListRequest extends z.infer<typeof DeleteListRequestSchema>
		? true
		: false
	: false;
const deleteListRequestValid: ValidateDeleteListRequest = true;

type ValidateGetListItemsRequest = z.infer<
	typeof GetListItemsRequestSchema
> extends GetListItemsRequest
	? GetListItemsRequest extends z.infer<typeof GetListItemsRequestSchema>
		? true
		: false
	: false;
const getListItemsRequestValid: ValidateGetListItemsRequest = true;

type ValidateAddListItemRequest = z.infer<
	typeof AddListItemRequestSchema
> extends AddListItemRequest
	? AddListItemRequest extends z.infer<typeof AddListItemRequestSchema>
		? true
		: false
	: false;
const addListItemRequestValid: ValidateAddListItemRequest = true;

type ValidateUpdateListItemRequest = z.infer<
	typeof UpdateListItemRequestSchema
> extends UpdateListItemRequest
	? UpdateListItemRequest extends z.infer<typeof UpdateListItemRequestSchema>
		? true
		: false
	: false;
const updateListItemRequestValid: ValidateUpdateListItemRequest = true;

type ValidateDeleteListItemRequest = z.infer<
	typeof DeleteListItemRequestSchema
> extends DeleteListItemRequest
	? DeleteListItemRequest extends z.infer<typeof DeleteListItemRequestSchema>
		? true
		: false
	: false;
const deleteListItemRequestValid: ValidateDeleteListItemRequest = true;

type ValidateVerifyListItemRequest = z.infer<
	typeof VerifyListItemRequestSchema
> extends VerifyListItemRequest
	? VerifyListItemRequest extends z.infer<typeof VerifyListItemRequestSchema>
		? true
		: false
	: false;
const verifyListItemRequestValid: ValidateVerifyListItemRequest = true;

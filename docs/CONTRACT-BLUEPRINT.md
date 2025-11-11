# Contract Blueprint Template (SDD Step 3)

**Project**: Erin's Escapades V2 Rewrite
**Date**: 2025-11-11
**SDD Phase**: Step 3 - DEFINE

> This document provides the standard template for defining all TypeScript contracts. Every seam identified in Step 2 must have a contract following this exact structure.

---

## Contract Writing Principles

### 1. **Be Explicit**
- Define every field with exact types
- No optional fields without explicit `?` or `| null`
- Document edge cases in comments

### 2. **Single Responsibility**
- One contract per seam
- Don't mix concerns (no `UserAndSessionSeam`)

### 3. **Requirement Tracing**
- Link fields back to PRD requirements using `@requirement` comments

### 4. **Immutability**
- Contracts are immutable once defined
- Breaking changes require versioning (`SeamV2`)

### 5. **No Type Escapes**
- Never use `any`
- Never use `as` casts in implementations
- Use strict TypeScript mode

---

## Standard Contract Structure

```typescript
/**
 * @seam SEAM-CATEGORY-###
 * @description [Brief description of what this seam does]
 * @requirement @REQ-ID from PRD
 * @boundary [Component A] ↔ [Component B]
 */

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Input data for [operation name]
 * @requirement @REQ-ID
 */
export interface [Operation]Request {
  /**
   * [Field description]
   * @requirement @REQ-ID (if specific field relates to requirement)
   * @example "example-value"
   * @validation [Validation rules, e.g., "1-500 characters"]
   */
  fieldName: string;

  // For optional fields, explicitly choose `?` or `| null`
  optionalField?: string;  // Use when field may not be provided
  nullableField: string | null;  // Use when field can be explicitly null
}

// ============================================================================
// RESPONSE TYPES (SUCCESS)
// ============================================================================

/**
 * Success response for [operation name]
 * @requirement @REQ-ID
 */
export interface [Operation]SuccessResponse {
  data: [DataType];
  // Include metadata if needed (pagination, counts, etc.)
  metadata?: {
    total?: number;
    hasMore?: boolean;
  };
}

// ============================================================================
// RESPONSE TYPES (ERROR)
// ============================================================================

/**
 * Error codes for [operation name]
 * @requirement @UX-003 (error handling requirement)
 */
export type [Operation]ErrorCode =
  | 'ERROR_CODE_ONE'      // Description of when this occurs
  | 'ERROR_CODE_TWO'      // Description of when this occurs
  | 'ERROR_CODE_THREE';   // Description of when this occurs

/**
 * Error response for [operation name]
 */
export interface [Operation]ErrorResponse {
  error: {
    code: [Operation]ErrorCode;
    message: string;  // User-friendly message
    retryable: boolean;
    metadata?: Record<string, unknown>;  // Additional error context
    validationErrors?: Record<string, string[]>;  // Field-level validation errors
  };
}

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * UI state for [operation name]
 * @requirement @UX-002 (loading states requirement)
 */
export type [Operation]State =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

/**
 * Complete async state including data and metadata
 */
export type [Operation]AsyncState =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null; startedAt: string }
  | { status: 'success'; data: [DataType]; error: null; loadedAt: string }
  | { status: 'error'; data: null; error: [Operation]ErrorResponse; failedAt: string };

// ============================================================================
// EDGE CASES
// ============================================================================

/**
 * Edge case: Empty state response
 * @requirement @UX-004 (empty states requirement)
 */
export interface [Operation]EmptyResponse {
  data: [];
  metadata: {
    total: 0;
    hasMore: false;
  };
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Service interface for [operation category]
 * This interface MUST be implemented by both mocks and real services
 * @requirement @MAINT-001 (code quality requirement)
 */
export interface I[Service]Repository {
  /**
   * [Operation description]
   * @param request - [Request description]
   * @returns Promise resolving to success or error response
   * @throws Never throws - always returns typed response
   */
  [operationName](
    request: [Operation]Request
  ): Promise<[Operation]SuccessResponse | [Operation]ErrorResponse>;

  // Add more operations as needed...
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if response is an error
 * @param response - Response to check
 * @returns True if response is an error
 */
export function is[Operation]Error(
  response: [Operation]SuccessResponse | [Operation]ErrorResponse
): response is [Operation]ErrorResponse {
  return 'error' in response;
}

/**
 * Type guard to check if response is successful
 */
export function is[Operation]Success(
  response: [Operation]SuccessResponse | [Operation]ErrorResponse
): response is [Operation]SuccessResponse {
  return !is[Operation]Error(response);
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

import { z } from 'zod';

/**
 * Zod schema for request validation
 * Ensures runtime type safety matches compile-time types
 */
export const [Operation]RequestSchema = z.object({
  fieldName: z.string().min(1).max(500),
  optionalField: z.string().optional(),
  nullableField: z.string().nullable(),
});

/**
 * Type assertion: Zod schema must match TypeScript interface
 * This will cause a compile error if they diverge
 */
type ValidateSchema = z.infer<typeof [Operation]RequestSchema> extends [Operation]Request
  ? [Operation]Request extends z.infer<typeof [Operation]RequestSchema>
    ? true
    : false
  : false;

const schemaIsValid: ValidateSchema = true;  // Compile-time check
```

---

## Example: Complete Task Contract

```typescript
/**
 * @seam SEAM-TASK-002
 * @description Create a new task in a session
 * @requirement @TASK-002
 * @boundary TaskForm Component ↔ Task Repository
 */

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Input data for creating a task
 * @requirement @TASK-002
 */
export interface CreateTaskRequest {
  /**
   * Session ID where task will be created
   * @requirement @TASK-002
   * @example "550e8400-e29b-41d4-a716-446655440000"
   * @validation Must be valid UUID
   */
  sessionId: string;

  /**
   * Task text content
   * @requirement @TASK-002
   * @example "Buy groceries for dinner"
   * @validation 1-500 characters, trimmed
   */
  text: string;

  /**
   * Which day the task is for
   * @requirement @TASK-002
   * @validation Must be 'today' or 'tomorrow'
   */
  day: 'today' | 'tomorrow';

  /**
   * Whether task is secret (requires votes to reveal)
   * @requirement @TASK-007
   */
  isSecret: boolean;

  /**
   * Optional comments/notes on the task
   * @requirement @TASK-008
   * @validation 0-1000 characters if provided
   */
  comments?: string;

  /**
   * ID of user creating the task
   * @requirement @TASK-002
   */
  createdBy: string;

  /**
   * Display name of user creating the task
   * @requirement @TASK-002
   */
  createdByName: string;
}

// ============================================================================
// RESPONSE TYPES (SUCCESS)
// ============================================================================

/**
 * Represents a task entity
 * @requirement @TASK-001
 */
export interface Task {
  id: string;
  sessionId: string;
  text: string;
  isComplete: boolean;
  completedAt: string | null;
  day: 'today' | 'tomorrow';
  orderIndex: number;
  isSecret: boolean;
  votes: string[];  // User IDs who voted to reveal
  comments: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;  // ISO 8601 timestamp
  updatedAt: string;  // ISO 8601 timestamp

  // Derived fields (computed, not stored)
  canEdit: boolean;    // True if current user is creator or host
  canDelete: boolean;  // True if current user is creator or host
}

/**
 * Success response for creating a task
 * @requirement @TASK-002
 */
export interface CreateTaskSuccessResponse {
  task: Task;
}

// ============================================================================
// RESPONSE TYPES (ERROR)
// ============================================================================

/**
 * Error codes for task creation
 * @requirement @UX-003
 */
export type CreateTaskErrorCode =
  | 'VALIDATION_ERROR'      // Invalid input data
  | 'UNAUTHORIZED'          // User not authenticated or not session participant
  | 'SESSION_NOT_FOUND'     // Session doesn't exist
  | 'DATABASE_ERROR'        // Database operation failed
  | 'RATE_LIMIT_EXCEEDED';  // User created too many tasks too quickly

/**
 * Error response for task creation
 */
export interface CreateTaskErrorResponse {
  error: {
    code: CreateTaskErrorCode;
    message: string;
    retryable: boolean;
    validationErrors?: {
      text?: string[];
      day?: string[];
      comments?: string[];
    };
  };
}

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * UI state for task creation operation
 * @requirement @UX-002
 */
export type CreateTaskState = 'idle' | 'creating' | 'success' | 'error';

/**
 * Complete async state for task creation
 */
export type CreateTaskAsyncState =
  | { status: 'idle'; data: null; error: null }
  | { status: 'creating'; data: null; error: null; startedAt: string }
  | { status: 'success'; data: Task; error: null; createdAt: string }
  | { status: 'error'; data: null; error: CreateTaskErrorResponse; failedAt: string };

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Task repository interface
 * MUST be implemented by both TaskMockRepository and TaskSupabaseRepository
 */
export interface ITaskRepository {
  /**
   * Create a new task
   * @param request - Task creation parameters
   * @returns Promise resolving to created task or error
   * @throws Never throws - always returns typed response
   */
  createTask(
    request: CreateTaskRequest
  ): Promise<CreateTaskSuccessResponse | CreateTaskErrorResponse>;

  // Other operations...
  getTasks(request: GetTasksRequest): Promise<GetTasksSuccessResponse | GetTasksErrorResponse>;
  updateTask(request: UpdateTaskRequest): Promise<UpdateTaskSuccessResponse | UpdateTaskErrorResponse>;
  deleteTask(request: DeleteTaskRequest): Promise<DeleteTaskSuccessResponse | DeleteTaskErrorResponse>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isCreateTaskError(
  response: CreateTaskSuccessResponse | CreateTaskErrorResponse
): response is CreateTaskErrorResponse {
  return 'error' in response;
}

export function isCreateTaskSuccess(
  response: CreateTaskSuccessResponse | CreateTaskErrorResponse
): response is CreateTaskSuccessResponse {
  return 'task' in response;
}

// ============================================================================
// VALIDATION SCHEMAS (ZOD)
// ============================================================================

import { z } from 'zod';

export const CreateTaskRequestSchema = z.object({
  sessionId: z.string().uuid(),
  text: z.string().min(1).max(500).trim(),
  day: z.enum(['today', 'tomorrow']),
  isSecret: z.boolean(),
  comments: z.string().max(1000).trim().optional(),
  createdBy: z.string().uuid(),
  createdByName: z.string().min(1).max(100),
});

// Compile-time validation that schema matches interface
type ValidateCreateTaskSchema = z.infer<typeof CreateTaskRequestSchema> extends CreateTaskRequest
  ? CreateTaskRequest extends z.infer<typeof CreateTaskRequestSchema>
    ? true
    : false
  : false;
const createTaskSchemaValid: ValidateCreateTaskSchema = true;
```

---

## Contract Checklist

Before marking a contract as complete, verify:

- [ ] **Seam annotation** at top with `@seam`, `@description`, `@requirement`, `@boundary`
- [ ] **Request types** defined with full JSDoc comments
- [ ] **Success response** types defined
- [ ] **Error response** types defined with all error codes
- [ ] **State types** defined (idle, loading, success, error)
- [ ] **Service interface** defined that both mock and real will implement
- [ ] **Type guards** provided (`isXxxError`, `isXxxSuccess`)
- [ ] **Zod schemas** defined for runtime validation
- [ ] **Schema validation** compile-time check passes
- [ ] **Edge cases** documented (empty states, null values)
- [ ] **No `any` types** used anywhere
- [ ] **No `as` casts** needed in expected usage
- [ ] **All optional fields** use `?` or `| null` (not both)
- [ ] **Timestamps** use ISO 8601 string format
- [ ] **IDs** use UUID string format
- [ ] **Enums** use string literal unions (not TypeScript enums)
- [ ] **Comments** link back to PRD requirements with `@requirement`

---

## Anti-Patterns to Avoid

### ❌ DON'T: Use `any`
```typescript
// BAD
export interface TaskResponse {
  data: any;  // What is the shape?
}

// GOOD
export interface TaskResponse {
  data: Task;
}
```

### ❌ DON'T: Mix optional and nullable
```typescript
// BAD - ambiguous
export interface User {
  email?: string | null;  // Is missing different from null?
}

// GOOD - explicit
export interface User {
  email: string | null;  // Email required but can be null
  phoneNumber?: string;  // Phone optional (may not exist)
}
```

### ❌ DON'T: Use loose types
```typescript
// BAD
export interface Task {
  day: string;  // Which strings are valid?
}

// GOOD
export interface Task {
  day: 'today' | 'tomorrow';  // Exactly two valid values
}
```

### ❌ DON'T: Forget error states
```typescript
// BAD - only happy path
export interface CreateTaskResponse {
  task: Task;
}

// GOOD - both success and error
export type CreateTaskResponse =
  | CreateTaskSuccessResponse
  | CreateTaskErrorResponse;
```

### ❌ DON'T: Mix concerns
```typescript
// BAD - two seams in one
export interface IUserAndTaskRepository {
  getUser(): Promise<User>;
  createTask(): Promise<Task>;
}

// GOOD - separate seams
export interface IUserRepository {
  getUser(): Promise<User>;
}
export interface ITaskRepository {
  createTask(): Promise<Task>;
}
```

---

## Contract Validation Script

After writing contracts, run this validation script:

```bash
#!/bin/bash
# validate-contracts.sh

echo "Validating contracts..."

# Check for 'any' types
if grep -r ":\s*any" src/lib/contracts/; then
  echo "❌ FAIL: Found 'any' types in contracts"
  exit 1
fi

# Check for 'as' casts
if grep -r "\sas\s" src/lib/contracts/; then
  echo "❌ FAIL: Found 'as' casts in contracts"
  exit 1
fi

# Run TypeScript compiler
if ! npm run check; then
  echo "❌ FAIL: TypeScript errors in contracts"
  exit 1
fi

echo "✅ PASS: All contracts valid"
```

---

## Next Step: Implement Mocks (Step 4)

Once all contracts are defined and validated, proceed to Step 4: Build Mock Services that implement these interfaces exactly.

Every mock MUST:
1. Implement the contract interface
2. Return data matching the response types exactly
3. Pass `npm run check` with 0 errors
4. Be validated with contract tests

---

**Document Status**: ✅ Template Ready
**Usage**: Use this template for all 32 seams identified in DATA-BOUNDARIES.md

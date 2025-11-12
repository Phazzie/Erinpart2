/**
 * UI State Management Contracts
 *
 * @description Client-side state management types for async operations, forms, and modals
 * @requirement @UX-002 (loading states)
 * @requirement @UX-003 (error handling)
 * @boundary Internal Component State
 */

// ============================================================================
// SEAM-UI-STATE-001: Async Operation State
// ============================================================================

/**
 * @seam SEAM-UI-STATE-001
 * @description Generic async operation state machine with type-safe transitions
 * @requirement @UX-002 (loading states requirement)
 * @boundary Internal Component State
 *
 * This is a discriminated union representing all possible states of an async operation.
 * The `status` field is the discriminant, ensuring type-safe state checking.
 *
 * Valid State Transitions:
 * - idle → loading (operation started)
 * - loading → success (operation completed successfully)
 * - loading → error (operation failed)
 * - success → loading (refresh/reload operation)
 * - error → loading (retry operation)
 * - error → idle (reset to initial state)
 *
 * Invalid State Transitions (will cause type errors if attempted):
 * - idle → success (cannot succeed without loading)
 * - idle → error (cannot fail without loading)
 * - loading → idle (cannot cancel to idle, only to error)
 * - success → error (cannot transition directly, must reload first)
 * - success → idle (maintain success state or reload)
 */
export type AsyncState<T, E = Error> =
  | {
      /**
       * Initial idle state - no operation in progress
       */
      status: 'idle';
      data: null;
      error: null;
    }
  | {
      /**
       * Loading state - operation in progress
       * @property startedAt - ISO 8601 timestamp when operation started
       */
      status: 'loading';
      data: null;
      error: null;
      startedAt: string;
    }
  | {
      /**
       * Success state - operation completed successfully
       * @property data - The successfully loaded data of type T
       * @property loadedAt - ISO 8601 timestamp when operation completed
       */
      status: 'success';
      data: T;
      error: null;
      loadedAt: string;
    }
  | {
      /**
       * Error state - operation failed
       * @property error - The error that occurred
       * @property failedAt - ISO 8601 timestamp when operation failed
       * @property retryable - Whether this operation can be retried
       */
      status: 'error';
      data: null;
      error: E;
      failedAt: string;
      retryable: boolean;
    };

/**
 * Helper type to extract the success data type from an AsyncState
 * @example type UserData = AsyncStateData<AsyncState<User>>; // User
 */
export type AsyncStateData<T> = T extends AsyncState<infer U, unknown> ? U : never;

/**
 * Helper type to extract the error type from an AsyncState
 * @example type UserError = AsyncStateError<AsyncState<User, CustomError>>; // CustomError
 */
export type AsyncStateError<T> = T extends AsyncState<unknown, infer E> ? E : never;

// ============================================================================
// TYPE GUARDS - SEAM-UI-STATE-001
// ============================================================================

/**
 * Type guard to check if async state is idle
 * @param state - The async state to check
 * @returns True if state is idle
 */
export function isAsyncIdle<T, E>(state: AsyncState<T, E>): state is Extract<AsyncState<T, E>, { status: 'idle' }> {
  return state.status === 'idle';
}

/**
 * Type guard to check if async state is loading
 * @param state - The async state to check
 * @returns True if state is loading
 */
export function isAsyncLoading<T, E>(state: AsyncState<T, E>): state is Extract<AsyncState<T, E>, { status: 'loading' }> {
  return state.status === 'loading';
}

/**
 * Type guard to check if async state is success
 * @param state - The async state to check
 * @returns True if state is success (and data is available)
 */
export function isAsyncSuccess<T, E>(state: AsyncState<T, E>): state is Extract<AsyncState<T, E>, { status: 'success' }> {
  return state.status === 'success';
}

/**
 * Type guard to check if async state is error
 * @param state - The async state to check
 * @returns True if state is error (and error object is available)
 */
export function isAsyncError<T, E>(state: AsyncState<T, E>): state is Extract<AsyncState<T, E>, { status: 'error' }> {
  return state.status === 'error';
}

/**
 * Type guard to check if async state has data (success state)
 * @param state - The async state to check
 * @returns True if data is available
 */
export function hasAsyncData<T, E>(state: AsyncState<T, E>): state is Extract<AsyncState<T, E>, { status: 'success' }> {
  return isAsyncSuccess(state);
}

/**
 * Type guard to check if async state is in a terminal state (success or error)
 * @param state - The async state to check
 * @returns True if state is terminal (not idle or loading)
 */
export function isAsyncTerminal<T, E>(
  state: AsyncState<T, E>
): state is Extract<AsyncState<T, E>, { status: 'success' }> | Extract<AsyncState<T, E>, { status: 'error' }> {
  return state.status === 'success' || state.status === 'error';
}

// ============================================================================
// SEAM-UI-STATE-002: Form State
// ============================================================================

/**
 * @seam SEAM-UI-STATE-002
 * @description Generic form state management type
 * @requirement @UX-003 (error handling requirement)
 * @boundary Internal Component State
 *
 * Tracks all aspects of form state including values, validation, touched fields,
 * and submission status. Generic over the form values type T.
 *
 * Key Concepts:
 * - values: Current form field values
 * - errors: Field-level validation errors (empty array = valid)
 * - touched: Whether user has interacted with each field
 * - isDirty: Whether form has been modified from initial state
 * - isValid: Whether all fields pass validation
 * - isSubmitting: Whether form is currently being submitted
 * - submitCount: Number of submission attempts (for UX logic)
 */
export interface FormState<T extends Record<string, unknown>> {
  /**
   * Current form values
   * @example { email: 'user@example.com', password: 'secret123' }
   */
  values: T;

  /**
   * Validation errors per field
   * Empty array means field is valid
   * @example { email: ['Email is required'], password: [] }
   */
  errors: Record<keyof T, string[]>;

  /**
   * Whether each field has been interacted with (focused/blurred)
   * Used to control when to show validation errors
   * @example { email: true, password: false }
   */
  touched: Record<keyof T, boolean>;

  /**
   * Whether form has been modified from initial values
   * Useful for "unsaved changes" warnings
   */
  isDirty: boolean;

  /**
   * Whether all fields pass validation
   * Computed from errors object (all error arrays are empty)
   */
  isValid: boolean;

  /**
   * Whether form is currently being submitted
   * Used to disable submit button and show loading state
   */
  isSubmitting: boolean;

  /**
   * Number of times form submission has been attempted
   * Useful for progressive validation (show errors after first attempt)
   */
  submitCount: number;
}

/**
 * Helper type to extract form values type from FormState
 * @example type LoginValues = FormStateValues<FormState<LoginForm>>; // LoginForm
 */
export type FormStateValues<T> = T extends FormState<infer U> ? U : never;

/**
 * Represents a single field's state within a form
 * @template T - The type of the field value
 */
export interface FormFieldState<T> {
  /**
   * Current field value
   */
  value: T;

  /**
   * Field-level validation errors
   */
  errors: string[];

  /**
   * Whether field has been interacted with
   */
  touched: boolean;

  /**
   * Whether field is valid
   */
  isValid: boolean;
}

// ============================================================================
// TYPE GUARDS - SEAM-UI-STATE-002
// ============================================================================

/**
 * Type guard to check if form is valid
 * @param state - The form state to check
 * @returns True if form is valid
 */
export function isFormValid<T extends Record<string, unknown>>(state: FormState<T>): boolean {
  return state.isValid;
}

/**
 * Type guard to check if form is dirty
 * @param state - The form state to check
 * @returns True if form has been modified
 */
export function isFormDirty<T extends Record<string, unknown>>(state: FormState<T>): boolean {
  return state.isDirty;
}

/**
 * Type guard to check if form is submitting
 * @param state - The form state to check
 * @returns True if form is currently submitting
 */
export function isFormSubmitting<T extends Record<string, unknown>>(state: FormState<T>): boolean {
  return state.isSubmitting;
}

/**
 * Type guard to check if form has been submitted at least once
 * @param state - The form state to check
 * @returns True if form has been submitted
 */
export function hasFormBeenSubmitted<T extends Record<string, unknown>>(state: FormState<T>): boolean {
  return state.submitCount > 0;
}

/**
 * Type guard to check if a specific field has errors
 * @param state - The form state to check
 * @param field - The field name to check
 * @returns True if field has validation errors
 */
export function hasFieldErrors<T extends Record<string, unknown>>(
  state: FormState<T>,
  field: keyof T
): boolean {
  return state.errors[field].length > 0;
}

/**
 * Type guard to check if a specific field should show errors
 * Errors should show if field is touched OR form has been submitted
 * @param state - The form state to check
 * @param field - The field name to check
 * @returns True if field errors should be displayed
 */
export function shouldShowFieldErrors<T extends Record<string, unknown>>(
  state: FormState<T>,
  field: keyof T
): boolean {
  return hasFieldErrors(state, field) && (state.touched[field] || hasFormBeenSubmitted(state));
}

// ============================================================================
// SEAM-UI-STATE-003: Modal State
// ============================================================================

/**
 * @seam SEAM-UI-STATE-003
 * @description Modal/dialog state management
 * @requirement @UX-002 (loading states requirement)
 * @boundary Internal Component State
 *
 * Manages modal open/close state, content, and behavior configuration.
 *
 * State Transitions:
 * - closed (isOpen: false) → open (isOpen: true) with content
 * - open (isOpen: true) → closed (isOpen: false) via onClose callback
 *
 * Closing Triggers:
 * - User clicks close button (always triggers onClose)
 * - User clicks backdrop (if closeOnBackdrop is true)
 * - User presses Escape key (if closeOnEscape is true)
 * - Programmatic close (calling onClose directly)
 */
export interface ModalState<TContent = unknown> {
  /**
   * Whether modal is currently open
   */
  isOpen: boolean;

  /**
   * Modal content data
   * Null when modal is closed
   * Generic type allows type-safe content passing
   * @example { type: 'confirm', message: 'Are you sure?', action: deleteTask }
   */
  content: TContent | null;

  /**
   * Callback function to close the modal
   * Null when modal is closed
   * Should be called by modal component when user dismisses
   * @example () => setModalState({ ...modalState, isOpen: false })
   */
  onClose: (() => void) | null;

  /**
   * Whether clicking the backdrop (outside modal) should close it
   * @default true
   */
  closeOnBackdrop: boolean;

  /**
   * Whether pressing Escape key should close the modal
   * @default true
   */
  closeOnEscape: boolean;
}

/**
 * Helper type to extract modal content type from ModalState
 * @example type ConfirmModalContent = ModalStateContent<ModalState<ConfirmDialog>>; // ConfirmDialog
 */
export type ModalStateContent<T> = T extends ModalState<infer U> ? U : never;

/**
 * Common modal content types for type-safe modal usage
 */
export type ModalContent =
  | {
      type: 'confirm';
      title: string;
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      onConfirm: () => void | Promise<void>;
    }
  | {
      type: 'alert';
      title: string;
      message: string;
      okLabel?: string;
    }
  | {
      type: 'custom';
      component: string; // Component name or path
      props?: Record<string, unknown>;
    };

// ============================================================================
// TYPE GUARDS - SEAM-UI-STATE-003
// ============================================================================

/**
 * Type guard to check if modal is open
 * @param state - The modal state to check
 * @returns True if modal is open (and content/onClose are available)
 */
export function isModalOpen<TContent>(
  state: ModalState<TContent>
): state is ModalState<TContent> & { isOpen: true; content: TContent; onClose: () => void } {
  return state.isOpen && state.content !== null && state.onClose !== null;
}

/**
 * Type guard to check if modal is closed
 * @param state - The modal state to check
 * @returns True if modal is closed
 */
export function isModalClosed<TContent>(state: ModalState<TContent>): boolean {
  return !state.isOpen;
}

/**
 * Type guard to check if modal can be closed by backdrop click
 * @param state - The modal state to check
 * @returns True if backdrop closing is enabled
 */
export function canCloseOnBackdrop<TContent>(state: ModalState<TContent>): boolean {
  return state.closeOnBackdrop;
}

/**
 * Type guard to check if modal can be closed by Escape key
 * @param state - The modal state to check
 * @returns True if Escape closing is enabled
 */
export function canCloseOnEscape<TContent>(state: ModalState<TContent>): boolean {
  return state.closeOnEscape;
}

/**
 * Type guard to check modal content type (when using ModalContent union)
 * @param state - The modal state to check
 * @param type - The content type to check for
 * @returns True if modal content matches the specified type
 */
export function isModalContentType<T extends ModalContent['type']>(
  state: ModalState<ModalContent>,
  type: T
): state is ModalState<Extract<ModalContent, { type: T }>> {
  return isModalOpen(state) && state.content.type === type;
}

// ============================================================================
// FACTORY FUNCTIONS FOR INITIAL STATES
// ============================================================================

/**
 * Creates an initial idle async state
 * @returns AsyncState in idle status
 * @example const userState = createIdleAsyncState<User>();
 */
export function createIdleAsyncState<T, E = Error>(): AsyncState<T, E> {
  return {
    status: 'idle',
    data: null,
    error: null,
  };
}

/**
 * Creates an initial loading async state
 * @param startedAt - Optional timestamp (defaults to current time)
 * @returns AsyncState in loading status
 */
export function createLoadingAsyncState<T, E = Error>(startedAt?: string): AsyncState<T, E> {
  return {
    status: 'loading',
    data: null,
    error: null,
    startedAt: startedAt ?? new Date().toISOString(),
  };
}

/**
 * Creates a success async state
 * @param data - The successful data
 * @param loadedAt - Optional timestamp (defaults to current time)
 * @returns AsyncState in success status
 */
export function createSuccessAsyncState<T, E = Error>(data: T, loadedAt?: string): AsyncState<T, E> {
  return {
    status: 'success',
    data,
    error: null,
    loadedAt: loadedAt ?? new Date().toISOString(),
  };
}

/**
 * Creates an error async state
 * @param error - The error object
 * @param retryable - Whether the operation can be retried
 * @param failedAt - Optional timestamp (defaults to current time)
 * @returns AsyncState in error status
 */
export function createErrorAsyncState<T, E = Error>(
  error: E,
  retryable: boolean,
  failedAt?: string
): AsyncState<T, E> {
  return {
    status: 'error',
    data: null,
    error,
    failedAt: failedAt ?? new Date().toISOString(),
    retryable,
  };
}

/**
 * Creates an initial form state with default values
 * @param initialValues - The initial form values
 * @returns FormState with all fields initialized
 * @example const loginForm = createInitialFormState({ email: '', password: '' });
 */
export function createInitialFormState<T extends Record<string, unknown>>(initialValues: T): FormState<T> {
  const errors = {} as Record<keyof T, string[]>;
  const touched = {} as Record<keyof T, boolean>;

  // Initialize errors and touched for all fields
  for (const key in initialValues) {
    errors[key] = [];
    touched[key] = false;
  }

  return {
    values: initialValues,
    errors,
    touched,
    isDirty: false,
    isValid: true,
    isSubmitting: false,
    submitCount: 0,
  };
}

/**
 * Creates an initial closed modal state
 * @returns ModalState in closed status
 * @example const confirmModal = createClosedModalState<ConfirmDialogContent>();
 */
export function createClosedModalState<TContent = unknown>(): ModalState<TContent> {
  return {
    isOpen: false,
    content: null,
    onClose: null,
    closeOnBackdrop: true,
    closeOnEscape: true,
  };
}

/**
 * Creates an open modal state with content
 * @param content - The modal content
 * @param onClose - The close callback
 * @param options - Optional configuration for backdrop and escape closing
 * @returns ModalState in open status
 */
export function createOpenModalState<TContent>(
  content: TContent,
  onClose: () => void,
  options?: {
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
  }
): ModalState<TContent> {
  return {
    isOpen: true,
    content,
    onClose,
    closeOnBackdrop: options?.closeOnBackdrop ?? true,
    closeOnEscape: options?.closeOnEscape ?? true,
  };
}

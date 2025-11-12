/**
 * Utility functions index
 * Exports all utility functions for easy importing
 */

// Validation utilities
export { validateWithSchema, extractValidationErrors, safeValidate } from './validation';

// Formatting utilities
export { formatDate, formatTime, formatRelativeTime, truncateText } from './formatting';

// Error handling utilities
export { extractErrorMessage, isNetworkError, getErrorCode } from './error-handling';

// Class name utility
export { cn } from './cn';

// Constants
export {
	APP_NAME,
	MAX_SESSION_PARTICIPANTS,
	MAX_TASK_LENGTH,
	TASK_VOTE_THRESHOLD,
	TOAST_DURATION,
	API_TIMEOUT,
	ANIMAL_CODES,
	type AnimalCode
} from './constants';

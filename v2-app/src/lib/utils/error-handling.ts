/**
 * Extracts error message from various error types
 * @param error - Error of any type (Error, string, object, etc.)
 * @returns Readable error message string
 * @example
 * extractErrorMessage(new Error('Failed')) // "Failed"
 * extractErrorMessage('Something went wrong') // "Something went wrong"
 * extractErrorMessage({ message: 'Error' }) // "Error"
 */
export function extractErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	if (error && typeof error === 'object' && 'message' in error) {
		return String(error.message);
	}
	return 'An unknown error occurred';
}

/**
 * Checks if error is network-related
 * @param error - Error to check
 * @returns True if error appears to be network-related
 * @example
 * isNetworkError(new Error('Network request failed')) // true
 * isNetworkError(new Error('Validation error')) // false
 */
export function isNetworkError(error: unknown): boolean {
	const message = extractErrorMessage(error).toLowerCase();
	return (
		message.includes('network') ||
		message.includes('fetch') ||
		message.includes('connection') ||
		message.includes('timeout')
	);
}

/**
 * Extracts error code from error response
 * @param error - Error object that might contain a code
 * @returns Error code as string, or null if not found
 * @example
 * getErrorCode({ code: 'AUTH_FAILED' }) // "AUTH_FAILED"
 * getErrorCode(new Error('Failed')) // null
 */
export function getErrorCode(error: unknown): string | null {
	if (error && typeof error === 'object' && 'code' in error) {
		return String(error.code);
	}
	return null;
}

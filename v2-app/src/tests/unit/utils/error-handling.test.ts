import { describe, it, expect } from 'vitest';
import { extractErrorMessage, isNetworkError, getErrorCode } from '$lib/utils/error-handling';

describe('error-handling utils', () => {
	describe('extractErrorMessage', () => {
		it('should extract message from Error object', () => {
			const error = new Error('Something went wrong');
			const result = extractErrorMessage(error);
			expect(result).toBe('Something went wrong');
		});

		it('should handle string errors', () => {
			const error = 'Simple error string';
			const result = extractErrorMessage(error);
			expect(result).toBe('Simple error string');
		});

		it('should extract message from object with message property', () => {
			const error = { message: 'Custom error message' };
			const result = extractErrorMessage(error);
			expect(result).toBe('Custom error message');
		});

		it('should handle unknown error types', () => {
			const error = 123;
			const result = extractErrorMessage(error);
			expect(result).toBe('An unknown error occurred');
		});

		it('should handle null', () => {
			const error = null;
			const result = extractErrorMessage(error);
			expect(result).toBe('An unknown error occurred');
		});

		it('should handle undefined', () => {
			const error = undefined;
			const result = extractErrorMessage(error);
			expect(result).toBe('An unknown error occurred');
		});

		it('should handle TypeError', () => {
			const error = new TypeError('Type error occurred');
			const result = extractErrorMessage(error);
			expect(result).toBe('Type error occurred');
		});

		it('should handle objects with non-string message', () => {
			const error = { message: 123 };
			const result = extractErrorMessage(error);
			expect(result).toBe('123');
		});
	});

	describe('isNetworkError', () => {
		it('should detect network errors from message', () => {
			const error = new Error('Network request failed');
			const result = isNetworkError(error);
			expect(result).toBe(true);
		});

		it('should detect fetch errors', () => {
			const error = new Error('Failed to fetch');
			const result = isNetworkError(error);
			expect(result).toBe(true);
		});

		it('should detect connection errors', () => {
			const error = new Error('Connection refused');
			const result = isNetworkError(error);
			expect(result).toBe(true);
		});

		it('should detect timeout errors', () => {
			const error = new Error('Request timeout');
			const result = isNetworkError(error);
			expect(result).toBe(true);
		});

		it('should not flag non-network errors', () => {
			const error = new Error('Validation failed');
			const result = isNetworkError(error);
			expect(result).toBe(false);
		});

		it('should be case insensitive', () => {
			const error = new Error('NETWORK ERROR');
			const result = isNetworkError(error);
			expect(result).toBe(true);
		});

		it('should handle string errors', () => {
			const error = 'Network connection lost';
			const result = isNetworkError(error);
			expect(result).toBe(true);
		});

		it('should handle objects with message', () => {
			const error = { message: 'Fetch failed' };
			const result = isNetworkError(error);
			expect(result).toBe(true);
		});
	});

	describe('getErrorCode', () => {
		it('should extract code from error object', () => {
			const error = { code: 'AUTH_FAILED' };
			const result = getErrorCode(error);
			expect(result).toBe('AUTH_FAILED');
		});

		it('should return null for Error without code', () => {
			const error = new Error('Something went wrong');
			const result = getErrorCode(error);
			expect(result).toBe(null);
		});

		it('should return null for string errors', () => {
			const error = 'Error string';
			const result = getErrorCode(error);
			expect(result).toBe(null);
		});

		it('should return null for null', () => {
			const error = null;
			const result = getErrorCode(error);
			expect(result).toBe(null);
		});

		it('should return null for undefined', () => {
			const error = undefined;
			const result = getErrorCode(error);
			expect(result).toBe(null);
		});

		it('should convert numeric codes to strings', () => {
			const error = { code: 404 };
			const result = getErrorCode(error);
			expect(result).toBe('404');
		});

		it('should handle Error objects with code property', () => {
			const error = new Error('Failed');
			(error as any).code = 'ECONNREFUSED';
			const result = getErrorCode(error);
			expect(result).toBe('ECONNREFUSED');
		});

		it('should handle objects with non-string code', () => {
			const error = { code: true };
			const result = getErrorCode(error);
			expect(result).toBe('true');
		});
	});
});

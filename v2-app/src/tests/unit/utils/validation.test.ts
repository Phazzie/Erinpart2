import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateWithSchema, extractValidationErrors, safeValidate } from '$lib/utils/validation';

describe('validation utils', () => {
	const userSchema = z.object({
		name: z.string().min(1),
		email: z.string().email(),
		age: z.number().min(0)
	});

	describe('validateWithSchema', () => {
		it('should validate valid data', () => {
			const data = { name: 'John', email: 'john@example.com', age: 30 };
			const result = validateWithSchema(userSchema, data);
			expect(result).toEqual(data);
		});

		it('should throw on invalid data', () => {
			const data = { name: '', email: 'invalid', age: -1 };
			expect(() => validateWithSchema(userSchema, data)).toThrow();
		});

		it('should throw ZodError on validation failure', () => {
			const data = { name: 'John', email: 'not-an-email', age: 25 };
			expect(() => validateWithSchema(userSchema, data)).toThrow(z.ZodError);
		});

		it('should validate nested objects', () => {
			const nestedSchema = z.object({
				user: z.object({
					name: z.string(),
					id: z.number()
				})
			});
			const data = { user: { name: 'Alice', id: 1 } };
			const result = validateWithSchema(nestedSchema, data);
			expect(result).toEqual(data);
		});

		it('should validate arrays', () => {
			const arraySchema = z.array(z.string());
			const data = ['a', 'b', 'c'];
			const result = validateWithSchema(arraySchema, data);
			expect(result).toEqual(data);
		});
	});

	describe('extractValidationErrors', () => {
		it('should extract error messages', () => {
			const data = { name: '', email: 'invalid', age: -1 };
			try {
				validateWithSchema(userSchema, data);
			} catch (error) {
				const messages = extractValidationErrors(error as z.ZodError);
				expect(messages.length).toBeGreaterThan(0);
				expect(messages.some((m) => m.includes('name'))).toBe(true);
			}
		});

		it('should format errors with field paths', () => {
			const data = { name: '', email: 'invalid', age: -1 };
			try {
				validateWithSchema(userSchema, data);
			} catch (error) {
				const messages = extractValidationErrors(error as z.ZodError);
				expect(messages.some((m) => m.startsWith('name:'))).toBe(true);
				expect(messages.some((m) => m.startsWith('email:'))).toBe(true);
			}
		});

		it('should handle nested field errors', () => {
			const nestedSchema = z.object({
				user: z.object({
					email: z.string().email()
				})
			});
			const data = { user: { email: 'invalid' } };
			try {
				validateWithSchema(nestedSchema, data);
			} catch (error) {
				const messages = extractValidationErrors(error as z.ZodError);
				expect(messages.some((m) => m.includes('user.email'))).toBe(true);
			}
		});

		it('should handle root-level errors', () => {
			const stringSchema = z.string();
			try {
				validateWithSchema(stringSchema, 123);
			} catch (error) {
				const messages = extractValidationErrors(error as z.ZodError);
				expect(messages.length).toBeGreaterThan(0);
			}
		});

		it('should extract multiple error messages', () => {
			const data = { name: '', email: 'not-email', age: -5 };
			try {
				validateWithSchema(userSchema, data);
			} catch (error) {
				const messages = extractValidationErrors(error as z.ZodError);
				expect(messages.length).toBeGreaterThanOrEqual(3);
			}
		});
	});

	describe('safeValidate', () => {
		it('should return success for valid data', () => {
			const data = { name: 'John', email: 'john@example.com', age: 30 };
			const result = safeValidate(userSchema, data);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(data);
			}
		});

		it('should return errors for invalid data', () => {
			const data = { name: '', email: 'invalid', age: -1 };
			const result = safeValidate(userSchema, data);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.length).toBeGreaterThan(0);
			}
		});

		it('should not throw on validation failure', () => {
			const data = { name: '', email: 'invalid', age: -1 };
			expect(() => safeValidate(userSchema, data)).not.toThrow();
		});

		it('should provide error messages on failure', () => {
			const data = { name: '', email: 'not-email', age: -1 };
			const result = safeValidate(userSchema, data);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.length).toBeGreaterThan(0);
				expect(result.errors.some((e) => e.includes('email'))).toBe(true);
			}
		});

		it('should preserve data type on success', () => {
			const data = { name: 'John', email: 'john@example.com', age: 30 };
			const result = safeValidate(userSchema, data);
			if (result.success) {
				// Type check - should not have 'errors' property
				expect('errors' in result).toBe(false);
				expect(result.data.name).toBe('John');
			}
		});
	});
});

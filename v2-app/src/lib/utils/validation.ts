import { z, ZodError } from 'zod';

/**
 * Validates data against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Validated data conforming to schema type
 * @throws {ZodError} If validation fails
 */
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
	return schema.parse(data);
}

/**
 * Extracts readable error messages from ZodError
 * @param error - The ZodError to extract messages from
 * @returns Array of formatted error messages
 */
export function extractValidationErrors(error: ZodError): string[] {
	return error.issues.map((err) => {
		const path = err.path.join('.');
		return path ? `${path}: ${err.message}` : err.message;
	});
}

/**
 * Safe validation that returns success/error result
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Success object with data or failure object with errors
 */
export function safeValidate<T>(
	schema: z.ZodSchema<T>,
	data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	} else {
		return { success: false, errors: extractValidationErrors(result.error) };
	}
}

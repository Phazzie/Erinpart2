import { describe, it, expect } from 'vitest';
import { cn } from '$lib/utils/cn';

describe('cn utility', () => {
	it('should merge class strings', () => {
		const result = cn('px-4 py-2', 'bg-blue-500');
		expect(result).toBe('px-4 py-2 bg-blue-500');
	});

	it('should handle conditional classes with objects', () => {
		const result = cn('px-4', { 'py-2': true, 'bg-red-500': false });
		expect(result).toBe('px-4 py-2');
	});

	it('should handle Tailwind class conflicts (later wins)', () => {
		const result = cn('px-2', 'px-4');
		expect(result).toBe('px-4');
	});

	it('should handle multiple conflicting classes', () => {
		const result = cn('px-2 py-2', 'px-4');
		expect(result).toBe('py-2 px-4');
	});

	it('should merge background color classes correctly', () => {
		const result = cn('bg-red-500', 'bg-blue-500');
		expect(result).toBe('bg-blue-500');
	});

	it('should handle arrays of classes', () => {
		const result = cn(['px-4', 'py-2'], 'bg-blue-500');
		expect(result).toBe('px-4 py-2 bg-blue-500');
	});

	it('should handle undefined and null values', () => {
		const result = cn('px-4', undefined, null, 'py-2');
		expect(result).toBe('px-4 py-2');
	});

	it('should handle empty strings', () => {
		const result = cn('px-4', '', 'py-2');
		expect(result).toBe('px-4 py-2');
	});

	it('should handle complex conditional logic', () => {
		const isActive = true;
		const isDisabled = false;
		const result = cn('base-class', {
			'active-class': isActive,
			'disabled-class': isDisabled
		});
		expect(result).toBe('base-class active-class');
	});

	it('should handle hover and focus variants', () => {
		const result = cn('hover:bg-blue-500', 'hover:bg-red-500');
		expect(result).toBe('hover:bg-red-500');
	});

	it('should handle responsive classes', () => {
		const result = cn('px-2 md:px-4', 'lg:px-6');
		expect(result).toBe('px-2 md:px-4 lg:px-6');
	});

	it('should handle dark mode variants', () => {
		const result = cn('bg-white dark:bg-gray-900', 'text-black dark:text-white');
		expect(result).toBe('bg-white dark:bg-gray-900 text-black dark:text-white');
	});

	it('should deduplicate identical classes', () => {
		const result = cn('px-4 py-2', 'px-4 bg-blue-500');
		expect(result).toBe('py-2 px-4 bg-blue-500');
	});

	it('should handle no arguments', () => {
		const result = cn();
		expect(result).toBe('');
	});

	it('should handle single argument', () => {
		const result = cn('px-4 py-2');
		expect(result).toBe('px-4 py-2');
	});

	it('should handle nested arrays', () => {
		const result = cn(['px-4', ['py-2', 'bg-blue-500']]);
		expect(result).toBe('px-4 py-2 bg-blue-500');
	});
});

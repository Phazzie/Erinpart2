import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, formatTime, formatRelativeTime, truncateText } from '$lib/utils/formatting';

describe('formatting utils', () => {
	describe('formatDate', () => {
		it('should format date with short format', () => {
			const date = new Date('2025-01-15T12:00:00Z');
			const result = formatDate(date, 'short');
			expect(result).toMatch(/Jan 15, 2025/);
		});

		it('should format date with long format', () => {
			const date = new Date('2025-01-15T12:00:00Z');
			const result = formatDate(date, 'long');
			expect(result).toMatch(/January 15, 2025/);
		});

		it('should format date with numeric format', () => {
			const date = new Date('2025-01-15T12:00:00Z');
			const result = formatDate(date, 'numeric');
			expect(result).toMatch(/01\/15\/2025/);
		});

		it('should default to short format', () => {
			const date = new Date('2025-01-15T12:00:00Z');
			const result = formatDate(date);
			expect(result).toMatch(/Jan 15, 2025/);
		});

		it('should handle ISO string input', () => {
			const result = formatDate('2025-01-15T12:00:00Z', 'short');
			expect(result).toMatch(/Jan 15, 2025/);
		});

		it('should handle different months', () => {
			const date = new Date('2025-12-31T12:00:00Z');
			const result = formatDate(date, 'short');
			expect(result).toMatch(/Dec 31, 2025/);
		});
	});

	describe('formatTime', () => {
		it('should format time in 12-hour format', () => {
			const date = new Date('2025-01-15T15:45:00Z');
			const result = formatTime(date);
			// Result will vary based on timezone, but should match the pattern
			expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
		});

		it('should handle ISO string input', () => {
			const result = formatTime('2025-01-15T09:30:00Z');
			expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
		});

		it('should include AM/PM indicator', () => {
			const morning = new Date('2025-01-15T09:00:00Z');
			const result = formatTime(morning);
			expect(result).toMatch(/(AM|PM)/);
		});

		it('should format midnight correctly', () => {
			const midnight = new Date('2025-01-15T00:00:00Z');
			const result = formatTime(midnight);
			expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
		});

		it('should format noon correctly', () => {
			const noon = new Date('2025-01-15T12:00:00Z');
			const result = formatTime(noon);
			expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
		});
	});

	describe('formatRelativeTime', () => {
		beforeEach(() => {
			// Mock Date.now() to return a fixed time
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should return "just now" for recent times', () => {
			const date = new Date('2025-01-15T11:59:30Z'); // 30 seconds ago
			const result = formatRelativeTime(date);
			expect(result).toBe('just now');
		});

		it('should return minutes for recent times', () => {
			const date = new Date('2025-01-15T11:30:00Z'); // 30 minutes ago
			const result = formatRelativeTime(date);
			expect(result).toBe('30 minutes ago');
		});

		it('should return singular minute', () => {
			const date = new Date('2025-01-15T11:59:00Z'); // 1 minute ago
			const result = formatRelativeTime(date);
			expect(result).toBe('1 minute ago');
		});

		it('should return hours for times within 24 hours', () => {
			const date = new Date('2025-01-15T09:00:00Z'); // 3 hours ago
			const result = formatRelativeTime(date);
			expect(result).toBe('3 hours ago');
		});

		it('should return singular hour', () => {
			const date = new Date('2025-01-15T11:00:00Z'); // 1 hour ago
			const result = formatRelativeTime(date);
			expect(result).toBe('1 hour ago');
		});

		it('should return days for times within a week', () => {
			const date = new Date('2025-01-13T12:00:00Z'); // 2 days ago
			const result = formatRelativeTime(date);
			expect(result).toBe('2 days ago');
		});

		it('should return singular day', () => {
			const date = new Date('2025-01-14T12:00:00Z'); // 1 day ago
			const result = formatRelativeTime(date);
			expect(result).toBe('1 day ago');
		});

		it('should return formatted date for times over a week', () => {
			const date = new Date('2025-01-01T12:00:00Z'); // 14 days ago
			const result = formatRelativeTime(date);
			expect(result).toMatch(/Jan 1, 2025/);
		});

		it('should handle ISO string input', () => {
			const result = formatRelativeTime('2025-01-15T11:30:00Z');
			expect(result).toBe('30 minutes ago');
		});
	});

	describe('truncateText', () => {
		it('should not truncate text shorter than max length', () => {
			const text = 'Hello';
			const result = truncateText(text, 10);
			expect(result).toBe('Hello');
		});

		it('should not truncate text equal to max length', () => {
			const text = 'Hello';
			const result = truncateText(text, 5);
			expect(result).toBe('Hello');
		});

		it('should truncate text longer than max length', () => {
			const text = 'Hello World';
			const result = truncateText(text, 8);
			expect(result).toBe('Hello...');
		});

		it('should include ellipsis in length calculation', () => {
			const text = 'Hello World';
			const result = truncateText(text, 8);
			expect(result.length).toBe(8);
		});

		it('should handle very short max lengths', () => {
			const text = 'Hello';
			const result = truncateText(text, 3);
			expect(result).toBe('...');
		});

		it('should handle empty strings', () => {
			const text = '';
			const result = truncateText(text, 10);
			expect(result).toBe('');
		});

		it('should handle long text', () => {
			const text = 'This is a very long piece of text that needs to be truncated';
			const result = truncateText(text, 20);
			expect(result).toBe('This is a very lo...');
			expect(result.length).toBe(20);
		});
	});
});

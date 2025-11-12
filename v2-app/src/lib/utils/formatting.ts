/**
 * Formats a date to a readable string
 * @param date - Date to format (Date object or ISO string)
 * @param format - Format type ('short' | 'long' | 'numeric')
 * @returns Formatted date string
 * @example
 * formatDate(new Date('2025-01-15'), 'short') // "Jan 15, 2025"
 * formatDate(new Date('2025-01-15'), 'long') // "January 15, 2025"
 * formatDate(new Date('2025-01-15'), 'numeric') // "01/15/2025"
 */
export function formatDate(
	date: Date | string,
	format: 'short' | 'long' | 'numeric' = 'short'
): string {
	const d = typeof date === 'string' ? new Date(date) : date;

	if (format === 'short') {
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	} else if (format === 'long') {
		return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	} else {
		return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
	}
}

/**
 * Formats a time to a readable string
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted time string (12-hour format)
 * @example
 * formatTime(new Date('2025-01-15T15:45:00')) // "3:45 PM"
 */
export function formatTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Formats a date as relative time (e.g., "2 hours ago")
 * @param date - Date to format (Date object or ISO string)
 * @returns Relative time string
 * @example
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 30)) // "30 minutes ago"
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 2)) // "2 hours ago"
 */
export function formatRelativeTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return 'just now';
	if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
	if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
	if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
	return formatDate(d);
}

/**
 * Truncates text to max length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (including ellipsis)
 * @returns Truncated text with ellipsis if needed
 * @example
 * truncateText("Hello World", 8) // "Hello..."
 * truncateText("Hi", 10) // "Hi"
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 3) + '...';
}

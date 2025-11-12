import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper precedence
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts
 * @param inputs - Class values (strings, objects, arrays)
 * @returns Merged class string with proper Tailwind precedence
 * @example
 * cn('px-4 py-2', 'bg-blue-500') // "px-4 py-2 bg-blue-500"
 * cn('px-4', { 'py-2': true, 'bg-red-500': false }) // "px-4 py-2"
 * cn('px-2', 'px-4') // "px-4" (later class wins)
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

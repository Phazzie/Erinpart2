/**
 * Application-wide constants
 */

/** Application name */
export const APP_NAME = "Erin's Escapades";

/** Maximum number of participants allowed in a session */
export const MAX_SESSION_PARTICIPANTS = 10;

/** Maximum length for task descriptions */
export const MAX_TASK_LENGTH = 500;

/** Number of votes required for a task to be accepted */
export const TASK_VOTE_THRESHOLD = 2;

/** Duration to display toast notifications (milliseconds) */
export const TOAST_DURATION = 3000;

/** API request timeout (milliseconds) */
export const API_TIMEOUT = 10000;

/** Available animal codes for participant avatars */
export const ANIMAL_CODES = [
	'cat',
	'dog',
	'fox',
	'owl',
	'dolphin',
	'penguin',
	'koala',
	'panda',
	'tiger',
	'bear',
	'wolf',
	'eagle'
] as const;

/** Type representing valid animal codes */
export type AnimalCode = (typeof ANIMAL_CODES)[number];

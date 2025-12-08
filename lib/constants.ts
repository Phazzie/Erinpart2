// Database table names - single source of truth
export const DB_TABLES = {
  ROOMS: 'rooms',
  TASKS: 'tasks',
  VOTES: 'votes',
} as const

// App configuration
export const CONFIG = {
  VOTE_THRESHOLD_FOR_REVEAL: 2,
  MAX_BATCH_SIZE: 100,
  ROOM_EXPIRY_DAYS: 7,
} as const

/**
 * Represents a single task item within a room.
 * Simplified schema: just id, room_id, text, creator_name, created_at
 */
export interface Task {
  id: string
  room_id?: string       // New schema uses room_id
  session_id?: string    // Legacy - kept for compatibility
  text: string
  creator_name?: string  // New schema uses creator_name
  created_at: string

  // Legacy fields - optional for backwards compatibility
  is_complete?: boolean
  choice?: 'yes' | 'no' | 'maybe' | ''
  day?: 'today' | 'tomorrow'
  order_index?: number
  comments?: string
  updated_at?: string
  created_by?: string
  is_secret?: boolean
  votes?: string[]
  user_name?: string
}

/**
 * Represents a "Vibe" or a template of tasks for a session.
 */
export interface Vibe {
  id: string
  name: string
  display_name: string
  description?: string
  tasks: string[]
  category: string
  is_default: boolean
}

/**
 * Represents a user profile.
 */
export interface UserProfile {
  id: string
  email: string
  avatar_url?: string
}

/**
 * A normalized per-user choice for a given task.
 */
export type Choice = 'yes' | 'no' | 'maybe' | ''

export interface TaskChoice {
  id: string
  task_id: string
  user_id: string  // Maps to voter_name in new schema
  choice: Exclude<Choice, ''>
  created_at: string
  updated_at?: string  // Optional - not in simplified schema
}

/**
 * Represents a collaborative list that can be created and verified by multiple users
 */
export interface CollaborativeList {
  id: string
  session_id: string
  title: string
  list_type: 'bullet' | 'numbered'
  creator_id: string
  creator_name: string
  created_at: string
  updated_at: string
}

/**
 * Represents an item in a collaborative list with verification states
 */
export interface ListItem {
  id: string
  list_id: string
  text: string
  order_index: number
  created_at: string
  updated_at: string
}

/**
 * Represents a verification/vote on a list item
 */
export interface ListItemVerification {
  id: string
  item_id: string
  user_id: string
  user_name: string
  is_accurate: boolean // true = green, false = red
  correction_text?: string // Only present when is_accurate = false
  created_at: string
  updated_at: string
}

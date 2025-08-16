/**
 * Represents a single task item within a session.
 */
export interface Task {
  id: string;
  session_id: string;
  text: string;
  is_complete: boolean;
  /**
   * Deprecated: Per-user choices moved to task_choices table. This field is no longer used by UI logic.
   */
  choice: 'yes' | 'no' | 'maybe' | '';
  day: 'today' | 'tomorrow';
  order_index: number;
  comments: string;
  created_at: string;
  updated_at: string;
  created_by: string;

  // New fields for the Secret Task feature
  is_secret: boolean; // If true, the task text is hidden until revealed
  votes: string[]; // Array of user IDs who have voted to reveal the task
}

/**
 * Represents a "Vibe" or a template of tasks for a session.
 */
export interface Vibe {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  tasks: string[];
  category: string;
  is_default: boolean;
}

/**
 * Represents a user profile.
 */
export interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
}

/**
 * A normalized per-user choice for a given task.
 */
export type Choice = 'yes' | 'no' | 'maybe' | ''

export interface TaskChoice {
  id: string;
  task_id: string;
  user_id: string;
  choice: Exclude<Choice, ''>;
  created_at: string;
  updated_at: string;
}

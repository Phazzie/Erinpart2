export interface Task {
  id: string;
  session_id: string;
  text: string;
  choice: 'yes' | 'no' | 'maybe' | '';
  day: 'today' | 'tomorrow';
  order_index: number;
  comments: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Vibe {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  tasks: string[];
  category: string;
  is_default: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
}

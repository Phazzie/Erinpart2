// This hook could manage task-related state and logic.
// For example, fetching tasks for a session, creating, updating, deleting tasks.

import { useState } from 'react';
import { mockTasks } from '@/lib/mock-data';
import { Task } from '@/lib/types';

export const useTasks = (sessionId: string) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks.filter(t => t.session_id === sessionId));

  // Add functions for task manipulation here

  return { tasks };
};

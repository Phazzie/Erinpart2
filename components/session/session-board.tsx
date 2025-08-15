'use client'

import { useState } from 'react'
import { mockTasks, mockVibes, mockUsers } from '@/lib/mock-data'
import DayToggle from '@/components/layout/day-toggle'
import SessionHeader from './session-header'
import TaskList from '../tasks/task-list'
import VibeSelector from '../vibes/vibe-selector'
import SessionDetails from './session-details'
import TaskForm from '../tasks/task-form'
import { Task, Vibe } from '@/lib/types'

/**
 * The main component that orchestrates the entire session view.
 * It manages the state for tasks, vibes, and UI selections.
 */
export default function SessionBoard() {
  // Mock the current user. In a real app, this would come from an auth context.
  const currentUserId = 'user-1';
  // Define the number of participants for the reveal threshold.
  const participantCount = mockUsers.length;

  // State for the list of tasks, initialized with mock data.
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  // State for the list of vibes, initialized with mock data.
  const [vibes] = useState<Vibe[]>(mockVibes)
  // State to track the currently selected day ('today' or 'tomorrow').
  const [currentDay, setCurrentDay] = useState<'today' | 'tomorrow'>('today')
  // State for the currently selected vibe.
  const [currentVibe, setCurrentVibe] = useState('chaos-gremlin')
  // State to track the currently selected task for viewing details.
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  /**
   * Updates a task in the state.
   * @param taskId The ID of the task to update.
   * @param updates An object with the properties of the task to update.
   */
  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t))
  }

  /**
   * Reorders tasks within the current day's list after a drag-and-drop action.
   * @param reorderedTasks The newly ordered array of tasks for the current day.
   */
  const handleReorderTasks = (reorderedTasks: Task[]) => {
    const otherDayTasks = tasks.filter(t => t.day !== currentDay);
    const updatedTasks = [...otherDayTasks, ...reorderedTasks].sort((a,b) => a.day.localeCompare(b.day) || a.order_index - b.order_index);
    setTasks(updatedTasks);
  }

  /**
   * Adds a new task to the list.
   * @param text The text content of the new task.
   * @param isSecret A boolean indicating if the task is secret.
   */
  const handleAddTask = (text: string, isSecret: boolean) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      session_id: 'session-1',
      text,
      choice: '',
      day: currentDay,
      order_index: tasks.filter(t => t.day === currentDay).length,
      comments: '',
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_secret: isSecret,
      votes: isSecret ? [currentUserId] : [], // Creator of a secret task automatically votes
    };
    setTasks([...tasks, newTask]);
  };

  /**
   * Handles a user's vote to reveal a secret task.
   * @param taskId The ID of the secret task to vote on.
   */
  const handleVoteToReveal = (taskId: string) => {
    setTasks(currentTasks => {
      // Create a new array to avoid direct state mutation
      const newTasks = [...currentTasks];
      const taskIndex = newTasks.findIndex(t => t.id === taskId);

      // If task is not found, do nothing
      if (taskIndex === -1) return currentTasks;

      const task = newTasks[taskIndex];

      // Add vote if the user hasn't voted already
      if (!task.votes.includes(currentUserId)) {
        task.votes.push(currentUserId);
      }

      // Check if the number of votes meets the threshold (e.g., all participants)
      // In a real app, you'd get the participant count from the session.
      if (task.votes.length >= participantCount) {
        task.is_secret = false; // Reveal the task!
      }

      // Return the updated tasks array to set the new state
      return newTasks;
    });
  };

  const filteredTasks = tasks.filter(task => task.day === currentDay)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <SessionHeader name="Erin's Escapades" />
        <DayToggle currentDay={currentDay} onDayChange={setCurrentDay} />
        <TaskList
          tasks={filteredTasks}
          onUpdateTask={handleUpdateTask}
          onReorderTasks={handleReorderTasks}
          selectedTask={selectedTask}
          onSelectTask={setSelectedTask}
          onVote={handleVoteToReveal}
          currentUserId={currentUserId}
        />
        <TaskForm onAddTask={handleAddTask} />
      </div>
      <div className="lg:col-span-4">
        <div className="sticky top-8 space-y-8">
          <VibeSelector
            vibes={vibes}
            currentVibe={currentVibe}
            onVibeChange={setCurrentVibe}
            isOwner={true} // Mocking as owner
          />
          <SessionDetails selectedTask={selectedTask} onUpdateTask={handleUpdateTask} />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import DayToggle from '@/components/layout/day-toggle'
import SessionHeader from './session-header'
import TaskList from '../tasks/task-list'
import VibeSelector from '../vibes/vibe-selector'
import SessionDetails from './session-details'
import TaskForm from '../tasks/task-form'
import { Task, Vibe } from '@/lib/types'
import { useSession } from '@/hooks/use-session'
import { useTasks } from '@/hooks/use-tasks'
import { mockVibes } from '@/lib/mock-data'

/**
 * The main component that orchestrates the entire session view.
 * It manages the state for tasks, vibes, and UI selections.
 */
export default function SessionBoard() {
  const { user, sessionId: defaultSessionId } = useSession()
  const [sessionId, setSessionId] = useState(defaultSessionId)
  const [answersEncoded, setAnswersEncoded] = useState<string | undefined>(undefined)
  const [guestAnswers, setGuestAnswers] = useState<Record<string, 'yes'|'no'|'maybe'|''>>({})

  const { tasks, addTask, updateTask } = useTasks(sessionId)
  // State for the list of vibes (still local for now).
  const [vibes] = useState<Vibe[]>(mockVibes)
  // State to track the currently selected day ('today' or 'tomorrow').
  const [currentDay, setCurrentDay] = useState<'today' | 'tomorrow'>('today')
  // State for the currently selected vibe.
  const [currentVibe, setCurrentVibe] = useState('chaos-gremlin')
  // State to track the currently selected task for viewing details.
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  /**
   * Effect hook to dynamically change the application's theme.
   * It listens for changes in the `currentVibe` state and updates
   * the `data-theme` attribute on the document's body element.
   * The CSS file contains styles that apply different themes based on this attribute.
   */
  useEffect(() => {
    document.body.dataset.theme = currentVibe;
    // Cleanup function to remove the attribute when the component unmounts
    return () => {
      delete document.body.dataset.theme;
    }
  }, [currentVibe]);

  // On mount, parse URL params to set session and optional answers
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const s = url.searchParams.get('session')
    const a = url.searchParams.get('answers')
    if (s) setSessionId(s)
    if (a) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(a))) as Record<string, 'yes'|'no'|'maybe'|''>
        setGuestAnswers(decoded)
        setAnswersEncoded(a)
      } catch {
        // ignore bad payload
      }
    }
  }, [])

  /**
   * Updates a task in the state.
   * @param taskId The ID of the task to update.
   * @param updates An object with the properties of the task to update.
   */
  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates)
  }

  /**
   * Reorders tasks within the current day's list after a drag-and-drop action.
   * @param reorderedTasks The newly ordered array of tasks for the current day.
   */
  const handleReorderTasks = (_reorderedTasks: Task[]) => {
    // TODO: Persist order_index updates via server action or batch update
  }

  /**
   * Adds a new task to the list.
   * @param text The text content of the new task.
   * @param isSecret A boolean indicating if the task is secret.
   */
  const handleAddTask = (text: string, isSecret: boolean) => {
    addTask(text, isSecret)
  }

  /**
   * Handles a user's vote to reveal a secret task.
   * @param taskId The ID of the secret task to vote on.
   */
  const handleVoteToReveal = (taskId: string) => {
    const uid = user?.id || 'user-1'
    const target = tasks.find(t => t.id === taskId)
    if (!target) return
    if (!target.votes.includes(uid)) {
      const updates: Partial<Task> = { votes: [...target.votes, uid] as any }
      // Reveal task if threshold met (client heuristic only for now)
      const thresholdMet = (updates.votes as any)?.length >= 2
      if (thresholdMet) updates.is_secret = false
      updateTask(taskId, updates)
    }
  }

  const filteredTasks = tasks.filter(task => task.day === currentDay)

  // Encode only the choices for a minimal "answers" payload in URL
  const answersPayload = useMemo(() => {
    const map: Record<string, 'yes'|'no'|'maybe'|''> = {}
    tasks.forEach(t => { if (t.choice) map[t.id] = t.choice })
    return map
  }, [tasks])

  const answersParam = useMemo(() => {
    try {
      const json = JSON.stringify(answersPayload)
      return btoa(encodeURIComponent(json))
    } catch { return undefined }
  }, [answersPayload])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
  <SessionHeader name="Erin's Escapades" sessionId={sessionId} answersEncoded={answersParam} />
        <DayToggle currentDay={currentDay} onDayChange={setCurrentDay} />
        <TaskList
          tasks={filteredTasks}
          onUpdateTask={handleUpdateTask}
          onReorderTasks={handleReorderTasks}
          selectedTask={selectedTask}
          onSelectTask={setSelectedTask}
          onVote={handleVoteToReveal}
          currentUserId={user?.id || 'user-1'}
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

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import DayToggle from '@/components/layout/day-toggle'
import SessionHeader from './session-header'
import TaskList from '../tasks/task-list'
import SessionDetails from './session-details'
import TaskForm from '../tasks/task-form'
import { Task, Vibe } from '@/lib/types'
import { useSession } from '@/hooks/use-session'
import { useTasks } from '@/hooks/use-tasks'
import { useTaskChoices } from '@/hooks/use-task-choices'
import { mockVibes } from '@/lib/mock-data'
import { toast } from '@/lib/toast'
import LoadingSpinner from '@/components/common/loading-spinner'

/**
 * The main component that orchestrates the entire session view.
 * It manages the state for tasks, vibes, and UI selections.
 */
export default function SessionBoard() {
  const { user, sessionId: defaultSessionId, loading: sessionLoading } = useSession()
  const userName = user?.name
  
  // Parse URL params for session and answers
  const [urlSessionId, setUrlSessionId] = useState<string>('')
  const [answersEncoded, setAnswersEncoded] = useState<string | undefined>(undefined)
  const [guestAnswers, setGuestAnswers] = useState<Record<string, 'yes'|'no'|'maybe'|''>>({})

  // Use URL session if present, otherwise use default from useSession
  const sessionId = urlSessionId || defaultSessionId

  const { tasks, addTask, updateTask, refetchTasks } = useTasks(sessionId, user?.id)
  const { myChoiceByTask, setMyChoice } = useTaskChoices(sessionId, user?.id)
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
    if (s) setUrlSessionId(s)
    if (a) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(a)))
        // Validate the decoded structure to prevent XSS and DoS attacks
        if (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) {
          const keys = Object.keys(decoded)
          
          // Validate key count to prevent DoS attacks
          if (keys.length > 1000) {
            console.warn('[SessionBoard] Invalid answers parameter - too many keys (max 1000)')
            return
          }
          
          // Validate that all keys are valid UUIDs (task IDs)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          const allKeysValid = keys.every(key => uuidRegex.test(key))
          
          if (!allKeysValid) {
            console.warn('[SessionBoard] Invalid answers parameter - keys must be valid UUIDs')
            return
          }
          
          // Validate that all values are safe choice strings
          const isValid = Object.values(decoded).every(
            val => val === 'yes' || val === 'no' || val === 'maybe' || val === ''
          )
          if (isValid) {
            setGuestAnswers(decoded as Record<string, 'yes'|'no'|'maybe'|''>)
            setAnswersEncoded(a)
          } else {
            console.warn('[SessionBoard] Invalid answers parameter - invalid choice values')
          }
        } else {
          console.warn('[SessionBoard] Invalid answers parameter - not a valid object')
        }
      } catch (error) {
        console.error('[SessionBoard] Failed to decode answers:', error)
        // Don't set invalid data
      }
    }
  }, [])

  /**
   * Updates a task in the state.
   * @param taskId The ID of the task to update.
   * @param updates An object with the properties of the task to update.
   */
  const handleUpdateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates)
  }, [updateTask])

  /**
   * Reorders tasks within the current day's list after a drag-and-drop action.
   * @param reorderedTasks The newly ordered array of tasks for the current day.
   * 
   * Note: This performs N individual update operations in parallel. For better
   * performance with many tasks, consider implementing a batch update RPC function
   * in Supabase that updates all task orders in a single database round trip.
   */
  const handleReorderTasks = async (reorderedTasks: Task[]) => {
    // Batch update to database - save all order_index changes at once
    try {
      // Use updateTask from the hook for each order change
      // These execute in parallel via Promise.all to minimize latency
      const updates = reorderedTasks.map((task, index) =>
        updateTask(task.id, { order_index: index })
      )

      await Promise.all(updates)

      // Success - updates are persisted, realtime will sync the state
    } catch (error: any) {
      toast.error('Failed to save task order')
      if (process.env.NODE_ENV === 'development') {
        console.error('[SessionBoard] Failed to save task order:', error)
      }
      // On error, refetch tasks to restore correct order from database
      await refetchTasks()
    }
  }

  /**
   * Adds a new task to the list.
   * @param text The text content of the new task.
   * @param isSecret A boolean indicating if the task is secret.
   */
  const handleAddTask = useCallback((text: string, isSecret: boolean) => {
    addTask(text, isSecret)
  }, [addTask])

  /**
   * Handles a user's vote to reveal a secret task.
   * @param taskId The ID of the secret task to vote on.
   */
  const handleVoteToReveal = useCallback((taskId: string) => {
    const uid = user?.id || 'user-1'
    // Find the task from current state using a snapshot
    const target = tasks.find(t => t.id === taskId)
    if (!target) return
    if (target.votes.includes(uid)) return

    const newVotes = [...target.votes, uid]
    const updates: Partial<Task> = { votes: newVotes }
    // Reveal task if threshold met (client heuristic only for now)
    const thresholdMet = newVotes.length >= 2
    if (thresholdMet) updates.is_secret = false
    updateTask(taskId, updates)
  }, [user?.id, tasks, updateTask])

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

  // Show loading spinner while session is initializing
  // Allow guests to view shared sessions even without login
  if (sessionLoading && !sessionId) {
    return <LoadingSpinner variant="cosmic" />
  }

  return (
    <div className="max-w-7xl mx-auto">
      <SessionHeader 
        name="Erin's Escapades" 
        sessionId={sessionId} 
        answersEncoded={answersParam}
        vibes={vibes}
        currentVibe={currentVibe}
        onVibeChange={setCurrentVibe}
      />
      <DayToggle currentDay={currentDay} onDayChange={setCurrentDay} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2">
          <TaskList
            tasks={filteredTasks}
            onUpdateTask={handleUpdateTask}
            onSetChoice={setMyChoice}
            myChoiceByTask={myChoiceByTask}
            onReorderTasks={handleReorderTasks}
            selectedTask={selectedTask}
            onSelectTask={setSelectedTask}
            onVote={handleVoteToReveal}
            currentUserId={user?.id || 'user-1'}
          />
          <TaskForm onAddTask={handleAddTask} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <SessionDetails selectedTask={selectedTask} onUpdateTask={handleUpdateTask} />
          </div>
        </div>
      </div>
    </div>
  )
}

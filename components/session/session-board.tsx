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
  const [guestAnswers, setGuestAnswers] = useState<Record<string, 'yes' | 'no' | 'maybe' | ''>>({})

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
    document.body.dataset.theme = currentVibe
    // Cleanup function to remove the attribute when the component unmounts
    return () => {
      delete document.body.dataset.theme
    }
  }, [currentVibe])

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

          // DoS Prevention: Limit number of keys to prevent resource exhaustion
          // Max 1000 tasks per session is generous for legitimate use cases
          if (keys.length > 1000) {
            toast.error('Session link is invalid (too many tasks)')
            console.warn('[SessionBoard] Invalid answers parameter - too many keys (DoS prevention)')
            return
          }

          // RFC 4122 UUID Validation: Validate each key is a valid UUID (task IDs are UUIDs)
          // Format: 8-4-4-4-12 hex digits with proper version (1-5) and variant (10xx) bits
          // Length check first to prevent ReDoS attacks on extremely long strings
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
          const allKeysValid = keys.every(key => {
            // Validate length first (UUID is always 36 characters: 32 hex + 4 hyphens)
            if (typeof key !== 'string' || key.length !== 36) {
              return false
            }
            // Then validate format with regex
            return uuidRegex.test(key)
          })

          if (!allKeysValid) {
            toast.error('Session link contains invalid task identifiers')
            console.warn('[SessionBoard] Invalid answers parameter - keys must be valid UUIDs')
            return
          }

          // Validate that all values are safe choice strings
          const allValuesValid = Object.values(decoded).every(
            val => val === 'yes' || val === 'no' || val === 'maybe' || val === ''
          )

          if (allValuesValid) {
            setGuestAnswers(decoded as Record<string, 'yes' | 'no' | 'maybe' | ''>)
            setAnswersEncoded(a)
          } else {
            toast.error('Session link contains invalid choice values')
            console.warn('[SessionBoard] Invalid answers parameter - invalid choice values')
          }
        } else {
          toast.error('Session link is malformed')
          console.warn('[SessionBoard] Invalid answers parameter - not a valid object')
        }
      } catch (error) {
        toast.error('Unable to load session from link')
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
  const handleUpdateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      updateTask(taskId, updates)
    },
    [updateTask]
  )

  /**
   * Reorders tasks within the current day's list after a drag-and-drop action.
   *
   * Performance Optimization: Uses batch update API endpoint to update all task
   * orders in a single request instead of N parallel requests.
   *
   * Benefits:
   * - Single HTTP round trip instead of N requests
   * - Reduced network overhead and latency
   * - Better handling of concurrent updates
   * - Improved performance for large task lists
   *
   * @param reorderedTasks The newly ordered array of tasks for the current day.
   */
  const handleReorderTasks = async (reorderedTasks: Task[]) => {
    // Validation: Ensure we have tasks to update
    if (!reorderedTasks || reorderedTasks.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SessionBoard] No tasks to reorder')
      }
      return
    }

    // Validation: Check batch size limit (API enforces max 100)
    if (reorderedTasks.length > 100) {
      toast.error('Cannot reorder more than 100 tasks at once')
      if (process.env.NODE_ENV === 'development') {
        console.error('[SessionBoard] Batch size exceeds limit:', reorderedTasks.length)
      }
      return
    }

    try {
      // Prepare batch update payload
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order_index: index
      }))

      if (process.env.NODE_ENV === 'development') {
        console.log('[SessionBoard] Sending batch update for', updates.length, 'tasks')
      }

      // Call batch update API endpoint
      const response = await fetch('/api/tasks/batch-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updates,
          session_id: sessionId // Include for additional validation
        })
      })

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || `Server error: ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (process.env.NODE_ENV === 'development') {
        console.log('[SessionBoard] Batch update successful:', result)
      }

      // Success - updates are persisted, realtime will sync the state
      // No need to manually update local state as Supabase realtime handles it

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
  const handleAddTask = useCallback(
    (text: string, isSecret: boolean) => {
      addTask(text, isSecret)
    },
    [addTask]
  )

  /**
   * Handles a user's vote to reveal a secret task.
   * @param taskId The ID of the secret task to vote on.
   */
  const handleVoteToReveal = useCallback(
    (taskId: string) => {
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
    },
    [user?.id, tasks, updateTask]
  )

  const filteredTasks = tasks.filter(task => task.day === currentDay)

  // Encode only the choices for a minimal "answers" payload in URL
  const answersPayload = useMemo(() => {
    const map: Record<string, 'yes' | 'no' | 'maybe' | ''> = {}
    tasks.forEach(t => {
      if (t.choice) map[t.id] = t.choice
    })
    return map
  }, [tasks])

  const answersParam = useMemo(() => {
    try {
      const json = JSON.stringify(answersPayload)
      return btoa(encodeURIComponent(json))
    } catch {
      return undefined
    }
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

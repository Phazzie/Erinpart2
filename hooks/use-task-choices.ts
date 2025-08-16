import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Choice, TaskChoice } from '@/lib/types'

/**
 * Hook to manage per-user yes/no/maybe choices for tasks in a session.
 * - Stores choices in public.task_choices with RLS enforcing per-user rows.
 * - Provides a map for quick lookup and a setter to upsert the current user's choice.
 */
export function useTaskChoices(sessionId: string, userId: string | undefined) {
  const [choices, setChoices] = useState<TaskChoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // initial load for session
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!isSupabaseConfigured) { setError(new Error('Supabase not configured')); return }
      if (!sessionId) return
      setLoading(true)
      // Join via tasks to scope to session
      const { data, error } = await supabase
        .from('task_choices')
        .select('id, task_id, user_id, choice, created_at, updated_at, tasks!inner(session_id)')
        .eq('tasks.session_id', sessionId)
      if (cancelled) return
      if (error) setError(new Error(error.message))
      else setChoices((data || []).map((row: any) => ({
        id: row.id,
        task_id: row.task_id,
        user_id: row.user_id,
        choice: row.choice,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [sessionId])

  // realtime subscription scoped to task_choices joined by tasks for this session
  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!sessionId) return

    const channel = supabase
      .channel(`task_choices:${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_choices' }, (payload: any) => {
        const evt = payload.eventType || payload.event || payload.type
        const rowNew = payload.new
        const rowOld = payload.old
        // If we have the tasks relation in payload, filter by session, otherwise accept and let UI filter by task.
        // For safety, we'll update but UI maps by task ids present.
        setChoices(curr => {
          switch (evt) {
            case 'INSERT':
              if (!rowNew) return curr
              if (curr.some(c => c.id === rowNew.id)) return curr
              return [...curr, rowNew as TaskChoice]
            case 'UPDATE':
              if (!rowNew) return curr
              return curr.map(c => c.id === rowNew.id ? { ...c, ...(rowNew as TaskChoice) } : c)
            case 'DELETE':
              if (!rowOld) return curr
              return curr.filter(c => c.id !== rowOld.id)
            default:
              return curr
          }
        })
      })
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel as any) } catch {}
    }
  }, [sessionId])

  const byTask = useMemo(() => {
    const map = new Map<string, TaskChoice[]>()
    for (const c of choices) {
      const list = map.get(c.task_id) || []
      list.push(c)
      map.set(c.task_id, list)
    }
    return map
  }, [choices])

  const myChoiceByTask = useMemo(() => {
    const map = new Map<string, TaskChoice | undefined>()
    if (!userId) return map
    for (const c of choices) {
      if (c.user_id === userId) map.set(c.task_id, c)
    }
    return map
  }, [choices, userId])

  const setMyChoice = useCallback(async (taskId: string, choice: Exclude<Choice, ''>) => {
    if (!userId) { setError(new Error('Not authenticated')); return }
    if (!isSupabaseConfigured) { setError(new Error('Supabase not configured')); return }
    const existing = myChoiceByTask.get(taskId)
    if (existing) {
      const { error } = await supabase.from('task_choices').update({ choice }).eq('id', existing.id)
      if (error) { setError(new Error(error.message)); return }
      setChoices(curr => curr.map(c => c.id === existing.id ? { ...c, choice } : c))
    } else {
      const insert = { task_id: taskId, user_id: userId, choice }
      const { data, error } = await supabase.from('task_choices').insert(insert).select().single()
      if (error) { setError(new Error(error.message)); return }
      setChoices(curr => [...curr, data as unknown as TaskChoice])
    }
  }, [userId, myChoiceByTask])

  return { choices, byTask, myChoiceByTask, setMyChoice, loading, error }
}

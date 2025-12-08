import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Choice, TaskChoice } from '@/lib/types'

/**
 * Hook to manage per-voter yes/no/maybe choices for tasks.
 * - Stores votes in public.votes table.
 * - Provides a map for quick lookup and a setter to upsert the current voter's choice.
 */
export function useTaskChoices(taskIds: string[], voterName: string | undefined) {
  const [choices, setChoices] = useState<TaskChoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // initial load for tasks
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!isSupabaseConfigured) {
        setError(new Error('Supabase not configured'))
        return
      }
      if (!taskIds || taskIds.length === 0) {
        setChoices([])
        return
      }
      setLoading(true)
      // Fetch votes for the given task IDs
      const { data, error } = await supabase
        .from('votes')
        .select('id, task_id, voter_name, choice, created_at')
        .in('task_id', taskIds)
      if (cancelled) return
      if (error) setError(new Error(error.message))
      else
        setChoices(
          (data || []).map((row: any) => ({
            id: row.id,
            task_id: row.task_id,
            user_id: row.voter_name, // Map voter_name to user_id for compatibility
            choice: row.choice,
            created_at: row.created_at,
          }))
        )
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [taskIds.join(',')])

  // realtime subscription for votes table
  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!taskIds || taskIds.length === 0) return

    const channel = supabase
      .channel(`votes:${taskIds.join(',')}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload: any) => {
          const evt = payload.eventType || payload.event || payload.type
          const rowNew = payload.new
          const rowOld = payload.old

          // Filter by task IDs to only handle votes for our tasks
          setChoices(curr => {
            switch (evt) {
              case 'INSERT':
                if (!rowNew || !taskIds.includes(rowNew.task_id)) return curr
                if (curr.some(c => c.id === rowNew.id)) return curr
                return [...curr, {
                  id: rowNew.id,
                  task_id: rowNew.task_id,
                  user_id: rowNew.voter_name,
                  choice: rowNew.choice,
                  created_at: rowNew.created_at,
                } as TaskChoice]
              case 'UPDATE':
                if (!rowNew || !taskIds.includes(rowNew.task_id)) return curr
                return curr.map(c => (c.id === rowNew.id ? {
                  id: rowNew.id,
                  task_id: rowNew.task_id,
                  user_id: rowNew.voter_name,
                  choice: rowNew.choice,
                  created_at: rowNew.created_at,
                } : c))
              case 'DELETE':
                if (!rowOld) return curr
                return curr.filter(c => c.id !== rowOld.id)
              default:
                return curr
            }
          })
        }
      )
      .subscribe()

    return () => {
      try {
        supabase.removeChannel(channel as any)
      } catch {}
    }
  }, [taskIds.join(',')])

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
    if (!voterName) return map
    for (const c of choices) {
      if (c.user_id === voterName) map.set(c.task_id, c)
    }
    return map
  }, [choices, voterName])

  const setMyChoice = useCallback(
    async (taskId: string, choice: Exclude<Choice, ''>) => {
      if (!voterName) {
        setError(new Error('Voter name required'))
        return
      }
      if (!isSupabaseConfigured) {
        setError(new Error('Supabase not configured'))
        return
      }
      const existing = myChoiceByTask.get(taskId)
      if (existing) {
        const { error } = await supabase
          .from('votes')
          .update({ choice })
          .eq('id', existing.id)
        if (error) {
          setError(new Error(error.message))
          return
        }
        setChoices(curr => curr.map(c => (c.id === existing.id ? { ...c, choice } : c)))
      } else {
        const insert = { task_id: taskId, voter_name: voterName, choice }
        const { data, error } = await supabase.from('votes').insert(insert).select().single()
        if (error) {
          setError(new Error(error.message))
          return
        }
        setChoices(curr => [...curr, {
          id: data.id,
          task_id: data.task_id,
          user_id: data.voter_name,
          choice: data.choice,
          created_at: data.created_at,
        } as TaskChoice])
      }
    },
    [voterName, myChoiceByTask]
  )

  return { choices, byTask, myChoiceByTask, setMyChoice, loading, error }
}

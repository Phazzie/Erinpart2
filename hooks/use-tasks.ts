import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Task } from '@/lib/types'
import { toast } from 'sonner'

export const useTasks = (sessionId: string) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('session_id', sessionId)
          .order('order_index', { ascending: true })

        if (error) throw error
        setTasks(data || [])
      } catch (error: any) {
        toast.error(`Failed to fetch tasks: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [sessionId])

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:tasks:${sessionId}`)
      .on<Task>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setTasks(current => [...current, payload.new])
        }
      )
      .on<Task>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setTasks(current => current.map(t => t.id === payload.new.id ? payload.new : t))
        }
      )
      .on<{ id: string }>(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tasks', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setTasks(current => current.filter(t => t.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const addTask = async (text: string, is_secret = false) => {
    // Note: is_secret is not in the Task type, assuming it's handled elsewhere or should be `created_by`
    const tempId = `temp-${Date.now()}`

    setTasks(current => {
      const maxOrderIndex = Math.max(0, ...current.map(t => t.order_index))
      const newTask: Task = {
        id: tempId,
        session_id: sessionId,
        text,
        choice: '',
        day: 'today',
        order_index: maxOrderIndex + 1, // For optimistic UI update
        comments: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'temp-user', // This should be replaced with actual user ID
      }
      return [...current, newTask]
    })

    try {
      // Let the backend handle setting the definitive order_index
      const { data: insertedTask, error } = await supabase
        .from('tasks')
        .insert({ text, session_id: sessionId })
        .select()
        .single()

      if (error) throw error

      // Replace temp task with actual task from DB, which has the correct order_index
      setTasks(current => current.map(t => t.id === tempId ? insertedTask : t))
    } catch (error: any) {
      toast.error(`Failed to add task: ${error.message}`)
      // Revert optimistic update
      setTasks(current => current.filter(t => t.id !== tempId))
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const previousTask = tasks.find(t => t.id === id)
    setTasks(current => current.map(t => t.id === id ? { ...t, ...updates } : t))

    try {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id)
      if (error) throw error
    } catch (error: any) {
      toast.error(`Failed to update task: ${error.message}`)
      if (previousTask) {
        setTasks(current => current.map(t => t.id === id ? previousTask : t))
      }
    }
  }

  const deleteTask = async (id: string) => {
    const deletedTask = tasks.find(t => t.id === id)
    setTasks(current => current.filter(t => t.id !== id))

    try {
      const { error } = await supabase.from('tasks').delete().eq('id',id)
      if (error) throw error
    } catch (error: any) {
      toast.error(`Failed to delete task: ${error.message}`)
      if (deletedTask) {
        // Re-add the task and sort to maintain order
        setTasks(current => [...current, deletedTask].sort((a, b) => a.order_index - b.order_index))
      }
    }
  }

  return { tasks, loading, addTask, updateTask, deleteTask }
}

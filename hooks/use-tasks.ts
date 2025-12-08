'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { type Task } from '@/lib/types'
import { toast } from '@/lib/toast'

export function useTasks(roomId: string, userName?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!isSupabaseConfigured || !roomId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleRealtimeUpdate = useCallback(
    (payload: any) => {
      if (payload.eventType === 'INSERT' && payload.new.room_id === roomId) {
        setTasks(currentTasks => [...currentTasks, payload.new])
      } else if (payload.eventType === 'UPDATE' && payload.new.room_id === roomId) {
        setTasks(currentTasks => currentTasks.map(t => (t.id === payload.new.id ? payload.new : t)))
      } else if (payload.eventType === 'DELETE' && payload.old.room_id === roomId) {
        setTasks(currentTasks => currentTasks.filter(t => t.id !== payload.old.id))
      }
    },
    [roomId]
  )

  useRealtime({
    channelName: `tasks-for-room-${roomId}`,
    table: 'tasks',
    filter: `room_id=eq.${roomId}`,
    callback: handleRealtimeUpdate,
  })

  const addTask = useCallback(
    async (text: string) => {
      if (!text.trim() || !roomId) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[useTasks] Cannot add task:', { text: text.trim(), roomId })
        }
        toast.error('Missing task text or room ID')
        return
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[useTasks] Adding task:', { text, roomId, isSupabaseConfigured })
      }

      const optimisticId = `optimistic-${Date.now()}`

      setTasks(current => {
        const newTask: Task = {
          id: optimisticId,
          room_id: roomId,
          created_at: new Date().toISOString(),
          text,
          creator_name: userName || 'Anonymous',
        }
        return [...current, newTask]
      })

      if (!isSupabaseConfigured) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[useTasks] Supabase not configured, using optimistic update only')
        }
        toast.success('Task added (local only - Supabase not configured)')
        return
      }

      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useTasks] Inserting task into Supabase...')
        }

        const insertData: any = {
          text,
          room_id: roomId,
          creator_name: userName || 'Anonymous',
        }

        const { data, error } = await supabase.from('tasks').insert(insertData).select().single()

        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[useTasks] Supabase error:', error)
          }
          throw error
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('[useTasks] Task inserted successfully:', data)
        }
        setTasks(current => current.map(t => (t.id === optimisticId ? { ...t, ...data } : t)))
        toast.success('Task added!')
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[useTasks] Failed to add task:', error)
        }
        toast.error(`Failed to add task: ${error.message}`)
        setTasks(current => current.filter(t => t.id !== optimisticId))
      }
    },
    [roomId, userName]
  )

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // Store original state for rollback using functional update
    let originalTasks: Task[] = []
    setTasks(current => {
      originalTasks = current
      return current.map(t => (t.id === id ? { ...t, ...updates } : t))
    })

    try {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id)
      if (error) throw error
    } catch (error: any) {
      toast.error(`Failed to update task: ${error.message}`)
      setTasks(originalTasks)
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    // Store original state for rollback using functional update
    let originalTasks: Task[] = []
    setTasks(current => {
      originalTasks = current
      return current.filter(t => t.id !== id)
    })

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    } catch (error: any) {
      toast.error(`Failed to delete task: ${error.message}`)
      setTasks(originalTasks)
    }
  }, [])

  return { tasks, loading, addTask, updateTask, deleteTask, refetchTasks: fetchTasks }
}

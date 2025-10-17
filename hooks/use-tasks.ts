'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { type Task } from '@/lib/types'
import { toast } from '@/lib/toast'

export function useTasks(sessionId: string, userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!isSupabaseConfigured || !sessionId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT' && payload.new.session_id === sessionId) {
      setTasks(currentTasks => [...currentTasks, payload.new])
    } else if (payload.eventType === 'UPDATE' && payload.new.session_id === sessionId) {
      setTasks(currentTasks =>
        currentTasks.map(t => (t.id === payload.new.id ? payload.new : t))
      )
    } else if (payload.eventType === 'DELETE' && payload.old.session_id === sessionId) {
      setTasks(currentTasks => currentTasks.filter(t => t.id !== payload.old.id))
    }
  }, [sessionId])

  useRealtime({
    channelName: `tasks-for-session-${sessionId}`,
    table: 'tasks',
    filter: `session_id=eq.${sessionId}`,
    callback: handleRealtimeUpdate,
  })

  const addTask = useCallback(async (text: string, is_secret = false) => {
    if (!text.trim() || !sessionId) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useTasks] Cannot add task:', { text: text.trim(), sessionId })
      }
      toast.error('Missing task text or session ID')
      return
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[useTasks] Adding task:', { text, is_secret, sessionId, isSupabaseConfigured })
    }

    const optimisticId = `optimistic-${Date.now()}`
    
    // Use functional update to get current tasks length
    let currentLength = 0
    setTasks(current => {
      currentLength = current.length
      const newTask: Task = {
        id: optimisticId,
        session_id: sessionId,
        created_at: new Date().toISOString(),
        text,
        is_complete: false,
        day: 'today', // default value
        order_index: currentLength,
        is_secret,
        votes: [],
        // Add missing properties to satisfy the Task type
        choice: '',
        comments: '',
        updated_at: new Date().toISOString(),
        created_by: userId || '', // Use current user ID
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

    // CRITICAL: userId is REQUIRED for RLS policy
    if (!userId) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useTasks] Cannot add task without userId - RLS policy requires created_by')
      }
      toast.error('User not authenticated. Please refresh the page.')
      setTasks(current => current.filter(t => t.id !== optimisticId))
      return
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useTasks] Inserting task into Supabase...')
      }
      
      const insertData: any = {
        text,
        is_secret,
        session_id: sessionId,
        order_index: currentLength,
        created_by: userId, // REQUIRED by RLS policy
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[useTasks] Supabase error:', error)
        }
        throw error
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[useTasks] Task inserted successfully:', data)
      }
      setTasks(current => current.map(t => t.id === optimisticId ? { ...t, ...data } : t))
      toast.success('Task added!')
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useTasks] Failed to add task:', error)
      }
      toast.error(`Failed to add task: ${error.message}`)
      setTasks(current => current.filter(t => t.id !== optimisticId))
    }
  }, [sessionId, userId])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // Store original state for rollback using functional update
    let originalTasks: Task[] = []
    setTasks(current => {
      originalTasks = current
      return current.map(t => t.id === id ? { ...t, ...updates } : t)
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

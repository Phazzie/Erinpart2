import { Task } from '@/lib/types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const useTasks = (sessionId: string, userName?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch from Supabase
  useEffect(() => {
    if (!sessionId || !isSupabaseConfigured) return
    
    let cancelled = false
    setLoading(true)
    setError(null)

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
        
        if (cancelled) return
        if (error) setError(new Error(error.message))
        else if (data) setTasks(data as unknown as Task[])
        setLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
          setLoading(false)
        }
      }
    }
    
    fetchTasks()
    return () => { cancelled = true }
  }, [sessionId])

  // Realtime subscription
  useEffect(() => {
    if (!sessionId || !isSupabaseConfigured) return

    const channel = supabase
      .channel(`tasks:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
          const eventType = payload.eventType
          const newTask = payload.new as Task
          const oldTask = payload.old as Task

          setTasks(current => {
            if (eventType === 'INSERT') {
              return [...current, newTask]
            } else if (eventType === 'UPDATE') {
              return current.map(task => 
                task.id === newTask.id ? newTask : task
              )
            } else if (eventType === 'DELETE') {
              return current.filter(task => task.id !== oldTask.id)
            }
            return current
          })
        }
      )
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel as any) } catch {}
    }
  }, [sessionId])

  const addTask = useCallback(async (text: string, isSecret: boolean = false) => {
    if (!text.trim() || !sessionId) return;
    
    if (!isSupabaseConfigured) {
      // Fallback for development without Supabase
      const newTask: Task = {
        id: `local-${Date.now()}`,
        session_id: sessionId,
        text: text.trim(),
        is_complete: false,
        choice: '',
        day: 'today',
        order_index: tasks.length,
        comments: '',
        created_by: 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_secret: isSecret,
        votes: [],
        user_name: userName || 'Anonymous'
      }
      setTasks(current => [...current, newTask])
      return
    }

    try {
      // Get current user for Supabase
      const { data: authData, error: authErr } = await supabase.auth.getUser()
      if (authErr) throw authErr
      
      const uid = authData?.user?.id
      if (!uid) throw new Error('Please join a session first')

      const newTask = {
        session_id: sessionId,
        text: text.trim(),
        is_complete: false,
        choice: '',
        day: 'today',
        order_index: tasks.filter(t => t.session_id === sessionId && t.day === 'today').length,
        comments: '',
        created_by: uid,
        is_secret: isSecret,
        votes: isSecret ? [uid] : [],
        user_name: userName || 'Anonymous'
      }

      const { error } = await supabase.from('tasks').insert(newTask)
      if (error) throw error
      
    } catch (err) {
      setError(err as Error)
    }
  }, [sessionId, userName, tasks])

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!taskId || !isSupabaseConfigured) return;

    try {
      const updatesWithUser = userName ? { ...updates, user_name: userName } : updates
      const { error } = await supabase
        .from('tasks')
        .update(updatesWithUser)
        .eq('id', taskId)
      
      if (error) throw error
    } catch (err) {
      setError(err as Error)
    }
  }, [userName])

  const deleteTask = useCallback(async (taskId: string) => {
    if (!taskId || !isSupabaseConfigured) return;

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
    } catch (err) {
      setError(err as Error)
    }
  }, [])

  return { tasks, loading, error, addTask, updateTask, deleteTask };
};

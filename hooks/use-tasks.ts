import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const useTasks = (sessionId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch when Supabase is configured
  useEffect(() => {
    let cancelled = false
    const fetchTasks = async () => {
      if (!isSupabaseConfigured) {
        setError(new Error('Supabase not configured'))
        return
      }
      setLoading(true)
      const { data, error } = await supabase.from('tasks').select('*').eq('session_id', sessionId)
      if (cancelled) return
      if (error) setError(new Error(error.message))
      else if (data) setTasks(data as unknown as Task[])
      setLoading(false)
    }
    fetchTasks()
    return () => { cancelled = true }
  }, [sessionId])

  // Realtime subscription for task changes
  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!sessionId) return

    const channel = supabase
      .channel(`tasks:${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload: any) => {
        const eventType = payload.eventType || payload.event || payload.type
        const rowNew = payload.new
        const rowOld = payload.old
        // Only process events for this session
        const sid = (rowNew?.session_id ?? rowOld?.session_id) as string | undefined
        if (sid && sid !== sessionId) return

        setTasks(current => {
          switch (eventType) {
            case 'INSERT':
              if (!rowNew) return current
              if (current.some(t => t.id === rowNew.id)) return current
              return [...current, rowNew as Task]
            case 'UPDATE':
              if (!rowNew) return current
              return current.map(t => (t.id === rowNew.id ? { ...t, ...(rowNew as Task) } : t))
            case 'DELETE':
              if (!rowOld) return current
              return current.filter(t => t.id !== (rowOld as Task).id)
            default:
              return current
          }
        })
      })
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel as any) } catch {}
    }
  }, [sessionId])

  const addTask = useCallback(async (text: string, isSecret: boolean) => {
    if (!text.trim()) return;
    if (!isSupabaseConfigured) { setError(new Error('Supabase not configured')); return }
    const payload = {
      session_id: sessionId,
      text,
      is_complete: false,
      choice: '',
      day: 'today',
      order_index: tasks.filter(t => t.session_id === sessionId && t.day === 'today').length,
      comments: '',
      created_by: 'user-1',
      is_secret: isSecret,
      votes: isSecret ? ['user-1'] : [],
    }
    const { data, error } = await supabase.from('tasks').insert(payload).select().single()
    if (error) { setError(new Error(error.message)); return }
    setTasks(current => [...current, data as unknown as Task])
  }, [sessionId, tasks]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!isSupabaseConfigured) { setError(new Error('Supabase not configured')); return }
    const { error } = await supabase.from('tasks').update(updates).eq('id', taskId)
    if (error) { setError(new Error(error.message)); return }
    setTasks(currentTasks => currentTasks.map(task => task.id === taskId ? { ...task, ...updates } : task));
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!isSupabaseConfigured) { setError(new Error('Supabase not configured')); return }
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) { setError(new Error(error.message)); return }
    setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
  }, []);

  return { tasks, loading, error, addTask, updateTask, deleteTask };
};

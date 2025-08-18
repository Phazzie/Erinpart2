import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SessionClient from './session-client'

export default async function SessionBoard() {
  const supabase = createSupabaseServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('session_id', 'session-1') // Hardcoded for now, should be dynamic
    .order('order_index', { ascending: true })

  const { data: vibes, error: vibesError } = await supabase
    .from('vibes')
    .select('*')

  if (tasksError || vibesError) {
    // A real app should have better error handling here
    return <div>Error loading data.</div>
  }

  return (
    <SessionClient
      initialTasks={tasks || []}
      initialVibes={vibes || []}
      sessionId="session-1" // Pass the actual session ID
    />
  )
}

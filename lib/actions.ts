'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server'

// Helper to ensure Supabase is configured for server actions
function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabaseServer) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
}

export async function createTask(sessionId: string, taskData: any, userName?: string) {
  assertSupabaseConfigured()
  const taskWithUser = { 
    ...taskData, 
    session_id: sessionId,
    user_name: userName || 'Anonymous'
  }
  const { data, error } = await supabaseServer.from('tasks').insert(taskWithUser).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true, id: data?.id }
}

export async function updateTask(taskId: string, updates: any, userName?: string) {
  assertSupabaseConfigured()
  const updatesWithUser = userName ? { ...updates, user_name: userName } : updates
  const { error } = await supabaseServer.from('tasks').update(updatesWithUser).eq('id', taskId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function deleteTask(taskId: string) {
  assertSupabaseConfigured()
  const { error } = await supabaseServer.from('tasks').delete().eq('id', taskId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function updateSession(sessionId: string, updates: any) {
  assertSupabaseConfigured()
  const { error } = await supabaseServer.from('sessions').update(updates).eq('id', sessionId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function createShareableSession(sessionId: string) {
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?session=${sessionId}`
  if (isSupabaseConfigured && supabaseServer) {
    // Optional: persist a short code or metadata in sessions table
  }
  return { success: true, shareUrl }
}

export async function signIn(prevState: { error?: string } | null, formData: FormData) {
  assertSupabaseConfigured()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { error } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Supabase returns a generic error for invalid credentials, so we'll make it more specific.
    if (error.message === 'Invalid login credentials') {
      return { error: 'Invalid email or password.' }
    }
    return { error: error.message }
  }

  revalidatePath('/')
  redirect('/')
}

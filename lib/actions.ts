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

export async function signIn(prevState: any, formData: FormData) {
  assertSupabaseConfigured()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  if (!email || !password) return { error: 'Email and password are required' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters' }
  if (!email.includes('@')) return { error: 'Please enter a valid email address' }
  const { error } = await supabaseServer.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message || 'Invalid credentials' }
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(prevState: any, formData: FormData) {
  assertSupabaseConfigured()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  if (!email || !password) return { error: 'Email and password are required' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters' }
  if (!email.includes('@')) return { error: 'Please enter a valid email address' }
  const { error } = await supabaseServer.auth.signUp({ email, password })
  if (error) return { error: error.message || 'Sign up failed' }
  return { success: 'Account created successfully! Welcome to the chaos! 🎉' }
}

export async function signOut() {
  assertSupabaseConfigured()
  await supabaseServer.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function signInWithGoogle() {
  assertSupabaseConfigured()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { data, error } = await supabaseServer.auth.signInWithOAuth({
    provider: 'google' as any,
    options: { redirectTo: `${baseUrl}/auth/callback` }
  })
  if (error) return { error: error.message }
  if (data?.url) redirect(data.url)
}

export async function createTask(sessionId: string, taskData: any) {
  assertSupabaseConfigured()
  const { data, error } = await supabaseServer.from('tasks').insert({ ...taskData, session_id: sessionId }).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true, id: data?.id }
}

export async function updateTask(taskId: string, updates: any) {
  assertSupabaseConfigured()
  const { error } = await supabaseServer.from('tasks').update(updates).eq('id', taskId)
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

// Mock helper to get current auth state
export async function getCurrentUser() {
  assertSupabaseConfigured()
  const { data } = await supabaseServer.auth.getUser()
  return data.user
}

export async function isAuthenticated() {
  assertSupabaseConfigured()
  const { data } = await supabaseServer.auth.getSession()
  return Boolean(data.session)
}

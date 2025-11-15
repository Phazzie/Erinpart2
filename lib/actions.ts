'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

// Helper to ensure Supabase is configured for server actions
function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabaseServer) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
}

export async function createTask(sessionId: string, taskData: any, userName?: string) {
  assertSupabaseConfigured()

  // Optionally get authenticated user ID from Clerk
  // This supports both authenticated users and anonymous animal code sessions
  let clerkUserId: string | null = null
  try {
    const authResult = await auth()
    clerkUserId = authResult.userId
  } catch (error) {
    // No auth is fine - animal code sessions don't require authentication
    // Log in development to help debug auth service issues
    if (process.env.NODE_ENV === 'development') {
      console.warn('[createTask] Failed to get Clerk auth (this is OK for guest sessions):', error)
    }
  }

  const taskWithUser = {
    ...taskData,
    session_id: sessionId,
    user_name: userName || 'Anonymous',
    ...(clerkUserId && { created_by: clerkUserId }),
  }

  const { data, error } = await supabaseServer.from('tasks').insert(taskWithUser).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true, id: data?.id }
}

export async function updateTask(taskId: string, updates: any, userName?: string) {
  assertSupabaseConfigured()

  // Optionally get authenticated user ID from Clerk
  let clerkUserId: string | null = null
  try {
    const authResult = await auth()
    clerkUserId = authResult.userId
  } catch (error) {
    // No auth is fine - animal code sessions don't require authentication
    // Log in development to help debug auth service issues
    if (process.env.NODE_ENV === 'development') {
      console.warn('[updateTask] Failed to get Clerk auth (this is OK for guest sessions):', error)
    }
  }

  const updatesWithUser = {
    ...updates,
    ...(userName && { user_name: userName }),
    ...(clerkUserId && { updated_by: clerkUserId }),
  }

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

/**
 * Authentication is now handled by Clerk.
 * The signIn function has been removed - users should use Clerk's sign-in UI instead.
 * See: /app/sign-in/[[...sign-in]]/page.tsx
 */

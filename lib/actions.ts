'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server'

// Helper to ensure Supabase is configured for server actions
function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabaseServer) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
}

/**
 * Creates a new task in the database.
 *
 * Error Handling Strategy:
 * - Database errors are logged with structured data and returned to the client
 * - All errors include sanitized context for debugging without exposing sensitive data
 *
 * @param sessionId - The session ID to associate with the task
 * @param taskData - The task data to insert
 * @param userName - Optional username (defaults to 'Anonymous')
 * @returns Success response with task ID, or error response
 */
export async function createTask(sessionId: string, taskData: any, userName?: string) {
  assertSupabaseConfigured()

  const taskWithUser = {
    ...taskData,
    session_id: sessionId,
    user_name: userName || 'Anonymous',
  }

  const { data, error } = await supabaseServer.from('tasks').insert(taskWithUser).select().single()
  if (error) {
    // Log database errors with structured data for production debugging
    console.error('[createTask] Database error:', {
      sessionId,
      userName: userName || 'Anonymous',
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details,
      hint: error.hint,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: error.message }
  }
  revalidatePath('/')
  return { success: true, id: data?.id }
}

/**
 * Updates an existing task in the database.
 *
 * Error Handling Strategy:
 * - Database errors are logged with structured data and returned to the client
 * - All errors include sanitized context for debugging without exposing sensitive data
 *
 * @param taskId - The ID of the task to update
 * @param updates - The updates to apply to the task
 * @param userName - Optional username to track who made the update
 * @returns Success response, or error response
 */
export async function updateTask(taskId: string, updates: any, userName?: string) {
  assertSupabaseConfigured()

  const updatesWithUser = {
    ...updates,
    ...(userName && { user_name: userName }),
  }

  const { error } = await supabaseServer.from('tasks').update(updatesWithUser).eq('id', taskId)
  if (error) {
    // Log database errors with structured data for production debugging
    console.error('[updateTask] Database error:', {
      taskId,
      userName: userName || 'Unknown',
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details,
      hint: error.hint,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: error.message }
  }
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
 * Authentication is handled via guest sessions only.
 * No traditional sign-in required - users identified by Magic Word sessions.
 */

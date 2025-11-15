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

/**
 * Creates a new task in the database.
 *
 * Error Handling Strategy:
 * - Clerk auth errors are logged but don't fail the operation (guest sessions are supported)
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

  // Optionally get authenticated user ID from Clerk
  // This supports both authenticated users and anonymous animal code sessions
  let clerkUserId: string | null = null
  try {
    const authResult = await auth()
    clerkUserId = authResult.userId
  } catch (error) {
    // No auth is fine - animal code sessions don't require authentication
    // Log with structured data for production debugging (no sensitive info)
    console.warn('[createTask] Clerk auth unavailable (expected for guest sessions):', {
      sessionId,
      userName: userName || 'Anonymous',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })
  }

  const taskWithUser = {
    ...taskData,
    session_id: sessionId,
    user_name: userName || 'Anonymous',
    ...(clerkUserId && { created_by: clerkUserId }),
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
 * - Clerk auth errors are logged but don't fail the operation (guest sessions are supported)
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

  // Optionally get authenticated user ID from Clerk
  let clerkUserId: string | null = null
  try {
    const authResult = await auth()
    clerkUserId = authResult.userId
  } catch (error) {
    // No auth is fine - animal code sessions don't require authentication
    // Log with structured data for production debugging (no sensitive info)
    console.warn('[updateTask] Clerk auth unavailable (expected for guest sessions):', {
      taskId,
      userName: userName || 'Unknown',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })
  }

  const updatesWithUser = {
    ...updates,
    ...(userName && { user_name: userName }),
    ...(clerkUserId && { updated_by: clerkUserId }),
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
 * Authentication is now handled by Clerk.
 * The signIn function has been removed - users should use Clerk's sign-in UI instead.
 * See: /app/sign-in/[[...sign-in]]/page.tsx
 */

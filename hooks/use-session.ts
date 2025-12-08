'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

type SessionData = {
  sessionId: string  // The magic word (e.g., "tacos")
  roomId?: string    // The actual UUID from database
  userName: string
  joinedAt: string
}

type SessionHook = {
  sessionId: string  // Magic word
  roomId: string     // UUID for database queries
  isOwner: boolean
  user: { id: string; name: string } | null
  loading: boolean
}

/**
 * Resolves a magic word to a room UUID using the database function.
 * Creates the room if it doesn't exist.
 */
async function getOrCreateRoom(magicWord: string): Promise<string | null> {
  if (!isSupabaseConfigured || !magicWord) return null

  try {
    const { data, error } = await supabase.rpc('get_or_create_room', {
      magic_word: magicWord,
    })

    if (error) {
      console.error('[getOrCreateRoom] Error:', error)
      return null
    }

    return data as string
  } catch (err) {
    console.error('[getOrCreateRoom] Exception:', err)
    return null
  }
}

export const useSession = (): SessionHook => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [roomId, setRoomId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  // Resolve magic word to room UUID
  const resolveRoom = useCallback(async (magicWord: string) => {
    if (!magicWord) return

    const uuid = await getOrCreateRoom(magicWord)
    if (uuid) {
      setRoomId(uuid)
      if (process.env.NODE_ENV === 'development') {
        console.log('[useSession] Resolved room:', { magicWord, uuid })
      }
    } else {
      // Fallback: use magic word directly (for when Supabase not configured)
      setRoomId(magicWord)
      if (process.env.NODE_ENV === 'development') {
        console.log('[useSession] Using magic word as roomId (fallback):', magicWord)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initSession = async (urlSessionId?: string) => {
      setLoading(true)
      try {
        // Check localStorage for session data
        const stored = localStorage.getItem('sessionData')
        let parsed: SessionData | null = null

        if (stored) {
          try {
            parsed = JSON.parse(stored) as SessionData
            if (!parsed.sessionId || !parsed.userName) {
              // Invalid data, clear it
              localStorage.removeItem('sessionData')
              parsed = null
            }
          } catch (parseError) {
            console.error('[useSession] Failed to parse localStorage:', parseError)
            localStorage.removeItem('sessionData')
          }
        }

        if (parsed && isMounted) {
          setSessionData(parsed)
          await resolveRoom(parsed.sessionId)

          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] Found sessionData:', parsed)
          }
        } else if (urlSessionId && isMounted) {
          // URL session without localStorage - create guest user
          const guestData: SessionData = {
            sessionId: urlSessionId,
            userName: 'Guest',
            joinedAt: new Date().toISOString(),
          }
          setSessionData(guestData)
          await resolveRoom(urlSessionId)

          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] Using URL session:', urlSessionId)
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] No session found')
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[useSession] Session init error:', error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Get URL params
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const urlRoom = url.searchParams.get('room') || url.searchParams.get('session')
      initSession(urlRoom || undefined)
    } else {
      initSession()
    }

    return () => {
      isMounted = false
    }
  }, [resolveRoom])

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = async () => {
      const stored = localStorage.getItem('sessionData')
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SessionData
          if (parsed.sessionId && parsed.userName) {
            setSessionData(parsed)
            await resolveRoom(parsed.sessionId)

            if (process.env.NODE_ENV === 'development') {
              console.log('[useSession] Storage changed:', parsed)
            }
          }
        } catch (error) {
          console.error('[useSession] Failed to parse storage change:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [resolveRoom])

  // Build user object
  let userId: string | null = null
  let userName = 'Anonymous'

  if (sessionData) {
    userId = `guest-${sessionData.sessionId}`
    userName = sessionData.userName
  }

  const user = userId ? { id: userId, name: userName } : null

  return {
    sessionId: sessionData?.sessionId || '',  // Magic word
    roomId,  // UUID for database
    isOwner: true,
    user,
    loading,
  }
}

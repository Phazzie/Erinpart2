'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

type SessionData = {
  sessionId: string
  userName: string
  joinedAt: string
}

type SessionHook = {
  sessionId: string
  isOwner: boolean
  user: { id: string; name: string } | null
  loading: boolean
}

export const useSession = (): SessionHook => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const initSession = async (urlSessionId?: string) => {
      setLoading(true)
      try {
        // Check localStorage for session data (animal code sessions)
        const stored = localStorage.getItem('sessionData')
        if (stored) {
          const parsed = JSON.parse(stored) as SessionData
          if (isMounted) {
            setSessionData(parsed)

            if (process.env.NODE_ENV === 'development') {
              console.log('[useSession] Found sessionData:', parsed)
            }
          }
        } else if (urlSessionId) {
          // URL session without localStorage - create guest user for read-only access
          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] Using URL session without localStorage:', urlSessionId)
          }
          if (isMounted) {
            setSessionData({
              sessionId: urlSessionId,
              userName: 'Guest',
              joinedAt: new Date().toISOString(),
            })
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] No sessionData in localStorage and no URL session')
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[useSession] Session init error:', error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] Init complete, loading = false')
          }
        }
      }
    }

    // Get URL params to check for session parameter
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const urlSessionId = url.searchParams.get('session')
      initSession(urlSessionId || undefined)
    } else {
      initSession()
    }

    return () => {
      isMounted = false
    }
  }, [])

  // Listen for localStorage changes (when user joins session)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('sessionData')
      if (stored) {
        const parsed = JSON.parse(stored) as SessionData
        setSessionData(parsed)

        if (process.env.NODE_ENV === 'development') {
          console.log('[useSession] Storage changed, updated sessionData:', parsed)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  /**
   * Determine user ID and name based on authentication state and session data.
   *
   * Username Fallback Strategy:
   * 1. For authenticated users (Clerk):
   *    - Try clerkUser.firstName
   *    - Fall back to clerkUser.username
   *    - Fall back to clerkUser.emailAddresses[0]?.emailAddress
   *    - Fall back to sessionData.userName (if available)
   *    - Fall back to 'Anonymous'
   *
   * 2. For guest users (no Clerk auth):
   *    - Use sessionData.userName
   *    - Fall back to 'Anonymous'
   *
   * This fallback chain ensures users always have a display name while
   * preferring authenticated identity over session data.
   */
  let userId: string | null = null
  let userName = 'Anonymous'
  let usernameSource = 'default' // Track source for debugging

  if (clerkUser) {
    // Authenticated with Clerk - use Clerk user ID
    userId = clerkUser.id
    // Use only Clerk data for authenticated users to avoid confusion
    // Don't fall back to guest session names from localStorage
    userName = clerkUser.firstName || clerkUser.username || 'User'

    if (process.env.NODE_ENV === 'development') {
      console.log('[useSession] Clerk user authenticated:', {
        userId,
        userName,
        source: usernameSource
      })
    }
  } else if (sessionData) {
    // Guest with animal code session - create guest ID
    userId = `guest-${sessionData.sessionId}`
    userName = sessionData.userName
    usernameSource = 'session.userName'

    if (process.env.NODE_ENV === 'development') {
      console.log('[useSession] Guest user with session:', {
        userId,
        userName,
        source: usernameSource
      })
    }
  }

  const user = userId ? { id: userId, name: userName } : null

  return {
    sessionId: sessionData?.sessionId || '',
    isOwner: true, // For now, everyone is an owner
    user,
    loading: loading || !clerkLoaded,
  }
}

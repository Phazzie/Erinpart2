'use client'

import { useEffect, useState } from 'react'

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

  // Guest-only mode: use session data from localStorage
  let userId: string | null = null
  let userName = 'Anonymous'

  if (sessionData) {
    userId = `guest-${sessionData.sessionId}`
    userName = sessionData.userName

    if (process.env.NODE_ENV === 'development') {
      console.log('[useSession] Guest user with session:', { userId, userName })
    }
  }

  const user = userId ? { id: userId, name: userName } : null

  return {
    sessionId: sessionData?.sessionId || '',
    isOwner: true,
    user,
    loading,
  }
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

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
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    
    const initSession = async (urlSessionId?: string) => {
      try {
        // Check localStorage for session data
        const stored = localStorage.getItem('sessionData')
        if (stored) {
          const parsed = JSON.parse(stored) as SessionData
          setSessionData(parsed)
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] Found sessionData:', parsed)
          }
          
          // Check if already signed in before creating new anonymous session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] Existing session:', session ? 'found' : 'none')
          }
          
          if (session?.user && isMounted) {
            // Already signed in, use existing session
            setUser({
              id: session.user.id,
              name: parsed.userName
            })
            if (process.env.NODE_ENV === 'development') {
              console.log('[useSession] Using existing user:', session.user.id)
            }
          } else {
            // Sign in anonymously to Supabase for data persistence
            if (process.env.NODE_ENV === 'development') {
              console.log('[useSession] Attempting anonymous sign-in...')
            }
            const { data: authData, error } = await supabase.auth.signInAnonymously()
            if (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('[useSession] Anonymous sign-in error:', error)
              }
              // Still set user with mock ID to allow app to function
              if (isMounted) {
                setUser({
                  id: 'local-' + Math.random().toString(36).substring(7),
                  name: parsed.userName
                })
              }
            } else if (authData.user && isMounted) {
              setUser({
                id: authData.user.id,
                name: parsed.userName
              })
              if (process.env.NODE_ENV === 'development') {
                console.log('[useSession] Created anonymous user:', authData.user.id)
              }
            }
          }
        } else if (urlSessionId) {
          // URL session without localStorage - create guest user for read-only access
          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] Using URL session without localStorage:', urlSessionId)
          }
          setSessionData({
            sessionId: urlSessionId,
            userName: 'Guest',
            joinedAt: new Date().toISOString()
          })
          setUser({
            id: 'guest-' + Math.random().toString(36).substring(7),
            name: 'Guest'
          })
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useSession] No sessionData in localStorage and no URL session')
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[useSession] Session init error:', error)
        }
        // Set loading to false even on error to prevent infinite spinner
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
        // Re-init auth without full page reload to avoid infinite loops
        setLoading(true)
        setUser({
          id: 'local-' + Math.random().toString(36).substring(7),
          name: parsed.userName
        })
        setLoading(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return {
    sessionId: sessionData?.sessionId || '',
    isOwner: true, // For now, everyone is an owner
    user,
    loading,
  }
}

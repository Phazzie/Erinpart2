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
        const stored = localStorage.getItem('sessionData')
        if (stored) {
          const parsed = JSON.parse(stored) as SessionData
          if (isMounted) setSessionData(parsed)
          
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user && isMounted) {
            setUser({ id: session.user.id, name: parsed.userName })
          } else {
            const { data: authData, error } = await supabase.auth.signInAnonymously()
            if (error && isMounted) {
              setUser({
                id: 'local-' + Math.random().toString(36).substring(7),
                name: parsed.userName,
              })
            } else if (authData.user && isMounted) {
              setUser({ id: authData.user.id, name: parsed.userName })
            }
          }
        } else if (urlSessionId) {
          if (isMounted) {
            setSessionData({
              sessionId: urlSessionId,
              userName: 'Guest',
              joinedAt: new Date().toISOString(),
            })
            setUser({
              id: 'guest-' + Math.random().toString(36).substring(7),
              name: 'Guest',
            })
          }
        }
      } catch (error) {
        console.error('[useSession] Session init error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const urlSessionId = url.searchParams.get('session')
      initSession(urlSessionId || undefined)
    } else {
      initSession()
    }

    return () => { isMounted = false }
  }, [])

  // Listen for localStorage changes (when user joins session)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'sessionData' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as SessionData
          setSessionData(parsed)
          // Simplified user update on storage change
          setUser(prevUser => (prevUser ? { ...prevUser, name: parsed.userName } : {
            id: 'local-' + Math.random().toString(36).substring(7),
            name: parsed.userName,
          }))
        } catch (error) {
          console.error('Failed to parse sessionData from storage:', error)
        }
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

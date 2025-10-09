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
    
    const initSession = async () => {
      try {
        // Check localStorage for session data
        const stored = localStorage.getItem('sessionData')
        if (stored) {
          const parsed = JSON.parse(stored) as SessionData
          setSessionData(parsed)
          
          // Check if already signed in before creating new anonymous session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user && isMounted) {
            // Already signed in, use existing session
            setUser({
              id: session.user.id,
              name: parsed.userName
            })
          } else {
            // Sign in anonymously to Supabase for data persistence
            const { data: authData, error } = await supabase.auth.signInAnonymously()
            if (!error && authData.user && isMounted) {
              setUser({
                id: authData.user.id,
                name: parsed.userName
              })
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Session init error:', error)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initSession()

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
        // Trigger re-init of auth
        setLoading(true)
        window.location.reload()
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

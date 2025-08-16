'use client'

import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

type SessionHook = {
  sessionId: string
  isOwner: boolean
  user: { id: string; email?: string } | null
  loading: boolean
}

// Supabase-backed session hook (preserves API keys used by the app)
export const useSession = (): SessionHook => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getUser()
          if (!isMounted) return
          setUser(data.user ? { id: data.user.id, email: (data.user as any).email } : null)
        } else {
          // Fallback for mock/dev without Supabase
          setUser({ id: 'user-1', email: 'erin@example.com' })
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    init()

    // Subscribe to auth state changes
    const { data: sub } = isSupabaseConfigured
      ? supabase.auth.onAuthStateChange((
          _event: string,
          session: { user?: { id: string; email?: string } } | null
        ) => {
          setUser(session?.user ? { id: session.user.id, email: session.user.email } : null)
        })
      : { data: { subscription: null as any } }

    return () => {
      isMounted = false
      try { sub?.subscription?.unsubscribe?.() } catch {}
    }
  }, [])

  // sessionId and isOwner are app-level constructs; keep sensible defaults
  return {
    sessionId: 'session-1',
    isOwner: true,
    user,
    loading,
  }
}

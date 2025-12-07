'use client'

import SessionBoard from '@/components/session/session-board'
import MagicWordForm from '@/components/auth/magic-word-form'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [sessionData, setSessionData] = useState<string | null>(null)
  const [hasUrlSession, setHasUrlSession] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for room in URL params
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const roomParam = url.searchParams.get('room') || url.searchParams.get('session')
      setHasUrlSession(!!roomParam)
    }

    // Check for session data in localStorage
    const data = localStorage.getItem('sessionData')
    setSessionData(data)
    setIsLoading(false)
  }, [])

  // Don't render anything during initial load to prevent flash
  if (isLoading) {
    return null
  }

  // Show SessionBoard if user has session data OR if there's a room in URL
  const shouldShowBoard = sessionData || hasUrlSession

  return (
    <div className="container mx-auto p-4 md:p-8">
      {!shouldShowBoard ? (
        <div className="min-h-screen flex items-center justify-center">
          <MagicWordForm />
        </div>
      ) : (
        <ErrorBoundary>
          <SessionBoard />
        </ErrorBoundary>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/use-session'
import { useSessionManagement } from '@/hooks/use-session-management'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LoadingSpinner from '@/components/common/loading-spinner'
import { generateSessionId } from '@/lib/utils'
import { toast } from '@/lib/toast'

type SessionJoinProps = {
  onSessionReady: (sessionId: string) => void
}

export default function SessionJoin({ onSessionReady }: SessionJoinProps) {
  const { user, loading: userLoading } = useSession()
  const [mode, setMode] = useState<'join' | 'create'>('join')
  const [sessionId, setSessionId] = useState('')
  const [userName, setUserName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Parse URL for existing session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const urlSessionId = url.searchParams.get('session')
      if (urlSessionId) {
        setSessionId(urlSessionId)
        setMode('join')
      }
    }
  }, [])

  const {
    sessionInfo,
    isParticipant,
    isFull,
    loading: sessionLoading,
    createSession,
    joinSession,
  } = useSessionManagement(sessionId, user?.id, userName)

  // If user is already in the session, proceed to app
  useEffect(() => {
    if (sessionInfo && isParticipant && !sessionLoading && !userLoading) {
      onSessionReady(sessionId)
    }
  }, [sessionInfo, isParticipant, sessionLoading, userLoading, sessionId, onSessionReady])

  const handleCreateSession = async () => {
    if (!userName.trim()) {
      toast.error('Please enter your name')
      return
    }

    setIsSubmitting(true)
    try {
      // Generate a new session ID
      const newSessionId = generateSessionId()
      setSessionId(newSessionId)

      // Wait a moment for the sessionId to be set and hook to initialize
      setTimeout(async () => {
        const success = await createSession()
        if (success) {
          // Update URL without refresh
          window.history.replaceState({}, '', `?session=${newSessionId}`)
          onSessionReady(newSessionId)
        }
        setIsSubmitting(false)
      }, 100)
    } catch (error) {
      setIsSubmitting(false)
    }
  }

  const handleJoinSession = async () => {
    if (!userName.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!sessionId.trim()) {
      toast.error('Please enter a session ID')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await joinSession()
      if (success) {
        onSessionReady(sessionId)
      }
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsSubmitting(false)
    }
  }

  if (userLoading || sessionLoading) {
    return <LoadingSpinner variant="cosmic" />
  }

  // Show session full message
  if (sessionInfo && isFull && !isParticipant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Session Full</h1>
          <p className="text-white/80 mb-6">
            This session already has {sessionInfo.participant_limit} participants and cannot accept
            more people.
          </p>

          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h3 className="text-white font-medium mb-2">Current Participants:</h3>
            <div className="space-y-1">
              {sessionInfo.participants.map((participant, index) => (
                <div key={participant.user_id} className="text-white/70 text-sm">
                  {index + 1}. {participant.user_name}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => {
              setMode('create')
              setSessionId('')
            }}
            className="w-full"
          >
            Create New Session
          </Button>
        </div>
      </div>
    )
  }

  // Show session not found
  if (sessionId && sessionInfo === null && !sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Session Not Found</h1>
          <p className="text-white/80 mb-6">
            The session &quot;{sessionId}&quot; doesn&apos;t exist or has expired.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => {
                setMode('create')
                setSessionId('')
              }}
              className="w-full"
            >
              Create New Session
            </Button>

            <Button
              onClick={() => {
                setMode('join')
                setSessionId('')
              }}
              variant="secondary"
              className="w-full"
            >
              Join Different Session
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Erin&apos;s Escapades</h1>
        <p className="text-white/80 text-center mb-8">Collaborative planning sessions</p>

        <div className="space-y-6">
          {/* Name input */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Your Name</label>
            <Input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full"
              autoFocus
            />
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'join' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80'
              }`}
            >
              Join Session
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'create' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80'
              }`}
            >
              Create Session
            </button>
          </div>

          {/* Session ID input (only for join mode) */}
          {mode === 'join' && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Session ID</label>
              <Input
                type="text"
                value={sessionId}
                onChange={e => setSessionId(e.target.value)}
                placeholder="e.g. cat-dog-bird"
                className="w-full"
              />
            </div>
          )}

          {/* Action button */}
          <Button
            onClick={mode === 'create' ? handleCreateSession : handleJoinSession}
            className="w-full"
            disabled={!userName.trim() || (mode === 'join' && !sessionId.trim()) || isSubmitting}
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Creating...'
                : 'Joining...'
              : mode === 'create'
                ? 'Create Session'
                : 'Join Session'}
          </Button>

          {/* Session info */}
          {sessionInfo && !isFull && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Session: {sessionInfo.id}</h3>
              <p className="text-white/70 text-sm mb-2">
                {sessionInfo.participants.length} of {sessionInfo.participant_limit} people
              </p>
              {sessionInfo.participants.length > 0 && (
                <div className="space-y-1">
                  {sessionInfo.participants.map((participant, index) => (
                    <div key={participant.user_id} className="text-white/60 text-xs">
                      • {participant.user_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

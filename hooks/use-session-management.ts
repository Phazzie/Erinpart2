'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/lib/toast'

type SessionParticipant = {
  user_id: string
  user_name: string
  joined_at: string
  last_seen: string
}

type SessionInfo = {
  id: string
  created_by?: string
  participant_limit: number
  created_at: string
  participants: SessionParticipant[]
}

type SessionState = {
  sessionInfo: SessionInfo | null
  isParticipant: boolean
  isFull: boolean
  loading: boolean
}

export const useSessionManagement = (sessionId: string, userId?: string, userName?: string) => {
  const [state, setState] = useState<SessionState>({
    sessionInfo: null,
    isParticipant: false,
    isFull: false,
    loading: true,
  })

  const fetchSessionInfo = useCallback(async () => {
    if (!sessionId || !isSupabaseConfigured) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      // Get session info
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) {
        // Session doesn't exist
        setState(prev => ({ ...prev, sessionInfo: null, loading: false }))
        return
      }

      // Get participants
      const { data: participants, error: participantsError } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('joined_at')

      if (participantsError) throw participantsError

      const sessionInfo: SessionInfo = {
        ...session,
        participants: participants || [],
      }

      const isParticipant = userId
        ? (participants?.some((p: any) => p.user_id === userId) ?? false)
        : false
      const isFull = (participants?.length ?? 0) >= session.participant_limit

      setState({
        sessionInfo,
        isParticipant,
        isFull,
        loading: false,
      })
    } catch (error: any) {
      console.error('Error fetching session info:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [sessionId, userId])

  useEffect(() => {
    fetchSessionInfo()
  }, [fetchSessionInfo])

  // Listen for realtime updates to participants
  const handleParticipantUpdate = useCallback(
    (payload: any) => {
      if (payload.eventType === 'INSERT' && payload.new.session_id === sessionId) {
        setState(prev => {
          if (!prev.sessionInfo) return prev
          const newParticipants = [...prev.sessionInfo.participants, payload.new]
          return {
            ...prev,
            sessionInfo: {
              ...prev.sessionInfo,
              participants: newParticipants,
            },
            isFull: newParticipants.length >= prev.sessionInfo.participant_limit,
            isParticipant: prev.isParticipant || !!(userId && payload.new.user_id === userId),
          }
        })
      } else if (payload.eventType === 'DELETE' && payload.old.session_id === sessionId) {
        setState(prev => {
          if (!prev.sessionInfo) return prev
          const newParticipants = prev.sessionInfo.participants.filter(
            p => p.user_id !== payload.old.user_id
          )
          return {
            ...prev,
            sessionInfo: {
              ...prev.sessionInfo,
              participants: newParticipants,
            },
            isFull: newParticipants.length >= prev.sessionInfo.participant_limit,
            isParticipant: prev.isParticipant && userId !== payload.old.user_id,
          }
        })
      } else if (payload.eventType === 'UPDATE' && payload.new.session_id === sessionId) {
        setState(prev => {
          if (!prev.sessionInfo) return prev
          const newParticipants = prev.sessionInfo.participants.map(p =>
            p.user_id === payload.new.user_id ? payload.new : p
          )
          return {
            ...prev,
            sessionInfo: {
              ...prev.sessionInfo,
              participants: newParticipants,
            },
          }
        })
      }
    },
    [sessionId, userId]
  )

  useRealtime({
    channelName: `session-participants-${sessionId}`,
    table: 'session_participants',
    filter: `session_id=eq.${sessionId}`,
    callback: handleParticipantUpdate,
  })

  const createSession = useCallback(async () => {
    if (!sessionId || !userId || !userName) return false

    try {
      // Create session
      const { error: sessionError } = await supabase.from('sessions').insert({
        id: sessionId,
        created_by: userId,
        participant_limit: 4,
      })

      if (sessionError) throw sessionError

      // Join as creator
      const { error: participantError } = await supabase.from('session_participants').insert({
        session_id: sessionId,
        user_id: userId,
        user_name: userName,
      })

      if (participantError) throw participantError

      toast.success('Session created!')
      await fetchSessionInfo()
      return true
    } catch (error: any) {
      console.error('Error creating session:', error)
      toast.error('Failed to create session')
      return false
    }
  }, [sessionId, userId, userName, fetchSessionInfo])

  const joinSession = useCallback(async () => {
    if (!sessionId || !userId || !userName) return false

    try {
      // Use the helper function for joining with limit checking
      const { data, error } = await supabase.rpc('join_session', {
        session_id_param: sessionId,
        user_id_param: userId,
        user_name_param: userName,
      })

      if (error) throw error

      if (!data.success) {
        toast.error(data.error || 'Failed to join session')
        return false
      }

      toast.success(data.message || 'Joined session!')
      await fetchSessionInfo()
      return true
    } catch (error: any) {
      console.error('Error joining session:', error)
      toast.error('Failed to join session')
      return false
    }
  }, [sessionId, userId, userName, fetchSessionInfo])

  const leaveSession = useCallback(async () => {
    if (!sessionId || !userId) return false

    try {
      const { error } = await supabase
        .from('session_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', userId)

      if (error) throw error

      toast.success('Left session')
      await fetchSessionInfo()
      return true
    } catch (error: any) {
      console.error('Error leaving session:', error)
      toast.error('Failed to leave session')
      return false
    }
  }, [sessionId, userId, fetchSessionInfo])

  const updateLastSeen = useCallback(async () => {
    if (!sessionId || !userId || !state.isParticipant) return

    try {
      await supabase
        .from('session_participants')
        .update({ last_seen: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('user_id', userId)
    } catch (error) {
      // Silent fail for last_seen updates
      console.warn('Failed to update last_seen:', error)
    }
  }, [sessionId, userId, state.isParticipant])

  // Update last_seen every 5 minutes
  useEffect(() => {
    if (!state.isParticipant) return

    const interval = setInterval(updateLastSeen, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [state.isParticipant, updateLastSeen])

  return {
    ...state,
    createSession,
    joinSession,
    leaveSession,
    refetch: fetchSessionInfo,
  }
}

import { useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

type UseRealtimeProps = {
  channelName: string
  table: string
  filter?: string
  callback: (payload: any) => void
}

export const useRealtime = ({ channelName, table, filter, callback }: UseRealtimeProps) => {
  // Use a ref to hold the latest callback without triggering re-subscriptions
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  useEffect(() => {
    if (!isSupabaseConfigured || !channelName) return

    const channel: RealtimeChannel = supabase.channel(channelName)

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload) => callbackRef.current(payload)
      )
      .subscribe()

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[useRealtime] Cleaning up channel: ${channelName}`)
      }
      supabase.removeChannel(channel)
    }
  }, [channelName, table, filter])
}

import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

type UseRealtimeProps = {
  channelName: string
  table: string
  filter?: string
  callback: (payload: any) => void
}

export const useRealtime = ({ channelName, table, filter, callback }: UseRealtimeProps) => {
  useEffect(() => {
    if (!isSupabaseConfigured) return

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
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, table, filter, callback])
}

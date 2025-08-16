// This hook could manage real-time subscriptions using Supabase.
// For example, listening for new tasks, updates, or presence changes.

import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export const useRealtime = (sessionId: string) => {
  useEffect(() => {
  if (!sessionId) return;
  if (!isSupabaseConfigured) return;

  const channel: any = supabase.channel(`session:${sessionId}`);

    channel
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload: any) => {
        console.log('Real-time task update:', payload);
      })
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence synced:', channel.presenceState());
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [sessionId]);
};

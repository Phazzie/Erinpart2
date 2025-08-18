'use client'

import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { mockSupabase } from './mock'

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// If Supabase is configured, use the real client. Otherwise, use the mock.
export const supabase = isSupabaseConfigured
  ? createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : mockSupabase as any; // Cast to any to avoid type conflicts with the real client

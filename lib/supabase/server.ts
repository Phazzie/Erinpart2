'use server'

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

// Server client. In real apps, consider using auth helpers for server components and cookies.
export const supabaseServer = hasSupabase
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : (null as any)

export const isSupabaseConfigured = hasSupabase

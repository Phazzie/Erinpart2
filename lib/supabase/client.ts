'use client'

import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'

// Real Supabase by default; no rich mock fallback at runtime.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

// Minimal no-op stub to keep imports safe when env is missing.
const noop = () => {}
const supabaseStub: any = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInAnonymously: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: noop } } }),
    signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    signInWithOAuth: async () => ({ data: { url: null }, error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null })
  },
  from: (_table: string) => ({
    select: () => ({
      eq: () => ({
        then: async (cb?: any) => { cb?.({ data: [], error: { message: 'Supabase not configured' } }); return { data: [], error: { message: 'Supabase not configured' } } },
        single: async () => ({ data: null, error: { message: 'Supabase not configured' } })
      })
    }),
    insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured' } }) }) }),
    update: () => ({
      eq: () => ({
        then: async (cb?: any) => {
          const resp = { data: null, error: { message: 'Supabase not configured' } }
          cb?.(resp)
          return resp
        }
      })
    }),
    delete: () => ({
      eq: () => ({
        then: async (cb?: any) => {
          const resp = { data: null, error: { message: 'Supabase not configured' } }
          cb?.(resp)
          return resp
        }
      })
    })
  }),
  channel: () => ({
    on: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    subscribe: () => ({}),
    presenceState: () => new Map()
  }),
  getChannels: () => [],
  removeChannel: () => ({ error: null })
}

export const supabase = isSupabaseConfigured
  ? createSupabaseJsClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : (supabaseStub as any)

// Expose a factory matching tests' expectations; returns the selected client
export function createClient() {
  return supabase as any
}

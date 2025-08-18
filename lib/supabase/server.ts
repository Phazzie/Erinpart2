import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { mockSupabase } from './mock'

const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createSupabaseServerClient = () => {
  if (!isSupabaseConfigured) {
    return mockSupabase as any; // Use mock if not configured
  }
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// A simple utility to assert that the Supabase environment variables are configured.
// We will not use this for now to allow the mock to work.
export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    // throw new Error(
    //   'Supabase environment variables are not configured. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    // )
    console.warn('Supabase environment variables not configured. Using mock data.')
  }
}

// Remove the singleton pattern for the server client to ensure it's created for each request
// with the correct context (or mock).
export const getSupabaseServerClient = () => {
  return createSupabaseServerClient()
}

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

let supabaseServer: ReturnType<typeof createSupabaseServerClient> | null = null

export const getSupabaseServerClient = () => {
  if (!supabaseServer) {
    supabaseServer = createSupabaseServerClient()
  }
  return supabaseServer
}

// A simple utility to assert that the Supabase environment variables are configured.
export function assertSupabaseConfigured() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      'Supabase environment variables are not configured. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
}

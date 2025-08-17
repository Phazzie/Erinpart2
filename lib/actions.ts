'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient, assertSupabaseConfigured } from '@/lib/supabase/server'

export async function signIn(prevState: { error?: string } | null, formData: FormData) {
  assertSupabaseConfigured()
  const supabaseServer = getSupabaseServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  try {
    const { error } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Supabase returns a generic error for invalid credentials, so we'll make it more specific.
      if (error.message === 'Invalid login credentials') {
        return { error: 'Invalid email or password.' }
      }
      return { error: error.message }
    }

    revalidatePath('/')
    redirect('/')
  } catch (err) {
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

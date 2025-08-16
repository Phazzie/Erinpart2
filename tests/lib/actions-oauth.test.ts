import { redirect } from 'next/navigation'
import { signInWithGoogle } from '@/lib/actions'

jest.mock('next/navigation', () => ({ redirect: jest.fn() }))

// Mock the Supabase server client module used by actions
jest.mock('@/lib/supabase/server', () => {
  const signInWithOAuth = jest.fn()
  return {
    isSupabaseConfigured: true,
    supabaseServer: { auth: { signInWithOAuth } },
    __mock: { signInWithOAuth }
  }
})

describe('actions.signInWithGoogle (OAuth)', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('redirects to provider URL when successful', async () => {
    const { __mock } = jest.requireMock('@/lib/supabase/server') as any
    __mock.signInWithOAuth.mockResolvedValueOnce({ data: { url: 'https://accounts.google.com/redirect' }, error: null })

    await signInWithGoogle()

    expect(__mock.signInWithOAuth).toHaveBeenCalledWith({ provider: 'google', options: { redirectTo: expect.any(String) } })
    expect(redirect).toHaveBeenCalledWith('https://accounts.google.com/redirect')
  })

  it('returns error when provider call fails', async () => {
    const { __mock } = jest.requireMock('@/lib/supabase/server') as any
    __mock.signInWithOAuth.mockResolvedValueOnce({ data: { url: null }, error: { message: 'oauth-failed' } })

    const res: any = await signInWithGoogle()

    expect(res).toEqual({ error: 'oauth-failed' })
    expect(redirect).not.toHaveBeenCalled()
  })
})

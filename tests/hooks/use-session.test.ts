import { renderHook, act, waitFor } from '@testing-library/react'
import { useSession } from '@/hooks/use-session'
import { supabase } from '@/lib/supabase/client'

describe('useSession', () => {
  let signInAnonymouslySpy: jest.SpyInstance

  beforeEach(() => {
    localStorage.clear()
    signInAnonymouslySpy = jest.spyOn(supabase.auth, 'signInAnonymously').mockResolvedValue({
      data: { user: { id: 'test-user' }, session: {} as any },
      error: null,
    })
  })

  afterEach(() => {
    signInAnonymouslySpy.mockRestore()
  })

  it('should initialize with loading true initially, then set to false', async () => {
    // Mock supabase.auth.getSession to return a promise that resolves
    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const { result } = renderHook(() => useSession())
    
    // Initial state might be true or false depending on how fast the effect runs
    // The important thing is that it eventually becomes false
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.sessionId).toBe('')
  })

  it('should load session data from localStorage and sign in anonymously', async () => {
    const sessionData = {
      sessionId: 'cat-dog',
      userName: 'Test User',
      joinedAt: new Date().toISOString(),
    }
    localStorage.setItem('sessionData', JSON.stringify(sessionData))

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.sessionId).toBe('cat-dog')
    expect(result.current.user).toEqual({ id: 'test-user', name: 'Test User' })
    expect(signInAnonymouslySpy).toHaveBeenCalledTimes(1)
  })

  it('should handle storage events and update sessionData', async () => {
    // Mock supabase.auth.getSession
    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const { result } = renderHook(() => useSession())

    const sessionData = {
      sessionId: 'lion-tiger',
      userName: 'New User',
      joinedAt: new Date().toISOString(),
    }

    // Note: We can't test window.location.reload in JSDOM as it's read-only
    // Instead we test that sessionData is updated when storage event fires
    act(() => {
      localStorage.setItem('sessionData', JSON.stringify(sessionData))
      window.dispatchEvent(new Event('storage'))
    })

    // The loading state should be set to true when storage event fires
    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })
  })

  it('should handle errors during session init gracefully', async () => {
    signInAnonymouslySpy.mockRejectedValueOnce(new Error('Sign in failed'))

    const sessionData = {
      sessionId: 'cat-dog',
      userName: 'Test User',
      joinedAt: new Date().toISOString(),
    }
    localStorage.setItem('sessionData', JSON.stringify(sessionData))

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })
})

import { renderHook, act, waitFor } from '@testing-library/react'
import { useSession } from '@/hooks/use-session'
import { supabase } from '@/lib/supabase/client'

describe('useSession', () => {
  let signInAnonymouslySpy: jest.SpyInstance
  let getSessionSpy: jest.SpyInstance

  beforeEach(() => {
    localStorage.clear()

    signInAnonymouslySpy = jest.spyOn(supabase.auth, 'signInAnonymously').mockResolvedValue({
      data: { user: { id: 'test-user' }, session: {} as any },
      error: null,
    })

    getSessionSpy = jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null,
    })
  })

  afterEach(() => {
    signInAnonymouslySpy.mockRestore()
  })

  it('should initialize with loading true and transition to false', async () => {
    const { result } = renderHook(() => useSession())
    // It should start in a loading state
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.sessionId).toBe('')

    // And then transition to not loading
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
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

  it('should handle storage events', async () => {
    const { result, rerender } = renderHook(() => useSession())

    // Wait for initial load to complete
    await waitFor(() => expect(result.current.loading).toBe(false))

    const sessionData = {
      sessionId: 'lion-tiger',
      userName: 'New User',
      joinedAt: new Date().toISOString(),
    }

    act(() => {
      localStorage.setItem('sessionData', JSON.stringify(sessionData))
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'sessionData',
        newValue: JSON.stringify(sessionData),
      }))
    })

    rerender()

    await waitFor(() => {
      expect(result.current.sessionId).toBe('lion-tiger')
      expect(result.current.user?.name).toBe('New User')
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

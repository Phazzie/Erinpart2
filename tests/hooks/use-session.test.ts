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

  it('should initialize with loading true and no session data', () => {
    const { result } = renderHook(() => useSession())
    expect(result.current.loading).toBe(true)
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

  it('should handle storage events', async () => {
    const { result } = renderHook(() => useSession())

    const sessionData = {
      sessionId: 'lion-tiger',
      userName: 'New User',
      joinedAt: new Date().toISOString(),
    }

    // Mock window.location.reload
    const reloadSpy = jest.fn()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, reload: reloadSpy },
    })

    act(() => {
      localStorage.setItem('sessionData', JSON.stringify(sessionData))
      window.dispatchEvent(new Event('storage'))
    })

    await waitFor(() => {
      expect(reloadSpy).toHaveBeenCalledTimes(1)
    })

    reloadSpy.mockRestore()
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

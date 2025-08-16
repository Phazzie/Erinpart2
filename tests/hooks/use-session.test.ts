import { renderHook, act, waitFor } from '@testing-library/react'
import { useSession } from '@/hooks/use-session'

// Mock Supabase client module shape used by the hook
jest.mock('@/lib/supabase/client', () => {
  const mockAuth = {
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
  }
  return {
    supabase: { auth: mockAuth },
    isSupabaseConfigured: true
  }
})

describe('useSession', () => {
  // Re-require the mocked module to access the created mocks
  const { supabase } = jest.requireMock('@/lib/supabase/client') as any
  const mockGetUser = supabase.auth.getUser as jest.Mock
  const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial session state as null and loading as true', () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } })

    const { result } = renderHook(() => useSession())

  // Hook exposes user/loading, not a full session object
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it('should fetch user on initial load and update state', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    mockGetUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
  expect(result.current.loading).toBe(false)
  expect(result.current.user).toEqual(mockUser)
    })
  })

  it('should handle auth state changes', async () => {
    const mockUser1 = { id: '1', email: 'user1@example.com' }
    const mockUser2 = { id: '2', email: 'user2@example.com' }
    let authStateChangeCallback: (event: string, session: any) => void = () => {}

    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    const { result } = renderHook(() => useSession())

    // Simulate initial load with no user
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()

    // Simulate login
    act(() => {
      authStateChangeCallback('SIGNED_IN', { user: mockUser1 })
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser1)
    })

    // Simulate user change
    act(() => {
      authStateChangeCallback('SIGNED_IN', { user: mockUser2 })
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser2)
    })

    // Simulate logout
    act(() => {
      authStateChangeCallback('SIGNED_OUT', { user: null })
    })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
    })
  })

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = jest.fn()
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: mockUnsubscribe } } })

    const { unmount } = renderHook(() => useSession())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('should handle getUser error gracefully', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('Failed to fetch user') })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } })

    const { result } = renderHook(() => useSession())

    await waitFor(() => {
  expect(result.current.loading).toBe(false)
  expect(result.current.user).toBeNull()
    })
  })
})
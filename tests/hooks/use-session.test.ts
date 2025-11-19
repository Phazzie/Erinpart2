import { renderHook, act, waitFor } from '@testing-library/react'
import { useSession } from '@/hooks/use-session'
import { useUser } from '@clerk/nextjs'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}))

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

describe('useSession', () => {
  beforeEach(() => {
    localStorage.clear()
    // Default: no Clerk user, loaded state
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Guest Users (no Clerk auth)', () => {
    it('should initialize with loading true initially', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any)

      const { result } = renderHook(() => useSession())
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBeNull()
      expect(result.current.sessionId).toBe('')
    })

    it('should create guest user from localStorage session data', async () => {
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
      expect(result.current.user).toEqual({
        id: 'guest-cat-dog',
        name: 'Test User',
      })
    })

    it('should handle no session data gracefully', async () => {
      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.sessionId).toBe('')
    })

    it('should handle storage events and update session data', async () => {
      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()

      const sessionData = {
        sessionId: 'lion-tiger',
        userName: 'New User',
        joinedAt: new Date().toISOString(),
      }

      act(() => {
        localStorage.setItem('sessionData', JSON.stringify(sessionData))
        window.dispatchEvent(new Event('storage'))
      })

      await waitFor(() => {
        expect(result.current.sessionId).toBe('lion-tiger')
        expect(result.current.user).toEqual({
          id: 'guest-lion-tiger',
          name: 'New User',
        })
      })
    })

    it('should handle URL session parameter for guest access', async () => {
      // Mock window.location.href with query parameter
      const originalLocation = window.location

      const { result, unmount } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.sessionId).toBe('elephant-giraffe')
      expect(result.current.user).toEqual({
        id: 'guest-elephant-giraffe',
        name: 'Guest',
      })

      // Cleanup: unmount hook and restore URL constructor
      unmount()
      mockURL.mockRestore()
    })
  })

  describe('Authenticated Users (Clerk)', () => {
    it('should use Clerk user ID and name when authenticated', async () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_clerk123',
          firstName: 'Alice',
          username: 'alice123',
        } as any,
        isLoaded: true,
        isSignedIn: true,
      } as any)

      const sessionData = {
        sessionId: 'cat-dog',
        userName: 'Guest Name',
        joinedAt: new Date().toISOString(),
      }
      localStorage.setItem('sessionData', JSON.stringify(sessionData))

      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should use Clerk user ID, not guest ID
      expect(result.current.user).toEqual({
        id: 'user_clerk123',
        name: 'Alice',
      })
      expect(result.current.sessionId).toBe('cat-dog')
    })

    it('should fall back to username if firstName is not available', async () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_clerk456',
          username: 'bob456',
        } as any,
        isLoaded: true,
        isSignedIn: true,
      } as any)

      const sessionData = {
        sessionId: 'cat-dog',
        userName: 'Guest Name',
        joinedAt: new Date().toISOString(),
      }
      localStorage.setItem('sessionData', JSON.stringify(sessionData))

      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual({
        id: 'user_clerk456',
        name: 'bob456',
      })
    })

    it('should use default User name if Clerk name is not available', async () => {
      mockUseUser.mockReturnValue({
        user: {
          id: 'user_clerk789',
        } as any,
        isLoaded: true,
        isSignedIn: true,
      } as any)

      const sessionData = {
        sessionId: 'cat-dog',
        userName: 'Session User',
        joinedAt: new Date().toISOString(),
      }
      localStorage.setItem('sessionData', JSON.stringify(sessionData))

      const { result } = renderHook(() => useSession())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // After fix #7, authenticated users use only Clerk data, not localStorage session data
      expect(result.current.user).toEqual({
        id: 'user_clerk789',
        name: 'User',
      })
    })

    it('should show loading while Clerk is initializing', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any)

      const { result } = renderHook(() => useSession())
      expect(result.current.loading).toBe(true)
    })
  })
})

import { renderHook } from '@testing-library/react'
import { useRealtime } from '@/hooks/use-realtime'

jest.mock('@/lib/supabase/client', () => {
  const on = jest.fn().mockReturnThis()
  const subscribe = jest.fn().mockReturnThis()
  const removeChannel = jest.fn()
  const channel = { on, subscribe }
  return {
    isSupabaseConfigured: true,
    supabase: { channel: jest.fn(() => channel), removeChannel },
    __mock: { on, subscribe, removeChannel }
  }
})

describe('useRealtime', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('subscribes and cleans up when sessionId provided', () => {
  const { __mock } = jest.requireMock('@/lib/supabase/client') as any
  const { unmount } = renderHook(() => useRealtime('session-1'))
  expect(__mock.subscribe).toHaveBeenCalled()
    unmount()
  expect(__mock.removeChannel).toHaveBeenCalled()
  })

  it('does nothing when no sessionId', () => {
  const { __mock } = jest.requireMock('@/lib/supabase/client') as any
  renderHook(() => useRealtime(''))
  expect(__mock.subscribe).not.toHaveBeenCalled()
  })
})

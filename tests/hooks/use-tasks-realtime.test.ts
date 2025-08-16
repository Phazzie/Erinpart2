import { renderHook, act } from '@testing-library/react'
import { useTasks } from '@/hooks/use-tasks'

// Mock supabase client to capture channel and simulate events
let changeHandler: ((payload: any) => void) | null = null

jest.mock('@/lib/supabase/client', () => {
  const subscribeMock = jest.fn()
  const removeChannelMock = jest.fn()
  const channelOnMock = jest.fn().mockImplementation((_event: any, _filter: any, cb: any) => {
    changeHandler = cb
    return channel
  })
  const channel = { on: channelOnMock, subscribe: subscribeMock }
  return {
    isSupabaseConfigured: true,
    supabase: {
      channel: jest.fn(() => channel),
      removeChannel: removeChannelMock,
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    },
    __mock: { subscribeMock, removeChannelMock, channelOnMock }
  }
})

describe('useTasks realtime merge', () => {
  const SESSION_ID = 'session-1'

  beforeEach(() => {
    jest.clearAllMocks()
    changeHandler = null
  })

  it('merges INSERT/UPDATE/DELETE events for same session', () => {
  const { result, unmount } = renderHook(() => useTasks(SESSION_ID))

    // Start with empty tasks to make assertions simpler
    act(() => {
      // Simulate INSERT for this session
      changeHandler?.({ eventType: 'INSERT', new: { id: 't1', session_id: SESSION_ID, text: 'A', is_complete: false } })
      // Should add task
    })
    expect(result.current.tasks.find(t => t.id === 't1')?.text).toBe('A')

    act(() => {
      // UPDATE same task
      changeHandler?.({ eventType: 'UPDATE', new: { id: 't1', session_id: SESSION_ID, text: 'A2', is_complete: true } })
    })
    expect(result.current.tasks.find(t => t.id === 't1')?.text).toBe('A2')
    expect(result.current.tasks.find(t => t.id === 't1')?.is_complete).toBe(true)

    act(() => {
      // DELETE
      changeHandler?.({ eventType: 'DELETE', old: { id: 't1', session_id: SESSION_ID } })
    })
    expect(result.current.tasks.find(t => t.id === 't1')).toBeUndefined()

  unmount()
  const { __mock } = jest.requireMock('@/lib/supabase/client') as any
  expect(__mock.removeChannelMock).toHaveBeenCalled()
  })

  it('ignores events from different sessions', () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))

    act(() => {
      changeHandler?.({ eventType: 'INSERT', new: { id: 'x', session_id: 'other', text: 'X' } })
    })
    expect(result.current.tasks.find(t => t.id === 'x')).toBeUndefined()
  })
})

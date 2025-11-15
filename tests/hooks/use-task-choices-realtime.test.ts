import { renderHook, act } from '@testing-library/react'
import { useTaskChoices } from '@/hooks/use-task-choices'

let changeHandler: ((payload: any) => void) | null = null

jest.mock('@/lib/supabase/client', () => {
  const subscribeMock = jest.fn()
  const removeChannelMock = jest.fn()
  const channelOnMock = jest.fn().mockImplementation((_evt: any, _filter: any, cb: any) => {
    changeHandler = cb
    return channel
  })
  const channel = { on: channelOnMock, subscribe: subscribeMock }
  return {
    isSupabaseConfigured: true,
    supabase: {
      channel: jest.fn(() => channel),
      removeChannel: removeChannelMock,
      from: jest.fn((table: string) => {
        if (table !== 'task_choices') throw new Error('unexpected table')
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        }
      }),
    },
    __mock: { subscribeMock, removeChannelMock, channelOnMock },
  }
})

describe('useTaskChoices realtime merge', () => {
  const SESSION_ID = 's1'
  const USER_ID = 'u1'

  beforeEach(() => {
    jest.clearAllMocks()
    changeHandler = null
  })

  it('handles INSERT/UPDATE/DELETE events', () => {
    const { result, unmount } = renderHook(() => useTaskChoices(SESSION_ID, USER_ID))

    // INSERT
    act(() => {
      changeHandler?.({
        eventType: 'INSERT',
        new: {
          id: 'c1',
          task_id: 't1',
          user_id: USER_ID,
          choice: 'yes',
          created_at: '',
          updated_at: '',
        },
      })
    })
    expect(result.current.myChoiceByTask.get('t1')?.choice).toBe('yes')

    // UPDATE
    act(() => {
      changeHandler?.({
        eventType: 'UPDATE',
        new: {
          id: 'c1',
          task_id: 't1',
          user_id: USER_ID,
          choice: 'no',
          created_at: '',
          updated_at: '',
        },
      })
    })
    expect(result.current.myChoiceByTask.get('t1')?.choice).toBe('no')

    // DELETE
    act(() => {
      changeHandler?.({
        eventType: 'DELETE',
        old: { id: 'c1', task_id: 't1', user_id: USER_ID, choice: 'no' },
      })
    })
    expect(result.current.myChoiceByTask.get('t1')).toBeUndefined()

    unmount()
    const { __mock } = jest.requireMock('@/lib/supabase/client') as any
    expect(__mock.removeChannelMock).toHaveBeenCalled()
  })
})

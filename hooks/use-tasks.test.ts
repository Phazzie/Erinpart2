import { renderHook, waitFor } from '@testing-library/react'
import { useTasks } from './use-tasks'
import { supabase } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/use-realtime'

jest.mock('@/hooks/use-realtime')

const initialRows = [
  { id: 'a', session_id: 'session-1', text: 'Task A', is_complete: false, day: 'today', order_index: 0, choice: '', comments: '', created_by: 'user-1', is_secret: false, votes: [] },
  { id: 'b', session_id: 'session-1', text: 'Task B', is_complete: false, day: 'today', order_index: 1, choice: '', comments: '', created_by: 'user-1', is_secret: false, votes: [] },
]

const SESSION_ID = 'session-1'

describe('useTasks', () => {
  it('should initialize with tasks for the given session', async () => {
    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: initialRows, error: null }),
    } as any)

    const { result } = renderHook(() => useTasks(SESSION_ID))

    await waitFor(() => {
      expect(result.current.tasks.length).toBeGreaterThan(0)
    })

    expect(result.current.tasks.map(t => t.id)).toEqual(initialRows.map(r => r.id))
    fromSpy.mockRestore()
  })
})

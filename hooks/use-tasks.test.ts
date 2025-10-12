import { renderHook, waitFor } from '@testing-library/react'
import { useTasks } from './use-tasks'
import { useRealtime } from '@/hooks/use-realtime'
import { act } from 'react'

jest.mock('@/hooks/use-realtime')

// Mock the supabase client module
jest.mock('@/lib/supabase/client', () => {
  const mockSupabase = {
    from: jest.fn(),
  }
  return {
    supabase: mockSupabase,
    isSupabaseConfigured: true, // Mock as configured for tests
  }
})

const { supabase } = require('@/lib/supabase/client')

const initialRows = [
  { id: 'a', session_id: 'session-1', text: 'Task A', is_complete: false, day: 'today', order_index: 0, choice: '', comments: '', created_by: 'user-1', is_secret: false, votes: [] },
  { id: 'b', session_id: 'session-1', text: 'Task B', is_complete: false, day: 'today', order_index: 1, choice: '', comments: '', created_by: 'user-1', is_secret: false, votes: [] },
]

const SESSION_ID = 'session-1'

describe('useTasks', () => {
  it('should initialize with tasks for the given session', async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: initialRows, error: null })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      select: selectMock,
    } as any)

    const { result } = renderHook(() => useTasks(SESSION_ID))

    await waitFor(() => {
      expect(result.current.tasks.length).toBeGreaterThan(0)
    })

    expect(result.current.tasks.map(t => t.id)).toEqual(initialRows.map(r => r.id))
    fromSpy.mockRestore()
  })

  it('should maintain stable callback references after adding tasks', async () => {
    // Mock Supabase to return initial tasks and handle inserts
    const fromSpy = jest.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          insert: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ 
            data: { id: 'new-task', text: 'New Task', session_id: SESSION_ID, order_index: 0 }, 
            error: null 
          }),
        } as any
      }
      return {} as any
    })

    const { result } = renderHook(() => useTasks(SESSION_ID, 'user-1'))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Capture initial callback references
    const addTaskRef1 = result.current.addTask
    const updateTaskRef1 = result.current.updateTask
    const deleteTaskRef1 = result.current.deleteTask

    // Add a task
    await act(async () => {
      await result.current.addTask('Test task', false)
    })

    // Check that callback references are still the same (no infinite re-render)
    expect(result.current.addTask).toBe(addTaskRef1)
    expect(result.current.updateTask).toBe(updateTaskRef1)
    expect(result.current.deleteTask).toBe(deleteTaskRef1)

    fromSpy.mockRestore()
  })
})

import { renderHook, act } from '@testing-library/react'
import { useTasks } from './use-tasks'

// Provide a minimal mock of the Supabase client used by the hook
const initialRows = [
  { id: 'a', session_id: 'session-1', text: 'Task A', is_complete: false, day: 'today', order_index: 0, choice: '', comments: '', created_by: 'user-1', is_secret: false, votes: [] },
  { id: 'b', session_id: 'session-1', text: 'Task B', is_complete: false, day: 'today', order_index: 1, choice: '', comments: '', created_by: 'user-1', is_secret: false, votes: [] },
]

let rows = [...initialRows]

jest.mock('@/lib/supabase/client', () => {
  return {
    isSupabaseConfigured: true,
    supabase: {
      from: jest.fn((table: string) => {
        if (table !== 'tasks') throw new Error('unexpected table')
        return {
          select: jest.fn(() => ({
            eq: jest.fn((col: string, val: string) => {
              const data = rows.filter(r => (r as any)[col] === val)
              return Promise.resolve({ data, error: null })
            })
          })),
          insert: jest.fn((payload: any) => ({
            select: () => ({ single: async () => {
              const inserted = { id: `id-${Date.now()}`, ...payload }
              rows.push(inserted)
              return { data: inserted, error: null }
            }})
          })),
          update: jest.fn((updates: any) => ({
            eq: jest.fn((col: string, val: string) => {
              rows = rows.map(r => (r as any)[col] === val ? { ...r, ...updates } : r)
              return Promise.resolve({ data: null, error: null })
            })
          })),
          delete: jest.fn(() => ({
            eq: jest.fn((col: string, val: string) => {
              rows = rows.filter(r => (r as any)[col] !== val)
              return Promise.resolve({ data: null, error: null })
            })
          })),
        }
      }),
      channel: jest.fn(() => ({ on: jest.fn(() => ({ subscribe: jest.fn() })), subscribe: jest.fn() })),
      removeChannel: jest.fn()
    }
  }
})

const SESSION_ID = 'session-1';

describe('useTasks', () => {
  it('should initialize with tasks for the given session', async () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))
    // Wait one tick for initial fetch
    await act(async () => {})
    expect(result.current.tasks.map(t => t.id)).toEqual(rows.filter(r => r.session_id === SESSION_ID).map(r => r.id))
  })

  it('should add a new task', async () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))

    await act(async () => {
      await result.current.addTask('New test task', false)
    })

    expect(result.current.tasks.find(t => t.text === 'New test task')).toBeTruthy()
    expect(result.current.tasks[result.current.tasks.length - 1].is_secret).toBe(false)
  })

  it('should update a task', async () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))
    await act(async () => {})
    const taskToUpdate = result.current.tasks[0]

    await act(async () => {
      await result.current.updateTask(taskToUpdate.id, { text: 'Updated text' })
    })

    expect(result.current.tasks[0].text).toBe('Updated text')
  })

  it('should toggle a task completion status', async () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))
    await act(async () => {})
    const taskToUpdate = result.current.tasks[0]

    expect(taskToUpdate.is_complete).toBe(false)

    await act(async () => {
      await result.current.updateTask(taskToUpdate.id, { is_complete: true })
    })

    expect(result.current.tasks[0].is_complete).toBe(true)
  })

  it('should delete a task', async () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))
    await act(async () => {})
    const initialLength = result.current.tasks.length
    const taskToDelete = result.current.tasks[0]

    await act(async () => {
      await result.current.deleteTask(taskToDelete.id)
    })

    expect(result.current.tasks).toHaveLength(initialLength - 1)
    expect(result.current.tasks.find(t => t.id === taskToDelete.id)).toBeUndefined()
  })

  it('should not add a task with empty text', () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))
    const initialLength = result.current.tasks.length

    act(() => {
      result.current.addTask('  ', false)
    })

    expect(result.current.tasks).toHaveLength(initialLength)
  })

  it('should not update a non-existent task', async () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))
    await act(async () => {})
    const initialTasks = [...result.current.tasks]

    await act(async () => {
      await result.current.updateTask('non-existent-id', { text: 'Updated text' })
    })

    expect(result.current.tasks).toEqual(initialTasks)
  })

  it('should not delete a non-existent task', async () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))
    await act(async () => {})
    const initialLength = result.current.tasks.length

    await act(async () => {
      await result.current.deleteTask('non-existent-id')
    })

    expect(result.current.tasks).toHaveLength(initialLength)
  })

  it('should add a task with a very long text', async () => {
    const { result } = renderHook(() => useTasks(SESSION_ID))
    const longText = 'a'.repeat(1000)

    await act(async () => {
      await result.current.addTask(longText, false)
    })

    expect(result.current.tasks[result.current.tasks.length - 1].text).toBe(longText)
  })
});

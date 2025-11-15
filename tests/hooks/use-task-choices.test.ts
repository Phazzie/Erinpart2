import { renderHook, act } from '@testing-library/react'
import { useTaskChoices } from '@/hooks/use-task-choices'

// In-memory rows to simulate task_choices scoped to a session via tasks join
let choices = [
  { id: 'c1', task_id: 't1', user_id: 'u1', choice: 'yes', created_at: '', updated_at: '' },
  { id: 'c2', task_id: 't2', user_id: 'u2', choice: 'no', created_at: '', updated_at: '' },
]

jest.mock('@/lib/supabase/client', () => {
  return {
    isSupabaseConfigured: true,
    supabase: {
      from: jest.fn((table: string) => {
        if (table !== 'task_choices') throw new Error('unexpected table')
        return {
          select: jest.fn(() => ({
            eq: jest.fn((_col: string, _val: string) =>
              Promise.resolve({ data: choices, error: null })
            ),
          })),
          insert: jest.fn((payload: any) => ({
            select: () => ({
              single: async () => {
                const row = { id: `id-${Date.now()}`, ...payload, created_at: '', updated_at: '' }
                choices.push(row)
                return { data: row, error: null }
              },
            }),
          })),
          update: jest.fn((updates: any) => ({
            eq: jest.fn((_col: string, val: string) => {
              choices = choices.map(c => ((c as any).id === val ? { ...c, ...updates } : c))
              return Promise.resolve({ data: null, error: null })
            }),
          })),
        }
      }),
      channel: jest.fn(() => ({
        on: jest.fn(() => ({ subscribe: jest.fn() })),
        subscribe: jest.fn(),
      })),
      removeChannel: jest.fn(),
    },
  }
})

const SESSION_ID = 's1'

describe('useTaskChoices', () => {
  it('loads initial choices and exposes myChoiceByTask', async () => {
    const { result } = renderHook(() => useTaskChoices(SESSION_ID, 'u1'))
    await act(async () => {})
    expect(result.current.myChoiceByTask.get('t1')?.choice).toBe('yes')
    expect(result.current.myChoiceByTask.get('t2')).toBeUndefined()
  })

  it('upserts my choice (insert)', async () => {
    const { result } = renderHook(() => useTaskChoices(SESSION_ID, 'u3'))
    await act(async () => {})

    await act(async () => {
      await result.current.setMyChoice('t3', 'maybe')
    })

    expect(result.current.myChoiceByTask.get('t3')?.choice).toBe('maybe')
  })

  it('updates my existing choice', async () => {
    const { result } = renderHook(() => useTaskChoices(SESSION_ID, 'u1'))
    await act(async () => {})

    const before = result.current.myChoiceByTask.get('t1')
    expect(before?.choice).toBe('yes')

    await act(async () => {
      await result.current.setMyChoice('t1', 'no')
    })

    expect(result.current.myChoiceByTask.get('t1')?.choice).toBe('no')
  })
})

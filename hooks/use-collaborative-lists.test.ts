import { renderHook, waitFor, act } from '@testing-library/react'
import { useCollaborativeLists, useListItems, useListItemVerifications } from './use-collaborative-lists'
import { supabase } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/use-realtime'

jest.mock('@/hooks/use-realtime')
jest.mock('@/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockLists = [
  {
    id: 'list-1',
    session_id: 'session-1',
    title: 'Grocery List',
    list_type: 'bullet' as const,
    creator_id: 'user-1',
    creator_name: 'Alice',
    created_at: '2025-10-17T10:00:00Z',
    updated_at: '2025-10-17T10:00:00Z',
  },
  {
    id: 'list-2',
    session_id: 'session-1',
    title: 'Todo List',
    list_type: 'numbered' as const,
    creator_id: 'user-1',
    creator_name: 'Alice',
    created_at: '2025-10-17T09:00:00Z',
    updated_at: '2025-10-17T09:00:00Z',
  },
]

const mockItems = [
  {
    id: 'item-1',
    list_id: 'list-1',
    text: 'Milk',
    order_index: 0,
    created_at: '2025-10-17T10:01:00Z',
    updated_at: '2025-10-17T10:01:00Z',
  },
  {
    id: 'item-2',
    list_id: 'list-1',
    text: 'Bread',
    order_index: 1,
    created_at: '2025-10-17T10:02:00Z',
    updated_at: '2025-10-17T10:02:00Z',
  },
]

const mockVerifications = [
  {
    id: 'ver-1',
    item_id: 'item-1',
    user_id: 'user-2',
    user_name: 'Bob',
    is_accurate: true,
    correction_text: null,
    created_at: '2025-10-17T10:05:00Z',
    updated_at: '2025-10-17T10:05:00Z',
  },
  {
    id: 'ver-2',
    item_id: 'item-1',
    user_id: 'user-3',
    user_name: 'Carol',
    is_accurate: false,
    correction_text: 'Should be Almond Milk',
    created_at: '2025-10-17T10:06:00Z',
    updated_at: '2025-10-17T10:06:00Z',
  },
]

describe('useCollaborativeLists', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with lists for the given session', async () => {
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockLists, error: null }),
    }
    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any)

    const { result } = renderHook(() => useCollaborativeLists('session-1', 'user-1', 'Alice'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.lists).toHaveLength(2)
    expect(result.current.lists[0].id).toBe('list-1')
    fromSpy.mockRestore()
  })

  it('should create a new list', async () => {
    let callCount = 0
    const fromSpy = jest.spyOn(supabase, 'from').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call: initial fetch
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        } as any
      } else {
        // Second call: insert
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'list-3', title: 'New List', list_type: 'bullet' },
            error: null,
          }),
        } as any
      }
    })

    const { result } = renderHook(() => useCollaborativeLists('session-1', 'user-1', 'Alice'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let newList
    await act(async () => {
      newList = await result.current.createList('New List', 'bullet')
    })

    expect(newList).toBeTruthy()
    expect(newList?.title).toBe('New List')
    fromSpy.mockRestore()
  })

  it('should handle realtime INSERT events', async () => {
    let realtimeCallback: any

    ;(useRealtime as jest.Mock).mockImplementation(({ callback }) => {
      realtimeCallback = callback
    })

    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [mockLists[0]], error: null }),
    } as any)

    const { result } = renderHook(() => useCollaborativeLists('session-1', 'user-1', 'Alice'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.lists).toHaveLength(1)

    // Simulate realtime INSERT
    act(() => {
      realtimeCallback({
        eventType: 'INSERT',
        new: mockLists[1],
      })
    })

    expect(result.current.lists).toHaveLength(2)
    expect(result.current.lists[0].id).toBe('list-2') // Should be first (newest)
    fromSpy.mockRestore()
  })

  it('should handle realtime UPDATE events', async () => {
    let realtimeCallback: any

    ;(useRealtime as jest.Mock).mockImplementation(({ callback }) => {
      realtimeCallback = callback
    })

    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: mockLists, error: null }),
    } as any)

    const { result } = renderHook(() => useCollaborativeLists('session-1', 'user-1', 'Alice'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Simulate realtime UPDATE
    act(() => {
      realtimeCallback({
        eventType: 'UPDATE',
        new: { ...mockLists[0], title: 'Updated Grocery List' },
      })
    })

    const updatedList = result.current.lists.find(l => l.id === 'list-1')
    expect(updatedList?.title).toBe('Updated Grocery List')
    fromSpy.mockRestore()
  })

  it('should handle realtime DELETE events', async () => {
    let realtimeCallback: any

    ;(useRealtime as jest.Mock).mockImplementation(({ callback }) => {
      realtimeCallback = callback
    })

    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: mockLists, error: null }),
    } as any)

    const { result } = renderHook(() => useCollaborativeLists('session-1', 'user-1', 'Alice'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.lists).toHaveLength(2)

    // Simulate realtime DELETE
    act(() => {
      realtimeCallback({
        eventType: 'DELETE',
        old: mockLists[0],
      })
    })

    expect(result.current.lists).toHaveLength(1)
    expect(result.current.lists.find(l => l.id === 'list-1')).toBeUndefined()
    fromSpy.mockRestore()
  })
})

describe('useListItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with items for the given list', async () => {
    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
    } as any)

    const { result } = renderHook(() => useListItems('list-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].text).toBe('Milk')
    fromSpy.mockRestore()
  })

  it('should add a new item', async () => {
    const fromSpy = jest.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'list_items') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
          insert: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'item-3', list_id: 'list-1', text: 'Eggs', order_index: 2 },
            error: null,
          }),
        } as any
      }
      return {} as any
    })

    const { result } = renderHook(() => useListItems('list-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let newItem
    await act(async () => {
      newItem = await result.current.addItem('Eggs')
    })

    expect(newItem).toBeTruthy()
    expect(newItem?.text).toBe('Eggs')
    expect(newItem?.order_index).toBe(2)
    fromSpy.mockRestore()
  })

  it('should handle realtime INSERT and maintain sort order', async () => {
    let realtimeCallback: any

    ;(useRealtime as jest.Mock).mockImplementation(({ callback }) => {
      realtimeCallback = callback
    })

    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [mockItems[0]], error: null }),
    } as any)

    const { result } = renderHook(() => useListItems('list-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Simulate realtime INSERT
    act(() => {
      realtimeCallback({
        eventType: 'INSERT',
        new: mockItems[1],
      })
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].text).toBe('Milk') // order_index 0
    expect(result.current.items[1].text).toBe('Bread') // order_index 1
    fromSpy.mockRestore()
  })

  it('should update an item', async () => {
    const fromSpy = jest.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'list_items') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          update: jest.fn().mockResolvedValue({ error: null }),
        } as any
      }
      return {} as any
    })

    const { result } = renderHook(() => useListItems('list-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateItem('item-1', 'Almond Milk')
    })

    expect(fromSpy).toHaveBeenCalled()
    fromSpy.mockRestore()
  })

  it('should delete an item', async () => {
    const fromSpy = jest.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'list_items') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          delete: jest.fn().mockResolvedValue({ error: null }),
        } as any
      }
      return {} as any
    })

    const { result } = renderHook(() => useListItems('list-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteItem('item-1')
    })

    expect(fromSpy).toHaveBeenCalled()
    fromSpy.mockRestore()
  })
})

describe('useListItemVerifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with verifications for the given item', async () => {
    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: mockVerifications, error: null }),
    } as any)

    const { result } = renderHook(() => useListItemVerifications('item-1', 'user-2', 'Bob'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.verifications).toHaveLength(2)
    expect(result.current.myVerification?.user_id).toBe('user-2')
    fromSpy.mockRestore()
  })

  it('should submit a new verification', async () => {
    const fromSpy = jest.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'list_item_verifications') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          insert: jest.fn().mockResolvedValue({ error: null }),
        } as any
      }
      return {} as any
    })

    const { result } = renderHook(() => useListItemVerifications('item-1', 'user-4', 'Dave'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.submitVerification(true)
    })

    expect(fromSpy).toHaveBeenCalled()
    fromSpy.mockRestore()
  })

  it('should update an existing verification', async () => {
    const fromSpy = jest.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'list_item_verifications') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          update: jest.fn().mockResolvedValue({ error: null }),
        } as any
      }
      return {} as any
    })

    jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [mockVerifications[0]], error: null }),
    } as any)

    const { result } = renderHook(() => useListItemVerifications('item-1', 'user-2', 'Bob'))

    await waitFor(() => {
      expect(result.current.myVerification).toBeTruthy()
    })

    await act(async () => {
      await result.current.submitVerification(false, 'Actually needs Oat Milk')
    })

    expect(fromSpy).toHaveBeenCalled()
    fromSpy.mockRestore()
  })

  it('should handle realtime verification events', async () => {
    let realtimeCallback: any

    ;(useRealtime as jest.Mock).mockImplementation(({ callback }) => {
      realtimeCallback = callback
    })

    const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [mockVerifications[0]], error: null }),
    } as any)

    const { result } = renderHook(() => useListItemVerifications('item-1', 'user-2', 'Bob'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.verifications).toHaveLength(1)

    // Simulate realtime INSERT
    act(() => {
      realtimeCallback({
        eventType: 'INSERT',
        new: mockVerifications[1],
      })
    })

    expect(result.current.verifications).toHaveLength(2)
    fromSpy.mockRestore()
  })
})

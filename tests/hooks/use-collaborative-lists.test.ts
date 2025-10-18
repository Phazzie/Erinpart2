import { renderHook, act, waitFor } from '@testing-library/react'
import { useListItems } from '@/hooks/use-collaborative-lists'

// Mock supabase client
jest.mock('@/lib/supabase/client', () => {
  const subscribeMock = jest.fn()
  const removeChannelMock = jest.fn()
  const channelOnMock = jest.fn().mockImplementation(() => channel)
  const channel = { on: channelOnMock, subscribe: subscribeMock }
  
  const selectMock = jest.fn(() => ({
    eq: jest.fn(() => ({
      order: jest.fn(() => Promise.resolve({ 
        data: [
          { id: 'item1', list_id: 'list-1', text: 'Item 1', order_index: 0 },
          { id: 'item2', list_id: 'list-1', text: 'Item 2', order_index: 1 }
        ], 
        error: null 
      })),
    })),
  }))

  const insertMock = jest.fn(() => ({
    select: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve({ 
        data: { id: 'item3', list_id: 'list-1', text: 'Item 3', order_index: 2 }, 
        error: null 
      })),
    })),
  }))

  return {
    isSupabaseConfigured: true,
    supabase: {
      channel: jest.fn(() => channel),
      removeChannel: removeChannelMock,
      from: jest.fn(() => ({
        select: selectMock,
        insert: insertMock,
      })),
    },
    __mock: { subscribeMock, removeChannelMock, channelOnMock, selectMock, insertMock }
  }
})

describe('useListItems', () => {
  const LIST_ID = 'list-1'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with items from the database', async () => {
    const { result } = renderHook(() => useListItems(LIST_ID))

    // Initially loading
    expect(result.current.loading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].text).toBe('Item 1')
    expect(result.current.items[1].text).toBe('Item 2')
  })

  it('should prevent infinite re-renders when addItem is called multiple times', async () => {
    const { result } = renderHook(() => useListItems(LIST_ID))

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const { __mock } = jest.requireMock('@/lib/supabase/client') as any
    const insertMock = __mock.insertMock

    // Get the addItem callback reference before calling it
    const addItemRef1 = result.current.addItem

    // Call addItem
    await act(async () => {
      await result.current.addItem('New Item 1')
    })

    // Get the addItem callback reference after first call
    const addItemRef2 = result.current.addItem

    // The callback reference should be the same (stable)
    // This proves that items.length is NOT in the dependency array
    expect(addItemRef1).toBe(addItemRef2)

    // Verify insert was called
    expect(insertMock).toHaveBeenCalledTimes(1)

    // Call addItem again
    await act(async () => {
      await result.current.addItem('New Item 2')
    })

    // Get the addItem callback reference after second call
    const addItemRef3 = result.current.addItem

    // The callback reference should STILL be the same
    expect(addItemRef1).toBe(addItemRef3)

    // Verify insert was called twice total
    expect(insertMock).toHaveBeenCalledTimes(2)
  })

  it('should add items with optimistic updates', async () => {
    const { result } = renderHook(() => useListItems(LIST_ID))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const { __mock } = jest.requireMock('@/lib/supabase/client') as any
    const insertMock = __mock.insertMock

    // Initial items length is 2
    expect(result.current.items).toHaveLength(2)
    const initialItemCount = result.current.items.length

    // Add an item
    await act(async () => {
      await result.current.addItem('Test Item')
    })

    // Verify insert was called (order_index will be based on state at the time)
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        list_id: LIST_ID,
        text: 'Test Item',
      })
    )

    // The items array should have increased by 1
    // (either from optimistic update or realtime event)
    await waitFor(() => {
      expect(result.current.items.length).toBeGreaterThan(initialItemCount)
    })
  })
})

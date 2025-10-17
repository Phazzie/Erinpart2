'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { type CollaborativeList, type ListItem, type ListItemVerification } from '@/lib/types'
import { toast } from '@/lib/toast'

export function useCollaborativeLists(sessionId: string, userId?: string, userName?: string) {
  const [lists, setLists] = useState<CollaborativeList[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLists = useCallback(async () => {
    if (!isSupabaseConfigured || !sessionId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('collaborative_lists')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLists(data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT' && payload.new.session_id === sessionId) {
      setLists(currentLists => [payload.new, ...currentLists])
    } else if (payload.eventType === 'UPDATE' && payload.new.session_id === sessionId) {
      setLists(currentLists =>
        currentLists.map(l => (l.id === payload.new.id ? payload.new : l))
      )
    } else if (payload.eventType === 'DELETE' && payload.old.session_id === sessionId) {
      setLists(currentLists => currentLists.filter(l => l.id !== payload.old.id))
    }
  }, [sessionId])

  useRealtime({
    channelName: `collaborative-lists-${sessionId}`,
    table: 'collaborative_lists',
    filter: `session_id=eq.${sessionId}`,
    callback: handleRealtimeUpdate,
  })

  const createList = useCallback(async (title: string, listType: 'bullet' | 'numbered') => {
    if (!title.trim() || !sessionId || !userId || !userName) {
      toast.error('Missing required information')
      return null
    }

    if (!isSupabaseConfigured) {
      toast.error('Database not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('collaborative_lists')
        .insert({
          session_id: sessionId,
          title: title.trim(),
          list_type: listType,
          creator_id: userId,
          creator_name: userName,
        })
        .select()
        .single()

      if (error) throw error
      toast.success('List created!')
      return data
    } catch (error: any) {
      toast.error(error.message)
      return null
    }
  }, [sessionId, userId, userName])

  const deleteList = useCallback(async (listId: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Database not configured')
      return
    }

    try {
      const { error } = await supabase
        .from('collaborative_lists')
        .delete()
        .eq('id', listId)

      if (error) throw error
      toast.success('List deleted')
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [])

  return {
    lists,
    loading,
    createList,
    deleteList,
    refetchLists: fetchLists,
  }
}

export function useListItems(listId: string) {
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    if (!isSupabaseConfigured || !listId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('list_items')
        .select('*')
        .eq('list_id', listId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setItems(data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [listId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT' && payload.new.list_id === listId) {
      setItems(currentItems => [...currentItems, payload.new].sort((a, b) => a.order_index - b.order_index))
    } else if (payload.eventType === 'UPDATE' && payload.new.list_id === listId) {
      setItems(currentItems =>
        currentItems.map(item => (item.id === payload.new.id ? payload.new : item))
      )
    } else if (payload.eventType === 'DELETE' && payload.old.list_id === listId) {
      setItems(currentItems => currentItems.filter(item => item.id !== payload.old.id))
    }
  }, [listId])

  useRealtime({
    channelName: `list-items-${listId}`,
    table: 'list_items',
    filter: `list_id=eq.${listId}`,
    callback: handleRealtimeUpdate,
  })

  const addItem = useCallback(async (text: string) => {
    if (!text.trim() || !listId) {
      toast.error('Missing required information')
      return null
    }

    if (!isSupabaseConfigured) {
      toast.error('Database not configured')
      return null
    }

    try {
      const orderIndex = items.length
      const { data, error } = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          text: text.trim(),
          order_index: orderIndex,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      toast.error(error.message)
      return null
    }
  }, [listId, items.length])

  const updateItem = useCallback(async (itemId: string, text: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Database not configured')
      return
    }

    try {
      const { error } = await supabase
        .from('list_items')
        .update({ text: text.trim(), updated_at: new Date().toISOString() })
        .eq('id', itemId)

      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [])

  const deleteItem = useCallback(async (itemId: string) => {
    if (!isSupabaseConfigured) {
      toast.error('Database not configured')
      return
    }

    try {
      const { error } = await supabase
        .from('list_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [])

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    refetchItems: fetchItems,
  }
}

export function useListItemVerifications(itemId: string, userId?: string, userName?: string) {
  const [verifications, setVerifications] = useState<ListItemVerification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVerifications = useCallback(async () => {
    if (!isSupabaseConfigured || !itemId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('list_item_verifications')
        .select('*')
        .eq('item_id', itemId)

      if (error) throw error
      setVerifications(data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [itemId])

  useEffect(() => {
    fetchVerifications()
  }, [fetchVerifications])

  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT' && payload.new.item_id === itemId) {
      setVerifications(current => [...current, payload.new])
    } else if (payload.eventType === 'UPDATE' && payload.new.item_id === itemId) {
      setVerifications(current =>
        current.map(v => (v.id === payload.new.id ? payload.new : v))
      )
    } else if (payload.eventType === 'DELETE' && payload.old.item_id === itemId) {
      setVerifications(current => current.filter(v => v.id !== payload.old.id))
    }
  }, [itemId])

  useRealtime({
    channelName: `verifications-${itemId}`,
    table: 'list_item_verifications',
    filter: `item_id=eq.${itemId}`,
    callback: handleRealtimeUpdate,
  })

  const myVerification = verifications.find(v => v.user_id === userId)

  const submitVerification = useCallback(async (isAccurate: boolean, correctionText?: string) => {
    if (!userId || !userName || !itemId) {
      toast.error('Missing user information')
      return
    }

    if (!isSupabaseConfigured) {
      toast.error('Database not configured')
      return
    }

    try {
      const verificationData = {
        item_id: itemId,
        user_id: userId,
        user_name: userName,
        is_accurate: isAccurate,
        correction_text: !isAccurate ? correctionText?.trim() : null,
      }

      if (myVerification) {
        // Update existing verification
        const { error } = await supabase
          .from('list_item_verifications')
          .update({ ...verificationData, updated_at: new Date().toISOString() })
          .eq('id', myVerification.id)

        if (error) throw error
        toast.success('Verification updated')
      } else {
        // Insert new verification
        const { error } = await supabase
          .from('list_item_verifications')
          .insert(verificationData)

        if (error) throw error
        toast.success('Verification submitted')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }, [itemId, userId, userName, myVerification])

  return {
    verifications,
    myVerification,
    loading,
    submitVerification,
    refetchVerifications: fetchVerifications,
  }
}

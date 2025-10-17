'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { useListItems } from '@/hooks/use-collaborative-lists'
import { type CollaborativeList } from '@/lib/types'
import ListItemComponent from './list-item'

interface CollaborativeListComponentProps {
  list: CollaborativeList
  userId: string
  userName: string
  onDeleteList: (listId: string) => void
}

export default function CollaborativeListComponent({
  list,
  userId,
  userName,
  onDeleteList,
}: CollaborativeListComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [newItemText, setNewItemText] = useState('')
  const [isAddingItem, setIsAddingItem] = useState(false)
  
  const { items, addItem, updateItem, deleteItem } = useListItems(list.id)
  
  const isCreator = list.creator_id === userId

  const handleAddItem = async () => {
    if (!newItemText.trim()) return

    setIsAddingItem(true)
    try {
      await addItem(newItemText)
      setNewItemText('')
    } finally {
      setIsAddingItem(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div>
            <h3 className="text-xl font-bold">{list.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Created by {list.creator_name} • {list.list_type === 'bullet' ? 'Bullet' : 'Numbered'} List
            </p>
          </div>
        </div>
        
        {isCreator && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDeleteList(list.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Items */}
          {items.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No items yet. {isCreator ? 'Add your first item below!' : 'Waiting for creator to add items.'}
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <ListItemComponent
                  key={item.id}
                  item={item}
                  index={index}
                  listType={list.list_type}
                  userId={userId}
                  userName={userName}
                  isCreator={isCreator}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          )}

          {/* Add Item (Creator only) */}
          {isCreator && (
            <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
              <Input
                placeholder="Add new item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddItem()
                  }
                }}
                disabled={isAddingItem}
              />
              <Button
                onClick={handleAddItem}
                disabled={!newItemText.trim() || isAddingItem}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

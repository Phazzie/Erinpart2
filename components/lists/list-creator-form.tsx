'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ListOrdered, List } from 'lucide-react'
import { useCollaborativeLists } from '@/hooks/use-collaborative-lists'

interface ListCreatorFormProps {
  sessionId: string
  userId: string
  userName: string
  onListCreated?: () => void
}

export default function ListCreatorForm({
  sessionId,
  userId,
  userName,
  onListCreated,
}: ListCreatorFormProps) {
  const [title, setTitle] = useState('')
  const [listType, setListType] = useState<'bullet' | 'numbered'>('bullet')
  const [isCreating, setIsCreating] = useState(false)
  const { createList } = useCollaborativeLists(sessionId, userId, userName)

  const handleCreateList = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    setIsCreating(true)
    try {
      const result = await createList(trimmedTitle, listType)
      if (result) {
        setTitle('')
        onListCreated?.()
      }
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Create New Collaborative List</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="list-title">List Title</Label>
          <Input
            id="list-title"
            type="text"
            placeholder="e.g., Steps to Complete Project, Event Timeline..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleCreateList()
              }
            }}
            disabled={isCreating}
          />
        </div>

        <div>
          <Label className="mb-2 block">List Type</Label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={listType === 'bullet' ? 'default' : 'outline'}
              onClick={() => setListType('bullet')}
              disabled={isCreating}
              className="flex-1"
            >
              <List className="w-4 h-4 mr-2" />
              Bullet List
            </Button>
            <Button
              type="button"
              variant={listType === 'numbered' ? 'default' : 'outline'}
              onClick={() => setListType('numbered')}
              disabled={isCreating}
              className="flex-1"
            >
              <ListOrdered className="w-4 h-4 mr-2" />
              Numbered List
            </Button>
          </div>
        </div>

        <Button
          onClick={handleCreateList}
          disabled={!title.trim() || isCreating}
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create List'
          )}
        </Button>
      </div>
    </div>
  )
}

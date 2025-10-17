'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/use-session'
import { useCollaborativeLists } from '@/hooks/use-collaborative-lists'
import ListCreatorForm from '@/components/lists/list-creator-form'
import CollaborativeListComponent from '@/components/lists/collaborative-list'
import LoadingSpinner from '@/components/common/loading-spinner'
import { Users, TrendingUp } from 'lucide-react'

export default function ListsPage() {
  const { user, sessionId, loading: sessionLoading } = useSession()
  const [mounted, setMounted] = useState(false)
  
  const { lists, loading: listsLoading, deleteList } = useCollaborativeLists(
    sessionId,
    user?.id,
    user?.name
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show nothing during initial mount to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (sessionLoading || !user) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Collaborative Lists</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create lists and get them verified by your team members
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Multi-User Collaboration</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                One person creates the list, and others verify each item with green (accurate) or red (needs correction).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Consensus Meter</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                See real-time agreement levels and team feedback on each item in the list.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* List Creator Form */}
      {user && (
        <ListCreatorForm
          sessionId={sessionId}
          userId={user.id}
          userName={user.name}
        />
      )}

      {/* Lists */}
      {listsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No lists yet. Create your first collaborative list above!
          </p>
        </div>
      ) : (
        <div>
          {lists.map((list) => (
            <CollaborativeListComponent
              key={list.id}
              list={list}
              userId={user.id}
              userName={user.name}
              onDeleteList={deleteList}
            />
          ))}
        </div>
      )}
    </div>
  )
}

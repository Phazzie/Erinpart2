'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Textarea } from '../ui/textarea' // I need to create this component
import { Bot, Edit, MessageSquare } from 'lucide-react'

interface Task {
  id: string
  text: string
  comments?: string  // Optional in simplified schema
}

interface SessionDetailsProps {
  selectedTask: Task | null
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
}

export default function SessionDetails({ selectedTask, onUpdateTask }: SessionDetailsProps) {
  return (
    <Card className="card-neon">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-glow-purple">
          <Edit className="h-5 w-5" />
          Task Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {selectedTask ? (
            <motion.div
              key={selectedTask.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="font-bold text-lg mb-2 text-pink-400">{selectedTask.text}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments
                  </label>
                  <Textarea
                    value={selectedTask.comments || ''}
                    onChange={e => onUpdateTask(selectedTask.id, { comments: e.target.value })}
                    placeholder="Add your devious notes here..."
                    className="input-neon min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-green-400 flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4" />
                    AI Suggestions
                  </label>
                  <div className="p-3 bg-slate-900/50 rounded-lg text-sm text-gray-400">
                    <p>✨ Try adding &quot;but make it fashion.&quot;</p>
                    <p>✨ &quot;Is this a good time to start a coup?&quot;</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-8"
            >
              <p className="animate-float">Select a task to see its details.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

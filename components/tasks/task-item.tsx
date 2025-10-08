'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Task } from '@/lib/types'
import { Button } from '../ui/button'

/**
 * Defines the props for the SortableTaskItem component.
 */
interface TaskItemProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onSetChoice?: (taskId: string, choice: 'yes' | 'no' | 'maybe') => void
  myChoice?: 'yes' | 'no' | 'maybe' | ''
  onSelect: (task: Task) => void
  onVote: (taskId: string) => void
  isSelected: boolean
  currentUserId: string // Mocked current user ID
}

/**
 * A component representing a single, sortable task item in the list.
 * It handles displaying regular tasks, as well as the special UI for secret tasks.
 */
export function SortableTaskItem({ task, onUpdate, onSetChoice, myChoice = '', onSelect, onVote, isSelected, currentUserId }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  // Draggable item styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasVoted = task.votes.includes(currentUserId);

  // Render the secret task view if the task is secret
  if (task.is_secret) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`grid grid-cols-12 gap-2 border-b border-pink-500/10 items-center p-3 transition-all duration-300 group animate-fade-in-up ${
          isSelected ? 'bg-purple-900/20 glow-purple' : ''
        } ${isDragging ? 'z-50 rotate-2 scale-105' : ''}`}
      >
        {/* Drag handle */}
        <div className="col-span-1 flex justify-center">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover-glow">
            <GripVertical className="h-4 w-4 text-gray-500 hover:text-purple-400 transition-colors" />
          </div>
        </div>

        {/* Secret task placeholder */}
        <div className="col-span-7 flex items-center gap-2">
          <Lock className="h-4 w-4 text-purple-400" />
          <span className="font-mono text-purple-400">CLASSIFIED: Task is hidden</span>
        </div>

        {/* Vote to reveal button */}
        <div className="col-span-4 text-center">
          <Button
            size="sm"
            className="bg-purple-600/50 hover:bg-purple-600/80 text-white"
            onClick={() => onVote(task.id)}
            disabled={hasVoted}
          >
            {hasVoted ? `Voted (${task.votes.length})` : `Vote to Reveal (${task.votes.length})`}
          </Button>
        </div>
      </div>
    )
  }

  // Render the normal task view
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(task)}
      className={`grid grid-cols-12 gap-2 border-b border-pink-500/10 items-center p-3 hover:bg-pink-500/5 transition-all duration-300 cursor-pointer group animate-fade-in-up ${
        isSelected ? 'bg-pink-500/10 glow-pink' : ''
      } ${isDragging ? 'z-50 rotate-2 scale-105' : ''}`}
    >
      {/* Drag handle */}
      <div className="col-span-1 flex justify-center">
        <div {...attributes} {...listeners} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover-glow">
          <GripVertical className="h-4 w-4 text-gray-500 hover:text-cyan-400 transition-colors" />
        </div>
      </div>

      {/* Task text input */}
      <div className="col-span-5">
        <div className="space-y-1">
          <Input
            value={task.text}
            onChange={(e) => onUpdate(task.id, { text: e.target.value })}
            className="input-neon bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Enter your chaotic plan..."
          />
          {task.user_name && (
            <div className="text-xs text-cyan-400/70 font-mono">
              {task.user_name}
            </div>
          )}
        </div>
      </div>

      {/* Yes/No/Maybe styled buttons */}
      <div className="col-span-5 flex items-center gap-2 justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSetChoice?.(task.id, 'yes')
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            myChoice === 'yes'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
          }`}
        >
          ✓ Yes
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSetChoice?.(task.id, 'maybe')
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            myChoice === 'maybe'
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50 scale-105'
              : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
          }`}
        >
          ? Maybe
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSetChoice?.(task.id, 'no')
          }}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            myChoice === 'no'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
          }`}
        >
          ✗ No
        </button>
      </div>

      {/* Comments indicator */}
      <div className="col-span-1 text-center">
        <Badge
          variant="secondary"
          className={`text-xs transition-all duration-300 hover:scale-110 ${
            task.comments ? 'bg-cyan-500/20 text-cyan-400 glow-cyan' : 'bg-slate-600'
          }`}
        >
          {task.comments ? '💬' : '💭'}
        </Badge>
      </div>
    </div>
  )
}

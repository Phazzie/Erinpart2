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
        <Input
          value={task.text}
          onChange={(e) => onUpdate(task.id, { text: e.target.value })}
          className="input-neon bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Enter your chaotic plan..."
        />
      </div>

  {/* Yes/No/Maybe radio buttons (per-user via task_choices) */}
  {(['yes', 'no', 'maybe'] as const).map((choice) => (
        <div key={choice} className={`${choice === 'maybe' ? 'col-span-1' : 'col-span-2'} text-center`}>
          <input
            type="radio"
            name={`choice-${task.id}`}
    checked={myChoice === choice}
    onChange={() => onSetChoice?.(task.id, choice)}
            className="h-5 w-5 text-pink-400 bg-slate-900 border-slate-600 focus:ring-pink-400 focus:ring-offset-slate-800 hover:scale-110 transition-transform cursor-pointer"
            aria-label={choice}
          />
        </div>
      ))}

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

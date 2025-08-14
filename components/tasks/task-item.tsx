'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// This should be defined in a central types file, e.g., lib/types.ts
interface Task {
  id: string;
  session_id: string;
  text: string;
  choice: 'yes' | 'no' | 'maybe' | '';
  day: 'today' | 'tomorrow';
  order_index: number;
  comments: string;
  created_at: string;
  updated_at: string;
}

interface TaskItemProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onSelect: (task: Task) => void
  isSelected: boolean
}

export function SortableTaskItem({ task, onUpdate, onSelect, isSelected }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(task)}
      className={`grid grid-cols-12 gap-2 border-b border-pink-500/10 items-center p-3 hover:bg-pink-500/5 transition-all duration-300 cursor-pointer group animate-fade-in-up ${
        isSelected ? 'bg-pink-500/10 glow-pink' : ''
      } ${isDragging ? 'z-50 rotate-2 scale-105' : ''}`}
    >
      <div className="col-span-1 flex justify-center">
        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover-glow"
        >
          <GripVertical className="h-4 w-4 text-gray-500 hover:text-cyan-400 transition-colors" />
        </div>
      </div>

      <div className="col-span-5">
        <Input
          value={task.text}
          onChange={(e) => onUpdate(task.id, { text: e.target.value })}
          className="input-neon bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Enter your chaotic plan..."
        />
      </div>

      {(['yes', 'no', 'maybe'] as const).map((choice) => (
        <div key={choice} className={`${choice === 'maybe' ? 'col-span-1' : 'col-span-2'} text-center`}>
          <input
            type="radio"
            name={`choice-${task.id}`}
            checked={task.choice === choice}
            onChange={() => onUpdate(task.id, { choice })}
            className="h-5 w-5 text-pink-400 bg-slate-900 border-slate-600 focus:ring-pink-400 focus:ring-offset-slate-800 hover:scale-110 transition-transform cursor-pointer"
            aria-label={choice}
          />
        </div>
      ))}

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

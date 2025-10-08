'use client'

import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SortableTaskItem } from './task-item'
import { Task } from '@/lib/types'

/**
 * Defines the props for the TaskList component.
 */
interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onSetChoice?: (taskId: string, choice: 'yes'|'no'|'maybe') => void
  myChoiceByTask?: Map<string, { choice: 'yes'|'no'|'maybe' } | undefined>
  onReorderTasks: (tasks: Task[]) => void
  selectedTask: Task | null
  onSelectTask: (task: Task) => void
  onVote: (taskId: string) => void
  currentUserId: string
}

/**
 * A component that displays a list of tasks, handles drag-and-drop reordering,
 * and renders individual task items.
 */
export default function TaskList({
  tasks,
  onUpdateTask,
  onSetChoice,
  myChoiceByTask,
  onReorderTasks,
  selectedTask,
  onSelectTask,
  onVote,
  currentUserId,
}: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  /**
   * Handles the end of a drag event to reorder tasks.
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id)
      const newIndex = tasks.findIndex((task) => task.id === over.id)

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex).map((task, index) => ({
        ...task,
        order_index: index
      }))

      onReorderTasks(reorderedTasks)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card className="card-neon mb-6 overflow-hidden">
        <CardContent className="p-0">
          {/* Animated Header */}
          <div className="grid grid-cols-12 gap-2 p-4 bg-gradient-to-r from-slate-800/80 to-slate-900/80 font-semibold text-sm text-cyan-400/80 border-b border-cyan-500/20">
            <div className="col-span-1"></div>
            <div className="col-span-5 text-glow-cyan">Task</div>
            <div className="col-span-5 text-center">Status</div>
            <div className="col-span-1 text-center">
              <MessageCircle className="h-4 w-4 mx-auto text-cyan-400/60" />
            </div>
          </div>

          {/* Drag and Drop Tasks */}
          {tasks.length === 0 ? (
            <div className="p-12 text-center animate-fade-in-up">
              <div className="animate-float text-6xl mb-4">🎭</div>
              <p className="text-lg text-gray-400 font-medium">No tasks yet. Add your first plot point!</p>
              <p className="text-sm text-gray-500 mt-2">Your chaotic adventure awaits...</p>
            </div>
          ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onUpdate={onUpdateTask}
                  onSetChoice={onSetChoice}
                  myChoice={myChoiceByTask?.get(task.id)?.choice || ''}
                  onSelect={onSelectTask}
                  isSelected={selectedTask?.id === task.id}
                  onVote={onVote}
                  currentUserId={currentUserId}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
    </motion.div>
  )
}

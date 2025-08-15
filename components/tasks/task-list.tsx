'use client'

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
    <Card className="card-neon mb-6 overflow-hidden animate-slide-in-left">
      <CardContent className="p-0">
        {/* Animated Header */}
        <div className="grid grid-cols-12 gap-2 p-4 bg-slate-700/50 font-bold text-lg text-pink-400 border-b border-pink-500/20 animate-fade-in-up">
          <div className="col-span-1"></div>
          <div className="col-span-5 text-glow-pink">Task</div>
          <div className="col-span-2 text-center">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold animate-pulse-ring">
              Y
            </span>
          </div>
          <div className="col-span-2 text-center">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse-ring">
              N
            </span>
          </div>
          <div className="col-span-1 text-center">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs font-bold animate-pulse-ring">
              M
            </span>
          </div>
          <div className="col-span-1 text-center">
            <MessageCircle className="h-4 w-4 mx-auto text-glow-cyan" />
          </div>
        </div>

        {/* Drag and Drop Tasks */}
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-400 animate-fade-in-up">
            <div className="animate-float">
              🎭 No tasks yet. Add your first plot point!
            </div>
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
  )
}

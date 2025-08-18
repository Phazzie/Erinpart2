'use client'

import { useState } from 'react'
import { Task, Vibe } from '@/lib/types'
import { useTasks } from '@/hooks/use-tasks'
import DayToggle from '@/components/layout/day-toggle'
import SessionHeader from './session-header'
import TaskList from '../tasks/task-list'
import VibeSelector from '../vibes/vibe-selector'
import SessionDetails from './session-details'
import TaskForm from '../tasks/task-form'

interface SessionClientProps {
  initialTasks: Task[]
  initialVibes: Vibe[]
  sessionId: string
}

export default function SessionClient({ initialTasks, initialVibes, sessionId }: SessionClientProps) {
  const { tasks, addTask, updateTask, reorderTasks } = useTasks(sessionId, initialTasks)
  const [vibes] = useState<Vibe[]>(initialVibes)
  const [currentDay, setCurrentDay] = useState<'today' | 'tomorrow'>('today')
  const [currentVibe, setCurrentVibe] = useState('chaos-gremlin')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const filteredTasks = tasks.filter(task => task.day === currentDay)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <SessionHeader name="Erin's Escapades" />
        <DayToggle currentDay={currentDay} onDayChange={setCurrentDay} />
        <TaskList
          tasks={filteredTasks}
          onUpdateTask={updateTask}
          onReorderTasks={reorderTasks}
          selectedTask={selectedTask}
          onSelectTask={setSelectedTask}
        />
        <TaskForm onAddTask={(text) => addTask(text)} />
      </div>
      <div className="lg:col-span-4">
        <div className="sticky top-8 space-y-8">
          <VibeSelector
            vibes={vibes}
            currentVibe={currentVibe}
            onVibeChange={setCurrentVibe}
            isOwner={true} // Mocking as owner
          />
          <SessionDetails selectedTask={selectedTask} onUpdateTask={updateTask} />
        </div>
      </div>
    </div>
  )
}

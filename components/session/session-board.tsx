'use client'

import { useState } from 'react'
import { mockTasks, mockVibes } from '@/lib/mock-data'
import DayToggle from '@/components/layout/day-toggle'
import SessionHeader from './session-header'
import TaskList from '../tasks/task-list'
import VibeSelector from '../vibes/vibe-selector'
import SessionDetails from './session-details'
import TaskForm from '../tasks/task-form'

// Placeholder types - these should be moved to a central types file
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
  created_by: string;
}

interface Vibe {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  tasks: string[];
  category: string;
  is_default: boolean;
}

export default function SessionBoard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [vibes] = useState<Vibe[]>(mockVibes)
  const [currentDay, setCurrentDay] = useState<'today' | 'tomorrow'>('today')
  const [currentVibe, setCurrentVibe] = useState('chaos-gremlin')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t))
  }

  const handleReorderTasks = (reorderedTasks: Task[]) => {
    const otherDayTasks = tasks.filter(t => t.day !== currentDay);
    const updatedTasks = [...otherDayTasks, ...reorderedTasks].sort((a,b) => a.day.localeCompare(b.day) || a.order_index - b.order_index);
    setTasks(updatedTasks);
  }

  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      session_id: 'session-1',
      text,
      choice: '',
      day: currentDay,
      order_index: tasks.filter(t => t.day === currentDay).length,
      comments: '',
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const filteredTasks = tasks.filter(task => task.day === currentDay)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <SessionHeader name="Erin's Escapades" />
        <DayToggle currentDay={currentDay} onDayChange={setCurrentDay} />
        <TaskList
          tasks={filteredTasks}
          onUpdateTask={handleUpdateTask}
          onReorderTasks={handleReorderTasks}
          selectedTask={selectedTask}
          onSelectTask={setSelectedTask}
        />
        <TaskForm onAddTask={handleAddTask} />
      </div>
      <div className="lg:col-span-4">
        <div className="sticky top-8 space-y-8">
          <VibeSelector
            vibes={vibes}
            currentVibe={currentVibe}
            onVibeChange={setCurrentVibe}
            isOwner={true} // Mocking as owner
          />
          <SessionDetails selectedTask={selectedTask} onUpdateTask={handleUpdateTask} />
        </div>
      </div>
    </div>
  )
}

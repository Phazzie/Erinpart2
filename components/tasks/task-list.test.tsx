import { render, screen } from '@testing-library/react'
import TaskList from './task-list'
import { mockTasks } from '@/lib/mock-data'
import { Task } from '@/lib/types'

// Mock the SortableTaskItem to isolate the TaskList component
jest.mock('./task-item', () => ({
  SortableTaskItem: ({ task }: { task: Task }) => (
    <div data-testid={`task-item-${task.id}`}>{task.text}</div>
  ),
}))

describe('TaskList', () => {
  const mockOnUpdateTask = jest.fn()
  const mockOnReorderTasks = jest.fn()
  const mockOnSelectTask = jest.fn()
  const mockOnVote = jest.fn()

  const tasksForSession = mockTasks.filter(t => t.session_id === 'session-1')

  it('should render a list of tasks when tasks are provided', () => {
    render(
      <TaskList
        tasks={tasksForSession}
        onUpdateTask={mockOnUpdateTask}
        onSetChoice={jest.fn()}
        myChoiceByTask={new Map()}
        onReorderTasks={mockOnReorderTasks}
        selectedTask={null}
        onSelectTask={mockOnSelectTask}
        onVote={mockOnVote}
        currentUserId="user-1"
      />
    )

    // Check that all tasks are rendered
    tasksForSession.forEach(task => {
      expect(screen.getByText(task.text)).toBeInTheDocument()
    })

    // Check that the empty message is not present
    expect(screen.queryByText(/no tasks yet/i)).not.toBeInTheDocument()
  })

  it('should render the empty state message when no tasks are provided', () => {
    render(
      <TaskList
        tasks={[]}
        onUpdateTask={mockOnUpdateTask}
        onSetChoice={jest.fn()}
        myChoiceByTask={new Map()}
        onReorderTasks={mockOnReorderTasks}
        selectedTask={null}
        onSelectTask={mockOnSelectTask}
        onVote={mockOnVote}
        currentUserId="user-1"
      />
    )

    // Check that the empty message is present
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
  })
})

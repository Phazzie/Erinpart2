import { render, screen } from '@testing-library/react'
import { SortableTaskItem } from './task-item'
import { Task } from '@/lib/types'
import { useSortable } from '@dnd-kit/sortable'

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

const mockTask: Task = {
  id: '1',
  text: 'Test Task',
  status: 'todo',
  order_index: 0,
  session_id: 'session-1',
  user_id: 'user-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  choice: 'yes',
  day: 'today',
  comments: 'This is a test comment',
}

describe('TaskItem', () => {
  it('should render the task title', () => {
    render(
      <SortableTaskItem
        task={mockTask}
        onUpdate={() => {}}
        onSelect={() => {}}
        isSelected={false}
      />
    )
    const title = screen.getByDisplayValue(/test task/i)
    expect(title).toBeInTheDocument()
  })
})

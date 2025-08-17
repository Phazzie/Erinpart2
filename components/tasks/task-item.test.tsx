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
  session_id: 'session-1',
  text: 'Test Task',
  choice: 'yes',
  day: 'today',
  order_index: 0,
  comments: 'This is a test comment',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'user-1',
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

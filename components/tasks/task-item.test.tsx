import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortableTaskItem } from './task-item'
import { Task } from '@/lib/types'

// Mock the useSortable hook from dnd-kit
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

const mockOnUpdate = jest.fn()
const mockOnSelect = jest.fn()
const mockOnSetChoice = jest.fn()
const mockOnVote = jest.fn()

const normalTask: Task = {
  id: 'task-1',
  session_id: 'session-1',
  text: 'Normal Task Text',
  is_complete: false,
  choice: '',
  day: 'today',
  order_index: 0,
  comments: '',
  created_at: '',
  updated_at: '',
  created_by: 'user-1',
  is_secret: false,
  votes: [],
}

const secretTask: Task = {
  ...normalTask,
  id: 'task-secret-1',
  is_secret: true,
  votes: ['user-2'],
}

describe('SortableTaskItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Normal Task View', () => {
    it('should render the task text', () => {
      render(
        <SortableTaskItem
          task={normalTask}
          onUpdate={mockOnUpdate}
          onSetChoice={mockOnSetChoice}
          myChoice=""
          onSelect={mockOnSelect}
          onVote={mockOnVote}
          isSelected={false}
          currentUserId="user-1"
        />
      )
      expect(screen.getByDisplayValue(/Normal Task Text/i)).toBeInTheDocument()
    })

    it('should call onUpdate when the text is changed', async () => {
      render(
        <SortableTaskItem
          task={normalTask}
          onUpdate={mockOnUpdate}
          onSelect={mockOnSelect}
          onVote={mockOnVote}
          isSelected={false}
          currentUserId="user-1"
        />
      )
      const input = screen.getByDisplayValue(/Normal Task Text/i)
      await userEvent.type(input, 'a')
      expect(mockOnUpdate).toHaveBeenCalledWith(normalTask.id, { text: 'Normal Task Texta' })
    })

    it('should call onUpdate when a choice radio button is clicked', async () => {
      render(
        <SortableTaskItem
          task={normalTask}
          onUpdate={mockOnUpdate}
          onSetChoice={mockOnSetChoice}
          myChoice=""
          onSelect={mockOnSelect}
          onVote={mockOnVote}
          isSelected={false}
          currentUserId="user-1"
        />
      )
      const yesRadio = screen.getByLabelText('yes')
      await userEvent.click(yesRadio)
      expect(mockOnSetChoice).toHaveBeenCalledWith(normalTask.id, 'yes')
    })
  })

  describe('Secret Task View', () => {
    it('should render the classified placeholder instead of the text', () => {
      render(
        <SortableTaskItem
          task={secretTask}
          onUpdate={mockOnUpdate}
          onSetChoice={mockOnSetChoice}
          myChoice=""
          onSelect={mockOnSelect}
          onVote={mockOnVote}
          isSelected={false}
          currentUserId="user-1"
        />
      )
      expect(screen.queryByDisplayValue(/Normal Task Text/i)).not.toBeInTheDocument()
      expect(screen.getByText(/CLASSIFIED: Task is hidden/i)).toBeInTheDocument()
    })

    it('should call onVote when the vote button is clicked', async () => {
      render(
        <SortableTaskItem
          task={secretTask}
          onUpdate={mockOnUpdate}
          onSelect={mockOnSelect}
          onVote={mockOnVote}
          isSelected={false}
          currentUserId="user-1"
        />
      )
      const voteButton = screen.getByRole('button', { name: /Vote to Reveal/i })
      await userEvent.click(voteButton)
      expect(mockOnVote).toHaveBeenCalledWith(secretTask.id)
    })

    it('should show a disabled "Voted" button if the user has already voted', () => {
      render(
        <SortableTaskItem
          task={{ ...secretTask, votes: ['user-1'] }} // Current user has voted
          onUpdate={mockOnUpdate}
          onSetChoice={mockOnSetChoice}
          myChoice=""
          onSelect={mockOnSelect}
          onVote={mockOnVote}
          isSelected={false}
          currentUserId="user-1"
        />
      )
      const voteButton = screen.getByRole('button', { name: /Voted/i })
      expect(voteButton).toBeInTheDocument()
      expect(voteButton).toBeDisabled()
    })
  })
})

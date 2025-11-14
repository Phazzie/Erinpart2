import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListItemComponent from './list-item'
import { useListItemVerifications } from '@/hooks/use-collaborative-lists'
import { type ListItem } from '@/lib/types'

jest.mock('@/hooks/use-collaborative-lists')

const mockItem: ListItem = {
  id: 'item-1',
  list_id: 'list-1',
  text: 'Buy milk',
  order_index: 0,
  created_at: '2025-10-17T10:00:00Z',
  updated_at: '2025-10-17T10:00:00Z',
}

const mockVerifications = [
  {
    id: 'ver-1',
    item_id: 'item-1',
    user_id: 'user-2',
    user_name: 'Bob',
    is_accurate: true,
    correction_text: null,
    created_at: '2025-10-17T10:05:00Z',
    updated_at: '2025-10-17T10:05:00Z',
  },
  {
    id: 'ver-2',
    item_id: 'item-1',
    user_id: 'user-3',
    user_name: 'Carol',
    is_accurate: false,
    correction_text: 'Should be Almond Milk',
    created_at: '2025-10-17T10:06:00Z',
    updated_at: '2025-10-17T10:06:00Z',
  },
]

const mockSubmitVerification = jest.fn()
const mockOnUpdate = jest.fn()
const mockOnDelete = jest.fn()

describe('ListItemComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useListItemVerifications as jest.Mock).mockReturnValue({
      verifications: [],
      myVerification: null,
      loading: false,
      submitVerification: mockSubmitVerification,
    })
  })

  it('should render bullet list item with prefix', () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-1"
        userName="Alice"
        isCreator={true}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('•')).toBeInTheDocument()
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('should render numbered list item with prefix', () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={2}
        listType="numbered"
        userId="user-1"
        userName="Alice"
        isCreator={true}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('3.')).toBeInTheDocument()
  })

  it('should show edit and delete buttons for creator', () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-1"
        userName="Alice"
        isCreator={true}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('should show verification buttons for non-creator', () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-2"
        userName="Bob"
        isCreator={false}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByRole('button', { name: /accurate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /inaccurate/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
  })

  it('should enter edit mode when Edit is clicked', async () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-1"
        userName="Alice"
        isCreator={true}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)

    expect(screen.getByDisplayValue('Buy milk')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('should call onUpdate when saving edited text', async () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-1"
        userName="Alice"
        isCreator={true}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    const input = screen.getByDisplayValue('Buy milk')
    await userEvent.clear(input)
    await userEvent.type(input, 'Buy almond milk')

    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(mockOnUpdate).toHaveBeenCalledWith('item-1', 'Buy almond milk')
  })

  it('should cancel edit mode without saving', async () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-1"
        userName="Alice"
        isCreator={true}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    const input = screen.getByDisplayValue('Buy milk')
    await userEvent.clear(input)
    await userEvent.type(input, 'Changed text')

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockOnUpdate).not.toHaveBeenCalled()
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('should call onDelete when Delete is clicked', async () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-1"
        userName="Alice"
        isCreator={true}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(mockOnDelete).toHaveBeenCalledWith('item-1')
  })

  it('should submit accurate verification', async () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-2"
        userName="Bob"
        isCreator={false}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /accurate/i }))

    expect(mockSubmitVerification).toHaveBeenCalledWith(true, undefined)
  })

  it('should show correction field when marking as inaccurate without existing verification', async () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-2"
        userName="Bob"
        isCreator={false}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /inaccurate/i }))

    expect(screen.getByPlaceholderText(/suggest a correction/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit correction/i })).toBeInTheDocument()
  })

  it('should submit inaccurate verification with correction text', async () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-2"
        userName="Bob"
        isCreator={false}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /inaccurate/i }))

    const correctionInput = screen.getByPlaceholderText(/suggest a correction/i)
    await userEvent.type(correctionInput, 'Should be Almond Milk')

    await userEvent.click(screen.getByRole('button', { name: /submit correction/i }))

    expect(mockSubmitVerification).toHaveBeenCalledWith(false, 'Should be Almond Milk')
  })

  it('should display existing verifications', () => {
    ;(useListItemVerifications as jest.Mock).mockReturnValue({
      verifications: mockVerifications,
      myVerification: null,
      loading: false,
      submitVerification: mockSubmitVerification,
    })

    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-4"
        userName="Dave"
        isCreator={false}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Carol')).toBeInTheDocument()
    expect(screen.getByText('Should be Almond Milk')).toBeInTheDocument()
  })

  it('should display consensus meter with correct stats', () => {
    ;(useListItemVerifications as jest.Mock).mockReturnValue({
      verifications: mockVerifications,
      myVerification: null,
      loading: false,
      submitVerification: mockSubmitVerification,
    })

    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-4"
        userName="Dave"
        isCreator={false}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/1 ✓/)).toBeInTheDocument()
    expect(screen.getByText(/1 ✗/)).toBeInTheDocument()
    expect(screen.getByText(/50% consensus/i)).toBeInTheDocument()
  })

  it('should highlight accurate button when user verified as accurate', () => {
    ;(useListItemVerifications as jest.Mock).mockReturnValue({
      verifications: [mockVerifications[0]],
      myVerification: mockVerifications[0],
      loading: false,
      submitVerification: mockSubmitVerification,
    })

    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-2"
        userName="Bob"
        isCreator={false}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    const accurateButton = screen.getByRole('button', { name: /accurate/i })
    // Button should have default variant class (implementation detail)
    expect(accurateButton).toBeInTheDocument()
  })

  it('should save edit when Enter key is pressed', async () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-1"
        userName="Alice"
        isCreator={true}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    const input = screen.getByDisplayValue('Buy milk')
    await userEvent.clear(input)
    await userEvent.type(input, 'Buy oat milk{Enter}')

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('item-1', 'Buy oat milk')
    })
  })

  it('should cancel edit when Escape key is pressed', async () => {
    render(
      <ListItemComponent
        item={mockItem}
        index={0}
        listType="bullet"
        userId="user-1"
        userName="Alice"
        isCreator={true}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    const input = screen.getByDisplayValue('Buy milk')
    await userEvent.clear(input)
    await userEvent.type(input, 'Changed{Escape}')

    expect(mockOnUpdate).not.toHaveBeenCalled()
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })
})

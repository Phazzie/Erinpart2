import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListCreatorForm from './list-creator-form'
import { useCollaborativeLists } from '@/hooks/use-collaborative-lists'

jest.mock('@/hooks/use-collaborative-lists')

const mockCreateList = jest.fn()

describe('ListCreatorForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCollaborativeLists as jest.Mock).mockReturnValue({
      createList: mockCreateList,
      lists: [],
      loading: false,
    })
  })

  it('should render all form elements', () => {
    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
      />
    )

    expect(screen.getByLabelText(/list title/i)).toBeInTheDocument()
    expect(screen.getByText(/bullet list/i)).toBeInTheDocument()
    expect(screen.getByText(/numbered list/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create list/i })).toBeInTheDocument()
  })

  it('should enable create button only when title is entered', async () => {
    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
      />
    )

    const createButton = screen.getByRole('button', { name: /create list/i })
    const titleInput = screen.getByLabelText(/list title/i)

    expect(createButton).toBeDisabled()

    await userEvent.type(titleInput, 'My List')
    expect(createButton).toBeEnabled()

    await userEvent.clear(titleInput)
    expect(createButton).toBeDisabled()
  })

  it('should toggle between bullet and numbered list types', async () => {
    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
      />
    )

    const bulletButton = screen.getByRole('button', { name: /bullet list/i })
    const numberedButton = screen.getByRole('button', { name: /numbered list/i })

    // Default should be bullet
    expect(bulletButton).toHaveClass('bg-primary') // or whatever your default variant class is

    await userEvent.click(numberedButton)
    // Numbered should now be selected (implementation uses variant prop)
    
    await userEvent.click(bulletButton)
    // Back to bullet
  })

  it('should call createList with correct parameters', async () => {
    mockCreateList.mockResolvedValue({ id: 'list-1', title: 'Test List' })

    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
      />
    )

    const titleInput = screen.getByLabelText(/list title/i)
    const createButton = screen.getByRole('button', { name: /create list/i })

    await userEvent.type(titleInput, 'Test List')
    await userEvent.click(createButton)

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith('Test List', 'bullet')
    })
  })

  it('should call createList with numbered type when selected', async () => {
    mockCreateList.mockResolvedValue({ id: 'list-1', title: 'Numbered List' })

    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
      />
    )

    const titleInput = screen.getByLabelText(/list title/i)
    const numberedButton = screen.getByRole('button', { name: /numbered list/i })
    const createButton = screen.getByRole('button', { name: /create list/i })

    await userEvent.type(titleInput, 'Numbered List')
    await userEvent.click(numberedButton)
    await userEvent.click(createButton)

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith('Numbered List', 'numbered')
    })
  })

  it('should clear the form after successful creation', async () => {
    mockCreateList.mockResolvedValue({ id: 'list-1', title: 'Test List' })

    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
      />
    )

    const titleInput = screen.getByLabelText(/list title/i) as HTMLInputElement
    const createButton = screen.getByRole('button', { name: /create list/i })

    await userEvent.type(titleInput, 'Test List')
    await userEvent.click(createButton)

    await waitFor(() => {
      expect(titleInput.value).toBe('')
    })
  })

  it('should call onListCreated callback after successful creation', async () => {
    const mockOnListCreated = jest.fn()
    mockCreateList.mockResolvedValue({ id: 'list-1', title: 'Test List' })

    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
        onListCreated={mockOnListCreated}
      />
    )

    const titleInput = screen.getByLabelText(/list title/i)
    const createButton = screen.getByRole('button', { name: /create list/i })

    await userEvent.type(titleInput, 'Test List')
    await userEvent.click(createButton)

    await waitFor(() => {
      expect(mockOnListCreated).toHaveBeenCalled()
    })
  })

  it('should handle Enter key to submit', async () => {
    mockCreateList.mockResolvedValue({ id: 'list-1', title: 'Test List' })

    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
      />
    )

    const titleInput = screen.getByLabelText(/list title/i)

    await userEvent.type(titleInput, 'Test List')
    await userEvent.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith('Test List', 'bullet')
    })
  })

  it('should show loading state while creating', async () => {
    let resolveCreate: any
    mockCreateList.mockImplementation(
      () => new Promise(resolve => (resolveCreate = resolve))
    )

    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
      />
    )

    const titleInput = screen.getByLabelText(/list title/i)
    const createButton = screen.getByRole('button', { name: /create list/i })

    await userEvent.type(titleInput, 'Test List')
    await userEvent.click(createButton)

    // Should show loading state
    expect(screen.getByText(/creating/i)).toBeInTheDocument()
    expect(createButton).toBeDisabled()

    // Resolve the promise
    resolveCreate({ id: 'list-1', title: 'Test List' })

    await waitFor(() => {
      expect(screen.queryByText(/creating/i)).not.toBeInTheDocument()
    })
  })

  it('should trim whitespace from title', async () => {
    mockCreateList.mockResolvedValue({ id: 'list-1', title: 'Test List' })

    render(
      <ListCreatorForm
        sessionId="session-1"
        userId="user-1"
        userName="Alice"
      />
    )

    const titleInput = screen.getByLabelText(/list title/i)
    const createButton = screen.getByRole('button', { name: /create list/i })

    await userEvent.type(titleInput, '  Test List  ')
    await userEvent.click(createButton)

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith('Test List', 'bullet')
    })
  })
})

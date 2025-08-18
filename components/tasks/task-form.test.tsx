import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from './task-form'

describe('TaskForm', () => {
  it('should render the form elements correctly', () => {
    render(<TaskForm onAddTask={jest.fn()} />)
    expect(screen.getByPlaceholderText(/add a new chaotic task/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /make it a secret/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
  })

  it('should enable the submit button only when there is text', async () => {
    render(<TaskForm onAddTask={jest.fn()} />)
    const submitButton = screen.getByRole('button', { name: /add task/i })
    const taskInput = screen.getByPlaceholderText(/add a new chaotic task/i)

    expect(submitButton).toBeDisabled()

    await userEvent.type(taskInput, 'A new task')
    expect(submitButton).toBeEnabled()

    await userEvent.clear(taskInput)
    expect(submitButton).toBeDisabled()
  })

  it('should call onAddTask with the correct arguments on submission', async () => {
    const mockOnAddTask = jest.fn()
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const taskInput = screen.getByPlaceholderText(/add a new chaotic task/i)
    const secretCheckbox = screen.getByRole('checkbox', { name: /make it a secret/i })
    const submitButton = screen.getByRole('button', { name: /add task/i })

    // Fill out the form
    await userEvent.type(taskInput, '  My secret task  ') // Add whitespace to test trimming
    await userEvent.click(secretCheckbox)
    await userEvent.click(submitButton)

    // Check if the callback was called correctly
    expect(mockOnAddTask).toHaveBeenCalledTimes(1)
    expect(mockOnAddTask).toHaveBeenCalledWith('My secret task', true)
  })

  it('should clear the form after submission', async () => {
    render(<TaskForm onAddTask={jest.fn()} />)

    const taskInput = screen.getByPlaceholderText(/add a new chaotic task/i)
    const secretCheckbox = screen.getByRole('checkbox', { name: /make it a secret/i })
    const submitButton = screen.getByRole('button', { name: /add task/i })

    // Fill out and submit the form
    await userEvent.type(taskInput, 'A task')
    await userEvent.click(secretCheckbox)
    await userEvent.click(submitButton)

    // Check that the fields are reset
    expect(screen.getByPlaceholderText(/add a new chaotic task/i)).toHaveValue('')
    expect(screen.getByRole('checkbox', { name: /make it a secret/i })).not.toBeChecked()
  })

  it('should handle very long task names without crashing', async () => {
    const mockOnAddTask = jest.fn()
    render(<TaskForm onAddTask={mockOnAddTask} />)
    const taskInput = screen.getByPlaceholderText(/add a new chaotic task/i)
    const submitButton = screen.getByRole('button', { name: /add task/i })

    const longText = 'a'.repeat(1000)
    fireEvent.change(taskInput, { target: { value: longText } })
    await userEvent.click(submitButton)

    expect(mockOnAddTask).toHaveBeenCalledWith(longText, false)
  })
});

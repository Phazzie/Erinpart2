import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupForm from './signup-form'
import * as actions from '@/lib/actions'

// Mock the server actions module
jest.mock('@/lib/actions', () => ({
  __esModule: true,
  signUp: jest.fn(),
}))

// Mock useFormState
const mockUseFormState = jest.fn()
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: (action: any, initialState: any) => mockUseFormState(action, initialState),
}))

describe('SignupForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    // Setup a default mock implementation for useFormState
    mockUseFormState.mockImplementation((action, initialState) => [initialState, 'mock-action-url'])
  })

  it('should render all form elements correctly', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument()
  })

  it('should toggle password visibility', async () => {
    render(<SignupForm />)
    const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' })
    const toggleButton = screen.getByLabelText(/show password/i)

    expect(passwordInput).toHaveAttribute('type', 'password')

    await userEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument()
  })

  it('should display an error message when signUp action returns an error', () => {
    const errorState = { error: 'Could not create account.' }
    mockUseFormState.mockReturnValue([errorState, 'mock-action-url'])

    render(<SignupForm />)

    expect(screen.getByText(/Could not create account./)).toBeInTheDocument()
  })

  it('should display a success message when signUp action returns success', () => {
    const successState = { success: 'Check your email to verify your account.' }
    mockUseFormState.mockReturnValue([successState, 'mock-action-url'])

    render(<SignupForm />)

    expect(screen.getByText(/Check your email to verify your account./)).toBeInTheDocument()
  })

  it('should display validation errors for empty fields', async () => {
    render(<SignupForm />)
    const submitButton = screen.getByRole('button', { name: /Create Account/i })

    await userEvent.click(submitButton)

  const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement
  const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' }) as HTMLInputElement

    expect(emailInput.validationMessage).not.toBe('')
    expect(passwordInput.validationMessage).not.toBe('')
  })

  it('should display a validation error for an invalid email format', async () => {
    render(<SignupForm />)
    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /Create Account/i })

    await userEvent.type(emailInput, 'not-an-email')
    await userEvent.click(submitButton)

    expect(emailInput.validationMessage).not.toBe('')
  })

  it('should be an invalid form for a password less than 6 characters', async () => {
    render(<SignupForm />)
  const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' }) as HTMLInputElement
    const form = screen.getByTestId('signup-form') as HTMLFormElement

    await userEvent.type(passwordInput, '12345')

    expect(form.checkValidity()).toBe(false)
  });
});

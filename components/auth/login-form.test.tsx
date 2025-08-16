import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from './login-form'
import * as actions from '@/lib/actions'

// Mock the server actions module
jest.mock('@/lib/actions', () => ({
  __esModule: true,
  signIn: jest.fn(),
  signInWithGoogle: jest.fn(),
}))

// Mock the AnimalCodeForm as it's not relevant to this test suite
jest.mock('./animal-code-form', () => ({
  __esModule: true,
  default: () => <div data-testid="animal-code-form-mock"></div>,
}))

// Mock useFormState
const mockUseFormState = jest.fn()
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: (action: any, initialState: any) => mockUseFormState(action, initialState),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    // Setup a default mock implementation for useFormState
    mockUseFormState.mockImplementation((action, initialState) => [initialState, 'mock-action-url'])
  })

  it('should render all form elements correctly', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start a session/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument()
    expect(screen.getByTestId('animal-code-form-mock')).toBeInTheDocument()
  })

  it('should toggle password visibility', async () => {
    render(<LoginForm />)
    const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' })
    const toggleButton = screen.getByLabelText(/show password/i)

    expect(passwordInput).toHaveAttribute('type', 'password')

    await userEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    // After clicking, the label changes to "Hide password"
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument()

    await userEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
    // And back to "Show password"
    expect(screen.getByLabelText(/show password/i)).toBeInTheDocument()
  })

  it('should call signInWithGoogle when the Google button is clicked', async () => {
    render(<LoginForm />)
    const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
    await userEvent.click(googleButton)
    expect(actions.signInWithGoogle).toHaveBeenCalled()
  })

  it('should display an error message when signIn action returns an error', () => {
    // Arrange: Setup useFormState to return an error state
    const errorState = { error: 'Invalid credentials' }
    mockUseFormState.mockReturnValue([errorState, 'mock-action-url'])

    render(<LoginForm />)

    // Assert: Check if the error message is displayed
    expect(screen.getByText(/Invalid credentials/)).toBeInTheDocument()
  })

  it('should display validation errors for empty fields', async () => {
    render(<LoginForm />)
    const submitButton = screen.getByRole('button', { name: /Start a session/i })

    await userEvent.click(submitButton)

    // Note: The exact validation message is browser-dependent.
    // We check for the presence of the validation message on the input field.
    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' }) as HTMLInputElement

    expect(emailInput.validationMessage).not.toBe('')
    expect(passwordInput.validationMessage).not.toBe('')
  })

  it('should display a validation error for an invalid email format', async () => {
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /Start a session/i })

    await userEvent.type(emailInput, 'not-an-email')
    await userEvent.click(submitButton)

    expect(emailInput.validationMessage).not.toBe('')
  })
});

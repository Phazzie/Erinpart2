import { handleSupabaseError, validateTextInput } from '@/lib/utils'
import { toast } from '@/lib/toast'

jest.mock('@/lib/toast')

describe('handleSupabaseError', () => {
  const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>

  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    (console.error as jest.MockedFunction<typeof console.error>).mockRestore()
  })

  it('should display error message from error object', () => {
    const error = { message: 'Database connection failed' }
    const result = handleSupabaseError(error, 'testContext')

    expect(mockToastError).toHaveBeenCalledWith('Database connection failed')
    expect(result).toEqual({
      success: false,
      error: 'Database connection failed'
    })
  })

  it('should use custom user message when provided', () => {
    const error = { message: 'Internal error' }
    const result = handleSupabaseError(error, 'testContext', 'Custom error message')

    expect(mockToastError).toHaveBeenCalledWith('Custom error message')
    expect(result).toEqual({
      success: false,
      error: 'Custom error message'
    })
  })

  it('should handle error without message property', () => {
    const error = { code: 500 }
    const result = handleSupabaseError(error, 'testContext')

    expect(mockToastError).toHaveBeenCalledWith('An error occurred')
    expect(result).toEqual({
      success: false,
      error: 'An error occurred'
    })
  })

  it('should log error to console in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const error = { message: 'Test error' }
    handleSupabaseError(error, 'testContext')

    expect(console.error).toHaveBeenCalledWith('[testContext]', error)

    process.env.NODE_ENV = originalEnv
  })
})

describe('validateTextInput', () => {
  it('should pass validation for valid input', () => {
    const result = validateTextInput('Hello World')
    expect(result).toEqual({ valid: true })
  })

  it('should fail when text is too short', () => {
    const result = validateTextInput('', 1, 100, 'Name')
    expect(result).toEqual({
      valid: false,
      error: 'Name must be at least 1 character'
    })
  })

  it('should fail when text is too long', () => {
    const longText = 'a'.repeat(101)
    const result = validateTextInput(longText, 1, 100, 'Description')
    expect(result).toEqual({
      valid: false,
      error: 'Description must be less than 100 characters'
    })
  })

  it('should trim whitespace before validation', () => {
    const result = validateTextInput('   valid   ', 1, 100)
    expect(result).toEqual({ valid: true })
  })

  it('should fail for whitespace-only input', () => {
    const result = validateTextInput('     ', 5, 100, 'Field')
    expect(result).toEqual({
      valid: false,
      error: 'Field must be at least 5 characters'
    })
  })

  it('should use default field name when not provided', () => {
    const result = validateTextInput('', 1, 100)
    expect(result).toEqual({
      valid: false,
      error: 'Input must be at least 1 character'
    })
  })

  it('should handle plural correctly', () => {
    const result = validateTextInput('a', 2, 100, 'Name')
    expect(result).toEqual({
      valid: false,
      error: 'Name must be at least 2 characters'
    })
  })

  it('should use default min and max when not provided', () => {
    const result = validateTextInput('test')
    expect(result).toEqual({ valid: true })
  })
})

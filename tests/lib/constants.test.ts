import { devLog, devError, devWarn } from '@/lib/constants'

describe('Development logging utilities', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  describe('devLog', () => {
    it('should log to console in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      devLog('Test message', { data: 'value' })

      expect(consoleLogSpy).toHaveBeenCalledWith('Test message', { data: 'value' })

      process.env.NODE_ENV = originalEnv
    })

    it('should not log to console in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      devLog('Test message')

      expect(consoleLogSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('devError', () => {
    it('should log error to console in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      devError('Error message', { code: 500 })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message', { code: 500 })

      process.env.NODE_ENV = originalEnv
    })

    it('should not log error to console in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      devError('Error message')

      expect(consoleErrorSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('devWarn', () => {
    it('should log warning to console in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      devWarn('Warning message', { status: 'deprecated' })

      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message', { status: 'deprecated' })

      process.env.NODE_ENV = originalEnv
    })

    it('should not log warning to console in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      devWarn('Warning message')

      expect(consoleWarnSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })
  })
})

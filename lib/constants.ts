// Utility constants and helper functions
export const MAX_TASK_LENGTH = 500
export const MAX_NAME_LENGTH = 20
export const MIN_NAME_LENGTH = 2

// Development logging utility (DRY pattern)
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

export const devError = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args)
  }
}

export const devWarn = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(...args)
  }
}

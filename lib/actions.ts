'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Mock authentication state (in real app this would be in session/cookies)
let mockAuthState = {
  isAuthenticated: false,
  user: null as any
}

export async function signIn(prevState: any, formData: FormData) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000))

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // Mock validation
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  if (!email.includes('@')) {
    return { error: 'Please enter a valid email address' }
  }

  // Mock successful login
  mockAuthState = {
    isAuthenticated: true,
    user: {
      id: 'mock-user-1',
      email,
      created_at: new Date().toISOString()
    }
  }

  revalidatePath('/', 'layout')
  // redirect('/')
}

export async function signUp(prevState: any, formData: FormData) {
  await new Promise(resolve => setTimeout(resolve, 1200))

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  if (!email.includes('@')) {
    return { error: 'Please enter a valid email address' }
  }

  // Mock successful signup
  mockAuthState = {
    isAuthenticated: true,
    user: {
      id: `mock-user-${Date.now()}`,
      email,
      created_at: new Date().toISOString()
    }
  }

  return { success: 'Account created successfully! Welcome to the chaos! 🎉' }
}

export async function signOut() {
  await new Promise(resolve => setTimeout(resolve, 500))

  mockAuthState = {
    isAuthenticated: false,
    user: null
  }

  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function signInWithGoogle() {
  await new Promise(resolve => setTimeout(resolve, 800))

  // Mock OAuth flow
  mockAuthState = {
    isAuthenticated: true,
    user: {
      id: `google-user-${Date.now()}`,
      email: 'user@gmail.com',
      created_at: new Date().toISOString()
    }
  }

  redirect('/')
}

export async function createTask(sessionId: string, taskData: any) {
  await new Promise(resolve => setTimeout(resolve, 400))

  // Mock task creation
  console.log('Mock: Creating task', { sessionId, taskData })

  revalidatePath('/')
  return { success: true, id: `task-${Date.now()}` }
}

export async function updateTask(taskId: string, updates: any) {
  await new Promise(resolve => setTimeout(resolve, 300))

  console.log('Mock: Updating task', { taskId, updates })

  revalidatePath('/')
  return { success: true }
}

export async function deleteTask(taskId: string) {
  await new Promise(resolve => setTimeout(resolve, 300))

  console.log('Mock: Deleting task', { taskId })

  revalidatePath('/')
  return { success: true }
}

export async function updateSession(sessionId: string, updates: any) {
  await new Promise(resolve => setTimeout(resolve, 300))

  console.log('Mock: Updating session', { sessionId, updates })

  revalidatePath('/')
  return { success: true }
}

export async function createShareableSession(sessionId: string) {
  await new Promise(resolve => setTimeout(resolve, 600))

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?session=${sessionId}`

  console.log('Mock: Creating shareable session', { sessionId, shareUrl })

  return { success: true, shareUrl }
}

// Mock helper to get current auth state
export async function getCurrentUser() {
  return mockAuthState.user
}

export async function isAuthenticated() {
  return mockAuthState.isAuthenticated
}

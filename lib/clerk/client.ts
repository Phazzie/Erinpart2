'use client'

import { useUser, useAuth } from '@clerk/nextjs'

/**
 * Client-Side Authentication Utilities
 *
 * These utilities provide a clean interface for accessing Clerk authentication
 * in Client Components and client-side code.
 *
 * IMPORTANT: These hooks can only be used in client-side code (components with 'use client').
 * For server-side authentication, use the functions in lib/clerk/auth.ts
 */

/**
 * Get current user ID on client
 *
 * @returns The user ID if authenticated, null otherwise
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * export function MyComponent() {
 *   const userId = useCurrentUserId()
 *
 *   if (!userId) {
 *     return <div>Please sign in</div>
 *   }
 *
 *   return <div>User ID: {userId}</div>
 * }
 * ```
 */
export function useCurrentUserId(): string | null {
  const { userId } = useAuth()
  return userId ?? null
}

/**
 * Get current user data on client
 *
 * @returns Object with user data, loading state, and signed-in status
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * export function UserProfile() {
 *   const { user, isLoaded, isSignedIn } = useCurrentUser()
 *
 *   if (!isLoaded) {
 *     return <div>Loading...</div>
 *   }
 *
 *   if (!isSignedIn || !user) {
 *     return <div>Please sign in</div>
 *   }
 *
 *   return <div>Welcome, {user.firstName}!</div>
 * }
 * ```
 */
export function useCurrentUser() {
  const { user, isLoaded, isSignedIn } = useUser()
  return { user, isLoaded, isSignedIn }
}

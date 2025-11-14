import { auth, currentUser } from '@clerk/nextjs/server'

/**
 * Server-Side Authentication Utilities
 *
 * These utilities provide a clean interface for accessing Clerk authentication
 * on the server side (Server Components, Server Actions, API Routes).
 *
 * IMPORTANT: These functions can only be used in server-side code.
 * For client-side authentication, use the hooks in lib/clerk/client.ts
 */

/**
 * Get the current user's ID on the server
 *
 * @returns The user ID if authenticated, null otherwise
 *
 * @example
 * ```ts
 * // In a Server Component
 * const userId = await getCurrentUserId()
 * if (userId) {
 *   // User is authenticated
 * }
 * ```
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/**
 * Get the current user's full data on the server
 *
 * @returns The Clerk User object if authenticated, null otherwise
 *
 * @example
 * ```ts
 * // In a Server Component
 * const user = await getCurrentUser()
 * if (user) {
 *   console.log(user.emailAddresses[0]?.emailAddress)
 * }
 * ```
 */
export async function getCurrentUser() {
  return await currentUser()
}

/**
 * Require authentication - throws error if not authenticated
 *
 * Use this in Server Actions or API routes where authentication is mandatory.
 * Will throw an error if the user is not authenticated.
 *
 * @returns The user ID
 * @throws Error if not authenticated
 *
 * @example
 * ```ts
 * // In a Server Action
 * export async function createSession(animalCode: string) {
 *   const userId = await requireAuth()
 *   // Proceed with authenticated user
 * }
 * ```
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized - authentication required')
  }
  return userId
}

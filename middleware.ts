import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Clerk Middleware Configuration
 *
 * IMPORTANT: Using clerkMiddleware() (NOT authMiddleware - which is deprecated)
 * This follows Clerk's official App Router approach for Next.js 13+
 *
 * Why clerkMiddleware:
 * - Modern approach recommended by Clerk for App Router
 * - Better performance and flexibility
 * - Supports async/await patterns
 * - More granular control over route protection
 *
 * Public Routes:
 * - Homepage (/)
 * - Sign-in pages (/sign-in, /sign-in/*)
 * - Sign-up pages (/sign-up, /sign-up/*)
 * - Health check endpoint (/api/health)
 *
 * Protected Routes:
 * - All other routes require authentication
 * - Future: Will integrate with animal-code session validation
 *
 * To extend for animal-code sessions:
 * 1. Add session validation logic after auth.protect()
 * 2. Check for valid animal-code in request
 * 3. Validate against Supabase session data
 * 4. Redirect to session creation if needed
 */

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
])

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  // Future: Add animal-code session validation here
  // Example:
  // const userId = auth().userId
  // if (userId) {
  //   await validateAnimalCodeSession(request, userId)
  // }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

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
 * Public Routes (Guest Access Allowed):
 * - Homepage (/) - Shows login or session board for guests
 * - Lists page (/lists) - Accessible to guests with animal code sessions
 * - Sign-in pages (/sign-in, /sign-in/*)
 * - Sign-up pages (/sign-up, /sign-up/*)
 * - Health check endpoint (/api/health)
 *
 * Animal Code Sessions:
 * - Guests can access the app without authentication using animal codes
 * - Session/user validation is handled at the component level
 * - Authentication is optional for collaborative features
 *
 * Protected Routes:
 * - Currently none, as all features support guest access
 * - Future: Add routes that require authentication if needed
 */

// Define public routes that don't require authentication
// All main app routes are public to support guest users with animal code sessions
const isPublicRoute = createRouteMatcher([
  '/',
  '/lists',
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

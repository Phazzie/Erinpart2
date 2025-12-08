import { NextResponse } from 'next/server'

// Simple pass-through middleware - no auth required
// All routes are public for guest access via magic word rooms
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}

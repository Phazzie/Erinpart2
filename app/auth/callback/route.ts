import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // In a real app, you would handle the OAuth code exchange here
  // and create a session for the user.
  // For this mock implementation, we'll just redirect to the home page,
  // as the mock `signInWithGoogle` action has already set the auth state.
  const redirectURL = request.nextUrl.clone()
  redirectURL.pathname = '/'
  redirectURL.search = '' // Clear any search params
  return NextResponse.redirect(redirectURL)
}

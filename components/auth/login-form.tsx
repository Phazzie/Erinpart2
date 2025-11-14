'use client'

import AnimalCodeForm from './animal-code-form'

/**
 * LoginForm Component
 *
 * Simplified authentication component that uses animal codes for session joining.
 * Traditional email/password authentication is now handled by Clerk's UI components.
 *
 * Users can either:
 * 1. Join/create a session using animal codes (AnimalCodeForm)
 * 2. Sign in with Clerk (via the sign-in button in the header)
 */
export default function LoginForm() {
  return (
    <div className="space-y-6">
      {/* Animal Code Form is the primary method for joining sessions */}
      <AnimalCodeForm />
    </div>
  )
}

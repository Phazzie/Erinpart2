'use client'

import MagicWordForm from './magic-word-form'

/**
 * LoginForm Component
 *
 * Simplified authentication using magic words for session joining.
 * No traditional sign-in required - just enter a magic word and name.
 */
export default function LoginForm() {
  return (
    <div className="space-y-6">
      <MagicWordForm />
    </div>
  )
}

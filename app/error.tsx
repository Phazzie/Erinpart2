'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center card-neon p-8 m-8">
      <h2 className="text-3xl font-bold text-red-500 mb-4 text-glitch">Something went wrong!</h2>
      <p className="text-lg text-red-300 mb-6">{error.message || "A glitch in the matrix occurred."}</p>
      <button
        onClick={() => reset()}
        className="btn-neon"
      >
        Try to reload the page
      </button>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'

interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg font-semibold text-sm"
    >
      <span className="font-bold">Error:</span> {message}
    </motion.div>
  )
}

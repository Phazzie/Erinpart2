'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'default' | 'neon' | 'matrix'
}

export default function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  variant = 'neon'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  }

  if (variant === 'matrix') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          {/* Matrix Rain Effect */}
          <div className="grid grid-cols-8 gap-1">
            {[...Array(64)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-green-400"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
        {text && (
          <motion.p
            className="mt-4 text-green-400 font-mono text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  if (variant === 'neon') {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          {/* Neon Rings */}
          <motion.div
            className={`${sizeClasses[size]} border-4 border-cyan-500/30 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className={`absolute inset-2 border-4 border-pink-500/50 rounded-full`}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className={`absolute inset-4 border-4 border-purple-500/70 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />

          {/* Center Glow */}
          <motion.div
            className="absolute inset-6 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full"
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {text && (
          <motion.p
            className="mt-4 text-cyan-400 font-semibold text-glow-cyan"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    )
  }

  // Default spinner
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-300 border-t-cyan-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="mt-4 text-gray-400 text-sm">{text}</p>
      )}
    </div>
  )
}

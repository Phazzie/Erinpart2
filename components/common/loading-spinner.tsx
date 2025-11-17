'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'default' | 'neon' | 'matrix' | 'cosmic'
}

const cosmicPhrases = [
  'Consulting the cosmic vibes...',
  'Wrangling digital chaos...',
  'Summoning productivity spirits...',
  'Aligning the task stars...',
  'Bending reality to your will...',
  'Channeling focus energy...',
  'Manifesting your session...',
  'Tuning into your frequency...',
  'Weaving the task fabric...',
  'Activating hyperfocus mode...',
]

const emojis = ['✨', '🌙', '⚡', '🔮', '💫', '🌟', '🎨', '🎭', '🎪', '🎯']

export default function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  variant = 'neon',
}: LoadingSpinnerProps) {
  const [phrase, setPhrase] = useState(cosmicPhrases[0])
  const [currentEmoji, setCurrentEmoji] = useState(0)

  useEffect(() => {
    if (variant === 'cosmic') {
      const phraseInterval = setInterval(() => {
        setPhrase(cosmicPhrases[Math.floor(Math.random() * cosmicPhrases.length)])
      }, 2500)

      const emojiInterval = setInterval(() => {
        setCurrentEmoji(prev => (prev + 1) % emojis.length)
      }, 400)

      return () => {
        clearInterval(phraseInterval)
        clearInterval(emojiInterval)
      }
    }
  }, [variant])

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
  }

  if (variant === 'cosmic') {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="relative w-48 h-48">
          {/* Orbiting Emojis */}
          {emojis.map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [
                  Math.cos((i * 2 * Math.PI) / emojis.length) * 80,
                  Math.cos((i * 2 * Math.PI) / emojis.length + Math.PI * 2) * 80,
                ],
                y: [
                  Math.sin((i * 2 * Math.PI) / emojis.length) * 80,
                  Math.sin((i * 2 * Math.PI) / emojis.length + Math.PI * 2) * 80,
                ],
                rotate: [0, 360],
                scale: i === currentEmoji ? [1, 1.5, 1] : 1,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
                scale: {
                  duration: 0.4,
                  repeat: Infinity,
                  repeatDelay: 3.6,
                },
              }}
            >
              {emoji}
            </motion.div>
          ))}

          {/* Center Pulsing Gradient Orb */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(236,72,153,0.8) 0%, rgba(59,130,246,0.6) 50%, rgba(168,85,247,0.4) 100%)',
              filter: 'blur(8px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Spinning Ring */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-dashed border-cyan-400/50 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />

          {/* Counter-spinning Ring */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-dotted border-pink-400/30 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Animated Phrase */}
        <motion.div
          key={phrase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-8 text-center"
        >
          <p className="text-lg font-semibold bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            {phrase}
          </p>
          <motion.div
            className="mt-2 flex gap-1 justify-center"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="w-2 h-2 bg-cyan-400 rounded-full" />
            <span className="w-2 h-2 bg-pink-400 rounded-full" />
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    )
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
      {text && <p className="mt-4 text-gray-400 text-sm">{text}</p>}
    </div>
  )
}

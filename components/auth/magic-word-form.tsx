'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from '@/lib/toast'

// Fun random words for suggestions
const WORD_SUGGESTIONS = [
  'tacos', 'pizza', 'coffee', 'beach', 'sunset', 'friday', 'adventure',
  'sparkle', 'thunder', 'cosmic', 'midnight', 'neon', 'velocity', 'quantum',
  'nebula', 'phoenix', 'aurora', 'cascade', 'horizon', 'stellar'
]

export default function MagicWordForm() {
  const router = useRouter()
  const [word, setWord] = useState('')
  const [name, setName] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleRandomWord = () => {
    const randomWord = WORD_SUGGESTIONS[Math.floor(Math.random() * WORD_SUGGESTIONS.length)]
    setWord(randomWord)
    toast.success(`How about "${randomWord}"? ✨`)
  }

  const handleJoin = () => {
    // Validation
    const cleanWord = word.trim().toLowerCase()
    const cleanName = name.trim()

    if (!cleanWord) {
      toast.error('Enter a magic word')
      return
    }

    if (cleanWord.length < 2) {
      toast.error('Word must be at least 2 characters')
      return
    }

    if (cleanWord.length > 30) {
      toast.error('Word must be less than 30 characters')
      return
    }

    // Only allow letters, numbers, hyphens (no spaces or special chars)
    if (!/^[a-z0-9-]+$/.test(cleanWord)) {
      toast.error('Word can only contain letters, numbers, and hyphens')
      return
    }

    if (!cleanName) {
      toast.error('Enter your name')
      return
    }

    if (cleanName.length < 2 || cleanName.length > 30) {
      toast.error('Name must be 2-30 characters')
      return
    }

    // Safe characters for name
    if (!/^[a-zA-Z0-9\s\-']+$/.test(cleanName)) {
      toast.error("Name can only contain letters, numbers, spaces, hyphens, and apostrophes")
      return
    }

    setIsJoining(true)

    try {
      // Store session
      const sessionData = {
        sessionId: cleanWord,
        userName: cleanName,
        joinedAt: new Date().toISOString(),
      }
      localStorage.setItem('sessionData', JSON.stringify(sessionData))

      toast.success(`Welcome to "${cleanWord}", ${cleanName}! ✨`)

      // Navigate with URL param for sharing
      router.push(`/?room=${encodeURIComponent(cleanWord)}`)
    } catch (error) {
      // Reset state if something goes wrong
      setIsJoining(false)
      toast.error('Failed to join room. Please try again.')
      console.error('[MagicWordForm] Join error:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && word && name) {
      handleJoin()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Erin&apos;s Escapades
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-2"
        >
          Collaborate with a magic word
        </motion.p>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-500/10"
      >
        <div className="space-y-5">
          {/* Magic Word Input */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Magic Word
            </label>
            <div className="relative">
              <Input
                placeholder="tacos"
                value={word}
                onChange={e => setWord(e.target.value.toLowerCase())}
                onKeyDown={handleKeyDown}
                className="bg-gray-800/50 border-2 border-purple-500/40 text-white text-lg placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 h-12 pr-20"
                maxLength={30}
              />
              <button
                type="button"
                onClick={handleRandomWord}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded transition-colors"
              >
                Random
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share this word with friends to join the same room
            </p>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-cyan-300 mb-2">
              Your Name
            </label>
            <Input
              placeholder="Sarah"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-gray-800/50 border-2 border-cyan-500/40 text-white text-lg placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 h-12"
              maxLength={30}
            />
          </div>

          {/* Join Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleJoin}
              disabled={!word.trim() || !name.trim() || isJoining}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Enter Room
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* How it works */}
        <div className="mt-6 pt-5 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 text-center">
            Same word = same room. No accounts needed.
          </p>
        </div>
      </motion.div>

      {/* Example */}
      {word && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-400 mt-4"
        >
          Tell your friends: <span className="text-pink-400 font-medium">&quot;Join {word}&quot;</span>
        </motion.p>
      )}
    </motion.div>
  )
}

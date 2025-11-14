'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { Vibe } from '@/lib/types'

interface VibeDropdownProps {
  vibes: Vibe[]
  currentVibe: string
  onVibeChange: (vibeId: string) => void
}

// Emoji map for vibe categories
const categoryEmojis: Record<string, string> = {
  general: '✨',
  chaos: '🎭',
  dark: '🌙',
  academic: '📚',
  romantic: '💖',
}

export default function VibeDropdown({ vibes, currentVibe, onVibeChange }: VibeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentVibeData = vibes.find(v => v.name === currentVibe) || vibes[0]
  const currentEmoji = categoryEmojis[currentVibeData.category] || '✨'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/30 hover:border-cyan-500/50 transition-all"
      >
        <span className="text-2xl">{currentEmoji}</span>
        <span className="hidden sm:inline text-sm font-medium text-cyan-400">
          {currentVibeData.display_name}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-72 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-xl shadow-cyan-500/10 overflow-hidden z-50"
          >
            <div className="p-2 max-h-96 overflow-y-auto">
              {vibes.map(vibe => {
                const vibeEmoji = categoryEmojis[vibe.category] || '✨'
                return (
                  <button
                    key={vibe.id}
                    onClick={() => {
                      onVibeChange(vibe.name)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${
                      currentVibe === vibe.name
                        ? 'bg-cyan-500/20 border border-cyan-500/50'
                        : 'hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{vibeEmoji}</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm text-cyan-400">{vibe.display_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{vibe.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

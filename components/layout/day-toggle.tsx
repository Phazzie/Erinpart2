'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DayToggleProps {
  currentDay: 'today' | 'tomorrow'
  onDayChange: (day: 'today' | 'tomorrow') => void
}

export default function DayToggle({ currentDay, onDayChange }: DayToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleDayChange = (day: 'today' | 'tomorrow') => {
    if (day !== currentDay && !isAnimating) {
      setIsAnimating(true)
      onDayChange(day)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  return (
    <div className="flex justify-center mb-8">
      <div className="relative bg-slate-800 rounded-full p-1 w-72 mx-auto flex items-center shadow-lg border border-cyan-500/20 glow-cyan">
        {/* Animated Background Slider */}
        <motion.div
          className="absolute top-1 h-10 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full glow-pink"
          style={{
            width: 'calc(50% - 4px)',
            margin: '0 2px',
          }}
          animate={{
            x: currentDay === 'today' ? 0 : '100%',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />

        {/* Today Button */}
        <motion.button
          onClick={() => handleDayChange('today')}
          className={`w-1/2 rounded-full p-3 text-lg font-semibold transition-all duration-300 z-10 relative overflow-hidden ${
            currentDay === 'today'
              ? 'text-slate-900 text-glow-cyan'
              : 'text-gray-400 hover:bg-slate-700 hover:text-cyan-400'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentDay === 'today' ? 'active-today' : 'inactive-today'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Today
            </motion.span>
          </AnimatePresence>

          {/* Particle Effect */}
          {currentDay === 'today' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          )}
        </motion.button>

        {/* Tomorrow Button */}
        <motion.button
          onClick={() => handleDayChange('tomorrow')}
          className={`w-1/2 rounded-full p-3 text-lg font-semibold transition-all duration-300 z-10 relative overflow-hidden ${
            currentDay === 'tomorrow'
              ? 'text-slate-900 text-glow-pink'
              : 'text-gray-400 hover:bg-slate-700 hover:text-pink-400'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentDay === 'tomorrow' ? 'active-tomorrow' : 'inactive-tomorrow'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Tomorrow
            </motion.span>
          </AnimatePresence>

          {/* Particle Effect */}
          {currentDay === 'tomorrow' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-pink-400 rounded-full"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          )}
        </motion.button>
      </div>
    </div>
  )
}

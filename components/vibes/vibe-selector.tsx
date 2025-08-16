'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Sparkles, Zap, Heart, Skull } from 'lucide-react'

interface Vibe {
  id: string
  name: string
  display_name: string
  description?: string
  tasks: string[]
  category: string
  is_default: boolean
}

interface VibeSelectorProps {
  vibes: Vibe[]
  currentVibe: string
  onVibeChange: (vibeName: string) => void
  isOwner: boolean
}

const getVibeIcon = (category: string) => {
  switch (category) {
    case 'chaos': return Zap
    case 'romantic': return Heart
    case 'dark': return Skull
    default: return Sparkles
  }
}

const getVibeColor = (category: string) => {
  switch (category) {
    case 'chaos': return 'from-red-500 to-orange-500'
    case 'romantic': return 'from-pink-500 to-purple-500'
    case 'dark': return 'from-purple-500 to-black'
    case 'academic': return 'from-blue-500 to-cyan-500'
    case 'corporate': return 'from-gray-500 to-slate-500'
    default: return 'from-cyan-500 to-pink-500'
  }
}

export default function VibeSelector({ vibes, currentVibe, onVibeChange, isOwner }: VibeSelectorProps) {
  const [hoveredVibe, setHoveredVibe] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Group vibes by category
  const vibesByCategory = vibes.reduce((acc, vibe) => {
    if (!acc[vibe.category]) {
      acc[vibe.category] = []
    }
    acc[vibe.category].push(vibe)
    return acc
  }, {} as Record<string, Vibe[]>)

  const handleVibeChange = (vibeName: string) => {
    onVibeChange(vibeName)
  }

  return (
    <Card className="card-neon animate-slide-in-left">
      <CardHeader>
        <CardTitle className="text-center text-cyan-400 text-glow-cyan animate-pulse-glow">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <Sparkles className="h-5 w-5 animate-spin" />
            Change the Vibe
            <Sparkles className="h-5 w-5 animate-spin" style={{ animationDirection: 'reverse' }} />
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(vibesByCategory).map(([category, categoryVibes]) => {
            const Icon = getVibeIcon(category)
            const isExpanded = expandedCategory === category || categoryVibes.some(v => v.name === currentVibe)

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {/* Category Header */}
                <motion.button
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-cyan-400 group-hover:text-pink-400 transition-colors" />
                    <span className="text-white font-semibold capitalize">
                      {category} ({categoryVibes.length})
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.div>
                </motion.button>

                {/* Category Vibes */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {categoryVibes.map((vibe, index) => (
                        <motion.div
                          key={vibe.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center group"
                          onMouseEnter={() => setHoveredVibe(vibe.name)}
                          onMouseLeave={() => setHoveredVibe(null)}
                        >
                          <motion.div
                            className="flex-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => handleVibeChange(vibe.name)}
                              variant={currentVibe === vibe.name ? 'default' : 'secondary'}
                              className={`w-full justify-start rounded-r-none relative overflow-hidden ${
                                currentVibe === vibe.name
                                  ? `bg-gradient-to-r ${getVibeColor(vibe.category)} text-white glow-cyan border-animated`
                                  : 'bg-slate-600 hover:bg-slate-500 text-white hover:text-cyan-400'
                              }`}
                            >
                              {/* Background Animation */}
                              {currentVibe === vibe.name && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                  animate={{ x: ['-100%', '100%'] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                />
                              )}

                              <span className="relative z-10">
                                {vibe.display_name || vibe.name.charAt(0).toUpperCase() +
                                  vibe.name
                                    .slice(1)
                                    .replace(/([A-Z])|_/g, ' $1')
                                    .trim()}
                              </span>

                              {/* Particle Effect for Active Vibe */}
                              {currentVibe === vibe.name && (
                                <div className="absolute inset-0 pointer-events-none">
                                  {[...Array(3)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute w-1 h-1 bg-white rounded-full"
                                      initial={{
                                        x: '10%',
                                        y: '50%',
                                        scale: 0,
                                        opacity: 1
                                      }}
                                      animate={{
                                        x: '90%',
                                        y: `${50 + (Math.random() - 0.5) * 40}%`,
                                        scale: [0, 1, 0],
                                        opacity: [1, 1, 0]
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.5,
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </Button>
                          </motion.div>

                          {/* Owner Controls */}
                          {isOwner && (
                            <AnimatePresence>
                              {(hoveredVibe === vibe.name || currentVibe === vibe.name) && (
                                <motion.div
                                  initial={{ width: 0, opacity: 0 }}
                                  animate={{ width: 'auto', opacity: 1 }}
                                  exit={{ width: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex overflow-hidden"
                                >
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="rounded-none bg-slate-500 hover:bg-yellow-500 px-2 hover-lift"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="rounded-l-none bg-slate-500 hover:bg-red-500 px-2 hover-lift"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Vibe Preview */}
        <AnimatePresence>
          {hoveredVibe && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-cyan-500/20"
            >
              <div className="text-sm text-cyan-400 font-semibold mb-1">Preview:</div>
              <div className="text-xs text-gray-300">
                {vibes.find(v => v.name === hoveredVibe)?.description ||
                 `${vibes.find(v => v.name === hoveredVibe)?.tasks.length || 0} tasks in this vibe`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

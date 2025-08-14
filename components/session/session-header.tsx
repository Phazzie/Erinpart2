'use client'

import { motion } from 'framer-motion'
import { Share2, Users } from 'lucide-react'
import { Button } from '../ui/button'
import PresenceIndicator from '../layout/presence-indicator'

interface SessionHeaderProps {
  name: string
}

export default function SessionHeader({ name }: SessionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between mb-8"
    >
      <h1 className="text-4xl font-bold text-rainbow">{name}</h1>
      <div className="flex items-center gap-4">
        <PresenceIndicator />
        <Button variant="ghost" size="icon" className="hover-glow">
          <Users className="h-5 w-5 text-purple-400" />
        </Button>
        <Button variant="ghost" size="icon" className="hover-glow">
          <Share2 className="h-5 w-5 text-cyan-400" />
        </Button>
      </div>
    </motion.div>
  )
}

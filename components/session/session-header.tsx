'use client'

import { motion } from 'framer-motion'
import { Share2, Users } from 'lucide-react'
import { Button } from '../ui/button'
import PresenceIndicator from '../layout/presence-indicator'
import VibeDropdown from '../vibes/vibe-dropdown'
import { useMemo, useState } from 'react'
import { Vibe } from '@/lib/types'
import ShareSessionModal from './share-session-modal'

interface SessionHeaderProps {
  name: string
  sessionId?: string
  answersEncoded?: string // optional, when generating a reply link
  vibes?: Vibe[]
  currentVibe?: string
  onVibeChange?: (vibeId: string) => void
  passphrase?: string // optional passphrase if session created via magic word
}

export default function SessionHeader({ 
  name, 
  sessionId = 'session-1', 
  answersEncoded,
  vibes = [],
  currentVibe = 'default',
  onVibeChange,
  passphrase
}: SessionHeaderProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const url = new URL(window.location.href)
    url.searchParams.set('session', sessionId)
    url.searchParams.delete('answers')
    return url.toString()
  }, [sessionId])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between mb-8 flex-wrap gap-4"
    >
      <h1 className="text-4xl font-bold text-rainbow">{name}</h1>
      <div className="flex items-center gap-4">
        {vibes.length > 0 && onVibeChange && (
          <VibeDropdown 
            vibes={vibes} 
            currentVibe={currentVibe} 
            onVibeChange={onVibeChange} 
          />
        )}
        <PresenceIndicator />
        <Button variant="ghost" size="icon" className="hover-glow">
          <Users className="h-5 w-5 text-purple-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover-glow group"
          onClick={() => setIsShareModalOpen(true)}
          aria-label="Share session"
          title="Share session (QR code, link, or code)"
        >
          <Share2 className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        </Button>
      </div>

      <ShareSessionModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        sessionId={sessionId}
        passphrase={passphrase}
      />
    </motion.div>
  )
}

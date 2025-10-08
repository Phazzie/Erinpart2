'use client'

import { motion } from 'framer-motion'
import { Share2, Users, Link as LinkIcon, Copy } from 'lucide-react'
import { Button } from '../ui/button'
import PresenceIndicator from '../layout/presence-indicator'
import VibeDropdown from '../vibes/vibe-dropdown'
import { useEffect, useMemo, useState } from 'react'
import { toast } from '@/lib/toast'
import { Vibe } from '@/lib/types'

interface SessionHeaderProps {
  name: string
  sessionId?: string
  answersEncoded?: string // optional, when generating a reply link
  vibes?: Vibe[]
  currentVibe?: string
  onVibeChange?: (vibeId: string) => void
}

export default function SessionHeader({ 
  name, 
  sessionId = 'session-1', 
  answersEncoded,
  vibes = [],
  currentVibe = 'default',
  onVibeChange
}: SessionHeaderProps) {
  const [copied, setCopied] = useState<'share' | 'reply' | null>(null)

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const url = new URL(window.location.href)
    url.searchParams.set('session', sessionId)
    url.searchParams.delete('answers')
    return url.toString()
  }, [sessionId])

  const replyUrl = useMemo(() => {
    if (typeof window === 'undefined' || !answersEncoded) return ''
    const url = new URL(window.location.href)
    url.searchParams.set('session', sessionId)
    url.searchParams.set('answers', answersEncoded)
    return url.toString()
  }, [sessionId, answersEncoded])

  const copy = async (text: string, kind: 'share' | 'reply') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      toast.success(kind === 'share' ? 'Share link copied' : 'Reply link copied')
      setTimeout(() => setCopied(null), 1500)
    } catch (e) {
      toast.error('Failed to copy link')
    }
  }

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
          className="hover-glow"
          onClick={() => shareUrl && copy(shareUrl, 'share')}
          aria-label="Copy share link"
          title="Copy share link"
        >
          {copied === 'share' ? <Copy className="h-5 w-5 text-green-400" /> : <Share2 className="h-5 w-5 text-cyan-400" />}
        </Button>
        {answersEncoded ? (
          <Button
            variant="ghost"
            size="icon"
            className="hover-glow"
            onClick={() => replyUrl && copy(replyUrl, 'reply')}
            aria-label="Copy reply link"
            title="Copy reply link"
          >
            {copied === 'reply' ? <Copy className="h-5 w-5 text-green-400" /> : <LinkIcon className="h-5 w-5 text-pink-400" />}
          </Button>
        ) : null}
      </div>
    </motion.div>
  )
}

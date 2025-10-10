'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, QrCode, Link as LinkIcon, KeyRound } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from '@/lib/toast'

interface ShareSessionModalProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  sessionId: string
  passphrase?: string
}

export default function ShareSessionModal({
  isOpen,
  onClose,
  shareUrl,
  sessionId,
  passphrase
}: ShareSessionModalProps) {
  const [activeTab, setActiveTab] = useState<'qr' | 'link' | 'code'>('qr')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${label} copied to clipboard! 📋`)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      toast.error('Failed to copy')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border-2 border-purple-500/30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Share Session
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-700/50"
            >
              <X className="h-5 w-5 text-gray-400" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'qr'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <QrCode className="h-4 w-4" />
              <span className="text-sm font-semibold">QR Code</span>
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'link'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <LinkIcon className="h-4 w-4" />
              <span className="text-sm font-semibold">Link</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'code'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <KeyRound className="h-4 w-4" />
              <span className="text-sm font-semibold">Code</span>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'qr' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <QRCodeSVG
                    value={shareUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Scan this QR code with your phone camera to join the session
                </p>
                <Button
                  onClick={() => copyToClipboard(shareUrl, 'Link')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link Too
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {activeTab === 'link' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-cyan-400">
                    Share this link with others:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="bg-gray-800/50 border-cyan-500/50 text-white font-mono text-sm"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <Button
                      onClick={() => copyToClipboard(shareUrl, 'Link')}
                      size="icon"
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-cyan-300" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-cyan-400">💡 Tip:</span>{' '}
                    Anyone with this link can join your session and collaborate in real-time!
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'code' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-pink-400">
                    Session Code:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={sessionId}
                      readOnly
                      className="bg-gray-800/50 border-pink-500/50 text-white font-bold text-lg text-center"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <Button
                      onClick={() => copyToClipboard(sessionId, 'Session code')}
                      size="icon"
                      className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-pink-300" />
                      )}
                    </Button>
                  </div>
                </div>

                {passphrase && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-pink-400">
                      Magic Passphrase:
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={passphrase}
                        readOnly
                        className="bg-gray-800/50 border-pink-500/50 text-white font-mono"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <Button
                        onClick={() => copyToClipboard(passphrase, 'Passphrase')}
                        size="icon"
                        className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-pink-300" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="bg-pink-900/20 border border-pink-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-pink-400">🔑 How to use:</span>
                  </p>
                  <ol className="text-sm text-gray-300 mt-2 space-y-1 list-decimal list-inside">
                    <li>Share the session code with others</li>
                    <li>They enter it on the login screen</li>
                    <li>Everyone joins the same session!</li>
                  </ol>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

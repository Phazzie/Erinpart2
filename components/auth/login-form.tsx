'use client'

import { useFormState } from 'react-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { signIn } from '@/lib/actions'
import { toast } from '@/lib/toast'
import AnimalCodeForm from './animal-code-form'

type AuthState = { error?: string } | null
export default function LoginForm() {
  const [state, formAction] = useFormState<AuthState, FormData>(signIn as any, null)
  const [showPassword, setShowPassword] = useState(false)

  const [showEmailLogin, setShowEmailLogin] = useState(false)

  // Using server actions with <form action={formAction}> so no manual submit handler needed.

  return (
    <div className="space-y-6">
      {/* Animal Code Form is now the primary method */}
      <AnimalCodeForm />

      <AnimatePresence>
        {state?.error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="bg-red-900/50 border-2 border-red-500 text-red-300 px-4 py-3 rounded-lg font-bold glow-pink"
          >
            <motion.span
              animate={{ x: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              ⚠️ {state.error}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <button
          onClick={() => setShowEmailLogin(prev => !prev)}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {showEmailLogin ? 'Hide admin login' : 'Admin or registered user?'}
        </button>
      </div>

      <AnimatePresence>
        {showEmailLogin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Email/Password Form */}
            <form action={formAction} className="space-y-4 pt-4 border-t border-purple-500/20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="email" className="text-white font-semibold text-glow-cyan">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-neon mt-1"
                  placeholder="your.email@awesome.com"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="password" className="text-white font-semibold text-glow-pink">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input-neon pr-10"
                    placeholder="Your secret passphrase"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="btn-neon w-full">
                  🚀 Start a session
                </Button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

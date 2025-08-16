'use client'

import { useFormState } from 'react-dom'
import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { signUp } from '@/lib/actions'

type SignupState = { error?: string; success?: string } | null
export default function SignupForm() {
  const [state, formAction] = useFormState<SignupState, FormData>(signUp as any, null)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition();

  // Using server actions with <form action={formAction}>.

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {state?.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-900/50 border-2 border-red-500 text-red-300 px-4 py-3 rounded-lg font-bold glow-pink"
          >
            ⚠️ {state.error}
          </motion.div>
        )}
        {state?.success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-900/50 border-2 border-green-500 text-green-300 px-4 py-3 rounded-lg font-bold glow-green"
          >
            🎉 {state.success}
          </motion.div>
        )}
      </AnimatePresence>

  <form data-testid="signup-form" action={formAction} className="space-y-4">
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
              minLength={6}
              className="input-neon pr-10"
              placeholder="6+ characters of pure chaos"
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
            ✨ Create Account
          </Button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <span className="text-gray-300">Already have an account? </span>
        <Link
          href="/auth/login"
          className="text-cyan-400 hover:text-pink-400 font-bold transition-colors duration-300 text-glow-cyan"
        >
          Log in
        </Link>
      </motion.div>
    </div>
  )
}

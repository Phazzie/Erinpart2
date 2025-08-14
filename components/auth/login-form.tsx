'use client'

import { useActionState, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { signIn, signInWithGoogle } from '@/lib/actions'
import { toast } from '@/lib/toast'
import AnimalCodeForm from './animal-code-form'

export default function LoginForm() {
  const [state, formAction] = useActionState(signIn, null)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition();

  const handleGoogleSignIn = async () => {
    startTransition(async () => {
      try {
        await signInWithGoogle()
        toast.success('Welcome back! 🎉')
      } catch (error) {
        toast.error('Google sign-in failed. Please try again.')
      }
    });
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
        formAction(formData);
    });
  };

  return (
    <div className="space-y-6">
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

      {/* Animal Code Form */}
      <AnimalCodeForm />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-black/50 text-gray-400 font-bold">OR</span>
        </div>
      </div>

      {/* Google Sign In */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleGoogleSignIn}
          disabled={isPending}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-6 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 transform hover:scale-105"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>
      </motion.div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-black/50 text-gray-400 font-bold">Use email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button
            type="submit"
            className="btn-neon w-full"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '🚀 Start a session'}
          </Button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <span className="text-gray-300">New to the chaos? </span>
        <Link
          href="/auth/signup"
          className="text-pink-400 hover:text-cyan-400 font-bold transition-colors duration-300 text-glow-pink"
        >
          Join the escapade
        </Link>
      </motion.div>
    </div>
  )
}

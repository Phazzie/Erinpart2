'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'

const ANIMALS = [
  'Cat', 'Dog', 'Fish', 'Bird', 'Tiger', 'Dolphin', 'Lion', 'Eagle',
  'Bear', 'Wolf', 'Fox', 'Owl', 'Shark', 'Whale', 'Elephant', 'Monkey'
]

export default function AnimalCodeForm() {
  const [animal1, setAnimal1] = useState('')
  const [animal2, setAnimal2] = useState('')
  const [firstName, setFirstName] = useState('')
  const [isPending, startTransition] = useTransition();

  const handleJoinSession = async () => {
    if (animal1.trim() && animal2.trim() && firstName.trim()) {
      startTransition(() => {
        const sessionId = `${animal1.toLowerCase()}-${animal2.toLowerCase()}`
        const userName = firstName.trim()
        
        // Store session info in localStorage
        localStorage.setItem('sessionData', JSON.stringify({
          sessionId,
          userName,
          joinedAt: new Date().toISOString()
        }))
        
        toast.success(`Welcome ${userName}! 🐾`)
        // Reload page to trigger session detection
        window.location.reload()
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20 max-w-md mx-auto"
    >
      <div className="text-center">
        <h3 className="text-purple-400 font-bold text-xl text-glow-purple">
          🐾 Join Session
        </h3>
        <p className="text-sm text-gray-300 mt-2">
          Pick two animals and enter your name to join or create a session
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="animal1" className="text-purple-400 font-semibold">
            First Animal
          </Label>
          <select
            id="animal1"
            value={animal1}
            onChange={(e) => setAnimal1(e.target.value)}
            className="w-full mt-1 bg-gray-700/50 border-2 border-purple-500/50 text-white rounded-md px-3 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-all duration-300"
          >
            <option value="">Choose first animal...</option>
            {ANIMALS.map(animal => (
              <option key={animal} value={animal}>{animal}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="animal2" className="text-pink-400 font-semibold">
            Second Animal
          </Label>
          <select
            id="animal2"
            value={animal2}
            onChange={(e) => setAnimal2(e.target.value)}
            className="w-full mt-1 bg-gray-700/50 border-2 border-pink-500/50 text-white rounded-md px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
          >
            <option value="">Choose second animal...</option>
            {ANIMALS.filter(animal => animal !== animal1).map(animal => (
              <option key={animal} value={animal}>{animal}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="firstName" className="text-cyan-400 font-semibold">
            Your First Name
          </Label>
          <Input
            id="firstName"
            placeholder="Sarah"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-gray-700/50 border-2 border-cyan-500/50 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300"
          />
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleJoinSession}
          disabled={!animal1.trim() || !animal2.trim() || !firstName.trim() || isPending}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining session...
            </>
          ) : (
            <span>🦁 Join Session</span>
          )}
        </Button>
      </motion.div>

      <p className="text-xs text-gray-400 text-center">
        Session code: {animal1 && animal2 ? `${animal1.toLowerCase()}-${animal2.toLowerCase()}` : 'Select animals to see code'}
      </p>
    </motion.div>
  )
}

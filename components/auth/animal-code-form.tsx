'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'

const ANIMALS = [
  // Classic
  'Cat', 'Dog', 'Fish', 'Bird', 'Tiger', 'Dolphin', 'Lion', 'Eagle',
  'Bear', 'Wolf', 'Fox', 'Owl', 'Shark', 'Whale', 'Elephant', 'Monkey',
  // Quirky & Fun
  'Platypus', 'Axolotl', 'Narwhal', 'Capybara', 'Pangolin', 'Quokka', 
  'Otter', 'Penguin', 'Red Panda', 'Sloth', 'Koala', 'Octopus',
  // Mythical
  'Dragon', 'Phoenix', 'Unicorn', 'Kraken',
  // Exotic
  'Lemur', 'Toucan', 'Chameleon', 'Flamingo', 'Peacock', 'Mantis',
  // Extra Fun
  'Raccoon', 'Hedgehog', 'Puffin', 'Manatee', 'Jellyfish', 'Starfish'
]

export default function AnimalCodeForm() {
  const router = useRouter()
  const [animal1, setAnimal1] = useState('')
  const [animal2, setAnimal2] = useState('')
  const [firstName, setFirstName] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleQuickJoin = () => {
    // Generate two random different animals using crypto for better randomness
    const shuffled = [...ANIMALS].sort(() => {
      const randomBuffer = new Uint32Array(1)
      crypto.getRandomValues(randomBuffer)
      return (randomBuffer[0] / 0xFFFFFFFF) - 0.5
    })
    setAnimal1(shuffled[0])
    setAnimal2(shuffled[1])
    toast.success(`Random animals selected: ${shuffled[0]} & ${shuffled[1]}! 🎲`)
  }

  const handleJoinSession = () => {
    // Validation
    if (!animal1 || !animal2 || !firstName) {
      toast.error('Please fill in all fields')
      return
    }

    if (animal1 === animal2) {
      toast.error('Please choose two different animals')
      return
    }

    const name = firstName.trim()
    if (name.length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }

    if (name.length > 50) {
      toast.error('Name must be less than 50 characters')
      return
    }

    // Set loading state
    setIsJoining(true)

    const sessionId = `${animal1.toLowerCase()}-${animal2.toLowerCase()}`

    // Prepare session data with validation
    const sessionData = {
      sessionId,
      userName: name,
      joinedAt: new Date().toISOString()
    }

    // Sanitize to prevent XSS if ever rendered without encoding
    const sanitizedData = {
      ...sessionData,
      userName: sessionData.userName.replace(/[<>]/g, '') // Basic sanitization
    }

    // Store session info in localStorage
    localStorage.setItem('sessionData', JSON.stringify(sanitizedData))

    toast.success(`Welcome ${sanitizedData.userName}! 🐾`)

    // Navigate to session with URL parameter for sharing/bookmarking
    // Using router.push with encodeURIComponent to prevent XSS
    router.push(`/?session=${encodeURIComponent(sessionId)}`)
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

      {/* Explanation Section */}
      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 space-y-2">
        <h4 className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
          <span>ℹ️</span> How Animal Codes Work
        </h4>
        <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
          <li>Choose any 2 animals to create a unique session code</li>
          <li>Anyone with the same animal pair can join your session</li>
          <li>Share your code with friends to collaborate in real-time!</li>
          <li>Example: &quot;Cat-Dog&quot; or &quot;Unicorn-Dolphin&quot;</li>
        </ul>
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
          disabled={!animal1.trim() || !animal2.trim() || !firstName.trim() || isJoining}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isJoining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining session...
            </>
          ) : (
            <span>🦁 Join Session</span>
          )}
        </Button>
      </motion.div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-900 px-2 text-gray-400">Or</span>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleQuickJoin}
          disabled={isJoining}
          variant="outline"
          className="w-full border-2 border-cyan-500/50 bg-cyan-900/20 hover:bg-cyan-800/30 text-cyan-300 font-semibold py-2 px-4 rounded-lg transition-all duration-300"
        >
          🎲 Pick Random Animals for Me
        </Button>
      </motion.div>

      <p className="text-xs text-gray-400 text-center">
        Session code: {animal1 && animal2 ? `${animal1.toLowerCase()}-${animal2.toLowerCase()}` : 'Select animals to see code'}
      </p>
    </motion.div>
  )
}

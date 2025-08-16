'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function AnimalCodeForm() {
  const [animal1, setAnimal1] = useState('')
  const [animal2, setAnimal2] = useState('')
  const [isPending, startTransition] = useTransition();

  const handleAnimalJoin = async () => {
    if (animal1.trim() && animal2.trim()) {
      startTransition(() => {
        const sessionId = `${animal1.toLowerCase()}-${animal2.toLowerCase()}`
        toast.success(`Welcome ${animal1} and ${animal2}! 🐾`)
        // This should be a navigation, but window.location.href is a quick way for mock
        window.location.href = `/?session=${sessionId}&animal=true`
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-500/20"
    >
      <div className="text-center">
        <h3 className="text-yellow-400 font-bold text-lg text-glow-orange">
          🐾 Animal Code Access
        </h3>
        <p className="text-sm text-gray-300 mt-1">
          No account needed - just pick two animals!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="animal1" className="text-yellow-400 font-semibold">
            First Animal
          </Label>
          <Input
            id="animal1"
            placeholder="Tiger"
            value={animal1}
            onChange={(e) => setAnimal1(e.target.value)}
            className="bg-gray-700/50 border-2 border-yellow-500/50 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
          />
        </div>
        <div>
          <Label htmlFor="animal2" className="text-orange-400 font-semibold">
            Second Animal
          </Label>
          <Input
            id="animal2"
            placeholder="Dolphin"
            value={animal2}
            onChange={(e) => setAnimal2(e.target.value)}
            className="bg-gray-700/50 border-2 border-orange-500/50 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300"
          />
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleAnimalJoin}
          disabled={!animal1.trim() || !animal2.trim() || isPending}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining the pack...
            </>
          ) : (
            <span>🦁 Join with Animal Code</span>
          )}
        </Button>
      </motion.div>

      <p className="text-xs text-gray-400 text-center">
        Animal Code = invite-in-disguise. Share it, and you&apos;re in! 🎭
      </p>
    </motion.div>
  )
}

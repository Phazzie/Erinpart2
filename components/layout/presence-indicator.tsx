'use client'

import { motion } from 'framer-motion'

// In a real app, this data would come from a real-time subscription
const mockUsers = [
  { id: 1, name: 'Erin', avatar: 'E' },
  { id: 2, name: 'Friend', avatar: 'F' },
]

export default function PresenceIndicator() {
  return (
    <div className="flex items-center -space-x-2">
      {mockUsers.map((user, i) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold border-2 border-bg-secondary glow-pink"
          title={user.name}
        >
          {user.avatar}
        </motion.div>
      ))}
    </div>
  )
}

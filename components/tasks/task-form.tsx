'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle } from 'lucide-react'

interface TaskFormProps {
  onAddTask: (text: string) => void
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onAddTask(text.trim())
      setText('')
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new chaotic task..."
        className="input-neon flex-grow"
      />
      <Button type="submit" className="btn-neon" disabled={!text.trim()}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </motion.form>
  )
}

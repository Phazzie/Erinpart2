'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle, Lock } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

/**
 * Defines the props for the TaskForm component.
 */
interface TaskFormProps {
  /**
   * Function to call when a new task is submitted.
   * @param text The text of the new task.
   * @param isSecret A boolean indicating if the task should be secret.
   */
  onAddTask: (text: string, isSecret: boolean) => void
}

/**
 * A form component for creating new tasks.
 * Includes an input for the task text and a checkbox to mark the task as secret.
 */
export default function TaskForm({ onAddTask }: TaskFormProps) {
  // State for the task input text
  const [text, setText] = useState('')
  // State for the "secret task" checkbox
  const [isSecret, setIsSecret] = useState(false)
  // State for submission loading
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handles the form submission event.
   * Prevents the default form action, trims the input text,
   * calls the onAddTask prop, and resets the form fields.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      setIsSubmitting(true)
      try {
        await onAddTask(text.trim(), isSecret)
        setText('')
        setIsSecret(false)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6 p-5 rounded-lg bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-cyan-500/20 backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a new chaotic task..."
            className="input-neon flex-grow"
          />
          <Button 
            type="submit" 
            className="btn-neon whitespace-nowrap" 
            disabled={!text.trim() || isSubmitting}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="secret-task"
            checked={isSecret}
            onCheckedChange={(checked) => setIsSecret(!!checked)}
            className="border-pink-500"
          />
          <Label
            htmlFor="secret-task"
            className="text-sm font-medium leading-none text-pink-400 flex items-center gap-1 cursor-pointer"
          >
            <Lock className="h-3 w-3" />
            Make it a secret
          </Label>
        </div>
      </form>
    </motion.div>
  )
}

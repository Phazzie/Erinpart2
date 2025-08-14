'use client'

import { motion } from 'framer-motion'

interface NeonTitleProps {
  title: string
  className?: string
}

export default function NeonTitle({ title, className }: NeonTitleProps) {
  return (
    <motion.h1
      className={`text-5xl font-bold text-center text-rainbow mb-4 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {title}
    </motion.h1>
  )
}

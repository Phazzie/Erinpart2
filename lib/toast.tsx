import { toast as hotToast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import React from 'react'

interface ToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
}

const ToastComponent = ({
  t,
  message,
  type = 'info',
}: {
  t: any
  message: string
  type: string
}) => {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500 text-green-400 glow-green'
      case 'error':
        return 'bg-red-900/90 border-red-500 text-red-400 glow-pink'
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500 text-yellow-400 glow-orange'
      default:
        return 'bg-cyan-900/90 border-cyan-500 text-cyan-400 glow-cyan'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
      className={`
        ${getToastStyles()}
        backdrop-blur-sm border-2 rounded-lg p-4 shadow-2xl
        flex items-center gap-3 min-w-[300px] max-w-[500px]
      `}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: 2 }}
        className="text-xl"
      >
        {getIcon()}
      </motion.span>
      <span className="font-semibold">{message}</span>

      {/* Animated Border */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-transparent"
        style={{
          background: `linear-gradient(45deg, transparent, ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4'}, transparent)`,
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    hotToast.custom(t => <ToastComponent t={t} message={message} type="success" />, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    })
  },

  error: (message: string, options?: ToastOptions) => {
    hotToast.custom(t => <ToastComponent t={t} message={message} type="error" />, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
    })
  },

  info: (message: string, options?: ToastOptions) => {
    hotToast.custom(t => <ToastComponent t={t} message={message} type="info" />, {
      duration: options?.duration || 3000,
      position: options?.position || 'top-right',
    })
  },

  warning: (message: string, options?: ToastOptions) => {
    hotToast.custom(t => <ToastComponent t={t} message={message} type="warning" />, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    })
  },
}

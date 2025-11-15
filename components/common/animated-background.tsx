'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface AnimatedBackgroundProps {
  variant?: 'matrix' | 'particles' | 'grid' | 'waves'
  intensity?: 'low' | 'medium' | 'high'
}

export default function AnimatedBackground({
  variant = 'particles',
  intensity = 'medium',
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (variant === 'particles') {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const particles: any[] = []
      const particleCount = intensity === 'low' ? 50 : intensity === 'medium' ? 100 : 200

      // Create particles
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          color: ['#00ffff', '#ff4fd8', '#a26bff'][Math.floor(Math.random() * 3)],
          opacity: Math.random() * 0.5 + 0.2,
        })
      }

      let animationFrameId: number

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        particles.forEach((particle, index) => {
          // Update position
          particle.x += particle.vx
          particle.y += particle.vy

          // Bounce off edges
          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

          // Draw particle
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.globalAlpha = particle.opacity
          ctx.fill()

          // Draw connections
          particles.slice(index + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.strokeStyle = particle.color
              ctx.globalAlpha = ((100 - distance) / 100) * 0.2
              ctx.lineWidth = 1
              ctx.stroke()
            }
          })
        })

        animationFrameId = requestAnimationFrame(animate)
      }

      animate()

      const handleResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
      }
    }
  }, [variant, intensity])

  if (variant === 'matrix') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 font-mono text-sm opacity-20"
            style={{
              left: `${i * 5}%`,
              top: '-100px',
            }}
            animate={{
              y: ['0vh', '110vh'],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 2,
            }}
          >
            {Array.from({ length: 20 }, () =>
              String.fromCharCode(0x30a0 + Math.random() * 96)
            ).join('')}
          </motion.div>
        ))}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="w-full h-full opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'waves') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${
                ['rgba(0, 255, 255, 0.1)', 'rgba(255, 79, 216, 0.1)', 'rgba(162, 107, 255, 0.1)'][i]
              } 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    )
  }

  // Default particles variant
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  )
}

import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import AnimatedBackground from '@/components/common/animated-background'
import { WebVitals } from './web-vitals'

export const metadata: Metadata = {
  title: "Erin's Escapades - Collaborative Task Management",
  description:
    'A collaborative task management app with neon cyberpunk styling and real-time updates.',
  openGraph: {
    title: "Erin's Escapades",
    description: 'Collaborative task management with real-time updates',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Erin's Escapades",
    description: 'Collaborative task management with real-time updates',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-bg-primary text-white">
        <AnimatedBackground variant="particles" intensity="medium" />
        <Toaster position="top-right" />
        <WebVitals />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  )
}

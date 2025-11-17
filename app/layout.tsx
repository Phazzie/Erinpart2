import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import AnimatedBackground from '@/components/common/animated-background'
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
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
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="font-sans bg-bg-primary text-white">
          <AnimatedBackground variant="particles" intensity="medium" />

          {/* Auth UI - Top Right Corner */}
          <div className="fixed top-4 right-4 z-50">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 border-2 border-cyan-500 shadow-lg shadow-cyan-500/50',
                  },
                }}
              />
            </SignedIn>
          </div>

          <Toaster position="top-right" />
          <WebVitals />
          <main className="relative z-10">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}

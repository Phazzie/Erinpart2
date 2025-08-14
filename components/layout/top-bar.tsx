'use client'

import Link from "next/link"
import NeonTitle from "../common/neon-title"
import { Button } from "../ui/button"

export default function TopBar() {
  return (
    <header className="p-4 bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <NeonTitle title="Erin's Escapades" className="text-2xl mb-0" />
        </Link>
        <nav>
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

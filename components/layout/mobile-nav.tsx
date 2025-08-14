'use client'

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // I will need to create sheet
import { Button } from "../ui/button";
import { Menu } from "lucide-react";

export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-bg-secondary border-r-pink-500/20">
        <div className="flex flex-col gap-4 p-4">
          <p className="text-gray-400">Mobile navigation links go here.</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

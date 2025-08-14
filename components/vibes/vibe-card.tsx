'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Sparkles } from "lucide-react";

interface Vibe {
  id: string;
  name: string;
  display_name: string;
  description?: string;
}

interface VibeCardProps {
  vibe: Vibe;
}

export default function VibeCard({ vibe }: VibeCardProps) {
  return (
    <Card className="card-neon hover-lift transition-transform">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          {vibe.display_name}
        </CardTitle>
        <CardDescription>{vibe.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400">Vibe content goes here.</p>
      </CardContent>
    </Card>
  )
}

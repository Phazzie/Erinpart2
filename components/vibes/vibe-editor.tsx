'use client'

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

export default function VibeEditor() {
  return (
    <Card className="card-neon">
      <CardHeader>
        <CardTitle>Edit Vibe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="vibe-name">Vibe Name</Label>
          <Input id="vibe-name" placeholder="e.g., Feral Academic" className="input-neon" />
        </div>
        <div>
          <Label htmlFor="vibe-desc">Description</Label>
          <Input id="vibe-desc" placeholder="Chaotic intellectual energy" className="input-neon" />
        </div>
        <Button className="btn-neon w-full">Save Vibe</Button>
      </CardContent>
    </Card>
  )
}

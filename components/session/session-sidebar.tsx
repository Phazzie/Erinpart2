'use client'

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function SessionSidebar() {
  return (
    <Card className="card-neon">
      <CardHeader>
        <CardTitle>Other Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">Session navigation will go here.</p>
      </CardContent>
    </Card>
  )
}

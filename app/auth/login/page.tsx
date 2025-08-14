import LoginForm from '@/components/auth/login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md card-neon">
        <CardHeader>
          <CardTitle className="text-center text-cyan-400 text-glow-cyan text-3xl flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6" />
            Join the Escapade
            <Sparkles className="h-6 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}

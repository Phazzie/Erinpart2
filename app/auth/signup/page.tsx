import SignupForm from '@/components/auth/signup-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md card-neon">
        <CardHeader>
          <CardTitle className="text-center text-pink-400 text-glow-pink text-3xl flex items-center justify-center gap-2">
            <Zap className="h-6 w-6" />
            Create Your Account
            <Zap className="h-6 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  )
}

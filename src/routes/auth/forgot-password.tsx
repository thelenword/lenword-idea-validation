import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPassword,
})

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err: any) {
      let errorMessage = err?.message || 'Failed to send reset email'
      if (typeof errorMessage === 'object' || errorMessage === '{}') {
        errorMessage = 'Too many attempts or server error. Please try again later.'
      } else if (errorMessage.toLowerCase().includes('rate limit')) {
        errorMessage = 'Too many attempts. Please wait a few minutes.'
      }
      setError(errorMessage)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-xl p-8 border border-border text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-muted-foreground mb-6">
            If an account exists for {email}, we've sent instructions to reset your password.
          </p>
          <Link to="/auth/login" className="text-primary hover:underline font-medium">
            Return to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
          <p className="text-muted-foreground mt-2">Enter your email and we'll send you a reset link</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 transition"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link to="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

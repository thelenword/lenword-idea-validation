import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export const Route = createFileRoute('/auth/verify-email')({
  component: VerifyEmail,
})

function VerifyEmail() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase automatically handles the access_token in the URL hash 
    // and stores the session when the user clicks the verification link.
    // We just need to check if we have a session.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('success')
        setTimeout(() => {
          navigate({ to: '/app/dashboard' })
        }, 3000)
      } else {
        // Wait a brief moment as the event might still be processing
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            setStatus('success')
            setTimeout(() => navigate({ to: '/app/dashboard' }), 3000)
          }
        })
        
        setTimeout(() => {
          if (status === 'verifying') setStatus('error')
        }, 5000)

        return () => subscription.unsubscribe()
      }
    }
    
    checkSession()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-border text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Email...</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h1>
            <p className="text-muted-foreground mb-6">Your email has been successfully verified. Redirecting you to the dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✕
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">We couldn't verify your email. The link might be invalid or expired.</p>
            <Link to="/auth/login" className="bg-primary text-white py-2.5 px-6 rounded-xl font-medium hover:bg-primary/90 transition inline-block">
              Return to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

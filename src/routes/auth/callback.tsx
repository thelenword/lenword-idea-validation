import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '../../lib/supabase'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleSignInSuccess = async () => {
      const pendingReportId = localStorage.getItem('pending_report_id')
      if (pendingReportId) {
        try {
          const { apiFetch } = await import('../../lib/api')
          await apiFetch('/api/claim-report', {
            method: 'POST',
            body: JSON.stringify({ report_id: pendingReportId })
          })
          localStorage.removeItem('pending_report_id')
          navigate({ to: '/app/reports/$reportId', params: { reportId: pendingReportId } })
          return
        } catch (err) {
          console.error('Failed to claim report:', err)
        }
      }
      navigate({ to: '/app/dashboard' })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        handleSignInSuccess()
      }
    })
    
    // Also check session directly in case the event already fired
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSignInSuccess()
      } else {
        // If no session after a delay, they might have cancelled or failed
        setTimeout(() => {
          navigate({ to: '/auth/login' })
        }, 3000)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-medium text-foreground">Completing sign in...</h2>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we log you in.</p>
      </div>
    </div>
  )
}

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Mail, ArrowRight, RefreshCw, ShieldCheck, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export const Route = createFileRoute('/auth/verify-email')({
  component: VerifyEmail,
})

function VerifyEmail() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [countdown, setCountdown] = useState(3)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const navigate = useNavigate()
  const statusRef = useRef(status)
  statusRef.current = status

  // Countdown timer after success — redirect to dashboard
  useEffect(() => {
    if (status !== 'success') return
    if (countdown <= 0) {
      navigate({ to: '/app/dashboard' })
      return
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [status, countdown, navigate])

  // Elapsed time counter while verifying
  useEffect(() => {
    if (status !== 'verifying') return
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [status])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    // Listen for auth state changes (fires when Supabase processes the token from URL hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        setStatus('success')
        statusRef.current = 'success'
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }
    })

    // Check if there's already a valid session (token already processed from URL hash)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('success')
        statusRef.current = 'success'
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }
    }

    checkSession()

    // Extended timeout: 120 seconds (2 minutes) to give user plenty of time
    // If user navigated here without clicking the email link, this will eventually show error
    timeoutId = setTimeout(() => {
      if (statusRef.current === 'verifying') {
        setStatus('error')
      }
    }, 120_000)

    return () => {
      subscription.unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Aurora background blobs */}
      <div className="absolute inset-0 aurora-bg opacity-60 pointer-events-none" />
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl animate-blob pointer-events-none"
        style={{ background: 'var(--blob-a-from)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl animate-blob pointer-events-none"
        style={{ background: 'var(--blob-b-from)', animationDelay: '-7s' }}
      />

      <AnimatePresence mode="wait">
        {/* ───────────── VERIFYING STATE ───────────── */}
        {status === 'verifying' && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md glass-card rounded-3xl p-10 text-center relative z-10"
          >
            {/* Animated mail icon */}
            <div className="relative mx-auto mb-6 w-20 h-20">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Mail className="w-9 h-9 text-white" />
              </motion.div>
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ border: '2px solid var(--primary)' }}
                animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2 font-heading">
              Verifying your email
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Waiting for you to click the verification link in your email. This page will update automatically.
            </p>

            {/* Elapsed time */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-5">
              <Clock className="w-3.5 h-3.5" />
              <span>Waiting {formatTime(elapsedSeconds)}</span>
            </div>

            {/* Animated progress dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: 'var(--primary)' }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>

            {/* Helpful tips */}
            <div className="space-y-2 text-left">
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-background/50 border border-border/50">
                <span className="text-base mt-0.5">📧</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Check your <strong>inbox</strong> and <strong>spam/junk</strong> folder for the verification email from Supabase.
                </p>
              </div>
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-background/50 border border-border/50">
                <span className="text-base mt-0.5">🔗</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  After clicking the link, you'll be redirected back here automatically.
                </p>
              </div>
            </div>

            {/* Go back to signup to resend */}
            <p className="mt-6 text-xs text-muted-foreground">
              Didn't receive the email?{' '}
              <Link to="/auth/signup" className="text-primary hover:underline font-medium">
                Sign up again
              </Link>
            </p>
          </motion.div>
        )}

        {/* ───────────── SUCCESS STATE ───────────── */}
        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md glass-card rounded-3xl p-10 text-center relative z-10"
          >
            {/* Success icon with burst animation */}
            <div className="relative mx-auto mb-6 w-20 h-20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--success), #10b981)' }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.35 }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              {/* Success burst rings */}
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid var(--success)' }}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.2, ease: 'easeOut' }}
                />
              ))}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-2 font-heading"
            >
              Email Verified!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm leading-relaxed mb-6"
            >
              Your account is all set. Redirecting you to the dashboard in{' '}
              <span className="font-semibold text-foreground">{countdown}s</span>...
            </motion.p>

            {/* Security badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>Securely verified</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Link
                to="/app/dashboard"
                className="inline-flex items-center gap-2 btn-primary text-sm font-medium py-2.5 px-6 rounded-xl"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* ───────────── ERROR STATE ───────────── */}
        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md glass-card rounded-3xl p-10 text-center relative z-10"
          >
            {/* Error icon */}
            <div className="relative mx-auto mb-6 w-20 h-20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                >
                  <XCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground mb-2 font-heading"
            >
              Verification Failed
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm leading-relaxed mb-8"
            >
              We couldn't verify your email. The link may have expired, or the verification email was not sent. Please try signing up again.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={() => {
                  setStatus('verifying')
                  statusRef.current = 'verifying'
                  setElapsedSeconds(0)
                  // Retry by re-checking session
                  supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session) {
                      setStatus('success')
                      statusRef.current = 'success'
                    } else {
                      // Give another 2 minutes
                      setTimeout(() => {
                        if (statusRef.current === 'verifying') setStatus('error')
                      }, 120_000)
                    }
                  })
                }}
                className="inline-flex items-center justify-center gap-2 btn-primary text-sm font-medium py-2.5 px-6 rounded-xl"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link
                to="/auth/signup"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors py-2.5 px-6 rounded-xl border border-border hover:border-primary/30"
              >
                Sign Up Again
              </Link>
              <Link
                to="/auth/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Return to Login
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

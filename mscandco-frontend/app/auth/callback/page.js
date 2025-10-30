'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()

        // Check for authentication type
        const type = searchParams.get('type')
        const code = searchParams.get('code')

        // Handle password recovery (reset)
        if (type === 'recovery') {
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) {
              console.error('Recovery error:', error)
              router.push('/login?error=recovery_failed')
              return
            }
          }
          // Redirect to password reset page (user is now authenticated)
          router.push('/reset-password')
          return
        }

        // Handle email change confirmation
        if (type === 'email_change') {
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) {
              console.error('Email change error:', error)
              router.push('/change-email?error=confirmation_failed')
              return
            }
          }
          // Redirect to email change confirmation page
          router.push('/change-email')
          return
        }

        // Handle magic link (passwordless login)
        if (type === 'magiclink') {
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) {
              console.error('Magic link error:', error)
              router.push('/login?error=magic_link_failed')
              return
            }
          }
          // Redirect to dashboard (user is now logged in)
          router.push('/dashboard')
          return
        }

        // Handle standard email verification (signup confirmation)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error('Verification error:', error)
            router.push('/login?error=verification_failed')
            return
          }
        }

        // Get the session after email verification
        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          router.push('/login?error=verification_failed')
          return
        }

        if (data.session) {
          const user = data.session.user
          console.log('Email verified successfully for user:', user.email)

          // Check if this is an invited user (has metadata from invitation)
          const isInvitedUser = user.user_metadata?.invited_by || user.app_metadata?.invited_by

          if (isInvitedUser) {
            // Invited user - keep them logged in and go to dashboard
            router.push('/dashboard?welcome=true')
          } else {
            // Regular signup - sign out and redirect to login
            await supabase.auth.signOut()
            router.push('/login?verified=true')
          }
        } else {
          // No session found, redirect to login
          router.push('/login?message=please_login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=verification_failed')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
        <p className="text-gray-600">
          Please wait while we verify your email address...
        </p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">
            Please wait...
          </p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}


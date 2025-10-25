'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()
        
        // Get the session after email verification
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Verification error:', error)
          router.push('/register?error=verification_failed')
          return
        }

        if (data.session) {
          const user = data.session.user
          const userRole = user.user_metadata?.role || 'artist'

          console.log('Email verified successfully for user:', user.email)

          // Wait for session to propagate
          await new Promise(resolve => setTimeout(resolve, 500))

          // Check if profile is completed
          if (!user.user_metadata?.profile_completed) {
            // Redirect to complete profile based on role
            router.push(`/${userRole}/complete-profile`)
          } else {
            // Profile already completed, go to dashboard
            router.push('/dashboard')
          }
        } else {
          // No session found, redirect to login
          router.push('/login?message=please_login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/register?error=verification_failed')
      }
    }

    handleAuthCallback()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
        <p className="text-gray-600">
          Please wait while we verify your email address and set up your account...
        </p>
      </div>
    </div>
  )
}


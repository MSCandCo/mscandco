'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
        
        // Check if we have hash tokens (magic link authentication)
        const hasHashTokens = typeof window !== 'undefined' && 
                              window.location.hash && 
                              (window.location.hash.includes('access_token') || 
                               window.location.hash.includes('code'))
        
        // If we have hash tokens but no type, assume it's a magic link
        const isMagicLink = type === 'magiclink' || (hasHashTokens && !type && !code)
        
        console.log('🔍 Auth callback debug:', {
          type,
          code: code ? 'present' : 'missing',
          hasHashTokens,
          isMagicLink,
          pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          hash: typeof window !== 'undefined' ? window.location.hash.substring(0, 50) + '...' : 'none'
        })

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
        if (isMagicLink) {
          console.log('🔐 Handling magic link authentication...')
          
          // Supabase magic links put tokens in the URL hash (fragment), not query params
          // The Supabase client automatically processes hash-based tokens on initialization
          // We need to wait for it to process and then check the session
          
          // Check for code in query params (some flows use this)
          const code = searchParams.get('code')
          
          if (code) {
            console.log('🔐 Exchanging code for session...')
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) {
              console.error('❌ Magic link code exchange error:', error)
              router.push('/login?error=magic_link_failed')
              return
            }
          } else {
            // No code - tokens should be in the hash
            // Supabase client processes hash automatically, but we need to wait
            console.log('🔐 Waiting for Supabase client to process hash tokens...')
            
            // Wait for the client to process the hash tokens
            // Retry getting session a few times as it may take a moment
            let sessionRetries = 0
            let session = null
            const maxRetries = 10
            
            while (sessionRetries < maxRetries && !session) {
              const { data: sessionData } = await supabase.auth.getSession()
              
              if (sessionData?.session) {
                session = sessionData.session
                console.log(`✅ Session established after ${sessionRetries + 1} attempt(s)`)
                break
              }
              
              sessionRetries++
              if (sessionRetries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 300))
              }
            }
            
            if (!session) {
              console.error('❌ No session after processing hash tokens')
              // Try to manually parse hash if available
              if (typeof window !== 'undefined' && window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                const accessToken = hashParams.get('access_token')
                const refreshToken = hashParams.get('refresh_token')
                
                if (accessToken && refreshToken) {
                  console.log('🔐 Setting session from hash tokens...')
                  const { error: setError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                  })
                  
                  if (setError) {
                    console.error('❌ Error setting session from hash:', setError)
                    router.push('/login?error=magic_link_failed')
                    return
                  }
                } else {
                  router.push('/login?error=magic_link_failed')
                  return
                }
              } else {
                router.push('/login?error=magic_link_failed')
                return
              }
            }
          }
          
          // Final session check
          const { data: { session: finalSession }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !finalSession) {
            console.error('❌ Final session check failed:', sessionError)
            router.push('/login?error=magic_link_failed')
            return
          }
          
          console.log('✅ Magic link authentication successful for user:', finalSession.user.email)
          
          // Determine redirect based on user role - all users go to Apollo AI by default
          const userRole = finalSession.user.user_metadata?.role || 
                          finalSession.user.app_metadata?.role
          
          let redirectTo = '/ai'
          
          // All users go to Apollo AI by default
          // Admins can access their dashboards via "Use Regular Version" button
          
          // Check if we have a redirect parameter in URL (for ghost login)
          const urlRedirect = searchParams.get('redirect')
          if (urlRedirect) {
            redirectTo = urlRedirect
          }
          
          console.log('🚀 Redirecting user to:', redirectTo, 'Role:', userRole)
          
          // Wait a bit longer to ensure session cookies are set and permissions can load
          // This is especially important for ghost login where permissions need to be fetched
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Use window.location.href for hard redirect to ensure fresh page load with new session
          window.location.href = redirectTo
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


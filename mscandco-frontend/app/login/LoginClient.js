/**
 * Login Page - App Router Version
 *
 * This replaces the old Pages Router login page
 * Uses App Router for consistency with dashboard
 */

'use client'

// Client component moved to separate file

// Note: Metadata for client components should be in a parent server component
// For now, this will use the default from layout

import { useState, useEffect, useMemo, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react'
import MfaChallengeModal from '@/components/auth/MfaChallengeModal'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  // MFA Challenge state
  const [showMfaChallenge, setShowMfaChallenge] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState(null)
  const [mfaError, setMfaError] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)

  // Create Supabase client once per component instance
  const supabase = useMemo(() => {
    console.log('🔧 Creating Supabase client...')
    const client = createClient()
    console.log('🔧 Supabase client created successfully')
    return client
  }, [])
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Debug: Log client creation
  useEffect(() => {
    console.log('🔧 Login component mounted')
    console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('🔧 Supabase client exists:', !!supabase)
  }, [supabase])

  // Check for email verification success and session expiration
  useEffect(() => {
    // Skip session check if user just logged out
    const loggedOut = searchParams.get('loggedOut') === 'true'
    if (loggedOut) {
      console.log('🚪 User just logged out, skipping session check')
      return
    }

    // Check if user is already logged in - redirect to dashboard
    const checkExistingSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.log('⚠️ Session check error (this is normal if not logged in):', sessionError.message)
          return
        }

        if (sessionData?.session?.user) {
          console.log('✅ User already logged in, fetching role for redirect...')

          // Fetch user role for proper redirect - handle errors gracefully
          let userRole = null
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', sessionData.session.user.id)
              .maybeSingle()

            if (profileError && profileError.code !== 'PGRST116') {
              console.warn('⚠️ Profile fetch warning (using metadata fallback):', profileError.message)
            }

            // Determine role with fallbacks
            userRole = profile?.role ||
                        sessionData.session.user.user_metadata?.role ||
                        sessionData.session.user.app_metadata?.role
          } catch (profileError) {
            console.warn('⚠️ Profile fetch error (using metadata fallback):', profileError)
            // Use metadata as fallback
            userRole = sessionData.session.user.user_metadata?.role ||
                      sessionData.session.user.app_metadata?.role
          }

          // Determine redirect based on role - all users go to Apollo AI by default
          let redirectTo = '/ai'
          // Admins can still access their dashboards via "Use Regular Version" button

          console.log(`✅ Redirecting ${userRole || 'user'} to: ${redirectTo}`)
          window.location.href = redirectTo
          return
        }
      } catch (error) {
        console.error('❌ Error checking session:', error)
        // Don't redirect on error, let user stay on login page
        // This is normal if there's no session
      }
    }
    
    // Only check session if user didn't just log out
    if (!loggedOut) {
      checkExistingSession()
    }

    if (searchParams.get('verified') === 'true') {
      setEmailVerified(true)
      // Auto-hide after 10 seconds
      setTimeout(() => setEmailVerified(false), 10000)
    }

    if (searchParams.get('error') === 'verification_failed') {
      setError('Email verification failed. Please try again or contact support.')
    }

    if (searchParams.get('error') === 'profile_not_found') {
      setError('Your profile could not be found. Please contact support.')
    }

    if (searchParams.get('session_expired') === 'true') {
      setError('Your session has expired. Please log in again.')
    }

    if (searchParams.get('reason') === 'inactivity') {
      setError('You were logged out due to inactivity. Please log in again.')
    }
  }, [searchParams, supabase, router])

  // Check if the error is about unconfirmed email
  const isEmailNotConfirmed = error && (
    error.toLowerCase().includes('email not confirmed') ||
    error.toLowerCase().includes('email confirmation')
  )

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('🚀 handleLogin called')
    setLoading(true)
    setError('')
    setResendSuccess(false)

    console.log('🔧 Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })

    // Verify Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase environment variables not configured')
      console.error('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.error('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'exists' : 'missing')
      setError('Configuration error. Please contact support.')
      setLoading(false)
      return
    }


    // Add timeout to prevent infinite loading (60s to accommodate slow connections)
    const timeoutId = setTimeout(() => {
      console.error('⏱️ Login timeout - taking too long')
      setError('Login is taking too long. Please check your connection and try again.')
      setLoading(false)
    }, 60000) // 60 second timeout

    try {
      console.log('🔐 Attempting login for:', email)
      console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing')
      console.log('🔧 Environment:', process.env.NODE_ENV || 'unknown')
      console.log('🔧 Supabase client exists:', !!supabase)
      
      console.log('⏳ Calling Supabase signInWithPassword...')
      
      // Simplified login - just call Supabase directly
      console.log('🔐 Calling signInWithPassword for:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('✅ SignInWithPassword response:', { 
        hasData: !!data, 
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.code,
        hasUser: !!data?.user,
        hasSession: !!data?.session
      })

      if (error) {
        clearTimeout(timeoutId)
        console.error('❌ Login error:', error)
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name
        })
        
        // Check if MFA is required
        if (error.message?.includes('MFA') || error.message?.includes('factor')) {
          // Get MFA factors
          const { data: factorsData } = await supabase.auth.mfa.listFactors()
          if (factorsData?.totp && factorsData.totp.length > 0) {
            setMfaFactorId(factorsData.totp[0].id)
            setShowMfaChallenge(true)
            setLoading(false)
            return
          }
        }

        // Provide more helpful error messages
        let errorMessage = error.message || 'Login failed. Please check your credentials.'
        
        // Handle specific error cases
        if (error.status === 400) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.status === 429) {
          errorMessage = 'Too many login attempts. Please wait a few minutes and try again.'
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in. Check your inbox for the confirmation email.'
        } else if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        }

        setError(errorMessage)
        setLoading(false)
        return
      }

      if (!data?.user) {
        clearTimeout(timeoutId)
        console.error('❌ No user data returned')
        setError('Login failed. Please try again.')
        setLoading(false)
        return
      }

      console.log('✅ Login successful, verifying session before redirect...')

      // Check if MFA is enabled but not yet challenged
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      if (factorsData?.totp && factorsData.totp.length > 0) {
        clearTimeout(timeoutId)
        // MFA is enabled, show challenge
        setMfaFactorId(factorsData.totp[0].id)
        setShowMfaChallenge(true)
        setLoading(false)
        return
      }

      // Get session - single attempt
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !sessionData?.session) {
        clearTimeout(timeoutId)
        console.error('❌ Session error:', sessionError)
        setError('Session could not be established. Please try again.')
        setLoading(false)
        return
      }

      const session = sessionData.session
      console.log('✅ Session confirmed')

      // Fetch user profile - single attempt
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('⚠️ Profile fetch warning:', profileError.message)
      }

      // Determine role with fallbacks
      const userRole = profile?.role || 
                      session.user.user_metadata?.role || 
                      session.user.app_metadata?.role

      // Determine redirect based on role - all users go to Apollo AI by default
      let redirectTo = searchParams.get('redirectedFrom')

      if (!redirectTo) {
        // All users go to Apollo AI by default
        redirectTo = '/ai'
      }

      console.log(`🚀 Redirecting ${userRole || 'user'} to: ${redirectTo}`)
      clearTimeout(timeoutId)
      setLoading(false) // Clear loading state before redirect

      // Small delay to ensure SupabaseProvider updates state
      await new Promise(resolve => setTimeout(resolve, 100))

      // Use window.location.href for reliable redirect (forces full page reload with fresh session)
      console.log('🔄 Performing redirect to:', redirectTo)
      window.location.href = redirectTo
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('❌ Login exception:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleMfaVerify = async (code, isRecoveryCode) => {
    setMfaLoading(true)
    setMfaError('')

    try {
      if (isRecoveryCode) {
        // Handle recovery code verification
        // Recovery codes should be verified via a server-side API endpoint
        // For now, show an error that recovery codes need to be implemented server-side
        setMfaError('Recovery code verification is not yet available. Please use your authenticator app.')
        setMfaLoading(false)
        return
      } else {
        // Handle TOTP verification
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: mfaFactorId,
          code: code
        })

        if (error) {
          setMfaError(error.message || 'Invalid verification code')
          setMfaLoading(false)
          return
        }

        // Get session after MFA
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !sessionData?.session) {
          console.error('❌ Session not available after MFA verification')
          setMfaError('Session could not be established. Please try again.')
          setMfaLoading(false)
          return
        }

        const session = sessionData.session
        console.log('✅ MFA verified, session confirmed, fetching user role...')

        // Fetch user profile to determine role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()
        
        // Determine role with fallbacks
        const userRole = profile?.role || 
                        session.user.user_metadata?.role || 
                        session.user.app_metadata?.role
        
        // Determine redirect based on role - all users go to Apollo AI by default
        let redirectTo = searchParams.get('redirectedFrom')
        
        if (!redirectTo) {
          // All users go to Apollo AI by default
          redirectTo = '/ai'
        }
        
        console.log(`✅ Redirecting ${userRole || 'user'} to: ${redirectTo}`)
        
        // Small delay to ensure SupabaseProvider updates state
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Use window.location.href for full page reload with fresh session
        window.location.href = redirectTo
      }
    } catch (err) {
      console.error('MFA verification error:', err)
      setMfaError('An unexpected error occurred')
      setMfaLoading(false)
    }
  }

  const handleMfaCancel = () => {
    setShowMfaChallenge(false)
    setMfaError('')
    setMfaFactorId(null)
    setLoading(false)
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setResendingEmail(true)
    setResendSuccess(false)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        setError('Failed to resend confirmation email. Please try again.')
        setResendingEmail(false)
        return
      }

      setResendSuccess(true)
      setResendingEmail(false)
    } catch (err) {
      setError('An unexpected error occurred while resending the email')
      setResendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#1f2937] rounded-xl flex items-center justify-center mb-6">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#1f2937] mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-xl mb-2">
            Sign In and Access
          </p>
          <p className="text-gray-600 text-xl">
            your Music Distribution Platform
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200 mx-auto max-w-5xl">
          <div className="flex flex-col items-center">
            <form className="space-y-8 w-full max-w-2xl" onSubmit={handleLogin}>
              {/* Email Verified Success Message */}
              {emailVerified && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 shadow-sm animate-fade-in">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-green-900 text-lg font-bold mb-2">
                        Email Verified Successfully!
                      </h3>
                      <p className="text-green-800 text-sm mb-3">
                        Your email address has been verified. You can now log in to access your account and start distributing your music.
                      </p>
                      <div className="flex items-center gap-2 text-green-700 text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                        <span>Enter your credentials below to continue</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-amber-900 text-sm font-medium">{error}</p>
                      {isEmailNotConfirmed && (
                        <p className="text-amber-700 text-xs mt-1">
                          Please check your inbox or request a new confirmation email below.
                        </p>
                      )}
                    </div>
                  </div>
                  {isEmailNotConfirmed && (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resendingEmail}
                      className="w-full bg-[#1f2937] text-white border border-[#1f2937] rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300 hover:bg-white hover:text-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1f2937] disabled:hover:text-white flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${resendingEmail ? 'animate-spin' : ''}`} />
                      {resendingEmail ? 'Sending...' : 'Resend Confirmation Email'}
                    </button>
                  )}
                </div>
              )}

              {resendSuccess && (
                <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-emerald-900 text-sm font-medium">
                      Confirmation email sent! Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="text-center flex flex-col items-center">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-900"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="text-center flex flex-col items-center">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-12 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-900"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1f2937] text-white border border-[#1f2937] rounded-xl px-8 py-4 font-bold text-lg shadow-lg transition-all duration-300 hover:bg-white hover:text-[#1f2937] hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center"
              >
                {loading ? 'Signing in...' : 'Sign In to Your Account'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </button>
            </form>
          </div>

          {/* Contact Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center max-w-lg mx-auto">
            <p className="text-gray-600">
              Need an account? Contact{' '}
              <a
                href="mailto:info@mscandco.com"
                className="font-semibold text-[#1f2937] hover:text-gray-700 transition-colors duration-300 underline decoration-2 underline-offset-2 hover:decoration-gray-700"
              >
                info@mscandco.com
              </a>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            🔒 Secure authentication powered by Supabase
          </p>
        </div>
      
        {/* MFA Challenge Modal */}
        <MfaChallengeModal
          isOpen={showMfaChallenge}
          onVerify={handleMfaVerify}
          onCancel={handleMfaCancel}
          loading={mfaLoading}
          error={mfaError}
        />
</div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#1f2937'}}></div></div>}>
      <LoginPageContent />
    </Suspense>
  )
}






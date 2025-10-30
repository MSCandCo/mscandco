/**
 * Login Page - App Router Version
 *
 * This replaces the old Pages Router login page
 * Uses App Router for consistency with dashboard
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for email verification success
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setEmailVerified(true)
      // Auto-hide after 10 seconds
      setTimeout(() => setEmailVerified(false), 10000)
    }

    if (searchParams.get('error') === 'verification_failed') {
      setError('Email verification failed. Please try again or contact support.')
    }
  }, [searchParams])

  // Check if the error is about unconfirmed email
  const isEmailNotConfirmed = error && (
    error.toLowerCase().includes('email not confirmed') ||
    error.toLowerCase().includes('email confirmation')
  )

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResendSuccess(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Immediate redirect - no waiting
        router.push('/dashboard')
        router.refresh() // Force router refresh for instant navigation
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
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
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>}>
      <LoginPageContent />
    </Suspense>
  )
}






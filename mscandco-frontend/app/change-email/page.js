/**
 * Change Email Confirmation Page - App Router Version
 *
 * Handles email change confirmation from email link
 * Validates token and confirms the new email address
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

export default function ChangeEmailPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newEmail, setNewEmail] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const handleEmailChange = async () => {
      try {
        // Get the current session after email change confirmation
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Failed to verify email change. The link may be invalid or expired.')
          setLoading(false)
          return
        }

        if (!sessionData.session) {
          setError('No active session found. Please log in to confirm your email change.')
          setLoading(false)
          return
        }

        // Get user data to confirm email was changed
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error('User error:', userError)
          setError('Failed to retrieve user information.')
          setLoading(false)
          return
        }

        if (userData.user) {
          setNewEmail(userData.user.email)
          setSuccess(true)
          setLoading(false)

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard?message=email_changed')
          }, 3000)
        } else {
          setError('Unable to verify email change. Please try again.')
          setLoading(false)
        }
      } catch (err) {
        console.error('Email change error:', err)
        setError('An unexpected error occurred while confirming your email change.')
        setLoading(false)
      }
    }

    handleEmailChange()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937] mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirming Email Change...</h2>
            <p className="text-gray-600 text-sm">
              Please wait while we verify your new email address
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1f2937] mb-2">
              Email Change Failed
            </h1>
            <p className="text-gray-600">
              We couldn't confirm your email change
            </p>
          </div>

          {/* Error Card */}
          <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-900 text-sm font-medium mb-2">{error}</p>
                  <p className="text-red-700 text-xs">
                    The confirmation link may have expired or already been used.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-[#1f2937] text-white border border-[#1f2937] rounded-xl px-8 py-3 font-bold shadow-lg transition-all duration-300 hover:bg-white hover:text-[#1f2937] hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 flex items-center justify-center"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-white text-[#1f2937] border-2 border-gray-300 rounded-xl px-8 py-3 font-semibold transition-all duration-300 hover:border-[#1f2937] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2"
              >
                Return to Login
              </button>
            </div>
          </div>

          {/* Contact Support */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a
                href="mailto:support@mscandco.com"
                className="font-semibold text-[#1f2937] hover:text-gray-700 underline decoration-2 underline-offset-2"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1f2937] mb-2">
              Email Changed Successfully!
            </h1>
            <p className="text-gray-600">
              Your email address has been updated
            </p>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200">
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-900 text-sm font-medium mb-2">
                    Your email address has been successfully changed.
                  </p>
                  {newEmail && (
                    <div className="bg-white rounded-md px-3 py-2 mt-3">
                      <p className="text-xs text-gray-600 mb-1">New Email Address:</p>
                      <p className="text-sm font-semibold text-gray-900">{newEmail}</p>
                    </div>
                  )}
                  <p className="text-green-700 text-xs mt-3">
                    Use this email address for all future logins.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-4">
                Redirecting to your dashboard in 3 seconds...
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-[#1f2937] font-semibold text-sm hover:underline"
              >
                Go to Dashboard Now →
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-amber-600 text-lg flex-shrink-0">🔐</span>
              <div>
                <p className="text-amber-900 text-sm font-semibold mb-1">
                  Security Reminder
                </p>
                <p className="text-amber-800 text-xs leading-relaxed">
                  If you didn't request this email change, please contact support immediately at{' '}
                  <a
                    href="mailto:support@mscandco.com"
                    className="font-semibold underline"
                  >
                    support@mscandco.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

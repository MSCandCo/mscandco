/**
 * Password Reset Page - App Router Version
 *
 * Handles password reset flow from email link
 * Validates token and allows user to set new password
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          setError('Invalid or expired reset link. Please request a new password reset.')
          setTokenValid(false)
        } else {
          setTokenValid(true)
        }
      } catch (err) {
        setError('An error occurred while validating your reset link.')
        setTokenValid(false)
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [])

  const validatePassword = () => {
    if (!password) {
      setError('Password is required')
      return false
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!validatePassword()) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?message=password_reset_success')
      }, 3000)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937] mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900">Validating Reset Link...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1f2937] mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-gray-600">
              This password reset link is invalid or has expired
            </p>
          </div>

          {/* Error Card */}
          <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-6">
              <p className="text-red-900 text-sm font-medium">{error}</p>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-[#1f2937] text-white border border-[#1f2937] rounded-xl px-8 py-4 font-bold text-lg shadow-lg transition-all duration-300 hover:bg-white hover:text-[#1f2937] hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 flex items-center justify-center"
            >
              Return to Login
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
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
              Password Reset Successful!
            </h1>
            <p className="text-gray-600">
              Your password has been updated
            </p>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200">
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-900 text-sm font-medium mb-2">
                    Your password has been successfully reset.
                  </p>
                  <p className="text-green-700 text-xs">
                    You can now log in with your new password.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-600 text-sm">
              Redirecting to login page in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#1f2937] rounded-xl flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1f2937] mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Reset Form Card */}
        <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200">
          <form className="space-y-6" onSubmit={handleResetPassword}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-900 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-900"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 placeholder-gray-400 text-gray-900"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1f2937] text-white border border-[#1f2937] rounded-xl px-8 py-4 font-bold text-lg shadow-lg transition-all duration-300 hover:bg-white hover:text-[#1f2937] hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:bg-[#1f2937] disabled:hover:text-white flex items-center justify-center"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>
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

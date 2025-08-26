import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '@/components/providers/SupabaseProvider'
import { supabase } from '@/lib/supabase'
import MainLayout from '@/components/layouts/mainLayout'
import SEO from '@/components/seo'
import { Button } from 'flowbite-react'

export default function RegisterPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('artist')
  const [step, setStep] = useState('register') // 'register' or 'verify'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check for error in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    
    if (errorParam === 'verification_failed') {
      setError('Email verification failed. Please try registering again.')
    }
  }, [])

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return false
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    
    return true
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            role,
            profile_completed: false
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }
      
      console.log('Registration successful, moving to verification step')
      
      // Move to verification step
      setStep('verify')
      
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      alert('Verification email sent! Please check your inbox.')
      
    } catch (error) {
      setError(error.message || 'Failed to resend verification email')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <SEO pageTitle="Register" />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937]"></div>
        </div>
      </MainLayout>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <MainLayout>
      <SEO pageTitle="Create Account - MSC & Co" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          
          {step === 'register' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                <p className="text-gray-600 mt-2">Join the music distribution platform</p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="artist">Artist</option>
                    <option value="label_admin">Label Admin</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1f2937] hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in here
                  </a>
                </p>
              </div>
            </>
          )}
          
          {step === 'verify' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-4">
                  We sent a verification link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Click the link in your email to verify your account, then you'll be automatically redirected to complete your profile.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-[#1f2937] hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Continue to Login
                </Button>
                
                <button
                  onClick={resendVerification}
                  disabled={loading}
                  className="w-full text-blue-600 hover:text-blue-500 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                
                <button
                  onClick={() => setStep('register')}
                  className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  ← Back to Registration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
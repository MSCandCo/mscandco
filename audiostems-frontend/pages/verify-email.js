import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '@/components/providers/SupabaseProvider'
import { supabase } from '@/lib/supabase'
import MainLayout from '@/components/layouts/mainLayout'
import SEO from '@/components/seo'
import { Button } from 'flowbite-react'

export default function VerifyEmailPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!isLoading && !user) {
      router.push('/login?message=please_login')
      return
    }
    
    // If user is logged in and email is verified, redirect to dashboard
    if (user && user.email_confirmed_at) {
      const userRole = user.user_metadata?.role || 'artist'
      router.push(`/${userRole}/dashboard`)
    }
  }, [user, isLoading, router])

  const resendVerification = async () => {
    if (!user?.email) {
      setError('No email address found. Please try logging in again.')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      setMessage('Verification email sent! Please check your inbox and spam folder.')
      
    } catch (error) {
      console.error('Resend verification error:', error)
      setError(error.message || 'Failed to resend verification email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <SEO pageTitle="Verify Email" />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937]"></div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <MainLayout>
      <SEO pageTitle="Verify Your Email - MSC & Co" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verification Required</h1>
            <p className="text-gray-600">
              Please verify your email address to access your dashboard
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-blue-700 text-sm mt-2">
              We sent a verification link to this email address. Please check your inbox and spam folder.
            </p>
          </div>
          
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <Button
              onClick={resendVerification}
              disabled={loading}
              className="w-full bg-[#1f2937] hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Already verified your email? Try refreshing this page or logging in again.
              </p>
              
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Sign Out & Try Different Account
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                Need help? Contact our support team
              </p>
              <a 
                href="/support" 
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Get Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
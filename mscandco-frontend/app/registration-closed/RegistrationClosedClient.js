'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function RegistrationClosedClient() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleJoinWaitlist = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      setSuccess(true)
      setEmail('')
      setName('')

    } catch (err) {
      console.error('Error joining waitlist:', err)
      setError(err.message || 'Failed to join waitlist. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-12 text-center">
            <div className="mx-auto h-20 w-20 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Registration Currently Closed
            </h1>
            <p className="text-xl text-gray-200">
              We are not accepting new users at this time
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            {success ? (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  You're on the waitlist!
                </h2>
                <p className="text-gray-600 mb-6">
                  We'll notify you at <strong>{email}</strong> when registration opens again.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add another email
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <p className="text-lg text-gray-700 mb-4">
                    We're currently focusing on providing the best experience for our existing users.
                  </p>
                  <p className="text-gray-600 mb-6">
                    Join our waitlist below, and we'll notify you as soon as we're ready to welcome new members.
                  </p>
                </div>

                {/* Waitlist Form */}
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Join the Waitlist
                  </h2>

                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleJoinWaitlist} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name (Optional)
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Joining Waitlist...
                        </>
                      ) : (
                        'Join Waitlist'
                      )}
                    </button>
                  </form>

                  <p className="mt-4 text-sm text-gray-500 text-center">
                    We respect your privacy. Your email will only be used to notify you when registration opens.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-gray-900 hover:text-gray-700 underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


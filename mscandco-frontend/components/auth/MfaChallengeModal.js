'use client'

import { useState, useRef, useEffect } from 'react'
import { Shield, Loader2, AlertTriangle, Key } from 'lucide-react'

/**
 * MFA Challenge Modal
 *
 * Prompts user for TOTP code or recovery code during login
 * when MFA is enabled on their account
 */
export default function MfaChallengeModal({
  isOpen,
  onVerify,
  onCancel,
  loading = false,
  error = ''
}) {
  const [code, setCode] = useState('')
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    // Clear code when switching between TOTP and recovery
    setCode('')
  }, [useRecoveryCode])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.length === (useRecoveryCode ? 8 : 6)) {
      onVerify(code, useRecoveryCode)
    }
  }

  const handleCodeChange = (value) => {
    // Only allow numbers for TOTP, alphanumeric for recovery codes
    const cleaned = useRecoveryCode
      ? value.replace(/[^a-z0-9]/gi, '').toUpperCase()
      : value.replace(/\D/g, '')

    const maxLength = useRecoveryCode ? 8 : 6
    setCode(cleaned.slice(0, maxLength))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {useRecoveryCode ? (
              <Key className="w-8 h-8 text-blue-600" />
            ) : (
              <Shield className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {useRecoveryCode ? 'Recovery Code' : 'Two-Factor Authentication'}
          </h2>
          <p className="text-gray-600">
            {useRecoveryCode
              ? 'Enter one of your 8-character recovery codes'
              : 'Enter the 6-digit code from your authenticator app'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {useRecoveryCode ? 'Recovery Code' : 'Verification Code'}
            </label>
            <input
              ref={inputRef}
              type="text"
              inputMode={useRecoveryCode ? 'text' : 'numeric'}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={useRecoveryCode ? 'ABCD1234' : '000000'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={useRecoveryCode ? 8 : 6}
              disabled={loading}
              autoComplete="off"
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
              {useRecoveryCode
                ? '8 characters (letters and numbers)'
                : code.length}/6 digits
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== (useRecoveryCode ? 8 : 6)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </div>

          {/* Toggle between TOTP and Recovery Code */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setUseRecoveryCode(!useRecoveryCode)}
              disabled={loading}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {useRecoveryCode
                ? '← Use authenticator app instead'
                : 'Lost your device? Use recovery code →'
              }
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            {useRecoveryCode
              ? 'Recovery codes are one-time use only. After using this code, it will no longer work.'
              : 'Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code shown for this account.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

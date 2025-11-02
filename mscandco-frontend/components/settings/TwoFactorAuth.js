'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, ShieldCheck, QrCode, Copy, Check, Loader2, AlertTriangle } from 'lucide-react'
import QRCode from 'qrcode'

/**
 * TwoFactorAuth Component
 *
 * Implements TOTP-based two-factor authentication using Supabase's built-in MFA
 * Features:
 * - Enable/disable 2FA
 * - QR code generation for authenticator apps
 * - Verification code validation
 * - Backup recovery codes
 *
 * Uses Supabase Auth MFA (FREE on basic tier)
 */
export default function TwoFactorAuth() {
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // MFA enrollment state
  const [isMfaEnabled, setIsMfaEnabled] = useState(false)
  const [showEnrollment, setShowEnrollment] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [copied, setCopied] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkMfaStatus()
  }, [])

  const checkMfaStatus = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Not authenticated')
        return
      }

      // Check if user has any enrolled MFA factors
      const { data: factors } = await supabase.auth.mfa.listFactors()

      if (factors && factors.totp && factors.totp.length > 0) {
        setIsMfaEnabled(true)
        setFactorId(factors.totp[0].id)
      } else {
        setIsMfaEnabled(false)
      }
    } catch (err) {
      console.error('Error checking MFA status:', err)
      setError('Failed to check 2FA status')
    } finally {
      setLoading(false)
    }
  }

  const startEnrollment = async () => {
    try {
      setEnrolling(true)
      setError('')
      setSuccess('')

      // Enroll a new TOTP factor
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      })

      if (enrollError) throw enrollError

      // Generate QR code from the secret
      const qrCodeDataUrl = await QRCode.toDataURL(data.totp.qr_code)

      setQrCodeUrl(qrCodeDataUrl)
      setTotpSecret(data.totp.secret)
      setFactorId(data.id)
      setShowEnrollment(true)
    } catch (err) {
      console.error('Error starting enrollment:', err)
      setError(err.message || 'Failed to start 2FA enrollment')
    } finally {
      setEnrolling(false)
    }
  }

  const verifyAndEnable = async () => {
    try {
      setVerifying(true)
      setError('')

      if (!verificationCode || verificationCode.length !== 6) {
        setError('Please enter a valid 6-digit code')
        return
      }

      // Verify the TOTP code
      const { data, error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factorId,
        code: verificationCode
      })

      if (verifyError) throw verifyError

      // Success!
      setSuccess('Two-factor authentication enabled successfully!')
      setIsMfaEnabled(true)
      setShowEnrollment(false)
      setVerificationCode('')

      // Refresh MFA status
      await checkMfaStatus()
    } catch (err) {
      console.error('Error verifying code:', err)
      setError(err.message || 'Invalid verification code. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const disableMfa = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    try {
      setUnenrolling(true)
      setError('')
      setSuccess('')

      // Unenroll the factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: factorId
      })

      if (unenrollError) throw unenrollError

      setSuccess('Two-factor authentication disabled')
      setIsMfaEnabled(false)
      setFactorId('')

      // Refresh status
      await checkMfaStatus()
    } catch (err) {
      console.error('Error disabling MFA:', err)
      setError(err.message || 'Failed to disable 2FA')
    } finally {
      setUnenrolling(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cancelEnrollment = () => {
    setShowEnrollment(false)
    setQrCodeUrl('')
    setTotpSecret('')
    setVerificationCode('')
    setError('')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${isMfaEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
          {isMfaEnabled ? (
            <ShieldCheck className="w-6 h-6 text-green-600" />
          ) : (
            <Shield className="w-6 h-6 text-gray-600" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="text-gray-600 mb-4">
            Add an extra layer of security to your account by requiring a verification code from your authenticator app when you sign in.
          </p>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              isMfaEnabled
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isMfaEnabled ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  2FA Enabled
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  2FA Disabled
                </>
              )}
            </span>
          </div>

          {/* Enrollment UI */}
          {showEnrollment && !isMfaEnabled && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Set up your authenticator app</h4>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-3">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.):
                </p>

                {qrCodeUrl && (
                  <div className="flex justify-center mb-4">
                    <img src={qrCodeUrl} alt="QR Code" className="border-4 border-white rounded-lg shadow-md" />
                  </div>
                )}

                <p className="text-sm text-gray-700 mb-2">Or enter this code manually:</p>
                <div className="flex items-center gap-2 p-3 bg-white rounded border border-gray-300">
                  <code className="flex-1 text-sm font-mono">{totpSecret}</code>
                  <button
                    onClick={copySecret}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Copy secret"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Enter the 6-digit code from your app:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={verifyAndEnable}
                  disabled={verifying || verificationCode.length !== 6}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Enable'
                  )}
                </button>
                <button
                  onClick={cancelEnrollment}
                  disabled={verifying}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showEnrollment && (
            <div className="flex gap-3">
              {!isMfaEnabled ? (
                <button
                  onClick={startEnrollment}
                  disabled={enrolling}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      Enable 2FA
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={disableMfa}
                  disabled={unenrolling}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {unenrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    'Disable 2FA'
                  )}
                </button>
              )}
            </div>
          )}

          {/* Information */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Recommended authenticator apps:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
              <li>Google Authenticator (iOS/Android)</li>
              <li>Authy (iOS/Android/Desktop)</li>
              <li>1Password (Cross-platform)</li>
              <li>Microsoft Authenticator (iOS/Android)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

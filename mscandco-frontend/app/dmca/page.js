'use client'

import { useState } from 'react'
import { AlertTriangle, Shield, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

export default function DMCAPage() {
  const [formType, setFormType] = useState('takedown') // 'takedown' or 'counter'
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    address: '',
    phone: '',

    // Takedown specific
    copyrightedWorkDescription: '',
    infringingContentUrl: '',
    goodFaithStatement: '',
    signature: '',

    // Counter-notification specific
    counterJustification: '',
    consentToJurisdiction: false,
    originalNoticeId: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/dmca/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeType: formType,
          ...formData
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitted(true)
      } else {
        setError(result.error || 'Failed to submit notice')
      }
    } catch (err) {
      setError('Failed to submit notice. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Notice Submitted Successfully</h2>
              <p className="text-gray-600 mb-6">
                Your {formType === 'takedown' ? 'DMCA takedown notice' : 'counter-notification'} has been received and will be reviewed by our team. You will receive email updates about the status of your request.
              </p>
              <p className="text-sm text-gray-500">
                Reference ID: {Date.now().toString(36).toUpperCase()}
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({
                    name: '',
                    email: '',
                    address: '',
                    phone: '',
                    copyrightedWorkDescription: '',
                    infringingContentUrl: '',
                    goodFaithStatement: '',
                    signature: '',
                    counterJustification: '',
                    consentToJurisdiction: false,
                    originalNoticeId: ''
                  })
                }}
                className="mt-6"
              >
                Submit Another Notice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DMCA Copyright Notice</h1>
          <p className="text-lg text-gray-600">
            Submit a Digital Millennium Copyright Act notice
          </p>
        </div>

        {/* Notice Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notice Type</CardTitle>
            <CardDescription>
              Select the type of notice you want to file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setFormType('takedown')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  formType === 'takedown'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className={`w-8 h-8 mb-3 ${formType === 'takedown' ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-lg mb-2">Takedown Notice</h3>
                <p className="text-sm text-gray-600">
                  Request removal of content that infringes your copyright
                </p>
              </button>

              <button
                onClick={() => setFormType('counter')}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  formType === 'counter'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className={`w-8 h-8 mb-3 ${formType === 'counter' ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className="font-semibold text-lg mb-2">Counter-Notification</h3>
                <p className="text-sm text-gray-600">
                  Challenge a takedown notice for your content
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* DMCA Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {formType === 'takedown' ? 'DMCA Takedown Notice' : 'Counter-Notification'}
            </CardTitle>
            <CardDescription>
              All fields are required. False claims may result in legal liability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Physical Address *</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Takedown Specific Fields */}
              {formType === 'takedown' && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Copyright Information</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Description of Copyrighted Work *
                        </label>
                        <Textarea
                          value={formData.copyrightedWorkDescription}
                          onChange={(e) => handleChange('copyrightedWorkDescription', e.target.value)}
                          placeholder="Describe the copyrighted work that you believe has been infringed..."
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Infringing Content URL *
                        </label>
                        <Input
                          type="url"
                          value={formData.infringingContentUrl}
                          onChange={(e) => handleChange('infringingContentUrl', e.target.value)}
                          placeholder="https://mscandco.com/..."
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Provide the exact URL where the infringing content is located
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Good Faith Statement *
                        </label>
                        <Textarea
                          value={formData.goodFaithStatement}
                          onChange={(e) => handleChange('goodFaithStatement', e.target.value)}
                          placeholder="I have a good faith belief that use of the copyrighted materials described above is not authorized by the copyright owner, its agent, or the law..."
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Counter-Notification Specific Fields */}
              {formType === 'counter' && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Counter-Notification Details</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Original Notice ID (Optional)
                        </label>
                        <Input
                          value={formData.originalNoticeId}
                          onChange={(e) => handleChange('originalNoticeId', e.target.value)}
                          placeholder="If you received a notice ID, enter it here"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Justification for Restoration *
                        </label>
                        <Textarea
                          value={formData.counterJustification}
                          onChange={(e) => handleChange('counterJustification', e.target.value)}
                          placeholder="Explain why the content should be restored (e.g., you own the copyright, fair use, mistaken identity)..."
                          rows={6}
                          required
                        />
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Checkbox
                          checked={formData.consentToJurisdiction}
                          onCheckedChange={(checked) => handleChange('consentToJurisdiction', checked)}
                          required
                        />
                        <div className="flex-1">
                          <label className="text-sm font-medium">
                            Consent to Jurisdiction *
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            I consent to the jurisdiction of the Federal District Court for the judicial district in which my address is located, and I will accept service of process from the person who provided the original DMCA notification.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Legal Declaration */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal Declaration</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Warning:</strong> By submitting this notice, you declare under penalty of perjury that:
                    </p>
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                      <li>All information provided is accurate and complete</li>
                      <li>You are authorized to act on behalf of the copyright owner</li>
                      <li>You understand that making false claims may result in legal liability</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Electronic Signature *
                    </label>
                    <Input
                      value={formData.signature}
                      onChange={(e) => handleChange('signature', e.target.value)}
                      placeholder="Type your full name to sign electronically"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      By typing your name, you are signing this notice electronically
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t">
                <p className="text-sm text-gray-600">
                  * Required fields
                </p>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="px-8"
                >
                  {submitting ? 'Submitting...' : 'Submit Notice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            For questions about the DMCA process, please email{' '}
            <a href="mailto:legal@mscandco.com" className="text-blue-600 hover:underline">
              legal@mscandco.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, AlertCircle, Check, X, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PREFERENCE_CATEGORIES = {
  operational: {
    title: 'Operational Emails',
    description: 'Important service updates and account notifications',
    icon: AlertCircle,
    preferences: [
      { key: 'operational_security_alerts', label: 'Security Alerts', description: 'Password changes, login attempts, 2FA updates' },
      { key: 'operational_service_updates', label: 'Service Updates', description: 'Platform updates, new features, maintenance' },
      { key: 'operational_billing_updates', label: 'Billing Updates', description: 'Payment confirmations, subscription changes' }
    ]
  },
  releases: {
    title: 'Release Notifications',
    description: 'Updates about your music releases',
    icon: Bell,
    preferences: [
      { key: 'release_status_updates', label: 'Status Updates', description: 'When your release status changes' },
      { key: 'release_distribution_complete', label: 'Distribution Complete', description: 'When your music goes live on platforms' },
      { key: 'release_platform_issues', label: 'Platform Issues', description: 'If there are issues with your releases' }
    ]
  },
  revenue: {
    title: 'Revenue Notifications',
    description: 'Earnings and payment updates',
    icon: Mail,
    preferences: [
      { key: 'revenue_monthly_reports', label: 'Monthly Reports', description: 'Monthly earnings summary' },
      { key: 'revenue_payment_processed', label: 'Payment Processed', description: 'When payments are sent to your account' },
      { key: 'revenue_threshold_alerts', label: 'Threshold Alerts', description: 'Alert when earnings reach a certain amount' }
    ]
  },
  marketing: {
    title: 'Marketing & Promotional',
    description: 'Tips, offers, and product news (opt-in)',
    icon: Info,
    preferences: [
      { key: 'marketing_product_updates', label: 'Product Updates', description: 'New features and improvements' },
      { key: 'marketing_tips_and_tricks', label: 'Tips & Tricks', description: 'How to get the most out of the platform' },
      { key: 'marketing_promotional_offers', label: 'Promotional Offers', description: 'Special discounts and promotions' }
    ]
  },
  platform: {
    title: 'Platform Notifications',
    description: 'Important platform-wide updates',
    icon: Bell,
    preferences: [
      { key: 'platform_new_features', label: 'New Features', description: 'Announcements of new platform features' },
      { key: 'platform_maintenance_notices', label: 'Maintenance Notices', description: 'Scheduled maintenance and downtime' },
      { key: 'platform_policy_changes', label: 'Policy Changes', description: 'Updates to terms, privacy, or policies' }
    ]
  }
}

export default function EmailPreferences() {
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/email-preferences', {
        method: 'GET',
        credentials: 'include'
      })

      console.log('Email preferences response:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Email preferences error:', errorData)
        throw new Error(errorData.error || 'Failed to load preferences')
      }

      const data = await response.json()
      console.log('Email preferences data:', data)
      setPreferences(data.preferences)
    } catch (error) {
      console.error('Error loading preferences:', error)
      setMessage({ type: 'error', text: 'Failed to load email preferences' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (key, value) => {
    const updatedPreferences = { ...preferences, [key]: value }
    setPreferences(updatedPreferences)
    await savePreferences(updatedPreferences)
  }

  const handleCategoryToggle = async (categoryKey, enabled) => {
    const category = PREFERENCE_CATEGORIES[categoryKey]
    const updates = {}

    category.preferences.forEach(pref => {
      updates[pref.key] = enabled
    })

    // Also toggle the category master switch if it exists
    const masterKey = `${categoryKey}_enabled`
    if (preferences.hasOwnProperty(masterKey)) {
      updates[masterKey] = enabled
    }

    const updatedPreferences = { ...preferences, ...updates }
    setPreferences(updatedPreferences)
    await savePreferences(updatedPreferences)
  }

  const savePreferences = async (prefs) => {
    try {
      setSaving(true)
      const response = await fetch('/api/user/email-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences: prefs })
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      const data = await response.json()
      setMessage({ type: 'success', text: 'Preferences saved successfully' })

      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
      setMessage({ type: 'error', text: 'Failed to save preferences' })
    } finally {
      setSaving(false)
    }
  }

  const handleUnsubscribeAll = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/user/email-preferences', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to unsubscribe')
      }

      const data = await response.json()
      setPreferences(data.preferences)
      setMessage({ type: 'success', text: 'Successfully unsubscribed from all non-essential emails' })
      setShowUnsubscribeConfirm(false)
    } catch (error) {
      console.error('Error unsubscribing:', error)
      setMessage({ type: 'error', text: 'Failed to unsubscribe' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load email preferences</p>
      </div>
    )
  }

  const isCategoryEnabled = (categoryKey) => {
    const category = PREFERENCE_CATEGORIES[categoryKey]
    return category.preferences.every(pref => preferences[pref.key])
  }

  const isCategoryPartiallyEnabled = (categoryKey) => {
    const category = PREFERENCE_CATEGORIES[categoryKey]
    const enabledCount = category.preferences.filter(pref => preferences[pref.key]).length
    return enabledCount > 0 && enabledCount < category.preferences.length
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Preferences</h2>
        <p className="text-gray-600">
          Manage which emails you receive from us. You'll always receive important transactional emails (receipts, password resets, etc.).
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="h-5 w-5 flex-shrink-0" />
          ) : (
            <X className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Master Controls */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Email Delivery</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_enabled}
                  onChange={(e) => handleToggle('email_enabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-blue-800">
                  {preferences.email_enabled ? 'Emails enabled' : 'Emails disabled (emergency only)'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Preference Categories */}
      <div className="space-y-6">
        {Object.entries(PREFERENCE_CATEGORIES).map(([categoryKey, category]) => {
          const Icon = category.icon
          const isEnabled = isCategoryEnabled(categoryKey)
          const isPartial = isCategoryPartiallyEnabled(categoryKey)

          return (
            <div key={categoryKey} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Category Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-6 w-6 text-gray-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCategoryToggle(categoryKey, !isEnabled)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    isEnabled
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : isPartial
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  disabled={saving}
                >
                  {isEnabled ? 'All On' : isPartial ? 'Partial' : 'All Off'}
                </button>
              </div>

              {/* Individual Preferences */}
              <div className="space-y-3 ml-9">
                {category.preferences.map(pref => (
                  <label key={pref.key} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferences[pref.key] || false}
                      onChange={(e) => handleToggle(pref.key, e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={saving}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        {pref.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{pref.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Digest Settings */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Bell className="h-6 w-6 text-gray-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Email Digest</h3>
            <p className="text-sm text-gray-600 mb-4">
              Receive a summary of updates instead of individual emails
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.digest_enabled || false}
                  onChange={(e) => handleToggle('digest_enabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={saving}
                />
                <span className="text-sm text-gray-700">Enable digest</span>
              </label>
              {preferences.digest_enabled && (
                <select
                  value={preferences.digest_frequency || 'weekly'}
                  onChange={(e) => handleToggle('digest_frequency', e.target.value)}
                  className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                  disabled={saving}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unsubscribe All */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">Unsubscribe from All Non-Essential Emails</h3>
            <p className="text-sm text-red-800 mb-4">
              You'll only receive legally required emails (receipts, password resets) and critical security alerts.
            </p>
            {!showUnsubscribeConfirm ? (
              <Button
                onClick={() => setShowUnsubscribeConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Unsubscribe from All
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleUnsubscribeAll}
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {saving ? 'Unsubscribing...' : 'Confirm Unsubscribe'}
                </Button>
                <Button
                  onClick={() => setShowUnsubscribeConfirm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          <strong>Note:</strong> Changes are saved automatically. You'll always receive transactional emails
          (order confirmations, receipts, password resets) as they are required by law.
        </p>
      </div>
    </div>
  )
}

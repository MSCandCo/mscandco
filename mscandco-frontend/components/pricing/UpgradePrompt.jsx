'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

/**
 * UpgradePrompt Component
 * 
 * Displays upgrade prompts when tier limits are reached
 * Shows different messages based on limit type
 */
export default function UpgradePrompt({ userId, onDismiss }) {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchUpgradePrompts()
  }, [userId])

  const fetchUpgradePrompts = async () => {
    try {
      const response = await fetch('/api/pricing/upgrade-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      if (data.prompts && data.prompts.length > 0) {
        setPrompts(data.prompts)
      }
    } catch (error) {
      console.error('Error fetching upgrade prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !prompts || prompts.length === 0) {
    return null
  }

  // Show most urgent prompt first
  const urgentPrompt = prompts.find(p => p.urgent) || prompts[0]

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className={`bg-white rounded-xl shadow-2xl border-2 ${
        urgentPrompt.urgent ? 'border-red-500' : 'border-indigo-500'
      } p-6 animate-slide-up`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              urgentPrompt.urgent ? 'bg-red-100' : 'bg-indigo-100'
            }`}>
              {urgentPrompt.urgent ? (
                <AlertCircle className={`w-5 h-5 ${
                  urgentPrompt.urgent ? 'text-red-600' : 'text-indigo-600'
                }`} />
              ) : (
                <Sparkles className={`w-5 h-5 ${
                  urgentPrompt.urgent ? 'text-red-600' : 'text-indigo-600'
                }`} />
              )}
            </div>
            <h3 className={`ml-3 text-lg font-bold ${
              urgentPrompt.urgent ? 'text-red-900' : 'text-gray-900'
            }`}>
              {urgentPrompt.urgent ? 'Limit Reached' : 'Upgrade Recommendation'}
            </h3>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Message */}
        <p className="text-gray-700 mb-4">
          {urgentPrompt.message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href={urgentPrompt.upgradeUrl || '/billing/upgrade'}
            className="flex-1 bg-indigo-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            Upgrade Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          {urgentPrompt.addonUrl && (
            <Link
              href={urgentPrompt.addonUrl}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-gray-400 transition-colors"
            >
              Add Unlimited
            </Link>
          )}
        </div>

        {/* Show count if multiple prompts */}
        {prompts.length > 1 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            {prompts.length - 1} more reason{prompts.length > 2 ? 's' : ''} to upgrade
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}


'use client'

import React from 'react'
import { Check, X, Crown, Star, Zap, Diamond } from 'lucide-react'
import Link from 'next/link'

const TIER_ICONS = {
  free: null,
  pro: Star,
  mpp: Zap,
  investment: Crown
}

const TIER_BADGES = {
  free: null,
  pro: { text: 'Best Value', color: 'bg-green-100 text-green-800' },
  mpp: { text: 'Most Popular', color: 'bg-purple-100 text-purple-800' },
  investment: { text: 'Ultimate', color: 'bg-yellow-100 text-yellow-800' }
}

export default function TierCard({
  tier, // 'free', 'pro', 'mpp', 'investment'
  name,
  badge,
  price,
  originalPrice, // for showing savings
  billingPeriod, // 'monthly' or 'annual'
  commission,
  bestFor,
  features,
  limitations, // only for Free tier
  ctaText,
  ctaAction,
  highlighted = false,
  user = null,
  investmentNote = null // For investment tier
}) {
  const Icon = TIER_ICONS[tier]
  const tierBadge = badge || TIER_BADGES[tier]

  const getCardClasses = () => {
    const base = "bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 overflow-hidden"
    if (highlighted) {
      return `${base} border-4 border-indigo-600 relative`
    }
    return `${base} border-2 border-gray-200 hover:border-gray-400`
  }

  return (
    <div className={`${getCardClasses()} min-w-0`}>
      {/* Badge */}
      {tierBadge && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold ${tierBadge.color}`}>
            {tierBadge.text}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 pt-4">
        {Icon && (
          <div className="flex justify-center mb-3">
            <Icon className="w-10 h-10 text-indigo-600" />
          </div>
        )}

        <h3 className="text-2xl font-bold text-gray-900 mb-2 break-words">{name}</h3>

        {/* Price */}
        <div className="mb-2">
          {tier === 'investment' ? (
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                Investment
              </div>
              {investmentNote && (
                <div className="text-sm text-gray-600 break-words px-2">
                  {investmentNote}
                </div>
              )}
            </div>
          ) : price === 0 || price === null ? (
            <span className="text-5xl font-bold text-gray-900">Free</span>
          ) : (
            <>
              <span className="text-5xl font-bold text-gray-900">
                £{typeof price === 'number' ? price.toFixed(2) : price}
              </span>
              <span className="text-gray-600 text-lg ml-2">
                /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
              </span>
            </>
          )}
        </div>

        {/* Savings indicator */}
        {originalPrice && originalPrice > price && (
          <div className="text-sm text-green-600 font-medium">
            Save £{(originalPrice - price).toFixed(2)}/{billingPeriod === 'monthly' ? 'month' : 'year'}
          </div>
        )}

        {/* Best for */}
        <p className="mt-4 text-sm text-gray-600 italic break-words">{bestFor}</p>
      </div>

      {/* Limitations (Free tier only) */}
      {limitations && limitations.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">Tier Limitations:</h4>
          <ul className="space-y-1">
            {limitations.map((limitation, index) => (
              <li key={index} className="flex items-start text-xs text-yellow-800">
                <X className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="break-words">{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Features */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          {limitations ? 'What\'s Included:' : 'Features:'}
        </h4>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="break-words">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <button
        onClick={ctaAction}
        className={`w-full rounded-xl px-6 py-4 text-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          highlighted
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl'
            : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500 shadow hover:shadow-lg'
        }`}
      >
        {ctaText}
      </button>

      {/* Additional info for specific tiers */}
      {tier === 'mpp' && (
        <p className="mt-3 text-xs text-center text-gray-500">
          Or qualify for FREE with £10K earnings, 100K streams, or 50 releases
        </p>
      )}
    </div>
  )
}

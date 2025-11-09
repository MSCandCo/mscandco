'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, AlertCircle } from 'lucide-react'

const TIER_NAMES = {
  free: 'MSC Free',
  pro: 'MSC Pro',
  mpp: 'MPP Partner',
  investment: 'Investment Partner'
}

const TIER_PRICES = {
  pro: { monthly: 19.99, annual: 199 },
  mpp: { monthly: 99, annual: 999 }
}

// Client-safe tier config (subset of server config)
const TIER_CONFIG = {
  free: {
    commission: 20.00,
    apolloQueries: 3
  },
  pro: {
    commission: 15.00,
    apolloQueries: 100
  },
  mpp_paid: {
    commission: 10.00,
    apolloQueries: 500
  },
  investment: {
    commission: 2.50,
    apolloQueries: null
  }
}

export default function UpgradeClient({ user, targetTier, billingPeriod }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Current tier config
  const currentConfig = TIER_CONFIG[user.tier] || TIER_CONFIG.free
  const targetConfig = TIER_CONFIG[targetTier === 'mpp' ? 'mpp_paid' : targetTier] || TIER_CONFIG.pro

  // Calculate price
  const price = TIER_PRICES[targetTier]?.[billingPeriod] || 0

  // Calculate savings
  const calculateSavings = () => {
    const annualEarnings = user.total_earnings_this_year || 5000 // Example
    const currentCommission = annualEarnings * (currentConfig.commission / 100)
    const newCommission = annualEarnings * (targetConfig.commission / 100)
    const commissionSavings = currentCommission - newCommission
    const subscriptionCost = billingPeriod === 'annual' ? price : price * 12
    const netSavings = commissionSavings - subscriptionCost

    return {
      currentCommission,
      newCommission,
      commissionSavings,
      subscriptionCost,
      netSavings,
      breakEven: subscriptionCost / ((currentConfig.commission - targetConfig.commission) / 100)
    }
  }

  const savings = calculateSavings()

  const handleUpgrade = async () => {
    setLoading(true)
    setError(null)

    try {
      // For free MPP (earned/invited), just update tier
      if (targetTier === 'mpp' && (user.mpp_qualification_status === 'qualified' || user.mpp_qualification_status === 'invited')) {
        const response = await fetch('/api/billing/activate-mpp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        })

        if (!response.ok) throw new Error('Failed to activate MPP')

        router.push('/dashboard?upgraded=mpp_earned')
        return
      }

      // For paid tiers, create Revolut payment
      if (targetTier === 'investment') {
        router.push('/billing/investment-application')
        return
      }

      // Create Revolut subscription
      const response = await fetch('/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tier: targetTier,
          billingPeriod,
          amount: price
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create subscription')
      }

      const { paymentUrl } = await response.json()

      // Redirect to Revolut payment
      window.location.href = paymentUrl
    } catch (err) {
      console.error('Upgrade error:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Upgrade to {TIER_NAMES[targetTier]}
          </h1>
          <p className="text-xl text-gray-600">
            Lower your commission rate and unlock powerful features
          </p>
        </div>

        {/* Comparison Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Current Plan */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Current Plan</div>
              <div className="text-2xl font-bold text-gray-900 mb-4">
                {TIER_NAMES[user.tier]}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Commission Rate</span>
                  <span className="font-semibold text-red-600">{currentConfig.commission}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">You Keep</span>
                  <span className="font-semibold">{100 - currentConfig.commission}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Apollo Queries/Month</span>
                  <span className="font-semibold">{currentConfig.apolloQueries || 'Unlimited'}</span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="w-12 h-12 text-indigo-600" />
            </div>

            {/* New Plan */}
            <div>
              <div className="text-sm text-gray-600 mb-2">New Plan</div>
              <div className="text-2xl font-bold text-indigo-600 mb-4">
                {TIER_NAMES[targetTier]}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Commission Rate</span>
                  <span className="font-semibold text-green-600">{targetConfig.commission}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">You Keep</span>
                  <span className="font-semibold text-green-600">{100 - targetConfig.commission}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Apollo Queries/Month</span>
                  <span className="font-semibold text-green-600">{targetConfig.apolloQueries || 'Unlimited'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Calculation */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Savings Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Commission savings per year</span>
                <span className="font-semibold text-green-600">+£{savings.commissionSavings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription cost per year</span>
                <span className="font-semibold text-red-600">-£{savings.subscriptionCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                <span>Net savings per year</span>
                <span className={savings.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {savings.netSavings >= 0 ? '+' : ''}£{savings.netSavings.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Break-even at £{savings.breakEven.toFixed(0)} annual earnings
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">What You'll Get</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {targetTier === 'pro' && (
              <>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Unlimited releases & tracks</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">All 18 streaming platforms</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Priority delivery (1-3 days)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Advanced analytics</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Pre-save campaigns</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Smart links & landing pages</span>
                </div>
              </>
            )}
            {targetTier === 'mpp' && (
              <>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">24-hour express delivery</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Dedicated account manager</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">White-label distribution (earn 3-5%)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Referral revenue (earn 10%)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Private Partner community</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">VIP support (6h response)</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-900">Upgrade Failed</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-2xl font-bold mb-2">
                £{price.toFixed(2)}{billingPeriod === 'monthly' ? '/month' : '/year'}
              </div>
              {billingPeriod === 'annual' && (
                <div className="text-sm opacity-90">
                  Save 17% vs monthly (£{(TIER_PRICES[targetTier].monthly * 12).toFixed(2)}/year)
                </div>
              )}
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Upgrade Now`}
            </button>
          </div>

          <div className="text-sm opacity-90">
            • Secure payment via Revolut Business<br />
            • Cancel anytime<br />
            • Changes take effect immediately
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            ← Back to pricing
          </button>
        </div>
      </div>
    </div>
  )
}

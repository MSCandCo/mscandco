'use client'

import React, { useState } from 'react'
import { TrendingUp, DollarSign } from 'lucide-react'

const TIERS = [
  { name: 'MSC Free', commission: 20, subscription: 0, color: 'text-gray-700' },
  { name: 'MSC Pro', commission: 15, subscription: 199, color: 'text-indigo-600' },
  { name: 'MPP Partner', commission: 10, subscription: 999, color: 'text-purple-600' },
  { name: 'Investment Partner', commission: 2.5, subscription: 0, color: 'text-yellow-600' }
]

export default function EarningsCalculator({
  minEarnings = 0,
  maxEarnings = 100000,
  defaultValue = 10000
}) {
  const [earnings, setEarnings] = useState(defaultValue)

  const calculateTierCost = (tier) => {
    const commissionAmount = earnings * (tier.commission / 100)
    const totalCost = commissionAmount + tier.subscription
    const youKeep = earnings - totalCost
    const savingsVsFree = TIERS[0].subscription + (earnings * (TIERS[0].commission / 100)) - totalCost

    return {
      commissionAmount,
      subscriptionCost: tier.subscription,
      totalCost,
      youKeep,
      savingsVsFree: tier.name === 'MSC Free' ? 0 : savingsVsFree
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getBestTier = () => {
    const costs = TIERS.map(tier => ({
      ...tier,
      ...calculateTierCost(tier)
    }))

    // Find tier with lowest total cost
    return costs.reduce((best, current) =>
      current.totalCost < best.totalCost ? current : best
    )
  }

  const bestTier = getBestTier()

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-indigo-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full mb-3">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Calculate Your Earnings
        </h3>
        <p className="text-gray-600">
          See how much you'll keep with each tier
        </p>
      </div>

      {/* Slider Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Expected Annual Streaming Earnings
        </label>

        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-indigo-600">
            {formatCurrency(earnings)}
          </span>
        </div>

        <input
          type="range"
          min={minEarnings}
          max={maxEarnings}
          step={1000}
          value={earnings}
          onChange={(e) => setEarnings(Number(e.target.value))}
          className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(earnings / maxEarnings) * 100}%, #e0e7ff ${(earnings / maxEarnings) * 100}%, #e0e7ff 100%)`
          }}
        />

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatCurrency(minEarnings)}</span>
          <span>{formatCurrency(maxEarnings)}</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {TIERS.map((tier) => {
          const result = calculateTierCost(tier)
          const isBest = tier.name === bestTier.name && earnings > 0

          return (
            <div
              key={tier.name}
              className={`p-4 rounded-xl transition-all ${
                isBest
                  ? 'bg-white border-2 border-indigo-600 shadow-md'
                  : 'bg-white/50 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <h4 className={`font-bold ${tier.color}`}>{tier.name}</h4>
                  {isBest && earnings > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                      Best Value
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {tier.commission}% commission
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">You Keep:</div>
                  <div className="font-bold text-green-600 text-lg">
                    {formatCurrency(result.youKeep)}
                  </div>
                </div>

                <div>
                  <div className="text-gray-600">Total Cost:</div>
                  <div className="font-bold text-gray-900 text-lg">
                    {formatCurrency(result.totalCost)}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Commission: {formatCurrency(result.commissionAmount)}
                {result.subscriptionCost > 0 && ` + Subscription: ${formatCurrency(result.subscriptionCost)}`}
                {tier.name === 'MPP Partner' && result.subscriptionCost > 0 && earnings >= 10000 && (
                  <span className="ml-2 text-green-600 font-medium">
                    (You qualify for FREE!)
                  </span>
                )}
              </div>

              {result.savingsVsFree > 0 && (
                <div className="mt-2 text-sm font-medium text-green-600">
                  Save {formatCurrency(result.savingsVsFree)}/year vs Free tier
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Recommendation */}
      {earnings > 0 && (
        <div className="mt-6 p-4 bg-indigo-100 rounded-xl border border-indigo-200">
          <div className="flex items-start">
            <DollarSign className="w-5 h-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-900">
              <span className="font-semibold">Recommendation: </span>
              At {formatCurrency(earnings)} annual earnings, <span className="font-bold">{bestTier.name}</span> gives you the best value.
              You'll keep <span className="font-bold text-green-600">{formatCurrency(bestTier.youKeep)}</span>.
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #4f46e5;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #4f46e5;
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'

const FEATURES = [
  {
    category: 'Releases & Distribution',
    items: [
      { name: 'Releases per year', free: '3', pro: 'Unlimited', mpp: 'Unlimited', investment: 'Unlimited' },
      { name: 'Tracks per year', free: '15', pro: 'Unlimited', mpp: 'Unlimited', investment: 'Unlimited' },
      { name: 'Streaming platforms', free: '12', pro: '18 (All)', mpp: '18 (All)', investment: '18 (All)' },
      { name: 'Delivery speed', free: '7-10 days', pro: '1-3 days', mpp: '24 hours', investment: 'Express' },
      { name: 'Pre-save campaigns', free: false, pro: true, mpp: true, investment: true },
      { name: 'Pre-order functionality', free: false, pro: true, mpp: true, investment: true },
      { name: 'Custom release dates', free: false, pro: true, mpp: true, investment: true }
    ]
  },
  {
    category: 'Analytics & Insights',
    items: [
      { name: 'Basic analytics', free: true, pro: true, mpp: true, investment: true },
      { name: 'Demographics data', free: false, pro: true, mpp: true, investment: true },
      { name: 'Playlist performance', free: false, pro: true, mpp: true, investment: true },
      { name: 'Retention metrics', free: false, pro: true, mpp: true, investment: true },
      { name: 'Streaming insights', free: false, pro: true, mpp: true, investment: true },
      { name: 'Export reports (CSV)', free: true, pro: true, mpp: true, investment: true }
    ]
  },
  {
    category: 'Apollo Intelligence (AI)',
    items: [
      { name: 'AI queries per month', free: '3', pro: '100', mpp: '500', investment: 'Unlimited' },
      { name: 'Bio & content writing', free: true, pro: true, mpp: true, investment: true },
      { name: 'Data analysis', free: false, pro: true, mpp: true, investment: true },
      { name: 'Strategy recommendations', free: false, pro: true, mpp: true, investment: true },
      { name: 'Smart link generation', free: false, pro: true, mpp: true, investment: true }
    ]
  },
  {
    category: 'Marketing & Tools',
    items: [
      { name: 'Smart links & landing pages', free: false, pro: true, mpp: true, investment: true },
      { name: 'Social media integration', free: false, pro: true, mpp: true, investment: true },
      { name: 'Marketing campaign tools', free: false, pro: true, mpp: true, investment: true },
      { name: 'Featured on homepage', free: false, pro: false, mpp: true, investment: true },
      { name: 'Co-marketing opportunities', free: false, pro: false, mpp: true, investment: true }
    ]
  },
  {
    category: 'Revenue & Payouts',
    items: [
      { name: 'Commission rate', free: '20%', pro: '15%', mpp: '10%', investment: '2.5%' },
      { name: 'You keep', free: '80%', pro: '85%', mpp: '90%', investment: '97.5%' },
      { name: 'Royalty splits management', free: false, pro: true, mpp: true, investment: true },
      { name: 'Instant payout option', free: false, pro: false, mpp: true, investment: true },
      { name: 'White-label distribution', free: false, pro: false, mpp: '3-5%', investment: '5%' }
    ]
  },
  {
    category: 'Support & Service',
    items: [
      { name: 'Email support', free: '48h response', pro: '12h response', mpp: '6h response', investment: '1h response' },
      { name: 'Chat support', free: false, pro: true, mpp: true, investment: true },
      { name: 'Phone support', free: false, pro: false, mpp: true, investment: true },
      { name: 'Dedicated account manager', free: false, pro: false, mpp: true, investment: true },
      { name: 'Personal concierge', free: false, pro: false, mpp: false, investment: true }
    ]
  },
  {
    category: 'Partner Benefits',
    items: [
      { name: 'Referral revenue sharing', free: false, pro: false, mpp: '10%', investment: '10%' },
      { name: 'Platform revenue share', free: false, pro: false, mpp: false, investment: '5%' },
      { name: 'Private Partner community', free: false, pro: false, mpp: true, investment: true },
      { name: 'Networking events', free: false, pro: false, mpp: true, investment: true },
      { name: 'Equity ownership', free: false, pro: false, mpp: false, investment: true },
      { name: 'Board advisory seat', free: false, pro: false, mpp: false, investment: true }
    ]
  }
]

export default function FeatureComparisonTable({ className = '' }) {
  const [expandedCategories, setExpandedCategories] = useState(new Set(FEATURES.map(f => f.category)))

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const expandAll = () => {
    setExpandedCategories(new Set(FEATURES.map(f => f.category)))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  const renderValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      )
    }
    return <span className="text-sm text-gray-900">{value}</span>
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Complete Feature Comparison</h3>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/3">
                Feature
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                MSC Free
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-indigo-600 bg-indigo-50">
                MSC Pro
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600 bg-purple-50">
                MPP Partner
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-yellow-600 bg-yellow-50">
                Investment
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((category, categoryIndex) => {
              const isExpanded = expandedCategories.has(category.category)

              return (
                <React.Fragment key={categoryIndex}>
                  {/* Category Header */}
                  <tr
                    className="bg-gray-100 border-y border-gray-200 cursor-pointer hover:bg-gray-150 transition-colors"
                    onClick={() => toggleCategory(category.category)}
                  >
                    <td colSpan="5" className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{category.category}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Category Items */}
                  {isExpanded && category.items.map((item, itemIndex) => (
                    <tr
                      key={itemIndex}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">{item.name}</td>
                      <td className="px-6 py-4 text-center">{renderValue(item.free)}</td>
                      <td className="px-6 py-4 text-center bg-indigo-50/50">{renderValue(item.pro)}</td>
                      <td className="px-6 py-4 text-center bg-purple-50/50">{renderValue(item.mpp)}</td>
                      <td className="px-6 py-4 text-center bg-yellow-50/50">{renderValue(item.investment)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          All tiers include ISRC & UPC codes, copyright protection, and distribution to major streaming platforms.
        </p>
      </div>
    </div>
  )
}

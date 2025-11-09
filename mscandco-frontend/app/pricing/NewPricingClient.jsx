'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import TierCard from '@/components/pricing/TierCard'
import EarningsCalculator from '@/components/pricing/EarningsCalculator'
import QualificationChecker from '@/components/pricing/QualificationChecker'
import FeatureComparisonTable from '@/components/pricing/FeatureComparisonTable'

// Tier definitions
const TIERS = [
  {
    tier: 'free',
    name: 'MSC Free',
    price: 0,
    commission: 20,
    bestFor: 'New & emerging artists',
    features: [
      'Keep 80% of royalties',
      '12 streaming platforms',
      'ISRC & UPC codes',
      'Basic analytics',
      'CSV sales reports',
      'Copyright protection',
      'Apollo Intelligence: 3 queries/month'
    ],
    limitations: [
      'Maximum 3 releases per year',
      'Maximum 15 tracks per year',
      'Excludes TikTok, Boomplay, Anghami, Napster, KKBOX, JOOX',
      'Standard delivery: 7-10 days',
      'No pre-save campaigns',
      'No smart links',
      'No royalty splits',
      'Upgrade required at £5,000/year earnings'
    ]
  },
  {
    tier: 'pro',
    name: 'MSC Pro',
    price: { monthly: 19.99, annual: 199 },
    originalPrice: { monthly: 19.99, annual: 239.88 },
    commission: 15,
    bestFor: 'Artists releasing regularly',
    badge: { text: 'Best Value', color: 'bg-green-100 text-green-800' },
    highlighted: true,
    features: [
      'Keep 85% of royalties',
      'UNLIMITED releases & tracks',
      'ALL 18 streaming platforms',
      'Priority delivery: 1-3 days',
      'Advanced analytics (demographics, retention)',
      'Apollo Intelligence: 100 queries/month',
      'Pre-save campaigns',
      'Smart links & landing pages',
      'Royalty splits management',
      'Priority support (12h response)',
      'Custom release dates',
      'Pre-order functionality'
    ]
  },
  {
    tier: 'mpp',
    name: 'MPP Partner',
    price: { monthly: 99, annual: 999 },
    originalPrice: { monthly: 99, annual: 1188 },
    commission: 10,
    bestFor: 'Elite artists & strategic partners',
    badge: { text: 'Most Popular', color: 'bg-purple-100 text-purple-800' },
    features: [
      'Keep 90% of royalties',
      '24-hour express delivery',
      'Dedicated account manager',
      'Apollo Intelligence Pro: 500 queries/month',
      'White-label distribution (earn 3-5%)',
      'Referral revenue (earn 10%)',
      'Co-marketing opportunities',
      'Featured on homepage',
      'Private Partner community',
      'Networking events',
      'VIP support (6h response)',
      'Custom integrations',
      'Quarterly strategy calls'
    ],
    qualificationNote: 'Or qualify for FREE with £10K earnings, 100K streams, or 50 releases'
  },
  {
    tier: 'investment',
    name: 'Investment Partner',
    price: { investment: [10000, 25000, 50000] },
    commission: 2.5,
    bestFor: 'Artists who want ownership',
    badge: { text: 'Ultimate', color: 'bg-yellow-100 text-yellow-800' },
    features: [
      'Keep 97.5% of royalties (LOWEST RATE)',
      'Equity ownership (0.5% - 2.0%)',
      'Board advisory seat',
      'Vote on platform decisions',
      'Revenue share: 5% of ALL platform revenue',
      'Dividend payments (when profitable)',
      'Apollo Intelligence: UNLIMITED',
      'Personal concierge support (1h response)',
      'Custom feature development',
      'White-label override (5%)',
      'Exit proceeds (acquisition/IPO)',
      'Shape product roadmap'
    ],
    investmentNote: '£10K (0.5%) | £25K (1.0%) | £50K (2.0%) equity'
  }
]

export default function NewPricingClient({ user }) {
  const [billingPeriod, setBillingPeriod] = useState('annual')
  const [showFAQ, setShowFAQ] = useState(false)

  const getPrice = (tierData) => {
    if (tierData.price === 0) return 0
    if (tierData.price.investment) return tierData.price.investment[1] // Show middle tier
    return tierData.price[billingPeriod]
  }

  const getOriginalPrice = (tierData) => {
    if (!tierData.originalPrice) return null
    return tierData.originalPrice[billingPeriod]
  }

  const handleUpgrade = (tier) => {
    if (!user) {
      window.location.href = '/register'
      return
    }

    if (tier === 'free') {
      window.location.href = '/dashboard'
    } else if (tier === 'investment') {
      window.location.href = '/billing/investment-application'
    } else {
      window.location.href = `/billing/upgrade?tier=${tier}&period=${billingPeriod}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Fair Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Start free. Scale as you grow. Lower rates for success. Own equity when you're ready.
          </p>
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            20% → 15% → 10% → 2.5%
          </div>
          <p className="text-lg text-gray-600">
            The more you grow, the less you pay.
          </p>
        </div>

        {/* Earnings Calculator */}
        <div className="max-w-4xl mx-auto mb-16">
          <EarningsCalculator />
        </div>

        {/* Billing Toggle */}
        {!user && (
          <div className="flex justify-center mb-12">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {TIERS.map((tierData) => (
            <TierCard
              key={tierData.tier}
              {...tierData}
              billingPeriod={billingPeriod}
              price={getPrice(tierData)}
              originalPrice={getOriginalPrice(tierData)}
              ctaText={
                !user
                  ? 'Get Started'
                  : user.tier === tierData.tier
                  ? 'Current Plan'
                  : tierData.tier === 'free'
                  ? 'Downgrade'
                  : 'Upgrade'
              }
              ctaAction={() => handleUpgrade(tierData.tier)}
              user={user}
            />
          ))}
        </div>

        {/* Qualification Checker */}
        {user && (
          <div className="max-w-2xl mx-auto mb-16">
            <QualificationChecker
              userId={user.id}
              onQualified={(result) => {
                // Show success notification
                alert('Congratulations! You qualify for FREE Partner status!')
              }}
            />
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mb-16">
          <FeatureComparisonTable />
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={() => setShowFAQ(!showFAQ)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-2xl font-bold text-gray-900">
                Frequently Asked Questions
              </h3>
              {showFAQ ? (
                <ChevronUp className="w-6 h-6 text-gray-600" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-600" />
              )}
            </button>

            {showFAQ && (
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    What happens when I hit the Free tier limits?
                  </h4>
                  <p className="text-gray-600">
                    When you reach 3 releases or £5,000 in annual earnings, you'll be prompted to upgrade to MSC Pro.
                    You can continue releasing and keep all your existing music live.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Can I switch between tiers?
                  </h4>
                  <p className="text-gray-600">
                    Yes! Upgrade or downgrade anytime. If upgrading, new rates apply immediately.
                    If downgrading, changes take effect at next billing cycle.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    How do I qualify for free MPP Partner status?
                  </h4>
                  <p className="text-gray-600">
                    Automatically when you hit £10,000 annual earnings, 100,000 streams, or 50 releases.
                    You can also apply for invitation or subscribe immediately.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    What does the commission cover?
                  </h4>
                  <p className="text-gray-600">
                    Distribution to 12-18 streaming platforms, payment processing, ISRC/UPC codes,
                    copyright protection, customer support, and platform maintenance.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    When do I get paid?
                  </h4>
                  <p className="text-gray-600">
                    Monthly, with 30-day payment terms. Minimum payout: £50.
                    We support PayPal, bank transfer, Revolut, and Wise.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Is Investment Partnership suitable for me?
                  </h4>
                  <p className="text-gray-600">
                    Investment Partnership is for sophisticated investors with substantial existing income
                    (£25K+ annual earnings recommended) who understand equity investments and want long-term platform ownership.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revolut Payment Info */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-lg font-semibold text-gray-900">Secure Payment Processing</span>
          </div>
          <p className="text-gray-600">
            Powered by <span className="font-semibold">Revolut Business API</span> for secure, reliable payments.
            All transactions are encrypted and processed through enterprise-grade security.
          </p>
        </div>

        {/* Contact Sales */}
        <div className="text-center">
          <p className="text-gray-700 text-lg mb-4">
            Need a custom plan? Contact our sales team for enterprise solutions.
          </p>
          <Link href="/support">
            <button className="bg-transparent text-[#1f2937] border-2 border-[#1f2937] rounded-xl px-8 py-3 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937]">
              Contact Sales
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

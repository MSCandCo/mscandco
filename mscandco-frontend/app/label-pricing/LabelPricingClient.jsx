'use client'

import { useState } from 'react';
import { Check, X, Zap, Users, Music, TrendingUp, Award, Crown, Building2, Sparkles } from 'lucide-react';
import { LABEL_TIER_CONFIG, LABEL_TIERS } from '@/lib/label-tier-config';

export default function LabelPricingClient({ user }) {
  const [billingPeriod, setBillingPeriod] = useState('annual'); // 'monthly' or 'annual'

  const tiers = [
    { key: LABEL_TIERS.STARTER, icon: Building2, color: 'blue' },
    { key: LABEL_TIERS.PRO, icon: TrendingUp, color: 'purple' },
    { key: LABEL_TIERS.PARTNER, icon: Crown, color: 'amber' },
    { key: LABEL_TIERS.ENTERPRISE, icon: Sparkles, color: 'emerald' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Label Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Progressive pricing that rewards your label's growth. Lower commission rates as you scale.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map(({ key, icon: Icon, color }) => {
            const config = LABEL_TIER_CONFIG[key];
            const price = billingPeriod === 'annual' ? config.price.annual : config.price.monthly;
            const isPopular = config.popular;

            return (
              <div
                key={key}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:scale-105 ${
                  isPopular ? 'ring-4 ring-purple-500' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}

                <div className={`bg-gradient-to-br from-${color}-500 to-${color}-600 p-6 text-white`}>
                  <Icon className="w-10 h-10 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">{config.displayName}</h3>
                  <div className="mb-4">
                    {config.price.investment_range ? (
                      <>
                        <span className="text-3xl font-bold">
                          {config.price.symbol}{config.price.investment_range.min.toLocaleString()}
                        </span>
                        <span className="text-lg"> - </span>
                        <span className="text-3xl font-bold">
                          {config.price.symbol}{config.price.investment_range.max.toLocaleString()}
                        </span>
                        <p className="text-sm opacity-90 mt-1">One-time investment</p>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">
                          {config.price.symbol}{price}
                        </span>
                        <span className="text-lg">/{billingPeriod === 'annual' ? 'year' : 'month'}</span>
                        <p className="text-sm opacity-90 mt-1">{(config.commission * 100).toFixed(0)}% commission</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {config.features.slice(0, 6).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className={`w-5 h-5 text-${color}-500 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full bg-gradient-to-r from-${color}-500 to-${color}-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all`}
                  >
                    {config.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Auto-Qualification Section */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 mb-12 border-2 border-amber-200">
          <div className="flex items-start gap-4">
            <Award className="w-12 h-12 text-amber-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                🎉 Auto-Qualify for FREE Partner Tier
              </h2>
              <p className="text-gray-700 mb-4">
                Reach any ONE of these milestones and we'll automatically upgrade you to Partner tier for FREE:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {LABEL_TIER_CONFIG[LABEL_TIERS.PARTNER].autoQualifyFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                    <Check className="w-5 h-5 text-amber-600" />
                    <span className="text-gray-800 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4 italic">
                * Auto-qualification runs daily. If you're on a paid plan and qualify, we'll cancel your subscription and upgrade you to FREE Partner immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Complete Feature Comparison
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Pro</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Partner</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Artists Under Label', values: ['5', '25', '100', 'Unlimited'] },
                  { feature: 'Releases Per Year', values: ['10', 'Unlimited', 'Unlimited', 'Unlimited'] },
                  { feature: 'Tracks Per Year', values: ['30', 'Unlimited', 'Unlimited', 'Unlimited'] },
                  { feature: 'Commission Rate', values: ['25%', '18%', '12%', '5%'] },
                  { feature: 'Apollo Queries/Month', values: ['10', '200', '1,000', 'Unlimited'] },
                  { feature: 'Team Members', values: ['1', '3', '10', 'Unlimited'] },
                  { feature: 'Roster Management', values: [true, true, true, true] },
                  { feature: 'Analytics Dashboard', values: [true, true, true, true] },
                  { feature: 'Advanced Analytics', values: [false, true, true, true] },
                  { feature: 'Bulk Release Upload', values: [false, true, true, true] },
                  { feature: 'Custom Branding', values: [false, true, true, true] },
                  { feature: 'White-Label Platform', values: [false, false, true, true] },
                  { feature: 'API Access', values: [false, false, true, true] },
                  { feature: 'Dedicated Manager', values: [false, false, true, true] },
                  { feature: 'Equity Ownership', values: [false, false, false, true] },
                  { feature: 'Board Voting Rights', values: [false, false, false, true] },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.feature}</td>
                    {row.values.map((value, vIdx) => (
                      <td key={vIdx} className="px-6 py-4 text-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-gray-700">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Savings Calculator */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            Commission Savings Calculator
          </h2>
          <p className="text-gray-600 mb-6">
            See how much you save with lower commission rates as your label grows
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { earnings: 10000, label: '£10K Annual Earnings' },
              { earnings: 50000, label: '£50K Annual Earnings' },
              { earnings: 100000, label: '£100K Annual Earnings' },
            ].map(({ earnings, label }) => (
              <div key={earnings} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">{label}</h3>
                <div className="space-y-2 text-sm">
                  {Object.values(LABEL_TIERS).map((tier) => {
                    const config = LABEL_TIER_CONFIG[tier];
                    const commission = earnings * config.commission;
                    const youKeep = earnings - commission;

                    return (
                      <div key={tier} className="flex justify-between">
                        <span className="text-gray-600">{config.displayName}:</span>
                        <span className="font-semibold text-gray-900">
                          £{youKeep.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'How does label pricing differ from artist pricing?',
                a: 'Label pricing is designed for label admins managing multiple artists. You pay one subscription and commission rate that covers all artists under your label. Artist pricing is for independent artists managing only their own music.'
              },
              {
                q: 'What happens when I add my 6th artist on Starter tier?',
                a: 'You\'ll be prompted to upgrade to Pro tier (25 artists max) before you can add more artists. The platform enforces limits in real-time to ensure fair usage.'
              },
              {
                q: 'Can I qualify for Partner tier for free?',
                a: 'Yes! If you meet ANY of the auto-qualification criteria (£50K+ earnings, 500K+ streams, 25+ artists, or £10K+ commissions paid), we automatically upgrade you to FREE Partner tier and cancel any paid subscription.'
              },
              {
                q: 'How do release limits work for labels?',
                a: 'Release and track limits are aggregated across ALL artists under your label. On Starter tier, all your artists combined can release 10 releases and 30 tracks per year. Limits reset on January 1st.'
              },
              {
                q: 'What\'s included in Investment Partner tier?',
                a: 'Investment Partner is our highest tier with equity ownership, board voting rights, revenue share, and the lowest 5% commission rate. Investment ranges from £50K-£250K depending on your label\'s size and growth potential.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="border-b pb-4 last:border-b-0">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to grow your label?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start with our free Starter tier and upgrade as you scale
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg transition-all">
              Get Started Free
            </button>
            <button className="bg-white text-gray-900 font-semibold px-8 py-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

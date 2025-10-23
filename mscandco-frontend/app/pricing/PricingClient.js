'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

// Simplified role-based pricing plans
const getRoleSpecificPlans = (role) => {
  switch (role) {
    case 'artist':
      return [
        {
          name: 'Artist Starter',
          monthlyPrice: 9.99,
          yearlyPrice: 119.88,
          features: [
            'Up to 5 releases per year',
            'Basic analytics dashboard',
            'Email support only',
            'Distribution to all major platforms',
            'Basic earnings overview',
            'Standard release management',
            'Basic artist profile'
          ]
        },
        {
          name: 'Artist Pro',
          monthlyPrice: 19.99,
          yearlyPrice: 239.88,
          features: [
            'Unlimited releases per year',
            'Advanced analytics & insights',
            'Priority email & phone support',
            'Distribution to all major platforms',
            'Detailed earnings & royalty tracking',
            'Advanced release management',
            'Social media integration',
            'Marketing campaign tools',
            'Priority customer service',
            'Advanced artist profile customization'
          ]
        }
      ]

    case 'label_admin':
      return [
        {
          name: 'Label Admin Starter',
          monthlyPrice: 29.99,
          yearlyPrice: 359.88,
          features: [
            'Manage up to 3 artists',
            'Basic label analytics dashboard',
            'Artist content oversight',
            'Basic reporting tools',
            'Standard release management',
            'Basic artist performance tracking',
            'Email support only',
            'Simple content approval workflows',
            'Basic revenue tracking'
          ]
        },
        {
          name: 'Label Admin Pro',
          monthlyPrice: 49.99,
          yearlyPrice: 599.88,
          features: [
            'Unlimited artists management',
            'Advanced label analytics & insights',
            'Comprehensive artist content oversight',
            'Advanced reporting & export tools',
            'Full release management suite',
            'Detailed artist performance tracking',
            'Custom label branding options',
            'Priority email & phone support',
            'Advanced content approval workflows',
            'Comprehensive revenue & royalty tracking'
          ]
        }
      ]

    default:
      return [
        {
          name: 'Artist Starter',
          monthlyPrice: 9.99,
          yearlyPrice: 119.88,
          features: [
            'Up to 5 releases per year',
            'Basic analytics dashboard',
            'Email support',
            'Distribution to major platforms'
          ]
        },
        {
          name: 'Artist Pro',
          monthlyPrice: 19.99,
          yearlyPrice: 239.88,
          features: [
            'Unlimited releases',
            'Advanced analytics',
            'Priority support',
            'Marketing tools'
          ]
        },
        {
          name: 'Label Admin Starter',
          monthlyPrice: 29.99,
          yearlyPrice: 359.88,
          features: [
            'Manage up to 3 artists',
            'Basic label analytics',
            'Email support',
            'Basic reporting tools'
          ]
        },
        {
          name: 'Label Admin Pro',
          monthlyPrice: 49.99,
          yearlyPrice: 599.88,
          features: [
            'Unlimited artists',
            'Advanced analytics',
            'Priority support',
            'Custom branding'
          ]
        }
      ]
  }
}

export default function PricingClient({ user, userRole }) {
  const [chargingInterval, setChargingInterval] = useState('monthly')
  const plans = getRoleSpecificPlans(userRole)

  const formatPrice = (price) => {
    return `£${price.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Simple, transparent pricing for artists and labels
          </p>

          {user && userRole && (
            <div className="mt-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {userRole.replace('_', ' ').toUpperCase()} Plans
              </span>
            </div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setChargingInterval('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                chargingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setChargingInterval('yearly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                chargingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                Save
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={`grid grid-cols-1 ${plans.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'} gap-8 max-w-7xl mx-auto`}>
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 hover:border-[#1f2937] transition-all p-8"
            >
              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {formatPrice(chargingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{chargingInterval === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                {chargingInterval === 'yearly' && (
                  <div className="text-sm text-green-600 font-medium">
                    Save £{((plan.monthlyPrice * 12) - plan.yearlyPrice).toFixed(2)}/year
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start text-sm text-gray-700">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href={user ? '/billing' : '/register'}>
                <button className="w-full bg-transparent text-[#1f2937] border-2 border-[#1f2937] rounded-xl px-6 py-6 text-lg font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937]">
                  {user ? 'Manage Subscription' : 'Get Started'}
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
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
        <div className="mt-12 text-center">
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

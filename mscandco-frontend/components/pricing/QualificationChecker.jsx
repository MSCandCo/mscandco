'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader2, Award } from 'lucide-react'

export default function QualificationChecker({ userId, onQualified }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    annualEarnings: '',
    totalStreams: '',
    totalReleases: '',
    totalCommissions: ''
  })

  const checkQualification = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/pricing/check-mpp-qualification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        })
      })

      const data = await response.json()
      setResult(data)

      if (data.qualified && onQualified) {
        onQualified(data)
      }
    } catch (error) {
      console.error('Error checking qualification:', error)
      setResult({
        qualified: false,
        error: 'Failed to check qualification. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    checkQualification()
  }

  const isFormValid = () => {
    return Object.values(formData).some(value => value !== '')
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-GB').format(num)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Award className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Check Your MPP Qualification
        </h3>
        <p className="text-gray-600">
          See if you qualify for FREE Partner status
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Annual Earnings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Earnings
            <span className="ml-2 text-xs text-gray-500">(Qualify at £10,000+)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">£</span>
            <input
              type="number"
              value={formData.annualEarnings}
              onChange={(e) => setFormData({ ...formData, annualEarnings: e.target.value })}
              placeholder="0"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              step="100"
            />
          </div>
          {formData.annualEarnings >= 10000 && (
            <div className="mt-1 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Qualifies for MPP!
            </div>
          )}
        </div>

        {/* Total Streams */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Streams (All-Time)
            <span className="ml-2 text-xs text-gray-500">(Qualify at 100,000+)</span>
          </label>
          <input
            type="number"
            value={formData.totalStreams}
            onChange={(e) => setFormData({ ...formData, totalStreams: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min="0"
            step="1000"
          />
          {formData.totalStreams >= 100000 && (
            <div className="mt-1 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Qualifies for MPP!
            </div>
          )}
        </div>

        {/* Total Releases */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Releases (All-Time)
            <span className="ml-2 text-xs text-gray-500">(Qualify at 50+)</span>
          </label>
          <input
            type="number"
            value={formData.totalReleases}
            onChange={(e) => setFormData({ ...formData, totalReleases: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min="0"
            step="1"
          />
          {formData.totalReleases >= 50 && (
            <div className="mt-1 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Qualifies for MPP!
            </div>
          )}
        </div>

        {/* Total Commissions Paid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Commissions Paid to MSC & Co
            <span className="ml-2 text-xs text-gray-500">(Qualify at £5,000+)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">£</span>
            <input
              type="number"
              value={formData.totalCommissions}
              onChange={(e) => setFormData({ ...formData, totalCommissions: e.target.value })}
              placeholder="0"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
              step="100"
            />
          </div>
          {formData.totalCommissions >= 5000 && (
            <div className="mt-1 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Qualifies for MPP!
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid() || loading}
          className="w-full bg-purple-600 text-white rounded-lg px-6 py-3 font-bold transition-all duration-300 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            'Check Qualification'
          )}
        </button>
      </form>

      {/* Result */}
      {result && !result.error && (
        <div className={`mt-6 p-6 rounded-xl border-2 ${
          result.qualified
            ? 'bg-green-50 border-green-500'
            : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-start">
            {result.qualified ? (
              <CheckCircle className="w-8 h-8 text-green-600 mr-3 flex-shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-gray-500 mr-3 flex-shrink-0" />
            )}
            <div>
              <h4 className={`text-lg font-bold mb-2 ${
                result.qualified ? 'text-green-900' : 'text-gray-900'
              }`}>
                {result.qualified ? '🎉 Congratulations!' : 'Not Yet Qualified'}
              </h4>
              <p className={`text-sm mb-3 ${
                result.qualified ? 'text-green-800' : 'text-gray-700'
              }`}>
                {result.message}
              </p>

              {result.qualified && result.qualificationReasons && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    You qualified based on:
                  </p>
                  <ul className="text-sm text-green-800 space-y-1">
                    {result.qualificationReasons.map((reason, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.qualified && (
                <button
                  onClick={() => window.location.href = '/billing?upgrade=mpp_earned'}
                  className="bg-green-600 text-white rounded-lg px-6 py-2 font-bold hover:bg-green-700 transition-colors"
                >
                  Activate FREE Partner Status
                </button>
              )}

              {!result.qualified && result.nextMilestone && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Next milestone:</p>
                  <p>{result.nextMilestone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {result?.error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{result.error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h5 className="text-sm font-semibold text-purple-900 mb-2">
          Qualification Criteria (Need ANY ONE):
        </h5>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Annual earnings of £10,000 or more</li>
          <li>• 100,000+ total streams</li>
          <li>• 50+ total releases</li>
          <li>• £5,000+ in total commissions paid</li>
        </ul>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { X, DollarSign, CreditCard, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/components/ui/CurrencySelector'

/**
 * Payout Request Modal - App Router Compatible
 * 
 * Extracted from original Pages Router components
 * Now compatible with App Router Client Components
 */

export default function PayoutRequestModal({ 
  isOpen, 
  onClose, 
  wallet, 
  onRequestPayout 
}) {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(wallet?.currency || 'GBP')
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    accountHolderName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate amount
      const payoutAmount = parseFloat(amount)
      if (!payoutAmount || payoutAmount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      if (payoutAmount > wallet?.balance) {
        throw new Error('Payout amount exceeds available balance')
      }

      // Validate bank details
      if (!bankDetails.accountNumber || !bankDetails.routingNumber || !bankDetails.bankName) {
        throw new Error('Please fill in all required bank details')
      }

      // Call the payout request handler
      await onRequestPayout({
        amount: payoutAmount,
        currency,
        bankDetails
      })

      // Reset form and close modal
      setAmount('')
      setBankDetails({
        accountNumber: '',
        routingNumber: '',
        bankName: '',
        accountHolderName: ''
      })
      onClose()

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Request Payout
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Wallet Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Wallet Balance</h3>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(wallet?.balance || 0, wallet?.currency || 'GBP')}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Available for payout
            </div>
          </div>

          {/* Payout Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payout Amount
            </label>
            <div className="flex">
              <input
                type="number"
                step="0.01"
                min="0"
                max={wallet?.balance || 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Bank Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Routing Number / Sort Code
              </label>
              <input
                type="text"
                value={bankDetails.routingNumber}
                onChange={(e) => setBankDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Request Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
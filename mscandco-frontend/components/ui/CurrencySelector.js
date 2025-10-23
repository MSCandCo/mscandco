'use client'

import { useState } from 'react'

/**
 * Currency Selector Component - App Router Compatible
 * 
 * Extracted from original Pages Router components
 * Now compatible with App Router Client Components
 */

export const CurrencySelector = ({ selectedCurrency, onCurrencyChange, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' }
  ]

  const selectedCurr = currencies.find(c => c.code === selectedCurrency) || currencies[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md
          bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${compact ? 'text-sm' : ''}
        `}
      >
        <span className="text-lg">{selectedCurr.symbol}</span>
        {!compact && <span>{selectedCurr.code}</span>}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <div className="py-1">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  onCurrencyChange(currency.code)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3
                  ${selectedCurrency === currency.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                `}
              >
                <span className="text-lg">{currency.symbol}</span>
                <div className="flex-1">
                  <div className="font-medium">{currency.code}</div>
                  <div className="text-sm text-gray-500">{currency.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Currency formatting utility function
 */
export const formatCurrency = (amount, currency = 'GBP', showSymbol = true) => {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    NGN: '₦',
    GHS: '₵',
    KES: 'KSh',
    ZAR: 'R',
    ZMW: 'ZK'
  }

  const symbol = currencySymbols[currency] || currency
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  return showSymbol ? `${symbol}${formattedAmount}` : formattedAmount
}

/**
 * Currency conversion utility (placeholder for real implementation)
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  // This would integrate with a real currency conversion API
  // For now, return a placeholder conversion
  const conversionRates = {
    'GBP-USD': 1.25,
    'GBP-EUR': 1.15,
    'USD-GBP': 0.80,
    'EUR-GBP': 0.87
  }
  
  const rate = conversionRates[`${fromCurrency}-${toCurrency}`] || 1
  return amount * rate
}
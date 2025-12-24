/**
 * Currency Service for MSC & Co
 * Handles currency conversion and formatting
 */

import React from 'react';

// Exchange rates store (GBP as base currency = 1.0)
let exchangeRates = {
  GBP: 1.0,
  USD: 1.27,
  EUR: 1.17, 
  CAD: 1.72,
  NGN: 1580,
  GHS: 19.8,
  KES: 164,
  ZAR: 23.1,
  ZMW: 35.0
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (GBP, USD, EUR)
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'GBP') {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return formatter.format(amount);
}

/**
 * Convert currency amount
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Promise<number>}
 */
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  // For now, return the same amount (you can add real exchange rate API later)
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Placeholder exchange rates (replace with real API)
  const rates = {
    'GBP': 1,
    'USD': 1.27,
    'EUR': 1.17
  };

  const amountInGBP = amount / (rates[fromCurrency] || 1);
  const convertedAmount = amountInGBP * (rates[toCurrency] || 1);

  return convertedAmount;
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string}
 */
export function getCurrencySymbol(currency = 'GBP') {
  const symbols = {
    'GBP': '£',
    'USD': '$',
    'EUR': '€',
    'CAD': 'C$',
    'NGN': '₦',
    'GHS': '₵',
    'KES': 'KSh',
    'ZAR': 'R',
    'ZMW': 'ZK'
  };

  return symbols[currency] || currency;
}

/**
 * Fetch live exchange rates
 * @returns {Promise<object>}
 */
export async function fetchLiveExchangeRates() {
  try {
    // Using exchangerate-api.com (free tier: 1500 requests/month)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/GBP');
    
    if (response.ok) {
      const data = await response.json();
      const newRates = { GBP: 1.0 };
      
      // Map our supported currencies
      const supportedCurrencies = ['USD', 'EUR', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW'];
      supportedCurrencies.forEach(currency => {
        if (data.rates[currency]) {
          newRates[currency] = data.rates[currency];
        }
      });
      
      // Update the exchangeRates store
      Object.assign(exchangeRates, newRates);
      
      // Trigger update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('exchangeRatesUpdated'));
      }
      
      return newRates;
    }
  } catch (error) {
  }
  
  // Return current rates as fallback
  return exchangeRates;
}

/**
 * React hook for currency conversion
 * @param {string} selectedCurrency - Target currency code
 * @returns {object} - Returns convertAmount, formatAmount, and symbol functions
 */
export function useCurrencyConversion(selectedCurrency = 'GBP') {
  const [, forceUpdate] = React.useState({});

  React.useEffect(() => {
    // Listen for exchange rate updates to trigger re-renders
    const handleExchangeRatesUpdated = () => {
      forceUpdate({});
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('exchangeRatesUpdated', handleExchangeRatesUpdated);
      
      return () => {
        window.removeEventListener('exchangeRatesUpdated', handleExchangeRatesUpdated);
      };
    }
  }, []);

  // Convert amount from GBP to selected currency
  const convertAmount = (gbpAmount) => {
    if (!gbpAmount || isNaN(gbpAmount)) return 0;
    if (selectedCurrency === 'GBP') return gbpAmount;
    const rate = exchangeRates[selectedCurrency] || 1.0;
    return gbpAmount * rate;
  };

  // Format amount with currency symbol
  const formatAmount = (gbpAmount) => {
    const converted = convertAmount(gbpAmount);
    const decimals = ['NGN', 'KES', 'ZMW'].includes(selectedCurrency) ? 0 : 2;
    return `${symbol}${converted.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Get currency symbol
  const symbol = getCurrencySymbol(selectedCurrency);

  return { convertAmount, formatAmount, symbol };
}

// 🎯 SHARED CURRENCY SELECTOR COMPONENT
// Provides consistent currency formatting and selection across the platform

import { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { ChevronDown } from 'lucide-react';

const CURRENCIES = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' }
];

export default function CurrencySelector({ 
  selectedCurrency, 
  onCurrencyChange, 
  showLabel = true,
  compact = false,
  className = ""
}) {
  const handleCurrencyChange = (newCurrency) => {
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
    
    // Also store in localStorage for cross-component sync
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCurrency', newCurrency);
      // Dispatch custom event for cross-component communication
      window.dispatchEvent(new CustomEvent('currencyChange', { 
        detail: { currency: newCurrency } 
      }));
    }
  };

  const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <select
          value={selectedCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CURRENCIES.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">Currency:</label>
      )}
      <div className="relative">
        <select
          value={selectedCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {CURRENCIES.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code} - {currency.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

// 💰 Currency formatting utility functions
export const formatCurrency = (amount, currency = 'GBP', options = {}) => {
  if (amount === null || amount === undefined) return formatCurrency(0, currency, options);
  
  const { 
    showSymbol = true, 
    showCode = false, 
    decimals = 0,
    compact = false 
  } = options;
  
  const currencyInfo = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  
  // Format large numbers in compact mode (K, M, B)
  if (compact && Math.abs(amount) >= 1000) {
    const units = ['', 'K', 'M', 'B', 'T'];
    const unitIndex = Math.floor(Math.log10(Math.abs(amount)) / 3);
    const shortAmount = amount / Math.pow(1000, unitIndex);
    const formattedAmount = shortAmount.toFixed(shortAmount < 10 ? 1 : 0);
    const symbol = showSymbol ? currencyInfo.symbol : '';
    const code = showCode ? ` ${currencyInfo.code}` : '';
    return `${symbol}${formattedAmount}${units[unitIndex]}${code}`;
  }
  
  // Standard formatting
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  const symbol = showSymbol ? currencyInfo.symbol : '';
  const code = showCode ? ` ${currencyInfo.code}` : '';
  
  return `${symbol}${formattedAmount}${code}`;
};

// 🔄 Conversion utilities (mock rates for demo)
const EXCHANGE_RATES = {
  GBP: { USD: 1.27, EUR: 1.17, GBP: 1 },
  USD: { GBP: 0.79, EUR: 0.92, USD: 1 },
  EUR: { GBP: 0.85, USD: 1.09, EUR: 1 }
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  
  const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency];
  if (!rate) return amount; // Fallback if rate not found
  
  return amount * rate;
};

// 🎯 Specialized currency display components
export function CurrencyAmount({ 
  amount, 
  currency = 'GBP', 
  compact = false, 
  className = "",
  size = 'normal' // 'small', 'normal', 'large'
}) {
  const sizeClasses = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg font-semibold'
  };
  
  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {formatCurrency(amount, currency, { compact })}
    </span>
  );
}

export function CurrencyChange({ 
  amount, 
  currency = 'GBP', 
  isPositive = null,
  showSign = true,
  className = ""
}) {
  const positive = isPositive !== null ? isPositive : amount > 0;
  const colorClass = positive ? 'text-green-600' : amount < 0 ? 'text-red-600' : 'text-gray-500';
  const sign = showSign ? (positive ? '+' : '') : '';
  
  return (
    <span className={`${colorClass} ${className}`}>
      {sign}{formatCurrency(Math.abs(amount), currency)}
    </span>
  );
}

export function CurrencyRange({ 
  minAmount, 
  maxAmount, 
  currency = 'GBP', 
  separator = ' - ',
  className = ""
}) {
  return (
    <span className={className}>
      {formatCurrency(minAmount, currency)}{separator}{formatCurrency(maxAmount, currency)}
    </span>
  );
}

// 🔗 Hook for currency synchronization across components
export function useCurrencySync(initialCurrency = 'GBP') {
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);

  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedCurrency');
      if (saved && CURRENCIES.some(c => c.code === saved)) {
        setSelectedCurrency(saved);
      }
    }

    // Listen for currency changes from other components
    const handleCurrencyChange = (event) => {
      setSelectedCurrency(event.detail.currency);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('currencyChange', handleCurrencyChange);
      return () => window.removeEventListener('currencyChange', handleCurrencyChange);
    }
  }, []);

  const updateCurrency = (newCurrency) => {
    setSelectedCurrency(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCurrency', newCurrency);
      window.dispatchEvent(new CustomEvent('currencyChange', { 
        detail: { currency: newCurrency } 
      }));
    }
  };

  return [selectedCurrency, updateCurrency];
}
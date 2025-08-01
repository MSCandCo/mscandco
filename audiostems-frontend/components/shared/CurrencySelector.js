// 🎯 SHARED CURRENCY SELECTOR COMPONENT
// Provides consistent currency formatting and selection across the platform
// Base currency: GBP - All amounts are stored in GBP and converted using live rates

import { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { ChevronDown, RefreshCw } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' }
];

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

let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fetch live exchange rates from a free API
const fetchLiveRates = async () => {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION) {
    return exchangeRates;
  }

  try {
    // Using exchangerate-api.com (free tier: 1500 requests/month)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/GBP');
    
    if (response.ok) {
      const data = await response.json();
      const newRates = { GBP: 1.0 };
      
      // Map our supported currencies
      CURRENCIES.forEach(currency => {
        if (currency.code !== 'GBP' && data.rates[currency.code]) {
          newRates[currency.code] = data.rates[currency.code];
        }
      });
      
      exchangeRates = newRates;
      lastFetchTime = now;
      
      // Store in localStorage for offline fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('exchangeRates', JSON.stringify({
          rates: exchangeRates,
          timestamp: now
        }));
      }
    }
  } catch (error) {
    console.warn('Failed to fetch live exchange rates, using cached/fallback rates');
    
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('exchangeRates');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        // Use cached rates if less than 24 hours old
        if (now - parsedCache.timestamp < 24 * 60 * 60 * 1000) {
          exchangeRates = parsedCache.rates;
        }
      }
    }
  }
  
  return exchangeRates;
};

// Get current exchange rate with live updates
export const getExchangeRate = (fromCurrency = 'GBP', toCurrency = 'GBP') => {
  if (fromCurrency === toCurrency) return 1.0;
  if (fromCurrency === 'GBP') return exchangeRates[toCurrency] || 1.0;
  if (toCurrency === 'GBP') return 1.0 / (exchangeRates[fromCurrency] || 1.0);
  
  // Convert via GBP: from -> GBP -> to
  const gbpValue = 1.0 / (exchangeRates[fromCurrency] || 1.0);
  return gbpValue * (exchangeRates[toCurrency] || 1.0);
};

export default function CurrencySelector({ 
  selectedCurrency, 
  onCurrencyChange, 
  showLabel = true,
  compact = false,
  className = "",
  showExchangeRate = true
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Fetch rates on mount
    fetchLiveRates().then(() => {
      setLastUpdated(new Date());
    });
  }, []);

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

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    lastFetchTime = 0; // Force refresh
    await fetchLiveRates();
    setLastUpdated(new Date());
    setIsRefreshing(false);
    
    // Trigger a re-render of all currency displays
    window.dispatchEvent(new CustomEvent('exchangeRatesUpdated'));
  };

  const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];
  const exchangeRate = getExchangeRate('GBP', selectedCurrency);
  const isBaseCurrency = selectedCurrency === 'GBP';

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="relative">
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
        {showExchangeRate && !isBaseCurrency && (
          <span className="text-xs text-gray-500">
            1 GBP = {currentCurrency.symbol}{exchangeRate.toFixed(2)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">Currency:</label>
      )}
      <div className="flex items-center space-x-2">
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
        
        {showExchangeRate && !isBaseCurrency && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>1 GBP = {currentCurrency.symbol}{exchangeRate.toFixed(2)}</span>
          </div>
        )}
        
        <button
          onClick={handleRefreshRates}
          disabled={isRefreshing}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
          title="Refresh exchange rates"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      
      {lastUpdated && (
        <div className="text-xs text-gray-400">
          Updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

// 💰 Currency formatting utility functions
// All amounts are assumed to be in GBP (base currency) and converted as needed
export const formatCurrency = (gbpAmount, displayCurrency = 'GBP', options = {}) => {
  if (gbpAmount === null || gbpAmount === undefined) return formatCurrency(0, displayCurrency, options);
  
  const { 
    showSymbol = true, 
    showCode = false, 
    decimals = 0,
    compact = false 
  } = options;
  
  const currencyInfo = CURRENCIES.find(c => c.code === displayCurrency) || CURRENCIES[0];
  
  // Convert from GBP to display currency
  const convertedAmount = convertCurrency(gbpAmount, 'GBP', displayCurrency);
  
  // Format large numbers in compact mode (K, M, B)
  if (compact && Math.abs(convertedAmount) >= 1000) {
    const units = ['', 'K', 'M', 'B', 'T'];
    const unitIndex = Math.floor(Math.log10(Math.abs(convertedAmount)) / 3);
    const shortAmount = convertedAmount / Math.pow(1000, unitIndex);
    const formattedAmount = shortAmount.toFixed(shortAmount < 10 ? 1 : 0);
    const symbol = showSymbol ? currencyInfo.symbol : '';
    const code = showCode ? ` ${currencyInfo.code}` : '';
    return `${symbol}${formattedAmount}${units[unitIndex]}${code}`;
  }
  
  // Standard formatting
  const formattedAmount = convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  const symbol = showSymbol ? currencyInfo.symbol : '';
  const code = showCode ? ` ${currencyInfo.code}` : '';
  
  return `${symbol}${formattedAmount}${code}`;
};

// 🔄 Convert currency using live exchange rates (GBP as base)
export const convertCurrency = (amount, fromCurrency = 'GBP', toCurrency = 'GBP') => {
  if (fromCurrency === toCurrency) return amount;
  
  // Use the live exchange rate function
  const rate = getExchangeRate(fromCurrency, toCurrency);
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
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedCurrency');
      if (saved && CURRENCIES.some(c => c.code === saved)) {
        setSelectedCurrency(saved);
      }
    }

    // Fetch initial exchange rates
    fetchLiveRates();

    // Listen for currency changes from other components
    const handleCurrencyChange = (event) => {
      setSelectedCurrency(event.detail.currency);
    };

    // Listen for exchange rate updates to trigger re-renders
    const handleExchangeRatesUpdated = () => {
      forceUpdate({});
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('currencyChange', handleCurrencyChange);
      window.addEventListener('exchangeRatesUpdated', handleExchangeRatesUpdated);
      
      return () => {
        window.removeEventListener('currencyChange', handleCurrencyChange);
        window.removeEventListener('exchangeRatesUpdated', handleExchangeRatesUpdated);
      };
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
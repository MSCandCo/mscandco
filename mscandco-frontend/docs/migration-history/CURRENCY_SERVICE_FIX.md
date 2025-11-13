# Currency Service Fix

## Issue
The artist earnings page was throwing a runtime error:
```
formatAmount is not a function. (In 'formatAmount(gbpAmount)', 'formatAmount' is undefined)
```

## Root Cause
The `useCurrencyConversion` hook in `/lib/currency-service.js` was incomplete and didn't return the expected functions that the earnings page was trying to use:
- Expected: `{ convertAmount, formatAmount, symbol }`
- Actual: `{ convertedAmount, loading }`

## Solution Applied

### Updated `/lib/currency-service.js`

1. **Added Exchange Rates Store** at the top of the file:
```javascript
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
```

2. **Updated `getCurrencySymbol` function** to support all currencies:
```javascript
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
```

3. **Updated `fetchLiveExchangeRates` function** to fetch real rates and update the store:
```javascript
export async function fetchLiveExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/GBP');
    
    if (response.ok) {
      const data = await response.json();
      const newRates = { GBP: 1.0 };
      
      const supportedCurrencies = ['USD', 'EUR', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW'];
      supportedCurrencies.forEach(currency => {
        if (data.rates[currency]) {
          newRates[currency] = data.rates[currency];
        }
      });
      
      Object.assign(exchangeRates, newRates);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('exchangeRatesUpdated'));
      }
      
      return newRates;
    }
  } catch (error) {
    console.warn('Failed to fetch live exchange rates, using cached/fallback rates');
  }
  
  return exchangeRates;
}
```

4. **Completely Rewrote `useCurrencyConversion` hook**:
```javascript
export function useCurrencyConversion(selectedCurrency = 'GBP') {
  const [, forceUpdate] = React.useState({});

  React.useEffect(() => {
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
```

## Key Features
- **Live Exchange Rates**: Fetches real rates from exchangerate-api.com
- **Multi-Currency Support**: Supports 9 currencies (GBP, USD, EUR, CAD, NGN, GHS, KES, ZAR, ZMW)
- **Auto-Refresh**: Listens for `exchangeRatesUpdated` events to trigger re-renders
- **Proper Formatting**: Formats amounts with correct decimal places and thousand separators
- **Currency Symbols**: Returns the correct symbol for each currency

## Testing
After these changes:
1. Refresh the browser
2. Navigate to `/artist/earnings`
3. The page should load without errors
4. Currency conversion should work correctly
5. Amounts should display with proper formatting

## Wallet Balance Consistency Issue
The user also reported that wallet balances are inconsistent between:
- Admin Wallet Management page
- Artist Earnings page

This needs further investigation to determine:
1. Which data source is correct
2. Whether they're querying different tables or fields
3. If there's a data synchronization issue

## Status
✅ **Currency Service Fixed** - Earnings page should now load without errors
⚠️ **Wallet Balance Consistency** - Requires further investigation

## Related Files
- `/lib/currency-service.js` - Updated currency service
- `/app/artist/earnings/EarningsClient.js` - Uses the currency service
- `/pages/api/artist/wallet-simple.js` - API for artist wallet data
- `/app/admin/walletmanagement/WalletManagementClient.js` - Admin wallet management


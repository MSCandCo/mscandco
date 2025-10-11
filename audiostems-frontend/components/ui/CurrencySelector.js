/**
 * CurrencySelector - Single source of truth for currency selection
 * Standardized currency list in required order: USD, EUR, GBP, CAD, NGN, GHS, KES, ZAR, ZMW
 */

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' }
];

export function CurrencySelector({
  value,
  onChange,
  className = '',
  showSymbol = true,
  disabled = false
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${className}`}
    >
      {SUPPORTED_CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {showSymbol ? `${currency.symbol} ${currency.code}` : currency.code} - {currency.name}
        </option>
      ))}
    </select>
  );
}

/**
 * Format amount with currency
 */
export function formatCurrency(amount, currencyCode = 'GBP') {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);

  if (!currency) {
    return `${amount} ${currencyCode}`;
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode) {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

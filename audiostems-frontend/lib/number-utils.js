/**
 * Number utilities for handling NaN and invalid values across the platform
 */

/**
 * Formats a number and handles NaN values by replacing them with a fallback
 * @param {number|string} value - The value to format
 * @param {string} fallback - The fallback value to use for NaN (default: '---')
 * @returns {string|number} - The formatted value or fallback
 */
export const formatNumber = (value, fallback = '---') => {
  // Handle null, undefined, empty string
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check for NaN, Infinity, or -Infinity
  if (isNaN(numValue) || !isFinite(numValue)) {
    return fallback;
  }
  
  return numValue;
};

/**
 * Formats a percentage and handles NaN values
 * @param {number} value - The percentage value (0-100)
 * @param {string} fallback - The fallback value (default: '---')
 * @returns {string} - The formatted percentage or fallback
 */
export const formatPercentage = (value, fallback = '---') => {
  const formatted = formatNumber(value, null);
  if (formatted === null || formatted === fallback) {
    return fallback;
  }
  return `${formatted}%`;
};

/**
 * Formats currency and handles NaN values
 * @param {number} value - The currency value
 * @param {string} currency - The currency symbol (default: '$')
 * @param {string} fallback - The fallback value (default: '---')
 * @returns {string} - The formatted currency or fallback
 */
export const formatCurrency = (value, currency = '$', fallback = '---') => {
  const formatted = formatNumber(value, null);
  if (formatted === null || formatted === fallback) {
    return fallback;
  }
  return `${currency}${formatted.toLocaleString()}`;
};

/**
 * Safely performs division and handles divide by zero
 * @param {number} numerator - The numerator
 * @param {number} denominator - The denominator
 * @param {string} fallback - The fallback value (default: '---')
 * @returns {number|string} - The result or fallback
 */
export const safeDivide = (numerator, denominator, fallback = '---') => {
  if (denominator === 0 || denominator === null || denominator === undefined) {
    return fallback;
  }
  
  const result = numerator / denominator;
  return formatNumber(result, fallback);
};

/**
 * Safely rounds a number and handles NaN
 * @param {number} value - The value to round
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {string} fallback - The fallback value (default: '---')
 * @returns {number|string} - The rounded value or fallback
 */
export const safeRound = (value, decimals = 0, fallback = '---') => {
  const formatted = formatNumber(value, null);
  if (formatted === null || formatted === fallback) {
    return fallback;
  }
  
  const multiplier = Math.pow(10, decimals);
  return Math.round(formatted * multiplier) / multiplier;
};

/**
 * Formats a number with thousand separators and handles NaN
 * @param {number} value - The value to format
 * @param {string} fallback - The fallback value (default: '---')
 * @returns {string} - The formatted number or fallback
 */
export const formatThousands = (value, fallback = '---') => {
  const formatted = formatNumber(value, null);
  if (formatted === null || formatted === fallback) {
    return fallback;
  }
  return formatted.toLocaleString();
};

// Export default object for easier importing
export default {
  formatNumber,
  formatPercentage,
  formatCurrency,
  safeDivide,
  safeRound,
  formatThousands
};
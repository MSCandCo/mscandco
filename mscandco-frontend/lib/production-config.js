/**
 * Production configuration utilities for MSC & Co
 * Handles production-specific settings and checks
 */

/**
 * Check if the application is running in production mode
 * @returns {boolean}
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if the application is running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get the application URL based on environment
 * @returns {string}
 */
export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3013';
}

/**
 * Check if all required environment variables are set
 * @returns {object} - { isValid: boolean, missing: string[] }
 */
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Get production status information
 * @returns {object}
 */
export function getProductionStatus() {
  const envValidation = validateEnvironment();

  return {
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    appUrl: getAppUrl(),
    environment: process.env.NODE_ENV,
    environmentValid: envValidation.isValid,
    missingVars: envValidation.missing
  };
}

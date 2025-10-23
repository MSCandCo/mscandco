'use client'

import { useState, useEffect } from 'react';
import { formatDateOfBirth } from '../../lib/date-utils';
import { getCountryFromIP, getUserTimezone, guessCountryFromTimezone } from '../../lib/geolocation-utils';

/**
 * Smart date display component that automatically formats dates based on user's location
 */
export default function SmartDateDisplay({ 
  date, 
  userCountry = '', 
  className = '',
  fallbackText = 'Not set' 
}) {
  const [detectedCountry, setDetectedCountry] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try IP geolocation first
        const ipCountry = await getCountryFromIP();
        
        if (ipCountry) {
          setDetectedCountry(ipCountry);
        } else {
          // Fallback to timezone-based guess
          const timezone = getUserTimezone();
          const timezoneCountry = guessCountryFromTimezone(timezone);
          setDetectedCountry(timezoneCountry);
        }
      } catch (error) {
        console.log('Location detection failed, using defaults');
      } finally {
        setIsLoading(false);
      }
    };

    // Only detect if no user country is provided
    if (!userCountry) {
      detectLocation();
    } else {
      setIsLoading(false);
    }
  }, [userCountry]);

  const formattedDate = formatDateOfBirth(date, userCountry, detectedCountry);

  if (isLoading && !userCountry) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded h-6 w-32 ${className}`}></div>
    );
  }

  return (
    <span className={className}>
      {formattedDate || fallbackText}
    </span>
  );
}

/**
 * Hook for getting smart date formatting function with location detection
 */
export const useSmartDateFormat = (userCountry = '') => {
  const [detectedCountry, setDetectedCountry] = useState('');

  useEffect(() => {
    const detectLocation = async () => {
      if (userCountry) return; // Skip if user country is provided
      
      try {
        const ipCountry = await getCountryFromIP();
        if (ipCountry) {
          setDetectedCountry(ipCountry);
        } else {
          const timezone = getUserTimezone();
          const timezoneCountry = guessCountryFromTimezone(timezone);
          setDetectedCountry(timezoneCountry);
        }
      } catch (error) {
        console.log('Location detection failed');
      }
    };

    detectLocation();
  }, [userCountry]);

  return (date) => formatDateOfBirth(date, userCountry, detectedCountry);
};

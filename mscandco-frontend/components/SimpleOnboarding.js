'use client';

/**
 * Simple Onboarding Form
 * Clean, efficient form-based onboarding without AI complexity
 */

import { useState, useEffect } from 'react';
import { Music, X, CheckCircle } from 'lucide-react';

export default function SimpleOnboarding({ user, onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [formData, setFormData] = useState({
    postal_code: '',
    phone: '',
    bio: '',
  });

  // Check what fields are missing
  useEffect(() => {
    if (user) {
      checkMissingFields();
    }
  }, [user]);

  const checkMissingFields = async () => {
    try {
      const response = await fetch(`/api/artist/profile`);
      const data = await response.json();

      if (data.success && data.profile) {
        const missing = [];

        if (!data.profile.postal_code) missing.push('postal_code');
        if (!data.profile.phone) missing.push('phone');
        if (!data.profile.bio) missing.push('bio');

        setMissingFields(missing);

        // Only show modal if there are missing fields
        if (missing.length > 0) {
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Failed to check profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Only submit fields that were missing
      const dataToSubmit = {};
      missingFields.forEach(field => {
        if (formData[field]) {
          dataToSubmit[field] = formData[field];
        }
      });

      const response = await fetch('/api/artist/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      const data = await response.json();

      if (data.success) {
        setIsOpen(false);
        if (onComplete) onComplete();
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || missingFields.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Music className="w-7 h-7 text-gray-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
              <p className="text-sm text-gray-300">Just a few more details to get started</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
              <p className="text-red-900 text-sm">{error}</p>
            </div>
          )}

          {missingFields.includes('postal_code') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                placeholder="e.g., SE18 2AF"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Your postal/ZIP code</p>
            </div>
          )}

          {missingFields.includes('phone') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g., +44 20 1234 5678"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code if international</p>
            </div>
          )}

          {missingFields.includes('bio') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Artist Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about your music, style, and journey as an artist..."
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Share your story, influences, and what makes your music unique (2-3 sentences)
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Complete Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

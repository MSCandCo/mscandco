'use client';

/**
 * Touring Platform - Create Tour Form
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';
import CurrencySelector, { useCurrencySync, convertCurrency } from '@/components/shared/CurrencySelector';

export default function CreateTourClient({ userId }) {
  const router = useRouter();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    artist_name: '',
    start_date: '',
    end_date: '',
    description: '',
    budget: '',
    tour_type: 'headline'
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Convert budget from selected currency to GBP for storage
      const budgetInGBP = formData.budget 
        ? convertCurrency(parseFloat(formData.budget), selectedCurrency, 'GBP')
        : null;

      const response = await fetch('/api/touring/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
          budget: budgetInGBP,
          currency: 'GBP' // Always store in GBP
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tour');
      }
      
      router.push(`/touring/tours/${data.tour.id}`);
    } catch (err) {
      console.error('Error creating tour:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/touring"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Create New Tour</h1>
              <p className="text-gray-600 mt-1">Set up your tour with AI assistance</p>
            </div>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
              compact={true}
              showExchangeRate={true}
            />
          </div>
        </div>
      </div>
      
      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
          {/* Tour Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tour Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="e.g., Summer 2025 Tour"
            />
          </div>
          
          {/* Artist Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Artist Name *
            </label>
            <input
              type="text"
              required
              value={formData.artist_name}
              onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Your artist name"
            />
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Tour Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tour Type
            </label>
            <select
              value={formData.tour_type}
              onChange={(e) => setFormData({ ...formData, tour_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="headline">Headline</option>
              <option value="support">Support</option>
              <option value="festival">Festival</option>
              <option value="club">Club</option>
              <option value="residency">Residency</option>
            </select>
          </div>
          
          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Budget <span className="text-xs text-gray-500">(in {selectedCurrency})</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Budget will be stored in GBP and converted for display across the platform
            </p>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Tell us about your tour..."
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link
              href="/touring"
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Tour
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* AI Assistant */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-3">
                Ask Apollo AI to help you plan your tour. Just say "I want to create a tour" and Apollo will guide you through the process.
              </p>
              <Link
                href="/ai/chat"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Chat with Apollo →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


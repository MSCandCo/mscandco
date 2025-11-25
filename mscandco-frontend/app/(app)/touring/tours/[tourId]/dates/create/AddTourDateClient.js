'use client';

/**
 * Touring Platform - Add Tour Date Form
 * Beautiful form with venue search integration
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin, Calendar, Clock, Search, Plus } from 'lucide-react';

export default function AddTourDateClient({ tourId, userId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchingVenue, setSearchingVenue] = useState(false);
  const [venueResults, setVenueResults] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  
  const [formData, setFormData] = useState({
    date: '',
    city: '',
    state_province: '',
    country: '',
    show_time: '',
    doors_time: '',
    soundcheck_time: '',
    status: 'pending',
    capacity: '',
    notes: ''
  });
  
  const [venueSearch, setVenueSearch] = useState('');
  
  // Search venues
  const searchVenues = async (query) => {
    if (!query || query.length < 2) {
      setVenueResults([]);
      return;
    }
    
    setSearchingVenue(true);
    try {
      const response = await fetch(`/api/touring/venues?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setVenueResults(data.venues || []);
      }
    } catch (err) {
      console.error('Error searching venues:', err);
    } finally {
      setSearchingVenue(false);
    }
  };
  
  useEffect(() => {
    if (venueSearch) {
      const timeoutId = setTimeout(() => searchVenues(venueSearch), 300);
      return () => clearTimeout(timeoutId);
    } else {
      setVenueResults([]);
    }
  }, [venueSearch]);
  
  const selectVenue = (venue) => {
    setSelectedVenue(venue);
    setFormData({
      ...formData,
      city: venue.city,
      state_province: venue.state_province || '',
      country: venue.country,
      capacity: venue.capacity || ''
    });
    setVenueSearch(venue.name);
    setVenueResults([]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/touring/tours/${tourId}/dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          venue_id: selectedVenue?.id || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tour date');
      }
      
      router.push(`/touring/tours/${tourId}`);
    } catch (err) {
      console.error('Error creating tour date:', err);
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
              href={`/touring/tours/${tourId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Tour Date</h1>
              <p className="text-gray-600 mt-1">Add a new show date to your tour</p>
            </div>
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
          {/* Venue Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Venue Search
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={venueSearch}
                onChange={(e) => setVenueSearch(e.target.value)}
                placeholder="Search for a venue..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              
              {/* Venue Results Dropdown */}
              {venueResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {venueResults.map((venue) => (
                    <button
                      key={venue.id}
                      type="button"
                      onClick={() => selectVenue(venue)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold text-gray-900">{venue.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <MapPin size={14} />
                        {venue.city}, {venue.state_province || ''} {venue.country}
                        {venue.capacity && ` • ${venue.capacity} capacity`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {selectedVenue && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedVenue.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedVenue.address && `${selectedVenue.address}, `}
                      {selectedVenue.city}, {selectedVenue.country}
                    </p>
                    {selectedVenue.phone && (
                      <p className="text-sm text-gray-600 mt-1">📞 {selectedVenue.phone}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVenue(null);
                      setVenueSearch('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Show Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={formData.state_province}
                onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="State/Province"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Country"
              />
            </div>
          </div>
          
          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Doors Time
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="time"
                  value={formData.doors_time}
                  onChange={(e) => setFormData({ ...formData, doors_time: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Show Time
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="time"
                  value={formData.show_time}
                  onChange={(e) => setFormData({ ...formData, show_time: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Soundcheck Time
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="time"
                  value={formData.soundcheck_time}
                  onChange={(e) => setFormData({ ...formData, soundcheck_time: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {/* Status & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="hold">Hold</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Venue capacity"
              />
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Any special notes about this show..."
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link
              href={`/touring/tours/${tourId}`}
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
                  Adding...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Add Tour Date
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


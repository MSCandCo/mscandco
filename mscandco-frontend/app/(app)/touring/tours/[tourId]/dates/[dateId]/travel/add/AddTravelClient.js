'use client';

/**
 * Touring Platform - Add Travel Form
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plane, Car, Train, Ship, Calendar, Clock, MapPin } from 'lucide-react';

export default function AddTravelClient({ tourId, dateId, userId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    travel_type: 'air',
    departure_location: '',
    arrival_location: '',
    departure_date: '',
    departure_time: '',
    arrival_date: '',
    arrival_time: '',
    airline: '',
    flight_number: '',
    transport_company: '',
    vehicle_type: '',
    confirmation_number: '',
    cost: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const departureDateTime = `${formData.departure_date}T${formData.departure_time}:00`;
      const arrivalDateTime = `${formData.arrival_date}T${formData.arrival_time}:00`;
      
      const response = await fetch(`/api/touring/tour-dates/${dateId}/travel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travel_type: formData.travel_type,
          departure_location: formData.departure_location,
          arrival_location: formData.arrival_location,
          departure_time: departureDateTime,
          arrival_time: arrivalDateTime,
          airline: formData.travel_type === 'air' ? formData.airline : null,
          flight_number: formData.travel_type === 'air' ? formData.flight_number : null,
          transport_company: formData.travel_type === 'ground' ? formData.transport_company : null,
          vehicle_type: formData.travel_type === 'ground' ? formData.vehicle_type : null,
          confirmation_number: formData.confirmation_number || null,
          cost: formData.cost ? parseFloat(formData.cost) : null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add travel');
      }
      
      router.push(`/touring/tours/${tourId}/dates/${dateId}?tab=travel`);
    } catch (err) {
      console.error('Error adding travel:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getTravelIcon = () => {
    switch (formData.travel_type) {
      case 'air': return <Plane size={20} />;
      case 'ground': return <Car size={20} />;
      case 'rail': return <Train size={20} />;
      case 'sea': return <Ship size={20} />;
      default: return <Plane size={20} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/touring/tours/${tourId}/dates/${dateId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Travel</h1>
              <p className="text-gray-600 mt-1">Add travel arrangements</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Travel Type *
            </label>
            <select
              required
              value={formData.travel_type}
              onChange={(e) => setFormData({ ...formData, travel_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="air">Air</option>
              <option value="ground">Ground</option>
              <option value="rail">Rail</option>
              <option value="sea">Sea</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Departure Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.departure_location}
                  onChange={(e) => setFormData({ ...formData, departure_location: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="City, Airport, Station"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Arrival Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.arrival_location}
                  onChange={(e) => setFormData({ ...formData, arrival_location: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="City, Airport, Station"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Departure Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  required
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Departure Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="time"
                  required
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Arrival Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  required
                  value={formData.arrival_date}
                  onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Arrival Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="time"
                  required
                  value={formData.arrival_time}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {formData.travel_type === 'air' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Airline
                </label>
                <input
                  type="text"
                  value={formData.airline}
                  onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Delta, United, American"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Flight Number
                </label>
                <input
                  type="text"
                  value={formData.flight_number}
                  onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., DL1234"
                />
              </div>
            </div>
          )}
          
          {formData.travel_type === 'ground' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transport Company
                </label>
                <input
                  type="text"
                  value={formData.transport_company}
                  onChange={(e) => setFormData({ ...formData, transport_company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  <option value="Bus">Bus</option>
                  <option value="Van">Van</option>
                  <option value="Car">Car</option>
                  <option value="Truck">Truck</option>
                  <option value="RV">RV</option>
                </select>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmation Number
              </label>
              <input
                type="text"
                value={formData.confirmation_number}
                onChange={(e) => setFormData({ ...formData, confirmation_number: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Booking confirmation"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link
              href={`/touring/tours/${tourId}/dates/${dateId}`}
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
                  Add Travel
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


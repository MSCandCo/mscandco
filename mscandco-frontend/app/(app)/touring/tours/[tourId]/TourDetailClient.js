'use client';

/**
 * Touring Platform - Tour Detail View
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Plus, Edit, Music } from 'lucide-react';

export default function TourDetailClient({ tourId, userId }) {
  const router = useRouter();
  const [tour, setTour] = useState(null);
  const [dates, setDates] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchTourData();
  }, [tourId]);
  
  const fetchTourData = async () => {
    try {
      setLoading(true);
      
      // Fetch tour
      const tourRes = await fetch(`/api/touring/tours/${tourId}`);
      const tourData = await tourRes.json();
      
      if (!tourRes.ok) {
        throw new Error(tourData.error || 'Failed to fetch tour');
      }
      
      setTour(tourData.tour);
      setDates(tourData.tour.tour_dates || []);
      setCrew(tourData.tour.crew || []);
    } catch (err) {
      console.error('Error fetching tour:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour...</p>
        </div>
      </div>
    );
  }
  
  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Tour not found'}</p>
          <Link href="/touring" className="text-blue-600 hover:underline">
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/touring"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{tour.name}</h1>
                <p className="text-gray-600 mt-1">{tour.artist_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(tour.status)}`}>
                {tour.status}
              </span>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors">
                <Edit size={18} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tour Dates</p>
                <p className="text-3xl font-bold text-gray-900">{dates.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Crew Members</p>
                <p className="text-3xl font-bold text-gray-900">{crew.length}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          {tour.budget && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tour.currency || 'USD'} {parseFloat(tour.budget).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          )}
          
          {tour.start_date && tour.end_date && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.ceil((new Date(tour.end_date) - new Date(tour.start_date)) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          )}
        </div>
        
        {/* Tour Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} />
              Tour Dates
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              <Plus size={18} />
              Add Date
            </button>
          </div>
          
          {dates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No tour dates yet</p>
              <button className="mt-4 text-blue-600 hover:underline">Add your first date</button>
            </div>
          ) : (
            <div className="space-y-4">
              {dates.map((date) => (
                <Link
                  key={date.id}
                  href={`/touring/tours/${tourId}/dates/${date.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(date.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <MapPin size={14} />
                          {date.city}, {date.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {date.venue_id && (
                        <span className="text-sm text-gray-600">Venue: {date.venues?.name || 'Unknown'}</span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        date.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        date.status === 'hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {date.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Crew */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} />
              Crew
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              <Plus size={18} />
              Add Crew Member
            </button>
          </div>
          
          {crew.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No crew members yet</p>
              <button className="mt-4 text-blue-600 hover:underline">Add your first crew member</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crew.map((member) => (
                <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{member.role}</p>
                  {member.email && (
                    <p className="text-sm text-gray-500 mt-1">{member.email}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

/**
 * Touring Platform - Dashboard Client Component
 * Main dashboard for managing tours
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, MapPin, Users, TrendingUp, Sparkles, Music } from 'lucide-react';
import Link from 'next/link';

export default function TouringDashboardClient({ userId }) {
  const router = useRouter();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchTours();
  }, [userId]);
  
  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/touring/tours?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tours');
      }
      
      setTours(data.tours || []);
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTour = () => {
    router.push('/touring/tours/create');
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tours...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Music className="w-8 h-8 text-gray-900" />
                Touring Platform
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered tour management - Plan, execute, and optimize your tours
              </p>
            </div>
            <button
              onClick={handleCreateTour}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Create New Tour
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tours</p>
                <p className="text-3xl font-bold text-gray-900">{tours.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Tours</p>
                <p className="text-3xl font-bold text-green-600">
                  {tours.filter(t => t.status === 'active').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Planning</p>
                <p className="text-3xl font-bold text-blue-600">
                  {tours.filter(t => t.status === 'planning').length}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-600">
                  {tours.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <Link
            href="/touring/analytics"
            className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 shadow-sm border border-purple-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/90 mb-1">Analytics</p>
                <p className="text-2xl font-bold text-white">View Insights</p>
              </div>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </Link>
        </div>
        
        {/* Tours List */}
        {tours.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tours yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first tour to start planning your next adventure
            </p>
            <button
              onClick={handleCreateTour}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus size={20} />
              Create Your First Tour
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`/touring/tours/${tour.id}`}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {tour.name}
                    </h3>
                    <p className="text-sm text-gray-600">{tour.artist_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tour.status)}`}>
                    {tour.status}
                  </span>
                </div>
                
                {tour.start_date && tour.end_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar size={16} />
                    <span>
                      {new Date(tour.start_date).toLocaleDateString()} - {new Date(tour.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {tour.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {tour.description}
                  </p>
                )}
                
                {tour.budget && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <TrendingUp size={16} />
                    <span>
                      Budget: {tour.currency || 'USD'} {parseFloat(tour.budget).toLocaleString()}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


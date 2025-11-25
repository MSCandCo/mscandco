'use client';

/**
 * Touring Platform - Route Optimization UI
 * Visual route planner with map and optimization suggestions
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Route, TrendingDown, Clock, DollarSign, RefreshCw, CheckCircle } from 'lucide-react';

export default function RouteOptimizationClient({ tourId, userId }) {
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [tourDates, setTourDates] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchTourDates();
  }, [tourId]);
  
  const fetchTourDates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/touring/tours/${tourId}/dates`);
      const data = await response.json();
      
      if (data.success) {
        setTourDates(data.dates || []);
      }
    } catch (err) {
      console.error('Error fetching tour dates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const optimizeRoute = async () => {
    try {
      setOptimizing(true);
      setError(null);
      
      const response = await fetch(`/api/touring/route-optimization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          optimizationType: 'distance'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to optimize route');
      }
      
      setOptimizedRoute(data);
    } catch (err) {
      console.error('Error optimizing route:', err);
      setError(err.message);
    } finally {
      setOptimizing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour dates...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/touring/tours/${tourId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Route Optimization</h1>
                <p className="text-gray-600 mt-1">AI-powered route planning and optimization</p>
              </div>
            </div>
            <button
              onClick={optimizeRoute}
              disabled={optimizing || tourDates.length < 2}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} className={optimizing ? 'animate-spin' : ''} />
              {optimizing ? 'Optimizing...' : 'Optimize Route'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {tourDates.length < 2 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Route className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Not Enough Dates</h3>
            <p className="text-gray-600 mb-6">Add at least 2 tour dates to optimize your route</p>
            <Link
              href={`/touring/tours/${tourId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Add Tour Dates
            </Link>
          </div>
        ) : (
          <>
            {/* Current Route */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Current Route</h2>
              <div className="space-y-3">
                {tourDates.map((date, index) => (
                  <div key={date.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {new Date(date.date).toLocaleDateString()} - {date.city}, {date.country}
                      </p>
                      <p className="text-sm text-gray-600">{date.venues?.name || 'Venue TBA'}</p>
                    </div>
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Optimized Route */}
            {optimizedRoute && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Optimized Route</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle size={12} />
                    Optimized
                  </span>
                </div>
                
                {/* Savings Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Route className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-gray-600">Distance Saved</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {optimizedRoute.savings.distance.saved.toFixed(0)} miles
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {optimizedRoute.savings.distance.percentage}% reduction
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <p className="text-sm text-gray-600">Time Saved</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {optimizedRoute.savings.time.saved} {optimizedRoute.savings.time.unit}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-gray-600">Cost Saved</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${optimizedRoute.savings.cost.saved}
                    </p>
                  </div>
                </div>
                
                {/* Optimized Route Order */}
                <div className="space-y-3">
                  {optimizedRoute.optimizedRoute.map((location, index) => (
                    <div key={location.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {new Date(location.date).toLocaleDateString()} - {location.city}, {location.country}
                        </p>
                        <p className="text-sm text-gray-600">{location.venue || 'Venue TBA'}</p>
                        {location.originalOrder !== index && (
                          <p className="text-xs text-blue-600 mt-1">
                            Moved from position {location.originalOrder}
                          </p>
                        )}
                      </div>
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    </div>
                  ))}
                </div>
                
                {/* Recommendations */}
                {optimizedRoute.recommendations && optimizedRoute.recommendations.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                    <ul className="space-y-2">
                      {optimizedRoute.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          • {rec.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


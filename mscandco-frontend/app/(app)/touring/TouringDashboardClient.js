'use client';

/**
 * Touring Platform - Dashboard Client Component
 * Main dashboard for managing tours with Analytics tab
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, MapPin, Users, TrendingUp, Sparkles, Music, DollarSign, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function TouringDashboardClient({ userId }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [stats, setStats] = useState({
    totalTours: 0,
    activeTours: 0,
    totalDates: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    avgAttendance: 0
  });

  useEffect(() => {
    console.log('[TouringDashboard] Component mounted');
    // API route handles authentication server-side, so we can fetch immediately
    fetchTours();
  }, []);
  
  const fetchTours = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);

      console.log('[TouringDashboard] Fetching tours...');

      // API route now authenticates user automatically, no need to pass userId
      const response = await fetch('/api/touring/tours', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('[TouringDashboard] Response status:', response.status);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('[TouringDashboard] Failed to parse JSON response:', parseError);
        const text = await response.text();
        console.error('[TouringDashboard] Response text:', text);
        throw new Error('Invalid response from server. Please check server logs.');
      }

      console.log('[TouringDashboard] Response data:', data);

      if (!response.ok) {
        const errorMsg = data.error || data.details || 'Failed to fetch tours';
        const errorCode = data.code || 'UNKNOWN_ERROR';
        console.error('[TouringDashboard] Error response:', {
          status: response.status,
          error: errorMsg,
          code: errorCode,
          details: data.details
        });
        
        setError(errorMsg);
        setErrorDetails({
          code: errorCode,
          details: data.details,
          status: response.status
        });
        
        // Don't throw - let the UI show the error
        setLoading(false);
        return;
      }

      if (!data.success) {
        const errorMsg = data.error || 'Failed to fetch tours';
        console.error('[TouringDashboard] API returned failure:', errorMsg);
        setError(errorMsg);
        setErrorDetails(data);
        setLoading(false);
        return;
      }

      const fetchedTours = data.tours || [];
      console.log('[TouringDashboard] Successfully fetched', fetchedTours.length, 'tours');
      setTours(fetchedTours);

      // Calculate analytics stats for the Analytics tab
      const activeTours = fetchedTours.filter(t => t.status === 'active').length;
      let totalDates = 0;
      let totalRevenue = 0;
      let totalExpenses = 0;
      let totalAttendance = 0;
      let dateCount = 0;

      // Fetch dates for each tour to calculate stats
      for (const tour of fetchedTours) {
        try {
          const datesRes = await fetch(`/api/touring/tours/${tour.id}/dates`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!datesRes.ok) {
            console.warn(`[TouringDashboard] Failed to fetch dates for tour ${tour.id}, status:`, datesRes.status);
            continue;
          }

          const datesData = await datesRes.json();

          if (datesData.success && datesData.dates) {
            totalDates += datesData.dates.length;

            datesData.dates.forEach(date => {
              if (date.revenue) totalRevenue += parseFloat(date.revenue);
              if (date.expenses) totalExpenses += parseFloat(date.expenses);
              if (date.actual_attendance) {
                totalAttendance += date.actual_attendance;
                dateCount++;
              }
            });
          }
        } catch (err) {
          console.error(`[TouringDashboard] Error fetching dates for tour ${tour.id}:`, err);
          // Don't let date fetch errors break the entire page
        }
      }

      setStats({
        totalTours: fetchedTours.length,
        activeTours,
        totalDates,
        totalRevenue,
        totalExpenses,
        avgAttendance: dateCount > 0 ? Math.round(totalAttendance / dateCount) : 0
      });
    } catch (err) {
      console.error('[TouringDashboard] Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred');
      setErrorDetails({
        message: err.message,
        stack: err.stack,
        name: err.name
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateTour = () => {
    router.push('/touring/tours/create');
  };

  // Calculate analytics metrics
  const netProfit = stats.totalRevenue - stats.totalExpenses;
  const profitMargin = stats.totalRevenue > 0 ? ((netProfit / stats.totalRevenue) * 100).toFixed(1) : 0;

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

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'dashboard'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Music className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Tours</h3>
                <p className="text-sm text-red-700 mb-2">{error}</p>
                {errorDetails && (
                  <div className="text-xs text-red-600 mb-3 space-y-1">
                    {errorDetails.code && (
                      <p><strong>Error Code:</strong> {errorDetails.code}</p>
                    )}
                    {errorDetails.details && (
                      <p><strong>Details:</strong> {errorDetails.details}</p>
                    )}
                    {errorDetails.status && (
                      <p><strong>HTTP Status:</strong> {errorDetails.status}</p>
                    )}
                    {errorDetails.code === 'TABLE_NOT_FOUND' && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-red-800">
                        <p className="font-semibold">Action Required:</p>
                        <p>Please run the database migration to create the tours table:</p>
                        <code className="block mt-1 text-xs">psql -f database/migrations/create_touring_platform.sql</code>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setError(null);
                      setErrorDetails(null);
                      fetchTours();
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-800 underline"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-800 underline"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
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
          </>
        )}

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Across all tours</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <DollarSign className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalExpenses.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Across all tours</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Net Profit</p>
                  {netProfit >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netProfit.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{profitMargin}% margin</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Avg Attendance</p>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.avgAttendance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Per show</p>
              </div>
            </div>

            {/* Tour Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tour Performance</h2>

              {tours.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>No tours yet</p>
                  <button
                    onClick={handleCreateTour}
                    className="mt-4 inline-block text-blue-600 hover:underline"
                  >
                    Create your first tour
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tours.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/touring/tours/${tour.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{tour.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{tour.artist_name}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tour.status)}`}>
                            {tour.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Get intelligent recommendations for route optimization, venue selection, and tour planning.
                  </p>
                  <Link
                    href="/ai/chat"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Sparkles size={16} />
                    Ask Apollo AI
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


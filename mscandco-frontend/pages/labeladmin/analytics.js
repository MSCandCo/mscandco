import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';
import { getUserRoleSync } from '@/lib/user-utils';
import { useRouter } from 'next/router';
import { BarChart3, TrendingUp, Users, Crown, Lock } from 'lucide-react';
import CleanManualDisplay from '@/components/analytics/CleanManualDisplay';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'analytics:access');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function LabelAdminAnalytics() {
  const router = useRouter();
  const { user } = useUser();
    const [connectedArtists, setConnectedArtists] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = getUserRoleSync(user);

  // Permission check
  
  // Load connected artists
  useEffect(() => {
    if (user && userRole === 'label_admin') {
      loadConnectedArtists();
    }
  }, [user, userRole]);

  const loadConnectedArtists = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch accepted artists from API
      const response = await fetch('/api/labeladmin/accepted-artists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load accepted artists');
      }

      const data = await response.json();
      setConnectedArtists(data.artists || []);
      
      // Set first artist as active tab if no summary
      if (data.artists && data.artists.length > 0 && activeTab === 'summary') {
        // Keep summary as default
      }
    } catch (error) {
      console.error('Error loading accepted artists:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{color: '#991b1b'}}>Error Loading Analytics</h2>
          <p className="mb-4" style={{color: '#64748b'}}>{error}</p>
          <button
            onClick={loadConnectedArtists}
            className="px-4 py-2 text-white rounded-lg font-medium transition-all"
            style={{background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'}}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3" />
            Label Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            View analytics for all your connected artists
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap -mb-px">
              {/* Summary Tab */}
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-3 rounded-t-lg text-sm font-medium transition-all mr-2 ${
                  activeTab === 'summary'
                    ? 'text-white shadow-md border-b-2 border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                style={activeTab === 'summary' ? {background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'} : {}}
              >
                <span className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Summary (All Artists)
                  <span className="ml-2 text-xs text-white px-2 py-1 rounded-full opacity-90 flex items-center" style={{background: '#1f2937'}}>
                    <Crown className="w-3 h-3 mr-1" />
                    Auto
                  </span>
                </span>
              </button>

              {/* Individual Artist Tabs */}
              {connectedArtists.map(artist => (
                <button
                  key={artist.artistId}
                  onClick={() => setActiveTab(artist.artistId)}
                  className={`px-6 py-3 rounded-t-lg text-sm font-medium transition-all mr-2 ${
                    activeTab === artist.artistId
                      ? 'text-white shadow-md border-b-2 border-transparent'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  style={activeTab === artist.artistId ? {background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'} : {}}
                >
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {artist.artistName || 'Unknown Artist'}
                    <span className="ml-2 text-xs opacity-75">Manual</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'summary' ? (
            <SummaryAnalytics connectedArtists={connectedArtists} />
          ) : (
            <CleanManualDisplay 
              artistId={activeTab} 
              showAdvanced={true}
              isLabelAdmin={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Summary Analytics Component (Auto-calculated from all artists)
function SummaryAnalytics({ connectedArtists }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateSummaryData();
  }, [connectedArtists]);

  const calculateSummaryData = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;

      // Fetch analytics data for all connected artists
      const artistAnalytics = await Promise.all(
        connectedArtists.map(async (artist) => {
          try {
            const response = await fetch(`/api/analytics/artist/${artist.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch (error) {
            console.error(`Error fetching analytics for artist ${artist.id}:`, error);
            return null;
          }
        })
      );

      // Calculate totals
      const validAnalytics = artistAnalytics.filter(data => data !== null);
      const summary = {
        totalStreams: validAnalytics.reduce((sum, data) => sum + (data.totalStreams || 0), 0),
        totalEarnings: validAnalytics.reduce((sum, data) => sum + (data.totalEarnings || 0), 0),
        totalReleases: validAnalytics.reduce((sum, data) => sum + (data.totalReleases || 0), 0),
        averageStreamsPerRelease: 0,
        topGenres: {},
        monthlyGrowth: 0,
        artistCount: connectedArtists.length
      };

      // Calculate average streams per release
      if (summary.totalReleases > 0) {
        summary.averageStreamsPerRelease = Math.round(summary.totalStreams / summary.totalReleases);
      }

      // Aggregate top genres
      validAnalytics.forEach(data => {
        if (data.topGenres) {
          Object.entries(data.topGenres).forEach(([genre, count]) => {
            summary.topGenres[genre] = (summary.topGenres[genre] || 0) + count;
          });
        }
      });

      setSummaryData(summary);
    } catch (error) {
      console.error('Error calculating summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Calculating summary analytics...</p>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">No analytics data available for connected artists.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Label Analytics Summary</h2>
        <p className="text-gray-600">Automatically calculated from all {summaryData.artistCount} connected artists</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Streams</p>
              <p className="text-2xl font-bold text-blue-900">{summaryData.totalStreams.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-900">£{summaryData.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Total Releases</p>
              <p className="text-2xl font-bold text-purple-900">{summaryData.totalReleases}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Connected Artists</p>
              <p className="text-2xl font-bold text-orange-900">{summaryData.artistCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Streams per Release</span>
              <span className="font-semibold text-gray-900">{summaryData.averageStreamsPerRelease.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Earnings per Release</span>
              <span className="font-semibold text-gray-900">
                £{summaryData.totalReleases > 0 ? (summaryData.totalEarnings / summaryData.totalReleases).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Releases per Artist</span>
              <span className="font-semibold text-gray-900">
                {summaryData.artistCount > 0 ? (summaryData.totalReleases / summaryData.artistCount).toFixed(1) : '0.0'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Genres</h3>
          <div className="space-y-3">
            {Object.entries(summaryData.topGenres)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([genre, count]) => (
                <div key={genre} className="flex justify-between items-center">
                  <span className="text-gray-600">{genre}</span>
                  <span className="font-semibold text-gray-900">{count} releases</span>
                </div>
              ))}
            {Object.keys(summaryData.topGenres).length === 0 && (
              <p className="text-gray-500 text-center py-4">No genre data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
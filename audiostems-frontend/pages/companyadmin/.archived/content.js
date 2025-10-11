// Company Admin Content - COMPLETE REBUILD - REAL DATA ONLY
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { 
  Music, Users, BarChart3, TrendingUp, Eye, Edit3,
  CheckCircle, Clock, XCircle, AlertTriangle, Calendar
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';

export default function CompanyAdminContent() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  
  // Real database state
  const [users, setUsers] = useState([]);
  const [releases, setReleases] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoading && user) {
      loadRealContentData();
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const loadRealContentData = async () => {
    try {
      console.log('🎵 Loading REAL content data - NO MOCK DATA');
      
      // Load real users
      const usersResponse = await fetch('/api/admin/bypass-users');
      const usersResult = await usersResponse.json();

      if (usersResult.success) {
        const realUsers = usersResult.users;
        const realReleases = usersResult.releases || [];
        
        setUsers(realUsers);
        setReleases(realReleases);

        // Calculate REAL statistics
        const realStats = {
          totalAssets: realReleases.length,
          activeArtists: realUsers.filter(u => u.role === 'artist' && u.totalReleases > 0).length,
          totalStreams: realReleases.reduce((sum, r) => sum + (r.totalStreams || 0), 0),
          totalRevenue: realReleases.reduce((sum, r) => sum + (r.totalRevenue || 0), 0),
          
          // Release status breakdown
          liveReleases: realReleases.filter(r => r.status === 'live').length,
          pendingReleases: realReleases.filter(r => r.status === 'submitted' || r.status === 'in_review').length,
          draftReleases: realReleases.filter(r => r.status === 'draft').length,
          
          // Platform distribution
          platformDistribution: {
            spotify: realReleases.filter(r => r.platform_stats?.spotify).length,
            appleMusic: realReleases.filter(r => r.platform_stats?.appleMusic).length,
            youtube: realReleases.filter(r => r.platform_stats?.youtube).length
          }
        };

        setStats(realStats);
        console.log('✅ REAL content stats calculated:', realStats);
        setError(null);
      } else {
        setError('Failed to load real data from database');
      }
    } catch (error) {
      console.error('❌ Error loading real content data:', error);
      setError('Failed to connect to database');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading real content data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Content Error</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={loadRealContentData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Content Management - Real Data"
        description="Company Admin content management with real database integration"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">REAL DATA - Manage releases and assets across all labels and artists</p>
          </div>
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={updateCurrency}
            compact={true}
          />
        </div>

        {/* REAL Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">Total Assets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAssets || 0}</p>
                <p className="text-sm text-blue-600 mt-1">REAL COUNT</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">Active Artists</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeArtists || 0}</p>
                <p className="text-sm text-green-600 mt-1">REAL COUNT</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">Total Streams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStreams || 0}</p>
                <p className="text-sm text-purple-600 mt-1">REAL COUNT</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalRevenue || 0, selectedCurrency)}</p>
                <p className="text-sm text-orange-600 mt-1">REAL AMOUNT</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Real Releases Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Platform Releases ({releases.length})</h3>
                <p className="text-sm text-green-700">REAL DATA from releases table</p>
              </div>
              <button
                onClick={loadRealContentData}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Refresh Real Data
              </button>
            </div>
          </div>

          {releases.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No releases in database</p>
              <p className="text-gray-400 text-sm">Real count from releases table: 0</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Release</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {releases.map((release) => (
                    <tr key={release.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{release.title}</div>
                          <div className="text-sm text-gray-500">{release.release_type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{release.artist_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {release.label_admin_id ? 'Label Managed' : 'Independent'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          release.status === 'live' ? 'bg-green-100 text-green-800' :
                          release.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          release.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {release.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(release.totalRevenue || 0, selectedCurrency)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real Data Summary */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Release Status (Real Data)</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Live Releases</span>
                <span className="font-semibold text-green-600">{stats.liveReleases || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending Approval</span>
                <span className="font-semibold text-yellow-600">{stats.pendingReleases || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Draft Releases</span>
                <span className="font-semibold text-gray-600">{stats.draftReleases || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Artist Activity (Real Data)</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Artists</span>
                <span className="font-semibold text-blue-600">{users.filter(u => u.role === 'artist').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Artists</span>
                <span className="font-semibold text-green-600">{stats.activeArtists || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">With Subscriptions</span>
                <span className="font-semibold text-purple-600">{users.filter(u => u.role === 'artist' && u.hasActiveSubscription).length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Database Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold text-blue-600">{users.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Releases</span>
                <span className="font-semibold text-green-600">{releases.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Data Source</span>
                <span className="font-semibold text-green-600">REAL DB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

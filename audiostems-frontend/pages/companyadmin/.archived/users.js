// Company Admin Users Page - COMPLETE REBUILD - REAL DATA ONLY
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { 
  Users, Search, Eye, TrendingUp, DollarSign, Building2,
  CheckCircle, AlertTriangle, Shield, Calendar
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';

export default function CompanyAdminUsers() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoading && user) {
      loadRealUsers();
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const loadRealUsers = async () => {
    try {
      console.log('👥 Loading REAL users - NO MOCK DATA');
      
      const response = await fetch('/api/admin/bypass-users');
      const result = await response.json();

      if (result.success) {
        console.log('✅ REAL users loaded:', result.stats);
        setUsers(result.users);
        setStats(result.stats);
        setError(null);
      } else {
        console.error('❌ Failed to load users:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setError('Failed to connect to database');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading real users from database...</p>
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
            <h2 className="text-xl font-bold text-slate-900 mb-2">Database Error</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={loadRealUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Filter for Company Admin view (only artists and label admins)
  const visibleUsers = users.filter(u => ['artist', 'label_admin'].includes(u.role));

  return (
    <MainLayout>
      <SEO 
        title="Users Management - Real Data"
        description="Company Admin users with real database integration"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Users className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Users Management</h1>
              </div>
              <p className="text-blue-100 text-lg">
                REAL DATABASE DATA - {visibleUsers.length} users visible to Company Admin
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Total Platform Users</div>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
              <div className="text-xs text-blue-200">
                All 6 roles in database
              </div>
            </div>
          </div>
        </div>

        {/* REAL Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Artists</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.byRole?.artist || 0}
                </p>
                <p className="text-xs text-green-600">REAL COUNT</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Label Admins</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.byRole?.label_admin || 0}
                </p>
                <p className="text-xs text-blue-600">REAL COUNT</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Releases</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalReleases || 0}
                </p>
                <p className="text-xs text-purple-600">
                  {stats.liveReleases || 0} live
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active Subscriptions</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.activeSubscriptions || 0}
                </p>
                <p className="text-xs text-orange-600">REAL COUNT</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Database Status</h3>
              <p className="text-sm text-slate-600">Real-time data from user_profiles table</p>
            </div>
            <button
              onClick={loadRealUsers}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Refresh Real Data
            </button>
          </div>
        </div>

        {/* REAL Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-green-50">
            <h3 className="text-lg font-semibold text-slate-900">
              Platform Users ({visibleUsers.length}) - REAL DATABASE DATA
            </h3>
            <p className="text-sm text-green-700">Source: user_profiles table (no mock data)</p>
          </div>

          {visibleUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No users found in database</p>
              <p className="text-slate-400 text-sm">
                Database query returned 0 artists and label admins
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Releases</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visibleUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            user.role === 'artist' ? 'bg-green-500' : 'bg-blue-500'
                          }`}>
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{user.displayName}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'artist' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.roleDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {user.hasActiveSubscription ? (
                            <span className="text-green-600 font-medium">
                              {user.subscriptionTier?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                            </span>
                          ) : (
                            <span className="text-slate-400">No Subscription</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{user.totalReleases}</div>
                        <div className="text-xs text-slate-500">{user.liveReleases} live</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          {user.hasAnalyticsData && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="Analytics Data"></span>
                          )}
                          {user.hasEarningsData && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" title="Earnings Data"></span>
                          )}
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

        {/* Debug Info */}
        <div className="mt-8 bg-slate-100 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Database Debug Info</h4>
          <div className="text-xs text-slate-600 space-y-1">
            <div>Total users in database: {stats.total || 0}</div>
            <div>Artists: {stats.byRole?.artist || 0}</div>
            <div>Label Admins: {stats.byRole?.label_admin || 0}</div>
            <div>Company Admins: {stats.byRole?.company_admin || 0}</div>
            <div>Super Admins: {stats.byRole?.super_admin || 0}</div>
            <div>Distribution Partners: {stats.byRole?.distribution_partner || 0}</div>
            <div>Custom Admins: {stats.byRole?.custom_admin || 0}</div>
            <div>Active Subscriptions: {stats.activeSubscriptions || 0}</div>
            <div>Total Releases: {stats.totalReleases || 0}</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

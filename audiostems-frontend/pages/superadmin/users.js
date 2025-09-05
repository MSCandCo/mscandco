// Super Admin Users - COMPLETE REBUILD - REAL DATA ONLY
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { 
  Shield, Users, Settings, Eye, Edit3, Plus, Trash2,
  AlertTriangle, CheckCircle, Crown, Lock, Search
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';

export default function SuperAdminUsers() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Real database state
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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
      console.log('👑 Super Admin loading ALL REAL users - NO MOCK DATA');
      
      const response = await fetch('/api/admin/bypass-users');
      const result = await response.json();

      if (result.success) {
        console.log('✅ ALL users loaded for Super Admin:', result.stats);
        setAllUsers(result.users);
        setFilteredUsers(result.users); // Initialize filtered users
        setStats(result.stats);
        setError(null);
      } else {
        setError('Failed to load users from database');
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setError('Failed to connect to database');
    }
  };

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = [...allUsers];

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.hasActiveSubscription);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(user => !user.hasActiveSubscription);
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchLower) ||
        user.first_name?.toLowerCase().includes(searchLower) ||
        user.last_name?.toLowerCase().includes(searchLower) ||
        user.artist_name?.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.custom_admin_title?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredUsers(filtered);
  }, [allUsers, searchTerm, roleFilter, statusFilter]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading all platform users...</p>
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
            <h2 className="text-xl font-bold text-slate-900 mb-2">Super Admin Error</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={loadRealUsers}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
        title="Super Admin - All Users"
        description="Super Admin user management with complete platform access"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Crown className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Super Admin - All Users</h1>
              </div>
              <p className="text-red-100 text-lg">
                Complete platform oversight - {stats.total || 0} total users across all 6 roles
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-100">Platform Users</div>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
              <div className="text-xs text-red-200">All roles visible</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Roles</option>
                <option value="artist">Artists</option>
                <option value="label_admin">Label Admins</option>
                <option value="company_admin">Company Admins</option>
                <option value="super_admin">Super Admins</option>
                <option value="distribution_partner">Distribution Partners</option>
                <option value="custom_admin">Custom Admins</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Subscription</option>
                <option value="inactive">No Subscription</option>
              </select>
              <button
                onClick={loadRealUsers}
                className="flex items-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ALL 6 Roles Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200 text-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.byRole?.artist || 0}</p>
            <p className="text-xs text-slate-600">Artists</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200 text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.byRole?.label_admin || 0}</p>
            <p className="text-xs text-slate-600">Label Admins</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200 text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.byRole?.company_admin || 0}</p>
            <p className="text-xs text-slate-600">Company Admins</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200 text-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Crown className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.byRole?.super_admin || 0}</p>
            <p className="text-xs text-slate-600">Super Admins</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200 text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Settings className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.byRole?.distribution_partner || 0}</p>
            <p className="text-xs text-slate-600">Distribution Partners</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200 text-center">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.byRole?.custom_admin || 0}</p>
            <p className="text-xs text-slate-600">Custom Admins</p>
          </div>
        </div>

        {/* All Users Table - REAL DATA */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-red-50">
            <h3 className="text-lg font-semibold text-slate-900">
              All Platform Users ({filteredUsers.length} of {allUsers.length}) - REAL DATABASE DATA
            </h3>
            <p className="text-sm text-red-700">Complete visibility across all 6 user roles</p>
          </div>

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
                {filteredUsers.map((user) => {
                  const roleColors = {
                    artist: 'bg-green-500',
                    label_admin: 'bg-blue-500', 
                    company_admin: 'bg-purple-500',
                    super_admin: 'bg-red-500',
                    distribution_partner: 'bg-orange-500',
                    custom_admin: 'bg-indigo-500'
                  };

                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${roleColors[user.role]}`}>
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{user.displayName}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                            {user.custom_admin_title && (
                              <div className="text-xs text-indigo-600 font-medium">{user.custom_admin_title}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${roleColors[user.role]}`}>
                          {user.role.replace('_', ' ').toUpperCase()}
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
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="Analytics"></span>
                          )}
                          {user.hasEarningsData && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" title="Earnings"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          {user.role === 'custom_admin' && (
                            <button 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPermissionsModal(true);
                              }}
                              className="flex items-center px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Permissions
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Admin Permissions Modal */}
        {showPermissionsModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Manage Permissions</h3>
                    <p className="text-indigo-100">{selectedUser.displayName} - {selectedUser.custom_admin_title}</p>
                  </div>
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="text-white hover:text-indigo-200 p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-slate-600 mb-4">
                  Permissions management interface would go here. This Custom Admin can be assigned specific permissions.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Status */}
        <div className="mt-8 bg-red-50 rounded-xl p-4 border border-red-200">
          <h4 className="text-sm font-semibold text-red-900 mb-2">Super Admin Database Overview</h4>
          <div className="text-xs text-red-800 grid grid-cols-3 md:grid-cols-6 gap-4">
            <div>Total Users: {stats.total || 0}</div>
            <div>Artists: {stats.byRole?.artist || 0}</div>
            <div>Label Admins: {stats.byRole?.label_admin || 0}</div>
            <div>Company Admins: {stats.byRole?.company_admin || 0}</div>
            <div>Distribution Partners: {stats.byRole?.distribution_partner || 0}</div>
            <div>Custom Admins: {stats.byRole?.custom_admin || 0}</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

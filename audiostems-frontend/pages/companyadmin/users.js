// Company Admin Users Page - REBUILT FROM SCRATCH
// Real database integration, no mock data
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Users, Search, Filter, Eye, UserCheck, UserX, Shield, Calendar, Mail, 
  Building2, TrendingUp, DollarSign, Settings, Globe, Target, AlertTriangle,
  Plus, Edit3, Trash2, CheckCircle
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getUserRole } from '@/lib/user-utils';

export default function CompanyAdminUsersRebuilt() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Real database state
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', title: '', message: '' });

  // Check admin access and load real users
  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (role !== 'company_admin' && role !== 'super_admin') {
        router.push('/dashboard');
        return;
      }
      loadRealUsers();
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Load real users from database - NO MOCK DATA
  const loadRealUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('👥 Loading REAL users from database...');

      // Query the rebuilt user_profiles table
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          subscriptions!subscriptions_user_id_fkey(
            tier,
            status,
            amount,
            expires_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error);
        showNotification('error', 'Database Error', 'Failed to load users from database');
        return;
      }

      console.log('✅ Raw database users loaded:', users?.length || 0);

      // Get release counts for each user
      const { data: releases, error: releasesError } = await supabase
        .from('releases')
        .select('artist_id, status');

      const releaseCountMap = {};
      if (releases) {
        releases.forEach(release => {
          if (!releaseCountMap[release.artist_id]) {
            releaseCountMap[release.artist_id] = { total: 0, live: 0, draft: 0 };
          }
          releaseCountMap[release.artist_id].total++;
          releaseCountMap[release.artist_id][release.status] = 
            (releaseCountMap[release.artist_id][release.status] || 0) + 1;
        });
      }

      // Get artist request counts for label admins
      const { data: requests, error: requestsError } = await supabase
        .from('artist_requests')
        .select('from_label_id, status');

      const requestCountMap = {};
      if (requests) {
        requests.forEach(request => {
          if (!requestCountMap[request.from_label_id]) {
            requestCountMap[request.from_label_id] = { pending: 0, accepted: 0, declined: 0 };
          }
          requestCountMap[request.from_label_id][request.status]++;
        });
      }

      // Enhance users with real calculated data
      const enhancedUsers = (users || []).map(user => {
        const activeSubscription = user.subscriptions?.find(sub => sub.status === 'active');
        const releaseStats = releaseCountMap[user.id] || { total: 0, live: 0, draft: 0 };
        const requestStats = requestCountMap[user.id] || { pending: 0, accepted: 0, declined: 0 };
        
        return {
          ...user,
          // Real subscription data
          hasActiveSubscription: !!activeSubscription,
          subscriptionTier: activeSubscription?.tier || 'none',
          subscriptionExpiresAt: activeSubscription?.expires_at,
          
          // Real release counts
          totalReleases: releaseStats.total,
          liveReleases: releaseStats.live || 0,
          draftReleases: releaseStats.draft || 0,
          
          // Real request counts (for label admins)
          pendingRequests: requestStats.pending,
          acceptedRequests: requestStats.accepted,
          
          // Data availability
          hasAnalyticsData: !!user.chartmetric_data,
          hasEarningsData: !!user.earnings_data,
          
          // Display formatting
          displayName: user.artist_name || 
                      `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                      user.email,
          
          lastActiveFormatted: user.last_active_at ? 
            new Date(user.last_active_at).toLocaleDateString() : 'Never',
          
          roleDisplay: user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          
          // Status indicators
          isActive: user.subscription_status === 'active',
          subscriptionStatusDisplay: user.subscription_status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'None'
        };
      });

      setAllUsers(enhancedUsers);
      
      // Company Admin should only see Artists and Label Admins
      const visibleUsers = enhancedUsers.filter(u => ['artist', 'label_admin'].includes(u.role));
      setFilteredUsers(visibleUsers);

      console.log('📊 REAL USERS DATA LOADED:', {
        totalInDatabase: enhancedUsers.length,
        visibleToCompanyAdmin: visibleUsers.length,
        artists: visibleUsers.filter(u => u.role === 'artist').length,
        labelAdmins: visibleUsers.filter(u => u.role === 'label_admin').length,
        withActiveSubscriptions: visibleUsers.filter(u => u.hasActiveSubscription).length,
        withReleases: visibleUsers.filter(u => u.totalReleases > 0).length
      });

    } catch (error) {
      console.error('❌ Error loading users:', error);
      showNotification('error', 'Connection Error', 'Failed to connect to database');
    } finally {
      setUsersLoading(false);
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
        user.displayName?.toLowerCase().includes(searchLower)
      );
    }

    // Only show artists and label admins to company admin
    filtered = filtered.filter(u => ['artist', 'label_admin'].includes(u.role));
    
    setFilteredUsers(filtered);
  }, [allUsers, searchTerm, roleFilter, statusFilter]);

  const showNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => setNotification({ show: false, type: '', title: '', message: '' }), 5000);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  if (loading || usersLoading) {
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

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-600">Please log in to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Users Management - Company Admin"
        description="Manage all platform users with real database data"
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
                Real-time user data from database - {filteredUsers.length} users visible
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Total Platform Users</div>
              <div className="text-2xl font-bold">{allUsers.length}</div>
              <div className="text-xs text-blue-200">
                {allUsers.filter(u => u.hasActiveSubscription).length} with active subscriptions
              </div>
            </div>
          </div>
        </div>

        {/* Real Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Artists</p>
                <p className="text-3xl font-bold text-slate-900">
                  {filteredUsers.filter(u => u.role === 'artist').length}
                </p>
                <p className="text-xs text-green-600">
                  {filteredUsers.filter(u => u.role === 'artist' && u.hasActiveSubscription).length} with subscriptions
                </p>
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
                  {filteredUsers.filter(u => u.role === 'label_admin').length}
                </p>
                <p className="text-xs text-blue-600">
                  {filteredUsers.filter(u => u.role === 'label_admin').reduce((sum, u) => sum + u.acceptedRequests, 0)} artists managed
                </p>
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
                  {filteredUsers.reduce((sum, u) => sum + u.totalReleases, 0)}
                </p>
                <p className="text-xs text-purple-600">
                  {filteredUsers.reduce((sum, u) => sum + u.liveReleases, 0)} live releases
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
                  {filteredUsers.filter(u => u.hasActiveSubscription).length}
                </p>
                <p className="text-xs text-orange-600">
                  {Math.round((filteredUsers.filter(u => u.hasActiveSubscription).length / filteredUsers.length) * 100)}% conversion rate
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
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
                  placeholder="Search users by name, email, or artist name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="artist">Artists</option>
                <option value="label_admin">Label Admins</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Subscription</option>
                <option value="inactive">No Subscription</option>
              </select>
              <button
                onClick={loadRealUsers}
                className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Real Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Platform Users ({filteredUsers.length})
            </h3>
            <p className="text-sm text-slate-600">Real data from user_profiles table</p>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No users found</p>
              <p className="text-slate-400 text-sm">
                {searchTerm ? 'Try adjusting your search criteria' : 'No users match the current filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Releases</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'artist' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.roleDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {user.hasActiveSubscription ? (
                            <span className="text-green-600 font-medium">
                              {user.subscriptionTier.replace('_', ' ').toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-slate-400">No Subscription</span>
                          )}
                        </div>
                        {user.subscriptionExpiresAt && (
                          <div className="text-xs text-slate-500">
                            Expires: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{user.totalReleases}</div>
                        {user.totalReleases > 0 && (
                          <div className="text-xs text-slate-500">
                            {user.liveReleases} live, {user.draftReleases} draft
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.hasAnalyticsData && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="Has Analytics Data"></span>
                          )}
                          {user.hasEarningsData && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" title="Has Earnings Data"></span>
                          )}
                          {!user.hasAnalyticsData && !user.hasEarningsData && (
                            <span className="text-xs text-slate-400">No data</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {user.lastActiveFormatted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
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

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.displayName}</h3>
                    <p className="text-blue-100">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-white hover:text-blue-200 p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Role</label>
                    <p className="text-lg text-slate-900">{selectedUser.roleDisplay}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Subscription</label>
                    <p className="text-lg text-slate-900">{selectedUser.subscriptionStatusDisplay}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Total Releases</label>
                    <p className="text-lg text-slate-900">{selectedUser.totalReleases}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Last Active</label>
                    <p className="text-lg text-slate-900">{selectedUser.lastActiveFormatted}</p>
                  </div>
                </div>

                {selectedUser.role === 'label_admin' && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Artist Requests</label>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-xl font-bold text-yellow-600">{selectedUser.pendingRequests}</div>
                        <div className="text-xs text-yellow-600">Pending</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">{selectedUser.acceptedRequests}</div>
                        <div className="text-xs text-green-600">Accepted</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="text-xl font-bold text-slate-600">
                          {(selectedUser.pendingRequests || 0) + (selectedUser.acceptedRequests || 0)}
                        </div>
                        <div className="text-xs text-slate-600">Total Sent</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Close
                  </button>
                  {selectedUser.role === 'artist' && (
                    <Link href={`/companyadmin/analytics-management?artist=${selectedUser.id}`}>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Manage Analytics
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MSC & Co Branded Notification */}
        {notification.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className={`flex items-center mb-4 ${
                notification.type === 'error' ? 'text-red-600' : 'text-green-600'
              }`}>
                {notification.type === 'error' ? (
                  <AlertTriangle className="w-6 h-6 mr-3" />
                ) : (
                  <CheckCircle className="w-6 h-6 mr-3" />
                )}
                <h3 className="text-lg font-semibold">{notification.title}</h3>
              </div>
              <p className="text-slate-600 mb-6">{notification.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setNotification({ show: false, type: '', title: '', message: '' })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

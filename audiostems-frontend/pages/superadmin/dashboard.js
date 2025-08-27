import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { 
  Users, FileText, Music, BarChart3, PieChart, 
  TrendingUp, TrendingDown, DollarSign, Eye,
  Play, Pause, CheckCircle, Clock, AlertTriangle,
  Globe, Calendar, Database, Settings, Shield,
  UserCheck, Activity, Target, Zap, Building2, X, Search, Wallet
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { getEmptyDashboardStats, getReleases, RELEASES } from '../../lib/emptyData';
import { dashboardAPI } from '../../lib/api-client';
import { getUserRoleSync } from '../../lib/user-utils';
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS } from '../../lib/constants';

export default function AdminDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [dashboardData, setDashboardData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showGhostModal, setShowGhostModal] = useState(false);
  const [selectedGhostUser, setSelectedGhostUser] = useState(null);
  const [ghostSearchTerm, setGhostSearchTerm] = useState('');
  


  // Authentication and access checks
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      const role = getUserRoleSync(user);
      if (!['super_admin', 'company_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      loadDashboardData();
    }
  }, [user, isLoading, router]);

  // Handle ghost login hash navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#ghost') {
      setShowGhostModal(true);
      // Clear the hash after opening modal
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, []);

  // Clear search when modal is closed
  useEffect(() => {
    if (!showGhostModal) {
      setGhostSearchTerm('');
    }
  }, [showGhostModal]);

  // Load real dashboard data using comprehensive API
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get session token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Call the new comprehensive admin APIs
      const [dashboardResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!dashboardResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardResult = await dashboardResponse.json();
      const usersResult = await usersResponse.json();
      
      if (dashboardResult.success && usersResult.success) {
        setDashboardData(dashboardResult.data);
        setAllUsers(usersResult.data || []);
      } else {
        throw new Error('API returned error response');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty stats
      setDashboardData(getEmptyDashboardStats());
      setAllUsers([]);
      setLoading(false);
    }
  };

  // Loading state
  if (isLoading || !user || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Get user role and data
  const userRole = getUserRoleSync(user);
  const adminData = dashboardData || getEmptyDashboardStats().superAdmin;
  const allReleases = getReleases(); // TODO: Make this async too





  // Loading state
  if (isLoading || loading || !dashboardData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {userRole === 'super_admin' ? 'Super Admin Dashboard' : 'Company Admin Dashboard'}
            </h1>
            <p className="text-blue-100 text-lg">
              {userRole === 'super_admin' 
                ? 'Complete platform oversight and management' 
                : 'Brand management and user administration'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Platform Health</div>
            <div className="text-2xl font-bold">{adminData?.platformHealth || 0}%</div>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
              <p className="font-bold text-gray-900 text-3xl">{adminData?.totalUsers?.toLocaleString() || 0}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{adminData?.userGrowth > 0 ? '+' : ''}{adminData?.userGrowth || 0}% this month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Releases</p>
              <p className="font-bold text-gray-900 text-3xl">{adminData?.totalReleases || 0}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{adminData?.releaseGrowth > 0 ? '+' : ''}{adminData?.releaseGrowth || 0}% this month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Music className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
              <p className="font-bold text-gray-900 text-3xl">{formatCurrency(adminData?.totalRevenue || 0, selectedCurrency)}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{adminData?.revenueGrowth > 0 ? '+' : ''}{adminData?.revenueGrowth || 0}% this month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Active Projects</p>
              <p className="font-bold text-gray-900 text-3xl">{adminData?.activeProjects || 0}</p>
              <div className="flex items-center mt-2 text-sm">
                <Activity className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">{adminData?.pendingApprovals || 0} pending</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Target className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Earnings Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {userRole === 'super_admin' ? 'Platform Earnings Overview' : 'Earnings Overview'}
          </h3>
          <button
            onClick={() => router.push('/superadmin/earnings')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {userRole === 'super_admin' ? 'View Global Earnings' : 'View Full Earnings'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(adminData?.totalPlatformRevenue || adminData?.totalRevenue || 0, selectedCurrency)}
            </div>
            <div className="text-sm text-red-700 mt-1">
              {userRole === 'super_admin' ? 'Total Platform Revenue' : 'Company Earnings'}
            </div>
            <div className="text-xs text-red-500 mt-1">
              {userRole === 'super_admin' ? 'All brands combined' : 'This month'}
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(adminData?.availableToWithdraw || 0, selectedCurrency)}
            </div>
            <div className="text-sm text-green-700 mt-1">Available to Withdraw</div>
            <div className="text-xs text-green-500 mt-1">Ready now</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {adminData?.earningAssets || 0}
            </div>
            <div className="text-sm text-purple-700 mt-1">Earning Assets</div>
            <div className="text-xs text-purple-500 mt-1">Generating revenue</div>
          </div>
        </div>
      </div>

      {/* Super Admin User Roles Overview */}
      {userRole === 'super_admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Platform User Roles</h3>
            <Users className="w-6 h-6 text-red-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{adminData?.userRoles?.artists || 0}</div>
                <div className="text-sm font-medium text-gray-900">Artists</div>
                <div className="text-xs text-gray-500 mt-1">Active users</div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{adminData?.userRoles?.labelAdmins || 0}</div>
                <div className="text-sm font-medium text-gray-900">Label Admins</div>
                <div className="text-xs text-gray-500 mt-1">Active users</div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{adminData?.userRoles?.distributionPartners || 0}</div>
                <div className="text-sm font-medium text-gray-900">Distribution Partners</div>
                <div className="text-xs text-gray-500 mt-1">Active users</div>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">{adminData?.userRoles?.companyAdmins || 0}</div>
                <div className="text-sm font-medium text-gray-900">Company Admins</div>
                <div className="text-xs text-gray-500 mt-1">Active users</div>
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">{adminData?.userRoles?.superAdmins || 0}</div>
                <div className="text-sm font-medium text-gray-900">Super Admins</div>
                <div className="text-xs text-gray-500 mt-1">Active users</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/superadmin/users')}
            className="w-full mt-6 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Manage All Users
          </button>
        </div>
      )}

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">User Management</h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Artists</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{allUsers.filter(u => u.role === 'artist').length}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">
                  {userRole === 'super_admin' ? 'Label Admins' : 'Distribution Partners'}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {userRole === 'super_admin' ? allUsers.filter(u => u.role === 'label_admin').length : allUsers.filter(u => u.role === 'distribution_partner').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">
                  {userRole === 'super_admin' ? 'All Admins' : 'Administrators'}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {userRole === 'super_admin' ? allUsers.filter(u => ['company_admin', 'super_admin'].includes(u.role)).length : allUsers.filter(u => ['company_admin', 'super_admin'].includes(u.role)).length}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/superadmin/users')}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Manage All Users
          </button>
        </div>

        {/* Release Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Release Management</h3>
            <Music className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="space-y-4">
                          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">{RELEASE_STATUS_LABELS[RELEASE_STATUSES.IN_REVIEW]}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{adminData?.releasesByStatus?.in_review || 0}</span>
              </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">{RELEASE_STATUS_LABELS[RELEASE_STATUSES.COMPLETED]}</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{adminData?.releasesByStatus?.approved || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">{RELEASE_STATUS_LABELS[RELEASE_STATUSES.LIVE]}</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{adminData?.releasesByStatus?.live || 0}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/superadmin/content')}
            className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Manage Content
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Platform Analytics</h3>
          <BarChart3 className="w-6 h-6 text-purple-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2 truncate">{formatCurrency(adminData?.monthlyRevenue || 0, selectedCurrency)}</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
            <div className="text-xs text-green-600 mt-1">+0% vs last month</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{adminData?.totalStreams?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-600">Total Streams</div>
            <div className="text-xs text-green-600 mt-1">+0% vs last month</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0%</div>
            <div className="text-sm text-gray-600">Platform Uptime</div>
            <div className="text-xs text-green-600 mt-1">All systems operational</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{adminData?.newUsersToday || 0}</div>
            <div className="text-sm text-gray-600">New Users Today</div>
            <div className="text-xs text-green-600 mt-1">+0% vs yesterday</div>
          </div>
        </div>

        <button
          onClick={() => router.push('/superadmin/analytics')}
          className="w-full mt-6 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          View Detailed Analytics
        </button>
      </div>



      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <Activity className="w-6 h-6 text-gray-600" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/superadmin/users')}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-700">Users</span>
          </button>
          
          <button
            onClick={() => router.push('/superadmin/content')}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileText className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-700">Content</span>
          </button>
          
          <button
            onClick={() => router.push('/superadmin/analytics')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-700">Analytics</span>
          </button>
          
          <button
                          onClick={() => router.push('/superadmin/distribution')}
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <Activity className="w-8 h-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-yellow-700">
              {userRole === 'super_admin' ? 'Distribution' : 'Workflow'}
            </span>
          </button>
        </div>
      </div>

      {/* Super Admin Tools */}
      {userRole === 'super_admin' && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-red-900">Super Admin Tools</h3>
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          
          <p className="text-red-700 mb-6">Advanced administrative features for platform management</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/superadmin/settings')}
              className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              System Settings
            </button>
            <button 
              onClick={() => router.push('/superadmin/approvals')}
              className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Global Approvals
            </button>
            <button 
              onClick={() => router.push('/superadmin/earnings')}
              className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Revenue Management
            </button>
            <button 
              onClick={() => setShowGhostModal(true)}
              className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Ghost Login
            </button>
            <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Platform Logs
            </button>
            <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Backup & Restore
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Filter users for ghost login based on search term
  const filteredGhostUsers = allUsers.filter(user => {
    if (!ghostSearchTerm) return true;
    
    const searchLower = ghostSearchTerm.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
    const email = (user.email || '').toLowerCase();
    const role = (user.role || '').replace('_', ' ').toLowerCase();
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           role.includes(searchLower);
  });

  // Ghost login functionality
  const handleGhostLogin = async (targetUser) => {
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      // Call ghost login API
      const response = await fetch('/api/admin/ghost-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: targetUser.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ghost login failed');
      }

      const result = await response.json();
      
      // Create a proper user object for ghost mode that matches Supabase auth structure
      const ghostUserObject = {
        id: result.targetUser.id,
        email: result.targetUser.email,
        user_metadata: {
          role: result.targetUser.role
        },
        // Add other properties that might be expected
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add the profile data
        profile: result.targetUser.profile,
        // Add computed properties
        role: result.targetUser.role,
        name: result.targetUser.name
      };

      // Store ghost session data
      sessionStorage.setItem('ghost_session', JSON.stringify(result.ghostSession));
      sessionStorage.setItem('ghost_mode', 'true');
      sessionStorage.setItem('original_admin_user', JSON.stringify(user));
      sessionStorage.setItem('ghost_target_user', JSON.stringify(ghostUserObject));
      
      // Trigger custom event to notify the auth provider
      window.dispatchEvent(new Event('ghostModeChanged'));
      
      // Determine redirect path based on target user role
      const targetRole = result.targetUser.role;
      let redirectPath = '/dashboard';
      
      switch (targetRole) {
        case 'artist':
          redirectPath = '/dashboard';
          break;
        case 'label_admin':
          redirectPath = '/labeladmin/dashboard';
          break;
        case 'company_admin':
          redirectPath = '/companyadmin/dashboard';
          break;
        case 'distribution_partner':
          redirectPath = '/distributionpartner/dashboard';
          break;
        case 'super_admin':
          redirectPath = '/superadmin/dashboard';
          break;
        default:
          redirectPath = '/dashboard';
      }
      
      // Show success message and redirect
      alert(`Ghost mode activated! Logging in as ${result.targetUser.name} (${result.targetUser.email})`);
      router.push(redirectPath);
      
    } catch (error) {
      console.error('Ghost login failed:', error);
      alert(`Ghost login failed: ${error.message}`);
    }
  };

  return (
    <MainLayout>
      <SEO 
        title={`${userRole === 'super_admin' ? 'Super' : 'Company'} Admin Dashboard - MSC & Co`}
        description="Administrative dashboard for platform management"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
              </nav>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="mb-6 flex justify-end">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
            />
          </div>

          {/* Content */}
          {activeTab === 'overview' && renderOverview()}
        </div>
      </div>

      {/* Ghost Login Modal */}
      {showGhostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ghost Login - Select User</h3>
              <button
                onClick={() => setShowGhostModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                ⚠️ <strong>Ghost Mode Warning:</strong> You will be logged in as the selected user. 
                This is for administrative purposes only. Use responsibly.
              </p>
            </div>

            {/* Search Box */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  value={ghostSearchTerm}
                  onChange={(e) => setGhostSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredGhostUsers.length > 0) {
                      // Auto-select first result on Enter
                      const firstUser = filteredGhostUsers[0];
                      setSelectedGhostUser(firstUser);
                      setShowGhostModal(false);
                      handleGhostLogin(firstUser);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              {ghostSearchTerm && (
                <p className="text-xs text-gray-500 mt-1">
                  Showing {filteredGhostUsers.length} of {allUsers.length} users
                </p>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {filteredGhostUsers.length > 0 ? (
                  filteredGhostUsers.map((targetUser) => (
                  <div
                    key={targetUser.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {targetUser.firstName?.[0]}{targetUser.lastName?.[0]}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {targetUser.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{targetUser.email}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            targetUser.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                            targetUser.role === 'company_admin' ? 'bg-purple-100 text-purple-800' :
                            targetUser.role === 'label_admin' ? 'bg-blue-100 text-blue-800' :
                            targetUser.role === 'distribution_partner' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {targetUser.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedGhostUser(targetUser);
                        setShowGhostModal(false);
                        handleGhostLogin(targetUser);
                      }}
                      className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Ghost Login
                    </button>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      {ghostSearchTerm ? 'No users found matching your search.' : 'No users available.'}
                    </p>
                    {ghostSearchTerm && (
                      <button
                        onClick={() => setGhostSearchTerm('')}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGhostModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
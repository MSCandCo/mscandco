import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { getUserRoleSync } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Music, 
  Users, 
  DollarSign, 
  Eye, 
  Download,
  FileText,
  Activity,
  Target,
  Zap,
  Globe,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  UserCheck
} from 'lucide-react';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import SEO from '../../components/seo';

export default function CompanyAdminDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [dashboardData, setDashboardData] = useState(null);
  const [userManagementData, setUserManagementData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Authentication and access checks
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      const role = getUserRoleSync(user);
      if (role !== 'company_admin') {
        router.push('/dashboard');
        return;
      }
      loadDashboardData();
    }
  }, [user, isLoading, router]);

  // Load comprehensive dashboard data
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

      // Call all company admin APIs in parallel
      const [dashboardResponse, userResponse, analyticsResponse, financeResponse] = await Promise.all([
        fetch('/api/companyadmin/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/companyadmin/user-management', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/companyadmin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/companyadmin/finance', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json();
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        }
      }

      if (userResponse.ok) {
        const userResult = await userResponse.json();
        if (userResult.success) {
          setUserManagementData(userResult.data);
        }
      }

      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success) {
          setAnalyticsData(analyticsResult.data);
        }
      }

      if (financeResponse.ok) {
        const financeResult = await financeResponse.json();
        if (financeResult.success) {
          setFinanceData(financeResult.data);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading company admin data:', error);
      setLoading(false);
    }
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Company Admin Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = getUserRoleSync(user);

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Company Admin Dashboard</h1>
            <p className="text-blue-100 text-lg">
              Platform Management & Oversight
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Platform Health</div>
            <div className="text-2xl font-bold">{dashboardData?.platformHealth || 0}%</div>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
              <p className="font-bold text-gray-900 text-3xl">{dashboardData?.totalUsers?.toLocaleString() || 0}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{dashboardData?.userGrowth > 0 ? '+' : ''}{dashboardData?.userGrowth || 0}% this month</span>
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
              <p className="font-bold text-gray-900 text-3xl">{dashboardData?.totalReleases || 0}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{dashboardData?.releaseGrowth > 0 ? '+' : ''}{dashboardData?.releaseGrowth || 0}% this month</span>
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
              <p className="font-bold text-gray-900 text-3xl">{formatCurrency(dashboardData?.totalRevenue || 0, selectedCurrency)}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{dashboardData?.revenueGrowth > 0 ? '+' : ''}{dashboardData?.revenueGrowth || 0}% this month</span>
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
              <p className="text-sm font-medium text-gray-600 mb-2">Active Subscriptions</p>
              <p className="font-bold text-gray-900 text-3xl">{dashboardData?.activeSubscriptions || 0}</p>
              <div className="flex items-center mt-2 text-sm">
                <Activity className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-orange-600">Live tracking</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Platform User Roles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Platform User Roles</h3>
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{dashboardData?.usersByRole?.artist || 0}</div>
              <div className="text-sm font-medium text-gray-900">Artists</div>
              <div className="text-xs text-gray-500 mt-1">Active users</div>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{dashboardData?.usersByRole?.label_admin || 0}</div>
              <div className="text-sm font-medium text-gray-900">Label Admins</div>
              <div className="text-xs text-gray-500 mt-1">Active users</div>
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">{dashboardData?.usersByRole?.distribution_partner || 0}</div>
              <div className="text-sm font-medium text-gray-900">Distribution Partners</div>
              <div className="text-xs text-gray-500 mt-1">Active users</div>
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">{dashboardData?.usersByRole?.company_admin || 0}</div>
              <div className="text-sm font-medium text-gray-900">Company Admins</div>
              <div className="text-xs text-gray-500 mt-1">Active users</div>
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">{dashboardData?.usersByRole?.super_admin || 0}</div>
              <div className="text-sm font-medium text-gray-900">Super Admins</div>
              <div className="text-xs text-gray-500 mt-1">Active users</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/companyadmin/users')}
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Manage All Users
        </button>
      </div>

      {/* Release Management Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Release Management</h3>
          <button
            onClick={() => router.push('/companyadmin/content')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Manage Content
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {dashboardData?.releasesByStatus?.in_review || 0}
            </div>
            <div className="text-sm text-yellow-700 mt-1">In Review</div>
            <div className="text-xs text-yellow-500 mt-1">Pending approval</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData?.releasesByStatus?.approved || 0}
            </div>
            <div className="text-sm text-blue-700 mt-1">Approved</div>
            <div className="text-xs text-blue-500 mt-1">Ready for distribution</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.releasesByStatus?.live || 0}
            </div>
            <div className="text-sm text-green-700 mt-1">Live</div>
            <div className="text-xs text-green-500 mt-1">Currently distributed</div>
          </div>
        </div>
      </div>

      {/* Artist Requests Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Artist Requests</h3>
          <button
            onClick={() => router.push('/companyadmin/artist-requests')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Manage Requests
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {dashboardData?.requestsByStatus?.pending || 0}
            </div>
            <div className="text-sm text-yellow-700 mt-1">Pending</div>
            <div className="text-xs text-yellow-500 mt-1">Awaiting review</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.requestsByStatus?.approved || 0}
            </div>
            <div className="text-sm text-green-700 mt-1">Approved</div>
            <div className="text-xs text-green-500 mt-1">Artists added</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {dashboardData?.requestsByStatus?.rejected || 0}
            </div>
            <div className="text-sm text-red-700 mt-1">Rejected</div>
            <div className="text-xs text-red-500 mt-1">Not approved</div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Financial Overview</h3>
          <button
            onClick={() => router.push('/companyadmin/finance')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            View Finance
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(dashboardData?.financialOverview?.subscriptionRevenue || 0, selectedCurrency)}
            </div>
            <div className="text-sm text-blue-700 mt-1">Subscription Revenue</div>
            <div className="text-xs text-blue-500 mt-1">Monthly recurring</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(dashboardData?.financialOverview?.revenueShares || 0, selectedCurrency)}
            </div>
            <div className="text-sm text-purple-700 mt-1">Revenue Shares</div>
            <div className="text-xs text-purple-500 mt-1">Distribution earnings</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(dashboardData?.financialOverview?.totalWalletBalance || 0, selectedCurrency)}
            </div>
            <div className="text-sm text-green-700 mt-1">Wallet Balance</div>
            <div className="text-xs text-green-500 mt-1">Available funds</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => router.push('/companyadmin/users')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">User Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage all platform users, roles, and permissions.</p>
          <div className="text-blue-600 font-medium">Manage Users →</div>
        </button>

        <button
          onClick={() => router.push('/companyadmin/analytics')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Analytics</h3>
          </div>
          <p className="text-gray-600 mb-4">View comprehensive platform analytics and insights.</p>
          <div className="text-purple-600 font-medium">View Analytics →</div>
        </button>

        <button
          onClick={() => router.push('/companyadmin/finance')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center mb-4">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Finance</h3>
          </div>
          <p className="text-gray-600 mb-4">Access financial reports, revenue, and earnings data.</p>
          <div className="text-green-600 font-medium">View Finance →</div>
        </button>
      </div>
    </div>
  );

  return (
    <Layout>
      <SEO 
        title="Company Admin Dashboard - MSC & Co"
        description="Manage platform operations, users, and analytics"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Currency Selector */}
          <div className="flex justify-end mb-6">
            <CurrencySelector 
              selectedCurrency={selectedCurrency} 
              onCurrencyChange={updateCurrency} 
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
          </div>

          {/* Content */}
          {activeTab === 'overview' && renderOverview()}
        </div>
      </div>
    </Layout>
  );
}

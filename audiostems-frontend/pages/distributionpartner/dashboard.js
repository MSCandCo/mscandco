import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
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
  AlertTriangle
} from 'lucide-react';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import SEO from '../../components/seo';

export default function DistributionPartnerDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [dashboardData, setDashboardData] = useState(null);
  const [contentData, setContentData] = useState(null);
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
      if (role !== 'distribution_partner') {
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

      // Call all distribution partner APIs in parallel
      const [dashboardResponse, contentResponse, analyticsResponse, financeResponse] = await Promise.all([
        fetch('/api/distributionpartner/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/distributionpartner/content-management', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/distributionpartner/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/distributionpartner/finance', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json();
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        }
      }

      if (contentResponse.ok) {
        const contentResult = await contentResponse.json();
        if (contentResult.success) {
          setContentData(contentResult.data);
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
      console.error('Error loading distribution partner data:', error);
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
            <p className="mt-4 text-gray-600">Loading Distribution Partner Dashboard...</p>
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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Distribution Partner Dashboard</h1>
            <p className="text-purple-100 text-lg">
              Hi, {dashboardData?.partnerName || 'Distribution Partner'} from {dashboardData?.companyName || 'Code Group'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-100">Success Rate</div>
            <div className="text-2xl font-bold">{dashboardData?.successRate || 0}%</div>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Distributed Content</p>
              <p className="font-bold text-gray-900 text-3xl">{dashboardData?.totalDistributedContent?.toLocaleString() || 0}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{dashboardData?.contentGrowth > 0 ? '+' : ''}{dashboardData?.contentGrowth || 0}% this month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Music className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Partner Revenue</p>
              <p className="font-bold text-gray-900 text-3xl">{formatCurrency(dashboardData?.totalPartnerRevenue || 0, selectedCurrency)}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{dashboardData?.revenueGrowth > 0 ? '+' : ''}{dashboardData?.revenueGrowth || 0}% this month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Artists</p>
              <p className="font-bold text-gray-900 text-3xl">{dashboardData?.totalArtists || 0}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">{dashboardData?.artistGrowth > 0 ? '+' : ''}{dashboardData?.artistGrowth || 0}% this month</span>
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
              <p className="text-sm font-medium text-gray-600 mb-2">Total Streams</p>
              <p className="font-bold text-gray-900 text-3xl">{dashboardData?.totalStreams?.toLocaleString() || 0}</p>
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

      {/* Content Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Content Status Overview</h3>
          <button
            onClick={() => router.push('/distributionpartner/dashboard')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Manage Content
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {dashboardData?.pendingReleases || 0}
            </div>
            <div className="text-sm text-yellow-700 mt-1">Pending Review</div>
            <div className="text-xs text-yellow-500 mt-1">Awaiting approval</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData?.approvedReleases || 0}
            </div>
            <div className="text-sm text-blue-700 mt-1">Approved</div>
            <div className="text-xs text-blue-500 mt-1">Ready for distribution</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.liveReleases || 0}
            </div>
            <div className="text-sm text-green-700 mt-1">Live</div>
            <div className="text-xs text-green-500 mt-1">Currently distributed</div>
          </div>
        </div>
      </div>

      {/* Top Performing Releases */}
      {dashboardData?.topReleases && dashboardData.topReleases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Performing Releases</h3>
            <button
              onClick={() => router.push('/distributionpartner/analytics')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </button>
          </div>
          
          <div className="space-y-4">
            {dashboardData.topReleases.slice(0, 5).map((release, index) => (
              <div key={release.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-medium text-gray-900">{release.title}</div>
                    <div className="text-sm text-gray-500">{release.artistName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{release.streams?.toLocaleString() || 0} streams</div>
                  <div className="text-sm text-green-600">{formatCurrency(release.earnings || 0, selectedCurrency)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => router.push('/distributionpartner/dashboard')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center mb-4">
            <Music className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Content Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage releases, review submissions, and track distribution status.</p>
          <div className="text-purple-600 font-medium">Manage Content →</div>
        </button>

        <button
          onClick={() => router.push('/distributionpartner/analytics')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Analytics</h3>
          </div>
          <p className="text-gray-600 mb-4">View detailed performance metrics and streaming analytics.</p>
          <div className="text-blue-600 font-medium">View Analytics →</div>
        </button>

        <button
          onClick={() => router.push('/distributionpartner/reports')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center mb-4">
            <DollarSign className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Finance</h3>
          </div>
          <p className="text-gray-600 mb-4">Access revenue reports, earnings, and financial analytics.</p>
          <div className="text-green-600 font-medium">View Finance →</div>
        </button>
      </div>
    </div>
  );

  return (
    <Layout>
      <SEO 
        title="Distribution Partner Dashboard - MSC & Co"
        description="Manage content distribution, view analytics, and track performance"
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

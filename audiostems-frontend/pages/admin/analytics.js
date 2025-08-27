import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import { Card, Badge } from "flowbite-react";
import { Users, Download, Music, CreditCard, TrendingUp, BarChart3, DollarSign } from "lucide-react";
import { getUserRole } from "@/lib/user-utils";
import { formatNumber, safeDivide, safeRound } from "@/lib/number-utils";
import { formatCurrency, useCurrencySync } from "@/components/shared/CurrencySelector";
import { AnalyticsService } from "@/lib/data-service";

function AdminAnalytics() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  
  // Real data states
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    const userRole = getUserRole(user);
    if (!['super_admin', 'company_admin'].includes(userRole)) {
      router.push('/dashboard');
      return;
    }
  }, [user, isLoading, router]);

  // Load real analytics data
  useEffect(() => {
    async function loadAnalytics() {
      if (!user) return;
      
      try {
        setLoadingAnalytics(true);
        setError(null);
        
        const token = await user.getIdToken();
        const result = await AnalyticsService.getDashboardStats('admin', token);
        
        if (result.success) {
          setAnalyticsData(result.data);
        } else {
          setError(result.error);
          // Use fallback data if API fails
          setAnalyticsData(AnalyticsService.getFallbackDashboardStats());
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err.message);
        setAnalyticsData(AnalyticsService.getFallbackDashboardStats());
      } finally {
        setLoadingAnalytics(false);
      }
    }

    loadAnalytics();
  }, [user]);

  if (isLoading || loadingAnalytics) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate metrics from real data
  const summary = analyticsData?.summary || {};
  const growth = analyticsData?.growth || {};
  const platforms = analyticsData?.platformStats || [];
  const recentActivity = analyticsData?.recentActivity || {};

  // Summary metrics
  const totalRevenue = summary.totalRevenue || 0;
  const totalStreams = summary.totalStreams || 0;
  const totalUsers = summary.totalUsers || 0;
  const totalReleases = summary.totalReleases || 0;
  const conversionRate = summary.conversionRate || 0;
  const avgRevenuePerUser = summary.avgRevenuePerUser || 0;

  // Growth metrics
  const revenueGrowth = growth.revenueThisMonth || 0;
  const userGrowth = growth.newUsersThisMonth || 0;
  const releaseGrowth = growth.newReleasesThisMonth || 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Analytics</h1>
            <p className="mt-2 text-gray-600">
              Real-time platform performance and business metrics
            </p>
            {error && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>Note:</strong> Some data may be limited due to API connectivity. 
                  Showing available data with fallbacks where needed.
                </p>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue, selectedCurrency)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{formatCurrency(revenueGrowth, selectedCurrency)} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Streams</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(totalStreams)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Across all platforms
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(totalUsers)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{userGrowth} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Releases</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(totalReleases)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{releaseGrowth} this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Music className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Platform Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Platform Performance
              </h3>
              <div className="space-y-4">
                {platforms.length > 0 ? (
                  platforms.slice(0, 6).map((platform, index) => (
                    <div key={platform.platform || index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium text-gray-900">
                          {platform.platform || 'Unknown Platform'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatNumber(platform.totalStreams || 0)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(platform.totalEarnings || 0, selectedCurrency)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No platform data available</p>
                    <p className="text-sm">Data will appear as artists upload content</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-semibold text-gray-900">{conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Revenue per User</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(avgRevenuePerUser, selectedCurrency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Subscriptions</span>
                  <span className="font-semibold text-gray-900">
                    {summary.activeUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Live Releases</span>
                  <span className="font-semibold text-gray-900">
                    {summary.liveReleases || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Releases</h4>
                <div className="space-y-2">
                  {recentActivity.recentReleases?.slice(0, 5).map((release, index) => (
                    <div key={release.id || index} className="text-sm">
                      <p className="font-medium text-gray-900">
                        {release.title || 'Untitled Release'}
                      </p>
                      <p className="text-gray-500">
                        {release.status || 'Unknown'} • {formatNumber(release.streams || 0)} streams
                      </p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No recent releases</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">New Users</h4>
                <div className="space-y-2">
                  {recentActivity.recentUsers?.slice(0, 5).map((user, index) => (
                    <div key={user.id || index} className="text-sm">
                      <p className="font-medium text-gray-900">
                        {user.name || user.email || 'Unknown User'}
                      </p>
                      <p className="text-gray-500">
                        {user.role || 'user'} • {user.subscription_tier || 'free'}
                      </p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No recent users</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Revenue</h4>
                <div className="space-y-2">
                  {recentActivity.recentRevenue?.slice(0, 5).map((revenue, index) => (
                    <div key={revenue.id || index} className="text-sm">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(revenue.amount || 0, selectedCurrency)}
                      </p>
                      <p className="text-gray-500">
                        {revenue.platform || 'Unknown'} • {revenue.status || 'pending'}
                      </p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No recent revenue</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminAnalytics;
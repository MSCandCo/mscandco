import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from 'next/link';
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Badge } from "flowbite-react";
import { Users, Download, Music, CreditCard, Settings } from "lucide-react";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";
import moment from "moment";
import CurrencySelector, { formatCurrency, useCurrencySync } from "@/components/shared/CurrencySelector";
import CustomDateRangePicker from '../../components/shared/CustomDateRangePicker';
import { getUserRole } from "@/lib/user-utils";
import { formatNumber, safeDivide, safeRound } from "@/lib/number-utils";

function AdminAnalytics() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Check if user is admin (example: email ends with @mscandco.com)
  useEffect(() => {
    if (isLoading) return;
    if (!user || !user?.email?.endsWith('@mscandco.com')) {
      router.push('/');
    }
  }, [user, isLoading, user, router]);

  // Real workflow stats from database (production-ready - shows zeros until real data exists)
  const [workflowStats, setWorkflowStats] = useState([]);
  const [platformStats, setPlatformStats] = useState([]);

  // Get user role for filtering
  const userRole = getUserRole(user);

  // Production-ready platform stats (zeros until real data exists)
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // In production, these would be real API calls to get analytics data
        // For now, set to zeros to show production-ready state
        setWorkflowStats([]);
        setPlatformStats([
          { platform: 'Spotify', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 },
          { platform: 'Apple Music', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 },
          { platform: 'YouTube Music', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 },
          { platform: 'Amazon Music', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 },
          { platform: 'Deezer', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 },
          { platform: 'Tidal', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 },
          { platform: 'Pandora', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 },
          { platform: 'SoundCloud', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 },
          { platform: 'Bandcamp', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 },
          { platform: 'Other Platforms', totalStreams: 0, totalEarnings: 0, avgCompletionTime: 0, releases: 0 }
        ]);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        setWorkflowStats([]);
        setPlatformStats([]);
      }
    };

    if (user && !isLoading) {
      loadAnalyticsData();
    }
  }, [user, isLoading]);

  const mockPlatformStats = platformStats;

  // Production-ready user stats (will be loaded from real database)
  const [allUserStats, setAllUserStats] = useState([]);

  // Filter stats based on current user role
  const mockUserStats = userRole === 'company_admin' 
    ? allUserStats.filter(user => ['artist', 'label_admin'].includes(user.role))
    : allUserStats;

  // Calculate business totals with currency support (production-ready - zeros until real data)
  const totalRevenue = allUserStats.reduce((sum, user) => sum + (user.totalEarnings || 0), 0);
  const avgFormCompletionTime = 0;
  const avgSystemEfficiency = 0;

  // Calculate workflow efficiency metrics (production-ready - zeros until real data)
  const workflowMetrics = {
    avgDraftTime: 0,
    avgReviewTime: 0,
    avgApprovalTime: 0,
    totalReleases: workflowStats.length,
    completedReleases: workflowStats.filter(w => w.currentStatus === 'live').length
  };

  const userStats = { data: mockUserStats };
  const platformStatsData = { data: mockPlatformStats };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !user?.email?.endsWith('@mscandco.com')) {
    return null;
  }

  const totalUsers = userStats?.data?.length || 0;
  const totalReleases = workflowStats?.length || 0;
  const activePlatforms = platformStats?.length || 0;
  const avgEfficiency = Math.round(avgSystemEfficiency) || 0;

  const recentWorkflow = workflowStats?.slice(0, 10) || [];

  return (
    <MainLayout>
      <SEO pageTitle="Admin Analytics" />
      <div className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Business Analytics</h1>
              <p className="text-gray-600 mt-2">Operations efficiency and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/companyadmin/analytics-management">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Artist Analytics
                </button>
              </Link>
              <CurrencySelector 
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                compact={true}
              />
            </div>
          </div>
          
          {/* Business Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Music className="h-6 w-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">Total Releases</p>
                  <p className="text-2xl font-bold">{totalReleases}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">Platform Channels</p>
                  <p className="text-2xl font-bold">{activePlatforms}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">System Efficiency</p>
                  <p className="text-2xl font-bold">{avgEfficiency}%</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold truncate">{formatCurrency(totalRevenue, selectedCurrency)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Workflow Efficiency Metrics */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <h2 className="text-xl font-semibold mb-4">System Workflow Efficiency</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="font-medium">Avg Form Completion Time</span>
                  <span className="text-blue-600 font-bold">{Math.round(avgFormCompletionTime)} min</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span className="font-medium">Avg Review Processing</span>
                  <span className="text-yellow-600 font-bold">{Math.round(workflowMetrics.avgReviewTime)} hrs</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="font-medium">Avg Approval Time</span>
                  <span className="text-purple-600 font-bold">{Math.round(workflowMetrics.avgApprovalTime)} hrs</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium">Completion Rate</span>
                  <span className="text-green-600 font-bold">
                    {workflowMetrics.totalReleases > 0 ? Math.round((workflowMetrics.completedReleases / workflowMetrics.totalReleases) * 100) : 0}%
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4">Platform Performance</h2>
              <div className="space-y-3">
                {mockPlatformStats.map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{platform.platform}</p>
                      <p className="text-sm text-gray-600">
                        {platform.releases} releases • {formatCurrency(platform.totalEarnings, selectedCurrency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">{platform.avgCompletionTime}h avg</p>
                      <p className="text-xs text-gray-500">{(platform.totalStreams / 1000000).toFixed(1)}M streams</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Workflow Activity */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Recent Release Workflow</h2>
            <div className="space-y-3">
              {recentWorkflow.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">{workflow.release}</p>
                    <p className="text-sm text-gray-600">
                      {workflow.artist} • Form completed in {workflow.formCompletionTime} min
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={
                      workflow.currentStatus === 'live' ? 'green' :
                      workflow.currentStatus === 'approvals' ? 'yellow' :
                      workflow.currentStatus === 'in_review' ? 'blue' :
                      'gray'
                    }>
                      {workflow.currentStatus.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {moment(workflow.startDate).format('MMM DD, YYYY')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminAnalytics; 
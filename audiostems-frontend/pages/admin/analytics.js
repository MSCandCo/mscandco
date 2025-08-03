import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Badge } from "flowbite-react";
import { Users, Download, Music, CreditCard } from "lucide-react";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";
import moment from "moment";
import CurrencySelector, { formatCurrency, useCurrencySync } from "@/components/shared/CurrencySelector";
import { getUserRole } from "@/lib/auth0-config";
import { formatNumber, safeDivide, safeRound } from "@/lib/number-utils";

function AdminAnalytics() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Check if user is admin (example: email ends with @mscandco.com)
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user?.email?.endsWith('@mscandco.com')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Business operations analytics data for admin dashboard
  const mockWorkflowStats = [
    { id: 1, artist: 'YHWH MSC', release: 'Urban Beat', startDate: '2024-01-16', currentStatus: 'live', formCompletionTime: 18, statusProgression: { draft: 2, submitted: 1, in_review: 24, approvals: 12, live: 0 } },
    { id: 2, artist: 'Global Superstar', release: 'Hit Single #1', startDate: '2024-01-15', currentStatus: 'approvals', formCompletionTime: 12, statusProgression: { draft: 1, submitted: 2, in_review: 36, approvals: 8 } },
    { id: 3, artist: 'Seoul Stars', release: 'Starlight', startDate: '2024-01-14', currentStatus: 'in_review', formCompletionTime: 25, statusProgression: { draft: 3, submitted: 1, in_review: 18 } },
    { id: 4, artist: 'Rock Legends', release: 'Opening Anthem', startDate: '2024-01-13', currentStatus: 'submitted', formCompletionTime: 8, statusProgression: { draft: 1, submitted: 6 } },
    { id: 5, artist: 'Carlos Mendez', release: 'Fuego', startDate: '2024-01-12', currentStatus: 'live', formCompletionTime: 22, statusProgression: { draft: 4, submitted: 2, in_review: 28, approvals: 15, live: 0 } },
    { id: 6, artist: 'YHWH MSC', release: 'Street Rhythm', startDate: '2024-01-11', currentStatus: 'live', formCompletionTime: 15, statusProgression: { draft: 2, submitted: 1, in_review: 22, approvals: 10, live: 0 } },
    { id: 7, artist: 'Global Superstar', release: 'Radio Favorite', startDate: '2024-01-10', currentStatus: 'live', formCompletionTime: 9, statusProgression: { draft: 1, submitted: 1, in_review: 20, approvals: 8, live: 0 } },
    { id: 8, artist: 'Seoul Stars', release: 'Electric Love', startDate: '2024-01-09', currentStatus: 'live', formCompletionTime: 31, statusProgression: { draft: 5, submitted: 2, in_review: 32, approvals: 18, live: 0 } }
  ];

  // Get user role for filtering
  const userRole = getUserRole(user);

  // Platform performance data
  const mockPlatformStats = [
    { platform: 'Spotify', totalStreams: 8500000, totalEarnings: 85000, avgCompletionTime: 28, releases: 45 },
    { platform: 'Apple Music', totalStreams: 6200000, totalEarnings: 74400, avgCompletionTime: 32, releases: 42 },
    { platform: 'YouTube Music', totalStreams: 4800000, totalEarnings: 24000, avgCompletionTime: 35, releases: 38 },
    { platform: 'Amazon Music', totalStreams: 3100000, totalEarnings: 31000, avgCompletionTime: 30, releases: 35 },
    { platform: 'Deezer', totalStreams: 1800000, totalEarnings: 14400, avgCompletionTime: 25, releases: 28 },
    { platform: 'Tidal', totalStreams: 950000, totalEarnings: 14250, avgCompletionTime: 22, releases: 22 }
  ];

  const allUserStats = [
    { id: 1, name: 'YHWH MSC', role: 'artist', status: 'active', releases: 6, totalEarnings: 28400, avgFormTime: 18, efficiency: 92 },
    { id: 2, name: 'Global Superstar', role: 'artist', status: 'active', releases: 3, totalEarnings: 145600, avgFormTime: 11, efficiency: 95 },
    { id: 3, name: 'Seoul Stars', role: 'artist', status: 'active', releases: 2, totalEarnings: 97200, avgFormTime: 28, efficiency: 78 },
    { id: 4, name: 'Rock Legends', role: 'artist', status: 'active', releases: 1, totalEarnings: 18400, avgFormTime: 8, efficiency: 98 },
    { id: 5, name: 'Carlos Mendez', role: 'artist', status: 'active', releases: 1, totalEarnings: 8900, avgFormTime: 22, efficiency: 85 },
    { id: 6, name: 'DJ Phoenix', role: 'artist', status: 'pending', releases: 0, totalEarnings: 0, avgFormTime: 0, efficiency: 0 },
    { id: 7, name: 'Miami Bass', role: 'artist', status: 'active', releases: 1, totalEarnings: 14200, avgFormTime: 15, efficiency: 88 },
    { id: 8, name: 'Electronic Fusion', role: 'artist', status: 'active', releases: 1, totalEarnings: 10800, avgFormTime: 19, efficiency: 87 },
    { id: 9, name: 'Acoustic Dreams', role: 'artist', status: 'inactive', releases: 0, totalEarnings: 0, avgFormTime: 0, efficiency: 0 },
    { id: 10, name: 'Film Composer Orchestra', role: 'artist', status: 'pending', releases: 0, totalEarnings: 0, avgFormTime: 0, efficiency: 0 },
    { id: 11, name: 'Nashville Dreams', role: 'artist', status: 'inactive', releases: 0, totalEarnings: 0, avgFormTime: 0, efficiency: 0 },
    { id: 12, name: 'YHWH Label Admin', role: 'label_admin', status: 'active', releases: 12, totalEarnings: 156000, avgFormTime: 14, efficiency: 91 },
    { id: 13, name: 'Urban Sounds Label Admin', role: 'label_admin', status: 'active', releases: 8, totalEarnings: 98000, avgFormTime: 16, efficiency: 89 }
  ];

  // Filter stats based on current user role
  const mockUserStats = userRole === 'company_admin' 
    ? allUserStats.filter(user => ['artist', 'label_admin'].includes(user.role))
    : allUserStats;

  // Calculate business totals with currency support
  const totalRevenue = mockUserStats.reduce((sum, user) => sum + user.totalEarnings, 0);
  const avgFormCompletionTime = formatNumber(safeDivide(mockWorkflowStats.reduce((sum, workflow) => sum + workflow.formCompletionTime, 0), mockWorkflowStats.length));
  const avgSystemEfficiency = formatNumber(safeDivide(mockUserStats.filter(u => u.efficiency > 0).reduce((sum, user) => sum + user.efficiency, 0), mockUserStats.filter(u => u.efficiency > 0).length));

  // Calculate workflow efficiency metrics
  const workflowMetrics = {
    avgDraftTime: formatNumber(safeDivide(mockWorkflowStats.reduce((sum, w) => sum + (w.statusProgression.draft || 0), 0), mockWorkflowStats.length)),
    avgReviewTime: formatNumber(safeDivide(mockWorkflowStats.reduce((sum, w) => sum + (w.statusProgression.in_review || 0), 0), mockWorkflowStats.length)),
    avgApprovalTime: formatNumber(safeDivide(mockWorkflowStats.reduce((sum, w) => sum + (w.statusProgression.approvals || 0), 0), mockWorkflowStats.length)),
    totalReleases: mockWorkflowStats.length,
    completedReleases: mockWorkflowStats.filter(w => w.currentStatus === 'live').length
  };

  // Use mock data instead of API calls
  const workflowStats = { data: mockWorkflowStats };
  const userStats = { data: mockUserStats };
  const platformStats = { data: mockPlatformStats };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user?.email?.endsWith('@mscandco.com')) {
    return null;
  }

  const totalUsers = userStats?.data?.length || 0;
  const totalReleases = workflowStats?.data?.length || 0;
  const activePlatforms = platformStats?.data?.length || 0;
  const avgEfficiency = Math.round(avgSystemEfficiency) || 0;

  const recentWorkflow = workflowStats?.data?.slice(0, 10) || [];

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
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
              compact={true}
            />
          </div>
          
          {/* Business Stats Cards */}
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
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
                <div>
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
                <div>
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
                <div>
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
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue, selectedCurrency)}</p>
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
                  <span className="text-green-600 font-bold">{Math.round((workflowMetrics.completedReleases / workflowMetrics.totalReleases) * 100)}%</span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4">Platform Performance</h2>
              <div className="space-y-3">
                {mockPlatformStats.slice(0, 6).map((platform) => (
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
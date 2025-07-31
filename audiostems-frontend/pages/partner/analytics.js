import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaPlay, FaDownload, FaEye, FaHeart, FaShare, FaUsers, FaMusic, FaTrendingUp } from 'react-icons/fa';

// Mock analytics data for distributed releases
const mockAnalyticsData = {
  totalReleases: 6,
  totalStreams: 2847293,
  totalDownloads: 45827,
  totalRevenue: 12450.75,
  monthlyGrowth: 18.5,
  
  topPerformingReleases: [
    {
      id: 6,
      title: 'Midnight Sessions',
      artist: 'YHWH MSC',
      streams: 1245890,
      downloads: 18923,
      revenue: 5240.50,
      growth: 23.4
    },
    {
      id: 5,
      title: 'Summer Vibes',
      artist: 'YHWH MSC',
      streams: 892104,
      downloads: 15204,
      revenue: 3980.25,
      growth: 15.8
    },
    {
      id: 1,
      title: 'Urban Beats Collection',
      artist: 'YHWH MSC',
      streams: 567432,
      downloads: 8932,
      revenue: 2540.75,
      growth: 12.2
    },
    {
      id: 2,
      title: 'Rock Anthem',
      artist: 'YHWH MSC',
      streams: 98567,
      downloads: 2145,
      revenue: 520.25,
      growth: 8.1
    },
    {
      id: 4,
      title: 'Electronic Fusion EP',
      artist: 'YHWH MSC',
      streams: 43300,
      downloads: 623,
      revenue: 169.00,
      growth: -2.5
    }
  ],

  platformBreakdown: [
    { platform: 'Spotify', streams: 1425670, percentage: 50.1, revenue: 6225.38 },
    { platform: 'Apple Music', streams: 854218, percentage: 30.0, revenue: 3735.25 },
    { platform: 'YouTube Music', streams: 341164, percentage: 12.0, revenue: 1490.12 },
    { platform: 'Amazon Music', streams: 142569, percentage: 5.0, revenue: 622.75 },
    { platform: 'Other', streams: 83672, percentage: 2.9, revenue: 377.25 }
  ],

  monthlyData: [
    { month: 'Jan', streams: 245000, downloads: 4200, revenue: 1050.00 },
    { month: 'Feb', streams: 280000, downloads: 4800, revenue: 1200.00 },
    { month: 'Mar', streams: 320000, downloads: 5100, revenue: 1375.00 },
    { month: 'Apr', streams: 385000, downloads: 6200, revenue: 1650.00 },
    { month: 'May', streams: 420000, downloads: 7100, revenue: 1800.00 },
    { month: 'Jun', streams: 465000, downloads: 8200, revenue: 1995.00 },
    { month: 'Jul', streams: 510000, downloads: 9235, revenue: 2185.00 },
    { month: 'Aug', streams: 217293, downloads: 1000, revenue: 1195.75 }
  ]
};

export default function PartnerAnalytics() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedTimeframe, setSelectedTimeframe] = useState('all-time');

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'distribution_partner') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-bold text-gray-900">Distribution Analytics</h1>
              <p className="text-sm text-gray-500">Analytics for all distributed releases</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Timeframe Selector */}
          <div className="mb-6">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7-days">Last 7 Days</option>
              <option value="30-days">Last 30 Days</option>
              <option value="90-days">Last 90 Days</option>
              <option value="all-time">All Time</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaMusic className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Releases</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(mockAnalyticsData.totalReleases)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaPlay className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Streams</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(mockAnalyticsData.totalStreams)}</p>
                  <p className="text-sm text-green-600">+{mockAnalyticsData.monthlyGrowth}% this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaDownload className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(mockAnalyticsData.totalDownloads)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaTrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(mockAnalyticsData.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Distribution</h3>
              <div className="space-y-4">
                {mockAnalyticsData.platformBreakdown.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-700">{platform.platform}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatNumber(platform.streams)}</div>
                      <div className="text-xs text-gray-500">{platform.percentage}% • {formatCurrency(platform.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Performance</h3>
              <div className="space-y-3">
                {mockAnalyticsData.monthlyData.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatNumber(month.streams)} streams</div>
                      <div className="text-xs text-gray-500">{formatCurrency(month.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Releases */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Top Performing Releases</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockAnalyticsData.topPerformingReleases.map((release, index) => (
                    <tr key={release.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{release.title}</div>
                          <div className="text-sm text-gray-500">{release.artist}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(release.streams)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(release.downloads)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(release.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          release.growth >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {release.growth >= 0 ? '+' : ''}{release.growth}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
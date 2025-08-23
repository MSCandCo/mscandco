import { useUser } from '@/components/providers/SupabaseProvider';
import { useState } from 'react';
import { getUserRole, getUserBrand } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import SocialFootprintIntegration from '../../components/analytics/SocialFootprintIntegration';
import { Calendar, ChevronDown } from 'lucide-react';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';

import { formatNumber, safeDivide, safeRound } from '../../lib/number-utils';

export default function ArtistAnalytics() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  // Clean analytics data - all zeros for new artists
  const [analyticsData] = useState({
    totalStreams: 0,
    totalFollowers: 0,
    totalPlays: 0,
    totalRevenue: 0,
    monthlyData: [
      { month: 'Jan', streams: 0, followers: 0, revenue: 0 },
      { month: 'Feb', streams: 0, followers: 0, revenue: 0 },
      { month: 'Mar', streams: 0, followers: 0, revenue: 0 },
      { month: 'Apr', streams: 0, followers: 0, revenue: 0 },
      { month: 'May', streams: 0, followers: 0, revenue: 0 },
      { month: 'Jun', streams: 0, followers: 0, revenue: 0 },
      { month: 'Jul', streams: 0, followers: 0, revenue: 0 },
      { month: 'Aug', streams: 0, followers: 0, revenue: 0 },
      { month: 'Sep', streams: 0, followers: 0, revenue: 0 },
      { month: 'Oct', streams: 0, followers: 0, revenue: 0 },
      { month: 'Nov', streams: 0, followers: 0, revenue: 0 },
      { month: 'Dec', streams: 0, followers: 0, revenue: 0 }
    ],
    topTracks: [], // Empty - no tracks yet
    platformBreakdown: [
      { platform: 'Spotify', streams: 0, percentage: 0 },
      { platform: 'Apple Music', streams: 0, percentage: 0 },
      { platform: 'YouTube Music', streams: 0, percentage: 0 },
      { platform: 'Amazon Music', streams: 0, percentage: 0 }
    ],
    audienceInsights: {
      topCountries: [], // Empty - no audience data yet
      ageGroups: [
        { age: '18-24', percentage: 0 },
        { age: '25-34', percentage: 0 },
        { age: '35-44', percentage: 0 },
        { age: '45-54', percentage: 0 },
        { age: '55+', percentage: 0 }
      ]
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to view your analytics.</div>;
  }

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Only allow artists to access this page
  if (userRole !== 'artist') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available for artists.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getCurrentPeriodData = () => {
    const currentMonth = new Date().getMonth();
    return analyticsData.monthlyData[currentMonth];
  };

  const getPreviousPeriodData = () => {
    const previousMonth = new Date().getMonth() - 1;
    return analyticsData.monthlyData[previousMonth >= 0 ? previousMonth : 11];
  };

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return '---';
    return formatNumber(safeRound(safeDivide((current - previous) * 100, previous), 1));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your performance, audience, and growth metrics</p>
        </div>

        {/* Period and Currency Selectors */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {[
                { id: 'month', label: 'This Month' },
                { id: 'quarter', label: 'This Quarter' },
                { id: 'year', label: 'This Year' },
                { id: 'custom', label: 'Custom Range' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => {
                    setSelectedPeriod(period.id);
                    if (period.id === 'custom') {
                      setShowCustomDateRange(true);
                    } else {
                      setShowCustomDateRange(false);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedPeriod === period.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            
            {/* Currency Selector */}
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
              showLabel={true}
              compact={true}
            />
          </div>
        </div>

        {showCustomDateRange && (
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className="text-gray-600">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎵</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Streams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalStreams.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{getPercentageChange(getCurrentPeriodData().streams, getPreviousPeriodData().streams)}% vs last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Social Footprint</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalFollowers.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{getPercentageChange(getCurrentPeriodData().followers, getPreviousPeriodData().followers)}% vs last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">▶️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Plays</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalPlays.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +12.5% vs last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.totalRevenue, selectedCurrency)}
                </p>
                <p className="text-sm text-green-600">
                  +{getPercentageChange(getCurrentPeriodData().revenue, getPreviousPeriodData().revenue)}% vs last month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
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
              <button
                onClick={() => setActiveTab('social-footprint')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'social-footprint'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Social Footprint
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'overview' && (
              <>
                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-600">Performance chart will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
            <div className="space-y-4">
              {analyticsData.platformBreakdown.map((platform, index) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3" style={{
                      backgroundColor: ['#1DB954', '#FA243C', '#FF0000', '#FF9900'][index]
                    }}></div>
                    <span className="text-sm font-medium text-gray-900">{platform.platform}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{platform.streams.toLocaleString()} streams</span>
                    <span className="text-sm font-medium text-gray-900">{platform.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
                </div>

                {/* Top Tracks */}
                <div className="bg-white rounded-lg shadow mb-8">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Tracks</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Track
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Streams
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Growth
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analyticsData.topTracks.map((track) => (
                          <tr key={track.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">🎵</span>
                                <span className="text-sm font-medium text-gray-900">{track.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {track.streams.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatCurrency(track.revenue, selectedCurrency)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                track.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {track.growth > 0 ? '+' : ''}{track.growth}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audience Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Countries */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
                    <div className="space-y-4">
                      {analyticsData.audienceInsights.topCountries.map((country, index) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{country.country}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{country.streams.toLocaleString()} streams</span>
                            <span className="text-sm font-medium text-gray-900">{country.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Age Groups */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Demographics</h3>
                    <div className="space-y-4">
                      {analyticsData.audienceInsights.ageGroups.map((ageGroup) => (
                        <div key={ageGroup.age} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{ageGroup.age}</span>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${ageGroup.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{ageGroup.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'social-footprint' && (
              <SocialFootprintIntegration />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 
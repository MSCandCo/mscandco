import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole } from '@/lib/auth0-config';
import Layout from '@/components/layouts/mainLayout';

export default function PartnerAnalytics() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedTimeframe, setSelectedTimeframe] = useState('all-time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  const userRole = getUserRole(user);
  
  if (userRole !== 'distribution_partner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
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

  // Simple mock data
  const analyticsData = {
    totalReleases: 6,
    totalStreams: 2847293,
    totalDownloads: 45827,
    totalRevenue: 12450.75,
    monthlyGrowth: 18.5
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
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7-days">Last 7 Days</option>
                <option value="30-days">Last 30 Days</option>
                <option value="90-days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
                <option value="all-time">All Time</option>
              </select>
              
              {selectedTimeframe === 'custom' && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="text-sm font-medium text-gray-700">From:</label>
                    <input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="end-date" className="text-sm font-medium text-gray-700">To:</label>
                    <input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (customStartDate && customEndDate) {
                        console.log(`Applying custom date range: ${customStartDate} to ${customEndDate}`);
                        // Here you would typically refresh the data with the new date range
                      } else {
                        alert('Please select both start and end dates');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">R</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Releases</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(analyticsData.totalReleases)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Streams</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(analyticsData.totalStreams)}</p>
                  <p className="text-sm text-green-600">+{analyticsData.monthlyGrowth}% this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">D</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Downloads</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(analyticsData.totalDownloads)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">$</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Overview</h3>
            <p className="text-gray-600 mb-4">
              This dashboard provides analytics for all distributed releases. Detailed charts and breakdowns will be available soon.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Total active releases: {analyticsData.totalReleases}</li>
                  <li>• Average streams per release: {formatNumber(Math.round(analyticsData.totalStreams / analyticsData.totalReleases))}</li>
                  <li>• Monthly growth rate: {analyticsData.monthlyGrowth}%</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Revenue Insights</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Total revenue generated: {formatCurrency(analyticsData.totalRevenue)}</li>
                  <li>• Average revenue per release: {formatCurrency(analyticsData.totalRevenue / analyticsData.totalReleases)}</li>
                  <li>• Revenue per stream: {formatCurrency(analyticsData.totalRevenue / analyticsData.totalStreams)}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
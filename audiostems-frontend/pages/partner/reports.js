import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '@/lib/auth0-config';
import Layout from '@/components/layouts/mainLayout';
import { FaDownload, FaCalendar, FaDollarSign, FaMusic, FaTrendingUp, FaFileExcel, FaFilePdf } from 'react-icons/fa';

// Mock earnings data for all released assets
const mockEarningsData = {
  totalEarnings: 24587.92,
  monthlyEarnings: 3245.67,
  pendingPayouts: 1240.50,
  paidOut: 23347.42,
  
  earningsByRelease: [
    {
      id: 6,
      title: 'Midnight Sessions',
      artist: 'YHWH MSC',
      releaseDate: '2024-01-20',
      totalEarnings: 8450.75,
      monthlyEarnings: 1245.20,
      status: 'Live',
      tracks: [
        { title: 'Midnight Intro', earnings: 2840.25, streams: 456789 },
        { title: 'Late Night Groove', earnings: 3210.50, streams: 523180 },
        { title: 'City Lights', earnings: 2400.00, streams: 389012 }
      ]
    },
    {
      id: 5,
      title: 'Summer Vibes',
      artist: 'YHWH MSC',
      releaseDate: '2024-02-15',
      totalEarnings: 6890.40,
      monthlyEarnings: 980.30,
      status: 'Live',
      tracks: [
        { title: 'Summer Vibes', earnings: 6890.40, streams: 892104 }
      ]
    },
    {
      id: 1,
      title: 'Urban Beats Collection',
      artist: 'YHWH MSC',
      releaseDate: '2024-03-01',
      totalEarnings: 4567.89,
      monthlyEarnings: 650.45,
      status: 'Live',
      tracks: [
        { title: 'Urban Beat', earnings: 1890.30, streams: 245678 },
        { title: 'Street Rhythm', earnings: 1567.89, streams: 203456 },
        { title: 'City Lights', earnings: 1109.70, streams: 118298 }
      ]
    },
    {
      id: 2,
      title: 'Rock Anthem',
      artist: 'YHWH MSC',
      releaseDate: '2024-02-15',
      totalEarnings: 3240.88,
      monthlyEarnings: 245.72,
      status: 'Live',
      tracks: [
        { title: 'Rock Anthem', earnings: 3240.88, streams: 421567 }
      ]
    },
    {
      id: 4,
      title: 'Electronic Fusion EP',
      artist: 'YHWH MSC',
      releaseDate: '2024-05-01',
      totalEarnings: 1438.00,
      monthlyEarnings: 124.00,
      status: 'Live',
      tracks: [
        { title: 'Digital Waves', earnings: 456.00, streams: 59234 },
        { title: 'Synth Dreams', earnings: 389.50, streams: 50612 },
        { title: 'Bass Drop', earnings: 342.25, streams: 44501 },
        { title: 'Future Sounds', earnings: 250.25, streams: 32567 }
      ]
    }
  ],

  monthlyBreakdown: [
    { month: 'January 2024', earnings: 2456.78, releases: 2 },
    { month: 'February 2024', earnings: 3123.45, releases: 2 },
    { month: 'March 2024', earnings: 3567.89, releases: 1 },
    { month: 'April 2024', earnings: 4123.67, releases: 0 },
    { month: 'May 2024', earnings: 3890.12, releases: 1 },
    { month: 'June 2024', earnings: 4234.56, releases: 0 },
    { month: 'July 2024', earnings: 3191.45, releases: 0 },
    { month: 'August 2024', earnings: 3245.67, releases: 0 }
  ],

  platformEarnings: [
    { platform: 'Spotify', earnings: 12293.96, percentage: 50.0 },
    { platform: 'Apple Music', earnings: 7376.38, percentage: 30.0 },
    { platform: 'YouTube Music', earnings: 2950.55, percentage: 12.0 },
    { platform: 'Amazon Music', earnings: 1475.28, percentage: 6.0 },
    { platform: 'Other Platforms', earnings: 491.75, percentage: 2.0 }
  ]
};

export default function PartnerReports() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [selectedFormat, setSelectedFormat] = useState('detailed');

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'distribution_partner') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleExportReport = (format) => {
    console.log(`Exporting ${format} report for period: ${selectedPeriod}`);
    // Implementation would go here
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Earnings Reports</h1>
                <p className="text-sm text-gray-500">Earnings from all distributed releases and assets</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleExportReport('excel')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaFileExcel className="mr-2 h-4 w-4 text-green-600" />
                  Export Excel
                </button>
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaFilePdf className="mr-2 h-4 w-4 text-red-600" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Period Selector */}
          <div className="flex space-x-4 mb-6">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current-month">Current Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="current-year">Current Year</option>
              <option value="all-time">All Time</option>
            </select>
            
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="detailed">Detailed View</option>
              <option value="summary">Summary View</option>
              <option value="by-platform">By Platform</option>
            </select>
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaDollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(mockEarningsData.totalEarnings)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCalendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(mockEarningsData.monthlyEarnings)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaTrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(mockEarningsData.pendingPayouts)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaDownload className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Paid Out</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(mockEarningsData.paidOut)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings by Platform */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Earnings by Platform</h3>
              <div className="space-y-4">
                {mockEarningsData.platformEarnings.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-700">{platform.platform}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(platform.earnings)}</div>
                      <div className="text-xs text-gray-500">{platform.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Earnings Trend</h3>
              <div className="space-y-3">
                {mockEarningsData.monthlyBreakdown.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(month.earnings)}</div>
                      <div className="text-xs text-gray-500">{month.releases} new releases</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Earnings by Release */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Earnings by Release</h3>
            <div className="space-y-6">
              {mockEarningsData.earningsByRelease.map((release) => (
                <div key={release.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{release.title}</h4>
                      <p className="text-sm text-gray-500">{release.artist} • Released {release.releaseDate}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                        release.status === 'Live' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {release.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-gray-900">{formatCurrency(release.totalEarnings)}</div>
                      <div className="text-sm text-gray-500">Total earnings</div>
                      <div className="text-sm text-green-600 mt-1">{formatCurrency(release.monthlyEarnings)} this month</div>
                    </div>
                  </div>

                  {/* Track Breakdown */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Track Breakdown:</h5>
                    <div className="space-y-2">
                      {release.tracks.map((track, trackIndex) => (
                        <div key={trackIndex} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">{track.title}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(track.earnings)}</div>
                            <div className="text-xs text-gray-500">{formatNumber(track.streams)} streams</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
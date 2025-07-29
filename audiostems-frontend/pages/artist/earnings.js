import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { Calendar, ChevronDown } from 'lucide-react';

export default function ArtistEarnings() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [earningsData] = useState({
    totalEarnings: 12450,
    pendingEarnings: 2340,
    heldEarnings: 1560,
    availableForCashout: 890,
    minimumCashoutThreshold: 100,
    thisMonth: 3450,
    lastMonth: 2890,
    thisYear: 12450,
    lastYear: 8900,
    monthlyData: [
      { month: 'Jan', earnings: 2100, streams: 45000 },
      { month: 'Feb', earnings: 1800, streams: 38000 },
      { month: 'Mar', earnings: 2400, streams: 52000 },
      { month: 'Apr', earnings: 2200, streams: 48000 },
      { month: 'May', earnings: 2800, streams: 61000 },
      { month: 'Jun', earnings: 3200, streams: 72000 },
      { month: 'Jul', earnings: 2900, streams: 65000 },
      { month: 'Aug', earnings: 3100, streams: 68000 },
      { month: 'Sep', earnings: 2600, streams: 58000 },
      { month: 'Oct', earnings: 2400, streams: 52000 },
      { month: 'Nov', earnings: 2800, streams: 61000 },
      { month: 'Dec', earnings: 3500, streams: 78000 }
    ],
    recentTransactions: [
      {
        id: 1,
        type: 'streaming',
        amount: 450,
        date: '2024-01-15',
        platform: 'Spotify',
        status: 'paid'
      },
      {
        id: 2,
        type: 'download',
        amount: 120,
        date: '2024-01-14',
        platform: 'iTunes',
        status: 'pending'
      },
      {
        id: 3,
        type: 'streaming',
        amount: 380,
        date: '2024-01-13',
        platform: 'Apple Music',
        status: 'paid'
      },
      {
        id: 4,
        type: 'sync',
        amount: 800,
        date: '2024-01-12',
        platform: 'Film License',
        status: 'paid'
      },
      {
        id: 5,
        type: 'streaming',
        amount: 290,
        date: '2024-01-11',
        platform: 'YouTube Music',
        status: 'pending'
      }
    ]
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Please log in to view your earnings.</div>;
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

  const getCurrentPeriodEarnings = () => {
    switch (selectedPeriod) {
      case 'month':
        return earningsData.thisMonth;
      case 'year':
        return earningsData.thisYear;
      case 'custom':
        // For custom date range, calculate based on selected dates
        if (customStartDate && customEndDate) {
          // Mock calculation for custom date range
          const daysDiff = Math.ceil((new Date(customEndDate) - new Date(customStartDate)) / (1000 * 60 * 60 * 24));
          const avgDailyEarnings = earningsData.totalEarnings / 365; // Assuming 1 year of data
          return Math.round(avgDailyEarnings * daysDiff);
        }
        return earningsData.thisMonth; // Default to current month if no custom dates
      case 'all':
      default:
        return earningsData.totalEarnings;
    }
  };

  const getPreviousPeriodEarnings = () => {
    switch (selectedPeriod) {
      case 'month':
        return earningsData.lastMonth;
      case 'year':
        return earningsData.lastYear;
      case 'custom':
        // For custom date range, calculate previous period of same length
        if (customStartDate && customEndDate) {
          const daysDiff = Math.ceil((new Date(customEndDate) - new Date(customStartDate)) / (1000 * 60 * 60 * 24));
          const avgDailyEarnings = earningsData.totalEarnings / 365; // Assuming 1 year of data
          // Calculate previous period of same length (80% of current for demo)
          return Math.round(avgDailyEarnings * daysDiff * 0.8);
        }
        return earningsData.lastMonth; // Default to last month if no custom dates
      case 'all':
      default:
        return earningsData.totalEarnings * 0.8; // Assume 20% growth for demo
    }
  };

  const getPercentageChange = () => {
    const current = getCurrentPeriodEarnings();
    const previous = getPreviousPeriodEarnings();
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'streaming': return '🎵';
      case 'download': return '⬇️';
      case 'sync': return '🎬';
      default: return '💰';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings Dashboard</h1>
          <p className="text-gray-600">Track your revenue, payments, and earnings performance</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
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
        </div>

        {/* Custom Date Range */}
        {showCustomDateRange && (
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Start date"
              />
              <span className="text-gray-600">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                placeholder="End date"
              />
            </div>
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${earningsData.totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Period</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${getCurrentPeriodEarnings().toLocaleString()}
                </p>
                <p className={`text-sm ${getPercentageChange() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getPercentageChange()}% vs previous
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${earningsData.pendingEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className={`text-2xl font-bold ${getPercentageChange() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getPercentageChange()}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Funds Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Funds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${earningsData.heldEarnings.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Held in Platform</div>
              <div className="text-xs text-gray-500 mt-1">Minimum $100 to cash out</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${earningsData.availableForCashout.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Available for Cashout</div>
              <div className="text-xs text-gray-500 mt-1">Ready to withdraw</div>
            </div>
            <div className="text-center">
              <button
                disabled={earningsData.availableForCashout < earningsData.minimumCashoutThreshold}
                className={`px-6 py-2 rounded-lg font-medium ${
                  earningsData.availableForCashout >= earningsData.minimumCashoutThreshold
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {earningsData.availableForCashout >= earningsData.minimumCashoutThreshold
                  ? 'Cash Out'
                  : `Need $${earningsData.minimumCashoutThreshold - earningsData.availableForCashout} more`
                }
              </button>
            </div>
          </div>
        </div>

        {/* Earnings Chart Placeholder */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">Earnings chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earningsData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">{getTypeIcon(transaction.type)}</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.platform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
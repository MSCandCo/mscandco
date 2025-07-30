import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaDollarSign, FaChartLine, FaTrendingUp, FaTrendingDown, FaCalendar, FaFilter } from 'react-icons/fa';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';

// Mock data for label admin earnings
const mockEarningsData = {
  totalEarnings: 29990,
  thisMonth: 5670,
  lastMonth: 4890,
  growth: 15.9,
  minimumBalance: 1000,
  pendingWithdrawal: 2500,
  heldEarnings: 8500,
  monthlyBreakdown: [
    { month: 'Jan 2024', earnings: 4200, streams: 89000 },
    { month: 'Feb 2024', earnings: 4890, streams: 102000 },
    { month: 'Mar 2024', earnings: 5670, streams: 115000 },
    { month: 'Apr 2024', earnings: 5230, streams: 98000 },
    { month: 'May 2024', earnings: 6120, streams: 125000 },
    { month: 'Jun 2024', earnings: 5890, streams: 118000 }
  ],
  artistBreakdown: [
    { artist: 'YHWH MSC', earnings: 15420, streams: 234567, releases: 8 },
    { artist: 'MC Flow', earnings: 5670, streams: 89012, releases: 3 },
    { artist: 'Studio Pro', earnings: 8920, streams: 145678, releases: 5 }
  ],
  recentTransactions: [
    { id: 1, type: 'earnings', amount: 890, description: 'Acoustic Dreams - Spotify', date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'earnings', amount: 1560, description: 'Electronic Fusion - Apple Music', date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'withdrawal', amount: -2500, description: 'Withdrawal to bank account', date: '2024-01-10', status: 'pending' },
    { id: 4, type: 'earnings', amount: 2340, description: 'Summer Vibes EP - All platforms', date: '2024-01-08', status: 'completed' },
    { id: 5, type: 'earnings', amount: 720, description: 'Midnight Sessions - YouTube', date: '2024-01-05', status: 'completed' }
  ]
};

export default function LabelAdminEarnings() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'label_admin') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  const getAvailableForWithdrawal = () => {
    return Math.max(0, mockEarningsData.heldEarnings - mockEarningsData.minimumBalance - mockEarningsData.pendingWithdrawal);
  };

  const formatCurrency = (amount) => {
    return `£${amount.toLocaleString()}`;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Label Earnings</h1>
                <p className="text-sm text-gray-500">Track earnings across all your artists</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="6months">Last 6 Months</option>
                  <option value="12months">Last 12 Months</option>
                  <option value="year">This Year</option>
                </select>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockEarningsData.totalEarnings)}</p>
                  <div className="flex items-center mt-2">
                    {getGrowthIcon(mockEarningsData.growth)}
                    <span className={`text-sm font-medium ml-1 ${getGrowthColor(mockEarningsData.growth)}`}>
                      {mockEarningsData.growth}% from last month
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockEarningsData.thisMonth)}</p>
                  <p className="text-sm text-gray-500 mt-1">vs £4,890 last month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockEarningsData.heldEarnings)}</p>
                  <p className="text-xs text-gray-500 mt-1">Minimum £1,000 held in account</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available for Withdrawal</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(getAvailableForWithdrawal())}</p>
                  <p className="text-xs text-gray-500 mt-1">Amount above minimum balance</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* My Funds */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">My Funds</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(mockEarningsData.heldEarnings)}
                  </div>
                  <div className="text-sm text-gray-600">Available Balance</div>
                  <div className="text-xs text-gray-500 mt-1">Minimum {formatCurrency(mockEarningsData.minimumBalance)} held in account</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(getAvailableForWithdrawal())}
                  </div>
                  <div className="text-sm text-gray-600">Available for Withdrawal</div>
                  <div className="text-xs text-gray-500 mt-1">Amount above {formatCurrency(mockEarningsData.minimumBalance)} minimum</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(mockEarningsData.pendingWithdrawal)}
                  </div>
                  <div className="text-sm text-gray-600">Pending Withdrawal</div>
                  <div className="text-xs text-gray-500 mt-1">In transit to your account</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <button
                  disabled={getAvailableForWithdrawal() <= 0}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    getAvailableForWithdrawal() > 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {getAvailableForWithdrawal() > 0
                    ? 'Withdraw'
                    : 'No funds available'
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Artist Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Artist Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Releases</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streams</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockEarningsData.artistBreakdown.map((artist, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{artist.artist}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.releases}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(artist.earnings)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.streams.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockEarningsData.recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
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
      </div>
    </Layout>
  );
} 
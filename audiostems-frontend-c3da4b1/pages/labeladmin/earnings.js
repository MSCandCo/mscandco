import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRole, getUserBrand } from '../../lib/user-utils';
import Layout from '../../components/layouts/mainLayout';
import { FaDollarSign, FaChartLine, FaTrendingUp, FaTrendingDown, FaCalendar, FaFilter } from 'react-icons/fa';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { RELEASES, ARTISTS, DASHBOARD_STATS } from '../../lib/emptyData';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { formatNumber, safeRound } from '../../lib/number-utils';

// Calculate earnings data from centralized RELEASES and ARTISTS data
const calculateEarningsData = (userBrand) => {
  const labelName = userBrand?.displayName || 'MSC & Co';
  
  // Get approved artists for this label
  const labelArtists = ARTISTS.filter(artist => 
    artist.status === 'active' && 
    (artist.label === labelName || artist.brand === labelName)
  );
  
  // Get releases for label artists
  const labelArtistIds = labelArtists.map(artist => artist.id);
  const labelReleases = RELEASES.filter(release => 
    labelArtistIds.includes(release.artistId)
  );
  
  // Calculate total earnings from releases
  const totalEarnings = labelReleases.reduce((sum, release) => sum + (release.earnings || 0), 0);
  
  // Calculate total streams
  const totalStreams = labelReleases.reduce((sum, release) => sum + (release.streams || 0), 0);
  
  // Generate monthly breakdown (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const monthlyBreakdown = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    // Calculate earnings for this month (simplified distribution)
    const monthEarnings = Math.round(totalEarnings * (0.15 + Math.random() * 0.1));
    const monthStreams = Math.round(totalStreams * (0.15 + Math.random() * 0.1));
    
    monthlyBreakdown.push({
      month: `${monthName} ${year}`,
      earnings: monthEarnings,
      streams: monthStreams
    });
  }
  
  // Calculate artist breakdown
  const artistBreakdown = labelArtists.map(artist => {
    const artistReleases = labelReleases.filter(release => release.artistId === artist.id);
    const artistEarnings = artistReleases.reduce((sum, release) => sum + (release.earnings || 0), 0);
    const artistStreams = artistReleases.reduce((sum, release) => sum + (release.streams || 0), 0);
    
    return {
      artist: artist.name,
      earnings: artistEarnings,
      streams: artistStreams,
      releases: artistReleases.length
    };
  }).sort((a, b) => b.earnings - a.earnings);
  
  // Generate recent transactions from releases
  const recentTransactions = [];
  let transactionId = 1;
  
  // Add earnings transactions from recent releases
  labelReleases
    .filter(release => release.earnings > 0)
    .slice(0, 8)
    .forEach(release => {
      // Split earnings into platform-specific transactions
      const platforms = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music'];
      const platformEarnings = release.earnings / platforms.length;
      
      platforms.slice(0, Math.min(2, platforms.length)).forEach(platform => {
        recentTransactions.push({
          id: transactionId++,
          type: 'earnings',
          amount: Math.round(platformEarnings),
          description: `${release.projectName} - ${platform}`,
          date: release.lastUpdated,
          status: 'completed'
        });
      });
    });
  
  // Add some withdrawal transactions
  recentTransactions.push(
    {
      id: transactionId++,
      type: 'withdrawal',
      amount: -2500,
      description: 'Withdrawal to bank account',
      date: '2024-01-10',
      status: 'pending'
    },
    {
      id: transactionId++,
      type: 'withdrawal',
      amount: -3500,
      description: 'Withdrawal to bank account',
      date: '2024-01-01',
      status: 'completed'
    }
  );
  
  // Sort by date (most recent first)
  recentTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const thisMonth = monthlyBreakdown[monthlyBreakdown.length - 1]?.earnings || 0;
  const lastMonth = monthlyBreakdown[monthlyBreakdown.length - 2]?.earnings || 0;
  const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100) : 0;
  
  const minimumBalance = 1000;
  const pendingWithdrawal = 2500;
  const heldEarnings = Math.round(totalEarnings * 0.3); // 30% of total earnings held
  
  return {
    totalEarnings,
    thisMonth,
    lastMonth,
    growth: formatNumber(safeRound(growth, 1)),
    minimumBalance,
    pendingWithdrawal,
    heldEarnings,
    monthlyBreakdown,
    artistBreakdown,
    recentTransactions: recentTransactions.slice(0, 10)
  };
};

export default function LabelAdminEarnings() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Calculate earnings data from centralized sources
  const earningsData = useMemo(() => {
    return calculateEarningsData(userBrand);
  }, [userBrand]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'label_admin') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  const getAvailableForWithdrawal = () => {
    return Math.max(0, earningsData.heldEarnings - earningsData.minimumBalance - earningsData.pendingWithdrawal);
  };

  // Use shared currency formatting function

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
              <div className="flex items-center space-x-4 flex-wrap">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="12months">Last 12 Months</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                {selectedPeriod === 'custom' && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">From:</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">To:</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (customStartDate && customEndDate) {
                          console.log(`Applying custom date range for earnings: ${customStartDate} to ${customEndDate}`);
                          // Refresh earnings data with custom date range
                        } else {
                          alert('Please select both start and end dates');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </>
                )}
                <CurrencySelector 
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                  compact={true}
                />
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
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(earningsData.totalEarnings, selectedCurrency)}</p>
                  <div className="flex items-center mt-2">
                    {getGrowthIcon(earningsData.growth)}
                    <span className={`text-sm font-medium ml-1 ${getGrowthColor(earningsData.growth)}`}>
                      {earningsData.growth}% from last month
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
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(earningsData.thisMonth, selectedCurrency)}</p>
                  <p className="text-sm text-gray-500 mt-1">vs {formatCurrency(earningsData.lastMonth, selectedCurrency)} last month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(earningsData.heldEarnings, selectedCurrency)}</p>
                  <p className="text-xs text-gray-500 mt-1">Minimum {formatCurrency(earningsData.minimumBalance, selectedCurrency)} held in account</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available for Withdrawal</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(getAvailableForWithdrawal(), selectedCurrency)}</p>
                  <p className="text-xs text-gray-500 mt-1">Amount above minimum balance</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Revenue Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
              <p className="text-sm text-gray-500">Monthly earnings over the last 6 months</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {earningsData.monthlyBreakdown.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 text-sm font-medium text-gray-700">{month.month}</div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-3 w-48">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, (month.earnings / Math.max(...earningsData.monthlyBreakdown.map(m => m.earnings))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(month.earnings, selectedCurrency)}</div>
                      <div className="text-xs text-gray-500">{month.streams.toLocaleString()} streams</div>
                    </div>
                  </div>
                ))}
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
                    {formatCurrency(earningsData.heldEarnings, selectedCurrency)}
                  </div>
                  <div className="text-sm text-gray-600">Available Balance</div>
                  <div className="text-xs text-gray-500 mt-1">Minimum {formatCurrency(earningsData.minimumBalance, selectedCurrency)} held in account</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(getAvailableForWithdrawal(), selectedCurrency)}
                  </div>
                  <div className="text-sm text-gray-600">Available for Withdrawal</div>
                  <div className="text-xs text-gray-500 mt-1">Amount above {formatCurrency(earningsData.minimumBalance, selectedCurrency)} minimum</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(earningsData.pendingWithdrawal, selectedCurrency)}
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
                  {earningsData.artistBreakdown.map((artist, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{artist.artist}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.releases}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(artist.earnings, selectedCurrency)}</td>
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
                  {earningsData.recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount, selectedCurrency)}
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
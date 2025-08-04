import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layouts/mainLayout';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  Calendar,
  Music,
  Users,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { formatNumber, formatPercentage, safeDivide } from '@/lib/number-utils';
import { useModals } from '@/hooks/useModals';
import { ConfirmationModal, NotificationModal } from '@/components/shared/ConfirmationModal';

export default function CompanyAdminEarnings() {
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedAssetType, setSelectedAssetType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showEarningsDetails, setShowEarningsDetails] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const {
    confirmModal,
    notificationModal,
    confirmWithdrawal,
    showSuccess,
    showError,
    showWarning,
    closeConfirmModal,
    closeNotificationModal
  } = useModals();

  // Company Admin Revenue Split Configuration (should be loaded from backend)
  const [revenueSplit] = useState({
    distributionPartnerPercentage: 15, // Code Group takes 15%
    companyAdminPercentage: 10,        // Company Admin takes 10% of remainder
    individualLabelAdminPercentages: {
      'yhwh-msc': 5,      // YHWH MSC gets 5% of final pool
      'major-label': 25,   // Major Label gets 25% of final pool
      'k-entertainment': 30, // K-Entertainment gets 30% of final pool
      'indie-collective': 20  // Indie Collective gets 20% of final pool
    }
  });

  // Mock earnings data from distribution partner reports
  const [earningsData] = useState({
    totalEarnings: 2847293.50,
    companyAdminShare: 284729.35, // 10% of remainder after distribution partner cut
    availableForWithdrawal: 251456.78,
    pendingEarnings: 33272.57,
    totalWithdrawn: 567849.23,
    
    // Asset-level earnings breakdown
    assetEarnings: [
      {
        id: 'asset-001',
        title: 'Urban Dynamics',
        artist: 'Alex Rivers',
        labelAdmin: 'YHWH MSC',
        type: 'single',
        totalEarnings: 156789.45,
        companyAdminEarnings: 15678.95,
        platforms: {
          spotify: 89234.12,
          appleMusic: 34567.89,
          youtube: 23456.78,
          amazonMusic: 9530.66
        },
        status: 'paid',
        reportedDate: '2024-01-15',
        lastPayout: '2024-01-20'
      },
      {
        id: 'asset-002',
        title: 'Midnight Echoes',
        artist: 'Luna Stars',
        labelAdmin: 'Major Label Music',
        type: 'album',
        totalEarnings: 298734.67,
        companyAdminEarnings: 29873.47,
        platforms: {
          spotify: 167823.45,
          appleMusic: 78456.23,
          youtube: 34567.89,
          amazonMusic: 17887.10
        },
        status: 'pending',
        reportedDate: '2024-01-18',
        lastPayout: null
      },
      {
        id: 'asset-003',
        title: 'Electronic Vibes',
        artist: 'Tech Beats',
        labelAdmin: 'K-Entertainment',
        type: 'EP',
        totalEarnings: 89456.23,
        companyAdminEarnings: 8945.62,
        platforms: {
          spotify: 45678.90,
          appleMusic: 23456.78,
          youtube: 15432.10,
          amazonMusic: 4888.45
        },
        status: 'paid',
        reportedDate: '2024-01-10',
        lastPayout: '2024-01-15'
      },
      {
        id: 'asset-004',
        title: 'Acoustic Dreams',
        artist: 'Sarah Chen',
        labelAdmin: 'Indie Collective',
        type: 'single',
        totalEarnings: 45678.90,
        companyAdminEarnings: 4567.89,
        platforms: {
          spotify: 28901.23,
          appleMusic: 12345.67,
          youtube: 3456.78,
          amazonMusic: 975.22
        },
        status: 'pending',
        reportedDate: '2024-01-20',
        lastPayout: null
      }
    ],

    // Monthly earnings trend
    monthlyTrend: [
      { month: 'Jul 2023', earnings: 189456.78 },
      { month: 'Aug 2023', earnings: 234567.89 },
      { month: 'Sep 2023', earnings: 198765.43 },
      { month: 'Oct 2023', earnings: 267890.12 },
      { month: 'Nov 2023', earnings: 298734.56 },
      { month: 'Dec 2023', earnings: 334567.89 },
      { month: 'Jan 2024', earnings: 284729.35 }
    ],

    // Platform performance
    platformBreakdown: {
      spotify: { earnings: 1567890.45, percentage: 55.2 },
      appleMusic: { earnings: 789345.67, percentage: 27.8 },
      youtube: { earnings: 345678.90, percentage: 12.1 },
      amazonMusic: { earnings: 144378.48, percentage: 5.1 }
    }
  });

  // Filter assets based on selected criteria
  const filteredAssets = useMemo(() => {
    return earningsData.assetEarnings.filter(asset => {
      if (selectedAssetType !== 'all' && asset.type !== selectedAssetType) return false;
      if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;
      return true;
    });
  }, [earningsData.assetEarnings, selectedAssetType, selectedStatus]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalAssets = filteredAssets.length;
    const paidAssets = filteredAssets.filter(a => a.status === 'paid').length;
    const pendingAssets = filteredAssets.filter(a => a.status === 'pending').length;
    const totalFilteredEarnings = filteredAssets.reduce((sum, asset) => sum + asset.companyAdminEarnings, 0);
    
    return {
      totalAssets,
      paidAssets,
      pendingAssets,
      totalFilteredEarnings,
      averageEarningsPerAsset: safeDivide(totalFilteredEarnings, totalAssets),
      paymentRate: formatPercentage(safeDivide(paidAssets, totalAssets))
    };
  }, [filteredAssets]);

  const handleWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      showError('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > earningsData.availableForWithdrawal) {
      showError('Insufficient Funds', 'Withdrawal amount exceeds available balance.');
      return;
    }

    confirmWithdrawal(`${formatCurrency(amount, selectedCurrency)}`, () => {
      // Simulate withdrawal processing
      setTimeout(() => {
        setWithdrawalAmount('');
        setShowWithdrawalModal(false);
        showSuccess('Withdrawal Requested', 'Your withdrawal request has been submitted for processing.');
      }, 1000);
    });
  };

  const downloadEarningsReport = () => {
    showSuccess('Report Generated', 'Earnings report has been downloaded successfully.');
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Admin Earnings</h1>
              <p className="text-gray-600">Track and manage earnings from all assets across the platform</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
              <button
                onClick={downloadEarningsReport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </button>
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Withdraw Funds
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Company Earnings</p>
                  <p 
                    className="font-bold text-gray-900"
                    style={{
                      fontSize: `${Math.min(24, Math.max(16, 200 / formatCurrency(earningsData.companyAdminShare, selectedCurrency).length))}px`
                    }}
                  >
                    {formatCurrency(earningsData.companyAdminShare, selectedCurrency)}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+12.5% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Available for Withdrawal</p>
                  <p 
                    className="font-bold text-gray-900"
                    style={{
                      fontSize: `${Math.min(24, Math.max(16, 200 / formatCurrency(earningsData.availableForWithdrawal, selectedCurrency).length))}px`
                    }}
                  >
                    {formatCurrency(earningsData.availableForWithdrawal, selectedCurrency)}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <Wallet className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-blue-600">Ready to withdraw</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Wallet className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                  <p 
                    className="font-bold text-gray-900"
                    style={{
                      fontSize: `${Math.min(24, Math.max(16, 200 / formatCurrency(earningsData.pendingEarnings, selectedCurrency).length))}px`
                    }}
                  >
                    {formatCurrency(earningsData.pendingEarnings, selectedCurrency)}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-orange-600">Awaiting distribution</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p 
                    className="font-bold text-gray-900"
                    style={{
                      fontSize: `${Math.min(24, Math.max(16, 200 / analytics.totalAssets.toString().length))}px`
                    }}
                  >
                    {formatNumber(analytics.totalAssets)}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <Music className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-purple-600">Generating income</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Music className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Filters:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
                <select
                  value={selectedAssetType}
                  onChange={(e) => setSelectedAssetType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Asset Types</option>
                  <option value="single">Singles</option>
                  <option value="album">Albums</option>
                  <option value="EP">EPs</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Earnings Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Monthly Earnings Trend</h3>
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-4">
                {earningsData.monthlyTrend.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{month.month}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(month.earnings / Math.max(...earningsData.monthlyTrend.map(m => m.earnings))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 min-w-0">
                        {formatCurrency(month.earnings, selectedCurrency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Platform Performance</h3>
                <PieChart className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-4">
                {Object.entries(earningsData.platformBreakdown).map(([platform, data]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 capitalize">{platform}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{data.percentage}%</span>
                      <span className="text-sm font-medium text-gray-900 min-w-0">
                        {formatCurrency(data.earnings, selectedCurrency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Asset Earnings Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Asset Earnings Breakdown</h3>
                <span className="text-sm text-gray-600">
                  {filteredAssets.length} assets • {formatCurrency(analytics.totalFilteredEarnings, selectedCurrency)} total
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist/Label</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Share</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{asset.title}</div>
                            <div className="text-sm text-gray-500">Reported: {asset.reportedDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{asset.artist}</div>
                        <div className="text-sm text-gray-500">{asset.labelAdmin}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(asset.totalEarnings, selectedCurrency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(asset.companyAdminEarnings, selectedCurrency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          asset.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {asset.status === 'paid' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setShowEarningsDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Withdrawal Modal */}
          {showWithdrawalModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Withdraw Funds</h3>
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Balance
                    </label>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(earningsData.availableForWithdrawal, selectedCurrency)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Withdrawal Amount
                    </label>
                    <input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowWithdrawalModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleWithdrawal}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Request Withdrawal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Asset Details Modal */}
          {showEarningsDetails && selectedAsset && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Earnings Details</h3>
                  <button
                    onClick={() => setShowEarningsDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{selectedAsset.title}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Artist:</span>
                        <span className="ml-2 text-gray-900">{selectedAsset.artist}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Label:</span>
                        <span className="ml-2 text-gray-900">{selectedAsset.labelAdmin}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 text-gray-900 capitalize">{selectedAsset.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`ml-2 capitalize ${
                          selectedAsset.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {selectedAsset.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Platform Breakdown</h5>
                    <div className="space-y-2">
                      {Object.entries(selectedAsset.platforms).map(([platform, earnings]) => (
                        <div key={platform} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-900 capitalize">{platform}</span>
                          <span className="text-sm text-gray-900">{formatCurrency(earnings, selectedCurrency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Total Asset Earnings:</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(selectedAsset.totalEarnings, selectedCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Company Admin Share (10%):</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(selectedAsset.companyAdminEarnings, selectedCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />

      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotificationModal}
        type={notificationModal.type}
        title={notificationModal.title}
        message={notificationModal.message}
      />
    </MainLayout>
  );
}
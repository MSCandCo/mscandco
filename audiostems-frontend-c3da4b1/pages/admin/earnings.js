import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
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
  AlertCircle,
  Shield,
  Settings,
  Globe,
  Target
} from 'lucide-react';
import { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { formatNumber, formatPercentage, safeDivide } from '@/lib/number-utils';
import { getUserRole } from '@/lib/user-utils';
import { useModals } from '@/hooks/useModals';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import NotificationModal from '@/components/shared/NotificationModal';

export default function SuperAdminEarnings() {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedAssetType, setSelectedAssetType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showEarningsDetails, setShowEarningsDetails] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, analytics, config

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

  // Get user role
  const userRole = getUserRole(user);

  // Check super admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (!['super_admin', 'company_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    } else if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Super Admin Global Revenue Split Configuration
  const [globalRevenueSplit, setGlobalRevenueSplit] = useState({
    distributionPartnerPercentage: 15, // Code Group takes 15% first
    companyAdminPercentage: 10,        // Company Admin takes 10% second
    superAdminReserve: 2,              // Super Admin reserve fund (2%)
    platformMaintenanceFee: 1,         // Platform maintenance (1%)
    individualLabelAdminPercentages: {
      'yhwh-msc': 5,           // YHWH MSC gets 5% of final pool
      'major-label': 25,       // Major Label gets 25% of final pool
      'k-entertainment': 30,   // K-Entertainment gets 30% of final pool
      'indie-collective': 20,  // Indie Collective gets 20% of final pool
      'distribution-partners': 15 // Other distribution partners
    }
  });

  // Super Admin can see ALL platform earnings across ALL brands
  const [platformEarningsData] = useState({
    totalPlatformEarnings: 8547293.50,    // Total across all brands
    distributionPartnerShare: 1282094.03,  // 15% to Code Group
    companyAdminShare: 854729.35,          // 10% to Company Admins
    superAdminReserve: 170945.87,          // 2% Super Admin reserve
    platformMaintenanceFund: 85472.94,     // 1% Platform maintenance
    availableForWithdrawal: 1251456.78,
    pendingEarnings: 433272.57,
    totalWithdrawn: 2567849.23,
    
    // Brand-level breakdown
    brandEarnings: {
      'yhwh-msc': {
        totalEarnings: 0.50,
        companyAdminShare: 284729.35,
        labelAdminShare: 142364.68,
        artistShare: 1989705.48,
        status: 'active'
      },
      'major-label': {
        totalEarnings: 0.23,
        companyAdminShare: 345678.92,
        labelAdminShare: 864197.31,
        artistShare: 1935335.46,
        status: 'active'
      },
      'k-entertainment': {
        totalEarnings: 0.78,
        companyAdminShare: 178945.68,
        labelAdminShare: 536837.03,
        artistShare: 982674.07,
        status: 'active'
      },
      'indie-collective': {
        totalEarnings: 0.99,
        companyAdminShare: 45375.40,
        labelAdminShare: 90750.80,
        artistShare: 272628.19,
        status: 'pending'
      }
    },
    
    // Asset-level earnings breakdown (Super Admin sees ALL assets)
    assetEarnings: [
      {
        id: 'asset-001',
        title: 'Urban Dynamics',
        artist: 'Alex Rivers',
        labelAdmin: 'YHWH MSC',
        brand: 'YHWH MSC',
        type: 'single',
        totalEarnings: 0.45,
        distributionPartnerCut: 23518.42,
        companyAdminEarnings: 13326.80,
        superAdminReserve: 3135.79,
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
        brand: 'Major Label',
        type: 'album',
        totalEarnings: 0.67,
        distributionPartnerCut: 44810.20,
        companyAdminEarnings: 25386.12,
        superAdminReserve: 5974.69,
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
        brand: 'K-Entertainment',
        type: 'EP',
        totalEarnings: 0.23,
        distributionPartnerCut: 13418.43,
        companyAdminEarnings: 7604.78,
        superAdminReserve: 1789.12,
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
        brand: 'Indie Collective',
        type: 'single',
        totalEarnings: 0.90,
        distributionPartnerCut: 6851.84,
        companyAdminEarnings: 3885.27,
        superAdminReserve: 913.58,
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

    // Global monthly earnings trend
    monthlyTrend: [
      { month: 'Jul 2023', earnings: 589456.78, brands: 4 },
      { month: 'Aug 2023', earnings: 634567.89, brands: 4 },
      { month: 'Sep 2023', earnings: 698765.43, brands: 4 },
      { month: 'Oct 2023', earnings: 723456.78, brands: 4 },
      { month: 'Nov 2023', earnings: 756789.23, brands: 4 },
      { month: 'Dec 2023', earnings: 845672.34, brands: 4 },
      { month: 'Jan 2024', earnings: 854729.35, brands: 4 }
    ]
  });

  // Get unique brands for filtering
  const brands = Object.keys(platformEarningsData.brandEarnings);

  // Filter assets based on selected criteria
  const filteredAssets = useMemo(() => {
    return platformEarningsData.assetEarnings.filter(asset => {
      const matchesType = selectedAssetType === 'all' || asset.type === selectedAssetType;
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
      const matchesBrand = selectedBrand === 'all' || asset.brand === selectedBrand;
      return matchesType && matchesStatus && matchesBrand;
    });
  }, [selectedAssetType, selectedStatus, selectedBrand]);

  const handleWithdrawal = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      showError('Please enter a valid withdrawal amount');
      return;
    }
    
    const amount = parseFloat(withdrawalAmount);
    if (amount > platformEarningsData.availableForWithdrawal) {
      showError('Withdrawal amount exceeds available balance');
      return;
    }

    confirmWithdrawal(
      'Confirm Super Admin Withdrawal',
      `Are you sure you want to withdraw ${formatCurrency(amount, selectedCurrency)} from the Super Admin reserve fund?`,
      () => {
        showSuccess(`Successfully withdrew ${formatCurrency(amount, selectedCurrency)} from Super Admin reserve`);
        setWithdrawalAmount('');
        setShowWithdrawalModal(false);
      }
    );
  };

  const handleRevenueSplitUpdate = () => {
    showSuccess('Global revenue split configuration updated successfully');
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50';
  };

  const getAssetTypeIcon = (type) => {
    const icons = {
      'single': '🎵',
      'album': '💿',
      'EP': '🎶',
      'compilation': '📀'
    };
    return icons[type] || '🎵';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading platform earnings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Super Admin - Platform Earnings Management"
        description="Global platform revenue oversight and management"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Shield className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Super Admin - Platform Earnings</h1>
              </div>
              <p className="text-red-100 text-lg">
                Global revenue management and distribution control across all brands
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-100">Total Platform Revenue</div>
              <div className="text-2xl font-bold">
                {formatCurrency(platformEarningsData.totalPlatformEarnings, selectedCurrency)}
              </div>
            </div>
          </div>
        </div>

        {/* Super Admin Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Super Admin Reserve</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(platformEarningsData.superAdminReserve, selectedCurrency)}
                </p>
                <p className="text-green-100 text-xs mt-1">2% of total revenue</p>
              </div>
              <div className="p-3 bg-green-500 bg-opacity-50 rounded-xl">
                <Shield className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Platform Maintenance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(platformEarningsData.platformMaintenanceFund, selectedCurrency)}
                </p>
                <p className="text-blue-100 text-xs mt-1">1% infrastructure fund</p>
              </div>
              <div className="p-3 bg-blue-500 bg-opacity-50 rounded-xl">
                <Settings className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Available for Withdrawal</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(platformEarningsData.availableForWithdrawal, selectedCurrency)}
                </p>
                <p className="text-purple-100 text-xs mt-1">Ready for payout</p>
              </div>
              <div className="p-3 bg-purple-500 bg-opacity-50 rounded-xl">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Brands</p>
                <p className="text-2xl font-bold">{brands.length}</p>
                <p className="text-orange-100 text-xs mt-1">Generating revenue</p>
              </div>
              <div className="p-3 bg-orange-500 bg-opacity-50 rounded-xl">
                <Building2 className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Revenue Overview', icon: BarChart3 },
                { id: 'detailed', name: 'Detailed Breakdown', icon: Eye },
                { id: 'analytics', name: 'Platform Analytics', icon: TrendingUp },
                { id: 'config', name: 'Revenue Configuration', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`${
                    viewMode === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Revenue Overview */}
          {viewMode === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Brand Revenue Breakdown */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue by Brand</h3>
                  <div className="space-y-4">
                    {Object.entries(platformEarningsData.brandEarnings).map(([brand, data]) => (
                      <div key={brand} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{brand.replace('-', ' ')}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            data.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {data.status}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {formatCurrency(data.totalEarnings, selectedCurrency)}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Company Share:</span>
                            <div className="font-medium text-purple-600">
                              {formatCurrency(data.companyAdminShare, selectedCurrency)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Label Share:</span>
                            <div className="font-medium text-blue-600">
                              {formatCurrency(data.labelAdminShare, selectedCurrency)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Artist Share:</span>
                            <div className="font-medium text-green-600">
                              {formatCurrency(data.artistShare, selectedCurrency)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Trend Chart */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Growth Trend</h3>
                  <div className="bg-gradient-to-br from-red-50 to-purple-50 rounded-lg p-4">
                    {platformEarningsData.monthlyTrend.map((month, index) => {
                      const isLatest = index === platformEarningsData.monthlyTrend.length - 1;
                      const previousMonth = index > 0 ? platformEarningsData.monthlyTrend[index - 1] : null;
                      const growth = previousMonth 
                        ? ((month.earnings - previousMonth.earnings) / previousMonth.earnings) * 100
                        : 0;
                      
                      return (
                        <div key={month.month} className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
                          isLatest ? 'bg-red-100 border-2 border-red-300' : 'bg-white'
                        }`}>
                          <div>
                            <span className="font-medium text-gray-900">{month.month}</span>
                            {growth !== 0 && (
                              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {formatCurrency(month.earnings, selectedCurrency)}
                            </div>
                            <div className="text-xs text-gray-500">{month.brands} brands</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          {viewMode === 'detailed' && (
            <div className="p-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type:</label>
                  <select
                    value={selectedAssetType}
                    onChange={(e) => setSelectedAssetType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Types</option>
                    <option value="single">Singles</option>
                    <option value="album">Albums</option>
                    <option value="EP">EPs</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand:</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    onClick={() => setShowWithdrawalModal(true)}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Super Admin Withdrawal
                  </button>
                </div>
              </div>

              {/* Assets Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Total Earnings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Distribution Cut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Super Admin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAssets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-2xl mr-3">{getAssetTypeIcon(asset.type)}</div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{asset.title}</div>
                                <div className="text-xs text-gray-500">by {asset.artist}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              {asset.brand}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(asset.totalEarnings, selectedCurrency)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              {formatCurrency(asset.distributionPartnerCut, selectedCurrency)}
                            </div>
                            <div className="text-xs text-gray-500">15% to Code Group</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-red-600">
                              {formatCurrency(asset.superAdminReserve, selectedCurrency)}
                            </div>
                            <div className="text-xs text-gray-500">2% reserve</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                              {asset.status === 'paid' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                              {asset.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedAsset(asset)}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-purple-600 hover:text-purple-900">
                              <Settings className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Configuration */}
          {viewMode === 'config' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Global Revenue Split Configuration</h3>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-600">Super Admin Control</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-purple-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Primary Distribution</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Distribution Partner (Code Group) %
                        </label>
                        <input
                          type="number"
                          value={globalRevenueSplit.distributionPartnerPercentage}
                          onChange={(e) => setGlobalRevenueSplit({
                            ...globalRevenueSplit,
                            distributionPartnerPercentage: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Admin %
                        </label>
                        <input
                          type="number"
                          value={globalRevenueSplit.companyAdminPercentage}
                          onChange={(e) => setGlobalRevenueSplit({
                            ...globalRevenueSplit,
                            companyAdminPercentage: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Super Admin Reserve %
                        </label>
                        <input
                          type="number"
                          value={globalRevenueSplit.superAdminReserve}
                          onChange={(e) => setGlobalRevenueSplit({
                            ...globalRevenueSplit,
                            superAdminReserve: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Platform Maintenance %
                        </label>
                        <input
                          type="number"
                          value={globalRevenueSplit.platformMaintenanceFee}
                          onChange={(e) => setGlobalRevenueSplit({
                            ...globalRevenueSplit,
                            platformMaintenanceFee: parseFloat(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Label Admin Percentages</h4>
                      
                      {Object.entries(globalRevenueSplit.individualLabelAdminPercentages).map(([label, percentage]) => (
                        <div key={label}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {label.replace('-', ' ')} %
                          </label>
                          <input
                            type="number"
                            value={percentage}
                            onChange={(e) => setGlobalRevenueSplit({
                              ...globalRevenueSplit,
                              individualLabelAdminPercentages: {
                                ...globalRevenueSplit.individualLabelAdminPercentages,
                                [label]: parseFloat(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleRevenueSplitUpdate}
                      className="w-full flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Update Global Revenue Split Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Withdrawal Modal */}
        {showWithdrawalModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-red-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Super Admin Withdrawal</h3>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Available: {formatCurrency(platformEarningsData.availableForWithdrawal, selectedCurrency)}
                  </p>
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="Enter withdrawal amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowWithdrawalModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdrawal}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </MainLayout>
  );
}
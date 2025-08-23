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
  const [viewMode, setViewMode] = useState('approval'); // approval, overview, detailed, analytics, config
  
  // Revenue Approval States
  const [pendingReports, setPendingReports] = useState([]); // TODO: Load from Supabase revenue_reports table where status = 'pending'

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

  // Revenue Approval Functions
  const handleApproveRevenue = (reportId) => {
    const report = pendingReports.find(r => r.id === reportId);
    if (report) {
      setPendingReports(prev => prev.filter(r => r.id !== reportId));
      showSuccess(
        `Revenue report for ${report.platform} (${formatCurrency(report.amount, selectedCurrency)}) has been approved and will be distributed to artists and labels.`,
        'Revenue Approved'
      );
    }
  };

  const handleRejectRevenue = (reportId) => {
    const report = pendingReports.find(r => r.id === reportId);
    if (report) {
      setPendingReports(prev => prev.filter(r => r.id !== reportId));
      showWarning(
        `Revenue report for ${report.platform} (${formatCurrency(report.amount, selectedCurrency)}) has been rejected and returned to distribution partner.`,
        'Revenue Rejected'
      );
    }
  };

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

  // Super Admin can see ALL platform earnings across ALL brands - Clean state
  const [platformEarningsData] = useState({
    totalPlatformEarnings: 0,    // Total across all brands
    distributionPartnerShare: 0,  // 15% to Code Group
    companyAdminShare: 0,          // 10% to Company Admins
    superAdminReserve: 0,          // 2% Super Admin reserve
    platformMaintenanceFund: 0,     // 1% Platform maintenance
    availableForWithdrawal: 0,
    pendingEarnings: 0,
    totalWithdrawn: 0,
    
    // Brand-level breakdown - empty state
    brandEarnings: {
      'yhwh-msc': {
        totalEarnings: 0,
        companyAdminShare: 0,
        labelAdminShare: 0,
        artistShare: 0,
        status: 'active'
      },
      'major-label': {
        totalEarnings: 0,
        companyAdminShare: 0,
        labelAdminShare: 0,
        artistShare: 0,
        status: 'active'
      },
      'k-entertainment': {
        totalEarnings: 0,
        companyAdminShare: 0,
        labelAdminShare: 0,
        artistShare: 0,
        status: 'active'
      },
      'indie-collective': {
        totalEarnings: 0,
        companyAdminShare: 0,
        labelAdminShare: 0,
        artistShare: 0,
        status: 'pending'
      }
    },
    
    // Asset-level earnings breakdown (Super Admin sees ALL assets) - Empty state
    assetEarnings: [],

    // Global monthly earnings trend - Empty state
    monthlyTrend: [
      { month: 'Jul 2023', earnings: 0, brands: 0 },
      { month: 'Aug 2023', earnings: 0, brands: 0 },
      { month: 'Sep 2023', earnings: 0, brands: 0 },
      { month: 'Oct 2023', earnings: 0, brands: 0 },
      { month: 'Nov 2023', earnings: 0, brands: 0 },
      { month: 'Dec 2023', earnings: 0, brands: 0 },
      { month: 'Jan 2024', earnings: 0, brands: 0 }
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
                { id: 'approval', name: 'Revenue Approval', icon: CheckCircle },
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

          {/* Revenue Approval */}
          {viewMode === 'approval' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pending Revenue Reports</h3>
                <p className="text-gray-600">Review and approve revenue reports submitted by distribution partners</p>
              </div>

              {pendingReports.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">All Reports Approved</h4>
                  <p className="text-gray-500">No pending revenue reports require approval</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assets</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingReports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{report.platform}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(report.amount, selectedCurrency)}</div>
                            <div className="text-sm text-gray-500">{report.currency}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.submittedDate}</div>
                            <div className="text-sm text-gray-500">by {report.submittedBy}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs truncate">
                              {report.assets.join(', ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveRevenue(report.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRevenue(report.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

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
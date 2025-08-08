import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Users, FileText, Music, BarChart3, PieChart, 
  TrendingUp, TrendingDown, DollarSign, Eye,
  Play, Pause, CheckCircle, Clock, AlertTriangle,
  Globe, Calendar, Database, Settings, Shield,
  UserCheck, Activity, Target, Zap, Building2
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { getDashboardStats, getUsers, getReleases } from '../../lib/emptyData';
import { getUserRole } from '../../lib/auth0-config';
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS } from '../../lib/constants';

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  
  // Revenue Split Configuration State (Super Admin has full oversight + control)
  const [revenueSplit, setRevenueSplit] = useState({
    distributionPartnerPercentage: 15,  // Code Group takes 15% first
    companyAdminPercentage: 10,         // Company Admin takes 10% second
    labelAdminPercentage: 25,           // Default: 25% of final remainder
    artistPercentage: 75,               // Default: 75% of final remainder
    distributionPartnerName: 'Code Group'
  });
  const [showSplitConfig, setShowSplitConfig] = useState(false);
  const [splitConfigSaved, setSplitConfigSaved] = useState(false);
  
  // Individual Label Admin Percentages (Super Admin can override individual rates)
  const [individualLabelAdminPercentages, setIndividualLabelAdminPercentages] = useState({});

  // Get centralized dashboard stats
  const adminData = getDashboardStats().superAdmin;
  const userRole = getUserRole(user);
  
  // Get all data for Super Admin (full visibility)
  const allUsers = getUsers();
  const allReleases = getReleases();
  const totalPlatformRevenue = allUsers.reduce((total, user) => total + (user.totalRevenue || user.totalEarnings || 0), 0);

  // Revenue Split Management Functions (Super Admin has full control over all percentages)
  const handleSplitChange = (field, value) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const finalValue = isNaN(numValue) ? 0 : numValue;
    
    if (field === 'labelAdminPercentage') {
      const newLabelPercentage = Math.min(100, Math.max(0, finalValue));
      const newArtistPercentage = 100 - newLabelPercentage;
      setRevenueSplit(prev => ({
        ...prev,
        labelAdminPercentage: newLabelPercentage,
        artistPercentage: newArtistPercentage
      }));
    } else if (field === 'distributionPartnerPercentage') {
      setRevenueSplit(prev => ({
        ...prev,
        distributionPartnerPercentage: Math.min(50, Math.max(0, finalValue))
      }));
    } else if (field === 'companyAdminPercentage') {
      setRevenueSplit(prev => ({
        ...prev,
        companyAdminPercentage: Math.min(50, Math.max(0, finalValue))
      }));
    }
  };

  // Handle individual label admin percentage changes
  const handleIndividualLabelAdminChange = (labelAdminId, value) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const finalValue = isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue));
    
    setIndividualLabelAdminPercentages(prev => ({
      ...prev,
      [labelAdminId]: finalValue
    }));
  };

  const saveSplitConfiguration = () => {
    // In a real app, this would save to backend
    console.log('Super Admin saving complete revenue split configuration:', {
      revenueSplit,
      individualLabelAdminPercentages
    });
    setSplitConfigSaved(true);
    setTimeout(() => setSplitConfigSaved(false), 3000);
  };

  const calculateSplitAmounts = (totalAmount) => {
    // Step 1: Code Group takes their percentage first
    const distributionPartnerAmount = totalAmount * (revenueSplit.distributionPartnerPercentage / 100);
    const afterDistributionPartner = totalAmount - distributionPartnerAmount;
    
    // Step 2: Company Admin takes their percentage from what's left
    const companyAdminAmount = afterDistributionPartner * (revenueSplit.companyAdminPercentage / 100);
    const afterCompanyAdmin = afterDistributionPartner - companyAdminAmount;
    
    // Step 3: Remaining amount is split between Label Admin and Artist
    const labelAdminAmount = afterCompanyAdmin * (revenueSplit.labelAdminPercentage / 100);
    const artistAmount = afterCompanyAdmin * (revenueSplit.artistPercentage / 100);
    
    return {
      distributionPartner: distributionPartnerAmount,
      afterDistributionPartner,
      companyAdmin: companyAdminAmount,
      afterCompanyAdmin,
      labelAdmin: labelAdminAmount,
      artist: artistAmount
    };
  };

  // Check admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (!['super_admin', 'company_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Loading state
  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {userRole === 'super_admin' ? 'Super Admin Dashboard' : 'Company Admin Dashboard'}
            </h1>
            <p className="text-blue-100 text-lg">
              {userRole === 'super_admin' 
                ? 'Complete platform oversight and management' 
                : 'Brand management and user administration'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Platform Health</div>
            <div className="text-2xl font-bold">98.5%</div>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="font-bold text-gray-900" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / adminData.totalUsers.toLocaleString().length))}px`
                }}>{adminData.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+12% this month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Releases</p>
                <p className="font-bold text-gray-900" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / adminData.totalReleases.toString().length))}px`
                }}>{adminData.totalReleases}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+8% this month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Music className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="font-bold text-gray-900" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / formatCurrency(adminData.totalRevenue, selectedCurrency).length))}px`
                }}>{formatCurrency(adminData.totalRevenue, selectedCurrency)}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+15% this month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="font-bold text-gray-900" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / (adminData.activeProjects || 23).toString().length))}px`
                }}>{adminData.activeProjects || 23}</p>
              <div className="flex items-center mt-2 text-sm">
                <Activity className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-yellow-600">{adminData.pendingApprovals || 5} pending</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Target className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Earnings Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {userRole === 'super_admin' ? 'Platform Earnings Overview' : 'Earnings Overview'}
          </h3>
          <button
            onClick={() => router.push(userRole === 'super_admin' ? '/admin/earnings' : '/companyadmin/earnings')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {userRole === 'super_admin' ? 'View Global Earnings' : 'View Full Earnings'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(userRole === 'super_admin' ? 8547293.50 : 284729.35, selectedCurrency)}
            </div>
            <div className="text-sm text-red-700 mt-1">
              {userRole === 'super_admin' ? 'Total Platform Revenue' : 'Company Earnings'}
            </div>
            <div className="text-xs text-red-500 mt-1">
              {userRole === 'super_admin' ? 'All brands combined' : 'This month'}
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(userRole === 'super_admin' ? 1251456.78 : 251456.78, selectedCurrency)}
            </div>
            <div className="text-sm text-green-700 mt-1">Available to Withdraw</div>
            <div className="text-xs text-green-500 mt-1">Ready now</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {userRole === 'super_admin' ? '342' : '89'}
            </div>
            <div className="text-sm text-purple-700 mt-1">Earning Assets</div>
            <div className="text-xs text-purple-500 mt-1">Generating revenue</div>
          </div>
        </div>
      </div>

      {/* Super Admin Brand Overview / Company Admin Label Admins */}
      {userRole === 'super_admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Platform Brands Overview</h3>
            <Building2 className="w-6 h-6 text-red-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'YHWH MSC', artists: 15, revenue: 2847293.50, status: 'active' },
              { name: 'Major Label Music', artists: 23, revenue: 3456789.23, status: 'active' },
              { name: 'K-Entertainment', artists: 12, revenue: 1789456.78, status: 'active' },
              { name: 'Indie Collective', artists: 8, revenue: 453753.99, status: 'pending' }
            ].map((brand, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-red-50 to-purple-50 rounded-lg border border-red-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {brand.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{brand.name}</div>
                    <div className={`text-sm ${brand.status === 'active' ? 'text-green-600' : 'text-orange-600'}`}>
                      {brand.status}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{brand.artists}</div>
                    <div className="text-xs text-gray-500">Artists</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-600">
                      {formatCurrency(brand.revenue / 1000, selectedCurrency)}K
                    </div>
                    <div className="text-xs text-gray-500">Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/admin/analytics')}
            className="w-full mt-6 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            View Platform Analytics
          </button>
        </div>
      )}

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">User Management</h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Artists</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{getUsers().filter(u => u.role === 'artist').length}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">
                  {userRole === 'super_admin' ? 'Label Admins' : 'Distribution Partners'}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {userRole === 'super_admin' ? getUsers().filter(u => u.role === 'label_admin').length : '15'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">
                  {userRole === 'super_admin' ? 'All Admins' : 'Administrators'}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {userRole === 'super_admin' ? getUsers().filter(u => ['company_admin', 'super_admin'].includes(u.role)).length : '8'}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/admin/users')}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Manage All Users
          </button>
        </div>

        {/* Release Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Release Management</h3>
            <Music className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="space-y-4">
                          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">{RELEASE_STATUS_LABELS[RELEASE_STATUSES.IN_REVIEW]}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{RELEASES.filter(r => r.status === RELEASE_STATUSES.IN_REVIEW).length}</span>
              </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">{RELEASE_STATUS_LABELS[RELEASE_STATUSES.COMPLETED]}</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{RELEASES.filter(r => r.status === RELEASE_STATUSES.COMPLETED).length}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">{RELEASE_STATUS_LABELS[RELEASE_STATUSES.LIVE]}</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{RELEASES.filter(r => r.status === RELEASE_STATUSES.LIVE).length}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/admin/content')}
            className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Manage Content
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Platform Analytics</h3>
          <BarChart3 className="w-6 h-6 text-purple-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2 truncate">{formatCurrency(125000, selectedCurrency)}</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
            <div className="text-xs text-green-600 mt-1">+18.5% vs last month</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2.4M</div>
            <div className="text-sm text-gray-600">Total Streams</div>
            <div className="text-xs text-green-600 mt-1">+12.3% vs last month</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
            <div className="text-sm text-gray-600">Platform Uptime</div>
            <div className="text-xs text-green-600 mt-1">All systems operational</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">45</div>
            <div className="text-sm text-gray-600">New Users Today</div>
            <div className="text-xs text-green-600 mt-1">+8.2% vs yesterday</div>
          </div>
        </div>

        <button
          onClick={() => router.push('/admin/analytics')}
          className="w-full mt-6 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          View Detailed Analytics
        </button>
      </div>

      {/* Revenue Split Configuration - Super Admin Control */}
      {userRole === 'super_admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Code Group Configuration</h3>
              <p className="text-sm text-gray-600">Super Admin control over complete revenue distribution flow</p>
            </div>
            <button
              onClick={() => setShowSplitConfig(!showSplitConfig)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSplitConfig ? 'Hide Settings' : 'Configure Split'}
            </button>
          </div>

          {/* Platform Revenue Overview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900">Total Platform Revenue</h4>
                <p className="font-bold text-purple-600" style={{
                  fontSize: `${Math.min(32, Math.max(18, 280 / formatCurrency(totalPlatformRevenue, selectedCurrency).length))}px`
                }}>
                  {formatCurrency(totalPlatformRevenue, selectedCurrency)}
                </p>
                <p className="text-sm text-gray-600">Across all users, labels, and artists</p>
              </div>
              <Globe className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          {/* Complete Split Overview - 5 Step Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">{revenueSplit.distributionPartnerName}</p>
                  <p className="text-2xl font-bold text-red-600">{revenueSplit.distributionPartnerPercentage}%</p>
                  <p className="text-xs text-red-500">Step 1: First deduction</p>
                </div>
                <Target className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Company Admin</p>
                  <p className="text-2xl font-bold text-purple-600">{revenueSplit.companyAdminPercentage}%</p>
                  <p className="text-xs text-purple-500">Step 2: From remainder</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Final Pool</p>
                  <p className="text-2xl font-bold text-gray-600">{100 - revenueSplit.distributionPartnerPercentage - revenueSplit.companyAdminPercentage}%</p>
                  <p className="text-xs text-gray-500">Step 3: Available</p>
                </div>
                <DollarSign className="w-8 h-8 text-gray-500" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Label Admin</p>
                  <p className="text-2xl font-bold text-blue-600">{revenueSplit.labelAdminPercentage}%</p>
                  <p className="text-xs text-blue-500">Step 4: Of final pool</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Artist</p>
                  <p className="text-2xl font-bold text-green-600">{revenueSplit.artistPercentage}%</p>
                  <p className="text-xs text-green-500">Step 5: Of final pool</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Example Calculation with Platform Revenue - Complete 5-Step Flow */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Complete Platform Split Example: {formatCurrency(totalPlatformRevenue, selectedCurrency)}</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-red-600 font-medium">{revenueSplit.distributionPartnerName}:</span>
                <br />
                <span className="text-lg font-bold text-red-600">{formatCurrency(calculateSplitAmounts(totalPlatformRevenue).distributionPartner, selectedCurrency)}</span>
              </div>
              <div>
                <span className="text-purple-600 font-medium">Company Admin:</span>
                <br />
                <span className="text-lg font-bold text-purple-600">{formatCurrency(calculateSplitAmounts(totalPlatformRevenue).companyAdmin, selectedCurrency)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Final Pool:</span>
                <br />
                <span className="text-lg font-bold text-gray-700">{formatCurrency(calculateSplitAmounts(totalPlatformRevenue).afterCompanyAdmin, selectedCurrency)}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">All Label Admins:</span>
                <br />
                <span className="text-lg font-bold text-blue-600">{formatCurrency(calculateSplitAmounts(totalPlatformRevenue).labelAdmin, selectedCurrency)}</span>
              </div>
              <div>
                <span className="text-green-600 font-medium">All Artists:</span>
                <br />
                <span className="text-lg font-bold text-green-600">{formatCurrency(calculateSplitAmounts(totalPlatformRevenue).artist, selectedCurrency)}</span>
              </div>
            </div>
          </div>

          {/* Configuration Panel */}
          {showSplitConfig && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="font-medium text-yellow-800">Super Admin Code Group Control</p>
                    <p className="text-sm text-yellow-700">Full control over the complete 5-step revenue distribution flow affecting all users.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code Group Percentage
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={revenueSplit.distributionPartnerPercentage}
                      onChange={(e) => handleSplitChange('distributionPartnerPercentage', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={revenueSplit.distributionPartnerPercentage}
                        onChange={(e) => handleSplitChange('distributionPartnerPercentage', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Step 1: First deduction</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Admin Percentage
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={revenueSplit.companyAdminPercentage}
                      onChange={(e) => handleSplitChange('companyAdminPercentage', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={revenueSplit.companyAdminPercentage}
                        onChange={(e) => handleSplitChange('companyAdminPercentage', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Step 2: From remainder</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Label Admin Percentage
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={revenueSplit.labelAdminPercentage}
                      onChange={(e) => handleSplitChange('labelAdminPercentage', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={revenueSplit.labelAdminPercentage}
                        onChange={(e) => handleSplitChange('labelAdminPercentage', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Artist gets {revenueSplit.artistPercentage}%</p>
                </div>
              </div>

              {/* Individual Label Admin Percentages */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Individual Label Admin Percentages</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allUsers.filter(u => u.role === 'label_admin').map((labelAdmin) => (
                    <div key={labelAdmin.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-blue-900">{labelAdmin.firstName} {labelAdmin.lastName}</h5>
                          <p className="text-sm text-blue-700">{labelAdmin.labelName} Label</p>
                        </div>
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={individualLabelAdminPercentages[labelAdmin.id] || revenueSplit.labelAdminPercentage}
                          onChange={(e) => handleIndividualLabelAdminChange(labelAdmin.id, parseInt(e.target.value))}
                          className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={individualLabelAdminPercentages[labelAdmin.id] || revenueSplit.labelAdminPercentage}
                            onChange={(e) => handleIndividualLabelAdminChange(labelAdmin.id, e.target.value)}
                            className="w-16 px-2 py-1 border border-blue-300 rounded text-center"
                          />
                          <span className="text-blue-600">%</span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        Artists under this label get {100 - (individualLabelAdminPercentages[labelAdmin.id] || revenueSplit.labelAdminPercentage)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={saveSplitConfiguration}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    splitConfigSaved 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {splitConfigSaved ? '✓ Code Group Configuration Saved!' : 'Save Code Group Configuration'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Revenue Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {userRole === 'super_admin' ? 'Global Revenue Configuration' : 'Code Group Configuration'}
          </h3>
          <button
            onClick={() => setShowSplitConfig(!showSplitConfig)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium ${
              userRole === 'super_admin' 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            {showSplitConfig ? 'Hide Settings' : 'Configure Split'}
          </button>
        </div>
        
        {/* Revenue Split Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-sm font-medium text-red-700 mb-1">
              {userRole === 'super_admin' ? 'Distribution Partners' : 'Code Group'}
            </div>
            <div className="text-2xl font-bold text-red-600">15%</div>
            <div className="text-xs text-red-500">First deduction</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-sm font-medium text-purple-700 mb-1">Company Admin</div>
            <div className="text-2xl font-bold text-purple-600">10%</div>
            <div className="text-xs text-purple-500">Second deduction</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-blue-700 mb-1">Label Admin</div>
            <div className="text-2xl font-bold text-blue-600">25%</div>
            <div className="text-xs text-blue-500">Of final remainder</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Music className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm font-medium text-green-700 mb-1">Artist</div>
            <div className="text-2xl font-bold text-green-600">75%</div>
            <div className="text-xs text-green-500">Of final remainder</div>
          </div>
        </div>

        {/* Example Revenue Flow */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Example: £100,000 Total Revenue Flow</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-red-600">Code Group:</div>
              <div className="text-red-700">£15,000</div>
              <div className="text-xs text-red-500">First cut</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-600">Company Admin:</div>
              <div className="text-purple-700">£8,500</div>
              <div className="text-xs text-purple-500">Second cut</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-600">Final Pool:</div>
              <div className="text-gray-700">£76,500</div>
              <div className="text-xs text-gray-500">To split</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">Label Admin:</div>
              <div className="text-blue-700">£19,125</div>
              <div className="text-xs text-blue-500">From pool</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">Artist:</div>
              <div className="text-green-700">£57,375</div>
              <div className="text-xs text-green-500">From pool</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <Activity className="w-6 h-6 text-gray-600" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-700">Users</span>
          </button>
          
          <button
            onClick={() => router.push('/admin/content')}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileText className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-700">Content</span>
          </button>
          
          <button
            onClick={() => router.push('/admin/analytics')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-700">Analytics</span>
          </button>
          
          <button
            onClick={() => router.push(userRole === 'super_admin' ? '/admin/distribution' : '/companyadmin/workflow')}
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <Activity className="w-8 h-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-yellow-700">
              {userRole === 'super_admin' ? 'Distribution' : 'Workflow'}
            </span>
          </button>
        </div>
      </div>

      {/* Super Admin Tools */}
      {userRole === 'super_admin' && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-red-900">Super Admin Tools</h3>
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          
          <p className="text-red-700 mb-6">Advanced administrative features for platform management</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/admin/settings')}
              className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              System Settings
            </button>
            <button 
              onClick={() => router.push('/admin/approvals')}
              className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Global Approvals
            </button>
            <button 
              onClick={() => router.push('/admin/earnings')}
              className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Revenue Management
            </button>
            <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Ghost Login
            </button>
            <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Platform Logs
            </button>
            <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Backup & Restore
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <SEO 
        title={`${userRole === 'super_admin' ? 'Super' : 'Company'} Admin Dashboard - MSC & Co`}
        description="Administrative dashboard for platform management"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
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
              </nav>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="mb-6 flex justify-end">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
            />
          </div>

          {/* Content */}
          {activeTab === 'overview' && renderOverview()}
        </div>
      </div>
    </MainLayout>
  );
}
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
import { getDashboardStats } from '../../lib/mockData';
import { getUsers, getReleases } from '../../lib/mockDatabase';
import { getUserRole } from '../../lib/auth0-config';
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS } from '../../lib/constants';

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  
  // Revenue Split Configuration State (Super Admin has same controls as Company Admin)
  const [revenueSplit, setRevenueSplit] = useState({
    labelAdminPercentage: 25, // Default: 25% to Label Admin
    artistPercentage: 75,     // Default: 75% to Artist
    distributionPartnerPercentage: 15, // Code Group takes 15%
    distributionPartnerName: 'Code Group'
  });
  const [showSplitConfig, setShowSplitConfig] = useState(false);
  const [splitConfigSaved, setSplitConfigSaved] = useState(false);

  // Get centralized dashboard stats
  const adminData = getDashboardStats().superAdmin;
  const userRole = getUserRole(user);
  
  // Get all data for Super Admin (full visibility)
  const allUsers = getUsers();
  const allReleases = getReleases();
  const totalPlatformRevenue = allUsers.reduce((total, user) => total + (user.totalRevenue || user.totalEarnings || 0), 0);

  // Revenue Split Management Functions (Same as Company Admin)
  const handleSplitChange = (field, value) => {
    if (field === 'labelAdminPercentage') {
      const newLabelPercentage = Math.min(100, Math.max(0, value));
      const newArtistPercentage = 100 - newLabelPercentage;
      setRevenueSplit(prev => ({
        ...prev,
        labelAdminPercentage: newLabelPercentage,
        artistPercentage: newArtistPercentage
      }));
    } else if (field === 'distributionPartnerPercentage') {
      setRevenueSplit(prev => ({
        ...prev,
        distributionPartnerPercentage: Math.min(50, Math.max(0, value))
      }));
    }
  };

  const saveSplitConfiguration = () => {
    // In a real app, this would save to backend
    console.log('Super Admin saving revenue split configuration:', revenueSplit);
    setSplitConfigSaved(true);
    setTimeout(() => setSplitConfigSaved(false), 3000);
  };

  const calculateSplitAmounts = (totalAmount) => {
    const afterDistributionPartner = totalAmount * (1 - revenueSplit.distributionPartnerPercentage / 100);
    const labelAdminAmount = afterDistributionPartner * (revenueSplit.labelAdminPercentage / 100);
    const artistAmount = afterDistributionPartner * (revenueSplit.artistPercentage / 100);
    const distributionPartnerAmount = totalAmount * (revenueSplit.distributionPartnerPercentage / 100);
    
    return {
      distributionPartner: distributionPartnerAmount,
      afterDistributionPartner,
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
                <span className="font-medium text-gray-900">Distribution Partners</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">15</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Administrators</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">8</span>
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
                  <span className="font-medium text-gray-900">{RELEASE_STATUS_LABELS[RELEASE_STATUSES.UNDER_REVIEW]}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{RELEASES.filter(r => r.status === RELEASE_STATUSES.UNDER_REVIEW).length}</span>
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
              <h3 className="text-lg font-bold text-gray-900">Platform Revenue Split Configuration</h3>
              <p className="text-sm text-gray-600">Control revenue distribution across the entire platform</p>
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

          {/* Current Split Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">{revenueSplit.distributionPartnerName}</p>
                  <p className="text-2xl font-bold text-red-600">{revenueSplit.distributionPartnerPercentage}%</p>
                  <p className="text-xs text-red-500">First deduction</p>
                </div>
                <Target className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Label Admin</p>
                  <p className="text-2xl font-bold text-blue-600">{revenueSplit.labelAdminPercentage}%</p>
                  <p className="text-xs text-blue-500">Of remaining {100 - revenueSplit.distributionPartnerPercentage}%</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Artist</p>
                  <p className="text-2xl font-bold text-green-600">{revenueSplit.artistPercentage}%</p>
                  <p className="text-xs text-green-500">Of remaining {100 - revenueSplit.distributionPartnerPercentage}%</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Example Calculation with Platform Revenue */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Current Platform Split: {formatCurrency(totalPlatformRevenue, selectedCurrency)}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-red-600 font-medium">{revenueSplit.distributionPartnerName}:</span>
                <br />
                <span className="text-lg font-bold text-red-600">{formatCurrency(calculateSplitAmounts(totalPlatformRevenue).distributionPartner, selectedCurrency)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Remaining:</span>
                <br />
                <span className="text-lg font-bold text-gray-700">{formatCurrency(calculateSplitAmounts(totalPlatformRevenue).afterDistributionPartner, selectedCurrency)}</span>
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
                    <p className="font-medium text-yellow-800">Super Admin Revenue Control</p>
                    <p className="text-sm text-yellow-700">Changes affect the entire platform's revenue distribution structure.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label Admin Percentage (of remaining after distribution partner)
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
                        onChange={(e) => handleSplitChange('labelAdminPercentage', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Artist automatically gets {revenueSplit.artistPercentage}%</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distribution Partner Percentage (Code Group)
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
                        onChange={(e) => handleSplitChange('distributionPartnerPercentage', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This is deducted first from total revenue</p>
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
                  {splitConfigSaved ? '✓ Platform Configuration Saved!' : 'Save Platform Configuration'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {userRole === 'super_admin' && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-red-900">Super Admin Tools</h3>
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          
          <p className="text-red-700 mb-4">Advanced administrative features for platform management</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Ghost Login
            </button>
            <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              System Settings
            </button>
            <button className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Platform Logs
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
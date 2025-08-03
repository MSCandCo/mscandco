import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Users, FileText, Music, BarChart3, PieChart, 
  TrendingUp, TrendingDown, DollarSign, Eye,
  Play, Pause, CheckCircle, Clock, AlertTriangle,
  Globe, Calendar, Database, Settings, Shield,
  UserCheck, Activity, Target, Zap
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { getDashboardStats, ARTISTS, RELEASES } from '../../lib/mockData';
import { getUserRole } from '../../lib/auth0-config';
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS } from '../../lib/constants';

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Get centralized dashboard stats
  const adminData = getDashboardStats('super_admin');
  const userRole = getUserRole(user);

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
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{adminData.totalUsers.toLocaleString()}</p>
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
            <div>
              <p className="text-sm font-medium text-gray-600">Total Releases</p>
              <p className="text-3xl font-bold text-gray-900">{adminData.totalReleases}</p>
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
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(adminData.totalRevenue, selectedCurrency)}</p>
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
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900">{adminData.activeProjects || 23}</p>
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
              <span className="text-2xl font-bold text-gray-900">{ARTISTS.length}</span>
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
            <div className="text-3xl font-bold text-purple-600 mb-2">{formatCurrency(125000, selectedCurrency)}</div>
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
            <CurrencySelector />
          </div>

          {/* Content */}
          {activeTab === 'overview' && renderOverview()}
        </div>
      </div>
    </MainLayout>
  );
}
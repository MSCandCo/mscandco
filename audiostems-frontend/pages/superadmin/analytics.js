// Super Admin Analytics - COMPLETE REBUILD - REAL DATA ONLY
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  BarChart3, TrendingUp, Users, Settings, Shield, Crown,
  AlertTriangle, CheckCircle, Calendar, Music
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';

export default function SuperAdminAnalytics() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [analyticsData, setAnalyticsData] = useState({});
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoading && user) {
      loadRealAnalyticsData();
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const loadRealAnalyticsData = async () => {
    try {
      console.log('📊 Super Admin loading REAL analytics data - NO MOCK DATA');
      
      const response = await fetch('/api/admin/bypass-users');
      const result = await response.json();

      if (result.success) {
        const users = result.users;
        const releases = result.releases || [];
        
        // Calculate REAL analytics from database
        const realStats = {
          totalUsers: users.length,
          totalArtists: users.filter(u => u.role === 'artist').length,
          totalLabelAdmins: users.filter(u => u.role === 'label_admin').length,
          totalReleases: releases.length,
          liveReleases: releases.filter(r => r.status === 'live').length,
          pendingReleases: releases.filter(r => r.status === 'submitted' || r.status === 'in_review').length,
          usersWithAnalytics: users.filter(u => u.hasAnalyticsData).length,
          usersWithEarnings: users.filter(u => u.hasEarningsData).length,
          platformEfficiency: releases.length > 0 ? Math.round((releases.filter(r => r.status === 'live').length / releases.length) * 100) : 100
        };

        setStats(realStats);
        setAnalyticsData({
          lastUpdated: new Date().toISOString(),
          source: 'real_database',
          userCount: users.length
        });

        console.log('✅ Super Admin REAL analytics calculated:', realStats);
        setError(null);
      } else {
        setError('Failed to load real analytics data');
      }
    } catch (error) {
      console.error('❌ Error loading real analytics:', error);
      setError('Failed to connect to database');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading super admin analytics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Analytics Error</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={loadRealAnalyticsData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Super Admin Analytics - Real Data"
        description="Super Admin analytics with real database integration"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Business Analytics</h1>
            <p className="text-gray-600 mt-2">REAL DATA - Operations efficiency and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/companyadmin/analytics-management">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                Manage Artist Analytics
              </button>
            </Link>
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
              compact={true}
            />
          </div>
        </div>
        
        {/* REAL Business Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                <p className="text-xs text-blue-600">REAL COUNT</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Artists</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalArtists}</p>
                <p className="text-xs text-green-600">REAL COUNT</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Releases</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalReleases}</p>
                <p className="text-xs text-purple-600">REAL COUNT</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Platform Efficiency</p>
                <p className="text-3xl font-bold text-slate-900">{stats.platformEfficiency}%</p>
                <p className="text-xs text-orange-600">CALCULATED</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Data Coverage</p>
                <p className="text-3xl font-bold text-slate-900">{stats.usersWithAnalytics}</p>
                <p className="text-xs text-indigo-600">Users with data</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Real Data Summary */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview (Real Database Data)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Artists</span>
                  <span className="font-semibold text-gray-900">{stats.totalArtists}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Label Admins</span>
                  <span className="font-semibold text-gray-900">{stats.totalLabelAdmins}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">With Analytics Data</span>
                  <span className="font-semibold text-gray-900">{stats.usersWithAnalytics}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">With Earnings Data</span>
                  <span className="font-semibold text-gray-900">{stats.usersWithEarnings}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Release Statistics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Releases</span>
                  <span className="font-semibold text-gray-900">{stats.totalReleases}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Live Releases</span>
                  <span className="font-semibold text-green-600">{stats.liveReleases}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending Approval</span>
                  <span className="font-semibold text-orange-600">{stats.pendingReleases}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-gray-900">{stats.platformEfficiency}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

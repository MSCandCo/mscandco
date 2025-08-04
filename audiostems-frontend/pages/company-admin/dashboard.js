import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Users, FileText, Music, BarChart3, Building2,
  TrendingUp, DollarSign, UserCheck, Settings,
  Shield, Target, Activity, Globe
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { getApprovedArtistsByLabel } from '../../lib/mockData';
import { getUsers, getReleases } from '../../lib/mockDatabase';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';

export default function CompanyAdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Get user context
  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);
  const brandName = userBrand?.displayName || 'MSC & Co';

  // Get platform-wide data (Company Admin has jurisdiction over ALL users)
  const allUsers = getUsers();
  const allReleases = getReleases();
  const allArtists = allUsers.filter(u => u.role === 'artist');
  const approvedArtists = allArtists.filter(a => a.approvalStatus === 'approved');
  
  // Calculate platform-wide revenue and stats
  const platformRevenue = allArtists.reduce((total, artist) => total + (artist.totalRevenue || artist.totalEarnings || 0), 0);
  const platformStreams = allArtists.reduce((total, artist) => total + (artist.totalStreams || 0), 0);
  const platformTotalReleases = allArtists.reduce((total, artist) => total + (artist.totalReleases || 0), 0);

  // Check admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (role !== 'company_admin') {
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
            <p className="mt-4 text-gray-600">Loading company admin dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title={`${brandName} - Company Admin Dashboard`}
        description="Company administrative dashboard for brand management"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Company Admin Dashboard</h1>
                <p className="text-purple-100 text-lg">
                  Platform-wide management and unrestricted user administration
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">Brand Health</div>
                <div className="text-2xl font-bold">96.8%</div>
              </div>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="mb-6 flex justify-end">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
            />
          </div>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Artists</p>
                  <p className="text-3xl font-bold text-gray-900">{allArtists.length}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">{approvedArtists.length} approved</span>
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
                  <p className="text-3xl font-bold text-gray-900">{allReleases.length}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+12% this month</span>
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
                  <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(platformRevenue, selectedCurrency)}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+18% this month</span>
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
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{platformTotalReleases}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <Activity className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-yellow-600">3 need attention</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Target className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* User Management - Unrestricted Access */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">User Management</h3>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm text-purple-600 font-medium">Unrestricted Access</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <span>Users: {allUsers.length}</span>
                <span>Roles: {[...new Set(allUsers.map(u => u.role))].length}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">All Artists</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{allArtists.length}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Label Admins</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{allUsers.filter(u => u.role === 'label_admin').length}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Pending Approvals</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{allArtists.filter(a => a.approvalStatus === 'pending').length}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => router.push('/company-admin/approvals')}
                  className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Approve Artists
                </button>
              </div>
            </div>

            {/* Content Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Content Management</h3>
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <span>Songs: {allReleases.reduce((total, release) => total + (release.trackListing?.length || 1), 0)}</span>
                <span>Projects: {allReleases.length}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Active Releases</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{allReleases.filter(r => ['live', 'distributed'].includes(r.status)).length}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">In Review</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{allReleases.filter(r => r.status === 'in_review').length}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Pending Approval</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{allReleases.filter(r => r.status === 'approvals').length}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/admin/content')}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Content Management
              </button>
            </div>

            {/* Brand Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Analytics</h3>
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <span>Views: {platformStreams.toLocaleString()}</span>
                <span>Engagement: {((platformStreams / 1000000) * 10).toFixed(1)}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Monthly Streams</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">2.1M</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Engagement Rate</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">87.3%</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Growth Rate</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">+23.5%</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/admin/analytics')}
                className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                View Analytics
              </button>
            </div>
          </div>

          {/* Brand Artists Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Brand Artists Overview</h3>
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {approvedArtists.slice(0, 6).map((artist, index) => (
                <div key={artist.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {artist.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{artist.name}</div>
                      <div className="text-sm text-gray-500">{artist.primaryGenre}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{artist.releases || 0}</div>
                      <div className="text-xs text-gray-500">Releases</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(artist.totalEarnings || 0, selectedCurrency)}</div>
                      <div className="text-xs text-gray-500">Earnings</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{artist.totalStreams?.toLocaleString() || '0'}</div>
                      <div className="text-xs text-gray-500">Streams</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/admin/users')}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View All Artists
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
              >
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Users</div>
              </button>
              
              <button
                onClick={() => router.push('/admin/content')}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
              >
                <Music className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Content</div>
              </button>
              
              <button
                onClick={() => router.push('/admin/analytics')}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
              >
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Analytics</div>
              </button>
              
              <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center">
                <Settings className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Settings</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
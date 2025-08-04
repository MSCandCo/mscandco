import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Users, Music, Building2,
  TrendingUp, DollarSign, UserCheck, Settings,
  Target, Activity, Globe, Eye
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
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

  // Company Admin manages entire YHWH MSC branch (all label admins + all artists)
  const allUsers = getUsers();
  const allReleases = getReleases();
  
  // YHWH MSC branch includes ALL label admins and ALL artists
  const labelAdmins = allUsers.filter(u => u.role === 'label_admin');
  const artists = allUsers.filter(u => u.role === 'artist');
  const jurisdictionUsers = [...labelAdmins, ...artists];
  const approvedArtists = artists.filter(a => a.approvalStatus === 'approved');


  
  
  // Calculate real statistics from mock database
  const totalRevenue = artists.reduce((total, artist) => total + (artist.totalRevenue || artist.totalEarnings || 0), 0);
  const totalStreams = artists.reduce((total, artist) => total + (artist.totalStreams || 0), 0);
  const totalReleases = artists.reduce((total, artist) => total + (artist.totalReleases || 0), 0);

  // Release status breakdown
  const liveReleases = allReleases.filter(r => ['live', 'distributed'].includes(r.status)).length;
  const inReviewReleases = allReleases.filter(r => r.status === 'in_review').length;
  const approvalsReleases = allReleases.filter(r => r.status === 'approvals').length;
  const draftReleases = allReleases.filter(r => r.status === 'draft').length;

  // Song count (tracks across all releases)
  const totalSongs = allReleases.reduce((total, release) => total + (release.trackListing?.length || 1), 0);

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
        <SEO title="Company Admin Dashboard" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO title="Company Admin Dashboard" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Company Admin Dashboard</h1>
                <p className="text-purple-100 text-lg">
                  YHWH MSC Branch - All Labels & Artists Management
                </p>
                <p className="text-purple-200 text-sm mt-2">
                  Managing {labelAdmins.length} label admins and {artists.length} artists
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">Platform Health</div>
                <div className="text-2xl font-bold">{Math.round((approvedArtists.length / artists.length) * 100)}%</div>
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
            
            {/* Total Artists */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Artists</p>
                  <p className="text-3xl font-bold text-gray-900">{artists.length}</p>
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

            {/* Total Releases */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Releases</p>
                  <p className="text-3xl font-bold text-gray-900">{allReleases.length}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">{liveReleases} live</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Music className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 truncate">{formatCurrency(totalRevenue, selectedCurrency)}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">Active income</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Total Label Admins */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Label Admins</p>
                  <p className="text-3xl font-bold text-gray-900">{labelAdmins.length}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <Activity className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-yellow-600">Active management</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Target className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>



          {/* Label Admins Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Label Admins Overview</h3>
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {labelAdmins.map((admin, index) => (
                <div key={admin.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {admin.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{admin.name}</div>
                      <div className="text-sm text-gray-500">{admin.brand}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {artists.filter(a => a.brand === admin.brand).length}
                      </div>
                      <div className="text-xs text-gray-500">Artists</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{admin.status === 'active' ? 'Active' : 'Inactive'}</div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/admin/users')}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Manage All Label Admins
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Users</span>
              </button>
              
              <button
                onClick={() => router.push('/admin/content')}
                className="flex items-center justify-center p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <FileText className="w-6 h-6 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Content</span>
              </button>
              
              <button
                onClick={() => router.push('/admin/analytics')}
                className="flex items-center justify-center p-4 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-purple-600 mr-2" />
                <span className="font-medium text-purple-800">Analytics</span>
              </button>
              
              <button
                onClick={() => router.push('/distribution/workflow')}
                className="flex items-center justify-center p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <Activity className="w-6 h-6 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Workflow</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
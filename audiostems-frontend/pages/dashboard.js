import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { COMPANY_INFO, getBrandByUser } from '@/lib/brand-config';
import { getUserRole, ROLE_WIDGETS } from '@/lib/role-config';
import RoleBasedNavigation, { MobileRoleNavigation } from '@/components/navigation/RoleBasedNavigation';
import { useRolePermissions } from '@/components/auth/RoleProtectedRoute';
import { 
  HiHome, 
  HiUsers, 
  HiChartBar, 
  HiMusicNote, 
  HiCurrencyDollar,
  HiGlobeAlt,
  HiShieldCheck,
  HiCog,
  HiOfficeBuilding,
  HiCube,
  HiDocument
} from 'react-icons/hi';

export default function Dashboard() {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { getUserRoleInfo } = useRolePermissions();

  const userBrand = getBrandByUser(user);
  const userRole = getUserRoleInfo();

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/auth/get-profile', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });
      
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome to {COMPANY_INFO.name}</h1>
          <p className="text-gray-600 text-center mb-6">
            Please sign in to access your dashboard.
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const getRoleIcon = () => {
    const iconMap = {
      super_admin: HiShieldCheck,
      company_admin: HiOfficeBuilding,
      distribution_partner: HiGlobeAlt,
      artist: HiMusicNote,
      distributor: HiCube
    };
    const IconComponent = iconMap[userRole?.id] || HiHome;
    return <IconComponent className="w-6 h-6" />;
  };

  const getRoleColor = () => {
    const colorMap = {
      super_admin: 'red',
      company_admin: 'purple',
      distribution_partner: 'blue',
      artist: 'green',
      distributor: 'indigo'
    };
    return colorMap[userRole?.id] || 'gray';
  };

  return (
    <>
      <Head>
        <title>{userRole?.displayName} Dashboard - {COMPANY_INFO.name}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setMobileNavOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="flex items-center ml-4 lg:ml-0">
                  <h1 className="text-2xl font-bold text-gray-900">{COMPANY_INFO.name}</h1>
                  {userBrand && (
                    <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {userBrand.displayName}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-${getRoleColor()}-500`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {userRole?.displayName}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Welcome, {userProfile?.firstName || user?.name || 'User'}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-6">
                  {getRoleIcon()}
                  <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                </div>
                <RoleBasedNavigation />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {userRole?.displayName} Dashboard
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Welcome back, {userProfile?.firstName || user?.name || 'User'}!
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${getRoleColor()}-100 text-${getRoleColor()}-800`}>
                    {userRole?.displayName}
                  </div>
                </div>
                
                {/* Role-specific welcome message */}
                <div className="mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getRoleIcon()}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          {userRole?.displayName} Access
                        </h3>
                        <p className="text-sm text-blue-700 mt-1">
                          {userRole?.description}
                        </p>
                        {userBrand && (
                          <p className="text-sm text-blue-600 mt-2">
                            Brand: {userBrand.displayName} - {userBrand.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role-specific dashboard content */}
                {userRole?.id === 'artist' && (
                  <ArtistDashboard userProfile={userProfile} userBrand={userBrand} />
                )}
                
                {userRole?.id === 'super_admin' && (
                  <SuperAdminDashboard userProfile={userProfile} />
                )}
                
                {userRole?.id === 'company_admin' && (
                  <CompanyAdminDashboard userProfile={userProfile} />
                )}
                
                {userRole?.id === 'distribution_partner' && (
                  <DistributionPartnerDashboard userProfile={userProfile} />
                )}
                
                {userRole?.id === 'distributor' && (
                  <DistributorDashboard userProfile={userProfile} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileRoleNavigation 
          isOpen={mobileNavOpen} 
          onClose={() => setMobileNavOpen(false)} 
        />
      </div>
    </>
  );
}

// Role-specific dashboard components
function ArtistDashboard({ userProfile, userBrand }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-sm text-blue-600">Active Releases</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">$0.00</div>
          <div className="text-sm text-green-600">This Month</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">0</div>
          <div className="text-sm text-purple-600">Total Plays</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/distribution/publishing/artist-portal/releases/create" className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
            <h4 className="font-semibold">Create New Release</h4>
            <p className="text-sm opacity-90">Upload your latest project</p>
          </Link>
          <Link href="/distribution/publishing/artist-portal/profile" className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
            <h4 className="font-semibold">Update Profile</h4>
            <p className="text-sm opacity-90">Manage your artist information</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SuperAdminDashboard({ userProfile }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">0</div>
          <div className="text-sm text-red-600">Total Users</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">0</div>
          <div className="text-sm text-purple-600">Active Sessions</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-sm text-blue-600">System Alerts</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">100%</div>
          <div className="text-sm text-green-600">System Health</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Administration</h3>
          <div className="space-y-3">
            <Link href="/admin/users" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiUsers className="w-5 h-5 text-gray-400" />
              <span>User Management</span>
            </Link>
            <Link href="/admin/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiCog className="w-5 h-5 text-gray-400" />
              <span>System Settings</span>
            </Link>
            <Link href="/admin/audit" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiShieldCheck className="w-5 h-5 text-gray-400" />
              <span>Audit Logs</span>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/users" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiUsers className="w-5 h-5 text-gray-400" />
              <span>Manage Users</span>
            </Link>
            <Link href="/admin/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiCog className="w-5 h-5 text-gray-400" />
              <span>System Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyAdminDashboard({ userProfile }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">0</div>
          <div className="text-sm text-purple-600">Company Users</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-sm text-blue-600">Active Content</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">$0.00</div>
          <div className="text-sm text-green-600">Revenue</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Company Management</h3>
          <div className="space-y-3">
            <Link href="/admin/users" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiUsers className="w-5 h-5 text-gray-400" />
              <span>User Management</span>
            </Link>
            <Link href="/admin/content" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiChartBar className="w-5 h-5 text-gray-400" />
              <span>Content Management</span>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Management</h3>
          <div className="space-y-3">
            <Link href="/admin/brands" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiOfficeBuilding className="w-5 h-5 text-gray-400" />
              <span>Brand Overview</span>
            </Link>
            <Link href="/admin/analytics" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiChartBar className="w-5 h-5 text-gray-400" />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DistributionPartnerDashboard({ userProfile }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">1,247</div>
          <div className="text-sm text-blue-600">Total Creations</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">89</div>
          <div className="text-sm text-green-600">Active Projects</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">23</div>
          <div className="text-sm text-purple-600">Pending Releases</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution Management</h3>
          <div className="space-y-3">
            <Link href="/distribution/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiGlobeAlt className="w-5 h-5 text-gray-400" />
              <span>Distribution Dashboard</span>
            </Link>
            <Link href="/distribution/creations" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiMusicNote className="w-5 h-5 text-gray-400" />
              <span>All Creations</span>
            </Link>
            <Link href="/distribution/projects" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiChartBar className="w-5 h-5 text-gray-400" />
              <span>All Projects</span>
            </Link>
            <Link href="/distribution/sync-board" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiGlobeAlt className="w-5 h-5 text-gray-400" />
              <span>Sync Board</span>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/distribution/content" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiChartBar className="w-5 h-5 text-gray-400" />
              <span>Content Review</span>
            </Link>
            <Link href="/distribution/partners" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiUsers className="w-5 h-5 text-gray-400" />
              <span>Partners</span>
            </Link>
            <Link href="/distribution/licensing" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiDocument className="w-5 h-5 text-gray-400" />
              <span>Licensing</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DistributorDashboard({ userProfile }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-indigo-600">0</div>
          <div className="text-sm text-indigo-600">Active Licenses</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-green-600">Clients</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">$0.00</div>
          <div className="text-sm text-purple-600">Revenue</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution</h3>
          <div className="space-y-3">
            <Link href="/distributor/content" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiCube className="w-5 h-5 text-gray-400" />
              <span>Content</span>
            </Link>
            <Link href="/distributor/licensing" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiDocument className="w-5 h-5 text-gray-400" />
              <span>Licensing</span>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Clients</h3>
          <div className="space-y-3">
            <Link href="/distributor/clients" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiUsers className="w-5 h-5 text-gray-400" />
              <span>Client Management</span>
            </Link>
            <Link href="/distributor/contracts" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <HiDocument className="w-5 h-5 text-gray-400" />
              <span>Contracts</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
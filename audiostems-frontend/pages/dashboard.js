import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/get-profile', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-center mb-6">Welcome to AudioStems</h1>
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

  return (
    <>
      <Head>
        <title>Dashboard - AudioStems</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">AudioStems</h1>
              </div>
              <div className="flex items-center space-x-4">
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
              <nav className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
                <ul className="space-y-2">
                  <li>
                    <Link href="/dashboard" className="block px-3 py-2 text-blue-600 bg-blue-50 rounded-md">
                      Dashboard
                    </Link>
                  </li>
                  
                  {/* Distribution Menu */}
                  <li className="mt-6">
                    <div className="text-sm font-medium text-gray-900 mb-2">Distribution</div>
                    <ul className="space-y-1 ml-4">
                      <li>
                        <Link href="/distribution/overview" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                          Overview
                        </Link>
                      </li>
                      <li>
                        <Link href="/distribution/releases" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                          Releases
                        </Link>
                      </li>
                      <li>
                        <Link href="/distribution/analytics" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                          Analytics
                        </Link>
                      </li>
                      
                      {/* Publishing Submenu */}
                      <li className="mt-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Publishing</div>
                        <ul className="space-y-1 ml-4">
                          <li>
                            <Link href="/distribution/publishing" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                              Overview
                            </Link>
                          </li>
                          <li>
                            <Link href="/distribution/publishing/artist-portal" className="block px-3 py-2 text-blue-600 bg-blue-50 rounded-md">
                              Artist Portal
                            </Link>
                          </li>
                          <li>
                            <Link href="/distribution/publishing/contracts" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                              Contracts
                            </Link>
                          </li>
                          <li>
                            <Link href="/distribution/publishing/royalties" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                              Royalties
                            </Link>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  
                  {/* Other Menu Items */}
                  <li className="mt-6">
                    <div className="text-sm font-medium text-gray-900 mb-2">Music</div>
                    <ul className="space-y-1 ml-4">
                      <li>
                        <Link href="/music/tracks" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                          Tracks
                        </Link>
                      </li>
                      <li>
                        <Link href="/music/albums" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                          Albums
                        </Link>
                      </li>
                      <li>
                        <Link href="/music/playlists" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                          Playlists
                        </Link>
                      </li>
                    </ul>
                  </li>
                  
                  <li className="mt-6">
                    <div className="text-sm font-medium text-gray-900 mb-2">Account</div>
                    <ul className="space-y-1 ml-4">
                      <li>
                        <Link href="/account/profile" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link href="/account/settings" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                          Settings
                        </Link>
                      </li>
                      <li>
                        <Link href="/account/billing" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                          Billing
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h2>
                
                {/* Welcome Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome back, {userProfile?.firstName || user?.name || 'Artist'}!
                  </h3>
                  <p className="text-gray-600">
                    Manage your music distribution, track your releases, and monitor your earnings.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                {/* Recent Activity */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-center">No recent activity</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/distribution/publishing/artist-portal" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <div className="font-medium text-gray-900">Complete Artist Profile</div>
                      <div className="text-sm text-gray-600">Set up your artist information</div>
                    </Link>
                    <Link href="/music/tracks" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <div className="font-medium text-gray-900">Upload Music</div>
                      <div className="text-sm text-gray-600">Add new tracks and albums</div>
                    </Link>
                    <Link href="/distribution/releases" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <div className="font-medium text-gray-900">Manage Releases</div>
                      <div className="text-sm text-gray-600">View and edit your releases</div>
                    </Link>
                    <Link href="/account/profile" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <div className="font-medium text-gray-900">Update Profile</div>
                      <div className="text-sm text-gray-600">Edit your account information</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
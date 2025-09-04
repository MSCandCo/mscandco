import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRoleSync, getDefaultDisplayBrand, getUserBrand } from '@/lib/user-utils';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Loader, TrendingUp, Users, DollarSign, Music, BarChart3, FileText, Settings, Eye, Edit3 } from 'lucide-react';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { DashboardRenewalNotification } from '@/components/notifications/RenewalNotification';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';

// Simple loading component
const LoadingState = ({ message = "Loading..." }) => (
  <div className="text-center py-12 px-4">
    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-4">
      <Loader className="animate-spin h-12 w-12 text-blue-600" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
    <p className="text-gray-500">Please wait while we fetch your data</p>
  </div>
);

// Enhanced stats card component
const StatsCard = ({ title, value, change, icon: Icon, trend = 'up', onClick }) => (
  <div 
    className={`bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="font-bold text-gray-900 text-3xl">{value}</p>
        {change && (
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>{change}</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-blue-100 rounded-xl">
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
    </div>
  </div>
);

// Enhanced dashboard card
const DashboardCard = ({ title, description, href, icon: Icon, onClick }) => (
  <div 
    className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center mb-4">
      <Icon className="w-8 h-8 text-blue-600 mr-3" />
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="text-blue-600 font-medium">
      {onClick ? 'View Details →' : 'Coming Soon'}
    </div>
  </div>
);

export default function RoleBasedDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  
  // Use shared wallet balance hook
  const { walletBalance, isLoading: walletLoading, refreshBalance } = useWalletBalance();

  const userRole = getUserRoleSync(user);
  const userBrand = getUserBrand(user);

  // Check email verification first
  useEffect(() => {
    if (user && !user.email_confirmed_at) {
      router.push('/verify-email');
      return;
    }
  }, [user, router]);



  // Load role-specific dashboard data
  useEffect(() => {
    if (user && userRole) {
      loadDashboardData();
      fetchSubscriptionStatus();
    }
  }, [user, userRole]);

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;

      const response = await fetch('/api/user/subscription-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubscriptionStatus(result.data);
        console.log('📋 Subscription status loaded:', result.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      // Set default no subscription status
      setSubscriptionStatus({
        status: 'none',
        planName: 'No Subscription',
        hasSubscription: false,
        isPro: false,
        isStarter: false
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get session token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        console.error('No authentication token available');
        setError('Authentication required - please log in again');
        return;
      }

      console.log('Loading dashboard data for role:', userRole);

      let apiEndpoint;
      switch (userRole) {
        case 'artist':
          apiEndpoint = '/api/artist/dashboard-stats';
          break;
        case 'label_admin':
          apiEndpoint = '/api/labeladmin/dashboard-stats';
          break;
        case 'distribution_partner':
          apiEndpoint = '/api/distributionpartner/dashboard-stats';
          break;
        case 'company_admin':
          apiEndpoint = '/api/companyadmin/dashboard-stats';
          break;
        default:
          console.error('Unsupported user role:', userRole);
          setError(`Unsupported user role: ${userRole}. Please contact support.`);
          return;
      }

      console.log('Fetching data from:', apiEndpoint);

      const response = await fetch(apiEndpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('API Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        if (result.success) {
          setDashboardData(result.data);
        } else {
          console.error('API returned success=false:', result);
          setError(result.message || 'Failed to load dashboard data');
        }
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        
        if (response.status === 403) {
          setError(`Access denied. Your account role (${userRole}) doesn't have permission to access this dashboard. Please contact support if this is incorrect.`);
        } else if (response.status === 401) {
          setError('Authentication expired. Please log out and log back in.');
        } else {
          setError(`Failed to fetch dashboard data (${response.status}). Please try refreshing the page.`);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(`Error loading dashboard data: ${error.message}. Please try refreshing the page.`);
      setLoading(false);
    }
  };

  // Get role-specific content
  const getDashboardContent = () => {
    if (!dashboardData) return null;

    switch (userRole) {
      case 'artist':
        return {
          title: `Welcome back, ${dashboardData.artistName}`,
          subtitle: 'Artist Dashboard',
          description: 'Manage your releases, track earnings, and grow your audience',
          stats: [
            { 
              title: subscriptionStatus?.isPro ? 'Total Releases' : 'Releases Used', 
              value: subscriptionStatus?.isPro 
                ? dashboardData.totalReleases?.toLocaleString() || '0'
                : `${dashboardData.totalReleases || 0} / 5`, 
              change: subscriptionStatus?.isPro 
                ? `${dashboardData.releaseGrowth > 0 ? '+' : ''}${dashboardData.releaseGrowth || 0}% this month`
                : `${Math.max(0, 5 - (dashboardData.totalReleases || 0))} remaining`, 
              icon: Music,
              trend: dashboardData.releaseGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Total Streams', 
              value: dashboardData.totalStreams?.toLocaleString() || '0', 
              change: `${dashboardData.streamGrowth > 0 ? '+' : ''}${dashboardData.streamGrowth || 0}% this month`, 
              icon: TrendingUp,
              trend: dashboardData.streamGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Total Earnings', 
              value: formatCurrency(dashboardData.totalEarnings || 0, selectedCurrency), 
              change: `${dashboardData.earningsGrowth > 0 ? '+' : ''}${dashboardData.earningsGrowth || 0}% this month`, 
              icon: DollarSign,
              trend: dashboardData.earningsGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Wallet Balance (Click to Refresh)', 
              value: formatCurrency(walletBalance, selectedCurrency), 
              change: `${dashboardData?.pendingEarnings || 0} pending`, 
              icon: Users,
              onClick: async () => {
                // Force refresh wallet balance and subscription status
                console.log('Refreshing wallet balance from dashboard...');
                await refreshBalance();
                await fetchSubscriptionStatus(); // Also refresh subscription status
                console.log('Wallet balance and subscription status refreshed');
              }
            }
          ],
          cards: [
            { title: 'Releases', description: 'Manage your music releases', icon: Music, onClick: () => router.push('/artist/releases') },
            { title: 'Analytics', description: 'View performance metrics', icon: BarChart3, onClick: () => router.push('/artist/analytics') },
            { title: 'Earnings', description: 'Track your revenue', icon: DollarSign, onClick: () => router.push('/artist/earnings') },
            { title: 'Profile', description: 'Update your information', icon: Settings, onClick: () => router.push('/artist/profile') }
          ]
        };

      case 'label_admin':
        return {
          title: `Welcome back, ${dashboardData.labelName}`,
          subtitle: 'Label Admin Dashboard',
          description: 'Complete label administration and artist management platform',
          stats: [
            { 
              title: 'Label Artists', 
              value: dashboardData.totalArtists?.toString() || '0', 
              change: `${dashboardData.artistGrowth > 0 ? '+' : ''}${dashboardData.artistGrowth || 0}% this month`, 
              icon: Users,
              trend: dashboardData.artistGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: subscriptionStatus?.isPro ? 'Active Releases' : 'Releases Used', 
              value: subscriptionStatus?.isPro 
                ? dashboardData.totalReleases?.toString() || '0'
                : `${dashboardData.totalReleases || 0} / 20`, 
              change: subscriptionStatus?.isPro 
                ? `${dashboardData.releaseGrowth > 0 ? '+' : ''}${dashboardData.releaseGrowth || 0}% this month`
                : `${Math.max(0, 20 - (dashboardData.totalReleases || 0))} remaining`, 
              icon: Music,
              trend: dashboardData.releaseGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Label Revenue', 
              value: formatCurrency(dashboardData.totalRevenue || 0, selectedCurrency), 
              change: `${dashboardData.revenueGrowth > 0 ? '+' : ''}${dashboardData.revenueGrowth || 0}% this month`, 
              icon: DollarSign,
              trend: dashboardData.revenueGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Total Streams', 
              value: `${Math.round((dashboardData.totalStreams || 0) / 1000)}K`, 
              change: `${dashboardData.avgStreamsPerRelease || 0} avg per release`, 
              icon: TrendingUp 
            }
          ],
          cards: [
            { title: 'Artists', description: 'Manage your roster', icon: Users, onClick: () => router.push('/labeladmin/artists') },
            { title: 'Analytics', description: 'View label performance', icon: BarChart3, onClick: () => router.push('/labeladmin/analytics') },
            { title: 'Earnings', description: 'Track label revenue', icon: DollarSign, onClick: () => router.push('/labeladmin/earnings') },
            { title: 'Profile', description: 'Update label information', icon: Settings, onClick: () => router.push('/labeladmin/profile') }
          ]
        };

      case 'distribution_partner':
        return {
          title: `Welcome back, ${dashboardData.partnerName}`,
          subtitle: 'Distribution Partner Dashboard',
          description: 'Manage content distribution and partner relationships',
          stats: [
            { 
              title: 'Distributed Content', 
              value: dashboardData.totalDistributedContent?.toString() || '0', 
              change: `${dashboardData.contentGrowth > 0 ? '+' : ''}${dashboardData.contentGrowth || 0}% this month`, 
              icon: Music,
              trend: dashboardData.contentGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Partner Revenue', 
              value: formatCurrency(dashboardData.totalPartnerRevenue || 0, selectedCurrency), 
              change: `${dashboardData.revenueGrowth > 0 ? '+' : ''}${dashboardData.revenueGrowth || 0}% this month`, 
              icon: DollarSign,
              trend: dashboardData.revenueGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Active Artists', 
              value: dashboardData.totalArtists?.toString() || '0', 
              change: `${dashboardData.artistGrowth > 0 ? '+' : ''}${dashboardData.artistGrowth || 0}% this month`, 
              icon: Users,
              trend: dashboardData.artistGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Success Rate', 
              value: `${dashboardData.successRate || 100}%`, 
              change: 'Distribution approval rate', 
              icon: TrendingUp 
            }
          ],
          cards: [
            { title: 'Content Management', description: 'Manage distributed content', icon: FileText, onClick: () => router.push('/distributionpartner/dashboard') },
            { title: 'Analytics', description: 'View distribution metrics', icon: BarChart3, onClick: () => router.push('/distributionpartner/analytics') },
            { title: 'Reports', description: 'Generate revenue reports', icon: DollarSign, onClick: () => router.push('/distributionpartner/reports') },
            { title: 'Profile', description: 'Update partner information', icon: Settings, onClick: () => router.push('/distributionpartner/profile') }
          ]
        };

      case 'company_admin':
        return {
          title: 'Company Admin Dashboard',
          subtitle: 'Platform Management',
          description: 'Manage all platform operations, users, and analytics',
          stats: [
            { 
              title: 'Total Users', 
              value: dashboardData.totalUsers?.toLocaleString() || '0', 
              change: `${dashboardData.userGrowth > 0 ? '+' : ''}${dashboardData.userGrowth || 0}% this month`, 
              icon: Users,
              trend: dashboardData.userGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Total Releases', 
              value: dashboardData.totalReleases?.toString() || '0', 
              change: `${dashboardData.releaseGrowth > 0 ? '+' : ''}${dashboardData.releaseGrowth || 0}% this month`, 
              icon: Music,
              trend: dashboardData.releaseGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Platform Revenue', 
              value: formatCurrency(dashboardData.totalRevenue || 0, selectedCurrency), 
              change: `${dashboardData.revenueGrowth > 0 ? '+' : ''}${dashboardData.revenueGrowth || 0}% this month`, 
              icon: DollarSign,
              trend: dashboardData.revenueGrowth >= 0 ? 'up' : 'down'
            },
            { 
              title: 'Active Subscriptions', 
              value: dashboardData.activeSubscriptions?.toString() || '0', 
              change: `${dashboardData.platformHealth || 100}% platform health`, 
              icon: TrendingUp 
            }
          ],
          cards: [
            { title: 'User Management', description: 'Manage all platform users', icon: Users, onClick: () => router.push('/companyadmin/users') },
            { title: 'Analytics', description: 'View platform analytics', icon: BarChart3, onClick: () => router.push('/companyadmin/analytics') },
            { title: 'Manage Artist Analytics', description: 'Update artist analytics data', icon: Edit3, onClick: () => router.push('/companyadmin/analytics-management') },
            { title: 'Finance', description: 'Platform financial reports', icon: DollarSign, onClick: () => router.push('/companyadmin/finance') },
            { title: 'Artist Requests', description: 'Manage artist approvals', icon: FileText, onClick: () => router.push('/companyadmin/artist-requests') }
          ]
        };

      default:
        return null;
    }
  };

  if (isLoading || loading) {
    return (
      <MainLayout>
        <LoadingState message="Loading your dashboard..." />
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Sign In
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            {/* Check if in ghost mode */}
            {typeof window !== 'undefined' && sessionStorage.getItem('ghost_mode') === 'true' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm mb-2">
                  <strong>Ghost Mode Active:</strong> You're viewing as a different user role.
                </p>
                <button
                  onClick={() => {
                    sessionStorage.removeItem('ghost_mode');
                    sessionStorage.removeItem('ghost_target_user');
                    window.dispatchEvent(new Event('ghostModeChanged'));
                    window.location.reload();
                  }}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Exit Ghost Mode
                </button>
              </div>
            )}
            
            <div className="space-y-2">
              <button 
                onClick={loadDashboardData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                Try Again
              </button>
              
              <button 
                onClick={() => router.push('/login')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 w-full"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const dashboardContent = getDashboardContent();

  if (!dashboardContent) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard not available</h2>
            <p className="text-gray-600">Your user role does not have a dashboard configured.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title={`${dashboardContent.subtitle} - MSC & Co`}
        description={dashboardContent.description}
      />
      
      <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Currency Selector */}
          <div className="flex justify-end mb-6">
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
            />
          </div>

          {/* Renewal Notification for Artists and Label Admins */}
          {(userRole === 'artist' || userRole === 'label_admin') && subscriptionStatus && (
            <DashboardRenewalNotification
              subscriptionStatus={subscriptionStatus}
              walletBalance={walletBalance}
            />
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{dashboardContent.title}</h1>
                <p className="text-blue-100 text-lg">{dashboardContent.subtitle}</p>
                <p className="text-blue-100 text-sm mt-1">{dashboardContent.description}</p>
              </div>
              {subscriptionStatus && (
                <div className="text-right">
                  <div className="text-sm text-blue-100">Subscription</div>
                  <div className="text-xl font-bold">
                    {subscriptionStatus.planName === 'No Subscription' ? (
                      <span className="text-red-200">No Subscription</span>
                    ) : subscriptionStatus.isStarter ? (
                      <span className="text-blue-200">Starter</span>
                    ) : subscriptionStatus.isPro ? (
                      <span className="text-purple-200">Pro</span>
                    ) : (
                      <span className="text-gray-200">{subscriptionStatus.planName}</span>
                    )}
                  </div>
                  {!subscriptionStatus.hasSubscription && (
                    <Link href="/billing">
                      <button className="mt-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm px-3 py-1 rounded-lg transition-colors">
                        Upgrade
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardContent.stats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                trend={stat.trend}
                onClick={stat.onClick}
              />
            ))}
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardContent.cards.map((card, index) => (
              <DashboardCard
                key={index}
                title={card.title}
                description={card.description}
                icon={card.icon}
                onClick={card.onClick}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRoleSync, getDefaultDisplayBrand, getUserBrand } from '@/lib/user-utils';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader, TrendingUp, Users, DollarSign, Music } from 'lucide-react';

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

// Simple card component
const StatsCard = ({ title, value, change, icon: Icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
      {change && (
        <div className="mt-2">
          <span className="text-sm text-green-600">{change}</span>
        </div>
      )}
    </div>
  </div>
);

// Simple dashboard card
const DashboardCard = ({ title, description, href, icon, stats }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-6">
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      
      {stats && (
        <div className="mt-4 space-y-2 text-sm">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Link href={href}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            View {title}
          </button>
        </Link>
      </div>
    </div>
  </div>
);

export default function RoleBasedDashboard() {
  const { user, isLoading } = useUser();
  const [selectedCurrency] = useState('GBP');

  // Show loading state while authentication is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingState message="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  let userRole, displayBrand, userBrand;
  
  try {
    userRole = getUserRoleSync(user);
    displayBrand = getDefaultDisplayBrand(user);
    userBrand = getUserBrand(user);
  } catch (error) {
    // Handle role detection errors gracefully
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading dashboard</h2>
          <p className="text-gray-600 mb-4">There was an issue loading your dashboard. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Format currency (simple version)
  const formatCurrency = (amount, currency = 'GBP') => {
    const symbols = { GBP: '£', USD: '$', EUR: '€' };
    const symbol = symbols[currency] || '£';
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Dashboard content based on role
  const getDashboardContent = () => {
    switch (userRole) {
      case 'super_admin':
        return {
          title: 'Super Admin Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Company Overview`,
          description: 'Manage all brands, users, and platform settings',
          stats: [
            { title: 'Total Users', value: '0', change: '+12%', icon: Users },
            { title: 'Active Projects', value: '0', change: '+5%', icon: Music },
            { title: 'Revenue', value: formatCurrency(0, selectedCurrency), change: '+8%', icon: DollarSign },
            { title: 'Total Artists', value: '0', change: '0 releases', icon: TrendingUp }
          ],
          cards: [
            {
              title: 'User Management',
              description: 'Manage all platform users and roles',
              icon: '👥',
              href: '/superadmin/users',
              stats: { users: 0, roles: 5 }
            },
            {
              title: 'Content Management',
              description: 'Oversee all platform content',
              icon: '📁',
              href: '/superadmin/content',
              stats: { songs: 0, projects: 0 }
            },
            {
              title: 'System Settings',
              description: 'Configure platform settings',
              icon: '⚙️',
              href: '/superadmin/settings',
              stats: { brands: 2, features: 12 }
            }
          ]
        };

      case 'company_admin':
        return {
          title: 'Company Admin Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Brand Management`,
          description: 'Manage your brand users and content',
          stats: [
            { title: 'Brand Artists', value: '0', change: '+8%', icon: Users },
            { title: 'Active Projects', value: '0', change: '+3%', icon: Music },
            { title: 'Revenue', value: formatCurrency(0, selectedCurrency), change: '+6%', icon: DollarSign },
            { title: 'Content Items', value: '0', change: '+12%', icon: TrendingUp }
          ],
          cards: [
            {
              title: 'User Management',
              description: 'Manage brand users and permissions',
              icon: '👥',
              href: '/companyadmin/users',
              stats: { users: 0, roles: 3 }
            },
            {
              title: 'Content Management',
              description: 'Manage brand content and projects',
              icon: '📁',
              href: '/companyadmin/content',
              stats: { songs: 0, projects: 0 }
            },
            {
              title: 'Analytics',
              description: 'View brand performance metrics',
              icon: '📈',
              href: '/companyadmin/analytics',
              stats: { views: 0, engagement: 0 }
            }
          ]
        };

      case 'label_admin':
        return {
          title: `${displayBrand?.displayName || 'MSC & Co'} - Label Management Dashboard`,
          subtitle: 'Manage label artists, contracts, and revenue streams',
          description: 'Complete label administration and artist management platform',
          stats: [
            { title: 'Label Artists', value: '0', change: '+3 this quarter', icon: Users },
            { title: 'Active Releases', value: '0', change: '+12%', icon: Music },
            { title: 'Label Revenue', value: formatCurrency(0, selectedCurrency), change: '+18%', icon: DollarSign },
            { title: 'Total Streams', value: '0K', change: '+25%', icon: TrendingUp }
          ],
          cards: [
            {
              title: 'Artist Management',
              description: 'Manage label artists and their contracts',
              icon: '🎤',
              href: '/labeladmin/artists',
              stats: { artists: 0, contracts: 0 }
            },
            {
              title: 'Revenue Tracking',
              description: 'Monitor label earnings and artist royalties',
              icon: '💰',
              href: '/labeladmin/earnings',
              stats: { revenue: 0, releases: 0 }
            },
            {
              title: 'Performance Analytics',
              description: 'View label-wide performance metrics',
              icon: '📊',
              href: '/labeladmin/analytics',
              stats: { streams: 0, countries: 0 }
            }
          ]
        };

      case 'distribution_partner':
        return {
          title: 'Distribution Partner Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Content Distribution`,
          description: 'Manage content distribution and partner relationships',
          stats: [
            { title: 'Distributed Content', value: '0', change: '+15%', icon: Music },
            { title: 'Partner Revenue', value: formatCurrency(0, selectedCurrency), change: '+12%', icon: DollarSign },
            { title: 'Active Artists', value: '0', change: '0 total releases', icon: Users },
            { title: 'Success Rate', value: '100%', change: '+2%', icon: TrendingUp }
          ],
          cards: [
            {
              title: 'Content Management',
              description: 'Manage distributed content and releases',
              icon: '📁',
              href: '/distributionpartner/dashboard',
              stats: { content: 0, releases: 0 }
            },
            {
              title: 'Analytics',
              description: 'Track distribution performance',
              icon: '📈',
              href: '/distributionpartner/analytics',
              stats: { views: 0, revenue: 0 }
            }
          ]
        };

      case 'artist':
        return {
          title: 'Artist Dashboard',
          subtitle: `Welcome to MSC & Co - Your Music Career Hub`,
          description: 'Manage your releases, track earnings, and grow your audience',
          stats: [
            { title: 'Total Releases', value: '0', change: '+2 this month', icon: Music },
            { title: 'Total Streams', value: '0K', change: '+15%', icon: TrendingUp },
            { title: 'Total Earnings', value: formatCurrency(0, selectedCurrency), change: `+${formatCurrency(0, selectedCurrency)}`, icon: DollarSign },
            { title: 'Active Projects', value: '0', change: '0 in review', icon: Users }
          ],
          cards: [
            {
              title: 'Releases',
              description: 'Manage your music releases and track submissions',
              icon: '🎵',
              href: '/artist/releases',
              stats: { total: 0, draft: 0, live: 0 }
            },
            {
              title: 'Earnings',
              description: 'Track your revenue from streaming platforms',
              icon: '💰',
              href: '/artist/earnings',
              stats: { thisMonth: formatCurrency(0, selectedCurrency), platforms: 8 }
            },
            {
              title: 'Analytics',
              description: 'View detailed performance analytics',
              icon: '📈',
              href: '/artist/analytics',
              stats: { streams: '0K', countries: 0 }
            }
          ]
        };

      default:
        return {
          title: 'Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'}`,
          description: 'Your platform overview',
          stats: [
            { title: 'Overview', value: 'Welcome', change: '', icon: Users }
          ],
          cards: [
            {
              title: 'Dashboard',
              description: 'Your main dashboard',
              icon: '📊',
              href: '/dashboard',
              stats: { items: 1 }
            }
          ]
        };
    }
  };

  const dashboardContent = getDashboardContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{dashboardContent.title}</h1>
              <p className="mt-2 text-lg text-gray-600">{dashboardContent.subtitle}</p>
              <p className="mt-1 text-sm text-gray-500">{dashboardContent.description}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardContent.stats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
              />
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardContent.cards.map((card, index) => (
              <DashboardCard
                key={index}
                title={card.title}
                description={card.description}
                href={card.href}
                icon={card.icon}
                stats={card.stats}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
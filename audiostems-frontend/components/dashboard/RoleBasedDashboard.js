import { useAuth0 } from '@auth0/auth0-react';
import { Card, Button, Badge } from 'flowbite-react';
import { getUserRole, getDefaultDisplayBrand } from '@/lib/auth0-config';

export default function RoleBasedDashboard() {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
          <Button href="/login">Sign In</Button>
        </div>
      </div>
    );
  }

  const userRole = getUserRole(user);
  const displayBrand = getDefaultDisplayBrand(user);

  // Debug logging
  console.log('=== Dashboard Debug ===');
  console.log('User object:', user);
  console.log('User metadata:', user['https://mscandco.com/role'], user['https://mscandco.com/brand']);
  console.log('Detected role:', userRole);
  console.log('Display brand:', displayBrand);

  // Dashboard content based on role
  const getDashboardContent = () => {
    console.log('Getting dashboard content for role:', userRole);
    
    switch (userRole) {
      case 'super_admin':
        console.log('Rendering Super Admin dashboard');
        return {
          title: 'Super Admin Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Company Overview`,
          description: 'Manage all brands, users, and platform settings',
          stats: [
            { label: 'Total Users', value: '1,247', change: '+12%', changeType: 'positive' },
            { label: 'Active Projects', value: '89', change: '+5%', changeType: 'positive' },
            { label: 'Revenue', value: '$124,567', change: '+8%', changeType: 'positive' },
            { label: 'Brands', value: '2', change: 'YHWH MSC, Audio MSC', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'User Management',
              description: 'Manage all platform users and roles',
              icon: '👥',
              href: '/admin/users',
              stats: { users: 1247, roles: 5 }
            },
            {
              title: 'Content Management',
              description: 'Oversee all platform content',
              icon: '📁',
              href: '/admin/content',
              stats: { songs: 1247, projects: 89 }
            },
            {
              title: 'System Settings',
              description: 'Configure platform settings',
              icon: '⚙️',
              href: '/admin/settings',
              stats: { brands: 2, features: 15 }
            }
          ]
        };

      case 'company_admin':
        console.log('Rendering Company Admin dashboard');
        return {
          title: 'Company Admin Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Brand Management`,
          description: 'Manage your brand users and content',
          stats: [
            { label: 'Brand Users', value: '456', change: '+8%', changeType: 'positive' },
            { label: 'Active Projects', value: '34', change: '+3%', changeType: 'positive' },
            { label: 'Revenue', value: '$67,890', change: '+6%', changeType: 'positive' },
            { label: 'Content Items', value: '234', change: '+12%', changeType: 'positive' }
          ],
          cards: [
            {
              title: 'User Management',
              description: 'Manage brand users and permissions',
              icon: '👥',
              href: '/admin/users',
              stats: { users: 456, roles: 3 }
            },
            {
              title: 'Content Management',
              description: 'Manage brand content and projects',
              icon: '📁',
              href: '/admin/content',
              stats: { songs: 234, projects: 34 }
            },
            {
              title: 'Analytics',
              description: 'View brand performance metrics',
              icon: '📈',
              href: '/admin/analytics',
              stats: { views: 12345, engagement: 78 }
            }
          ]
        };

      case 'artist':
        console.log('Rendering Artist dashboard');
        return {
          title: 'Artist Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Your Music Journey`,
          description: 'Track your projects, earnings, and performance',
          stats: [
            { label: 'My Projects', value: '12', change: '+2', changeType: 'positive' },
            { label: 'Total Earnings', value: '$8,456', change: '+15%', changeType: 'positive' },
            { label: 'Streams', value: '45,678', change: '+23%', changeType: 'positive' },
            { label: 'Social Footprint', value: '45,678', change: '+12%', changeType: 'positive' }
          ],
          cards: [
            {
              title: 'My Projects',
              description: 'Manage your music projects and releases',
              icon: '🎵',
              href: '/artist/projects',
              stats: { projects: 12, releases: 8 }
            },
            {
              title: 'Earnings',
              description: 'Track your revenue and payments',
              icon: '💰',
              href: '/artist/earnings',
              stats: { earnings: 8456, pending: 1234 }
            },
            {
              title: 'Analytics',
              description: 'View your performance metrics and social footprint',
              icon: '📈',
              href: '/artist/analytics',
              stats: { streams: 45678, footprint: 45678 }
            }
          ]
        };

      case 'distribution_partner':
        console.log('Rendering Distribution Partner dashboard');
        return {
          title: 'Distribution Partner Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Content Distribution`,
          description: 'Manage content distribution and partner relationships',
          stats: [
            { label: 'Distributed Content', value: '234', change: '+15%', changeType: 'positive' },
            { label: 'Partner Revenue', value: '$23,456', change: '+12%', changeType: 'positive' },
            { label: 'Active Partners', value: '8', change: '+1', changeType: 'positive' },
            { label: 'Success Rate', value: '94%', change: '+2%', changeType: 'positive' }
          ],
          cards: [
            {
              title: 'Content Management',
              description: 'Manage distributed content and releases',
              icon: '📁',
              href: '/partner/content',
              stats: { content: 234, releases: 45 }
            },
            {
              title: 'Analytics',
              description: 'Track distribution performance',
              icon: '📈',
              href: '/partner/analytics',
              stats: { views: 56789, revenue: 23456 }
            },
            {
              title: 'Reports',
              description: 'Generate distribution reports',
              icon: '📋',
              href: '/partner/reports',
              stats: { reports: 12, partners: 8 }
            }
          ]
        };

      case 'distributor':
        console.log('Rendering Distributor dashboard');
        return {
          title: 'Distributor Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Distribution Management`,
          description: 'Manage content distribution and platform settings',
          stats: [
            { label: 'Distributed Content', value: '567', change: '+18%', changeType: 'positive' },
            { label: 'Platform Revenue', value: '$45,678', change: '+14%', changeType: 'positive' },
            { label: 'Active Platforms', value: '12', change: '+2', changeType: 'positive' },
            { label: 'Success Rate', value: '96%', change: '+1%', changeType: 'positive' }
          ],
          cards: [
            {
              title: 'Distribution',
              description: 'Manage content distribution across platforms',
              icon: '🌐',
              href: '/distribution/content',
              stats: { content: 567, platforms: 12 }
            },
            {
              title: 'Reports',
              description: 'Generate distribution reports and analytics',
              icon: '📋',
              href: '/distribution/reports',
              stats: { reports: 25, revenue: 45678 }
            },
            {
              title: 'Settings',
              description: 'Configure distribution settings',
              icon: '⚙️',
              href: '/distribution/settings',
              stats: { platforms: 12, features: 8 }
            }
          ]
        };

      default:
        console.log('Rendering default dashboard for role:', userRole);
        return {
          title: 'Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'}`,
          description: 'Your platform overview',
          stats: [
            { label: 'Overview', value: 'Welcome', change: '', changeType: 'neutral' }
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
          <h1 className="text-3xl font-bold text-gray-900">{dashboardContent.title}</h1>
          <p className="mt-2 text-lg text-gray-600">{dashboardContent.subtitle}</p>
          <p className="mt-1 text-sm text-gray-500">{dashboardContent.description}</p>
        </div>

        {/* Stats */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardContent.stats.map((stat, index) => (
              <Card key={index} className="bg-white">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  {stat.change && (
                    <div className="flex items-center">
                      <Badge 
                        color={stat.changeType === 'positive' ? 'success' : stat.changeType === 'negative' ? 'failure' : 'info'}
                        className="text-xs"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardContent.cards.map((card, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{card.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                      <p className="text-sm text-gray-600">{card.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(card.stats).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Button href={card.href} className="w-full">
                    View {card.title}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
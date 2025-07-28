import { useAuth0 } from '@auth0/auth0-react';
import Link from 'next/link';
import { getUserRole, getDefaultDisplayBrand } from '@/lib/auth0-config';

export default function RoleBasedNavigation() {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated || !user) {
    return null;
  }

  const userRole = getUserRole(user);
  const displayBrand = getDefaultDisplayBrand(user);

  // Debug logging
  console.log('=== Navigation Debug ===');
  console.log('User object:', user);
  console.log('User metadata:', user['https://mscandco.com/role'], user['https://mscandco.com/brand']);
  console.log('Detected role:', userRole);
  console.log('Display brand:', displayBrand);

  // Navigation items based on role
  const getNavigationItems = () => {
    console.log('Getting navigation items for role:', userRole);
    
    switch (userRole) {
      case 'super_admin':
        console.log('Rendering Super Admin navigation');
        return [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/admin/users', label: 'User Management', icon: '👥' },
          { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
          { href: '/admin/content', label: 'Content Management', icon: '📁' },
          { href: '/admin/settings', label: 'Platform Settings', icon: '⚙️' }
        ];

      case 'company_admin':
        console.log('Rendering Company Admin navigation');
        return [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/admin/users', label: 'User Management', icon: '👥' },
          { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
          { href: '/admin/content', label: 'Content Management', icon: '📁' }
        ];

      case 'artist':
        console.log('Rendering Artist navigation');
        return [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/artist/earnings', label: 'Earnings', icon: '💰' },
          { href: '/artist/projects', label: 'My Projects', icon: '🎵' },
          { href: '/artist/analytics', label: 'Analytics', icon: '📈' },
          { href: '/artist/profile', label: 'Profile', icon: '👤' }
        ];

      case 'distribution_partner':
        console.log('Rendering Distribution Partner navigation');
        return [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/partner/content', label: 'Content Management', icon: '📁' },
          { href: '/partner/analytics', label: 'Analytics', icon: '📈' },
          { href: '/partner/reports', label: 'Reports', icon: '📋' }
        ];

      case 'distributor':
        console.log('Rendering Distributor navigation');
        return [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/distribution/content', label: 'Distribution', icon: '🌐' },
          { href: '/distribution/reports', label: 'Reports', icon: '📋' },
          { href: '/distribution/settings', label: 'Settings', icon: '⚙️' }
        ];

      default:
        console.log('Rendering default navigation for role:', userRole);
        return [
          { href: '/dashboard', label: 'Dashboard', icon: '📊' }
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                {displayBrand?.displayName || 'MSC & Co'}
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {userRole?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user.name || user.email}
                </span>
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=random`}
                  alt="User avatar"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 
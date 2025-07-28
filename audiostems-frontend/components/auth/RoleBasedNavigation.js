import { useAuth0 } from '@auth0/auth0-react';
import Link from 'next/link';
import { getUserRole, getDefaultDisplayBrand } from '@/lib/auth0-config';
import { Dropdown } from "flowbite-react";
import {
  HiArrowLeftOnRectangle,
  HiUser,
  HiDownload,
  HiCog6Tooth,
} from "lucide-react";
import { openCustomerPortal } from "@/lib/utils";

export default function RoleBasedNavigation() {
  const { user, isAuthenticated, logout } = useAuth0();

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
          { href: '/artist/releases', label: 'My Releases', icon: '🎵' },
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
    <header className="px-3 lg:px-[50px] py-1 h-[55px] border-b border-gray-200 bg-white">
      <div className="w-full max-h-full flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              {displayBrand?.displayName || 'MSC & Co'}
            </Link>
            
            <div className="flex space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-6">
            <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">
              Prices
            </Link>
            <span className="text-sm text-gray-500">About</span>
            <span className="text-sm text-gray-500">Support</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {userRole?.replace('_', ' ').toUpperCase()}
            </span>
            
            <Dropdown
              color="gray"
              size="sm"
              label={
                user?.name ? <p>Hi, {user.name}</p> : <p>Hi</p>
              }
              dismissOnClick={false}
            >
              <Link href="/dashboard">
                <Dropdown.Item icon={HiUser}>Dashboard</Dropdown.Item>
              </Link>
              <Link href="/settings/me">
                <Dropdown.Item icon={HiUser}>Profile</Dropdown.Item>
              </Link>
              <Link href="/download-history">
                <Dropdown.Item icon={HiDownload}>Download History</Dropdown.Item>
              </Link>
              <Dropdown.Item icon={HiCog6Tooth} onClick={openCustomerPortal}>
                Billing
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                icon={HiArrowLeftOnRectangle}
                onClick={() => logout({ 
                  logoutParams: { 
                    returnTo: window.location.origin 
                  } 
                })}
              >
                Logout
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
} 
import { useAuth0 } from '@auth0/auth0-react';
import Link from 'next/link';
import { getUserRole, getDefaultDisplayBrand } from '@/lib/auth0-config';
import { Dropdown } from "flowbite-react";
import {
  HiArrowLeftOnRectangle,
  HiUser,
  HiDownload,
  HiCog6Tooth,
  FileText,
  BarChart3,
  DollarSign,
  Users,
} from "lucide-react";
import { openCustomerPortal } from "@/lib/utils";
import { useState, useEffect } from 'react';

export default function RoleBasedNavigation() {
  const { user, isAuthenticated, logout } = useAuth0();
  const [profileData, setProfileData] = useState(null);

  // Fetch profile data to get first and last name
  useEffect(() => {
    if (isAuthenticated && user) {
      fetch('/api/artist/get-profile')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProfileData(data.profile);
          }
        })
        .catch(err => console.error('Error fetching profile:', err));
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const userRole = getUserRole(user);
  const displayBrand = getDefaultDisplayBrand(user);

  // Get display name from profile data or fallback to email
  const getDisplayName = () => {
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    return user.email || 'User';
  };

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
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/admin/users', label: 'User Management' },
          { href: '/admin/analytics', label: 'Analytics' },
          { href: '/admin/content', label: 'Content Management' },
          { href: '/admin/settings', label: 'Platform Settings' }
        ];

      case 'company_admin':
        console.log('Rendering Company Admin navigation');
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/admin/users', label: 'User Management' },
          { href: '/admin/analytics', label: 'Analytics' },
          { href: '/admin/content', label: 'Content Management' }
        ];

      case 'artist':
        console.log('Rendering Artist navigation');
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/artist/earnings', label: 'Earnings' },
          { href: '/artist/releases', label: 'My Releases' },
          { href: '/artist/analytics', label: 'Analytics' },
          { href: '/artist/roster', label: 'Roster' },
          { href: '/artist/profile', label: 'Profile' }
        ];

      case 'distribution_partner':
        console.log('Rendering Distribution Partner navigation');
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/partner/content', label: 'Content Management' },
          { href: '/partner/analytics', label: 'Analytics' },
          { href: '/partner/reports', label: 'Reports' }
        ];

      case 'distributor':
        console.log('Rendering Distributor navigation');
        return [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/distribution/content', label: 'Distribution' },
          { href: '/distribution/reports', label: 'Reports' },
          { href: '/distribution/settings', label: 'Settings' }
        ];

      default:
        console.log('Rendering default navigation for role:', userRole);
        return [
          { href: '/dashboard', label: 'Dashboard' }
        ];
    }
  };

  const navigationItems = [
    { href: '/artist/releases', label: 'My Releases', icon: FileText },
    { href: '/artist/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/artist/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/artist/roster', label: 'Roster', icon: Users }
  ];

  return (
    <header className="px-3 lg:px-[50px] py-1 h-[50px] border-b border-gray-200 bg-white">
      <div className="w-full max-h-full flex justify-between items-center">
        {/* Left side - Navigation items */}
        <div className="flex-1 flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center space-x-1"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Center - Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/dashboard" className="flex items-center">
            <img 
              src="/logos/yhwh-msc-logo.png" 
              alt="YHWH MSC & Co" 
              className="h-8 w-auto"
              onError={(e) => {
                // Try SVG fallback
                e.target.src = '/logos/yhwh-msc-logo.svg';
                e.target.onerror = () => {
                  // Final fallback to text
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                };
              }}
            />
            <span className="text-lg font-bold text-gray-900 hidden">
              {displayBrand?.displayName || 'MSC & Co'}
            </span>
          </Link>
        </div>

        {/* Right side - Utility links and user menu */}
        <div className="flex-1 flex justify-end items-center space-x-3">
          <div className="flex items-center space-x-4">
            <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900">
              Prices
            </Link>
            <span className="text-sm text-gray-500">About</span>
            <span className="text-sm text-gray-500">Support</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {userRole?.replace('_', ' ').toUpperCase()}
            </span>
            
            <Dropdown
              color="gray"
              size="sm"
              label={
                <p>Hi, {getDisplayName()}</p>
              }
              dismissOnClick={false}
            >
              <Link href="/dashboard">
                <Dropdown.Item icon={HiUser}>Dashboard</Dropdown.Item>
              </Link>
              <Link href="/artist/profile">
                <Dropdown.Item icon={HiUser}>Profile</Dropdown.Item>
              </Link>
              <Link href="/billing">
                <Dropdown.Item icon={HiCog6Tooth}>Billing</Dropdown.Item>
              </Link>
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
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
  Wallet,
  ChevronDown,
} from "lucide-react";
import { openCustomerPortal } from "@/lib/utils";
import { useState, useEffect } from 'react';

export default function RoleBasedNavigation() {
  const { user, isAuthenticated, logout } = useAuth0();
  const [profileData, setProfileData] = useState(null);
  const [fundsData, setFundsData] = useState({
    heldEarnings: 1560,
    availableForCashout: 890,
    minimumCashoutThreshold: 100
  });
  const [selectedCurrency, setSelectedCurrency] = useState('GBP'); // Default to GBP
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load currency preference from localStorage and sync across tabs
  useEffect(() => {
    const savedCurrency = localStorage.getItem('artist-earnings-currency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }

    // Listen for currency changes from other tabs/pages
    const handleStorageChange = (e) => {
      if (e.key === 'artist-earnings-currency' && e.newValue) {
        setSelectedCurrency(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Format currency based on selected currency
  const formatCurrency = (amount) => {
    const symbols = {
      'GBP': '£',
      'USD': '$',
      'EUR': '€'
    };
    const symbol = symbols[selectedCurrency] || '£';
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Fetch profile data to get first and last name
  useEffect(() => {
    if (isAuthenticated && user) {
      fetch('/api/artist/get-profile')
        .then(res => res.json())
        .then(data => {
          setProfileData(data);
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

  const getDistributionPartnerDisplayName = () => {
    if (profileData?.firstName) {
      return `${profileData.firstName} from Code Group`;
    }
    return `${user.email || 'User'} from Code Group`;
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  // Debug logging
  console.log('=== Navigation Debug ===');
  console.log('User object:', user);
  console.log('User metadata:', user['https://mscandco.com/role'], user['https://mscandco.com/brand']);
  console.log('Detected role:', userRole);
  console.log('Display brand:', displayBrand);

  // Add distribution partner navigation
  if (userRole === 'distribution_partner') {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <img
                  src="/logos/msc-logo.png"
                  alt="MSC & Co"
                  className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onError={(e) => {
                    e.target.src = '/logos/msc-logo.svg';
                  }}
                />
              </Link>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link
                  href="/distribution-partner/dashboard"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Content Management
                </Link>
                <Link
                  href="/partner/analytics"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Analytics
                </Link>
                <Link
                  href="/partner/reports"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Earnings
                </Link>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="text-gray-700">Hi, {getDistributionPartnerDisplayName()}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/distribution-partner/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/billing"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Billing
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Add super admin navigation
  if (userRole === 'super_admin') {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <img
                  src="/logos/msc-logo.png"
                  alt="MSC & Co"
                  className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onError={(e) => {
                    e.target.src = '/logos/msc-logo.svg';
                  }}
                />
              </Link>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link
                  href="/admin/dashboard"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Users
                </Link>
                <Link
                  href="/admin/content"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Content
                </Link>
                <Link
                  href="/admin/analytics"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Analytics
                </Link>
                <Link
                  href="/distribution-partner/dashboard"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Distribution
                </Link>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="text-gray-700">Hi, {getDisplayName()}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/billing"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Billing
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Add company admin navigation
  if (userRole === 'company_admin') {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <img
                  src="/logos/msc-logo.png"
                  alt="MSC & Co"
                  className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onError={(e) => {
                    e.target.src = '/logos/msc-logo.svg';
                  }}
                />
              </Link>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link
                  href="/admin/dashboard"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Users
                </Link>
                <Link
                  href="/admin/content"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Content
                </Link>
                <Link
                  href="/distribution-partner/dashboard"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Distribution
                </Link>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="text-gray-700">Hi, {getDisplayName()}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/billing"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Billing
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Add label admin navigation
  if (userRole === 'label_admin') {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <img
                  src="/logos/msc-logo.png"
                  alt="MSC & Co"
                  className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onError={(e) => {
                    e.target.src = '/logos/msc-logo.svg';
                  }}
                />
              </Link>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link
                  href="/label-admin/dashboard"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/label-admin/artists"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Artists
                </Link>
                <Link
                  href="/label-admin/releases"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  All Releases
                </Link>
                <Link
                  href="/label-admin/earnings"
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Earnings
                </Link>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="text-gray-700">Hi, {getDisplayName()}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/label-admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/billing"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Billing
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Default navigation for artists and distributors
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
          <Link href="/" className="flex items-center">
            <img 
              src="/logos/yhwh-msc-logo.png" 
              alt="YHWH MSC" 
              className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onError={(e) => {
                e.target.src = '/logos/yhwh-msc-logo.svg';
                e.target.onerror = () => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                };
              }}
            />
            <span className="text-lg font-bold text-gray-900 hidden">
              {displayBrand?.displayName || 'YHWH MSC'}
            </span>
          </Link>
        </div>

        {/* Right side - Utility links and user menu */}
        <div className="flex-1 flex justify-end items-center space-x-3">
          {/* Platform Funds Display - Only for artists */}
          {userRole === 'artist' && (
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
              <Wallet className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-900">{formatCurrency(fundsData.heldEarnings)}</span>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
              About
            </Link>
            <Link href="/support" className="text-sm text-gray-500 hover:text-gray-900">
              Support
            </Link>
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
              <Link href={userRole === 'label_admin' ? '/label-admin/dashboard' : 
                          userRole === 'super_admin' ? '/admin/dashboard' : 
                          userRole === 'company_admin' ? '/admin/dashboard' : 
                          userRole === 'distribution_partner' ? '/distribution-partner/dashboard' : 
                          '/dashboard'}>
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
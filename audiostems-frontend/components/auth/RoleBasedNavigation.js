import { useUser } from '@/components/providers/SupabaseProvider';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getUserRoleSync, getDefaultDisplayBrand, getUserBrand } from '@/lib/user-utils';
import { Dropdown } from "flowbite-react";
import {
  FileText,
  BarChart3,
  DollarSign,
  Users,
  Wallet,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from 'react';
import { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';

export default function RoleBasedNavigation() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [fundsData, setFundsData] = useState({
    heldEarnings: 1560,
    availableForCashout: 890,
    minimumCashoutThreshold: 100,
    labelAdminEarnings: 4250, // Label admin earnings
    labelAdminAvailable: 3100  // Available for withdrawal
  });
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check if current page is active
  const isActivePage = (path) => {
    return router.pathname === path;
  };

  // Get nav link classes with active state (using footer color scheme)
  const getNavLinkClasses = (path) => {
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    if (isActivePage(path)) {
      return `${baseClasses} text-gray-800 font-semibold`;
    }
    return `${baseClasses} text-gray-400 hover:text-gray-800`;
  };

  // Use shared currency formatting

  // Fetch profile data to get first and last name
  useEffect(() => {
    if (user && user) {
      fetch('/api/artist/get-profile')
        .then(res => res.json())
        .then(data => {
          setProfileData(data);
        })
        .catch(err => console.error('Error fetching profile:', err));
    }
  }, [user, user]);

  if (!user || !user) {
    return null;
  }

  const userRole = getUserRoleSync(user);
  const displayBrand = getDefaultDisplayBrand(user);

  // Get display name with role and label information
  const getDisplayName = () => {
    // Simple approach - just return email, no async calls
    return user?.email || 'User';
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
              <div className="ml-10 flex items-baseline space-x-6">
                <Link
                  href="/distributionpartner/dashboard"
                  className={getNavLinkClasses('/distributionpartner/dashboard')}
                >
                  Content Management
                </Link>
                        <Link
          href="/distributionpartner/analytics"
          className={getNavLinkClasses('/distributionpartner/analytics')}
        >
          Analytics
        </Link>
        <Link
          href="/distributionpartner/reports"
          className={getNavLinkClasses('/distributionpartner/reports')}
        >
          Finance
        </Link>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <span className="text-gray-700">Hi, {getDistributionPartnerDisplayName()}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/distributionpartner/profile"
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
              <div className="ml-10 flex items-baseline space-x-6">
                <Link
                  href="/superadmin/users"
                  className={getNavLinkClasses('/superadmin/users')}
                >
                  Users
                </Link>
                <Link
                  href="/superadmin/content"
                  className={getNavLinkClasses('/superadmin/content')}
                >
                  Content
                </Link>
                <Link
                  href="/superadmin/analytics"
                  className={getNavLinkClasses('/superadmin/analytics')}
                >
                  Analytics
                </Link>
                <Link
                  href="/superadmin/earnings"
                  className={getNavLinkClasses('/superadmin/earnings')}
                >
                  Earnings
                </Link>
                <Link
                  href="/distribution/workflow"
                  className={getNavLinkClasses('/distribution/workflow')}
                >
                  Distribution
                </Link>
                <Link
                  href="/super-admin/ghost-login"
                  className={`${getNavLinkClasses('/super-admin/ghost-login')} border border-red-200 hover:border-red-300 ${isActivePage('/super-admin/ghost-login') ? 'text-red-600 border-red-400' : 'text-red-600 hover:text-red-800'}`}
                >
                  Ghost Login
                </Link>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <span className="text-gray-700">Super Admin</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
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
              <div className="ml-10 flex items-baseline space-x-6">
                <Link
                  href="/companyadmin/users"
                  className={getNavLinkClasses('/companyadmin/users')}
                >
                  Users
                </Link>
                <Link
                  href="/companyadmin/content"
                  className={getNavLinkClasses('/companyadmin/content')}
                >
                  Content
                </Link>
                <Link
                  href="/companyadmin/analytics"
                  className={getNavLinkClasses('/companyadmin/analytics')}
                >
                  Analytics
                </Link>
                <Link
                  href="/companyadmin/earnings"
                  className={getNavLinkClasses('/companyadmin/earnings')}
                >
                  Earnings
                </Link>
                <Link
                  href="/companyadmin/distribution"
                  className={getNavLinkClasses('/companyadmin/distribution')}
                >
                  Workflow
                </Link>
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <span className="text-gray-700">{user?.email || getDisplayName()}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/companyadmin/profile"
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
              <div className="ml-10 flex items-baseline space-x-6">
                <Link
                  href="/labeladmin/artists"
                  className={getNavLinkClasses('/labeladmin/artists')}
                >
                  My Artists
                </Link>
                <Link
                  href="/labeladmin/releases"
                  className={getNavLinkClasses('/labeladmin/releases')}
                >
                  All Releases
                </Link>
                <Link
                  href="/labeladmin/earnings"
                  className={getNavLinkClasses('/labeladmin/earnings')}
                >
                  Earnings
                </Link>
                <Link
                  href="/labeladmin/analytics"
                  className={getNavLinkClasses('/labeladmin/analytics')}
                >
                  Analytics
                </Link>
              </div>
            </div>

            {/* Right side - Balance and User menu */}
            <div className="flex items-center space-x-3">
              {/* Label Admin Balance Display */}
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
                <Wallet className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-900">
                  {sharedFormatCurrency(fundsData.labelAdminEarnings, selectedCurrency)}
                </span>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <span className="text-gray-700">Hi, Label Admin at {getUserBrand(user)?.displayName || getUserBrand(user)?.name || 'YHWH MSC'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/labeladmin/profile"
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
              className={`text-sm font-medium flex items-center space-x-1 transition-colors duration-200 ${
                isActivePage(item.href) 
                  ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
              }`}
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
          {/* Platform Funds Display - For artists and label admins */}
          {(userRole === 'artist' || userRole === 'label_admin') && (
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
              <Wallet className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-900">
                {userRole === 'artist' 
                  ? sharedFormatCurrency(fundsData.heldEarnings, selectedCurrency)
                  : sharedFormatCurrency(fundsData.labelAdminEarnings, selectedCurrency)
                }
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Link 
              href="/about" 
              className={`text-sm transition-colors duration-200 ${
                isActivePage('/about') 
                  ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              About
            </Link>
            <Link 
              href="/support" 
              className={`text-sm transition-colors duration-200 ${
                isActivePage('/support') 
                  ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              Support
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {String(userRole || '').replace('_', ' ').toUpperCase()}
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
                <Dropdown.Item icon={User}>Dashboard</Dropdown.Item>
              </Link>
              <Link href="/artist/profile">
                <Dropdown.Item icon={User}>Profile</Dropdown.Item>
              </Link>
              <Link href="/billing">
                <Dropdown.Item icon={Settings}>Billing</Dropdown.Item>
              </Link>
              <Dropdown.Divider />
              <Dropdown.Item
                icon={LogOut}
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
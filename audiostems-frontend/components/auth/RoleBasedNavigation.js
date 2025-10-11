import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getUserRoleSync, getDefaultDisplayBrand, getUserBrand } from '@/lib/user-utils';
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
  Menu,
  X,
  Bell,
  LayoutDashboard,
  Shield,
  ClipboardList,
  Truck,
  TrendingUp,
  HardDrive,
  PieChart,
} from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import usePermissions from '@/hooks/usePermissions';
import { useRoleSync } from '@/hooks/useRoleSync';

export default function RoleBasedNavigation() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDistributionDropdownOpen, setIsDistributionDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const distributionDropdownRef = useRef(null);

  // Use permissions hook for permission-based navigation
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  // Use role sync hook for real-time role updates
  const syncedRole = useRoleSync();

  // Check if user is superadmin - superadmins don't need wallet/profile
  const isSuperAdmin = user && hasPermission('*:*:*');

  // Use shared wallet balance hook - skip for superadmins (pass true to skip when isSuperAdmin is true)
  const { walletBalance, isLoading: walletLoading, refreshBalance } = useWalletBalance(isSuperAdmin);

  // Load unread notification count for artists, label admins, distribution partners, and super admins
  useEffect(() => {
    if (user && ['artist', 'label_admin', 'distribution_partner', 'super_admin'].includes(getUserRoleSync(user))) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/notifications/unread-count', {
        headers: session ? {
          'Authorization': `Bearer ${session.access_token}`
        } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (distributionDropdownRef.current && !distributionDropdownRef.current.contains(event.target)) {
        setIsDistributionDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Fetch profile data to get first and last name - skip for superadmins
  useEffect(() => {
    const fetchProfile = async () => {
      // Skip profile fetch for superadmins
      if (isSuperAdmin) {
        return;
      }

      if (user && user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;

          if (!token) return;

          const response = await fetch('/api/artist/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
    };

    fetchProfile();
  }, [user, user, isSuperAdmin]);

  if (!user || !user) {
    return null;
  }

  // Use synced role if available (for real-time updates), otherwise fall back to getUserRoleSync
  const userRole = syncedRole || getUserRoleSync(user);

  // Helper function to get the correct profile/settings path based on role
  const getRoleBasePath = () => {
    // Subscription customers have their own dedicated routes
    if (userRole === 'artist') {
      return '/artist';
    }
    if (userRole === 'label_admin') {
      return '/labeladmin';
    }
    // System/company admins use /admin
    // (company_admin, super_admin, distribution_partner)
    return '/admin';
  };

  // Show loading state while permissions are being fetched
  if (permissionsLoading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex-shrink-0">
              <Link href="/">
                <img
                  src="/logos/msc-logo.png"
                  alt="MSC & Co"
                  className="h-8 md:h-10 w-auto cursor-pointer"
                />
              </Link>
            </div>
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  // Get display name with role and label information
  const getDisplayName = () => {
    // Use profile data if available, fallback to email
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    if (user?.email) {
      // Extract first name from email for compact display
      const emailName = user.email.split('@')[0].replace(/[._]/g, ' ');
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'User';
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);

    try {
      // Sign out from Supabase first
      await supabase.auth.signOut();

      // Clear all storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();

        // Remove all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }

      // Force redirect using window.location for complete refresh
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even on error
      window.location.href = '/';
    }
  };

  // Check if user has ANY admin permissions
  const hasAdminAccess = hasPermission('user:read:any') ||
                         hasPermission('role:read:any') ||
                         hasPermission('support:read:any') ||
                         hasPermission('analytics:read:any') ||
                         hasPermission('release:read:any');

  // Permission-based navigation items
  const navigationItems = [];
  const roleBasePath = getRoleBasePath();

  // System admins (super_admin, company_admin) should ONLY see admin links
  // Subscription customers (artist, label_admin) should see customer links
  const isSystemAdmin = userRole === 'super_admin' || userRole === 'company_admin';

  // Subscription customer links - ONLY for non-system-admins AND non-distribution-partners
  if (!isSystemAdmin && userRole !== 'distribution_partner') {
    // Add "My Artists" link for label_admin users
    if (userRole === 'label_admin') {
      navigationItems.push({ href: '/labeladmin/artists', label: 'My Artists', icon: Users });
    }

    // Always show core navigation for subscription customers (artist, label_admin)
    navigationItems.push({ href: `${roleBasePath}/releases`, label: 'Releases', icon: FileText });
    navigationItems.push({ href: `${roleBasePath}/analytics`, label: 'Analytics', icon: BarChart3 });
    navigationItems.push({ href: `${roleBasePath}/earnings`, label: 'Earnings', icon: DollarSign });
    navigationItems.push({ href: `${roleBasePath}/roster`, label: 'Roster', icon: Users });
  }

  // Distribution Partner Items - Based on permissions
  if (hasPermission('distribution:read:partner') || hasPermission('distribution:read:any')) {
    navigationItems.push({
      href: '/distribution',
      label: 'Distribution Hub',
      icon: Truck
    });
    navigationItems.push({
      href: '/distribution/reporting',
      label: 'Revenue Reporting',
      icon: TrendingUp
    });
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <img
                src="/logos/msc-logo.png"
                alt="MSC & Co"
                className="h-8 md:h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onError={(e) => {
                  e.target.src = '/logos/msc-logo.svg';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Regular navigation items - Only for non-system-admins */}
            {!isSystemAdmin && navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage(item.href)
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* User Management - Standalone - Only for system admins */}
            {isSystemAdmin && hasPermission('user:read:any') && (
              <Link
                href="/admin/usermanagement"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/admin/usermanagement')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </Link>
            )}

            {/* Permissions & Roles - Standalone - Only for super admins with permission:read:any */}
            {isSystemAdmin && hasPermission('permission:read:any') && (
              <Link
                href="/superadmin/permissionsroles"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/superadmin/permissionsroles')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Permissions & Roles</span>
              </Link>
            )}

            {/* Requests - For users with request management permissions */}
            {(hasPermission('request:read:any') || hasPermission('request:manage:any') || hasPermission('*:*:*')) && (
              <Link
                href="/admin/requests"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/admin/requests')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Requests</span>
              </Link>
            )}

            {/* Platform Analytics - For super admins */}
            {isSystemAdmin && hasPermission('*:*:*') && (
              <Link
                href="/admin/platformanalytics"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/admin/platformanalytics')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Platform Analytics</span>
              </Link>
            )}

            {/* Analytics Management - For super admins */}
            {isSystemAdmin && hasPermission('*:*:*') && (
              <Link
                href="/admin/analyticsmanagement"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/admin/analyticsmanagement')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics Management</span>
              </Link>
            )}

            {/* Earnings Management - For super admins */}
            {isSystemAdmin && hasPermission('*:*:*') && (
              <Link
                href="/admin/earningsmanagement"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/admin/earningsmanagement')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Earnings Management</span>
              </Link>
            )}

            {/* Asset Library - For super admins */}
            {isSystemAdmin && hasPermission('*:*:*') && (
              <Link
                href="/admin/assetlibrary"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/admin/assetlibrary')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <HardDrive className="w-4 h-4" />
                <span>Asset Library</span>
              </Link>
            )}

            {/* Master Roster - For super admins */}
            {isSystemAdmin && hasPermission('*:*:*') && (
              <Link
                href="/admin/masterroster"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/admin/masterroster')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Master Roster</span>
              </Link>
            )}

            {/* Wallet Management - For super admins */}
            {isSystemAdmin && hasPermission('*:*:*') && (
              <Link
                href="/admin/walletmanagement"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/admin/walletmanagement')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Wallet Management</span>
              </Link>
            )}

            {/* Split Configuration - For super admins */}
            {isSystemAdmin && hasPermission('*:*:*') && (
              <Link
                href="/admin/splitconfiguration"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                  isActivePage('/admin/splitconfiguration')
                    ? 'text-gray-800 font-semibold'
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Split Configuration</span>
              </Link>
            )}

            {/* Distribution Dropdown - For super admins */}
            {isSystemAdmin && (hasPermission('distribution:read:partner') || hasPermission('distribution:read:any') || hasPermission('*:*:*')) && (
              <div className="relative" ref={distributionDropdownRef}>
                <button
                  onClick={() => setIsDistributionDropdownOpen(!isDistributionDropdownOpen)}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                    isActivePage('/distribution') || isActivePage('/distribution/reporting')
                      ? 'text-gray-800 font-semibold'
                      : 'text-gray-400 hover:text-gray-800'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Distribution</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isDistributionDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link href="/distribution">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <Truck className="w-4 h-4 mr-2" />
                        Distribution Hub
                      </div>
                    </Link>
                    <Link href="/distribution/reporting">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Revenue Reporting
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - User menu and Mobile menu button */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell - For subscription customers, distribution partners, and super admins */}
            {((!isSystemAdmin || userRole === 'distribution_partner') && hasPermission('notification:read:own')) ||
             (userRole === 'super_admin' && hasPermission('notification:read:any')) ? (
              <Link
                href={`${getRoleBasePath()}/messages`}
                className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            ) : null}

            {/* Platform Funds Display - For subscription customers only */}
            {!isSystemAdmin && hasPermission('earnings:read:own') && (
              <div 
                className="hidden sm:flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={refreshBalance}
                title="Click to refresh wallet balance"
              >
                <Wallet className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-900">
                  {walletLoading ? '...' : sharedFormatCurrency(walletBalance, selectedCurrency)}
                </span>
              </div>
            )}

            {/* Desktop Utility Links */}
            <div className="hidden md:flex items-center space-x-2">
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

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {userRole ? userRole.replace('_', ' ').toUpperCase() : 'USER'}
              </span>
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <span className="whitespace-nowrap">
                    <span className="hidden lg:inline">Hi, </span>{getDisplayName()}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link href="/dashboard">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </div>
                    </Link>
                    
                    {/* Profile, Messages, and Settings - Only for non-superadmin users */}
                    {!isSuperAdmin && (
                      <>
                        <Link href={`${getRoleBasePath()}/profile`}>
                          <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </div>
                        </Link>
                        {hasPermission('notification:read:own') && (
                          <Link href={`${getRoleBasePath()}/messages`}>
                            <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                              <Bell className="w-4 h-4 mr-2" />
                              Messages
                              {unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                            </div>
                          </Link>
                        )}
                        <Link href={`${getRoleBasePath()}/settings`}>
                          <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </div>
                        </Link>
                      </>
                    )}

                    {/* Messages and Settings for super admin */}
                    {isSuperAdmin && (
                      <>
                        {hasPermission('notification:read:any') && (
                          <Link href="/superadmin/messages">
                            <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                              <Bell className="w-4 h-4 mr-2" />
                              Platform Messages
                              {unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                            </div>
                          </Link>
                        )}
                        <Link href="/admin/settings">
                          <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </div>
                        </Link>
                      </>
                    )}
                    
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
              {/* Mobile Balance Display - Subscription customers only */}
              {!isSystemAdmin && hasPermission('earnings:read:own') && (
                <div 
                  className="flex items-center justify-center space-x-1 bg-gray-100 px-3 py-2 rounded-lg mx-3 mb-3 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={refreshBalance}
                  title="Click to refresh wallet balance"
                >
                  <Wallet className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Balance: {walletLoading ? '...' : sharedFormatCurrency(walletBalance, selectedCurrency)}
                  </span>
                </div>
              )}

              {/* Navigation Items - Only show for non-system-admins */}
              {!isSystemAdmin && navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* User Management - Standalone Mobile - Only for system admins */}
              {isSystemAdmin && hasPermission('user:read:any') && (
                <Link
                  href="/admin/usermanagement"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span>User Management</span>
                </Link>
              )}

              {/* Permissions & Roles - Standalone Mobile - Only for super admins with permission:read:any */}
              {isSystemAdmin && hasPermission('permission:read:any') && (
                <Link
                  href="/superadmin/permissionsroles"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  <span>Permissions & Roles</span>
                </Link>
              )}

              {/* Requests - Mobile - For users with request management permissions */}
              {(hasPermission('request:read:any') || hasPermission('request:manage:any') || hasPermission('*:*:*')) && (
                <Link
                  href="/admin/requests"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>Requests</span>
                </Link>
              )}

              {/* Platform Analytics - Mobile - For super admins */}
              {isSystemAdmin && hasPermission('*:*:*') && (
                <Link
                  href="/admin/platformanalytics"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Platform Analytics</span>
                </Link>
              )}

              {/* Analytics Management - Mobile - For super admins */}
              {isSystemAdmin && hasPermission('*:*:*') && (
                <Link
                  href="/admin/analyticsmanagement"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics Management</span>
                </Link>
              )}

              {/* Earnings Management - Mobile - For super admins */}
              {isSystemAdmin && hasPermission('*:*:*') && (
                <Link
                  href="/admin/earningsmanagement"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Earnings Management</span>
                </Link>
              )}

              {/* Asset Library - Mobile - For super admins */}
              {isSystemAdmin && hasPermission('*:*:*') && (
                <Link
                  href="/admin/assetlibrary"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HardDrive className="w-5 h-5" />
                  <span>Asset Library</span>
                </Link>
              )}

              {/* Master Roster - Mobile - For super admins */}
              {isSystemAdmin && hasPermission('*:*:*') && (
                <Link
                  href="/admin/masterroster"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span>Master Roster</span>
                </Link>
              )}

              {/* Wallet Management - Mobile - For super admins */}
              {isSystemAdmin && hasPermission('*:*:*') && (
                <Link
                  href="/admin/walletmanagement"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Wallet className="w-5 h-5" />
                  <span>Wallet Management</span>
                </Link>
              )}

              {/* Split Configuration - Mobile - For super admins */}
              {isSystemAdmin && hasPermission('*:*:*') && (
                <Link
                  href="/admin/splitconfiguration"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PieChart className="w-5 h-5" />
                  <span>Split Configuration</span>
                </Link>
              )}

              {/* Distribution Links - Mobile - For super admins */}
              {isSystemAdmin && (hasPermission('distribution:read:partner') || hasPermission('distribution:read:any') || hasPermission('*:*:*')) && (
                <>
                  <Link
                    href="/distribution"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Truck className="w-5 h-5" />
                    <span>Distribution Hub</span>
                  </Link>
                  <Link
                    href="/distribution/reporting"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Revenue Reporting</span>
                  </Link>
                </>
              )}

              {/* Utility Links */}
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/support"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Support
              </Link>
              
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="px-3 py-2">
                  <div className="text-base font-medium text-gray-800">{getDisplayName()}</div>
                  <div className="text-sm text-gray-500">{userRole ? userRole.replace('_', ' ').toUpperCase() : 'USER'}</div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {/* Profile and Settings - Only for non-superadmin users */}
                  {!isSuperAdmin && (
                    <>
                      <Link
                        href={`${getRoleBasePath()}/profile`}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href={`${getRoleBasePath()}/settings`}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                    </>
                  )}

                  {/* Settings for superadmin users */}
                  {isSuperAdmin && (
                    <Link
                      href="/admin/settings"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

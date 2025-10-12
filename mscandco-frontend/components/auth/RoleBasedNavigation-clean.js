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
} from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { useWalletBalance } from '@/hooks/useWalletBalance';

export default function RoleBasedNavigation() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  
  // Use shared wallet balance hook
  const { walletBalance, isLoading: walletLoading, refreshBalance } = useWalletBalance();

  // Load unread notification count for artists and label admins
  useEffect(() => {
    if (user && ['artist', 'label_admin'].includes(getUserRoleSync(user))) {
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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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

  // Fetch profile data to get first and last name
  useEffect(() => {
    const fetchProfile = async () => {
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
  }, [user, user]);

  if (!user || !user) {
    return null;
  }

  const userRole = getUserRoleSync(user);

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
      // Clear ghost mode if active
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ghost_mode');
        sessionStorage.removeItem('ghost_session');
        sessionStorage.removeItem('original_admin_user');
        sessionStorage.removeItem('ghost_target_user');
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to logout page
      router.push('/logout');
    }
  };

  // Clean navigation - NO admin functions, just basic user navigation
  const navigationItems = [
    { href: '/artist/releases', label: 'My Releases', icon: FileText },
    { href: '/artist/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/artist/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/artist/roster', label: 'Roster', icon: Users }
  ];

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

          {/* Desktop Navigation - Only show for non-admin users */}
          {!['super_admin', 'company_admin'].includes(userRole) && (
            <div className="hidden md:flex items-center space-x-3">
              {navigationItems.map((item) => (
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
            </div>
          )}

          {/* Admin users get clean header with no navigation */}
          {['super_admin', 'company_admin'].includes(userRole) && (
            <div className="hidden md:flex items-center">
              <span className="text-lg font-semibold text-gray-800">
                {userRole === 'super_admin' ? 'Super Admin' : 'Company Admin'} Dashboard
              </span>
            </div>
          )}

          {/* Right side - User menu and Mobile menu button */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell - For artists and label admins only */}
            {['artist', 'label_admin'].includes(userRole) && (
              <Link
                href={userRole === 'artist' ? '/artist/messages' : '/labeladmin/messages'}
                className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Platform Funds Display - For artists only */}
            {userRole === 'artist' && (
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

            {/* Desktop Utility Links - Not for admin users */}
            {!['super_admin', 'company_admin'].includes(userRole) && (
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
            )}

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {String(userRole || '').replace('_', ' ').toUpperCase()}
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
                    {!['super_admin', 'company_admin'].includes(userRole) && (
                      <>
                        <Link href="/artist/profile">
                          <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </div>
                        </Link>
                        <Link href="/artist/messages">
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
                        <Link href="/artist/settings">
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
              {/* Mobile Balance Display - Artists only */}
              {userRole === 'artist' && (
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
              
              {/* Navigation Items - Not for admin users */}
              {!['super_admin', 'company_admin'].includes(userRole) && navigationItems.map((item) => (
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
              
              {/* Utility Links - Not for admin users */}
              {!['super_admin', 'company_admin'].includes(userRole) && (
                <>
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
                </>
              )}
              
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="px-3 py-2">
                  <div className="text-base font-medium text-gray-800">{getDisplayName()}</div>
                  <div className="text-sm text-gray-500">{String(userRole || '').replace('_', ' ').toUpperCase()}</div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {!['super_admin', 'company_admin'].includes(userRole) && (
                    <>
                      <Link
                        href="/artist/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/artist/settings"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                    </>
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


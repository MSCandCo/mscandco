import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getUserRoleSync, getDefaultDisplayBrand, getUserBrand } from '@/lib/user-utils';
// Removed flowbite-react Dropdown - using custom dropdown instead
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
  Edit3,
} from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { useWalletBalance } from '@/hooks/useWalletBalance';

export default function RoleBasedNavigation() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [fundsData, setFundsData] = useState({
    heldEarnings: 0,
    availableForCashout: 0,
    minimumCashoutThreshold: 100,
    labelAdminEarnings: 0,
    labelAdminAvailable: 0
  });
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Use shared wallet balance hook
  const { walletBalance, isLoading: walletLoading, refreshBalance } = useWalletBalance();

  // Load profile data for Distribution Partners
  useEffect(() => {
    if (user && getUserRoleSync(user) === 'distribution_partner') {
      loadDistributionPartnerProfile();
    }
  }, [user]);

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

  const loadDistributionPartnerProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch('/api/distributionpartner/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Navigation: Distribution Partner profile loaded:', data);
        if (data.profile) {
          setProfileData(data.profile);
          console.log('Navigation: Profile data set:', data.profile);
        }
      } else {
        console.log('Navigation: Failed to load profile, response:', response.status);
      }
    } catch (error) {
      console.error('Error loading distribution partner profile:', error);
    }
  };

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
      fetch('/api/artist/profile')
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

  const getDistributionPartnerDisplayName = () => {
    console.log('Distribution Partner Display Name - profileData:', profileData);
    if (profileData?.firstName && profileData?.companyName) {
      console.log('Using profile data:', `${profileData.firstName} from ${profileData.companyName}`);
      return `${profileData.firstName} from ${profileData.companyName}`;
    }
    if (profileData?.firstName) {
      console.log('Using first name only:', `${profileData.firstName} from Code Group`);
      return `${profileData.firstName} from Code Group`;
    }
    if (user?.email) {
      // Extract first name from email for fallback
      const emailName = user.email.split('@')[0].replace(/[._]/g, ' ');
      const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      console.log('Using email fallback:', `${firstName} from Code Group`);
      return `${firstName} from Code Group`;
    }
    console.log('Using default fallback');
    return 'User from Code Group';
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



  // Add distribution partner navigation
  if (userRole === 'distribution_partner') {
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
            <div className="hidden md:block">
              <div className="ml-6 flex items-baseline space-x-4">
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

            {/* Right side - User menu and Mobile menu button */}
            <div className="flex items-center space-x-3">
              {/* Desktop User Menu */}
              <div className="hidden md:block relative" ref={dropdownRef}>
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
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
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
                <Link
                  href="/distributionpartner/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Content Management
                </Link>
                <Link
                  href="/distributionpartner/analytics"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  href="/distributionpartner/reports"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Finance
                </Link>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-gray-800">{getDistributionPartnerDisplayName()}</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/distributionpartner/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
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

  // Add super admin navigation
  if (userRole === 'super_admin') {
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
            <div className="hidden md:block">
              <div className="ml-6 flex items-baseline space-x-3">
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
                  href="/superadmin/subscriptions"
                  className={getNavLinkClasses('/superadmin/subscriptions')}
                >
                  Subscriptions
                </Link>
                <Link
                  href="/distribution/workflow"
                  className={getNavLinkClasses('/distribution/workflow')}
                >
                  Distribution
                </Link>
                <Link
                  href="/superadmin/artist-requests"
                  className={getNavLinkClasses('/superadmin/artist-requests')}
                >
                  Requests
                </Link>
              </div>
            </div>

            {/* Right side - User menu and Mobile menu button */}
            <div className="flex items-center space-x-3">
              {/* Desktop User Menu */}
              <div className="hidden md:block relative" ref={dropdownRef}>
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
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
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
                <Link
                  href="/superadmin/users"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Users
                </Link>
                <Link
                  href="/superadmin/content"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Content
                </Link>
                <Link
                  href="/superadmin/analytics"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  href="/superadmin/earnings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Earnings
                </Link>
                <Link
                  href="/superadmin/subscriptions"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Subscriptions
                </Link>
                <Link
                  href="/distribution/workflow"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Distribution
                </Link>
                <Link
                  href="/superadmin/artist-requests"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Artist Requests
                </Link>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-gray-800">Super Admin</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
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

  // Add company admin navigation
  if (userRole === 'company_admin') {
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
            <div className="hidden md:block">
              <div className="ml-6 flex items-baseline space-x-3">
                <Link
                  href="/companyadmin/users"
                  className={getNavLinkClasses('/companyadmin/users')}
                >
                  Users
                </Link>
                <Link
                  href="/companyadmin/artist-requests"
                  className={getNavLinkClasses('/companyadmin/artist-requests')}
                >
                  Requests
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
                  href="/companyadmin/analytics-management"
                  className={getNavLinkClasses('/companyadmin/analytics-management')}
                >
                  Manage Analytics
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

            {/* Right side - User menu and Mobile menu button */}
            <div className="flex items-center space-x-3">
              {/* Desktop User Menu */}
              <div className="hidden md:block relative" ref={dropdownRef}>
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
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
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
                <Link
                  href="/companyadmin/users"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Users
                </Link>
                <Link
                  href="/companyadmin/artist-requests"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Artist Requests
                </Link>
                <Link
                  href="/companyadmin/content"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Content
                </Link>
                <Link
                  href="/companyadmin/analytics"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  href="/companyadmin/earnings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Earnings
                </Link>
                <Link
                  href="/companyadmin/distribution"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Workflow
                </Link>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-gray-800">{user?.email || getDisplayName()}</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/companyadmin/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
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

  // Add label admin navigation
  if (userRole === 'label_admin') {
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
            <div className="hidden md:block">
              <div className="ml-6 flex items-baseline space-x-4">
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

            {/* Right side - Balance, User menu and Mobile menu button */}
            <div className="flex items-center space-x-3">
              {/* Label Admin Balance Display */}
              <div className="hidden sm:flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-lg">
                <Wallet className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-900">
                  {sharedFormatCurrency(fundsData.labelAdminEarnings, selectedCurrency)}
                </span>
              </div>
              
              {/* Desktop User Menu */}
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <span className="text-gray-700 hidden lg:inline">Hi, Label Admin at {getUserBrand(user)?.displayName || getUserBrand(user)?.name || 'MSC & Co'}</span>
                  <span className="text-gray-700 lg:hidden">Label Admin</span>
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
                {/* Mobile Balance Display */}
                <div className="flex items-center justify-center space-x-1 bg-gray-100 px-3 py-2 rounded-lg mx-3 mb-3">
                  <Wallet className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Balance: {sharedFormatCurrency(fundsData.labelAdminEarnings, selectedCurrency)}
                  </span>
                </div>
                
                <Link
                  href="/labeladmin/artists"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Artists
                </Link>
                <Link
                  href="/labeladmin/releases"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  All Releases
                </Link>
                <Link
                  href="/labeladmin/earnings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Earnings
                </Link>
                <Link
                  href="/labeladmin/analytics"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-gray-800">Label Admin</div>
                    <div className="text-sm text-gray-500">{getUserBrand(user)?.displayName || getUserBrand(user)?.name || 'MSC & Co'}</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/labeladmin/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/billing"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Billing
                    </Link>
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

  // Default navigation for artists and distributors
  const navigationItems = [
    { href: '/artist/releases', label: 'My Releases', icon: FileText },
    { href: '/artist/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/artist/analytics-management', label: 'Manage Analytics', icon: Edit3 },
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

          {/* Desktop Navigation */}
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

          {/* Right side - Balance, Utility links, User menu and Mobile menu button */}
          <div className="flex items-center space-x-3">
            {/* Platform Funds Display - For artists */}
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
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </div>
                    </Link>
                    <Link href="/artist/profile">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </div>
                    </Link>
                    <Link href="/billing">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Billing
                      </div>
                    </Link>
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
              {/* Mobile Balance Display */}
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
              
              {/* Navigation Items */}
              {navigationItems.map((item) => (
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
                  <Link
                    href="/artist/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/billing"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Billing
                  </Link>
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
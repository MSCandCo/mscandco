import { useUser } from '@/components/providers/SupabaseProvider';
import { Dropdown } from 'flowbite-react';
import { HiUser, HiCog6Tooth, HiArrowLeftOnRectangle } from 'react-icons/hi2';
import { HiDownload } from 'react-icons/hi';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getBrandByUser } from '@/lib/brand-config';
import { getUserRoleSync, getUserBrand } from '@/lib/user-utils';
import { useState, useEffect, useRef } from 'react';

function Header({ largeLogo = false }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const userBrand = getBrandByUser(user);
  const [profileData, setProfileData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch profile data to get first and last name
  useEffect(() => {
    if (user) {
      fetch('/api/artist/profile')
        .then(res => res.json())
        .then(data => {
          console.log('Header profile data loaded:', data);
          setProfileData(data);
        })
        .catch(err => console.error('Error fetching profile:', err));
    }
  }, [user]);

  // Close dropdown when clicking outside
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

  const openCustomerPortal = async () => {
    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: null,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create customer portal session');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  const isActivePage = (path) => {
    return router.pathname === path;
  };

  // Get nav link classes with footer color scheme
  const getNavLinkClasses = (path) => {
    const baseClasses = "transition-colors duration-200";
    if (isActivePage(path)) {
      return `${baseClasses} text-gray-800 font-semibold`;
    }
    return `${baseClasses} text-gray-400 hover:text-gray-800`;
  };

  // Simple display name - no complex logic, no async calls
  const getDisplayName = () => {
    return user?.email || 'User';
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img
                className={`${largeLogo ? 'h-32' : 'h-8 md:h-10'} w-auto cursor-pointer hover:opacity-80 transition-opacity duration-200`}
                src="/logos/msc-logo.png"
                alt="MSC & Co Logo"
                onError={(e) => {
                  e.target.src = '/logos/msc-logo.svg';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation - Full Menu */}
          <div className="hidden md:flex items-center justify-center flex-1">
            {user ? (
              <div 
                className="relative"
                ref={dropdownRef}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  className="flex items-center text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 text-white px-4 py-2 hover:bg-gray-700 transition-colors"
                  type="button"
                >
                  <span className="sr-only">Open user menu</span>
                  Hi, {(() => {
                    if (profileData?.firstName && profileData?.lastName) {
                      return `${profileData.firstName} ${profileData.lastName}`;
                    }
                    return user?.email ? String(user.email) : 'User';
                  })()}
                  <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link href={
                      getUserRoleSync(user) === 'super_admin' ? '/superadmin/dashboard' : 
                      '/dashboard'
                    }>
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <HiUser className="w-4 h-4 mr-3 text-gray-400" />
                        Dashboard
                      </div>
                    </Link>
                    <Link href="/settings/me">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <HiUser className="w-4 h-4 mr-3 text-gray-400" />
                        Profile
                      </div>
                    </Link>
                    <Link href="/download-history">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <HiDownload className="w-4 h-4 mr-3 text-gray-400" />
                        Download History
                      </div>
                    </Link>
                    <button
                      onClick={openCustomerPortal}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <HiCog6Tooth className="w-4 h-4 mr-3 text-gray-400" />
                      Billing
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => router.push('/logout')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <HiArrowLeftOnRectangle className="w-4 h-4 mr-3 text-gray-400" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link 
                  href="/pricing" 
                  className={getNavLinkClasses('/pricing')}
                >
                  Prices
                </Link>
                <Link 
                  href="/about" 
                  className={getNavLinkClasses('/about')}
                >
                  About
                </Link>
                <Link 
                  href="/support" 
                  className={getNavLinkClasses('/support')}
                >
                  Support
                </Link>
                <div className="flex items-center space-x-4 ml-8">
                  <Link href="/login" className="font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                    Login
                  </Link>
                  <Link href="/register">
                    <button
                      className="
                        bg-transparent 
                        text-[#1f2937] 
                        border 
                        border-[#1f2937] 
                        rounded-xl 
                        px-6 
                        py-2 
                        font-bold 
                        shadow 
                        transition-all 
                        duration-300 
                        hover:bg-[#1f2937] 
                        hover:text-white 
                        hover:shadow-lg 
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#1f2937]
                      "
                    >
                      Register
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Center - Just Login/Register */}
          <div className="md:hidden flex items-center justify-center flex-1">
            {user ? (
              <div 
                className="relative"
                ref={dropdownRef}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  className="flex items-center text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 text-white px-4 py-2 hover:bg-gray-700 transition-colors"
                  type="button"
                >
                  <span className="sr-only">Open user menu</span>
                  Hi, {(() => {
                    if (profileData?.firstName && profileData?.lastName) {
                      return `${profileData.firstName} ${profileData.lastName}`;
                    }
                    return user?.email ? String(user.email) : 'User';
                  })()}
                  <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link href={
                      getUserRoleSync(user) === 'super_admin' ? '/superadmin/dashboard' : 
                      '/dashboard'
                    }>
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <HiUser className="w-4 h-4 mr-3 text-gray-400" />
                        Dashboard
                      </div>
                    </Link>
                    <Link href="/settings/me">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <HiUser className="w-4 h-4 mr-3 text-gray-400" />
                        Profile
                      </div>
                    </Link>
                    <Link href="/download-history">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <HiDownload className="w-4 h-4 mr-3 text-gray-400" />
                        Download History
                      </div>
                    </Link>
                    <button
                      onClick={openCustomerPortal}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <HiCog6Tooth className="w-4 h-4 mr-3 text-gray-400" />
                      Billing
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => router.push('/logout')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <HiArrowLeftOnRectangle className="w-4 h-4 mr-3 text-gray-400" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                  Login
                </Link>
                <Link href="/register">
                  <button
                    className="
                      bg-transparent 
                      text-[#1f2937] 
                      border 
                      border-[#1f2937] 
                      rounded-xl 
                      px-4 
                      py-2 
                      font-bold 
                      shadow 
                      transition-all 
                      duration-300 
                      hover:bg-[#1f2937] 
                      hover:text-white 
                      hover:shadow-lg 
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#1f2937]
                    "
                  >
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu - Mobile Only */}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
              {!user ? (
                <>
                  <Link
                    href="/pricing"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Prices
                  </Link>
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
              ) : (
                <>
                  <Link
                    href={getUserRoleSync(user) === 'super_admin' ? '/superadmin/dashboard' : '/dashboard'}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings/me"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openCustomerPortal();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Billing
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/logout');
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

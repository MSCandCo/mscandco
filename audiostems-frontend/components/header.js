import { useAuth0 } from '@auth0/auth0-react';
import { Dropdown } from 'flowbite-react';
import { HiUser, HiCog6Tooth, HiArrowLeftOnRectangle } from 'react-icons/hi2';
import { HiDownload } from 'react-icons/hi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getBrandByUser } from '@/lib/brand-config';
import { getUserRole, getUserBrand } from '@/lib/auth0-config';
import { useState, useEffect, useRef } from 'react';

function Header({ largeLogo = false }) {
  const { user, isAuthenticated, logout } = useAuth0();
  const router = useRouter();
  const userBrand = getBrandByUser(user);
  const [profileData, setProfileData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Get nav link classes with blue active state
  const getNavLinkClasses = (path) => {
    const baseClasses = "transition-colors duration-200";
    if (isActivePage(path)) {
      return `${baseClasses} text-blue-600 font-semibold`;
    }
    return `${baseClasses} text-gray-500 hover:text-blue-600`;
  };

  // Get display name with role and label information
  const getDisplayName = () => {
    const userRole = getUserRole(user);
    const userBrandInfo = getUserBrand(user);
    
    // Get first and last name
    const firstName = profileData?.firstName || user?.given_name || '';
    const lastName = profileData?.lastName || user?.family_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Role display mapping
    const roleDisplayMap = {
      'label_admin': 'Label Admin',
      'artist': 'Artist',
      'distribution_partner': 'Distribution Partner',
      'super_admin': 'Super Admin',
      'company_admin': 'Company Admin'
    };
    
    const roleDisplay = roleDisplayMap[userRole] || 'User';
    const labelName = userBrandInfo?.displayName || userBrandInfo?.name || 'Platform';
    
    // For label admin, show "Hi First Last, Label Admin at Label Name"
    if (userRole === 'label_admin') {
      return `${fullName || user?.email || 'User'}, ${roleDisplay} at ${labelName}`;
    }
    
    // For other roles, show "Hi First Last, Role"
    if (userRole && userRole !== 'artist') {
      return `${fullName || user?.email || 'User'}, ${roleDisplay}`;
    }
    
    // For artists: show full name if available, otherwise show email
    if (userRole === 'artist') {
      return fullName || user?.email || 'User';
    }
    
    // Fallback
    return fullName || user?.email || 'User';
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <img
                className={`${largeLogo ? 'h-32' : 'h-16'} w-auto`}
                src="/logos/msc-logo.png"
                alt="MSC & Co Logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            </div>
          </Link>
          <div className="flex-1 flex justify-end items-center">
            <ul className="flex items-center">
              {!isAuthenticated && (
                <li className="px-5 py-2">
                  <Link 
                    href="/pricing" 
                    className={getNavLinkClasses('/pricing')}
                  >
                    Prices
                  </Link>
                </li>
              )}
              <li className="px-5 py-2">
                <Link 
                  href="/about" 
                  className={getNavLinkClasses('/about')}
                >
                  About
                </Link>
              </li>
              <li className="px-5 py-2">
                <Link 
                  href="/support" 
                  className={getNavLinkClasses('/support')}
                >
                  Support
                </Link>
              </li>
            </ul>
            {isAuthenticated ? (
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
                  Hi, {getDisplayName()}
                  <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link href={
                      getUserRole(user) === 'super_admin' ? '/superadmin/dashboard' : 
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
                      onClick={() => logout({ 
                        logoutParams: { 
                          returnTo: window.location.origin 
                        } 
                      })}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <HiArrowLeftOnRectangle className="w-4 h-4 mr-3 text-gray-400" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-2 flex gap-4">
                <button className="font-semibold px-4 py-2">
                  <Link href="/login">Login</Link>
                </button>
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
                    style={{
                      backgroundColor: 'transparent',
                      color: '#1f2937',
                      borderColor: '#1f2937'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#1f2937';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#1f2937';
                    }}
                  >
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

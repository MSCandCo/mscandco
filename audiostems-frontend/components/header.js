import { useAuth0 } from '@auth0/auth0-react';
import { Dropdown } from 'flowbite-react';
import { HiUser, HiDownload, HiCog6Tooth, HiArrowLeftOnRectangle } from 'react-icons/hi2';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getBrandByUser } from '@/lib/brand-config';
import { useState, useEffect } from 'react';

function Header({ largeLogo = false }) {
  const { user, isAuthenticated, logout } = useAuth0();
  const router = useRouter();
  const userBrand = getBrandByUser(user);
  const [profileData, setProfileData] = useState(null);

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

  // Get display name from profile data or fallback to email
  const getDisplayName = () => {
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    return user?.email || 'User';
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
                    className={`transition-colors duration-200 ${
                      isActivePage('/pricing') 
                        ? 'text-[#1f2937] font-semibold' 
                        : 'text-gray-500 hover:text-[#1f2937]'
                    }`}
                  >
                    Prices
                  </Link>
                </li>
              )}
              <li className="px-5 py-2">
                <Link 
                  href="/about" 
                  className={`transition-colors duration-200 ${
                    isActivePage('/about') 
                      ? 'text-[#1f2937] font-semibold' 
                      : 'text-gray-500 hover:text-[#1f2937]'
                  }`}
                >
                  About
                </Link>
              </li>
              <li className="px-5 py-2">
                <Link 
                  href="/support" 
                  className={`transition-colors duration-200 ${
                    isActivePage('/support') 
                      ? 'text-[#1f2937] font-semibold' 
                      : 'text-gray-500 hover:text-[#1f2937]'
                  }`}
                >
                  Support
                </Link>
              </li>
            </ul>
            {isAuthenticated ? (
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

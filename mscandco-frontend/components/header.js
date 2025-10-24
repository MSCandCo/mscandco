'use client'

import { useUser } from '@/components/providers/SupabaseProvider';
import { LayoutDashboard, User, Settings, LogOut, Bell, ChevronDown, Music, BarChart3, DollarSign, Users, Wallet, HelpCircle, Info, Menu, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import AdminHeader from './AdminHeader';
import { isPlatformAdmin } from '@/lib/role-config';
import { usePermissions } from '@/hooks/usePermissions';

function Header({ largeLogo = false }) {
  const { user, session, isLoading, supabase } = useUser();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  
  // Permissions
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  
  // Currency sync - loads from database and syncs across components
  const [selectedCurrency] = useCurrencySync('GBP');
  
  // Wallet balance - only for artists and label admins
  const skipWallet = !profileData?.role || (profileData?.role !== 'artist' && profileData?.role !== 'label_admin');
  const { walletBalance, isLoading: walletLoading, refreshBalance } = useWalletBalance(skipWallet);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && session) {
        try {
          // Fetch from the same API that the profile page uses
          const response = await fetch('/api/artist/profile', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });

          if (response.ok) {
            const profileData = await response.json();
            console.log('📋 Header: Profile API response:', profileData);
            
            // Map API response to expected format (same as ProfileClient)
            const mappedProfile = {
              id: profileData.id,
              first_name: profileData.firstName,
              last_name: profileData.lastName,
              email: profileData.email,
              artist_name: profileData.artistName, // This is where "Charles Dada" comes from
              role: profileData.role || 'artist',
              profile_picture_url: profileData.profile_picture_url
            };
            
            console.log('📋 Header: Mapped profile:', mappedProfile);
            console.log('📋 Header: artist_name:', mappedProfile.artist_name);
            setProfileData(mappedProfile);
            console.log('✅ Header: profileData state updated with:', mappedProfile);
          } else {
            console.error('Failed to fetch profile from API:', response.status);
            // Fallback: Use user metadata
            const roleFromMetadata = user.user_metadata?.role || user.app_metadata?.role || 'artist';
            setProfileData({ 
              role: roleFromMetadata,
              first_name: user.user_metadata?.first_name,
              last_name: user.user_metadata?.last_name,
              artist_name: user.user_metadata?.artist_name
            });
          }
        } catch (err) {
          console.error('Error fetching profile from API:', err);
          // Fallback to metadata
          const roleFromMetadata = user.user_metadata?.role || user.app_metadata?.role || 'artist';
          setProfileData({ 
            role: roleFromMetadata,
            first_name: user.user_metadata?.first_name,
            last_name: user.user_metadata?.last_name,
            artist_name: user.user_metadata?.artist_name
          });
        }
      }
    };

    fetchProfile();
  }, [user, session]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user && supabase) {
        try {
          const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('read', false)

          if (!error) {
            setUnreadCount(count || 0)
          }
        } catch (err) {
          console.error('Error fetching unread count:', err)
        }
      }
    }

    fetchUnreadCount()

    // Subscribe to notification changes for real-time count
    if (user && supabase) {
      const channel = supabase
        .channel('notification_count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchUnreadCount()
        )
        .subscribe()

      return () => supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // For the button: Artist Name first
  const getButtonDisplayName = () => {
    console.log('🔍 getButtonDisplayName - profileData:', profileData);
    console.log('🔍 artist_name:', profileData?.artist_name);
    console.log('🔍 first_name:', profileData?.first_name);
    console.log('🔍 last_name:', profileData?.last_name);
    
    // Priority 1: Artist Name
    if (profileData?.artist_name) {
      console.log('✅ Using artist_name:', profileData.artist_name);
      return profileData.artist_name
    }
    // Priority 2: First Name + Last Name
    if (profileData?.first_name && profileData?.last_name) {
      console.log('✅ Using first+last name');
      return `${profileData.first_name} ${profileData.last_name}`
    }
    // Priority 3: Formatted Role
    if (profileData?.role) {
      console.log('✅ Using role:', profileData.role);
      return profileData.role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    // Priority 4: Email username as fallback
    console.log('✅ Using email fallback');
    return user?.email?.split('@')[0] || 'User'
  }

  // For the dropdown header: First Name + Last Name first
  const getDropdownDisplayName = () => {
    // Priority 1: First Name + Last Name
    if (profileData?.first_name && profileData?.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`
    }
    // Priority 2: Artist Name
    if (profileData?.artist_name) {
      return profileData.artist_name
    }
    // Priority 3: Formatted Role
    if (profileData?.role) {
      return profileData.role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    // Priority 4: Email username as fallback
    return user?.email?.split('@')[0] || 'User'
  }

  const getInitials = () => {
    const name = getButtonDisplayName();
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileLink = () => {
    const role = profileData?.role;
    if (role === 'artist') return '/artist/profile';
    if (role === 'label_admin') return '/labeladmin/profile';
    if (role === 'super_admin') return '/admin/profile';
    return '/profile';
  };

  const getSettingsLink = () => {
    const role = profileData?.role;
    if (role === 'artist') return '/artist/settings';
    if (role === 'label_admin') return '/labeladmin/settings';
    if (role === 'super_admin') return '/admin/settings';
    return '/settings';
  };

  const getMessagesLink = () => {
    const role = profileData?.role;
    if (role === 'artist') return '/artist/messages';
    if (role === 'label_admin') return '/labeladmin/messages';
    // All admins (super_admin, company_admin, etc.) go to /admin/messages
    if (role && (role.includes('admin') || role === 'super_admin')) return '/admin/messages';
    return '/messages';
  };

  const getRoleBadgeText = () => {
    const role = profileData?.role;
    if (!role) return 'User';

    if (role === 'super_admin') return 'Super Admin';
    if (role === 'label_admin') return 'Label Admin';
    if (role === 'artist') return 'Artist';

    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRoleBadgeColor = () => {
    const role = profileData?.role;
    if (role === 'super_admin') return 'bg-red-100 text-red-800 border-red-300';
    if (role === 'label_admin') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (role === 'artist') return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Use single source of truth for role-based header routing
  // Debug logging
  console.log('🔍 Header Routing Debug:', {
    hasUser: !!user,
    hasProfileData: !!profileData,
    role: profileData?.role,
    isPlatformAdminResult: profileData?.role ? isPlatformAdmin(profileData.role) : 'N/A'
  });

  // Wait for profile data to load before deciding which header to show
  if (user && !profileData) {
    console.log('⏳ Header: Showing loading state - waiting for profileData');
    // Show loading header while profile data is being fetched
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <img
                  className={`${largeLogo ? 'h-32 w-32' : 'h-16 w-16 md:h-20 md:w-20'} object-contain`}
                  src="/logos/MSCandCoLogoV2.svg"
                  alt="MSC & Co Logo"
                />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }
  
  // If user is a platform admin, use AdminHeader
  if (user && isPlatformAdmin(profileData?.role)) {
    return <AdminHeader largeLogo={largeLogo} />;
  }

  // Otherwise, use standard header for content creators (artists, label_admin) and logged-out users
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-20">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img
                className={`${largeLogo ? 'h-32 w-32' : 'h-16 w-16 md:h-20 md:w-20'} object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200`}
                src="/logos/MSCandCoLogoV2.svg"
                alt="MSC & Co Logo"
                onError={(e) => {
                  e.target.src = '/logos/MSCandCoLogoV2.svg';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered Layout */}
          <div className="hidden md:flex items-center flex-1 ml-8">
            {user ? (
              <>
                {/* Left Spacer */}
                <div className="flex-1"></div>

                {/* Center - Navigation Links - Role Based */}
                <div className="flex items-center flex-nowrap space-x-2">
                  {profileData?.role === 'artist' && (
                    <>
                      <Link href="/artist/releases" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <FileText className="w-4 h-4" />
                        Releases
                      </Link>
                      <Link href="/artist/analytics" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </Link>
                      <Link href="/artist/earnings" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <DollarSign className="w-4 h-4" />
                        Earnings
                      </Link>
                      <Link href="/artist/roster" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <Users className="w-4 h-4" />
                        Roster
                      </Link>
                    </>
                  )}

                  {profileData?.role === 'label_admin' && (
                    <>
                      <Link href="/labeladmin/artists" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <Users className="w-4 h-4" />
                        My Artists
                      </Link>
                      <Link href="/labeladmin/releases" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <FileText className="w-4 h-4" />
                        Releases
                      </Link>
                      <Link href="/labeladmin/analytics" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </Link>
                      <Link href="/labeladmin/earnings" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <DollarSign className="w-4 h-4" />
                        Earnings
                      </Link>
                      <Link href="/labeladmin/roster" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <Users className="w-4 h-4" />
                        Roster
                      </Link>
                    </>
                  )}
                </div>

                {/* Right Spacer */}
                <div className="flex-1 min-w-8"></div>

                {/* Right Actions - Fixed position */}
                <div className="flex items-center space-x-3">
                  {/* Wallet Balance - Only for artists and label admins - Simple style */}
                  {(profileData?.role === 'artist' || profileData?.role === 'label_admin') && (
                    <button
                      onClick={refreshBalance}
                      className="flex items-center gap-2 transition-colors duration-200 text-gray-600 hover:text-gray-800 cursor-pointer"
                      title="Click to refresh wallet balance"
                    >
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {walletLoading ? '...' : formatCurrency(walletBalance, selectedCurrency)}
                      </span>
                    </button>
                  )}

                  {/* Notifications Bell */}
                  <Link href="/notifications" className="relative">
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-600 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </Link>

                  {/* About */}
                  <Link href="/about" className="transition-colors duration-200 text-gray-400 hover:text-gray-800 font-medium">
                    About
                  </Link>

                  {/* Support */}
                  <Link href="/support" className="transition-colors duration-200 text-gray-400 hover:text-gray-800 font-medium">
                    Support
                  </Link>

                  {/* User Dropdown with Role Badge */}
                  <div 
                    className="relative" 
                    ref={dropdownRef}
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      {/* Role Badge */}
                      <div className={`flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${getRoleBadgeColor()}`}>
                        {getRoleBadgeText()}
                      </div>

                      <button
                        className="flex items-center space-x-2 text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 text-white px-3 py-1.5 hover:bg-gray-700 transition-colors whitespace-nowrap"
                        type="button"
                      >
                        <span className="sr-only">Open user menu</span>
                        Hi, {getButtonDisplayName()}
                        <ChevronDown className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 pt-2 z-50">
                        <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{getDropdownDisplayName()}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                      {/* Dashboard */}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400" />
                        Dashboard
                      </Link>

                      {/* Profile */}
                      <Link
                        href={getProfileLink()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        {profileData?.role === 'label_admin' ? 'Profile (LA)' : 'Profile'}
                      </Link>

                      {/* Messages - Permission-gated */}
                      {!permissionsLoading && (
                        (profileData?.role === 'label_admin' && hasPermission('labeladmin:messages:access')) ||
                        (profileData?.role !== 'label_admin' && hasPermission('messages:access'))
                      ) && (
                        <Link
                          href={getMessagesLink()}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3 text-gray-400" />
                          Messages
                        </Link>
                      )}

                      {/* Settings */}
                      <Link
                        href={getSettingsLink()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Settings
                      </Link>

                        <hr className="my-1 border-gray-200" />

                        {/* Logout */}
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push('/logout');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                          Logout
                        </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Left Spacer for logged out */}
                <div className="flex-1"></div>
                
                {/* Right - Public Links + Auth Buttons */}
                <div className="flex items-center space-x-6 flex-1 justify-end">
                  <Link href="/pricing" className="transition-colors duration-200 text-gray-400 hover:text-gray-800 font-medium">
                    Prices
                  </Link>
                  <Link href="/about" className="transition-colors duration-200 text-gray-400 hover:text-gray-800 font-medium">
                    About
                  </Link>
                  <Link href="/support" className="transition-colors duration-200 text-gray-400 hover:text-gray-800 font-medium">
                    Support
                  </Link>
                  <Link href="/login" className="font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                    Login
                  </Link>
                  <Link href="/register">
                    <button className="bg-transparent text-[#1f2937] border border-[#1f2937] rounded-xl px-6 py-2 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937]">
                      Register
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile - Right side */}
          <div className="md:hidden flex items-center space-x-4 ml-auto">
            {user && (
              <Link href="/notifications" className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </Link>
            )}
            
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{getDropdownDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border mt-2 ${getRoleBadgeColor()}`}>
                      {getRoleBadgeText()}
                    </div>
                  </div>

                  {/* Wallet Balance - Mobile */}
                  {(profileData?.role === 'artist' || profileData?.role === 'label_admin') && (
                    <button
                      onClick={refreshBalance}
                      className="flex items-center gap-2 w-full py-2 text-gray-600 hover:text-gray-800"
                    >
                      <Wallet className="w-5 h-5" />
                      <span className="font-medium">
                        {walletLoading ? '...' : formatCurrency(walletBalance, selectedCurrency)}
                      </span>
                    </button>
                  )}

                  {/* Navigation Links - Role Based */}
                  {profileData?.role === 'artist' && (
                    <>
                      <Link href="/artist/releases" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <FileText className="w-5 h-5" />
                        <span>Releases</span>
                      </Link>
                      <Link href="/artist/analytics" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <BarChart3 className="w-5 h-5" />
                        <span>Analytics</span>
                      </Link>
                      <Link href="/artist/earnings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <DollarSign className="w-5 h-5" />
                        <span>Earnings</span>
                      </Link>
                      <Link href="/artist/roster" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <Users className="w-5 h-5" />
                        <span>Roster</span>
                      </Link>
                    </>
                  )}

                  {profileData?.role === 'label_admin' && (
                    <>
                      <Link href="/labeladmin/releases" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <FileText className="w-5 h-5" />
                        <span>Releases</span>
                      </Link>
                      <Link href="/labeladmin/analytics" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <BarChart3 className="w-5 h-5" />
                        <span>Analytics</span>
                      </Link>
                      <Link href="/labeladmin/earnings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <DollarSign className="w-5 h-5" />
                        <span>Earnings</span>
                      </Link>
                      <Link href="/labeladmin/roster" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <Users className="w-5 h-5" />
                        <span>Artists</span>
                      </Link>
                    </>
                  )}

                  {profileData?.role === 'super_admin' && (
                    <>
                      <Link href="/admin/usermanagement" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <Users className="w-5 h-5" />
                        <span>Users</span>
                      </Link>
                      <Link href="/admin/earningsmanagement" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <DollarSign className="w-5 h-5" />
                        <span>Earnings</span>
                      </Link>
                      <Link href="/admin/walletmanagement" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <Wallet className="w-5 h-5" />
                        <span>Wallet</span>
                      </Link>
                      <Link href="/admin/analyticsmanagement" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <BarChart3 className="w-5 h-5" />
                        <span>Analytics</span>
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                      <Info className="w-5 h-5" />
                      <span>About</span>
                    </Link>
                    <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                      <HelpCircle className="w-5 h-5" />
                      <span>Support</span>
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link href={getProfileLink()} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                      <User className="w-5 h-5" />
                      <span>{profileData?.role === 'label_admin' ? 'Profile (LA)' : 'Profile'}</span>
                    </Link>
                    <Link href={getSettingsLink()} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/logout');
                      }}
                      className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900 w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                    <DollarSign className="w-5 h-5" />
                    <span>Prices</span>
                  </Link>
                  <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                    <Info className="w-5 h-5" />
                    <span>About</span>
                  </Link>
                  <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                    <HelpCircle className="w-5 h-5" />
                    <span>Support</span>
                  </Link>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-700 hover:text-gray-900 font-semibold">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full bg-transparent text-[#1f2937] border border-[#1f2937] rounded-xl px-4 py-2 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white">
                        Register
                      </button>
                    </Link>
                  </div>
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

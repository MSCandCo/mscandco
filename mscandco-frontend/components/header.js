'use client'

import { useUser } from '@/components/providers/SupabaseProvider';
import { useRealtime } from '@/components/providers/RealtimeProvider';
import { LayoutDashboard, User, Settings, LogOut, Bell, ChevronDown, Music, BarChart3, DollarSign, Users, Wallet, HelpCircle, Info, Menu, X, FileText, Mail, Sparkles, Accessibility, GraduationCap, Leaf, Database, Shield, Target, Share2, Heart, Mic, ShoppingBag, Brain, Copyright, BookOpen, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import AdminHeader from './AdminHeader';
import { isPlatformAdmin } from '@/lib/role-config';
import { usePermissions } from '@/hooks/usePermissions';

function Header({ largeLogo = false }) {
  const { user, session, isLoading, supabase } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useRealtime(); // Use global unread count from RealtimeProvider
  const [profileData, setProfileData] = useState(null);
  const [showAccessibilityLink, setShowAccessibilityLink] = useState(false);
  const [showOpenDataLink, setShowOpenDataLink] = useState(false);
  const [showSustainabilityLink, setShowSustainabilityLink] = useState(false);
  const [showLyricsLink, setShowLyricsLink] = useState(false);
  const [showCopyrightLink, setShowCopyrightLink] = useState(false);
  const [showLearningLink, setShowLearningLink] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Permissions - memoized to prevent excessive re-renders
  const { hasPermission, loading: permissionsLoading, permissions } = usePermissions();
  
  // Memoize common permission checks to avoid re-computing on every render
  // Directly check permissions array instead of calling hasPermission to avoid function call overhead
  const hasWildcard = useMemo(() => permissions?.includes('*:*:*'), [permissions]);
  const checkPermission = useCallback((perm) => {
    if (hasWildcard) return true;
    if (permissionsLoading) return false;
    return permissions?.includes(perm) || false;
  }, [hasWildcard, permissionsLoading, permissions]);
  
  const hasArtworkPermission = useMemo(() => checkPermission('features:artwork:use'), [checkPermission]);
  const hasPlaylistsPermission = useMemo(() => checkPermission('features:playlists:use'), [checkPermission]);
  const hasSocialPermission = useMemo(() => checkPermission('features:social:use'), [checkPermission]);
  const hasFansPermission = useMemo(() => checkPermission('features:fans:use'), [checkPermission]);
  const hasPerformancesPermission = useMemo(() => checkPermission('features:performances:use'), [checkPermission]);
  const hasMerchPermission = useMemo(() => checkPermission('features:merch:use'), [checkPermission]);
  const hasAIInsightsPermission = useMemo(() => checkPermission('features:ai_insights:use'), [checkPermission]);
  const hasAccessibilityPermission = useMemo(() => checkPermission('accessibility:use'), [checkPermission]);
  const hasOpenDataPermission = useMemo(() => checkPermission('features:open_data:use'), [checkPermission]);
  const hasSustainabilityPermission = useMemo(() => checkPermission('sustainability:track'), [checkPermission]);
  const hasLyricsPermission = useMemo(() => checkPermission('features:lyrics:use'), [checkPermission]);
  const hasCopyrightPermission = useMemo(() => checkPermission('features:copyright:use'), [checkPermission]);
  const hasLearningPermission = useMemo(() => checkPermission('learning:access'), [checkPermission]);

  // Debug accessibility link visibility
  useEffect(() => {
    console.log('[Header] Accessibility Debug:', {
      hasAccessibilityPermission,
      showAccessibilityLink,
      willShowLink: hasAccessibilityPermission && showAccessibilityLink
    });
  }, [hasAccessibilityPermission, showAccessibilityLink]);

  // Currency sync - loads from database and syncs across components
  const [selectedCurrency] = useCurrencySync('GBP');
  
  // Wallet balance - only for artists and label admins
  const skipWallet = !profileData?.role || (profileData?.role !== 'artist' && profileData?.role !== 'label_admin');
  const { walletBalance, isLoading: walletLoading, refreshBalance } = useWalletBalance(skipWallet);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      // If on login page, always clear profile data
      if (pathname === '/login' || pathname === '/register') {
        setProfileData(null);
        return;
      }

      if (user && session) {
        try {
          // Fetch from the same API that the profile page uses
          const response = await fetch('/api/artist/profile', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });

          if (response.ok) {
            const profileData = await response.json();
            
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
            
            setProfileData(mappedProfile);
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
      } else {
        // Clear profile data when user logs out
        setProfileData(null);
      }
    };

    fetchProfile();
  }, [user, session, pathname]);

  // Fetch user preferences for accessibility toggle
  useEffect(() => {
    const fetchPreferences = async () => {
      if (user && session && profileData?.role) {
        try {
          let apiUrl = '/api/artist/settings/preferences';
          if (profileData.role === 'label_admin') {
            apiUrl = '/api/labeladmin/settings/preferences';
          }

          console.log('[Header] Fetching preferences from:', apiUrl);
          const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[Header] Preferences response:', data);
            console.log('[Header] Full response data:', JSON.stringify(data, null, 2));
            console.log('[Header] showAccessibilityFeatures value:', data?.data?.showAccessibilityFeatures);
            console.log('[Header] showOpenDataFeatures value:', data?.data?.showOpenDataFeatures);
            console.log('[Header] showSustainabilityFeatures value:', data?.data?.showSustainabilityFeatures);
            console.log('[Header] showLyricsFeatures value:', data?.data?.showLyricsFeatures);
            console.log('[Header] showCopyrightFeatures value:', data?.data?.showCopyrightFeatures);
            console.log('[Header] showLearningFeatures value:', data?.data?.showLearningFeatures);

            const accessVal = data?.data?.showAccessibilityFeatures || false;
            const openDataVal = data?.data?.showOpenDataFeatures || false;
            const sustVal = data?.data?.showSustainabilityFeatures || false;
            const lyricsVal = data?.data?.showLyricsFeatures || false;
            const copyrightVal = data?.data?.showCopyrightFeatures || false;
            const learningVal = data?.data?.showLearningFeatures || false;

            console.log('[Header] Setting state values:', { accessVal, openDataVal, sustVal, lyricsVal, copyrightVal, learningVal });

            setShowAccessibilityLink(accessVal);
            setShowOpenDataLink(openDataVal);
            setShowSustainabilityLink(sustVal);
            setShowLyricsLink(lyricsVal);
            setShowCopyrightLink(copyrightVal);
            setShowLearningLink(learningVal);
          } else {
            console.error('[Header] Preferences fetch failed:', response.status);
          }
        } catch (err) {
          console.error('Error fetching user preferences:', err);
        }
      }
    };

    fetchPreferences();
  }, [user, session, profileData?.role]);

  // Using global unread count from RealtimeProvider
  // RealtimeProvider handles initial fetch and realtime updates
  // This eliminates duplicate subscriptions and reduces database load

  // For the button: Artist Name first
  const getButtonDisplayName = () => {
    // Priority 1: Artist Name
    if (profileData?.artist_name) {
      return profileData.artist_name;
    }
    // Priority 2: First Name + Last Name
    if (profileData?.first_name && profileData?.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`;
    }
    // Priority 3: First Name only
    if (profileData?.first_name) {
      return profileData.first_name;
    }
    // Priority 4: Formatted Role
    if (profileData?.role) {
      return profileData.role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    // Priority 5: Email username as fallback
    if (user?.email) {
      return user.email.split('@')[0];
    }
    // Priority 6: Final fallback
    return 'User';
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

  // If on login/register page, always show logged-out header
  if (pathname === '/login' || pathname === '/register') {
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
                />
              </Link>
            </div>

            {/* Desktop Navigation - Centered Layout */}
            <div className="hidden xl:flex items-center flex-1 ml-8">
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
                {pathname !== '/login' && (
                  <Link href="/login" className="font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                    Login
                  </Link>
                )}
                {pathname !== '/register' && (
                  <Link href="/register">
                    <button className="bg-transparent text-[#1f2937] border border-[#1f2937] rounded-xl px-6 py-2 font-bold shadow transition-all duration-300 hover:bg-[#1f2937] hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937]">
                      Register
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Wait for profile data to load before deciding which header to show
  // BUT: For platform admins, use metadata as fallback to show AdminHeader immediately
  const userRoleFromMetadata = user?.user_metadata?.role || user?.app_metadata?.role
  const isPlatformAdminFromMetadata = userRoleFromMetadata && isPlatformAdmin(userRoleFromMetadata)
  const isPlatformAdminFromProfile = profileData?.role && isPlatformAdmin(profileData.role)
  
  // Show AdminHeader if user is platform admin (from metadata OR profile)
  if (user && (isPlatformAdminFromMetadata || isPlatformAdminFromProfile)) {
    return <AdminHeader largeLogo={largeLogo} />;
  }
  
  // Show loading header only if user exists but we don't know their role yet
  if (user && !profileData && !userRoleFromMetadata) {
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
          <div className="hidden xl:flex items-center flex-1 ml-8">
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
                      <Link href="/artist/roster" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <Users className="w-4 h-4" />
                        Roster
                      </Link>

                      {/* Insights Dropdown Group */}
                      <div className="relative group">
                        <button className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <BarChart3 className="w-4 h-4" />
                          Insights
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                          <div className="bg-white rounded-md shadow-lg py-1 border border-gray-200 min-w-[160px]">
                            <Link href="/artist/analytics" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                              <BarChart3 className="w-4 h-4" />
                              Analytics
                            </Link>
                            <Link href="/artist/earnings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                              <DollarSign className="w-4 h-4" />
                              Earnings
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* 🎉 PROFESSIONAL FEATURES - 7 Enterprise Features */}
                      {hasArtworkPermission && (
                        <Link href="/artist/artwork-generator" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <Sparkles className="w-4 h-4" />
                          AI Artwork
                        </Link>
                      )}
                      {hasPlaylistsPermission && (
                        <Link href="/artist/playlist-pitching" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <Target className="w-4 h-4" />
                          Playlist Pitching
                        </Link>
                      )}
                      {hasSocialPermission && (
                        <Link href="/artist/social" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <Share2 className="w-4 h-4" />
                          Social Media
                        </Link>
                      )}
                      {hasFansPermission && (
                        <Link href="/artist/fans" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <Heart className="w-4 h-4" />
                          Fan Engagement
                        </Link>
                      )}
                      {hasPerformancesPermission && (
                        <Link href="/artist/performances" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <Mic className="w-4 h-4" />
                          Performances
                        </Link>
                      )}
                      {hasMerchPermission && (
                        <Link href="/artist/merchandise" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <ShoppingBag className="w-4 h-4" />
                          Merchandise
                        </Link>
                      )}
                      {hasAIInsightsPermission && (
                        <Link href="/artist/ai-insights" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <Brain className="w-4 h-4" />
                          AI Insights
                        </Link>
                      )}

                      {/* 🌍 COMMUNITY FEATURES - Grouped in dropdown if 2+ features */}
                      {(() => {
                        const communityFeatures = [
                          hasAccessibilityPermission && showAccessibilityLink && {
                            href: '/artist/accessibility',
                            icon: Accessibility,
                            label: 'Accessibility'
                          },
                          hasSustainabilityPermission && showSustainabilityLink && {
                            href: '/artist/sustainability',
                            icon: Leaf,
                            label: 'Sustainability'
                          },
                          hasLyricsPermission && showLyricsLink && {
                            href: '/artist/lyrics-analysis',
                            icon: BookOpen,
                            label: 'Lyrics Analysis'
                          },
                          hasCopyrightPermission && showCopyrightLink && {
                            href: '/artist/copyright',
                            icon: Copyright,
                            label: 'Copyright'
                          },
                          hasLearningPermission && showLearningLink && {
                            href: '/artist/learning',
                            icon: GraduationCap,
                            label: 'Learning'
                          },
                          hasOpenDataPermission && showOpenDataLink && {
                            href: '/artist/open-data',
                            icon: Database,
                            label: 'Open Data'
                          }
                        ].filter(Boolean);

                        // If 2 or more features, show dropdown
                        if (communityFeatures.length >= 2) {
                          return (
                            <div className="relative group">
                              <button className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                                <Globe className="w-4 h-4" />
                                Community
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                                <div className="bg-white rounded-md shadow-lg py-1 border border-gray-200 min-w-[180px]">
                                  {communityFeatures.map((feature, idx) => {
                                    const Icon = feature.icon;
                                    return (
                                      <Link
                                        key={idx}
                                        href={feature.href}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                      >
                                        <Icon className="w-4 h-4" />
                                        {feature.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // If only 1 feature, show it as a single link
                        if (communityFeatures.length === 1) {
                          const feature = communityFeatures[0];
                          const Icon = feature.icon;
                          return (
                            <Link href={feature.href} className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                              <Icon className="w-4 h-4" />
                              {feature.label}
                            </Link>
                          );
                        }

                        return null;
                      })()}
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
                      <Link href="/labeladmin/roster" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                        <Users className="w-4 h-4" />
                        Roster
                      </Link>

                      {/* Insights Dropdown Group */}
                      <div className="relative group">
                        <button className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <BarChart3 className="w-4 h-4" />
                          Insights
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                          <div className="bg-white rounded-md shadow-lg py-1 border border-gray-200 min-w-[160px]">
                            <Link href="/labeladmin/analytics" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                              <BarChart3 className="w-4 h-4" />
                              Analytics
                            </Link>
                            <Link href="/labeladmin/earnings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                              <DollarSign className="w-4 h-4" />
                              Earnings
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Community Features for Label Admins */}
                      {hasCopyrightPermission && showCopyrightLink && (
                        <Link href="/labeladmin/copyright" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <Copyright className="w-4 h-4" />
                          Copyright
                        </Link>
                      )}
                      {hasLearningPermission && showLearningLink && (
                        <Link href="/labeladmin/learning" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <GraduationCap className="w-4 h-4" />
                          Learning
                        </Link>
                      )}
                      {hasOpenDataPermission && showOpenDataLink && (
                        <Link href="/labeladmin/open-data" className="flex items-center gap-2 transition-colors duration-200 text-gray-700 hover:text-gray-900 font-medium whitespace-nowrap">
                          <Database className="w-4 h-4" />
                          Open Data
                        </Link>
                      )}
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

                  {/* Apollo AI Toggle */}
                  <Link href="/ai" title="Try Apollo Intelligence">
                    <button className="p-2 text-gray-900 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group relative">
                      <Sparkles className="h-5 w-5" />
                      <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-900"></span>
                      </span>
                    </button>
                  </Link>

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
                        <span>Hi, {getButtonDisplayName() || 'User'}</span>
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

                      {/* Profile - Hidden for SuperAdmin */}
                      {profileData?.role !== 'super_admin' && (
                        <Link
                          href={getProfileLink()}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3 text-gray-400" />
                          {profileData?.role === 'label_admin' ? 'Profile (LA)' : 'Profile'}
                        </Link>
                      )}

                      {/* Messages - Available for all users */}
                      <Link
                        href={getMessagesLink()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Mail className="w-4 h-4 mr-3 text-gray-400" />
                        Messages
                      </Link>

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
          <div className="xl:hidden flex items-center space-x-2 ml-auto">
            {user && (
              <>
                {/* Apollo AI Button - Mobile */}
                <Link href="/ai" title="Try Apollo Intelligence">
                  <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors relative">
                    <Sparkles className="h-5 w-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                    </span>
                  </button>
                </Link>

                {/* Notifications Bell */}
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
              </>
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
          <div className="xl:hidden border-t border-gray-200 bg-white">
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
                      <Link href="/artist/messages" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <Mail className="w-5 h-5" />
                        <span>Messages</span>
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
                      <Link href="/labeladmin/messages" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <Mail className="w-5 h-5" />
                        <span>Messages</span>
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
                    <Link href="/ai" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-purple-600 hover:text-purple-700 font-semibold">
                      <Sparkles className="w-5 h-5" />
                      <span>Apollo AI</span>
                    </Link>
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
                    {/* Profile - Hidden for SuperAdmin */}
                    {profileData?.role !== 'super_admin' && (
                      <Link href={getProfileLink()} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-gray-700 hover:text-gray-900">
                        <User className="w-5 h-5" />
                        <span>{profileData?.role === 'label_admin' ? 'Profile (LA)' : 'Profile'}</span>
                      </Link>
                    )}
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

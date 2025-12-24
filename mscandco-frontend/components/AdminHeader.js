'use client'

import { useUser } from '@/components/providers/SupabaseProvider';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, User, Settings, LogOut, Bell, ChevronDown, Users, Shield, BarChart3, DollarSign, Database, Music, Inbox, FileText, MessageSquare, Eye, Wallet, TrendingUp, PieChart, Server, AlertTriangle, Activity, HardDrive, Globe, Lock, Zap, Mail, Book, Accessibility, GraduationCap, Leaf, Sparkles, Target, Share2, Heart, Mic, ShoppingBag, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import usePermissions from '@/hooks/usePermissions';
import { isPlatformAdmin, isContentCreator } from '@/lib/role-config';

function AdminHeader({ largeLogo = false }) {
  const { user } = useUser();
  const router = useRouter();
  const { hasPermission, permissions, loading: permissionsLoading } = usePermissions();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openNavDropdown, setOpenNavDropdown] = useState(null);
  const [showAccessibilityFeatures, setShowAccessibilityFeatures] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Get user display name from metadata
  const getDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    // Fallback to role badge text if no name
    return getRoleBadgeText();
  };

  // Get role from metadata
  const getRole = () => {
    return user?.user_metadata?.role || user?.app_metadata?.role || 'super_admin';
  };

  // Get role badge text
  const getRoleBadgeText = () => {
    const role = getRole();
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'company_admin') return 'Company Admin';
    if (role === 'distribution_partner') return 'Distribution Partner';
    if (role === 'analytics_admin') return 'Analytics Admin';
    if (role === 'requests_admin') return 'Request Manager';
    if (role === 'labeladmin') return 'Label Admin';
    
    // Generic fallback: format role name (e.g., "some_role" -> "Some Role")
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get role badge color - matching user management style
  const getRoleBadgeColor = () => {
    const role = getRole();
    
    // Get first 2 characters and generate a color based on them
    const firstTwo = role ? role.substring(0, 2).toLowerCase() : 'xx';
    
    // Color palette matching user management (no borders, cleaner look)
    const colorPalette = {
      'ar': 'bg-purple-100 text-purple-800',      // artist
      'la': 'bg-cyan-100 text-cyan-800',           // labeladmin
      'ad': 'bg-orange-100 text-orange-800',       // admin
      'su': 'bg-red-100 text-red-800',             // super_admin
      'di': 'bg-emerald-100 text-emerald-800',     // distribution_partner
      'fi': 'bg-pink-100 text-pink-800',           // financial_admin
      're': 'bg-indigo-100 text-indigo-800',       // requests_admin
      'co': 'bg-teal-100 text-teal-800',           // company_admin
      'an': 'bg-orange-100 text-orange-800',       // analytics_admin
    };
    
    return colorPalette[firstTwo] || 'bg-gray-100 text-gray-800';
  };

  // Open navigation dropdown on hover
  const openNavDropdownOnHover = (dropdownName) => {
    setOpenNavDropdown(dropdownName);
  };

  // Close navigation dropdown on mouse leave
  const closeNavDropdown = () => {
    setOpenNavDropdown(null);
  };

  // Simple permission check - if user is super_admin or has wildcard, show everything
  // Memoize role check to avoid recalculating on every render
  const userRole = useMemo(() => getRole(), [user]);
  const isSuperAdmin = useMemo(() => userRole === 'super_admin', [userRole]);
  const hasWildcard = useMemo(() => permissions?.includes('*:*:*'), [permissions]);
  const showAll = useMemo(() => isSuperAdmin || hasWildcard, [isSuperAdmin, hasWildcard]);
  
  // Distribution Partner: Only show Distribution section in header navigation
  const isDistributionPartner = useMemo(() => userRole === 'distribution_partner', [userRole]);
  
  // Check if user is artist or label_admin
  const isArtistOrLabelAdmin = useMemo(() => {
    return userRole === 'artist' || userRole === 'labeladmin';
  }, [userRole]);

  // Fetch user's accessibility preference - only fetch once
  useEffect(() => {
    if (isArtistOrLabelAdmin && user?.id) {
      let mounted = true;
      const fetchAccessibilityPreference = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('user_profiles')
            .select('show_accessibility_features')
            .eq('id', user.id)
            .single();
          
          if (mounted && !error && data) {
            setShowAccessibilityFeatures(data.show_accessibility_features || false);
          }
        } catch (error) {
          console.error('Error fetching accessibility preference:', error);
        }
      };
      fetchAccessibilityPreference();
      
      return () => {
        mounted = false;
      };
    } else {
      // Reset to false if not artist/labeladmin
      setShowAccessibilityFeatures(false);
    }
  }, [isArtistOrLabelAdmin, user?.id]);

  // Memoize permission checks - if showAll is true, skip all permission checks
  // This dramatically improves performance for superadmin users
  const checkPermission = useCallback((perm) => {
    if (showAll) return true;
    if (permissionsLoading) return false;
    return hasPermission(perm);
  }, [showAll, permissionsLoading, hasPermission, permissions]);

  // Count visible items in each dropdown - memoized for performance
  const userAccessItems = useMemo(() => {
    if (showAll) return 5; // All items visible for superadmin
    return [
      checkPermission('analytics:requests:read'),
      checkPermission('users_access:user_management:read'),
      checkPermission('users_access:permissions_roles:read'),
      checkPermission('user:impersonate'),
      checkPermission('users_access:master_roster:read')
    ].filter(Boolean).length;
  }, [showAll, checkPermission]);

  // Combined Insights (Analytics + Finance)
  const insightsItems = useMemo(() => {
    if (showAll) return 5; // 2 analytics + 3 finance
    return [
      checkPermission('analytics:analytics_management:read'),
      checkPermission('analytics:platform_analytics:read'),
      checkPermission('finance:earnings_management:read'),
      checkPermission('finance:wallet_management:read'),
      checkPermission('finance:split_configuration:read')
    ].filter(Boolean).length;
  }, [showAll, checkPermission]);

  // Community Empowerment dropdown (Copyright, Accessibility, Sustainability, Skills, Open Data)
  // For artists/label_admins: Show their own accessibility page if they've enabled accessibility features
  // For admins/superadmins: Show based on permissions
  const communityItems = useMemo(() => {
    if (showAll) return 5; // All community items visible for superadmin
    if (isArtistOrLabelAdmin && showAccessibilityFeatures) {
      // Artists/Label Admins: Only show their own accessibility page (1 item = standalone, not dropdown)
      return 1;
    }
    // For admins: Check permissions
    return [
      checkPermission('copyright:manage'),
      checkPermission('accessibility:manage'),
      checkPermission('sustainability:manage'),
      checkPermission('learning:manage'),
      checkPermission('opendata:manage')
    ].filter(Boolean).length;
  }, [showAll, checkPermission, isArtistOrLabelAdmin, showAccessibilityFeatures]);

  const systemsItems = useMemo(() => {
    if (showAll) return 13; // All systems items visible (excluding community items)
    return [
      checkPermission('systems:access'),
      checkPermission('systems:errors:view'),
      checkPermission('systems:ratelimit:view'),
      checkPermission('systems:logs:view'),
      checkPermission('systems:backups:view'),
      checkPermission('systems:uptime:view'),
      checkPermission('systems:security:view'),
      checkPermission('systems:performance:view'),
      checkPermission('systems:analytics:view'),
      checkPermission('systems:email:view'),
      checkPermission('systems:docs:view'),
      checkPermission('features:artwork:manage'),
      checkPermission('features:playlists:manage'),
      checkPermission('features:social:manage'),
      checkPermission('features:fans:manage'),
      checkPermission('features:performances:manage'),
      checkPermission('features:merch:manage')
    ].filter(Boolean).length;
  }, [showAll, checkPermission]);

  const distributionItems = useMemo(() => {
    if (showAll) return 3;
    return [
      checkPermission('distribution:read:any'),
      checkPermission('revenue:read'),
      checkPermission('content:asset_library:read')
    ].filter(Boolean).length;
  }, [showAll, checkPermission]);

  // Count total navigation items (for distribution partner, exclude hidden sections)
  const totalNavItems = useMemo(() => {
    return isDistributionPartner 
      ? distributionItems 
      : userAccessItems + insightsItems + communityItems + systemsItems + distributionItems;
  }, [isDistributionPartner, userAccessItems, insightsItems, communityItems, systemsItems, distributionItems]);
  
  // If 5 or fewer items total, show all as standalone (no dropdowns)
  const forceStandalone = useMemo(() => totalNavItems <= 5, [totalNavItems]);

  // Count user dropdown items (excluding Dashboard and Logout which are always visible)
  const userDropdownItems = useMemo(() => {
    if (showAll) return 4; // Profile, Platform Messages, Messages, Settings
    return [
      true, // Profile - always visible
      checkPermission('platform_messages:read'),
      checkPermission('messages:read'),
      checkPermission('settings:read')
    ].filter(Boolean).length;
  }, [showAll, checkPermission]);

  // Helper to get ALL visible items for each section - memoized for performance
  const getAllUserAccessItems = useMemo(() => {
    if (showAll) {
      return [
        { href: '/admin/requests', label: 'Requests', icon: FileText },
        { href: '/admin/usermanagement', label: 'User Management', icon: Users },
        { href: '/superadmin/permissionsroles', label: 'Permissions & Roles', icon: Shield },
        { href: '/superadmin/ghostlogin', label: 'Ghost Mode', icon: Eye },
        { href: '/admin/masterroster', label: 'Master Roster', icon: Music }
      ];
    }
    const items = [];
    if (checkPermission('analytics:requests:read')) items.push({ href: '/admin/requests', label: 'Requests', icon: FileText });
    if (checkPermission('users_access:user_management:read')) items.push({ href: '/admin/usermanagement', label: 'User Management', icon: Users });
    if (checkPermission('users_access:permissions_roles:read')) items.push({ href: '/superadmin/permissionsroles', label: 'Permissions & Roles', icon: Shield });
    if (checkPermission('user:impersonate')) items.push({ href: '/superadmin/ghostlogin', label: 'Ghost Mode', icon: Eye });
    if (checkPermission('users_access:master_roster:read')) items.push({ href: '/admin/masterroster', label: 'Master Roster', icon: Music });
    return items;
  }, [showAll, checkPermission]);

  // Community Empowerment items
  // For artists: Show their own accessibility page
  // For label_admins: Show their own accessibility page (with linked artists data)
  // For admins: Show based on permissions
  const getAllCommunityItems = useMemo(() => {
    const items = [];
    
    // Artists/Label Admins: Show their own accessibility page when enabled
    if (isArtistOrLabelAdmin && showAccessibilityFeatures) {
      if (userRole === 'artist') {
        items.push({ href: '/artist/accessibility', label: 'Accessibility', icon: Accessibility });
      } else if (userRole === 'labeladmin') {
        items.push({ href: '/labeladmin/accessibility', label: 'Accessibility', icon: Accessibility });
      }
      return items; // Return early - only show accessibility page for artists/label_admins
    }
    
    // Admins/SuperAdmins: Show based on permissions
    const shouldShowAll = showAll;
    
    if (shouldShowAll || checkPermission('copyright:manage')) {
      items.push({ href: '/admin/copyright', label: 'Copyright Management', icon: Shield });
    }
    if (shouldShowAll || checkPermission('accessibility:manage')) {
      items.push({ href: '/admin/accessibility', label: 'Accessibility Admin', icon: Accessibility });
    }
    if (shouldShowAll || checkPermission('sustainability:manage')) {
      items.push({ href: '/admin/sustainability', label: 'Carbon Management', icon: Leaf });
    }
    if (shouldShowAll || checkPermission('learning:manage')) {
      items.push({ href: '/admin/skills', label: 'Skills Management', icon: GraduationCap });
    }
    if (shouldShowAll || checkPermission('opendata:manage')) {
      items.push({ href: '/admin/open-data', label: 'Open Data Admin', icon: Database });
    }
    return items;
  }, [showAll, checkPermission, isArtistOrLabelAdmin, showAccessibilityFeatures, userRole]);

  // Combined Insights items (Analytics + Finance + Touring)
  const getAllInsightsItems = useMemo(() => {
    const items = [];
    
    // Analytics section
    if (showAll || checkPermission('analytics:analytics_management:read')) {
      items.push({ href: '/admin/analyticsmanagement', label: 'Analytics Management', icon: BarChart3 });
    }
    if (showAll || checkPermission('analytics:platform_analytics:read')) {
      items.push({ href: '/admin/platformanalytics', label: 'Platform Analytics', icon: TrendingUp });
    }
    
    // Separator (if we have both analytics and finance items)
    const hasAnalytics = items.length > 0;
    
    // Finance section
    if (showAll || checkPermission('finance:earnings_management:read')) {
      items.push({ href: '/admin/earningsmanagement', label: 'Earnings Management', icon: DollarSign });
    }
    if (showAll || checkPermission('finance:wallet_management:read')) {
      items.push({ href: '/admin/walletmanagement', label: 'Wallet Management', icon: Wallet });
    }
    if (showAll || checkPermission('finance:split_configuration:read')) {
      items.push({ href: '/admin/splitconfiguration', label: 'Split Configuration', icon: PieChart });
    }
    
    // Touring section - Permission-based access
    // For super_admin and company_admin, showAll is true, so they'll see it
    // For custom roles with touring permissions, they'll see it via permission check
    if (showAll || checkPermission('touring:admin:read') || checkPermission('touring:admin:manage')) {
      items.push({ href: '/admin/touring', label: 'Touring Administration', icon: Music });
    }
    
    return items;
  }, [showAll, checkPermission]);

  const getAllSystemsItems = useMemo(() => {
    if (showAll) {
      return [
        { href: '/admin/systems', label: 'Systems Overview', icon: Server },
        { href: '/admin/systems/errors', label: 'Error Tracking', icon: AlertTriangle },
        { href: '/admin/systems/ratelimit', label: 'Rate Limiting', icon: Zap },
        { href: '/admin/systems/logs', label: 'Logs', icon: FileText },
        { href: '/admin/systems/backups', label: 'Backups', icon: HardDrive },
        { href: '/admin/systems/uptime', label: 'Uptime', icon: Activity },
        { href: '/admin/systems/security', label: 'Security', icon: Lock },
        { href: '/admin/systems/performance', label: 'Performance', icon: Globe },
        { href: '/admin/systems/analytics', label: 'User Analytics', icon: BarChart3 },
        { href: '/admin/systems/email', label: 'Email System', icon: Mail },
        { href: '/admin/systems/docs', label: 'Documentation', icon: Book },
        { href: '/admin/artwork-generator', label: 'AI Artwork (Admin)', icon: Sparkles },
        { href: '/admin/playlist-pitching', label: 'Playlist Campaigns', icon: Target },
        { href: '/admin/social-media', label: 'Social Media Admin', icon: Share2 },
        { href: '/admin/fans', label: 'Fan Analytics', icon: Heart },
        { href: '/admin/performances', label: 'Performance Analytics', icon: Mic },
        { href: '/admin/merch', label: 'Merch Management', icon: ShoppingBag }
      ];
    }
    const items = [];
    if (checkPermission('systems:access')) items.push({ href: '/admin/systems', label: 'Systems Overview', icon: Server });
    if (checkPermission('systems:errors:view')) items.push({ href: '/admin/systems/errors', label: 'Error Tracking', icon: AlertTriangle });
    if (checkPermission('systems:ratelimit:view')) items.push({ href: '/admin/systems/ratelimit', label: 'Rate Limiting', icon: Zap });
    if (checkPermission('systems:logs:view')) items.push({ href: '/admin/systems/logs', label: 'Logs', icon: FileText });
    if (checkPermission('systems:backups:view')) items.push({ href: '/admin/systems/backups', label: 'Backups', icon: HardDrive });
    if (checkPermission('systems:uptime:view')) items.push({ href: '/admin/systems/uptime', label: 'Uptime', icon: Activity });
    if (checkPermission('systems:security:view')) items.push({ href: '/admin/systems/security', label: 'Security', icon: Lock });
    if (checkPermission('systems:performance:view')) items.push({ href: '/admin/systems/performance', label: 'Performance', icon: Globe });
    if (checkPermission('systems:analytics:view')) items.push({ href: '/admin/systems/analytics', label: 'User Analytics', icon: BarChart3 });
    if (checkPermission('systems:email:view')) items.push({ href: '/admin/systems/email', label: 'Email System', icon: Mail });
    if (checkPermission('systems:docs:view')) items.push({ href: '/admin/systems/docs', label: 'Documentation', icon: Book });
    if (checkPermission('features:artwork:manage')) items.push({ href: '/admin/artwork-generator', label: 'AI Artwork (Admin)', icon: Sparkles });
    if (checkPermission('features:playlists:manage')) items.push({ href: '/admin/playlist-pitching', label: 'Playlist Campaigns', icon: Target });
    if (checkPermission('features:social:manage')) items.push({ href: '/admin/social-media', label: 'Social Media Admin', icon: Share2 });
    if (checkPermission('features:fans:manage')) items.push({ href: '/admin/fans', label: 'Fan Analytics', icon: Heart });
    if (checkPermission('features:performances:manage')) items.push({ href: '/admin/performances', label: 'Performance Analytics', icon: Mic });
    if (checkPermission('features:merch:manage')) items.push({ href: '/admin/merch', label: 'Merch Management', icon: ShoppingBag });
    return items;
  }, [showAll, checkPermission]);

  const getAllDistributionItems = useMemo(() => {
    if (showAll) {
      return [
        { href: '/distribution/hub', label: 'Distribution Hub', icon: Inbox },
        { href: '/distribution/revenue', label: 'Revenue Reporting', icon: BarChart3 },
        { href: '/admin/assetlibrary', label: 'Asset Library', icon: Database }
      ];
    }
    const items = [];
    if (checkPermission('distribution:read:any')) items.push({ href: '/distribution/hub', label: 'Distribution Hub', icon: Inbox });
    if (checkPermission('revenue:read')) items.push({ href: '/distribution/revenue', label: 'Revenue Reporting', icon: BarChart3 });
    if (checkPermission('content:asset_library:read')) items.push({ href: '/admin/assetlibrary', label: 'Asset Library', icon: Database });
    return items;
  }, [showAll, checkPermission]);

  // Helper to get first visible item for standalone links (when not in forceStandalone mode)
  const getFirstUserAccessItem = useMemo(() => getAllUserAccessItems[0] || null, [getAllUserAccessItems]);
  const getFirstInsightsItem = useMemo(() => getAllInsightsItems[0] || null, [getAllInsightsItems]);
  const getFirstCommunityItem = useMemo(() => getAllCommunityItems[0] || null, [getAllCommunityItems]);
  const getFirstSystemsItem = useMemo(() => getAllSystemsItems[0] || null, [getAllSystemsItems]);
  const getFirstDistributionItem = useMemo(() => getAllDistributionItems[0] || null, [getAllDistributionItems]);

  // Don't block on permissions loading - render header immediately
  // For superadmin users, showAll is true anyway, so no need to wait
  // For other users, links will show/hide as permissions load

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img
                className={`${largeLogo ? 'h-32 w-32' : 'h-16 w-16 md:h-20 md:w-20'} object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200`}
                src="/logos/MSCandCoLogoV2.svg"
                alt="MSC & Co Logo"
              />
            </Link>
          </div>

          {/* Mobile Menu Button - Shows below xl2 breakpoint (1440px) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl2:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Navigation - Admin Dropdowns */}
          <div className="hidden xl2:flex items-center flex-1 ml-6">
            {/* Navigation Dropdowns - All wrapped in one ref */}
            <div className="flex items-center flex-1" ref={navDropdownRef}>
              
              {/* User & Access - Standalone if 1 item OR forceStandalone mode, dropdown if 2+ */}
              {/* Hidden for Distribution Partners */}
              {!isDistributionPartner && forceStandalone && userAccessItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllUserAccessItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })
              ) : !isDistributionPartner && userAccessItems === 1 && getFirstUserAccessItem ? (
                // Single item: Show as standalone link
                (() => {
                  const item = getFirstUserAccessItem;
                  const Icon = item.icon;
                  return (
                    <Link 
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })()
              ) : !isDistributionPartner && userAccessItems > 1 ? (
              <div 
                className="relative"
                onMouseEnter={() => openNavDropdownOnHover('user-access')}
                onMouseLeave={closeNavDropdown}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  <Users className="w-4 h-4" />
                  User & Access
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openNavDropdown === 'user-access' && (
                  <div className="absolute left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {checkPermission('analytics:requests:read') && (
                      <Link href="/admin/requests" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FileText className="w-4 h-4 mr-3" />
                        Requests
                      </Link>
                    )}
                    {checkPermission('users_access:user_management:read') && (
                      <Link href="/admin/usermanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Users className="w-4 h-4 mr-3" />
                        User Management
                      </Link>
                    )}
                    {checkPermission('users_access:permissions_roles:read') && (
                      <Link href="/superadmin/permissionsroles" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Shield className="w-4 h-4 mr-3" />
                        Permissions & Roles
                      </Link>
                    )}
                    {checkPermission('user:impersonate') && (
                      <Link href="/superadmin/ghostlogin" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Eye className="w-4 h-4 mr-3" />
                        Ghost Mode
                      </Link>
                    )}
                    {checkPermission('users_access:master_roster:read') && (
                      <Link href="/admin/masterroster" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Music className="w-4 h-4 mr-3" />
                        Master Roster
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>
              ) : null}

              {/* Insights - Combined Analytics & Finance */}
              {/* Hidden for Distribution Partners */}
              {!isDistributionPartner && forceStandalone && insightsItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllInsightsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })
              ) : !isDistributionPartner && insightsItems === 1 ? (
                // Single item: Show as standalone link
                (() => {
                  const item = getFirstInsightsItem;
                  const Icon = item.icon;
                  return (
                    <Link 
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })()
              ) : !isDistributionPartner && insightsItems > 1 ? (
              <div 
                className="relative"
                onMouseEnter={() => openNavDropdownOnHover('insights')}
                onMouseLeave={closeNavDropdown}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  <TrendingUp className="w-4 h-4" />
                  Insights
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openNavDropdown === 'insights' && (
                  <div className="absolute left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {/* Analytics Section */}
                    {checkPermission('analytics:analytics_management:read') && (
                      <Link href="/admin/analyticsmanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Analytics Management
                      </Link>
                    )}
                    {checkPermission('analytics:platform_analytics:read') && (
                      <Link href="/admin/platformanalytics" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <TrendingUp className="w-4 h-4 mr-3" />
                        Platform Analytics
                      </Link>
                    )}
                    
                    {/* Separator if we have both analytics and finance items */}
                    {(checkPermission('analytics:analytics_management:read') || checkPermission('analytics:platform_analytics:read')) &&
                     (checkPermission('finance:earnings_management:read') || checkPermission('finance:wallet_management:read') || checkPermission('finance:split_configuration:read')) && (
                      <div className="border-t border-gray-200 my-1"></div>
                    )}
                    
                    {/* Finance Section */}
                    {checkPermission('finance:earnings_management:read') && (
                      <Link href="/admin/earningsmanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <DollarSign className="w-4 h-4 mr-3" />
                        Earnings Management
                      </Link>
                    )}
                    {checkPermission('finance:wallet_management:read') && (
                      <Link href="/admin/walletmanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Wallet className="w-4 h-4 mr-3" />
                        Wallet Management
                      </Link>
                    )}
                    {checkPermission('finance:split_configuration:read') && (
                      <Link href="/admin/splitconfiguration" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <PieChart className="w-4 h-4 mr-3" />
                        Split Configuration
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>
              ) : null}

              {/* Community - Combined Community Empowerment Features */}
              {/* Hidden for Distribution Partners */}
              {!isDistributionPartner && forceStandalone && communityItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllCommunityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })
              ) : !isDistributionPartner && communityItems === 1 ? (
                // Single item: Show as standalone link
                (() => {
                  const item = getFirstCommunityItem;
                  const Icon = item.icon;
                  return (
                    <Link 
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })()
              ) : !isDistributionPartner && communityItems > 1 ? (
              <div 
                className="relative"
                onMouseEnter={() => openNavDropdownOnHover('community')}
                onMouseLeave={closeNavDropdown}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  <Heart className="w-4 h-4" />
                  Community
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openNavDropdown === 'community' && (
                  <div className="absolute left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {getAllCommunityItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link 
                          key={item.href}
                          href={item.href} 
                          onClick={() => setOpenNavDropdown(null)} 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Link>
                      );
                    })}
                    </div>
                  </div>
                )}
              </div>
              ) : null}

              {/* Distribution - Standalone if 1 item OR forceStandalone mode, dropdown if 2+ */}
              {forceStandalone && distributionItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllDistributionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })
              ) : distributionItems === 1 ? (
                // Single item: Show as standalone link
                (() => {
                  const item = getFirstDistributionItem;
                  const Icon = item.icon;
                  return (
                    <Link 
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })()
              ) : distributionItems > 1 ? (
              <div 
                className="relative"
                onMouseEnter={() => openNavDropdownOnHover('distribution')}
                onMouseLeave={closeNavDropdown}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  <Music className="w-4 h-4" />
                  Distribution
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openNavDropdown === 'distribution' && (
                  <div className="absolute left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {checkPermission('distribution:read:any') && (
                      <Link href="/distribution/hub" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Inbox className="w-4 h-4 mr-3" />
                        Distribution Hub
                      </Link>
                    )}
                    {checkPermission('revenue:read') && (
                      <Link href="/distribution/revenue" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FileText className="w-4 h-4 mr-3" />
                        Revenue Reporting
                      </Link>
                    )}
                    {checkPermission('content:asset_library:read') && (
                      <Link href="/admin/assetlibrary" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Database className="w-4 h-4 mr-3" />
                        Asset Library
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>
              ) : null}

              {/* Systems - Standalone if 1 item OR forceStandalone mode, dropdown if 2+ */}
              {/* Hidden for Distribution Partners */}
              {!isDistributionPartner && forceStandalone && systemsItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllSystemsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })
              ) : !isDistributionPartner && systemsItems === 1 ? (
                // Single item: Show as standalone link
                (() => {
                  const item = getFirstSystemsItem;
                  const Icon = item.icon;
                  return (
                    <Link 
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })()
              ) : !isDistributionPartner && systemsItems > 1 ? (
              <div 
                className="relative"
                onMouseEnter={() => openNavDropdownOnHover('systems')}
                onMouseLeave={closeNavDropdown}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  <Server className="w-4 h-4" />
                  Systems
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openNavDropdown === 'systems' && (
                  <div className="absolute left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {checkPermission('systems:access') && (
                      <Link href="/admin/systems" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Server className="w-4 h-4 mr-3" />
                        Systems Overview
                      </Link>
                    )}
                    {checkPermission('systems:errors:view') && (
                      <Link href="/admin/systems/errors" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <AlertTriangle className="w-4 h-4 mr-3" />
                        Error Tracking
                      </Link>
                    )}
                    {checkPermission('systems:ratelimit:view') && (
                      <Link href="/admin/systems/ratelimit" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Zap className="w-4 h-4 mr-3" />
                        Rate Limiting
                      </Link>
                    )}
                    {checkPermission('systems:logs:view') && (
                      <Link href="/admin/systems/logs" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FileText className="w-4 h-4 mr-3" />
                        Logs
                      </Link>
                    )}
                    {checkPermission('systems:backups:view') && (
                      <Link href="/admin/systems/backups" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <HardDrive className="w-4 h-4 mr-3" />
                        Backups
                      </Link>
                    )}
                    {checkPermission('systems:uptime:view') && (
                      <Link href="/admin/systems/uptime" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Activity className="w-4 h-4 mr-3" />
                        Uptime
                      </Link>
                    )}
                    {checkPermission('systems:security:view') && (
                      <Link href="/admin/systems/security" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Lock className="w-4 h-4 mr-3" />
                        Security
                      </Link>
                    )}
                    {checkPermission('systems:performance:view') && (
                      <Link href="/admin/systems/performance" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Globe className="w-4 h-4 mr-3" />
                        Performance
                      </Link>
                    )}
                    {checkPermission('systems:analytics:view') && (
                      <Link href="/admin/systems/analytics" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <BarChart3 className="w-4 h-4 mr-3" />
                        User Analytics
                      </Link>
                    )}
                    {checkPermission('systems:email:view') && (
                      <Link href="/admin/systems/email" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Mail className="w-4 h-4 mr-3" />
                        Email System
                      </Link>
                    )}
                    {checkPermission('systems:docs:view') && (
                      <Link href="/admin/systems/docs" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Book className="w-4 h-4 mr-3" />
                        Documentation
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>
              ) : null}

            </div>

            {/* Right Side - Bell, About, Support, Badge, User */}
            <div className="hidden xl2:flex items-center gap-3 ml-auto">
              {/* Notifications Bell - Permission required */}
              {checkPermission('notifications:read') && (
                <Link href="/notifications" className="relative">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="h-5 w-5" />
                  </button>
                </Link>
              )}

              {/* About */}
              <Link href="/about" className="transition-colors duration-200 text-gray-400 hover:text-gray-800 font-medium whitespace-nowrap">
                About
              </Link>

              {/* Support */}
              <Link href="/support" className="transition-colors duration-200 text-gray-400 hover:text-gray-800 font-medium whitespace-nowrap">
                Support
              </Link>

              {/* Role Badge + User Dropdown */}
              <div 
                className="relative" 
                ref={userDropdownRef}
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <div className="flex items-center gap-2">
                  {/* Role Badge */}
                  <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded whitespace-nowrap ${getRoleBadgeColor()}`}>
                    {getRoleBadgeText()}
                  </div>

                  <button
                    className="flex items-center gap-2 text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 text-white px-4 py-2 hover:bg-gray-700 transition-colors whitespace-nowrap"
                    type="button"
                  >
                    <span className="sr-only">Open user menu</span>
                    Hi, {getDisplayName()}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* Dashboard - Always visible */}
                    <Link href="/dashboard" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400" />
                      Dashboard
                    </Link>

                    {/* Profile - Hide for superadmin */}
                    {getRole() !== 'super_admin' && (
                      <Link href="/admin/profile" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        Profile
                      </Link>
                    )}

                    {/* Platform Messages - Permission required */}
                    {checkPermission('platform_messages:read') && (
                      <Link href="/superadmin/messages" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <MessageSquare className="w-4 h-4 mr-3 text-gray-400" />
                        Platform Messages
                      </Link>
                    )}

                    {/* Messages - Permission required */}
                    {checkPermission('messages:read') && (
                      <Link href="/admin/messages" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <MessageSquare className="w-4 h-4 mr-3 text-gray-400" />
                        Messages
                      </Link>
                    )}

                    {/* Settings - Permission required */}
                    {checkPermission('settings:read') && (
                      <Link href="/admin/settings" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Settings
                      </Link>
                    )}

                    <hr className="my-1 border-gray-200" />

                    {/* Logout - Always visible */}
                    <button
                      onClick={async () => {
                        setIsUserDropdownOpen(false)
                        // Use force logout utility for comprehensive cleanup
                        const { forceLogout } = await import('@/lib/auth/logout-utils')
                        await forceLogout({ redirectTo: '/login', silent: false })
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
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="xl2:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {/* User & Access Items */}
                {!isDistributionPartner && getAllUserAccessItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Insights Items */}
                {getAllInsightsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Community Items */}
                {getAllCommunityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Distribution Items */}
                {getAllDistributionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Systems Items */}
                {getAllSystemsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Mobile User Menu */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  {getRole() !== 'super_admin' && (
                    <Link
                      href="/admin/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Profile
                    </Link>
                  )}
                  {checkPermission('settings:read') && (
                    <Link
                      href="/admin/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      // Use force logout utility for comprehensive cleanup
                      const { forceLogout } = await import('@/lib/auth/logout-utils');
                      await forceLogout({ redirectTo: '/login', silent: false });
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;

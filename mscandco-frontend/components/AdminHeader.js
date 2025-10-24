'use client'

import { useUser } from '@/components/providers/SupabaseProvider';
import { LayoutDashboard, User, Settings, LogOut, Bell, ChevronDown, Users, Shield, BarChart3, DollarSign, Database, Music, Inbox, FileText, MessageSquare, Eye, Wallet, TrendingUp, PieChart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import usePermissions from '@/hooks/usePermissions';
import { isPlatformAdmin, isContentCreator } from '@/lib/role-config';

function AdminHeader({ largeLogo = false }) {
  const { user } = useUser();
  const router = useRouter();
  const { hasPermission, permissions, loading: permissionsLoading } = usePermissions();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openNavDropdown, setOpenNavDropdown] = useState(null);
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

  // Debug permissions on change
  useEffect(() => {
    console.log('🔑 AdminHeader - Permissions updated:', permissions);
    console.log('🔑 AdminHeader - Permissions loading:', permissionsLoading);
    console.log('🔑 AdminHeader - Has wildcard?', permissions?.includes('*:*:*'));
  }, [permissions, permissionsLoading]);

  // Simple permission check - if user is super_admin or has wildcard, show everything
  const isSuperAdmin = getRole() === 'super_admin';
  const hasWildcard = permissions?.includes('*:*:*');
  const showAll = isSuperAdmin || hasWildcard;
  
  // Distribution Partner: Only show Distribution section in header navigation
  const isDistributionPartner = getRole() === 'distribution_partner';

  console.log('🔑 AdminHeader Render - showAll:', showAll, 'isSuperAdmin:', isSuperAdmin, 'hasWildcard:', hasWildcard);
  console.log('🔑 AdminHeader Render - permissions:', permissions);
  console.log('🔑 AdminHeader Render - permissionsLoading:', permissionsLoading);
  console.log('🔑 AdminHeader Render - user role:', getRole());

  // Count visible items in each dropdown
  // Using actual database permission names
  const userAccessItems = [
    showAll || hasPermission('analytics:requests:read'),
    showAll || hasPermission('users_access:user_management:read'),
    showAll || hasPermission('users_access:permissions_roles:read'),
    showAll || hasPermission('user:impersonate')
  ].filter(Boolean).length;

  const analyticsItems = [
    showAll || hasPermission('analytics:analytics_management:read'),
    showAll || hasPermission('analytics:platform_analytics:read')
  ].filter(Boolean).length;

  const financeItems = [
    showAll || hasPermission('finance:earnings_management:read'),
    showAll || hasPermission('finance:wallet_management:read'),
    showAll || hasPermission('finance:split_configuration:read')
  ].filter(Boolean).length;

  const contentItems = [
    showAll || hasPermission('content:asset_library:read'),
    showAll || hasPermission('users_access:master_roster:read')
  ].filter(Boolean).length;

  const distributionItems = [
    showAll || hasPermission('distribution:read:any'),
    showAll || hasPermission('revenue:read')
  ].filter(Boolean).length;

  console.log('📊 Dropdown counts:', {
    userAccessItems,
    analyticsItems,
    financeItems,
    contentItems,
    distributionItems
  });

  // Count total navigation items (for distribution partner, exclude hidden sections)
  const totalNavItems = isDistributionPartner 
    ? distributionItems 
    : userAccessItems + analyticsItems + financeItems + contentItems + distributionItems;
  
  // If 5 or fewer items total, show all as standalone (no dropdowns)
  const forceStandalone = totalNavItems <= 5;
  
  console.log('📊 Total navigation items:', totalNavItems);
  console.log('📊 Force standalone mode:', forceStandalone);

  // Count user dropdown items (excluding Dashboard and Logout which are always visible)
  const userDropdownItems = [
    true,                                                // Profile - always visible
    showAll || hasPermission('platform_messages:read'),  // Platform Messages
    showAll || hasPermission('messages:read'),           // Messages
    showAll || hasPermission('settings:read')            // Settings
  ].filter(Boolean).length;

  console.log('📊 User dropdown items (excluding Dashboard/Logout):', userDropdownItems);

  // Helper to get ALL visible items for each section
  const getAllUserAccessItems = () => {
    const items = [];
    if (showAll || hasPermission('analytics:requests:read')) items.push({ href: '/admin/requests', label: 'Requests', icon: FileText });
    if (showAll || hasPermission('users_access:user_management:read')) items.push({ href: '/admin/usermanagement', label: 'User Management', icon: Users });
    if (showAll || hasPermission('users_access:permissions_roles:read')) items.push({ href: '/superadmin/permissionsroles', label: 'Permissions & Roles', icon: Shield });
    if (showAll || hasPermission('user:impersonate')) items.push({ href: '/superadmin/ghostlogin', label: 'Ghost Mode', icon: Eye });
    return items;
  };

  const getAllAnalyticsItems = () => {
    const items = [];
    if (showAll || hasPermission('analytics:analytics_management:read')) items.push({ href: '/admin/analyticsmanagement', label: 'Analytics Management', icon: BarChart3 });
    if (showAll || hasPermission('analytics:platform_analytics:read')) items.push({ href: '/admin/platformanalytics', label: 'Platform Analytics', icon: TrendingUp });
    return items;
  };

  const getAllFinanceItems = () => {
    const items = [];
    if (showAll || hasPermission('finance:earnings_management:read')) items.push({ href: '/admin/earningsmanagement', label: 'Earnings Management', icon: DollarSign });
    if (showAll || hasPermission('finance:wallet_management:read')) items.push({ href: '/admin/walletmanagement', label: 'Wallet Management', icon: Wallet });
    if (showAll || hasPermission('finance:split_configuration:read')) items.push({ href: '/admin/splitconfiguration', label: 'Split Configuration', icon: PieChart });
    return items;
  };

  const getAllContentItems = () => {
    const items = [];
    if (showAll || hasPermission('content:asset_library:read')) items.push({ href: '/admin/assetlibrary', label: 'Asset Library', icon: Database });
    if (showAll || hasPermission('users_access:master_roster:read')) items.push({ href: '/admin/masterroster', label: 'Master Roster', icon: Music });
    return items;
  };

  const getAllDistributionItems = () => {
    const items = [];
    if (showAll || hasPermission('distribution:read:any')) items.push({ href: '/distribution/hub', label: 'Distribution Hub', icon: Inbox });
    if (showAll || hasPermission('revenue:read')) items.push({ href: '/distribution/revenue', label: 'Revenue Reporting', icon: BarChart3 });
    return items;
  };

  // Helper to get first visible item for standalone links (when not in forceStandalone mode)
  const getFirstUserAccessItem = () => getAllUserAccessItems()[0] || null;
  const getFirstAnalyticsItem = () => getAllAnalyticsItems()[0] || null;
  const getFirstFinanceItem = () => getAllFinanceItems()[0] || null;
  const getFirstContentItem = () => getAllContentItems()[0] || null;
  const getFirstDistributionItem = () => getAllDistributionItems()[0] || null;

  // Show loading state while permissions are being fetched
  if (permissionsLoading) {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <img
                  className={`${largeLogo ? 'h-32 w-32' : 'h-16 w-16 md:h-20 md:w-20'} object-contain`}
                  src="/logos/MSCandCoLogoV2.svg"
                  alt="MSC & Co Logo"
                />
              </Link>
            </div>
            {/* Loading indicator */}
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

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

          {/* Desktop Navigation - Admin Dropdowns */}
          <div className="hidden md:flex items-center flex-1 ml-6">
            {/* Navigation Dropdowns - All wrapped in one ref */}
            <div className="flex items-center" ref={navDropdownRef}>
              
              {/* User & Access - Standalone if 1 item OR forceStandalone mode, dropdown if 2+ */}
              {/* Hidden for Distribution Partners */}
              {!isDistributionPartner && forceStandalone && userAccessItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllUserAccessItems().map((item) => {
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
              ) : !isDistributionPartner && userAccessItems === 1 ? (
                // Single item: Show as standalone link
                (() => {
                  const item = getFirstUserAccessItem();
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
                    {(showAll || hasPermission('analytics:requests:read')) && (
                      <Link href="/admin/requests" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FileText className="w-4 h-4 mr-3" />
                        Requests
                      </Link>
                    )}
                    {(showAll || hasPermission('users_access:user_management:read')) && (
                      <Link href="/admin/usermanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Users className="w-4 h-4 mr-3" />
                        User Management
                      </Link>
                    )}
                    {(showAll || hasPermission('users_access:permissions_roles:read')) && (
                      <Link href="/superadmin/permissionsroles" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Shield className="w-4 h-4 mr-3" />
                        Permissions & Roles
                      </Link>
                    )}
                    {(showAll || hasPermission('user:impersonate')) && (
                      <Link href="/superadmin/ghostlogin" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Eye className="w-4 h-4 mr-3" />
                        Ghost Mode
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>
              ) : null}

              {/* Analytics - Standalone if 1 item OR forceStandalone mode, dropdown if 2+ */}
              {/* Hidden for Distribution Partners */}
              {!isDistributionPartner && forceStandalone && analyticsItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllAnalyticsItems().map((item) => {
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
              ) : !isDistributionPartner && analyticsItems === 1 ? (
                // Single item: Show as standalone link
                (() => {
                  const item = getFirstAnalyticsItem();
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
              ) : !isDistributionPartner && analyticsItems > 1 ? (
              <div 
                className="relative"
                onMouseEnter={() => openNavDropdownOnHover('analytics')}
                onMouseLeave={closeNavDropdown}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openNavDropdown === 'analytics' && (
                  <div className="absolute left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {(showAll || hasPermission('analytics:analytics_management:read')) && (
                      <Link href="/admin/analyticsmanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Analytics Management
                      </Link>
                    )}
                    {(showAll || hasPermission('analytics:platform_analytics:read')) && (
                      <Link href="/admin/platformanalytics" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <TrendingUp className="w-4 h-4 mr-3" />
                        Platform Analytics
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>
              ) : null}

              {/* Finance - Standalone if 1 item OR forceStandalone mode, dropdown if 2+ */}
              {/* Hidden for Distribution Partners */}
              {!isDistributionPartner && forceStandalone && financeItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllFinanceItems().map((item) => {
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
              ) : !isDistributionPartner && financeItems === 1 ? (
                // Single item: Show as standalone link
                (() => {
                  const item = getFirstFinanceItem();
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
              ) : !isDistributionPartner && financeItems > 1 ? (
              <div 
                className="relative"
                onMouseEnter={() => openNavDropdownOnHover('earnings')}
                onMouseLeave={closeNavDropdown}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  <DollarSign className="w-4 h-4" />
                  Finance
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openNavDropdown === 'earnings' && (
                  <div className="absolute left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {(showAll || hasPermission('finance:earnings_management:read')) && (
                      <Link href="/admin/earningsmanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <DollarSign className="w-4 h-4 mr-3" />
                        Earnings Management
                      </Link>
                    )}
                    {(showAll || hasPermission('finance:wallet_management:read')) && (
                      <Link href="/admin/walletmanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Wallet className="w-4 h-4 mr-3" />
                        Wallet Management
                      </Link>
                    )}
                    {(showAll || hasPermission('finance:split_configuration:read')) && (
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

              {/* Content - Standalone if 1 item OR forceStandalone mode, dropdown if 2+ */}
              {/* Hidden for Distribution Partners */}
              {!isDistributionPartner && forceStandalone && contentItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllContentItems().map((item) => {
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
              ) : !isDistributionPartner && contentItems === 1 ? (
                // Single item: Show as standalone link
                (() => {
                  const item = getFirstContentItem();
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
              ) : !isDistributionPartner && contentItems > 1 ? (
              <div 
                className="relative"
                onMouseEnter={() => openNavDropdownOnHover('content')}
                onMouseLeave={closeNavDropdown}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  <Database className="w-4 h-4" />
                  Content
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openNavDropdown === 'content' && (
                  <div className="absolute left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {(showAll || hasPermission('content:asset_library:read')) && (
                      <Link href="/admin/assetlibrary" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Database className="w-4 h-4 mr-3" />
                        Asset Library
                      </Link>
                    )}
                    {(showAll || hasPermission('users_access:master_roster:read')) && (
                      <Link href="/admin/masterroster" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Users className="w-4 h-4 mr-3" />
                        Master Roster
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>
              ) : null}

              {/* Distribution - Standalone if 1 item OR forceStandalone mode, dropdown if 2+ */}
              {forceStandalone && distributionItems > 0 ? (
                // Force standalone mode: Show all items as individual links
                getAllDistributionItems().map((item) => {
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
                  const item = getFirstDistributionItem();
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
                    {(showAll || hasPermission('distribution:read:any')) && (
                      <Link href="/distribution/hub" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Inbox className="w-4 h-4 mr-3" />
                        Distribution Hub
                      </Link>
                    )}
                    {(showAll || hasPermission('revenue:read')) && (
                      <Link href="/distribution/revenue" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FileText className="w-4 h-4 mr-3" />
                        Revenue Reporting
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>
              ) : null}

            </div>

            {/* Right Side - Bell, About, Support, Badge, User */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Notifications Bell - Permission required */}
              {(showAll || hasPermission('notifications:read')) && (
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
                  <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getRoleBadgeColor()}`}>
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

                    {/* Profile - Always visible */}
                    <Link href="/admin/profile" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Profile
                    </Link>

                    {/* Platform Messages - Permission required */}
                    {(showAll || hasPermission('platform_messages:read')) && (
                      <Link href="/superadmin/messages" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <MessageSquare className="w-4 h-4 mr-3 text-gray-400" />
                        Platform Messages
                      </Link>
                    )}

                    {/* Messages - Permission required */}
                    {(showAll || hasPermission('messages:read')) && (
                      <Link href="/admin/messages" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <MessageSquare className="w-4 h-4 mr-3 text-gray-400" />
                        Messages
                      </Link>
                    )}

                    {/* Settings - Permission required */}
                    {(showAll || hasPermission('settings:read')) && (
                      <Link href="/admin/settings" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Settings
                      </Link>
                    )}

                    <hr className="my-1 border-gray-200" />

                    {/* Logout - Always visible */}
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
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
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;

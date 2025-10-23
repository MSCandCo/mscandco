'use client'

import { useUser } from '@/components/providers/SupabaseProvider';
import { LayoutDashboard, User, Settings, LogOut, Bell, ChevronDown, Users, Shield, BarChart3, DollarSign, Database, Music, Inbox, FileText, MessageSquare, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import usePermissions from '@/hooks/usePermissions';

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
    return user?.email?.split('@')[0] || 'User';
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
    return 'Admin';
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    const role = getRole();
    if (role === 'super_admin') return 'bg-red-100 text-red-800 border-red-300';
    if (role === 'company_admin') return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
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

  console.log('🔑 AdminHeader Render - showAll:', showAll, 'isSuperAdmin:', isSuperAdmin, 'hasWildcard:', hasWildcard);

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
              
              {/* User & Access Dropdown */}
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
                    {(showAll || hasPermission('requests:read')) && (
                      <Link href="/admin/requests" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FileText className="w-4 h-4 mr-3" />
                        Requests
                      </Link>
                    )}
                    {(showAll || hasPermission('user:read:any')) && (
                      <Link href="/admin/usermanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Users className="w-4 h-4 mr-3" />
                        User Management
                      </Link>
                    )}
                    {(showAll || hasPermission('role:read:any')) && (
                      <Link href="/superadmin/permissionsroles" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Shield className="w-4 h-4 mr-3" />
                        Permissions & Roles
                      </Link>
                    )}
                    {(showAll || hasPermission('user:impersonate')) && (
                      <Link href="/superadmin/ghost-login" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Eye className="w-4 h-4 mr-3" />
                        Ghost Mode
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>

              {/* Analytics Dropdown */}
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
                    {(showAll || hasPermission('analytics:read:any')) && (
                      <Link href="/admin/analyticsmanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Analytics Management
                      </Link>
                    )}
                    {(showAll || hasPermission('analytics:read:any')) && (
                      <Link href="/admin/platformanalytics" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Platform Analytics
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>

              {/* Earnings Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => openNavDropdownOnHover('earnings')}
                onMouseLeave={closeNavDropdown}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
                >
                  <DollarSign className="w-4 h-4" />
                  Earnings
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openNavDropdown === 'earnings' && (
                  <div className="absolute left-0 pt-2 z-50">
                    <div className="w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    {(showAll || hasPermission('earnings:read:any')) && (
                      <Link href="/admin/earningsmanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <DollarSign className="w-4 h-4 mr-3" />
                        Earnings Management
                      </Link>
                    )}
                    {(showAll || hasPermission('wallet:view:any')) && (
                      <Link href="/admin/walletmanagement" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <DollarSign className="w-4 h-4 mr-3" />
                        Wallet Management
                      </Link>
                    )}
                    {(showAll || hasPermission('splits:read')) && (
                      <Link href="/admin/splitconfiguration" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <DollarSign className="w-4 h-4 mr-3" />
                        Split Configuration
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Dropdown */}
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
                    {(showAll || hasPermission('content:read:any')) && (
                      <Link href="/admin/assetlibrary" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Database className="w-4 h-4 mr-3" />
                        Asset Library
                      </Link>
                    )}
                    {(showAll || hasPermission('roster:view:any')) && (
                      <Link href="/admin/masterroster" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Users className="w-4 h-4 mr-3" />
                        Master Roster
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>

              {/* Distribution Dropdown */}
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
                      <Link href="/distribution" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Inbox className="w-4 h-4 mr-3" />
                        Distribution Hub
                      </Link>
                    )}
                    {(showAll || hasPermission('revenue:read')) && (
                      <Link href="/distribution/reporting" onClick={() => setOpenNavDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FileText className="w-4 h-4 mr-3" />
                        Revenue Reporting
                      </Link>
                    )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right Side - Bell, About, Support, Badge, User */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Notifications Bell */}
              <Link href="/notifications" className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
              </Link>

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
                  <div className={`flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor()}`}>
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

                    {/* Dashboard */}
                    <Link href="/dashboard" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400" />
                      Dashboard
                    </Link>

                    {/* Platform Messages */}
                    <Link href="/admin/messages" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <MessageSquare className="w-4 h-4 mr-3 text-gray-400" />
                      Platform Messages
                    </Link>

                    {/* Messages */}
                    <Link href="/messages" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <MessageSquare className="w-4 h-4 mr-3 text-gray-400" />
                      Messages
                    </Link>

                    {/* Settings */}
                    <Link href="/admin/settings" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Settings
                    </Link>

                    <hr className="my-1 border-gray-200" />

                    {/* Logout */}
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

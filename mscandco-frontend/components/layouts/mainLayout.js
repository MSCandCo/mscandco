'use client'

import React, { useState, useEffect } from "react";
import Footer from "../footer";
import GhostModeIndicator from "../admin/GhostModeIndicator";
// Header removed - navigation handled by _app.js
import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRoleSync } from '@/lib/user-utils';
import usePermissions from '@/hooks/usePermissions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Music,
  BarChart3,
  DollarSign,
  Inbox,
  RefreshCw,
  Database,
  Users,
  Shield,
  ClipboardList
} from 'lucide-react';

// Navigation items based on permissions (not roles)
const getNavigationItems = (hasPermission) => {
  // Check if user has admin access
  const isAdmin = hasPermission('user:read:any') ||
                  hasPermission('role:read:any') ||
                  hasPermission('support:read:any') ||
                  hasPermission('analytics:read:any') ||
                  hasPermission('release:read:any');

  const items = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true, // Everyone sees dashboard
    },
    // Artist/Creator Items - ONLY show if NOT admin
    {
      name: 'My Releases',
      href: '/artist/releases',
      icon: Music,
      show: !isAdmin && hasPermission('release:read:own'),
    },
    {
      name: 'Analytics',
      href: '/artist/analytics',
      icon: BarChart3,
      show: !isAdmin && hasPermission('analytics:read:own'),
    },
    {
      name: 'Earnings',
      href: '/artist/earnings',
      icon: DollarSign,
      show: !isAdmin && hasPermission('earnings:read:own'),
    },
    {
      name: 'Roster',
      href: '/artist/roster',
      icon: Users,
      show: !isAdmin && hasPermission('user:read:label'),
    },
    // Distribution Partner Items
    {
      name: 'Distribution Queue',
      href: '/distribution/queue',
      icon: Inbox,
      show: hasPermission('distribution:read:own') || hasPermission('distribution:read:any'),
    },
    {
      name: 'Revision Queue',
      href: '/distribution/revisions',
      icon: RefreshCw,
      show: hasPermission('distribution:update:own') || hasPermission('distribution:update:any'),
    },
    // Admin Items
    {
      name: 'Content Library',
      href: '/admin/content-library',
      icon: Database,
      show: hasPermission('release:read:any'),
    },
    {
      name: 'All Releases',
      href: '/admin/releases',
      icon: Music,
      show: hasPermission('release:read:any'),
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      show: hasPermission('user:read:any'),
    },
    {
      name: 'Profile Requests',
      href: '/admin/profile-requests',
      icon: ClipboardList,
      show: hasPermission('user:read:any'),
    },
    {
      name: 'Roles & Permissions',
      href: '/superadmin/permissionsroles',
      icon: Shield,
      show: hasPermission('role:read:any'),
    },
  ];

  return items.filter(item => item.show);
};

function MainLayout({ children, className, showSidebar = false }) {
  const [isGhostMode, setIsGhostMode] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const userRole = getUserRoleSync(user);
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const navigationItems = getNavigationItems(hasPermission);

  useEffect(() => {
    const checkGhostMode = () => {
      if (typeof window !== 'undefined') {
        const ghostMode = sessionStorage.getItem('ghost_mode');
        setIsGhostMode(ghostMode === 'true');
      }
    };

    checkGhostMode();

    // Listen for ghost mode changes
    const handleGhostModeChange = () => {
      checkGhostMode();
    };

    window.addEventListener('ghostModeChanged', handleGhostModeChange);
    window.addEventListener('storage', handleGhostModeChange);

    return () => {
      window.removeEventListener('ghostModeChanged', handleGhostModeChange);
      window.removeEventListener('storage', handleGhostModeChange);
    };
  }, []);

  const isActivePage = (path) => {
    return router.pathname === path;
  };

  return (
    <div className={className}>
      {/* Header removed - navigation handled by _app.js */}
      {showSidebar && user && (
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <nav className="p-4 space-y-1">
              {permissionsLoading ? (
                <div className="text-center text-gray-500 py-4">Loading...</div>
              ) : (
                navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePage(item.href);
                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                          active
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </nav>
          </aside>
          {/* Main Content */}
          <main className={`flex-1 ${isGhostMode ? 'pb-16 sm:pb-14' : ''}`}>
            {children}
          </main>
        </div>
      )}
      {!showSidebar && (
        <main className={isGhostMode ? 'pb-16 sm:pb-14' : ''}>{children}</main>
      )}
      <Footer />
      <GhostModeIndicator />
    </div>
  );
}

export default MainLayout;

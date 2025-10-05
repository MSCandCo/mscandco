import React, { useState, useEffect } from "react";
import Footer from "../footer";
import GhostModeIndicator from "../admin/GhostModeIndicator";
// Header removed - navigation handled by _app.js
import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRoleSync } from '@/lib/user-utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  Music,
  BarChart3,
  DollarSign,
  Inbox,
  RefreshCw,
  Database,
  Users
} from 'lucide-react';

// Navigation items based on role
const getNavigationItems = (userRole) => {
  const commonItems = [
    {
      name: 'Dashboard',
      href: userRole === 'distribution_partner' ? '/distribution/dashboard' : '/dashboard',
      icon: Home,
    }
  ];

  // Artist-specific navigation
  if (userRole === 'artist') {
    return [
      ...commonItems,
      {
        name: 'My Releases',
        href: '/artist/releases',
        icon: Music,
      },
      {
        name: 'Analytics',
        href: '/artist/analytics',
        icon: BarChart3,
      },
      {
        name: 'Earnings',
        href: '/artist/earnings',
        icon: DollarSign,
      }
    ];
  }

  // Distribution Partner navigation
  if (userRole === 'distribution_partner') {
    return [
      ...commonItems,
      {
        name: 'Distribution Queue',
        href: '/distribution/queue',
        icon: Inbox,
      },
      {
        name: 'Revision Queue',
        href: '/distribution/revisions',
        icon: RefreshCw,
      }
    ];
  }

  // Admin navigation
  if (['company_admin', 'super_admin'].includes(userRole)) {
    return [
      ...commonItems,
      {
        name: 'Distribution Queue',
        href: '/distribution/queue',
        icon: Inbox,
      },
      {
        name: 'Revision Queue',
        href: '/distribution/revisions',
        icon: RefreshCw,
      },
      {
        name: 'Content Library',
        href: '/admin/content-library',
        icon: Database,
      },
      {
        name: 'All Releases',
        href: '/admin/releases',
        icon: Music,
      },
      {
        name: 'Users',
        href: '/admin/users',
        icon: Users,
      }
    ];
  }

  return commonItems;
};

function MainLayout({ children, className, showSidebar = false }) {
  const [isGhostMode, setIsGhostMode] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const userRole = getUserRoleSync(user);
  const navigationItems = getNavigationItems(userRole);

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
              {navigationItems.map((item) => {
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
              })}
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

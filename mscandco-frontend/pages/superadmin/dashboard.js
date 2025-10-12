/**
 * Superadmin Dashboard
 *
 * Clean rebuild - Simple overview page
 * Requires: role:read:any permission (or any admin permission)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/mainLayout';
import { useUser } from '@/components/providers/SupabaseProvider';
import usePermissions from '@/hooks/usePermissions';
import Link from 'next/link';
import {
  Shield,
  Users,
  ClipboardList,
  BarChart3,
  FileText,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function SuperadminDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { hasPermission, hasAnyPermission, loading: permissionsLoading } = usePermissions();

  // Check if user has any admin permissions
  const isAdmin = hasAnyPermission([
    'role:read:any',
    'user:read:any',
    'analytics:read:any',
    'release:read:any'
  ]);

  // Redirect if not admin
  useEffect(() => {
    if (!permissionsLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [permissionsLoading, isAdmin, router]);

  if (permissionsLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Manage your platform from here.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management */}
            {hasPermission('user:read:any') && (
              <QuickActionCard
                title="User Management"
                description="View and manage all users and roles"
                icon={<Users className="w-6 h-6" />}
                href="/admin/usermanagement"
                color="blue"
              />
            )}

            {/* Profile Requests */}
            {hasPermission('user:read:any') && (
              <QuickActionCard
                title="Profile Requests"
                description="Review pending profile changes"
                icon={<ClipboardList className="w-6 h-6" />}
                href="/admin/profile-requests"
                color="purple"
              />
            )}

            {/* Roles & Permissions */}
            {hasPermission('role:read:any') && (
              <QuickActionCard
                title="Roles & Permissions"
                description="Manage RBAC system"
                icon={<Shield className="w-6 h-6" />}
                href="/superadmin/permissionsroles"
                color="green"
              />
            )}

            {/* Platform Analytics */}
            {hasPermission('analytics:read:any') && (
              <QuickActionCard
                title="Platform Analytics"
                description="View system metrics"
                icon={<BarChart3 className="w-6 h-6" />}
                href="/admin/analytics"
                color="yellow"
              />
            )}

            {/* All Releases */}
            {hasPermission('release:read:any') && (
              <QuickActionCard
                title="All Releases"
                description="Manage all music releases"
                icon={<FileText className="w-6 h-6" />}
                href="/admin/releases"
                color="red"
              />
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Clean Rebuild in Progress
                </h3>
                <p className="text-blue-800 text-sm mb-3">
                  This is a clean rebuild of the admin panel. Features are being added function by function
                  to ensure quality and maintainability.
                </p>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    ✅ <span>Permission-based navigation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ <span>Permissions & Roles management (view-only)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    🔄 <span>Role-permission assignment (coming next)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    ⏳ <span>User management (pending)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

/**
 * Quick Action Card Component
 */
function QuickActionCard({ title, description, icon, href, color }) {
  const router = useRouter();

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    green: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
    yellow: 'bg-yellow-50 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white',
    red: 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white',
  };

  const handleClick = () => {
    console.log('🖱️ QuickActionCard clicked:', { title, href });
    router.push(href);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 hover:border-gray-300 cursor-pointer"
    >
      <div className="p-6">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-200 ${colorClasses[color]}`}>
          {icon}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-between">
          {title}
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
        </h3>

        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
}

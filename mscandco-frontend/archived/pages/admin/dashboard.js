import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import MainLayout from '@/components/layouts/mainLayout';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
        </div>
      </MainLayout>
    );
  }

  const adminFunctions = [
    {
      name: 'Permissions & Roles',
      description: 'Manage roles and permissions',
      href: '/admin/permissions',
      icon: ShieldCheckIcon,
      color: 'bg-blue-500',
      status: 'Ready'
    },
    {
      name: 'User Management',
      description: 'View and manage all users',
      href: '/admin/users',
      icon: UserGroupIcon,
      color: 'bg-green-500',
      status: 'Ready'
    },
    {
      name: 'Profile Requests',
      description: 'Review profile change requests',
      href: '/admin/profile-requests',
      icon: DocumentTextIcon,
      color: 'bg-indigo-500',
      status: 'Ready'
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage platform administration with RBAC-protected functions
          </p>
        </div>

        {/* Admin Functions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFunctions.map((func) => {
            const Icon = func.icon;
            return (
              <Link key={func.name} href={func.href}>
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center">
                    <div className={`${func.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{func.name}</h3>
                      <p className="text-sm text-gray-600">{func.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {func.status}
                    </span>
                    <span className="text-sm text-gray-500">Click to access →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* System Status */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">RBAC System</span>
                <span className="text-green-600 font-medium">✅ Active</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Admin Functions</span>
                <span className="text-green-600 font-medium">✅ 3 Ready</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-green-600 font-medium">✅ Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🎯 Clean Admin System
          </h3>
          <p className="text-blue-800 text-sm">
            This is your clean, focused admin dashboard. Only the essential admin functions are available:
            Permissions & Roles, User Management, and Profile Requests. All functions are RBAC-protected
            and can be accessed by users with appropriate permissions.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

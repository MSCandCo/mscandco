import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import MainLayout from '@/components/layouts/mainLayout';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function SuperAdminDashboard() {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal"></div>
        </div>
      </MainLayout>
    );
  }

  const quickActions = [
    {
      name: 'Permissions & Roles',
      description: 'Manage roles and permissions',
      href: '/admin/permissions',
      icon: ShieldCheckIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'User Management',
      description: 'View and manage all users',
      href: '/admin/users',
      icon: UserGroupIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Profile Requests',
      description: 'Review profile change requests',
      href: '/admin/profile-requests',
      icon: DocumentTextIcon,
      color: 'bg-indigo-500'
    },
    {
      name: 'System Settings',
      description: 'Configure platform settings',
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Analytics',
      description: 'Platform analytics and reports',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      color: 'bg-orange-500'
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.email}
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {action.name}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 RBAC System Active
          </h2>
          <p className="text-blue-800">
            The new Role-Based Access Control system is now live. Manage permissions and roles from the Permissions & Roles page.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

import { useUser } from '@/components/providers/SupabaseProvider';
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getUserRoleSync } from '@/lib/user-utils';
import RoleBasedDashboard from '@/components/dashboard/RoleBasedDashboard';

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    // Redirect role-specific users to their dedicated dashboards
    if (user) {
      const userRole = getUserRoleSync(user);
      if (userRole === 'super_admin') {
        router.push('/superadmin/dashboard');
        return;
      }
      // Company Admin now sees smart dashboard, no redirect needed
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const userRole = getUserRoleSync(user);

  return (
    <>
      <Head>
        <title>{userRole} Dashboard - MSC & Co</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <RoleBasedDashboard />
      </div>
    </>
  );
} 
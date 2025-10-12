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

    // All users are pre-verified in this platform
    // No email verification check needed

    // Redirect role-specific users to their dedicated dashboards
    if (user) {
      try {
        // Check if we're in ghost mode - if so, don't redirect based on real user role
        const isGhostMode = typeof window !== 'undefined' && sessionStorage.getItem('ghost_mode') === 'true';

        // All users now see the same dashboard - no admin redirects
      } catch (error) {
        // Handle role detection errors gracefully
        console.error('Error detecting user role:', error);
      }
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

  let userRole = 'user';
  try {
    userRole = getUserRoleSync(user);
  } catch (error) {
    console.error('Error getting user role for title:', error);
  }

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
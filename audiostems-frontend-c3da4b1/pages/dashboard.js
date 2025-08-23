import { useUser } from '@/components/providers/SupabaseProvider';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import RoleBasedDashboard from '@/components/dashboard/RoleBasedDashboard';
import { useUserRole } from '@/hooks/useUserRole';
import { getUserBrand } from '@/lib/user-utils';

// getUserRole imported from lib/user-utils

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState('artist'); // Default to artist as string

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // For now, default to artist to avoid async issues
      setUserRole('artist');
      
      // Company Admin and other roles would see smart dashboard, no redirect needed
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

  return (
    <>
      <Head>
        <title>{userRole === 'artist' ? 'Artist' : (userRole || 'Artist')} Dashboard - MSC & Co</title>
      </Head>

      <RoleBasedDashboard />
    </>
  );
} 
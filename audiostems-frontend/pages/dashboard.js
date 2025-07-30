import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getUserRole } from '@/lib/auth0-config';
import RoleBasedDashboard from '@/components/dashboard/RoleBasedDashboard';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const userRole = getUserRole(user);

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
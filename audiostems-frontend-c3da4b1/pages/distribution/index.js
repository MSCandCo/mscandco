import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRole } from '@/lib/user-utils';

export default function DistributionIndex() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const userRole = getUserRole(user);
      
      // Redirect based on role
      if (userRole === 'company_admin' || userRole === 'super_admin') {
        router.replace('/distribution/workflow');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
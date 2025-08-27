import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ReleaseDetails() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard - release details will be implemented later
    router.push('/distributionpartner/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
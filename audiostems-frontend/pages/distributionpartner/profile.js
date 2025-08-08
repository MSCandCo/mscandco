import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DistributionPartnerProfile() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard and trigger profile modal
    router.push('/distributionpartner/dashboard?profile=open');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    </div>
  );
}
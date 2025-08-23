import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function DistributionPartnerSyncBoard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to earnings since "Sync Board" is now "Earnings"
    router.push('/distributionpartner/reports');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading earnings...</p>
      </div>
    </div>
  );
}
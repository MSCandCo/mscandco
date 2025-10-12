import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function DistributionPartnerReleases() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to analytics since "All Releases" is now "Analytics"
    router.push('/distributionpartner/analytics');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    </div>
  );
}
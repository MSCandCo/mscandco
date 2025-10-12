import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Label Admin Roster Page
 *
 * This page redirects to the artist roster page (/artist/roster) as they share
 * the same functionality. The API endpoint handles permission-based access control,
 * ensuring label admins only see contributors from their connected artists.
 */
export default function LabelAdminRoster() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to artist roster page
    router.replace('/artist/roster');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading roster...</p>
      </div>
    </div>
  );
}

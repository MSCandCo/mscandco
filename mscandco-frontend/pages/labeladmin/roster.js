import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';

/**
 * Label Admin Roster Page
 *
 * This page redirects to the artist roster page (/artist/roster) as they share
 * the same functionality. The API endpoint handles permission-based access control,
 * ensuring label admins only see contributors from their connected artists.
 */

// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'roster:access');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function LabelAdminRoster() {
  const router = useRouter();
  const { user } = useUser();
  
  // Permission check
  
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

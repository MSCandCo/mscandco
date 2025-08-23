import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import MultiStepRegistration from '@/components/auth/MultiStepRegistration';
import SEO from '@/components/seo';

export default function RegisterPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Redirect if already logged in (but not during active registration)
  useEffect(() => {
    if (!isLoading && user) {
      // Check if registration is active - if so, don't redirect
      const registrationActive = localStorage.getItem('registrationActive') === 'true';
      
      if (!registrationActive && !user.needsRegistration && !user.registrationInProgress) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if user is logged in and not in registration process
  if (user && !user.needsRegistration && !user.registrationInProgress) {
    const registrationActive = localStorage.getItem('registrationActive') === 'true';
    if (!registrationActive) {
      return null;
    }
  }

  return (
    <>
      <SEO pageTitle="Register - MSC & Co" />
              <MultiStepRegistration />
    </>
  );
}

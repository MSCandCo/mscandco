import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import MultiStepRegistration from '@/components/auth/MultiStepRegistration';

export default function RegisterPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <MainLayout>
        <SEO pageTitle="Register" />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937]"></div>
        </div>
      </MainLayout>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <MainLayout>
      <SEO pageTitle="Create Account - MSC & Co" />
      <MultiStepRegistration />
    </MainLayout>
  );
}
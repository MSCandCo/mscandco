import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import LoginButton from '@/components/auth/LoginButton';
import Container from '@/components/container';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <MainLayout>
        <SEO pageTitle="Login" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937]"></div>
        </div>
      </MainLayout>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <MainLayout>
      <SEO pageTitle="Login" />
      <section className="py-8 md:py-28">
        <Container className="!max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to MSC & Co
            </h1>
            <p className="text-gray-600 mb-8">
              Sign in to access your music distribution platform
            </p>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <LoginButton className="w-full mb-4">
                Sign In with Auth0
              </LoginButton>
              
              <p className="text-sm text-gray-500 mt-4">
                Secure authentication powered by Auth0
              </p>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
} 
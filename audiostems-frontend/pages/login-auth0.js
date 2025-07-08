import { useAuth0 } from '@auth0/auth0-react';
import Head from 'next/head';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/brand-config';

export default function LoginAuth0() {
  const { loginWithRedirect, user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Check if profile is complete
    const profileComplete = user['https://mscandco.com/profile_complete'];
    
    if (!profileComplete) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>
            <p className="text-gray-600 text-center mb-6">
              Please complete your artist profile to continue.
            </p>
            <Link 
              href="/complete-profile"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 block text-center"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      );
    }

    // Redirect to dashboard if profile is complete
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
    return null;
  }

  return (
    <>
      <Head>
        <title>Sign In - {COMPANY_INFO.name}</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Sign in to your {COMPANY_INFO.name} artist account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your music distribution dashboard
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <button
              onClick={() => loginWithRedirect()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign in with Auth0
            </button>

            <div className="mt-6 text-center">
              <span className="font-medium">New to {COMPANY_INFO.name}?</span>
              <Link 
                href="/register-auth0" 
                className="ml-1 text-blue-600 hover:text-blue-700"
              >
                Create an account
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Why Choose {COMPANY_INFO.name}?
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Multi-brand music distribution platform</li>
              <li>• YHWH MSC for gospel and christian music</li>
              <li>• Audio MSC for general music and licensing</li>
              <li>• Professional publishing and royalty collection</li>
              <li>• Sync licensing opportunities</li>
              <li>• Keep 100% of your rights and ownership</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
} 
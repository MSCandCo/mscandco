import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { Button } from 'flowbite-react';
import { HiLogin } from 'react-icons/hi';

export default function ProtectedRoute({ children, requireProfileComplete = false }) {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the intended destination
      sessionStorage.setItem('redirectAfterLogin', router.asPath);
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, router.asPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <HiLogin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to access this page.
            </p>
            <Button
              color="blue"
              className="w-full"
              onClick={() => loginWithRedirect()}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If profile completion is required, check user metadata
  if (requireProfileComplete && user) {
    const profileComplete = user['https://audiostems.com/profile_complete'];
    
    if (!profileComplete) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <HiLogin className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Profile Completion Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please complete your artist profile before accessing this feature.
              </p>
              <Button
                color="blue"
                className="w-full"
                onClick={() => router.push('/artist-portal')}
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
} 
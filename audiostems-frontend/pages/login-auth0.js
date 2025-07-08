import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { Button, Card, Alert } from 'flowbite-react';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';

export default function LoginAuth0Page() {
  const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to appropriate page
    if (isAuthenticated && user) {
      const profileComplete = user['https://audiostems.com/profile_complete'];
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else if (profileComplete) {
        router.push('/artist-portal');
      } else {
        router.push('/register-auth0');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login'
      }
    });
  };

  const handleSignUp = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <SEO pageTitle="Sign In - AudioStems" />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to your AudioStems artist account
            </p>
          </div>

          <Card className="shadow-lg">
            <div className="space-y-6">
              {/* Login Button */}
              <div>
                <Button
                  color="blue"
                  className="w-full"
                  onClick={handleLogin}
                  size="lg"
                >
                  <HiMail className="w-5 h-5 mr-2" />
                  Sign In with Email
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Sign Up Option */}
              <div>
                <Button
                  color="gray"
                  className="w-full"
                  onClick={handleSignUp}
                  size="lg"
                >
                  <HiLockClosed className="w-5 h-5 mr-2" />
                  Create New Account
                </Button>
              </div>

              {/* Information */}
              <Alert color="info">
                <div>
                  <span className="font-medium">New to AudioStems?</span>
                  <br />
                  Create an account to start distributing your music worldwide.
                </div>
              </Alert>

              {/* Help Links */}
              <div className="text-center text-sm text-gray-500">
                <p>
                  Need help? <button className="text-blue-600 hover:underline">Contact Support</button>
                </p>
                <p className="mt-1">
                  <button className="text-blue-600 hover:underline">Forgot your password?</button>
                </p>
              </div>
            </div>
          </Card>

          {/* Features Preview */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Why Choose AudioStems?
            </h3>
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                Global music distribution to 150+ platforms
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                Real-time analytics and revenue tracking
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                Professional publishing and licensing services
              </div>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                Dedicated artist support and resources
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
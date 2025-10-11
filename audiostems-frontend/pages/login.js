import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Container from '@/components/container';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { COMPANY_INFO } from '@/lib/brand-config';
import { Loader2, LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Clear any stale session on mount (important for logout flow)
  useEffect(() => {
    const clearStaleSession = async () => {
      // Check if there's a stale session that should be cleared
      const { data: { session } } = await supabase.auth.getSession();

      // If we have a session but user is null in provider, clear it
      if (session && !user && !isLoading) {
        console.log('🧹 Clearing stale session on login page');
        await supabase.auth.signOut({ scope: 'local' });
      }
    };

    // Only run this check after initial loading is done
    if (!isLoading) {
      clearStaleSession();
    }
  }, [isLoading, user]);

  useEffect(() => {
    console.log('🔄 Login: Navigation useEffect triggered -', { user: !!user, isLoading });
    if (user && !isLoading) {
      console.log('✅ Login: Conditions met, navigating to dashboard...');
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    console.log('🔐 Login: Starting login attempt for:', email);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.log('❌ Login: Login error:', error);

      // All users are pre-verified - just show the error message
      setError(error.message);
      setIsSubmitting(false);
    } else {
      console.log('✅ Login: Login successful, session established:', data.session ? 'Yes' : 'No');

      // The onAuthStateChange in SupabaseProvider should fire automatically
      // Don't navigate immediately - the useEffect on line 42-46 will handle navigation
      // once the user state updates in the provider
      console.log('⏳ Login: Waiting for SupabaseProvider to update user state...');
    }
  };


  // Show loading spinner while checking initial auth state
  if (isLoading) {
    return (
      <MainLayout>
        <SEO pageTitle="Login" />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937]"></div>
        </div>
      </MainLayout>
    );
  }

  // Show loading spinner while navigating to dashboard after login
  if (user) {
    return (
      <MainLayout>
        <SEO pageTitle="Redirecting..." />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937] mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO pageTitle="Sign In - MSC & Co" />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-[#1f2937] rounded-xl flex items-center justify-center mb-6">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#1f2937] mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-xl mb-2">
              Sign In and Access
            </p>
            <p className="text-gray-600 text-xl">
              your Music Distribution Platform
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200 mx-auto max-w-5xl">
            <div className="flex flex-col items-center">
              <form onSubmit={handleLogin} className="space-y-8 w-full max-w-2xl">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="text-center flex flex-col items-center">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
                      w-full pl-12 pr-4 py-3 text-lg
                      border border-gray-300 rounded-xl 
                      focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                      transition-all duration-300
                      placeholder-gray-400
                      text-gray-900
                    "
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="text-center flex flex-col items-center">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="
                      w-full pl-12 pr-12 py-3 text-lg
                      border border-gray-300 rounded-xl 
                      focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                      transition-all duration-300
                      placeholder-gray-400
                      text-gray-900
                    "
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full
                  bg-[#1f2937] 
                  text-white 
                  border 
                  border-[#1f2937] 
                  rounded-xl 
                  px-8 
                  py-4 
                  font-bold 
                  text-lg
                  shadow-lg 
                  transition-all 
                  duration-300 
                  hover:bg-white 
                  hover:text-[#1f2937] 
                  hover:shadow-xl 
                  hover:-translate-y-1
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#1f2937]
                  focus:ring-offset-2
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  disabled:hover:transform-none
                  flex items-center justify-center
                "
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Your Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center max-w-lg mx-auto">
              <p className="text-gray-600">
                Need an account? Contact{' '}
                <a
                  href="mailto:info@mscandco.com"
                  className="
                    font-semibold text-[#1f2937] 
                    hover:text-gray-700 
                    transition-colors duration-300
                    underline decoration-2 underline-offset-2
                    hover:decoration-gray-700
                  "
                >
                  info@mscandco.com
                </a>
              </p>
            </div>
          </div>

          {/* Security Note */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              🔒 Secure authentication powered by Supabase
            </p>
          </div>
        </div>
      </div>

    </MainLayout>
  );
} 
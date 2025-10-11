import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';

export default function LogoutPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    const forceLogout = async () => {
      console.log('🔄 Logout: Starting logout process...');

      try {
        // Sign out from Supabase with global scope to clear all sessions
        const { error } = await supabase.auth.signOut({ scope: 'global' });

        if (error) {
          console.error('❌ Logout: Logout error:', error);
        }

        // Clear all local storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();

          // Clear all cookies
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
        }

        console.log('✅ Logout: Logout complete, auth state should update via SupabaseProvider');
      } catch (error) {
        console.error('💥 Logout: Logout failed:', error);
        // Force redirect even on error
        router.push('/login');
      }
    };

    forceLogout();
  }, [router]);

  // Wait for user to become null before redirecting to login
  useEffect(() => {
    if (!user && !isLoading) {
      console.log('✅ Logout: User state cleared, redirecting to login');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}

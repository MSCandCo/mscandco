/**
 * Force Logout Utility
 * 
 * Comprehensive logout function that clears all authentication data,
 * storage, and cookies. This ensures a clean logout that prevents
 * session persistence issues.
 * 
 * Usage:
 *   import { forceLogout } from '@/lib/auth/logout-utils'
 *   await forceLogout()
 */

/**
 * Performs a comprehensive force logout
 * @param {Object} options - Logout options
 * @param {string} options.redirectTo - Where to redirect after logout (default: '/login')
 * @param {boolean} options.silent - If true, doesn't show errors (default: false)
 * @returns {Promise<void>}
 */
export async function forceLogout(options = {}) {
  const { redirectTo = '/login', silent = false } = options;

  try {
    // Step 1: Sign out from Supabase with global scope (signs out from all devices)
    if (typeof window !== 'undefined') {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut({ scope: 'global' });
    }

    // Step 2: Call server-side logout API to clear cookies properly
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (apiError) {
      if (!silent) {
        console.error('Logout API error:', apiError);
      }
      // Continue even if API call fails
    }

    // Step 3: Clear all localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    // Step 4: Clear all sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }

    // Step 5: Aggressively clear all cookies
    if (typeof window !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';');

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        // Clear cookie for all possible paths and domains
        const domains = [
          window.location.hostname,
          `.${window.location.hostname}`,
          'localhost',
          '.localhost',
        ];

        const paths = ['/', '/artist', '/admin', '/superadmin', '/labeladmin'];

        domains.forEach((domain) => {
          paths.forEach((path) => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
          });
        });
      }
    }

    // Step 6: Clear Supabase-specific storage keys
    if (typeof window !== 'undefined') {
      const supabaseKeys = [
        'sb-auth-token',
        'sb-localhost-auth-token',
        'supabase.auth.token',
        'sb-access-token',
        'sb-refresh-token',
      ];

      supabaseKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    }

    // Step 7: Clear ghost mode data (if exists)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ghost_mode');
      sessionStorage.removeItem('ghost_session');
      sessionStorage.removeItem('original_admin_user');
      sessionStorage.removeItem('ghost_target_user');
    }

    // Step 8: Wait a moment to ensure everything is cleared
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Step 9: Hard redirect to ensure complete page refresh
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  } catch (error) {
    if (!silent) {
      console.error('Force logout error:', error);
    }
    // Force redirect even on error
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }
}

/**
 * Quick logout - redirects to /force-logout page for comprehensive cleanup
 * Use this when you want the full force logout experience with UI feedback
 */
export function redirectToForceLogout() {
  if (typeof window !== 'undefined') {
    window.location.href = '/force-logout';
  }
}


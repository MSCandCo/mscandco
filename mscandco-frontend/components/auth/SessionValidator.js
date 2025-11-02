'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

/**
 * SessionValidator Component
 *
 * Validates user sessions on protected pages and handles automatic logout
 * when sessions expire or become invalid.
 *
 * Features:
 * - Periodic session validation (every 5 minutes)
 * - Auth state change listener
 * - Automatic redirect on session expiry
 * - Token refresh handling
 */
export function SessionValidator() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    // Don't validate on public pages
    const publicPaths = ['/login', '/register', '/reset-password', '/']
    if (publicPaths.includes(pathname)) {
      return
    }

    // Check session validity periodically (every 5 minutes)
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (!session || error) {
        console.log('⚠️ Session expired or invalid, redirecting to login')
        await supabase.auth.signOut()
        router.push('/login?session_expired=true')
      }
    }

    // Initial check
    checkSession()

    // Set up periodic checks (every 5 minutes)
    const interval = setInterval(checkSession, 5 * 60 * 1000)

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event)

      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        // Don't show "session expired" for manual logout
        router.push('/login')
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed successfully')
      }

      if (event === 'USER_UPDATED') {
        console.log('👤 User updated')
      }

      // If session becomes null while on protected page (but not from manual signout)
      if (!session && !publicPaths.includes(pathname) && event !== 'SIGNED_OUT') {
        console.log('❌ Session lost on protected page')
        router.push('/login?session_expired=true')
      }
    })

    return () => {
      if (interval) clearInterval(interval)
      subscription?.unsubscribe()
    }
  }, [router, pathname, supabase])

  return null
}

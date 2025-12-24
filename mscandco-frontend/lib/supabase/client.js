/**
 * Supabase Browser Client for App Router
 * 
 * Use this in Client Components ('use client')
 * Handles authentication state on the client side
 * 
 * This file uses a build-safe pattern that prevents Supabase from being
 * evaluated during Next.js build process, while still working correctly at runtime.
 */

'use client'

// Import Supabase SSR for browser client creation
import { createBrowserClient as createBrowserClientFromSSR } from '@supabase/ssr'

// No-op client for build-time safety
const noOpClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: new Error('Build-time client') }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) })
  })
}

// Cache for the real client instance
let clientCache = null

export function createClient() {
  // CRITICAL: Only create real client in actual browser context
  // During build/server-side rendering, return no-op client immediately
  // Check multiple conditions to ensure we're truly in browser
  const isBrowser = typeof window !== 'undefined' && 
                    typeof window.document !== 'undefined' &&
                    typeof navigator !== 'undefined'
  
  if (!isBrowser) {
    // Server-side or build-time: return no-op client immediately
    // Pages using Supabase are marked as 'force-dynamic', so this is safe
    return noOpClient
  }

  // Return cached client if available (browser only)
  if (clientCache) {
    return clientCache
  }

  // Browser context only: validate config and create real client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || !supabaseUrl.trim() || !supabaseKey.trim()) {
    const errorMsg = 'Supabase configuration is missing. Please check your environment variables.'
    console.error('❌ Supabase environment variables missing', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    })
    throw new Error(errorMsg)
  }

  // In browser, use the imported createBrowserClient
  try {
    if (!createBrowserClientFromSSR || typeof createBrowserClientFromSSR !== 'function') {
      throw new Error('createBrowserClient is not available')
    }
    
    clientCache = createBrowserClientFromSSR(supabaseUrl, supabaseKey)
    
    // Verify we got a real client by checking if it has the expected methods
    if (!clientCache || !clientCache.auth || typeof clientCache.auth.signInWithPassword !== 'function') {
      throw new Error('Invalid client returned from createBrowserClient')
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Supabase client created successfully in browser', {
        hasAuth: !!clientCache.auth,
        hasSignIn: !!clientCache.auth.signInWithPassword
      })
    }
    
    return clientCache
  } catch (error) {
    // Log detailed error in development
    console.error('❌ Supabase client creation failed:', {
      error: error.message,
      isBrowser,
      hasWindow: typeof window !== 'undefined',
      hasNavigator: typeof navigator !== 'undefined',
      url: supabaseUrl ? 'present' : 'missing',
      key: supabaseKey ? 'present' : 'missing'
    })
    
    // In browser, we should NOT return no-op client - this is a real error
    // Throw the error so the app can handle it properly
    if (isBrowser) {
      throw new Error(`Failed to create Supabase client: ${error.message}. Please check your environment variables.`)
    }
    
    // Only return no-op in non-browser contexts
    return noOpClient
  }
}





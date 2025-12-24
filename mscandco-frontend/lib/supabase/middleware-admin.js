/**
 * Supabase Middleware Admin Client
 *
 * Use this in middleware.js for role-based access checks
 * Uses service role key to bypass RLS policies for internal authorization checks
 *
 * SECURITY NOTE: This bypasses RLS and should ONLY be used for:
 * - Reading user roles for authorization decisions
 * - Never expose this client to the browser
 * - Never use for data queries that go to the user
 */

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Gracefully handle missing credentials at build/edge runtime
  // Return a no-op client that will fail gracefully rather than throwing
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️ Missing Supabase credentials for admin client - returning no-op client')
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: 'Missing Supabase credentials' } })
          })
        })
      })
    }
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

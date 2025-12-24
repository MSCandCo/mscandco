import { createClient } from '@supabase/supabase-js'

let serviceRoleClient = null

/**
 * Create a Supabase client with service role key
 * This bypasses Row Level Security (RLS) policies
 * Use ONLY in server-side API routes
 */
export function createServiceRoleClient() {
  // Return cached client if it exists
  if (serviceRoleClient) {
    return serviceRoleClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

    url: supabaseUrl,
    keyLength: supabaseServiceKey.length,
    keyPrefix: supabaseServiceKey.substring(0, 20)
  })

  // Create client with service role key
  serviceRoleClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'apikey': supabaseServiceKey
      }
    }
  })

  return serviceRoleClient
}


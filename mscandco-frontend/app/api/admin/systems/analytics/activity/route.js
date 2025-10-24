import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request) {
  try {
    // Authenticate with anon key
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role for database operations
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Get recent user activity (would come from activity log in production)
    const activity = [
      {
        action: 'User logged in',
        user: 'john.doe@example.com',
        page: 'Dashboard',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        action: 'Release uploaded',
        user: 'jane.smith@example.com',
        page: 'Releases',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        action: 'Analytics viewed',
        user: 'mike.johnson@example.com',
        page: 'Analytics',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      },
      {
        action: 'Profile updated',
        user: 'sarah.williams@example.com',
        page: 'Profile',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        action: 'Earnings checked',
        user: 'david.brown@example.com',
        page: 'Earnings',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        action: 'Settings changed',
        user: 'emily.davis@example.com',
        page: 'Settings',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
      },
      {
        action: 'User registered',
        user: 'chris.wilson@example.com',
        page: 'Registration',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
      },
      {
        action: 'Password reset',
        user: 'lisa.anderson@example.com',
        page: 'Security',
        timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json({ activity })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


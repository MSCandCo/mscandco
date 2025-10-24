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

    // Calculate time range
    const now = new Date()
    let startTime = new Date()
    switch (range) {
      case '24h':
        startTime.setHours(now.getHours() - 24)
        break
      case '7d':
        startTime.setDate(now.getDate() - 7)
        break
      case '30d':
        startTime.setDate(now.getDate() - 30)
        break
      case '90d':
        startTime.setDate(now.getDate() - 90)
        break
    }

    // Get top pages (would come from analytics table in production)
    const pages = [
      { path: '/dashboard', views: 45230, avgDuration: 245 },
      { path: '/artist/releases', views: 32145, avgDuration: 312 },
      { path: '/artist/analytics', views: 28934, avgDuration: 456 },
      { path: '/artist/earnings', views: 24567, avgDuration: 189 },
      { path: '/admin/roster', views: 18923, avgDuration: 267 },
      { path: '/artist/profile', views: 15678, avgDuration: 134 },
      { path: '/notifications', views: 12456, avgDuration: 78 },
      { path: '/artist/settings', views: 9876, avgDuration: 156 }
    ]

    return NextResponse.json({ pages })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


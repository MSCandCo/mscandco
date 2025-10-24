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

    // Get total users
    const { count: totalUsers } = await serviceSupabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // Get active users (logged in within range)
    const { count: activeUsers } = await serviceSupabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', startTime.toISOString())

    // Get new users (created within range)
    const { count: newUsers } = await serviceSupabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startTime.toISOString())

    // Get session data for avg duration
    const { data: sessions } = await serviceSupabase
      .from('user_sessions')
      .select('duration')
      .gte('created_at', startTime.toISOString())

    const avgSessionDuration = sessions && sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length)
      : 0

    // Get page views
    const { count: pageViews } = await serviceSupabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', startTime.toISOString())

    // Calculate bounce rate (sessions with only 1 page view)
    const { data: bounceSessions } = await serviceSupabase
      .from('user_sessions')
      .select('page_views')
      .gte('created_at', startTime.toISOString())

    const bounceRate = bounceSessions && bounceSessions.length > 0
      ? Math.round((bounceSessions.filter(s => s.page_views === 1).length / bounceSessions.length) * 100)
      : 0

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsers: newUsers || 0,
        avgSessionDuration,
        pageViews: pageViews || 0,
        bounceRate
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


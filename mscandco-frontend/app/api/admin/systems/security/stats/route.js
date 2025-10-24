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

    // Get total count
    const { count: totalEvents } = await serviceSupabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })

    // Get critical events count
    const { count: criticalEvents } = await serviceSupabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical')

    // Get blocked attempts (failed logins + unauthorized access)
    const { count: blockedAttempts } = await serviceSupabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .in('type', ['failed_login', 'unauthorized_access'])

    // Get active threats (unresolved critical/high events in last 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: activeThreats } = await serviceSupabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .in('severity', ['critical', 'high'])
      .gte('created_at', twentyFourHoursAgo)
      .is('resolved_at', null)

    return NextResponse.json({
      stats: {
        totalEvents: totalEvents || 0,
        criticalEvents: criticalEvents || 0,
        blockedAttempts: blockedAttempts || 0,
        activeThreats: activeThreats || 0
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


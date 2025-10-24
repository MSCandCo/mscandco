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
    const range = searchParams.get('range') || '24h'

    // Calculate time range
    const now = new Date()
    let startTime = new Date()
    switch (range) {
      case '1h':
        startTime.setHours(now.getHours() - 1)
        break
      case '24h':
        startTime.setHours(now.getHours() - 24)
        break
      case '7d':
        startTime.setDate(now.getDate() - 7)
        break
      case '30d':
        startTime.setDate(now.getDate() - 30)
        break
    }

    // Get all checks in range
    const { data: checks } = await serviceSupabase
      .from('uptime_checks')
      .select('status, response_time')
      .gte('checked_at', startTime.toISOString())

    const totalChecks = checks?.length || 0
    const upChecks = checks?.filter(check => check.status === 'up').length || 0
    const overallUptime = totalChecks > 0 ? ((upChecks / totalChecks) * 100).toFixed(1) : 100

    const avgResponseTime = checks?.length > 0
      ? Math.round(checks.reduce((sum, check) => sum + check.response_time, 0) / checks.length)
      : 0

    // Get incidents
    const { data: incidents } = await serviceSupabase
      .from('uptime_incidents')
      .select('*')
      .gte('created_at', startTime.toISOString())

    const totalIncidents = incidents?.length || 0
    const activeIncidents = incidents?.filter(incident => incident.status !== 'resolved').length || 0

    return NextResponse.json({
      stats: {
        overallUptime: parseFloat(overallUptime),
        avgResponseTime,
        totalIncidents,
        activeIncidents
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


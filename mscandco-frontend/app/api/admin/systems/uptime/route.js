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

    const { data: services, error } = await serviceSupabase
      .from('uptime_monitors')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch recent checks for each service
    const servicesWithHistory = await Promise.all(
      services.map(async (service) => {
        const { data: checks } = await serviceSupabase
          .from('uptime_checks')
          .select('status, response_time, checked_at')
          .eq('monitor_id', service.id)
          .order('checked_at', { ascending: false })
          .limit(24)

        const history = checks?.map(check => check.status) || []
        const avgResponseTime = checks?.length > 0
          ? Math.round(checks.reduce((sum, check) => sum + check.response_time, 0) / checks.length)
          : 0

        const upChecks = checks?.filter(check => check.status === 'up').length || 0
        const uptime = checks?.length > 0 ? ((upChecks / checks.length) * 100).toFixed(2) : 100

        return {
          ...service,
          history,
          responseTime: avgResponseTime,
          uptime: parseFloat(uptime),
          lastCheck: checks?.[0]?.checked_at || new Date().toISOString()
        }
      })
    )

    return NextResponse.json({ services: servicesWithHistory })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


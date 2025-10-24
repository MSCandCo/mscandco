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

    const { data: incidents, error } = await serviceSupabase
      .from('uptime_incidents')
      .select(`
        *,
        uptime_monitors (name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedIncidents = incidents.map(incident => ({
      ...incident,
      service: incident.uptime_monitors?.name || 'Unknown Service'
    }))

    return NextResponse.json({ incidents: formattedIncidents })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


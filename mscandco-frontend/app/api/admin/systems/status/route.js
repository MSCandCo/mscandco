import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const cookieStore = cookies()
    
    // Authenticate user
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set(name, value, options)
          },
          remove(name, options) {
            cookieStore.set(name, '', options)
          }
        }
      }
    )

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role for database operations
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        cookies: {
          get() { return undefined },
          set() {},
          remove() {}
        }
      }
    )

    // Fetch system status from various sources
    const [
      errorsData,
      auditLogsData,
      notificationsData
    ] = await Promise.all([
      // Error tracking - count errors in last 24h from audit_logs
      supabaseAdmin
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'error')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      // Total audit logs
      supabaseAdmin
        .from('audit_logs')
        .select('id', { count: 'exact', head: true }),
      
      // Notifications sent today
      supabaseAdmin
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0])
    ])

    const systemStatus = {
      errors: {
        status: (errorsData.count || 0) > 100 ? 'warning' : 'healthy',
        count: errorsData.count || 0
      },
      rateLimit: {
        status: 'healthy',
        blocked: 0 // TODO: Implement rate limit tracking
      },
      logs: {
        status: 'healthy',
        size: `${Math.round((auditLogsData.count || 0) / 1000)}K entries`
      },
      backups: {
        status: 'healthy',
        lastBackup: 'Today' // TODO: Get actual backup time from Supabase
      },
      uptime: {
        status: 'healthy',
        percentage: 99.9 // TODO: Implement actual uptime tracking
      },
      security: {
        status: 'healthy',
        alerts: 0 // TODO: Implement security alerts
      },
      performance: {
        status: 'healthy',
        avgResponseTime: 250 // TODO: Implement actual performance tracking
      },
      analytics: {
        status: 'active',
        activeUsers: 0 // TODO: Get from analytics
      },
      email: {
        status: 'active',
        sent: notificationsData.count || 0
      },
      docs: {
        status: 'active',
        pages: 25 // Static count for now
      }
    }

    return NextResponse.json(systemStatus)

  } catch (error) {
    console.error('Error fetching system status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system status' },
      { status: 500 }
    )
  }
}


import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const cookieStore = cookies()
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const timeRange = searchParams.get('timeRange') || '24h'
    
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

    // Calculate time range
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    const startTime = new Date(Date.now() - timeRanges[timeRange]).toISOString()

    // Build query
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('status', 'error')
      .gte('created_at', startTime)
      .order('created_at', { ascending: false })
      .limit(100)

    // Apply filter
    if (filter !== 'all') {
      // Map filter to action patterns
      const actionPatterns = {
        'critical': ['database_error', 'auth_error', 'payment_error'],
        'warning': ['permission_denied', 'validation_error'],
        'info': ['info', 'debug']
      }
      if (actionPatterns[filter]) {
        query = query.in('action', actionPatterns[filter])
      }
    }

    const { data: errors, error: errorsError } = await query

    if (errorsError) {
      throw errorsError
    }

    // Calculate stats
    const { data: allErrors } = await supabaseAdmin
      .from('audit_logs')
      .select('id, status, action')
      .eq('status', 'error')
      .gte('created_at', startTime)

    const { data: previousErrors } = await supabaseAdmin
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'error')
      .lt('created_at', startTime)
      .gte('created_at', new Date(Date.now() - 2 * timeRanges[timeRange]).toISOString())

    const stats = {
      total: allErrors?.length || 0,
      critical: allErrors?.filter(e => 
        ['database_error', 'auth_error', 'payment_error'].includes(e.action)
      ).length || 0,
      resolved: 0, // TODO: Add resolved tracking
      trend: previousErrors?.count > 0 
        ? Math.round(((allErrors?.length || 0) - previousErrors.count) / previousErrors.count * 100)
        : 0
    }

    return NextResponse.json({ errors, stats })

  } catch (error) {
    console.error('Error fetching errors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    )
  }
}


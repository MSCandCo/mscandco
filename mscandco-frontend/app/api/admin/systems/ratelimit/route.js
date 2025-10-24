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

    const { data: rules, error } = await serviceSupabase
      .from('rate_limit_rules')
      .select('*')
      .order('endpoint', { ascending: true })

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no rules, return defaults
    const defaultRules = [
      {
        id: '1',
        endpoint: '/api/artist/releases',
        limit: 100,
        window: 60,
        enabled: true,
        description: 'Artist releases endpoint'
      },
      {
        id: '2',
        endpoint: '/api/admin/analytics',
        limit: 50,
        window: 60,
        enabled: true,
        description: 'Admin analytics endpoint'
      },
      {
        id: '3',
        endpoint: '/api/earnings/calculate',
        limit: 30,
        window: 60,
        enabled: true,
        description: 'Earnings calculation endpoint'
      },
      {
        id: '4',
        endpoint: '/api/auth/login',
        limit: 5,
        window: 300,
        enabled: true,
        description: 'Login endpoint (5 per 5 min)'
      }
    ]

    return NextResponse.json({ 
      rules: rules && rules.length > 0 ? rules : defaultRules 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
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

    const body = await request.json()
    const { endpoint, limit, window, description } = body

    if (!endpoint || !limit || !window) {
      return NextResponse.json({ error: 'Endpoint, limit, and window are required' }, { status: 400 })
    }

    const { data: rule, error } = await serviceSupabase
      .from('rate_limit_rules')
      .insert({
        endpoint,
        limit,
        window,
        description: description || '',
        enabled: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rule }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


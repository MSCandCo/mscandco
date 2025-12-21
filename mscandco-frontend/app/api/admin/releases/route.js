import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * GET /api/admin/releases
 * Fetch releases for admin (can filter by artist_id and status)
 */
export async function GET(request) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin', 'label_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const artist_id = searchParams.get('artist_id')
    const status = searchParams.get('status')

    console.log(`📋 Fetching releases (artist_id: ${artist_id}, status: ${status})`)

    // Build query
    let query = supabaseAdmin
      .from('releases')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by artist_id if provided
    if (artist_id) {
      query = query.eq('artist_id', artist_id)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: releases, error } = await query

    if (error) {
      console.error('❌ Error fetching releases:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch releases',
          message: error.message,
          details: error.details
        },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${releases?.length || 0} releases`)

    // Return as array (matching what AddEarningsForm expects)
    return NextResponse.json(releases || [])

  } catch (error) {
    console.error('❌ Admin releases API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    )
  }
}


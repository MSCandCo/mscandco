import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/marketing/segments
 * List all saved audience segments
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = await createServiceRoleClient()
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    let query = supabaseAdmin
      .from('audience_segments')
      .select('*')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: segments, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, segments: segments || [] })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/marketing/segments
 * Create a new saved audience segment
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = await createServiceRoleClient()
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, filters } = body

    if (!name || !filters) {
      return NextResponse.json({ error: 'Name and filters are required' }, { status: 400 })
    }

    // Calculate estimated count
    const recipients = await buildRecipientQuery(supabaseAdmin, filters)
    const estimatedCount = recipients.length

    const { data: segment, error } = await supabaseAdmin
      .from('audience_segments')
      .insert({
        name,
        description,
        filters,
        estimated_count: estimatedCount,
        last_calculated_at: new Date().toISOString(),
        created_by: session.user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, segment })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function buildRecipientQuery(supabaseAdmin, filters) {
  let query = supabaseAdmin
    .from('user_profiles')
    .select('id')

  if (filters.roles?.length > 0) query = query.in('role', filters.roles)
  if (filters.cities?.length > 0) query = query.in('city', filters.cities)
  if (filters.countries?.length > 0) query = query.in('nationality', filters.countries)
  if (filters.subscriptionTiers?.length > 0) query = query.in('subscription_tier', filters.subscriptionTiers)
  if (filters.lastLoginDays) {
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - filters.lastLoginDays)
    query = query.or(`last_active_at.lt.${daysAgo.toISOString()},and(last_active_at.is.null,created_at.lt.${daysAgo.toISOString()})`)
  }

  const { data } = await query
  return data || []
}


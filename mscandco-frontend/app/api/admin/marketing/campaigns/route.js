import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/marketing/campaigns
 * List all email campaigns
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin permissions
    const supabaseAdmin = await createServiceRoleClient()
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin', 'marketing_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('email_campaigns')
      .select(`
        *,
        creator:user_profiles(id, email, display_name, first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || []
    })

  } catch (error) {
    console.error('Error in GET /api/admin/marketing/campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/marketing/campaigns
 * Create a new email campaign
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin permissions
    const supabaseAdmin = await createServiceRoleClient()
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin', 'marketing_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      subject,
      body_html,
      body_text,
      filters,
      template_id,
      scheduled_for
    } = body

    // Validate required fields
    if (!name || !subject || !body_html || !filters) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'name, subject, body_html, and filters are required' },
        { status: 400 }
      )
    }

    // Create campaign
    const { data: campaign, error } = await supabaseAdmin
      .from('email_campaigns')
      .insert({
        name,
        description,
        subject,
        body_html,
        body_text,
        filters,
        template_id,
        scheduled_for: scheduled_for || null,
        status: scheduled_for ? 'scheduled' : 'draft',
        created_by: session.user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
      return NextResponse.json(
        { error: 'Failed to create campaign', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Error in POST /api/admin/marketing/campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


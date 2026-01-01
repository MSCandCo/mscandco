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
    const archived = searchParams.get('archived') // 'true' to show archived, 'false' or undefined to show active, 'all' to show all

    let query = supabaseAdmin
      .from('email_campaigns')
      .select(`
        *,
        creator:user_profiles(id, email, display_name, first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    // Filter by archived status
    if (archived === 'true') {
      query = query.eq('is_archived', true)
    } else if (archived === 'all') {
      // Show all campaigns (both archived and non-archived) - for stats
      // Don't filter by is_archived
    } else {
      // Default: show only non-archived campaigns
      query = query.eq('is_archived', false)
    }

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
      scheduled_for,
      status,
      total_recipients
    } = body

    // For drafts, allow minimal validation (just name is required)
    const isDraft = status === 'draft' || (!scheduled_for && !status)
    
    if (!isDraft) {
      // Validate required fields for non-drafts
      if (!name || !subject || !body_html || !filters) {
        return NextResponse.json(
          { error: 'Missing required fields', message: 'name, subject, body_html, and filters are required' },
          { status: 400 }
        )
      }
    } else {
      // For drafts, only name is required
      if (!name) {
        return NextResponse.json(
          { error: 'Missing required fields', message: 'Campaign name is required' },
          { status: 400 }
        )
      }
    }

    // Create campaign
    // Debug: Log what we're about to insert
    const insertData = {
      name,
      description: description || null,
      subject: subject || null,
      body_html: body_html || null,
      body_text: body_text || null,
      filters: filters || {},
      template_id: template_id || null,
      scheduled_for: scheduled_for || null,
      status: status || (scheduled_for ? 'scheduled' : 'draft'),
      total_recipients: total_recipients || 0,
      created_by: session.user.id
    }
    
    console.log('Attempting to create campaign with service role client:', {
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      insertDataKeys: Object.keys(insertData),
      status: insertData.status
    })
    
    const { data: campaign, error } = await supabaseAdmin
      .from('email_campaigns')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
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


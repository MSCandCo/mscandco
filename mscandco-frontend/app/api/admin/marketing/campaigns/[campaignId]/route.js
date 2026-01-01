import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/marketing/campaigns/[campaignId]
 * Get a specific campaign
 */
export async function GET(request, { params }) {
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

    const { campaignId } = params

    const { data: campaign, error } = await supabaseAdmin
      .from('email_campaigns')
      .select(`
        *,
        creator:user_profiles!email_campaigns_created_by_fkey(id, email, display_name, first_name, last_name)
      `)
      .eq('id', campaignId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch campaign', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Error in GET /api/admin/marketing/campaigns/[campaignId]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/marketing/campaigns/[campaignId]
 * Update a campaign
 */
export async function PUT(request, { params }) {
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

    const { campaignId } = params
    const body = await request.json()

    // Ensure status is preserved or set appropriately
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // If saving as draft, ensure status is draft
    if (body.status === 'draft' || (!body.status && !body.scheduled_for)) {
      updateData.status = 'draft'
    }

    const { data: campaign, error } = await supabaseAdmin
      .from('email_campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign:', error)
      return NextResponse.json(
        { error: 'Failed to update campaign', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Error in PUT /api/admin/marketing/campaigns/[campaignId]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/marketing/campaigns/[campaignId]
 * Archive a campaign (soft delete)
 */
export async function DELETE(request, { params }) {
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

    const { campaignId } = params

    // Archive the campaign instead of deleting
    const { data: campaign, error } = await supabaseAdmin
      .from('email_campaigns')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      console.error('Error archiving campaign:', error)
      return NextResponse.json(
        { error: 'Failed to archive campaign', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign archived successfully',
      campaign
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/marketing/campaigns/[campaignId]:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


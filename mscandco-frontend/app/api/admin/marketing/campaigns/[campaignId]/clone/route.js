import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/marketing/campaigns/[campaignId]/clone
 * Clone an existing campaign
 */
export async function POST(request, { params }) {
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

    const { campaignId } = params
    const body = await request.json()
    const { name } = body // Optional new name

    // Get original campaign
    const { data: originalCampaign, error: campaignError } = await supabaseAdmin
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !originalCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Create cloned campaign
    const { data: clonedCampaign, error: cloneError } = await supabaseAdmin
      .from('email_campaigns')
      .insert({
        name: name || `${originalCampaign.name} (Copy)`,
        description: originalCampaign.description,
        subject: originalCampaign.subject,
        body_html: originalCampaign.body_html,
        body_text: originalCampaign.body_text,
        filters: originalCampaign.filters,
        template_id: originalCampaign.template_id,
        status: 'draft', // Always clone as draft
        cloned_from_id: campaignId,
        created_by: session.user.id
      })
      .select()
      .single()

    if (cloneError) {
      return NextResponse.json({ error: cloneError.message }, { status: 500 })
    }

    // Update clone count on original
    await supabaseAdmin
      .from('email_campaigns')
      .update({ clone_count: (originalCampaign.clone_count || 0) + 1 })
      .eq('id', campaignId)

    return NextResponse.json({
      success: true,
      campaign: clonedCampaign,
      message: 'Campaign cloned successfully'
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


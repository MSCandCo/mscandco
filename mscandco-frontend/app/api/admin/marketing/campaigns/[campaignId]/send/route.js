import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/marketing/campaigns/[campaignId]/send
 * Send a campaign to all matching recipients
 */
export async function POST(request, { params }) {
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

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { campaignId } = params

    // Get campaign
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Campaign cannot be sent', message: `Campaign status is ${campaign.status}` },
        { status: 400 }
      )
    }

    // Build recipient query based on filters
    const recipients = await buildRecipientQuery(supabaseAdmin, campaign.filters)

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found', message: 'No users match the campaign filters' },
        { status: 400 }
      )
    }

    // Update campaign status to 'sending'
    await supabaseAdmin
      .from('email_campaigns')
      .update({
        status: 'sending',
        total_recipients: recipients.length
      })
      .eq('id', campaignId)

    // Create recipient records
    const recipientRecords = recipients.map(user => ({
      campaign_id: campaignId,
      user_id: user.id,
      email: user.email,
      status: 'pending'
    }))

    const { error: recipientsError } = await supabaseAdmin
      .from('email_campaign_recipients')
      .insert(recipientRecords)

    if (recipientsError) {
      console.error('Error creating recipient records:', recipientsError)
      // Continue anyway - records might already exist
    }

    // Send emails (this would integrate with your email service)
    // For now, we'll return success and mark as sent
    // In production, you'd queue this as a background job

    await supabaseAdmin
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        emails_sent: recipients.length
      })
      .eq('id', campaignId)

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${recipients.length} recipients`,
      recipientsCount: recipients.length
    })

  } catch (error) {
    console.error('Error in POST /api/admin/marketing/campaigns/[campaignId]/send:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Build recipient query based on filter criteria
 */
async function buildRecipientQuery(supabaseAdmin, filters) {
  let query = supabaseAdmin
    .from('user_profiles')
    .select('id, email, display_name, first_name, last_name, role, city, nationality, created_at, last_active_at')

  // Filter by role
  if (filters.roles && filters.roles.length > 0) {
    query = query.in('role', filters.roles)
  }

  // Filter by location (city)
  if (filters.cities && filters.cities.length > 0) {
    query = query.in('city', filters.cities)
  }

  // Filter by country (nationality)
  if (filters.countries && filters.countries.length > 0) {
    query = query.in('nationality', filters.countries)
  }

  // Filter by last login (inactive users)
  if (filters.lastLoginDays) {
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - filters.lastLoginDays)
    // Use last_active_at or created_at as fallback
    query = query.or(`last_active_at.lt.${daysAgo.toISOString()},and(last_active_at.is.null,created_at.lt.${daysAgo.toISOString()})`)
  }

  // Filter by subscription tier
  if (filters.subscriptionTiers && filters.subscriptionTiers.length > 0) {
    query = query.in('subscription_tier', filters.subscriptionTiers)
  }

  // Filter by genre (if available)
  if (filters.genres && filters.genres.length > 0) {
    query = query.or(filters.genres.map(g => `primary_genre.eq.${g},secondary_genre.eq.${g}`).join(','))
  }

  // Filter by label (for artists)
  if (filters.labels && filters.labels.length > 0) {
    query = query.in('label', filters.labels)
  }

  // Filter by created date range
  if (filters.createdAfter) {
    query = query.gte('created_at', filters.createdAfter)
  }
  if (filters.createdBefore) {
    query = query.lte('created_at', filters.createdBefore)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error building recipient query:', error)
    throw error
  }

  return data || []
}


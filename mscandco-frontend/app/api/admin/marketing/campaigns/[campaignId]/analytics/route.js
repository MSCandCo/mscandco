import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/marketing/campaigns/[campaignId]/analytics
 * Get detailed analytics for a campaign
 */
export async function GET(request, { params }) {
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
    const { searchParams } = new URL(request.url)
    const includeTimeSeries = searchParams.get('timeSeries') === 'true'

    // Get campaign
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get recipient stats
    const { data: recipients, error: recipientsError } = await supabaseAdmin
      .from('email_campaign_recipients')
      .select('status, opened_at, clicked_at, device_type, email_client')
      .eq('campaign_id', campaignId)

    if (recipientsError) {
      return NextResponse.json({ error: recipientsError.message }, { status: 500 })
    }

    // Calculate metrics
    const total = recipients.length
    const sent = recipients.filter(r => r.status === 'sent' || r.status === 'delivered' || r.status === 'opened' || r.status === 'clicked').length
    const delivered = recipients.filter(r => r.status === 'delivered' || r.status === 'opened' || r.status === 'clicked').length
    const opened = recipients.filter(r => r.opened_at).length
    const clicked = recipients.filter(r => r.clicked_at).length
    const bounced = recipients.filter(r => r.status === 'bounced').length
    const failed = recipients.filter(r => r.status === 'failed').length

    // Device breakdown
    const deviceBreakdown = {
      desktop: recipients.filter(r => r.device_type === 'desktop').length,
      mobile: recipients.filter(r => r.device_type === 'mobile').length,
      tablet: recipients.filter(r => r.device_type === 'tablet').length,
      unknown: recipients.filter(r => !r.device_type || r.device_type === 'unknown').length
    }

    // Email client breakdown
    const clientBreakdown = recipients.reduce((acc, r) => {
      const client = r.email_client || 'unknown'
      acc[client] = (acc[client] || 0) + 1
      return acc
    }, {})

    // Time series data (if requested)
    let timeSeriesData = []
    if (includeTimeSeries && campaign.sent_at) {
      // Get snapshots or calculate hourly data
      const { data: snapshots } = await supabaseAdmin
        .from('campaign_analytics_snapshots')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('snapshot_time', { ascending: true })

      if (snapshots && snapshots.length > 0) {
        timeSeriesData = snapshots.map(s => ({
          time: s.snapshot_time,
          sent: s.emails_sent,
          delivered: s.emails_delivered,
          opened: s.emails_opened,
          clicked: s.emails_clicked,
          openRate: s.open_rate,
          clickRate: s.click_rate
        }))
      }
    }

    // Engagement timeline
    const engagementTimeline = []
    if (campaign.sent_at) {
      const startDate = new Date(campaign.sent_at)
      const now = new Date()
      const hoursDiff = Math.ceil((now - startDate) / (1000 * 60 * 60))
      
      for (let i = 0; i <= Math.min(hoursDiff, 168); i++) { // Up to 7 days
        const hourDate = new Date(startDate.getTime() + i * 60 * 60 * 1000)
        const hourOpened = recipients.filter(r => {
          if (!r.opened_at) return false
          const openedDate = new Date(r.opened_at)
          return openedDate <= hourDate && openedDate > new Date(startDate.getTime() + (i - 1) * 60 * 60 * 1000)
        }).length
        const hourClicked = recipients.filter(r => {
          if (!r.clicked_at) return false
          const clickedDate = new Date(r.clicked_at)
          return clickedDate <= hourDate && clickedDate > new Date(startDate.getTime() + (i - 1) * 60 * 60 * 1000)
        }).length

        engagementTimeline.push({
          hour: i,
          timestamp: hourDate.toISOString(),
          opened: hourOpened,
          clicked: hourClicked,
          cumulativeOpened: recipients.filter(r => r.opened_at && new Date(r.opened_at) <= hourDate).length,
          cumulativeClicked: recipients.filter(r => r.clicked_at && new Date(r.clicked_at) <= hourDate).length
        })
      }
    }

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalRecipients: total,
          sent,
          delivered,
          opened,
          clicked,
          bounced,
          failed,
          deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(2) : 0,
          openRate: delivered > 0 ? ((opened / delivered) * 100).toFixed(2) : 0,
          clickRate: delivered > 0 ? ((clicked / delivered) * 100).toFixed(2) : 0,
          clickToOpenRate: opened > 0 ? ((clicked / opened) * 100).toFixed(2) : 0,
          bounceRate: total > 0 ? ((bounced / total) * 100).toFixed(2) : 0
        },
        deviceBreakdown,
        clientBreakdown,
        engagementTimeline,
        timeSeriesData
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


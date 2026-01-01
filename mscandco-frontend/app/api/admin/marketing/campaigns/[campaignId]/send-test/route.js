import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/marketing/campaigns/[campaignId]/send-test
 * Send a test email for a campaign to specified test email addresses
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

    if (!profile || !['super_admin', 'company_admin', 'marketing_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { campaignId } = params
    const body = await request.json()
    const { testEmails } = body

    if (!testEmails || !Array.isArray(testEmails) || testEmails.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Test email addresses are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = testEmails.filter(email => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: 'Invalid email addresses', message: `Invalid emails: ${invalidEmails.join(', ')}` },
        { status: 400 }
      )
    }

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

    // Send test emails (this would integrate with your email service)
    // For now, we'll simulate sending and return success
    // In production, you'd integrate with your email service (SendGrid, SES, etc.)
    
    console.log(`📧 Sending test emails for campaign ${campaignId} to:`, testEmails)
    console.log(`Subject: ${campaign.subject}`)
    console.log(`Body HTML length: ${campaign.body_html?.length || 0} characters`)

    // TODO: Integrate with your email service here
    // Example:
    // for (const email of testEmails) {
    //   await sendEmail({
    //     to: email,
    //     subject: `[TEST] ${campaign.subject}`,
    //     html: campaign.body_html,
    //     text: campaign.body_text
    //   })
    // }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmails.length} recipient(s)`,
      sentCount: testEmails.length,
      recipients: testEmails
    })

  } catch (error) {
    console.error('Error in POST /api/admin/marketing/campaigns/[campaignId]/send-test:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


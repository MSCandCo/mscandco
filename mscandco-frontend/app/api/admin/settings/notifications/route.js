import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();
}
/**
 * GET /api/admin/settings/notifications
 * Get user notification settings
 */
export async function GET(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Get notification settings from user_profiles or email_preferences table
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('email_preferences, notification_settings')
      .eq('id', session.user.id)
      .single()

    // Default notification settings
    const defaultSettings = {
      email_new_release: true,
      email_earnings_update: true,
      email_roster_changes: true,
      email_system_updates: true,
      email_weekly_summary: false,
      email_monthly_report: true
    }

    const settings = profile?.notification_settings || profile?.email_preferences || defaultSettings

    return NextResponse.json({
      success: true,
      settings
    })

  } catch (error) {
    console.error('Error in notifications GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings/notifications
 * Update user notification settings
 */
export async function PUT(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings are required' },
        { status: 400 }
      )
    }

    // Update notification settings
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        notification_settings: settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating notification settings:', updateError)
      return NextResponse.json(
        { error: 'Failed to update notification settings', message: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      settings
    })

  } catch (error) {
    console.error('Error in notifications PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}


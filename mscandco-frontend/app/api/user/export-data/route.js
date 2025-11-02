import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/user/export-data
 *
 * GDPR Right to Data Portability - Export all user data
 *
 * Returns a comprehensive JSON export of all user data including:
 * - Profile information
 * - Earnings and wallet history
 * - Releases
 * - Notifications
 * - Settings
 * - Any other personal data
 *
 * GDPR Article 20: Right to data portability
 */
export async function GET(request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`📦 Data export requested by user: ${user.id} (${user.email})`)

    // Collect all user data
    const exportData = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      sections: {}
    }

    // 1. Profile Data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      exportData.sections.profile = profile
    }

    // 2. Earnings Data
    const { data: earnings } = await supabase
      .from('earnings_log')
      .select('*')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })

    if (earnings) {
      exportData.sections.earnings = earnings
    }

    // 3. Releases Data (if applicable)
    const { data: releases } = await supabase
      .from('releases')
      .select('*')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false })

    if (releases) {
      exportData.sections.releases = releases
    }

    // 4. Notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (notifications) {
      exportData.sections.notifications = notifications
    }

    // 5. Affiliation Requests (for artists)
    const { data: affiliations } = await supabase
      .from('affiliation_requests')
      .select('*')
      .or(`artist_id.eq.${user.id},label_admin_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (affiliations) {
      exportData.sections.affiliations = affiliations
    }

    // 6. Settings/Preferences
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settings) {
      exportData.sections.settings = settings
    }

    // Calculate data summary
    exportData.summary = {
      profile_exists: !!profile,
      total_earnings_records: earnings?.length || 0,
      total_releases: releases?.length || 0,
      total_notifications: notifications?.length || 0,
      total_affiliations: affiliations?.length || 0,
      has_settings: !!settings
    }

    console.log(`✅ Data export completed for user: ${user.id}`)

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mscandco-data-export-${user.id}-${Date.now()}.json"`
      }
    })

  } catch (error) {
    console.error('Error in data export API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}

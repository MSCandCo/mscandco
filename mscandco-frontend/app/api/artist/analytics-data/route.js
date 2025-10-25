import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/artist/analytics-data
 * Fetch artist analytics data from user_profiles table
 */
export async function GET(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artistId = user.id
    console.log('📊 Fetching analytics data for artist:', artistId)

    // Fetch analytics data from user_profiles table
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('analytics_data')
      .eq('id', artistId)
      .single()

    if (error) {
      console.error('Error fetching analytics:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    // Extract analytics data from profile
    const analyticsData = profile?.analytics_data || {}

    // If no analytics data exists, return empty structure
    if (!analyticsData || Object.keys(analyticsData).length === 0) {
      console.log('No analytics data found for artist:', artistId)
      return NextResponse.json({
        success: true,
        data: {
          latestRelease: null,
          milestones: [],
          sectionVisibility: {},
          advancedData: {}
        }
      })
    }

    console.log('✅ Analytics data found:', {
      hasLatestRelease: !!analyticsData.latestRelease,
      milestonesCount: analyticsData.milestones?.length || 0
    })

    // Return formatted analytics data
    return NextResponse.json({
      success: true,
      data: {
        latestRelease: analyticsData.latestRelease || null,
        milestones: analyticsData.milestones || [],
        sectionVisibility: analyticsData.sectionVisibility || {},
        advancedData: analyticsData.advancedData || {}
      }
    })

  } catch (error) {
    console.error('❌ Analytics data API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}


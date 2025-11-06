import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/artist/analytics-data?artistId=xxx (optional)
 * Fetch artist analytics data from user_profiles table
 * If artistId is provided (for label admins), fetch that artist's data
 * Otherwise, fetch the logged-in user's data
 */
export async function GET(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if artistId is provided in query params (for label admins viewing artist analytics)
    const { searchParams } = new URL(request.url)
    const requestedArtistId = searchParams.get('artistId')
    
    // Use requested artistId if provided, otherwise use logged-in user's ID
    const artistId = requestedArtistId || user.id
    
    // If requesting another artist's data, verify permission (label admin must have affiliation)
    if (requestedArtistId && requestedArtistId !== user.id) {
      // Check if user is a label admin with affiliation to this artist
      const { data: affiliation } = await supabase
        .from('label_artist_affiliations')
        .select('id')
        .eq('label_admin_id', user.id)
        .eq('artist_id', requestedArtistId)
        .eq('status', 'active')
        .maybeSingle()
      
      if (!affiliation) {
        // Check if user is super admin or company admin (they can access any analytics)
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        
        const userRole = profile?.role || user.user_metadata?.role
        if (userRole !== 'super_admin' && userRole !== 'company_admin') {
          return NextResponse.json(
            { error: 'Unauthorized: You do not have access to this artist\'s analytics' },
            { status: 403 }
          )
        }
      }
    }
    
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


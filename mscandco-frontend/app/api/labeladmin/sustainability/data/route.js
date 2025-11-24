import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/labeladmin/sustainability/data
 * Fetch aggregated sustainability data from all affiliated artists
 */
export async function GET(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const labelAdminId = user.id
    console.log('🌱 Fetching sustainability data for label admin:', labelAdminId)

    // Get all affiliated artist IDs
    const { data: affiliations, error: affiliationsError } = await supabase
      .from('label_artist_affiliations')
      .select('artist_id')
      .eq('label_admin_id', labelAdminId)
      .eq('status', 'active')

    if (affiliationsError) {
      console.error('❌ Error fetching affiliations:', affiliationsError)
      return NextResponse.json(
        { error: 'Failed to fetch affiliations', details: affiliationsError.message },
        { status: 500 }
      )
    }

    const artistIds = affiliations?.map(row => row.artist_id) || []

    if (artistIds.length === 0) {
      console.log('✅ No affiliated artists found')
      return NextResponse.json({
        success: true,
        data: {
          carbonData: [],
          offsets: [],
          sustainabilityProfiles: [],
          achievements: [],
          releases: []
        }
      })
    }

    console.log(`📊 Found ${artistIds.length} affiliated artists`)

    // Fetch all releases from these artists
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('id, title, artist_id, release_date')
      .in('artist_id', artistIds)

    if (releasesError) {
      console.error('❌ Error fetching releases:', releasesError)
      return NextResponse.json(
        { error: 'Failed to fetch releases', details: releasesError.message },
        { status: 500 }
      )
    }

    const releaseIds = releases?.map(r => r.id) || []

    // Fetch carbon footprint tracking for all releases
    // Note: carbon_footprint_tracking uses user_id (artist_id) and release_id
    let carbonData = []
    if (releaseIds.length > 0) {
      const { data: carbonTracking, error: carbonError } = await supabase
        .from('carbon_footprint_tracking')
        .select('*')
        .in('release_id', releaseIds)
        .in('user_id', artistIds) // Also filter by artist IDs for safety

      if (carbonError) {
        console.error('❌ Error fetching carbon tracking:', carbonError)
        // Don't fail if carbon tracking doesn't exist
      } else {
        carbonData = carbonTracking || []
      }
    }

    // Fetch offset transactions for all artists
    const { data: offsets, error: offsetsError } = await supabase
      .from('carbon_offset_transactions')
      .select('*')
      .in('user_id', artistIds)
      .order('created_at', { ascending: false })

    if (offsetsError) {
      console.error('❌ Error fetching offsets:', offsetsError)
      // Don't fail if offsets don't exist
    }

    // Fetch sustainability profiles for all artists
    const { data: profiles, error: profilesError } = await supabase
      .from('sustainability_profiles')
      .select('*')
      .in('user_id', artistIds)

    if (profilesError) {
      console.error('❌ Error fetching sustainability profiles:', profilesError)
      // Don't fail if profiles don't exist
    }

    // Fetch achievements for all artists
    const { data: achievements, error: achievementsError } = await supabase
      .from('sustainability_achievements')
      .select('*')
      .in('user_id', artistIds)
      .order('earned_at', { ascending: false })

    if (achievementsError) {
      console.error('❌ Error fetching achievements:', achievementsError)
      // Don't fail if achievements don't exist
    }

    // Fetch artist profiles for names
    const { data: artistProfiles, error: artistProfilesError } = await supabase
      .from('user_profiles')
      .select('id, artist_name, first_name, last_name')
      .in('id', artistIds)

    if (artistProfilesError) {
      console.error('❌ Error fetching artist profiles:', artistProfilesError)
    }

    // Create artist name map
    const artistNameMap = {}
    artistProfiles?.forEach(profile => {
      artistNameMap[profile.id] = profile.artist_name || 
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
        'Unknown Artist'
    })

    // Create release name map
    const releaseNameMap = {}
    releases?.forEach(release => {
      releaseNameMap[release.id] = release.title
    })

    // Enrich carbon data with artist and release names
    const enrichedCarbonData = carbonData.map(item => ({
      ...item,
      artist_name: artistNameMap[item.user_id] || 'Unknown Artist',
      release_title: releaseNameMap[item.release_id] || 'Unknown Release'
    }))

    console.log(`✅ Loaded sustainability data: ${enrichedCarbonData.length} carbon records, ${offsets?.length || 0} offsets`)

    return NextResponse.json({
      success: true,
      data: {
        carbonData: enrichedCarbonData,
        offsets: offsets || [],
        sustainabilityProfiles: profiles || [],
        achievements: achievements || [],
        releases: releases || []
      }
    })

  } catch (error) {
    console.error('❌ Label admin sustainability API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


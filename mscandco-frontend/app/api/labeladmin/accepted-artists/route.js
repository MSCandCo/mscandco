import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * GET /api/labeladmin/accepted-artists
 * Fetch all artists that have accepted affiliation with this label admin
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const labelAdminId = user.id
    console.log('👥 Fetching accepted artists for label admin:', labelAdminId)

    // Get all active affiliations for this label admin using service role
    const { data: affiliations, error: affiliationsError } = await supabase
      .from('label_artist_affiliations')
      .select('id, artist_id, label_percentage, status, created_at')
      .eq('label_admin_id', labelAdminId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (affiliationsError) {
      console.error('❌ Error fetching affiliations:', affiliationsError)
      return NextResponse.json(
        { error: 'Failed to fetch affiliations', details: affiliationsError.message },
        { status: 500 }
      )
    }

    // If no affiliations, return empty array
    if (!affiliations || affiliations.length === 0) {
      console.log('✅ No accepted artists found for label admin')
      return NextResponse.json({
        success: true,
        artists: [],
        count: 0
      })
    }

    // Fetch artist profiles using service role
    const artistIds = affiliations.map(a => a.artist_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name, phone, country, city, primary_genre, profile_picture_url')
      .in('id', artistIds)

    if (profilesError) {
      console.error('❌ Error fetching artist profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch artist profiles', details: profilesError.message },
        { status: 500 }
      )
    }

    // Create a map of profiles by ID for easy lookup
    const profileMap = {}
    profiles.forEach(profile => {
      profileMap[profile.id] = profile
    })

    // Batch fetch all releases at once
    const { data: allReleases, error: releasesError } = await supabase
      .from('releases')
      .select('id, artist_id, status')
      .in('artist_id', artistIds)

    if (releasesError) {
      console.error('❌ Error fetching releases:', releasesError)
      // Don't fail if releases can't be fetched, just continue without release counts
    }

    const releases = allReleases || []
    
    // Group releases by artist_id for fast lookup
    const releasesByArtist = {}
    releases.forEach(release => {
      if (!releasesByArtist[release.artist_id]) {
        releasesByArtist[release.artist_id] = []
      }
      releasesByArtist[release.artist_id].push(release)
    })

    // Transform the data for frontend consumption
    const artistsWithCounts = affiliations.map((affiliation) => {
      const profile = profileMap[affiliation.artist_id]
      const artistReleases = releasesByArtist[affiliation.artist_id] || []
      
      const totalReleases = artistReleases.length
      const liveReleases = artistReleases.filter(r => r.status === 'live').length
      const draftReleases = artistReleases.filter(r => r.status === 'draft').length

      return {
        affiliationId: affiliation.id,
        artistId: affiliation.artist_id,
        artistName: profile?.artist_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Unknown Artist',
        artistEmail: profile?.email || '',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        phone: profile?.phone || '',
        country: profile?.country || '',
        city: profile?.city || '',
        primaryGenre: profile?.primary_genre || '',
        profilePictureUrl: profile?.profile_picture_url || null,
        labelPercentage: affiliation.label_percentage,
        status: affiliation.status,
        affiliatedSince: affiliation.created_at,
        totalReleases,
        liveReleases,
        draftReleases
      }
    })

    console.log(`✅ Found ${artistsWithCounts.length} accepted artists for label admin`)

    return NextResponse.json({
      success: true,
      artists: artistsWithCounts,
      count: artistsWithCounts.length
    })

  } catch (error) {
    console.error('❌ Accepted artists API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

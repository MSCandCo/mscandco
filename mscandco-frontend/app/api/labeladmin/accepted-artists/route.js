import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db/postgres'

/**
 * GET /api/labeladmin/accepted-artists
 * Fetch all artists that have accepted affiliation with this label admin
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
    console.log('👥 Fetching accepted artists for label admin:', labelAdminId)

    // Get all active affiliations for this label admin using direct PostgreSQL
    const affiliationsResult = await query(
      `SELECT id, artist_id, label_percentage, status, created_at
       FROM label_artist_affiliations
       WHERE label_admin_id = $1 AND status = 'active'
       ORDER BY created_at DESC`,
      [labelAdminId]
    )

    const affiliations = affiliationsResult.rows

    // If no affiliations, return empty array
    if (!affiliations || affiliations.length === 0) {
      console.log('✅ No accepted artists found for label admin')
      return NextResponse.json({
        success: true,
        artists: [],
        count: 0
      })
    }

    // Fetch artist profiles using direct PostgreSQL
    const artistIds = affiliations.map(a => a.artist_id)
    const placeholders = artistIds.map((_, i) => `$${i + 1}`).join(',')
    const profilesResult = await query(
      `SELECT id, email, first_name, last_name, artist_name, phone, country, city, primary_genre, profile_picture_url
       FROM user_profiles
       WHERE id IN (${placeholders})`,
      artistIds
    )

    const profiles = profilesResult.rows

    // Create a map of profiles by ID for easy lookup
    const profileMap = {}
    profiles.forEach(profile => {
      profileMap[profile.id] = profile
    })

    // Transform the data for frontend consumption and fetch release counts
    const artistsWithCounts = await Promise.all(
      affiliations.map(async (affiliation) => {
        const profile = profileMap[affiliation.artist_id]
        
        // Fetch release counts for this artist using direct PostgreSQL
        const releasesResult = await query(
          `SELECT id, status FROM releases WHERE artist_id = $1`,
          [affiliation.artist_id]
        )

        const releases = releasesResult.rows
        const totalReleases = releases.length
        const liveReleases = releases.filter(r => r.status === 'live').length
        const draftReleases = releases.filter(r => r.status === 'draft').length

        console.log(`📊 Artist ${profile?.artist_name}: ${totalReleases} total, ${liveReleases} live, ${draftReleases} drafts`)

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
    )

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


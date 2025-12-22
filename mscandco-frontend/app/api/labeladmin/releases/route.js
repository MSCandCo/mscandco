import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cachedJsonResponse, CACHE_HEADERS } from '@/lib/apiCache'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * GET /api/labeladmin/releases
 * Fetch all releases from all affiliated artists for this label admin
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const labelAdminId = user.id

    console.log('📋 Fetching releases for label admin:', labelAdminId)

    // Get all affiliated artist IDs using service role
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
      return cachedJsonResponse([], CACHE_HEADERS.RELEASES)
    }

    console.log(`📊 Found ${artistIds.length} affiliated artists`)

    // Fetch all releases from these artists using service role
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('*')
      .in('artist_id', artistIds)
      .order('created_at', { ascending: false })

    if (releasesError) {
      console.error('❌ Error fetching releases:', releasesError)
      return NextResponse.json(
        { error: 'Failed to fetch releases', details: releasesError.message },
        { status: 500 }
      )
    }

    // Fetch artist profiles for these releases
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, artist_name, profile_picture_url')
      .in('id', artistIds)

    if (profilesError) {
      console.error('❌ Error fetching artist profiles:', profilesError)
      // Don't fail if profiles can't be fetched, just continue without artist info
    }

    // Create a map of profiles by ID for easy lookup
    const profileMap = {}
    profiles?.forEach(profile => {
      profileMap[profile.id] = profile
    })

    // Transform the data to include artist info
    const releasesWithArtistInfo = (releases || []).map(release => {
      const artist = profileMap[release.artist_id] || {}
      return {
        ...release,
        artist_name: artist.artist_name || null,
        artist_profile_picture: artist.profile_picture_url || null
      }
    })

    console.log(`✅ Loaded ${releasesWithArtistInfo.length} releases from all affiliated artists`)

    return cachedJsonResponse(releasesWithArtistInfo, CACHE_HEADERS.RELEASES)

  } catch (error) {
    console.error('❌ Label admin releases API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

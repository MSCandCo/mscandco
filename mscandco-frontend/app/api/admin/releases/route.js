import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/releases
 * Fetch releases for admin (can filter by artist_id and status)
 */
export async function GET(request) {
  try {
    // Lazy load Supabase clients to avoid build-time errors
    const { createClient } = await import('@/lib/supabase/server');
    
    // Authenticate user
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const artist_id = searchParams.get('artist_id')
    const status = searchParams.get('status') || 'all'

    // Build query
    let query = supabase
      .from('releases')
      .select(`
        id,
        title,
        artist_id,
        status,
        release_date,
        created_at,
        updated_at,
        user_profiles!releases_artist_id_fkey (
          id,
          email,
          first_name,
          last_name,
          artist_name,
          display_name
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by artist if specified
    if (artist_id) {
      query = query.eq('artist_id', artist_id)
    }

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: releases, error } = await query

    if (error) {
      console.error('❌ Error fetching releases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch releases', details: error.message },
        { status: 500 }
      )
    }

    // Format response
    const formattedReleases = releases.map(release => ({
      id: release.id,
      title: release.title,
      artist_id: release.artist_id,
      status: release.status,
      release_date: release.release_date,
      created_at: release.created_at,
      updated_at: release.updated_at,
      artist: release.user_profiles ? {
        id: release.user_profiles.id,
        email: release.user_profiles.email,
        name: release.user_profiles.artist_name || 
              release.user_profiles.display_name || 
              `${release.user_profiles.first_name || ''} ${release.user_profiles.last_name || ''}`.trim() ||
              release.user_profiles.email
      } : null
    }))

    return NextResponse.json({
      success: true,
      releases: formattedReleases
    })

  } catch (error) {
    console.error('❌ Error in releases API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

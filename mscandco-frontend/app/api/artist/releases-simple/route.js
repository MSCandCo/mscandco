import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cachedJsonResponse, CACHE_HEADERS } from '@/lib/apiCache'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * GET /api/artist/releases-simple
 * Fetch artist releases from releases table
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

    const artistId = user.id
    console.log('🎵 Fetching releases for artist:', artistId)

    // Fetch all releases for this artist (optimized: select only needed fields)
    const { data: releases, error } = await supabase
      .from('releases')
      .select('id, title, artist_id, status, release_date, artwork_url, upc, created_at, updated_at')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching releases:', error)
      return NextResponse.json(
        { error: 'Failed to fetch releases', details: error.message },
        { status: 500 }
      )
    }

    // Count releases by status
    const statusCounts = {
      total: releases.length,
      draft: releases.filter(r => r.status === 'draft').length,
      submitted: releases.filter(r => r.status === 'submitted').length,
      in_review: releases.filter(r => r.status === 'in_review').length,
      revision: releases.filter(r => r.status === 'revision').length,
      completed: releases.filter(r => r.status === 'completed').length,
      live: releases.filter(r => r.status === 'live').length,
    }

    console.log(`✅ Found ${releases.length} releases for artist`)

    return cachedJsonResponse({
      success: true,
      releases: releases || [],
      statusCounts,
      total: releases.length
    }, CACHE_HEADERS.RELEASES)

  } catch (error) {
    console.error('❌ Releases API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


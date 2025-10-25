import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/artist/releases-simple
 * Fetch artist releases from releases table
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
    console.log('🎵 Fetching releases for artist:', artistId)

    // Fetch all releases for this artist
    const { data: releases, error } = await supabase
      .from('releases')
      .select('*')
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

    return NextResponse.json({
      success: true,
      releases: releases || [],
      statusCounts,
      total: releases.length
    })

  } catch (error) {
    console.error('❌ Releases API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


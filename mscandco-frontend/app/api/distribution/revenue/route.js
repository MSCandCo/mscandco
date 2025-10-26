import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS for distribution partner access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/distribution/revenue
 * Fetch live releases for revenue reporting
 */
export async function GET(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('💰 Fetching live releases for revenue reporting, user:', user.id)

    const { data: releases, error } = await supabase
      .from('releases')
      .select('*')
      .eq('status', 'live')
      .order('release_date', { ascending: false })

    if (error) {
      console.error('❌ Error fetching live releases:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Found ${releases?.length || 0} live releases for revenue reporting`)

    return NextResponse.json({
      success: true,
      releases: releases || []
    })

  } catch (error) {
    console.error('❌ Distribution revenue API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/distribution/revenue
 * Update earnings and streams for a release
 */
export async function PATCH(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { releaseId, earnings, streams } = await request.json()

    if (!releaseId) {
      return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
    }

    console.log(`💰 Updating earnings for release ${releaseId}:`, { earnings, streams })

    const { error } = await supabase
      .from('releases')
      .update({
        partner_earnings: earnings,
        partner_streams: streams,
        updated_at: new Date().toISOString()
      })
      .eq('id', releaseId)

    if (error) {
      console.error('❌ Error updating earnings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Updated earnings for release ${releaseId}`)

    return NextResponse.json({
      success: true,
      message: 'Earnings updated successfully'
    })

  } catch (error) {
    console.error('❌ Distribution revenue update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

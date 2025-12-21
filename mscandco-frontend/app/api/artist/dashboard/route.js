import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * GET /api/artist/dashboard
 * Get artist dashboard statistics
 */
export async function GET(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const artistId = session.user.id
    console.log('📊 Fetching dashboard stats for artist:', artistId)

    // Get releases count
    const { data: releases, error: releasesError } = await supabaseAdmin
      .from('releases')
      .select('id, status, created_at')
      .eq('artist_id', artistId)

    // Get earnings
    const { data: earnings, error: earningsError } = await supabaseAdmin
      .from('earnings_log')
      .select('amount, status, created_at')
      .eq('artist_id', artistId)

    // Get roster count
    const { data: roster, error: rosterError } = await supabaseAdmin
      .from('roster')
      .select('id')
      .eq('artist_id', artistId)

    // Calculate stats
    const totalReleases = releases?.length || 0
    const liveReleases = releases?.filter(r => r.status === 'live' || r.status === 'completed').length || 0
    const draftReleases = releases?.filter(r => r.status === 'draft').length || 0
    const totalEarnings = earnings?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0
    const pendingEarnings = earnings?.filter(e => e.status === 'pending').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0
    const totalContributors = roster?.length || 0

    // Recent releases (last 5)
    const recentReleases = releases?.slice(0, 5).map(r => ({
      id: r.id,
      status: r.status,
      created_at: r.created_at
    })) || []

    // Recent earnings (last 5)
    const recentEarnings = earnings?.slice(0, 5).map(e => ({
      amount: e.amount,
      status: e.status,
      created_at: e.created_at
    })) || []

    return NextResponse.json({
      success: true,
      stats: {
        totalReleases,
        liveReleases,
        draftReleases,
        totalEarnings,
        pendingEarnings,
        totalContributors
      },
      recentReleases,
      recentEarnings
    })

  } catch (error) {
    console.error('Error in dashboard GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}


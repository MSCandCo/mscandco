import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * GET /api/labeladmin/dashboard
 * Get label admin dashboard statistics
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

    const labelAdminId = session.user.id
    console.log('📊 Fetching dashboard stats for label admin:', labelAdminId)

    // Get affiliated artists
    const { data: affiliations, error: affiliationsError } = await supabaseAdmin
      .from('label_artist_affiliations')
      .select('artist_id, status')
      .eq('label_admin_id', labelAdminId)
      .eq('status', 'active')

    const artistIds = affiliations?.map(a => a.artist_id) || []

    // Get total releases from all affiliated artists
    const { data: releases, error: releasesError } = artistIds.length > 0
      ? await supabaseAdmin
          .from('releases')
          .select('id, title, artist_name, status, created_at')
          .in('artist_id', artistIds)
          .order('created_at', { ascending: false })
      : { data: [], error: null }

    // Get total earnings from shared_earnings
    const { data: sharedEarnings, error: earningsError } = await supabaseAdmin
      .from('shared_earnings')
      .select('label_share, status, created_at')
      .eq('label_admin_id', labelAdminId)

    // Get pending affiliation requests
    const { data: requests, error: requestsError } = await supabaseAdmin
      .from('artist_requests')
      .select('id, status')
      .eq('to_artist_id', labelAdminId)
      .eq('status', 'pending')

    // Calculate stats
    const totalArtists = artistIds.length
    const totalReleases = releases?.length || 0
    const liveReleases = releases?.filter(r => r.status === 'live' || r.status === 'completed').length || 0
    const totalEarnings = sharedEarnings?.reduce((sum, e) => sum + (parseFloat(e.label_share) || 0), 0) || 0
    const pendingEarnings = sharedEarnings?.filter(e => e.status === 'pending').reduce((sum, e) => sum + (parseFloat(e.label_share) || 0), 0) || 0
    const pendingRequests = requests?.length || 0

    // Recent releases (last 5)
    const recentReleases = releases?.slice(0, 5).map(r => ({
      id: r.id,
      title: r.title || 'Untitled Release',
      artist_name: r.artist_name || null,
      status: r.status,
      created_at: r.created_at
    })) || []

    // Recent earnings (last 5)
    const recentEarnings = sharedEarnings?.slice(0, 5).map(e => ({
      amount: e.label_share,
      status: e.status,
      created_at: e.created_at
    })) || []

    return NextResponse.json({
      success: true,
      stats: {
        totalArtists,
        totalReleases,
        liveReleases,
        totalEarnings,
        pendingEarnings,
        pendingRequests
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


/**
 * API: Earnings List (App Router)
 * GET /api/admin/earnings/list?artist_id=xxx - Fetch earnings for artist
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    // Check authentication using App Router server client
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const artist_id = searchParams.get('artist_id')

    if (!artist_id) {
      return NextResponse.json({ error: 'artist_id parameter is required' }, { status: 400 })
    }

    console.log(`📊 Loading earnings list for artist: ${artist_id}`)

    // Fetch all earnings for the artist from earnings_log table
    const { data: earnings, error: earningsError } = await supabaseAdmin
      .from('earnings_log')
      .select('*')
      .eq('artist_id', artist_id)
      .order('created_at', { ascending: false })

    if (earningsError) {
      console.error('Error fetching earnings:', earningsError)
      return NextResponse.json({
        error: 'Failed to fetch earnings',
        details: earningsError
      }, { status: 500 })
    }

    console.log(`✅ Found ${earnings?.length || 0} earnings entries for artist`)

    // Calculate summary statistics
    const summary = {
      total_entries: earnings?.length || 0,
      total_amount: (earnings || []).reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
      pending_amount: (earnings || []).filter(e => e.status === 'pending').reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
      paid_amount: (earnings || []).filter(e => e.status === 'paid').reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
      held_amount: (earnings || []).filter(e => e.status === 'held').reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
      by_status: {
        pending: (earnings || []).filter(e => e.status === 'pending').length,
        paid: (earnings || []).filter(e => e.status === 'paid').length,
        held: (earnings || []).filter(e => e.status === 'held').length,
        disputed: (earnings || []).filter(e => e.status === 'disputed').length
      },
      by_platform: (earnings || []).reduce((acc, entry) => {
        const platform = entry.platform || 'Unknown'
        acc[platform] = (acc[platform] || 0) + parseFloat(entry.amount || 0)
        return acc
      }, {}),
      by_type: (earnings || []).reduce((acc, entry) => {
        const type = entry.earning_type || 'unknown'
        acc[type] = (acc[type] || 0) + parseFloat(entry.amount || 0)
        return acc
      }, {})
    }

    return NextResponse.json({
      success: true,
      earnings: earnings || [],
      summary
    })

  } catch (error) {
    console.error('❌ Earnings list API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

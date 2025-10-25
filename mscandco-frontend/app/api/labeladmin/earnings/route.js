import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/labeladmin/earnings
 * Fetch label admin earnings from shared_earnings table (their split from artists)
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
    console.log('💰 Fetching label admin earnings:', labelAdminId)

    // First, get all affiliations for this label admin
    const { data: affiliations, error: affiliationsError } = await supabase
      .from('label_artist_affiliations')
      .select('id, label_percentage, artist_id, user_profiles!label_artist_affiliations_artist_id_fkey (id, artist_name, first_name, last_name, email)')
      .eq('label_admin_id', labelAdminId)
      .eq('status', 'active')

    if (affiliationsError) {
      console.error('❌ Error fetching affiliations:', affiliationsError)
      return NextResponse.json(
        { error: 'Failed to fetch affiliations', details: affiliationsError.message },
        { status: 500 }
      )
    }

    if (!affiliations || affiliations.length === 0) {
      console.log('ℹ️ No affiliations found for label admin')
      return NextResponse.json({
        success: true,
        summary: {
          totalLabelEarnings: 0,
          totalArtistEarnings: 0,
          totalEarnings: 0,
          artistCount: 0,
          entryCount: 0
        },
        earningsByArtist: {},
        recentEarnings: []
      })
    }

    const affiliationIds = affiliations.map(a => a.id)

    // Get all shared earnings for these affiliations
    const { data: sharedEarnings, error } = await supabase
      .from('shared_earnings')
      .select('id, artist_amount, label_amount, total_amount, platform, earning_type, currency, created_at, affiliation_id')
      .in('affiliation_id', affiliationIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching shared earnings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch earnings', details: error.message },
        { status: 500 }
      )
    }

    // If no earnings found, return empty state (not an error)
    if (!sharedEarnings || sharedEarnings.length === 0) {
      console.log('ℹ️ No earnings found for label admin affiliations')
      return NextResponse.json({
        success: true,
        summary: {
          totalLabelEarnings: 0,
          totalArtistEarnings: 0,
          totalEarnings: 0,
          artistCount: affiliations.length,
          entryCount: 0
        },
        earningsByArtist: {},
        recentEarnings: []
      })
    }

    // Calculate totals
    const totalLabelEarnings = sharedEarnings.reduce((sum, earning) => sum + (earning.label_amount || 0), 0)
    const totalArtistEarnings = sharedEarnings.reduce((sum, earning) => sum + (earning.artist_amount || 0), 0)
    const totalEarnings = sharedEarnings.reduce((sum, earning) => sum + (earning.total_amount || 0), 0)

    // Create a map of affiliations for easy lookup
    const affiliationMap = {}
    affiliations.forEach(aff => {
      affiliationMap[aff.id] = aff
    })

    // Group by artist
    const earningsByArtist = {}
    
    sharedEarnings.forEach(earning => {
      const affiliation = affiliationMap[earning.affiliation_id]
      if (!affiliation) return

      const artist = affiliation.user_profiles
      const artistName = artist?.artist_name || 
                        `${artist?.first_name || ''} ${artist?.last_name || ''}`.trim() ||
                        'Unknown Artist'
      
      if (!earningsByArtist[artistName]) {
        earningsByArtist[artistName] = {
          artistId: artist?.id,
          artistName,
          artistEmail: artist?.email,
          totalEarnings: 0,
          labelShare: 0,
          artistShare: 0,
          percentage: affiliation.label_percentage || 0,
          entries: []
        }
      }
      
      earningsByArtist[artistName].totalEarnings += earning.total_amount || 0
      earningsByArtist[artistName].labelShare += earning.label_amount || 0
      earningsByArtist[artistName].artistShare += earning.artist_amount || 0
      earningsByArtist[artistName].entries.push({
        ...earning,
        affiliation
      })
    })

    console.log(`✅ Label admin earnings loaded: ${totalLabelEarnings.toFixed(2)} from ${Object.keys(earningsByArtist).length} artists`)

    return NextResponse.json({
      success: true,
      summary: {
        totalLabelEarnings,
        totalArtistEarnings,
        totalEarnings,
        artistCount: Object.keys(earningsByArtist).length,
        entryCount: sharedEarnings.length
      },
      earningsByArtist,
      recentEarnings: sharedEarnings.slice(0, 20)
    })

  } catch (error) {
    console.error('❌ Label admin earnings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { query } from '@/lib/db/postgres'

/**
 * GET /api/labeladmin/releases
 * Fetch all releases from all affiliated artists for this label admin
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const labelAdminId = user.id

    console.log('📋 Fetching releases for label admin:', labelAdminId)

    // Get all affiliated artist IDs using direct PostgreSQL
    const affiliationsResult = await query(
      `SELECT artist_id 
       FROM label_artist_affiliations
       WHERE label_admin_id = $1 AND status = 'active'`,
      [labelAdminId]
    )

    const artistIds = affiliationsResult.rows.map(row => row.artist_id)

    if (artistIds.length === 0) {
      console.log('✅ No affiliated artists found')
      return NextResponse.json([])
    }

    console.log(`📊 Found ${artistIds.length} affiliated artists`)

    // Fetch all releases from these artists using direct PostgreSQL
    const placeholders = artistIds.map((_, i) => `$${i + 1}`).join(',')
    const releasesResult = await query(
      `SELECT 
        r.*,
        up.artist_name,
        up.profile_picture_url as artist_profile_picture
       FROM releases r
       LEFT JOIN user_profiles up ON r.artist_id = up.id
       WHERE r.artist_id IN (${placeholders})
       ORDER BY r.created_at DESC`,
      artistIds
    )

    const releases = releasesResult.rows

    console.log(`✅ Loaded ${releases.length} releases from all affiliated artists`)

    return NextResponse.json(releases)

  } catch (error) {
    console.error('❌ Label admin releases API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


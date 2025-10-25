import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db/postgres'

/**
 * GET /api/labeladmin/affiliation-requests
 * Fetch all affiliation requests sent by this label admin
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
    console.log('📋 Fetching affiliation requests for label admin:', labelAdminId)

    // Fetch all affiliation requests for this label admin using direct PostgreSQL
    const result = await query(
      `SELECT * FROM affiliation_requests
       WHERE label_admin_id = $1
       ORDER BY created_at DESC`,
      [labelAdminId]
    )

    const requests = result.rows

    console.log(`✅ Found ${requests.length} affiliation requests`)

    return NextResponse.json({
      success: true,
      requests: requests,
      count: requests.length
    })

  } catch (error) {
    console.error('❌ Affiliation requests API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


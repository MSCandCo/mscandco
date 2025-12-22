import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS

/**
 * GET /api/labeladmin/affiliation-requests
 * Fetch all affiliation requests sent by this label admin
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

    const labelAdminId = user.id
    console.log('📋 Fetching affiliation requests for label admin:', labelAdminId)

    // Fetch all affiliation requests for this label admin using service role
    const { data: requests, error: fetchError } = await supabase
      .from('affiliation_requests')
      .select('*')
      .eq('label_admin_id', labelAdminId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching affiliation requests:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch affiliation requests', details: fetchError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${requests?.length || 0} affiliation requests`)

    return NextResponse.json({
      success: true,
      requests: requests || [],
      count: requests?.length || 0
    })

  } catch (error) {
    console.error('❌ Affiliation requests API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

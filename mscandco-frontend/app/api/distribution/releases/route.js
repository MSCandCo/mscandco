import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Use service role to bypass RLS for distribution partner access

/**
 * GET /api/distribution/releases
 * Fetch releases for distribution hub (submitted, in_review, completed, live, revision)
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

    console.log('📦 Fetching distribution releases for user:', user.id)

    // Get query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'queue' or 'revisions'

    let query = supabase
      .from('releases')
      .select('*')
      .order('updated_at', { ascending: false })

    // Filter by type
    if (type === 'revisions') {
      query = query.eq('status', 'revision')
    } else {
      // Queue: submitted, in_review, completed, live
      query = query.in('status', ['submitted', 'in_review', 'completed', 'live'])
    }

    const { data: releases, error } = await query

    if (error) {
      console.error('❌ Error fetching releases:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Found ${releases?.length || 0} releases (type: ${type || 'queue'})`)

    return NextResponse.json({
      success: true,
      releases: releases || []
    })

  } catch (error) {
    console.error('❌ Distribution releases API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

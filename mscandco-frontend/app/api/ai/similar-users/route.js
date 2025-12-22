import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/ai/similar-users
 * Collaborative filtering - find similar users
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId || !category) {
      return NextResponse.json(
        { error: 'userId and category are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.rpc('find_similar_users', {
      p_user_id: userId,
      p_category: category,
      p_limit: limit,
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      users: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error('Similar users error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


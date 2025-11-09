import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/ai/similar-users
 * Collaborative filtering - find similar users
 */
export async function GET(request) {
  try {
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


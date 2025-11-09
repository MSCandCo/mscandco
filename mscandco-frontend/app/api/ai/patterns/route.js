import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/ai/patterns
 * Get behavioral patterns
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category') || 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('ai_behavioral_patterns')
      .select('*')
      .eq('user_id', userId)
      .order('confidence', { ascending: false })

    if (type !== 'all') {
      query = query.eq('pattern_type', type)
    }

    const { data, error } = await query

    if (error) throw error

    // Filter by category if specified
    let patterns = data || []
    if (category !== 'all') {
      patterns = patterns.filter(p => p.pattern_data?.category === category)
    }

    return NextResponse.json({
      success: true,
      patterns: patterns,
      count: patterns.length,
    })
  } catch (error) {
    console.error('Patterns error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/ai/recommendation
 * Multi-armed bandit recommendation
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.rpc('get_optimal_recommendation', {
      p_user_id: userId,
      p_recommendation_type: type,
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      recommendation: data,
    })
  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/ai/predict
 * Time-series prediction using advanced ML
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
    const metric = searchParams.get('metric')
    const timeframe = searchParams.get('timeframe') || '30 days'

    if (!userId || !metric) {
      return NextResponse.json(
        { error: 'userId and metric are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.rpc('predict_next_value', {
      p_user_id: userId,
      p_metric: metric,
      p_timeframe: timeframe,
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      prediction: data,
    })
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


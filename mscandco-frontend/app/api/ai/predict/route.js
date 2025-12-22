import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/ai/predict
 * Time-series prediction using advanced ML
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

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


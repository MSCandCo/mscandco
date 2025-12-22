import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * POST /api/ai/validate-prediction
 * Validate prediction outcome for reinforcement learning
 */
export async function POST(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body = await request.json()
    const { userId, predictionId, actualValue } = body

    if (!userId || !predictionId || !actualValue) {
      return NextResponse.json(
        { error: 'userId, predictionId, and actualValue are required' },
        { status: 400 }
      )
    }

    // Get the prediction
    const { data: prediction, error: fetchError } = await supabase
      .from('ai_prediction_outcomes')
      .select('*')
      .eq('id', predictionId)
      .eq('user_id', userId)
      .is('validated_at', null)
      .single()

    if (fetchError || !prediction) {
      return NextResponse.json(
        { error: 'Prediction not found or already validated' },
        { status: 404 }
      )
    }

    // Calculate accuracy
    const { data: accuracy, error: accuracyError } = await supabase.rpc('calculate_prediction_accuracy', {
      p_predicted: prediction.predicted_value,
      p_actual: actualValue,
    })

    if (accuracyError) throw accuracyError

    // Update prediction with outcome
    const { data: updated, error: updateError } = await supabase
      .from('ai_prediction_outcomes')
      .update({
        actual_value: actualValue,
        accuracy: accuracy,
        validated_at: new Date().toISOString(),
      })
      .eq('id', predictionId)
      .select()
      .single()

    if (updateError) throw updateError

    // Update user's prediction accuracy
    const { data: outcomes } = await supabase
      .from('ai_prediction_outcomes')
      .select('accuracy')
      .eq('user_id', userId)
      .not('validated_at', 'is', null)

    const avgAccuracy = outcomes?.length > 0
      ? outcomes.reduce((sum, o) => sum + (parseFloat(o.accuracy) || 0), 0) / outcomes.length
      : 0

    await supabase
      .from('user_profiles')
      .update({
        ai_prediction_accuracy: avgAccuracy,
      })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      validation: {
        predictionId,
        predictedValue: prediction.predicted_value,
        actualValue,
        accuracy: accuracy,
        averageAccuracy: avgAccuracy,
      },
      message: 'Prediction validated - accuracy updated for reinforcement learning',
    })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


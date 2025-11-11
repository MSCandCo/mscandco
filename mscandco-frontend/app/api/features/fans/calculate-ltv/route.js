import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fan_ids = [] } = await request.json();

    // Get all fans or specific fans
    let query = supabase
      .from('fan_profiles')
      .select('*')
      .eq('artist_id', user.id);

    if (fan_ids.length > 0) {
      query = query.in('id', fan_ids);
    }

    const { data: fans, error: fansError } = await query;

    if (fansError) throw fansError;

    // Calculate LTV for each fan
    const ltvCalculations = await Promise.all(
      fans.map(async (fan) => {
        const ltv = await calculateFanLTV(fan, supabase, user.id);
        return {
          fan_id: fan.id,
          fan_email: fan.email,
          fan_name: fan.name,
          current_tier: fan.tier,
          ...ltv,
          calculated_at: new Date().toISOString(),
        };
      })
    );

    // Save LTV calculations
    await supabase.from('fan_ltv_calculations').insert(
      ltvCalculations.map(calc => ({
        user_id: user.id,
        fan_id: calc.fan_id,
        lifetime_value_gbp: calc.total_ltv,
        historical_value_gbp: calc.historical_value,
        predicted_value_gbp: calc.predicted_value,
        confidence_score: calc.confidence,
        value_segments: calc.breakdown,
      }))
    );

    // Calculate summary statistics
    const summary = {
      total_fans: ltvCalculations.length,
      total_lifetime_value: ltvCalculations.reduce((sum, c) => sum + c.total_ltv, 0),
      avg_lifetime_value: ltvCalculations.length > 0
        ? ltvCalculations.reduce((sum, c) => sum + c.total_ltv, 0) / ltvCalculations.length
        : 0,
      high_value_fans: ltvCalculations.filter(c => c.total_ltv > 100).length,
      top_10_percent_value: calculateTop10PercentValue(ltvCalculations),
    };

    return NextResponse.json({
      success: true,
      calculations: ltvCalculations,
      summary,
    });

  } catch (error) {
    console.error('LTV calculation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function calculateFanLTV(fan, supabase, artistId) {
  // Historical value (what they've generated so far)
  const historicalValue = calculateHistoricalValue(fan);

  // Predicted future value (ML-based prediction)
  const predictedValue = await predictFutureValue(fan, supabase, artistId);

  // Total LTV
  const totalLTV = historicalValue + predictedValue.value;

  // Breakdown by revenue stream
  const breakdown = {
    streaming: {
      historical: calculateStreamingRevenue(fan.total_streams || 0),
      predicted: predictedValue.streaming,
      total: calculateStreamingRevenue(fan.total_streams || 0) + predictedValue.streaming,
    },
    merch: {
      historical: (fan.merch_purchases || 0) * 25, // Avg £25 per purchase
      predicted: predictedValue.merch,
      total: (fan.merch_purchases || 0) * 25 + predictedValue.merch,
    },
    concerts: {
      historical: (fan.concerts_attended || 0) * 30, // Avg £30 per ticket
      predicted: predictedValue.concerts,
      total: (fan.concerts_attended || 0) * 30 + predictedValue.concerts,
    },
    other: {
      historical: 0,
      predicted: predictedValue.other,
      total: predictedValue.other,
    },
  };

  return {
    total_ltv: Math.round(totalLTV * 100) / 100,
    historical_value: Math.round(historicalValue * 100) / 100,
    predicted_value: Math.round(predictedValue.value * 100) / 100,
    confidence: predictedValue.confidence,
    time_horizon_months: 12,
    breakdown,
    value_segment: categorizeValueSegment(totalLTV),
  };
}

function calculateHistoricalValue(fan) {
  let value = 0;

  // Streaming revenue
  value += calculateStreamingRevenue(fan.total_streams || 0);

  // Merch purchases
  value += (fan.merch_purchases || 0) * 25; // Avg £25 per purchase

  // Concert tickets
  value += (fan.concerts_attended || 0) * 30; // Avg £30 per ticket

  // Playlist adds (indirect value)
  value += (fan.playlist_adds || 0) * 0.50; // Small indirect value

  // Social shares (indirect value)
  value += (fan.social_shares || 0) * 0.25;

  return value;
}

function calculateStreamingRevenue(streams) {
  return streams * 0.003; // £0.003 per stream average
}

async function predictFutureValue(fan, supabase, artistId) {
  // ML model prediction based on historical patterns
  // This is a simplified version - production would use actual ML model

  const factors = {
    engagement_score: calculateEngagementScore(fan),
    tier_multiplier: getTierMultiplier(fan.tier),
    recency_factor: calculateRecencyFactor(fan),
    growth_trend: await calculateGrowthTrend(fan, supabase),
  };

  // Base prediction: historical monthly average * 12 months
  const historicalValue = calculateHistoricalValue(fan);
  const fanAgeMonths = fan.created_at
    ? Math.max(1, (Date.now() - new Date(fan.created_at)) / (1000 * 60 * 60 * 24 * 30))
    : 12;

  const monthlyAvg = historicalValue / fanAgeMonths;

  // Apply factors
  let predictedMonthlyValue = monthlyAvg;
  predictedMonthlyValue *= factors.tier_multiplier;
  predictedMonthlyValue *= (factors.engagement_score / 100);
  predictedMonthlyValue *= factors.recency_factor;
  predictedMonthlyValue *= (1 + factors.growth_trend);

  // Project 12 months
  const totalPredicted = predictedMonthlyValue * 12;

  // Breakdown predictions
  const streamingPredicted = totalPredicted * 0.60; // 60% from streaming
  const merchPredicted = totalPredicted * 0.25; // 25% from merch
  const concertsPredicted = totalPredicted * 0.10; // 10% from concerts
  const otherPredicted = totalPredicted * 0.05; // 5% other

  // Confidence based on data completeness
  const confidence = calculatePredictionConfidence(fan, fanAgeMonths);

  return {
    value: totalPredicted,
    streaming: streamingPredicted,
    merch: merchPredicted,
    concerts: concertsPredicted,
    other: otherPredicted,
    confidence,
    factors,
  };
}

function calculateEngagementScore(fan) {
  let score = 0;

  // Listening frequency (40 points)
  const totalStreams = fan.total_streams || 0;
  if (totalStreams > 100) score += 40;
  else if (totalStreams > 50) score += 30;
  else if (totalStreams > 10) score += 20;
  else if (totalStreams > 0) score += 10;

  // Social engagement (30 points)
  if (fan.social_shares > 5) score += 30;
  else if (fan.social_shares > 2) score += 20;
  else if (fan.social_shares > 0) score += 10;

  // Concert attendance (20 points)
  if (fan.concerts_attended > 0) score += 20;

  // Merch purchases (10 points)
  if (fan.merch_purchases > 0) score += 10;

  return Math.min(100, score);
}

function getTierMultiplier(tier) {
  const multipliers = {
    VIP: 2.0,
    superfan: 1.5,
    regular: 1.2,
    casual: 1.0,
  };

  return multipliers[tier] || 1.0;
}

function calculateRecencyFactor(fan) {
  if (!fan.last_listen_date) return 0.5;

  const daysSinceLastListen = Math.floor(
    (Date.now() - new Date(fan.last_listen_date)) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastListen <= 7) return 1.2; // Very active
  if (daysSinceLastListen <= 30) return 1.0; // Active
  if (daysSinceLastListen <= 60) return 0.8; // Declining
  return 0.5; // Inactive
}

async function calculateGrowthTrend(fan, supabase) {
  // Analyze if fan is growing, stable, or declining
  // Returns value between -0.5 (declining) and +0.5 (growing)

  const { data: recentHistory } = await supabase
    .from('fan_listening_history')
    .select('listened_at')
    .eq('fan_id', fan.id)
    .gte('listened_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
    .order('listened_at', { ascending: true });

  if (!recentHistory || recentHistory.length < 5) return 0;

  // Split into two periods
  const midpoint = Math.floor(recentHistory.length / 2);
  const firstHalf = recentHistory.slice(0, midpoint);
  const secondHalf = recentHistory.slice(midpoint);

  const growth = (secondHalf.length - firstHalf.length) / firstHalf.length;

  return Math.max(-0.5, Math.min(0.5, growth));
}

function calculatePredictionConfidence(fan, fanAgeMonths) {
  let confidence = 50; // Base 50%

  // More data = higher confidence
  if (fanAgeMonths > 12) confidence += 20;
  else if (fanAgeMonths > 6) confidence += 10;

  // Multiple touchpoints = higher confidence
  const touchpoints = [
    fan.total_streams > 0,
    fan.merch_purchases > 0,
    fan.concerts_attended > 0,
    fan.social_shares > 0,
  ].filter(Boolean).length;

  confidence += touchpoints * 5;

  // Recent activity = higher confidence
  if (fan.last_listen_date) {
    const daysSince = Math.floor(
      (Date.now() - new Date(fan.last_listen_date)) / (1000 * 60 * 60 * 24)
    );
    if (daysSince <= 30) confidence += 10;
  }

  return Math.min(100, confidence);
}

function categorizeValueSegment(ltv) {
  if (ltv >= 200) return 'platinum';
  if (ltv >= 100) return 'gold';
  if (ltv >= 50) return 'silver';
  if (ltv >= 10) return 'bronze';
  return 'standard';
}

function calculateTop10PercentValue(calculations) {
  const sorted = [...calculations].sort((a, b) => b.total_ltv - a.total_ltv);
  const top10Percent = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.1)));
  return top10Percent.reduce((sum, c) => sum + c.total_ltv, 0);
}

// GET endpoint for LTV history
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment');
    const limit = parseInt(searchParams.get('limit')) || 100;

    let query = supabase
      .from('fan_ltv_calculations')
      .select('*, fan_profiles(*)')
      .eq('user_id', user.id)
      .order('lifetime_value_gbp', { ascending: false })
      .limit(limit);

    const { data: calculations, error } = await query;

    if (error) throw error;

    // Filter by segment if specified
    let filtered = calculations;
    if (segment) {
      filtered = calculations.filter(c => {
        const ltv = c.lifetime_value_gbp;
        if (segment === 'platinum') return ltv >= 200;
        if (segment === 'gold') return ltv >= 100 && ltv < 200;
        if (segment === 'silver') return ltv >= 50 && ltv < 100;
        if (segment === 'bronze') return ltv >= 10 && ltv < 50;
        return ltv < 10;
      });
    }

    return NextResponse.json({ success: true, calculations: filtered });

  } catch (error) {
    console.error('Get LTV calculations error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

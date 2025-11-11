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

    const { fan_ids = [], threshold = 0.7 } = await request.json();

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

    // Calculate churn predictions for each fan
    const predictions = await Promise.all(
      fans.map(async (fan) => {
        const churnPrediction = await predictFanChurn(fan, supabase);
        return {
          fan_id: fan.id,
          fan_email: fan.email,
          fan_name: fan.name,
          current_tier: fan.tier,
          churn_probability: churnPrediction.probability,
          churn_risk: churnPrediction.risk_level,
          key_factors: churnPrediction.factors,
          recommended_actions: churnPrediction.actions,
          predicted_at: new Date().toISOString(),
        };
      })
    );

    // Filter by threshold if specified
    const atRiskFans = predictions.filter(p => p.churn_probability >= threshold);

    // Save predictions to database
    await supabase.from('fan_churn_predictions').insert(
      predictions.map(p => ({
        user_id: user.id,
        fan_id: p.fan_id,
        churn_probability: p.churn_probability,
        risk_level: p.churn_risk,
        key_factors: p.key_factors,
        recommended_actions: p.recommended_actions,
      }))
    );

    return NextResponse.json({
      success: true,
      total_analyzed: predictions.length,
      at_risk_count: atRiskFans.length,
      at_risk_percentage: predictions.length > 0
        ? Math.round((atRiskFans.length / predictions.length) * 100)
        : 0,
      predictions: atRiskFans,
      summary: {
        high_risk: predictions.filter(p => p.churn_risk === 'high').length,
        medium_risk: predictions.filter(p => p.churn_risk === 'medium').length,
        low_risk: predictions.filter(p => p.churn_risk === 'low').length,
      },
    });

  } catch (error) {
    console.error('Churn prediction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function predictFanChurn(fan, supabase) {
  // ML-based churn prediction using multiple factors
  const factors = [];
  let churnScore = 0;

  // Factor 1: Listening frequency decline (40% weight)
  const listeningTrend = await analyzeListeningTrend(fan, supabase);
  if (listeningTrend.declining) {
    churnScore += 0.4 * listeningTrend.decline_rate;
    factors.push({
      factor: 'Declining listening frequency',
      impact: 'high',
      details: `${listeningTrend.decline_percentage}% decrease in last 30 days`,
    });
  }

  // Factor 2: Time since last interaction (25% weight)
  const daysSinceLastListen = fan.last_listen_date
    ? Math.floor((Date.now() - new Date(fan.last_listen_date)) / (1000 * 60 * 60 * 24))
    : 999;

  if (daysSinceLastListen > 30) {
    const inactivityScore = Math.min(1, daysSinceLastListen / 90); // Max out at 90 days
    churnScore += 0.25 * inactivityScore;
    factors.push({
      factor: 'Extended inactivity',
      impact: daysSinceLastListen > 60 ? 'high' : 'medium',
      details: `${daysSinceLastListen} days since last listen`,
    });
  }

  // Factor 3: Engagement decline (20% weight)
  const engagementScore = calculateEngagementScore(fan);
  if (engagementScore < 30) {
    churnScore += 0.20 * ((100 - engagementScore) / 100);
    factors.push({
      factor: 'Low engagement',
      impact: 'medium',
      details: `Engagement score: ${engagementScore}/100`,
    });
  }

  // Factor 4: Tier downgrade risk (15% weight)
  if (fan.tier === 'superfan' || fan.tier === 'VIP') {
    const tierAtRisk = await checkTierDowngradeRisk(fan, supabase);
    if (tierAtRisk) {
      churnScore += 0.15;
      factors.push({
        factor: 'Tier downgrade risk',
        impact: 'medium',
        details: 'Not meeting tier requirements',
      });
    }
  }

  // Determine risk level
  const probability = Math.min(1, Math.max(0, churnScore));
  let riskLevel;

  if (probability >= 0.7) {
    riskLevel = 'high';
  } else if (probability >= 0.4) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Generate recommended actions
  const actions = generateRetentionActions(fan, factors, riskLevel);

  return {
    probability: Math.round(probability * 100) / 100,
    risk_level: riskLevel,
    factors,
    actions,
  };
}

async function analyzeListeningTrend(fan, supabase) {
  // Get listening history for last 60 days
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const { data: history } = await supabase
    .from('fan_listening_history')
    .select('listened_at')
    .eq('fan_id', fan.id)
    .gte('listened_at', sixtyDaysAgo.toISOString())
    .order('listened_at', { ascending: true });

  if (!history || history.length === 0) {
    return { declining: true, decline_rate: 1, decline_percentage: 100 };
  }

  // Split into two 30-day periods
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const firstPeriod = history.filter(h => new Date(h.listened_at) < thirtyDaysAgo);
  const secondPeriod = history.filter(h => new Date(h.listened_at) >= thirtyDaysAgo);

  const firstPeriodCount = firstPeriod.length;
  const secondPeriodCount = secondPeriod.length;

  if (firstPeriodCount === 0) {
    return { declining: false, decline_rate: 0, decline_percentage: 0 };
  }

  const declining = secondPeriodCount < firstPeriodCount;
  const declinePercentage = declining
    ? Math.round(((firstPeriodCount - secondPeriodCount) / firstPeriodCount) * 100)
    : 0;

  const declineRate = declining ? declinePercentage / 100 : 0;

  return {
    declining,
    decline_rate: declineRate,
    decline_percentage: declinePercentage,
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

  return score;
}

async function checkTierDowngradeRisk(fan, supabase) {
  // Check if fan is maintaining tier requirements
  const tierRequirements = {
    VIP: { min_streams: 100, min_engagement: 80 },
    superfan: { min_streams: 50, min_engagement: 60 },
    regular: { min_streams: 10, min_engagement: 30 },
  };

  const requirement = tierRequirements[fan.tier];
  if (!requirement) return false;

  const engagementScore = calculateEngagementScore(fan);
  const streamsLast30Days = fan.streams_last_30_days || 0;

  return streamsLast30Days < requirement.min_streams || engagementScore < requirement.min_engagement;
}

function generateRetentionActions(fan, factors, riskLevel) {
  const actions = [];

  // High-priority actions for high-risk fans
  if (riskLevel === 'high') {
    actions.push({
      priority: 'urgent',
      action: 'Send personalized re-engagement email',
      details: `Include exclusive content or special offer for ${fan.name}`,
    });

    actions.push({
      priority: 'urgent',
      action: 'Offer VIP experience',
      details: 'Meet & greet, early access to new releases, or personalized message',
    });
  }

  // Factor-specific actions
  factors.forEach(factor => {
    if (factor.factor.includes('inactivity')) {
      actions.push({
        priority: riskLevel === 'high' ? 'urgent' : 'high',
        action: 'Send "We miss you" campaign',
        details: 'Highlight new releases and ask for feedback',
      });
    }

    if (factor.factor.includes('engagement')) {
      actions.push({
        priority: 'medium',
        action: 'Increase engagement touchpoints',
        details: 'Social media shoutout, exclusive behind-the-scenes content',
      });
    }

    if (factor.factor.includes('listening')) {
      actions.push({
        priority: 'high',
        action: 'Create personalized playlist',
        details: 'Curated playlist based on their listening history',
      });
    }

    if (factor.factor.includes('Tier downgrade')) {
      actions.push({
        priority: 'medium',
        action: 'Tier retention campaign',
        details: 'Remind of tier benefits and upcoming rewards',
      });
    }
  });

  // General retention actions
  if (actions.length < 3) {
    actions.push({
      priority: 'low',
      action: 'Add to nurture campaign',
      details: 'Regular touchpoints with valuable content',
    });
  }

  return actions.slice(0, 5); // Return top 5 actions
}

// GET endpoint for churn history
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const risk_level = searchParams.get('risk_level');
    const limit = parseInt(searchParams.get('limit')) || 100;

    let query = supabase
      .from('fan_churn_predictions')
      .select('*, fan_profiles(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (risk_level) {
      query = query.eq('risk_level', risk_level);
    }

    const { data: predictions, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, predictions });

  } catch (error) {
    console.error('Get churn predictions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Apollo Intelligence - Proactive Insights Engine
 * Analyzes user data and generates intelligent, actionable insights
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Generate proactive insights for a user
 */
export async function generateInsights(userId) {
  const insights = [];
  
  try {
    // 1. Earnings Spike Detection
    const earningsInsight = await detectEarningsSpike(userId);
    if (earningsInsight) insights.push(earningsInsight);
    
    // 2. Payout Readiness
    const payoutInsight = await checkPayoutReadiness(userId);
    if (payoutInsight) insights.push(payoutInsight);
    
    // 3. Release Performance
    const releaseInsight = await analyzeReleasePerformance(userId);
    if (releaseInsight) insights.push(releaseInsight);
    
    // 4. Platform Trends
    const platformInsight = await analyzePlatformTrends(userId);
    if (platformInsight) insights.push(platformInsight);
    
    // 5. Milestone Achievements
    const milestoneInsight = await checkMilestones(userId);
    if (milestoneInsight) insights.push(milestoneInsight);
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

/**
 * Detect unusual earnings spikes or drops
 */
async function detectEarningsSpike(userId) {
  try {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Get this week's earnings
    const { data: thisWeek } = await supabase
      .from('earnings_log')
      .select('amount')
      .eq('artist_id', userId)
      .gte('created_at', lastWeek.toISOString());
    
    // Get last week's earnings
    const { data: lastWeekData } = await supabase
      .from('earnings_log')
      .select('amount')
      .eq('artist_id', userId)
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', lastWeek.toISOString());
    
    const thisWeekTotal = thisWeek?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
    const lastWeekTotal = lastWeekData?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
    
    if (lastWeekTotal === 0) return null;
    
    const percentChange = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
    
    // Significant spike (>30% increase)
    if (percentChange > 30) {
      return {
        type: 'earnings_spike',
        priority: 'high',
        icon: '📈',
        title: 'Earnings Spike Detected!',
        message: `Your earnings jumped ${percentChange.toFixed(0)}% this week (£${thisWeekTotal.toFixed(2)} vs £${lastWeekTotal.toFixed(2)} last week). Something's working! Want me to analyze what's driving this growth?`,
        action: 'analyze_growth',
        data: { thisWeek: thisWeekTotal, lastWeek: lastWeekTotal, change: percentChange },
      };
    }
    
    // Significant drop (>30% decrease)
    if (percentChange < -30) {
      return {
        type: 'earnings_drop',
        priority: 'medium',
        icon: '📉',
        title: 'Earnings Dip Noticed',
        message: `Your earnings dropped ${Math.abs(percentChange).toFixed(0)}% this week. This could be normal fluctuation, but I can help you identify opportunities to boost your streams.`,
        action: 'boost_strategy',
        data: { thisWeek: thisWeekTotal, lastWeek: lastWeekTotal, change: percentChange },
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting earnings spike:', error);
    return null;
  }
}

/**
 * Check if user is ready for payout
 */
async function checkPayoutReadiness(userId) {
  try {
    const { data: earnings } = await supabase
      .from('earnings_log')
      .select('amount, status')
      .eq('artist_id', userId);
    
    const availableBalance = earnings
      ?.filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
    
    const pendingBalance = earnings
      ?.filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
    
    // Ready for payout (>= £50)
    if (availableBalance >= 50) {
      return {
        type: 'payout_ready',
        priority: 'high',
        icon: '💰',
        title: 'Payout Available!',
        message: `You have £${availableBalance.toFixed(2)} ready to withdraw right now! Want me to process your payout?`,
        action: 'request_payout',
        data: { available: availableBalance, pending: pendingBalance },
      };
    }
    
    // Close to payout threshold
    if (availableBalance >= 30 && availableBalance < 50) {
      const needed = 50 - availableBalance;
      return {
        type: 'payout_soon',
        priority: 'low',
        icon: '💸',
        title: 'Almost There!',
        message: `You're £${needed.toFixed(2)} away from the £50 payout threshold. Based on your current earnings rate, you'll reach it in about ${Math.ceil(needed / (availableBalance / 30))} days.`,
        action: null,
        data: { available: availableBalance, needed: needed },
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking payout readiness:', error);
    return null;
  }
}

/**
 * Analyze recent release performance
 */
async function analyzeReleasePerformance(userId) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: recentReleases } = await supabase
      .from('releases')
      .select('id, title, release_date, status')
      .eq('artist_id', userId)
      .eq('status', 'live')
      .gte('release_date', thirtyDaysAgo.toISOString())
      .order('release_date', { ascending: false })
      .limit(1);
    
    if (!recentReleases || recentReleases.length === 0) return null;
    
    const release = recentReleases[0];
    const daysSinceRelease = Math.floor(
      (Date.now() - new Date(release.release_date).getTime()) / (24 * 60 * 60 * 1000)
    );
    
    // New release within 7 days
    if (daysSinceRelease <= 7) {
      return {
        type: 'new_release',
        priority: 'medium',
        icon: '🎵',
        title: 'New Release Tracking',
        message: `"${release.title}" has been live for ${daysSinceRelease} day${daysSinceRelease !== 1 ? 's' : ''}! The first week is crucial. Want me to check how it's performing and suggest promotion strategies?`,
        action: 'analyze_release',
        data: { releaseId: release.id, title: release.title, days: daysSinceRelease },
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error analyzing release performance:', error);
    return null;
  }
}

/**
 * Analyze platform performance trends
 */
async function analyzePlatformTrends(userId) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: earnings } = await supabase
      .from('earnings_log')
      .select('platform, amount')
      .eq('artist_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (!earnings || earnings.length === 0) return null;
    
    const platformTotals = earnings.reduce((acc, e) => {
      const platform = e.platform || 'Unknown';
      acc[platform] = (acc[platform] || 0) + parseFloat(e.amount || 0);
      return acc;
    }, {});
    
    const sorted = Object.entries(platformTotals)
      .sort(([, a], [, b]) => b - a);
    
    if (sorted.length === 0) return null;
    
    const topPlatform = sorted[0][0];
    const topAmount = sorted[0][1];
    const total = sorted.reduce((sum, [, amount]) => sum + amount, 0);
    const topPercentage = (topAmount / total) * 100;
    
    // Dominant platform (>60% of earnings)
    if (topPercentage > 60) {
      return {
        type: 'platform_dominance',
        priority: 'low',
        icon: '🎯',
        title: 'Platform Insight',
        message: `${topPlatform} accounts for ${topPercentage.toFixed(0)}% of your earnings (£${topAmount.toFixed(2)}). You're doing great there! Want strategies to grow on other platforms too?`,
        action: 'diversify_strategy',
        data: { platform: topPlatform, percentage: topPercentage, amount: topAmount },
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error analyzing platform trends:', error);
    return null;
  }
}

/**
 * Check for milestone achievements
 */
async function checkMilestones(userId) {
  try {
    // Get total earnings
    const { data: earnings } = await supabase
      .from('earnings_log')
      .select('amount')
      .eq('artist_id', userId);
    
    const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
    
    // Check for milestone thresholds
    const milestones = [
      { threshold: 100, message: 'first £100' },
      { threshold: 500, message: '£500 milestone' },
      { threshold: 1000, message: '£1,000 milestone' },
      { threshold: 5000, message: '£5,000 milestone' },
      { threshold: 10000, message: '£10,000 milestone' },
    ];
    
    // Find the closest upcoming milestone
    const nextMilestone = milestones.find(m => totalEarnings < m.threshold && totalEarnings >= m.threshold * 0.9);
    
    if (nextMilestone) {
      const remaining = nextMilestone.threshold - totalEarnings;
      return {
        type: 'milestone_approaching',
        priority: 'low',
        icon: '🎉',
        title: 'Milestone Approaching!',
        message: `You're just £${remaining.toFixed(2)} away from your ${nextMilestone.message}! Keep up the great work! 🚀`,
        action: null,
        data: { current: totalEarnings, milestone: nextMilestone.threshold, remaining: remaining },
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking milestones:', error);
    return null;
  }
}


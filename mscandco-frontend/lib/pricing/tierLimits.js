import { createClient } from '@/lib/supabase/server'

// Tier configuration
export const TIER_CONFIG = {
  free: {
    commission: 20.00,
    releaseLimit: 3,
    trackLimit: 15,
    platformCount: 12,
    apolloQueries: 3,
    earningsThreshold: 5000, // Prompt upgrade at £5K
    deliveryDays: '7-10',
    support: 'Email (48h response)',
    features: {
      preSave: false,
      smartLinks: false,
      whiteLabel: false,
      royaltySplits: false,
      advancedAnalytics: false
    }
  },
  pro: {
    commission: 15.00,
    releaseLimit: null, // Unlimited
    trackLimit: null, // Unlimited
    platformCount: 18,
    apolloQueries: 100,
    deliveryDays: '1-3',
    support: 'Email + Chat (12h response)',
    monthlyPrice: 19.99,
    annualPrice: 199,
    features: {
      preSave: true,
      smartLinks: true,
      whiteLabel: false,
      royaltySplits: true,
      advancedAnalytics: true
    }
  },
  mpp_paid: {
    commission: 10.00,
    releaseLimit: null,
    trackLimit: null,
    platformCount: 18,
    apolloQueries: 500,
    deliveryDays: '24 hours',
    support: '24/7 VIP (6h response)',
    monthlyPrice: 99,
    annualPrice: 999,
    features: {
      preSave: true,
      smartLinks: true,
      whiteLabel: true,
      royaltySplits: true,
      advancedAnalytics: true,
      dedicatedManager: true,
      networking: true
    }
  },
  mpp_earned: {
    commission: 10.00,
    releaseLimit: null,
    trackLimit: null,
    platformCount: 18,
    apolloQueries: 500,
    deliveryDays: '24 hours',
    support: '24/7 VIP (6h response)',
    monthlyPrice: 0, // FREE
    annualPrice: 0, // FREE
    features: {
      preSave: true,
      smartLinks: true,
      whiteLabel: true,
      royaltySplits: true,
      advancedAnalytics: true,
      dedicatedManager: true,
      networking: true
    }
  },
  mpp_invited: {
    commission: 10.00,
    releaseLimit: null,
    trackLimit: null,
    platformCount: 18,
    apolloQueries: 500,
    deliveryDays: '24 hours',
    support: '24/7 VIP (6h response)',
    monthlyPrice: 0, // FREE
    annualPrice: 0, // FREE
    features: {
      preSave: true,
      smartLinks: true,
      whiteLabel: true,
      royaltySplits: true,
      advancedAnalytics: true,
      dedicatedManager: true,
      networking: true
    }
  },
  investment: {
    commission: 2.50,
    releaseLimit: null,
    trackLimit: null,
    platformCount: 18,
    apolloQueries: null, // Unlimited
    deliveryDays: 'Express',
    support: 'Personal Concierge (1h response)',
    investmentTiers: [10000, 25000, 50000],
    equityPercentages: [0.5, 1.0, 2.0],
    features: {
      preSave: true,
      smartLinks: true,
      whiteLabel: true,
      royaltySplits: true,
      advancedAnalytics: true,
      dedicatedManager: true,
      networking: true,
      equity: true,
      boardSeat: true,
      revenueShare: true
    }
  }
}

/**
 * Check if user can perform an action based on tier limits
 */
export async function checkTierLimits(userId, operation) {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('user_profiles')
    .select('tier, releases_this_year, tracks_this_year, total_earnings_this_year, apollo_queries_used_this_month, apollo_unlimited_addon')
    .eq('id', userId)
    .single()

  if (error || !user) {
    throw new Error('User not found')
  }

  const tierConfig = TIER_CONFIG[user.tier] || TIER_CONFIG.free

  // Check release limit
  if (operation.type === 'create_release') {
    if (tierConfig.releaseLimit !== null && user.releases_this_year >= tierConfig.releaseLimit) {
      return {
        allowed: false,
        reason: `Free tier limit: ${tierConfig.releaseLimit} releases per year. You've used ${user.releases_this_year}.`,
        upgradeRequired: 'pro',
        currentUsage: user.releases_this_year,
        limit: tierConfig.releaseLimit
      }
    }
  }

  // Check track limit
  if (operation.type === 'add_tracks' && operation.trackCount) {
    if (tierConfig.trackLimit !== null) {
      const newTotal = user.tracks_this_year + operation.trackCount
      if (newTotal > tierConfig.trackLimit) {
        return {
          allowed: false,
          reason: `Free tier limit: ${tierConfig.trackLimit} tracks per year. You have ${user.tracks_this_year}, trying to add ${operation.trackCount}.`,
          upgradeRequired: 'pro',
          currentUsage: user.tracks_this_year,
          limit: tierConfig.trackLimit
        }
      }
    }
  }

  // Check Apollo Intelligence queries
  if (operation.type === 'apollo_query') {
    if (!user.apollo_unlimited_addon && tierConfig.apolloQueries !== null) {
      if (user.apollo_queries_used_this_month >= tierConfig.apolloQueries) {
        return {
          allowed: false,
          reason: `Apollo Intelligence limit: ${tierConfig.apolloQueries} queries per month. Upgrade or add unlimited AI for £9.99/month.`,
          upgradeRequired: user.tier === 'free' ? 'pro' : null,
          addonAvailable: true,
          currentUsage: user.apollo_queries_used_this_month,
          limit: tierConfig.apolloQueries
        }
      }
    }
  }

  // Check earnings threshold for upgrade prompt
  if (user.tier === 'free' && user.total_earnings_this_year >= tierConfig.earningsThreshold) {
    return {
      allowed: true,
      promptUpgrade: true,
      reason: `You've earned £${user.total_earnings_this_year.toLocaleString()}+ this year! Upgrade to MSC Pro to keep more of your earnings (15% commission vs 20%).`,
      savingsIfUpgrade: calculateUpgradeSavings(user.total_earnings_this_year, 'free', 'pro')
    }
  }

  return { allowed: true }
}

/**
 * Calculate savings if user upgrades
 */
export function calculateUpgradeSavings(annualEarnings, fromTier, toTier) {
  const fromConfig = TIER_CONFIG[fromTier]
  const toConfig = TIER_CONFIG[toTier]

  const fromCommission = annualEarnings * (fromConfig.commission / 100)
  const toCommission = annualEarnings * (toConfig.commission / 100)
  const toSubscription = toConfig.annualPrice || 0

  const fromTotal = fromCommission
  const toTotal = toCommission + toSubscription

  return {
    commissionSavings: fromCommission - toCommission,
    subscriptionCost: toSubscription,
    netSavings: fromTotal - toTotal,
    recommended: fromTotal > toTotal
  }
}

/**
 * Increment usage counters
 */
export async function incrementUsageCounter(userId, counterType) {
  const supabase = await createClient()

  const updates = {}

  switch (counterType) {
    case 'release':
      updates.releases_this_year = supabase.raw('releases_this_year + 1')
      updates.total_releases_all_time = supabase.raw('total_releases_all_time + 1')
      break
    case 'tracks':
      updates.tracks_this_year = supabase.raw('tracks_this_year + ?', [counterType.count || 1])
      break
    case 'apollo_query':
      updates.apollo_queries_used_this_month = supabase.raw('apollo_queries_used_this_month + 1')
      break
  }

  if (Object.keys(updates).length > 0) {
    await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
  }
}

/**
 * Check if user qualifies for free MPP
 */
export async function checkMPPAutoQualification(userId) {
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('user_profiles')
    .select('tier, total_earnings_this_year, total_streams_all_time, total_releases_all_time, total_commissions_paid')
    .eq('id', userId)
    .single()

  if (!user) return false

  // Already MPP or higher
  if (['mpp_paid', 'mpp_earned', 'mpp_invited', 'investment'].includes(user.tier)) {
    return false
  }

  // Check criteria
  const qualified =
    user.total_earnings_this_year >= 10000 ||
    user.total_streams_all_time >= 100000 ||
    user.total_releases_all_time >= 50 ||
    user.total_commissions_paid >= 5000

  if (qualified) {
    // Auto-upgrade to mpp_earned (FREE)
    await supabase
      .from('user_profiles')
      .update({
        tier: 'mpp_earned',
        commission_rate: 10.00,
        mpp_qualification_status: 'qualified',
        mpp_qualified_at: new Date().toISOString(),
        last_tier_change_at: new Date().toISOString(),
        apollo_query_limit: 500
      })
      .eq('id', userId)

    return true
  }

  return false
}

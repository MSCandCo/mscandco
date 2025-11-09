import { createClient } from '@/lib/supabase/server'
import { checkTierLimits, incrementUsageCounter, checkMPPAutoQualification } from '@/lib/pricing/tierLimits'

/**
 * Middleware to enforce tier limits before creating releases
 * Usage: await enforceReleaseLimit(userId, trackCount)
 */
export async function enforceReleaseLimit(userId, trackCount = 1) {
  try {
    // Check if user can create release
    const releaseCheck = await checkTierLimits(userId, {
      type: 'create_release'
    })

    if (!releaseCheck.allowed) {
      return {
        allowed: false,
        error: releaseCheck.reason,
        upgradeRequired: releaseCheck.upgradeRequired,
        currentUsage: releaseCheck.currentUsage,
        limit: releaseCheck.limit
      }
    }

    // Check if adding tracks would exceed limit
    if (trackCount > 0) {
      const trackCheck = await checkTierLimits(userId, {
        type: 'add_tracks',
        trackCount
      })

      if (!trackCheck.allowed) {
        return {
          allowed: false,
          error: trackCheck.reason,
          upgradeRequired: trackCheck.upgradeRequired,
          currentUsage: trackCheck.currentUsage,
          limit: trackCheck.limit
        }
      }
    }

    // Check for upgrade prompt based on earnings
    if (releaseCheck.promptUpgrade) {
      return {
        allowed: true,
        promptUpgrade: true,
        upgradeMessage: releaseCheck.reason,
        savingsIfUpgrade: releaseCheck.savingsIfUpgrade
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Tier enforcement error:', error)
    throw error
  }
}

/**
 * Increment release and track counters after successful creation
 * Call this AFTER release is created successfully
 */
export async function trackReleaseCreation(userId, trackCount = 1) {
  try {
    await incrementUsageCounter(userId, 'release')
    if (trackCount > 0) {
      await incrementUsageCounter(userId, { type: 'tracks', count: trackCount })
    }

    // Check if user now qualifies for auto-upgrade to MPP
    await checkMPPAutoQualification(userId)

    return { success: true }
  } catch (error) {
    console.error('Error tracking release creation:', error)
    // Don't throw - release already created, this is just tracking
    return { success: false, error: error.message }
  }
}

/**
 * Check Apollo Intelligence usage limits
 */
export async function enforceApolloLimit(userId) {
  try {
    const check = await checkTierLimits(userId, {
      type: 'apollo_query'
    })

    if (!check.allowed) {
      return {
        allowed: false,
        error: check.reason,
        upgradeRequired: check.upgradeRequired,
        addonAvailable: check.addonAvailable,
        currentUsage: check.currentUsage,
        limit: check.limit
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Apollo limit check error:', error)
    throw error
  }
}

/**
 * Increment Apollo query counter
 */
export async function trackApolloQuery(userId) {
  try {
    await incrementUsageCounter(userId, 'apollo_query')
    return { success: true }
  } catch (error) {
    console.error('Error tracking Apollo query:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get upgrade recommendation based on user stats
 */
export async function getUpgradeRecommendation(userId) {
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('user_profiles')
    .select('tier, total_earnings_this_year, releases_this_year, tracks_this_year, apollo_queries_used_this_month')
    .eq('id', userId)
    .single()

  if (!user || user.tier === 'investment') {
    return null // Already at highest tier
  }

  const recommendations = []

  // Free tier users hitting limits
  if (user.tier === 'free') {
    if (user.releases_this_year >= 2) {
      recommendations.push({
        reason: 'release_limit',
        message: `You've used ${user.releases_this_year}/3 releases. Upgrade to Pro for unlimited releases.`,
        tier: 'pro',
        urgency: 'high'
      })
    }

    if (user.total_earnings_this_year >= 3000) {
      recommendations.push({
        reason: 'earnings_threshold',
        message: `You've earned £${user.total_earnings_this_year.toLocaleString()}! Upgrade to Pro and save on commissions.`,
        tier: 'pro',
        urgency: 'medium'
      })
    }
  }

  // Pro tier users eligible for MPP
  if (user.tier === 'pro') {
    if (user.total_earnings_this_year >= 8000) {
      recommendations.push({
        reason: 'mpp_qualification_close',
        message: `You're close to qualifying for FREE MPP Partner status! Just £${(10000 - user.total_earnings_this_year).toLocaleString()} more in earnings.`,
        tier: 'mpp',
        urgency: 'low'
      })
    }
  }

  return recommendations.length > 0 ? recommendations : null
}

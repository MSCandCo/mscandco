/**
 * Label Tier Enforcement Logic
 * Enforces tier limits for label admins
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  checkLabelTierLimits,
  getLabelTierConfig,
  getRecommendedLabelTier,
  calculateLabelUpgradeSavings,
  LABEL_TIERS
} from './label-tier-config';

/**
 * Fetch current label usage stats from database
 * @param {string} userId - Label admin user ID
 * @returns {Promise<object>} - Usage stats
 */
export async function getLabelUsageStats(userId) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      label_tier,
      label_artist_count,
      label_releases_this_year,
      label_tracks_this_year,
      label_apollo_queries_this_month,
      label_total_earnings,
      label_total_streams,
      label_commissions_paid,
      label_qualified_for_partner
    `)
    .eq('id', userId)
    .eq('role', 'label_admin')
    .single();

  if (error) {
    console.error('Error fetching label usage stats:', error);
    throw error;
  }

  return {
    tier: data.label_tier || LABEL_TIERS.STARTER,
    artist_count: data.label_artist_count || 0,
    releases_this_year: data.label_releases_this_year || 0,
    tracks_this_year: data.label_tracks_this_year || 0,
    apollo_queries_this_month: data.label_apollo_queries_this_month || 0,
    total_earnings: parseFloat(data.label_total_earnings) || 0,
    total_streams: data.label_total_streams || 0,
    commissions_paid: parseFloat(data.label_commissions_paid) || 0,
    qualified_for_partner: data.label_qualified_for_partner || false
  };
}

/**
 * Check if label can add a new artist
 * @param {string} userId - Label admin user ID
 * @returns {Promise<object>} - { allowed: boolean, reason: string, upgradePrompt: object }
 */
export async function canAddArtist(userId) {
  const usage = await getLabelUsageStats(userId);
  const config = getLabelTierConfig(usage.tier);

  // Check artist limit
  if (config.limits.artists > 0 && usage.artist_count >= config.limits.artists) {
    const recommendedTier = getRecommendedLabelTier(usage.tier, usage);
    const savings = calculateLabelUpgradeSavings(usage.tier, recommendedTier, usage.total_earnings);

    return {
      allowed: false,
      reason: `Artist limit reached (${usage.artist_count}/${config.limits.artists})`,
      currentUsage: usage.artist_count,
      limit: config.limits.artists,
      upgradePrompt: {
        show: true,
        currentTier: config.displayName,
        recommendedTier: getLabelTierConfig(recommendedTier).displayName,
        recommendedTierKey: recommendedTier,
        savings: savings,
        message: `You've reached your ${config.displayName} artist limit. Upgrade to ${getLabelTierConfig(recommendedTier).displayName} to add more artists.`
      }
    };
  }

  return {
    allowed: true,
    reason: 'Within artist limit',
    currentUsage: usage.artist_count,
    limit: config.limits.artists > 0 ? config.limits.artists : 'Unlimited'
  };
}

/**
 * Check if label can create a new release
 * @param {string} userId - Label admin user ID
 * @param {number} trackCount - Number of tracks in the release
 * @returns {Promise<object>} - { allowed: boolean, reason: string, upgradePrompt: object }
 */
export async function canCreateRelease(userId, trackCount = 0) {
  const usage = await getLabelUsageStats(userId);
  const config = getLabelTierConfig(usage.tier);

  // Check release limit
  if (config.limits.releases_per_year > 0 && usage.releases_this_year >= config.limits.releases_per_year) {
    const recommendedTier = getRecommendedLabelTier(usage.tier, usage);
    const savings = calculateLabelUpgradeSavings(usage.tier, recommendedTier, usage.total_earnings);

    return {
      allowed: false,
      reason: `Annual release limit reached (${usage.releases_this_year}/${config.limits.releases_per_year})`,
      currentUsage: usage.releases_this_year,
      limit: config.limits.releases_per_year,
      upgradePrompt: {
        show: true,
        currentTier: config.displayName,
        recommendedTier: getLabelTierConfig(recommendedTier).displayName,
        recommendedTierKey: recommendedTier,
        savings: savings,
        message: `You've reached your ${config.displayName} annual release limit. Upgrade to ${getLabelTierConfig(recommendedTier).displayName} for unlimited releases.`
      }
    };
  }

  // Check track limit
  if (config.limits.tracks_per_year > 0 && (usage.tracks_this_year + trackCount) > config.limits.tracks_per_year) {
    const recommendedTier = getRecommendedLabelTier(usage.tier, usage);
    const savings = calculateLabelUpgradeSavings(usage.tier, recommendedTier, usage.total_earnings);

    return {
      allowed: false,
      reason: `Annual track limit would be exceeded (${usage.tracks_this_year + trackCount}/${config.limits.tracks_per_year})`,
      currentUsage: usage.tracks_this_year,
      limit: config.limits.tracks_per_year,
      upgradePrompt: {
        show: true,
        currentTier: config.displayName,
        recommendedTier: getLabelTierConfig(recommendedTier).displayName,
        recommendedTierKey: recommendedTier,
        savings: savings,
        message: `Adding this release would exceed your ${config.displayName} annual track limit. Upgrade to ${getLabelTierConfig(recommendedTier).displayName} for unlimited tracks.`
      }
    };
  }

  return {
    allowed: true,
    reason: 'Within release and track limits',
    currentUsage: {
      releases: usage.releases_this_year,
      tracks: usage.tracks_this_year
    },
    limit: {
      releases: config.limits.releases_per_year > 0 ? config.limits.releases_per_year : 'Unlimited',
      tracks: config.limits.tracks_per_year > 0 ? config.limits.tracks_per_year : 'Unlimited'
    }
  };
}

/**
 * Check if label can use Apollo Intelligence
 * @param {string} userId - Label admin user ID
 * @returns {Promise<object>} - { allowed: boolean, reason: string, upgradePrompt: object }
 */
export async function canUseApollo(userId) {
  const usage = await getLabelUsageStats(userId);
  const config = getLabelTierConfig(usage.tier);

  // Check Apollo query limit
  if (config.limits.apollo_queries_per_month > 0 && usage.apollo_queries_this_month >= config.limits.apollo_queries_per_month) {
    const recommendedTier = getRecommendedLabelTier(usage.tier, usage);

    return {
      allowed: false,
      reason: `Apollo query limit reached (${usage.apollo_queries_this_month}/${config.limits.apollo_queries_per_month})`,
      currentUsage: usage.apollo_queries_this_month,
      limit: config.limits.apollo_queries_per_month,
      upgradePrompt: {
        show: true,
        currentTier: config.displayName,
        recommendedTier: getLabelTierConfig(recommendedTier).displayName,
        recommendedTierKey: recommendedTier,
        message: `You've used all ${config.limits.apollo_queries_per_month} Apollo queries this month. Upgrade to ${getLabelTierConfig(recommendedTier).displayName} for ${getLabelTierConfig(recommendedTier).limits.apollo_queries_per_month} queries/month.`
      }
    };
  }

  return {
    allowed: true,
    reason: 'Within Apollo query limit',
    currentUsage: usage.apollo_queries_this_month,
    limit: config.limits.apollo_queries_per_month > 0 ? config.limits.apollo_queries_per_month : 'Unlimited'
  };
}

/**
 * Increment label artist count
 * @param {string} userId - Label admin user ID
 * @returns {Promise<object>} - Updated usage stats
 */
export async function incrementArtistCount(userId) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.rpc('increment_label_artist_count', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error incrementing artist count:', error);
    throw error;
  }

  return data;
}

/**
 * Decrement label artist count
 * @param {string} userId - Label admin user ID
 * @returns {Promise<object>} - Updated usage stats
 */
export async function decrementArtistCount(userId) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.rpc('decrement_label_artist_count', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error decrementing artist count:', error);
    throw error;
  }

  return data;
}

/**
 * Increment label release counters
 * @param {string} userId - Label admin user ID
 * @param {number} trackCount - Number of tracks in the release
 * @returns {Promise<object>} - Updated usage stats
 */
export async function incrementReleaseCounters(userId, trackCount = 0) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.rpc('increment_label_release_counters', {
    p_user_id: userId,
    p_track_count: trackCount
  });

  if (error) {
    console.error('Error incrementing release counters:', error);
    throw error;
  }

  return data;
}

/**
 * Increment label Apollo query counter
 * @param {string} userId - Label admin user ID
 * @returns {Promise<object>} - Updated usage stats
 */
export async function incrementApolloCounter(userId) {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.rpc('increment_label_apollo_counter', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error incrementing Apollo counter:', error);
    throw error;
  }

  return data;
}

/**
 * Get upgrade prompt data for label
 * @param {string} userId - Label admin user ID
 * @returns {Promise<object|null>} - Upgrade prompt data or null
 */
export async function getUpgradePrompt(userId) {
  const usage = await getLabelUsageStats(userId);
  const config = getLabelTierConfig(usage.tier);
  const recommendedTier = getRecommendedLabelTier(usage.tier, usage);

  if (!recommendedTier) {
    return null; // Already at highest tier or not close to limits
  }

  const savings = calculateLabelUpgradeSavings(usage.tier, recommendedTier, usage.total_earnings);
  const limits = checkLabelTierLimits(usage.tier, usage);

  if (!limits.exceeded && !savings.worthUpgrading) {
    return null; // Not exceeding limits and upgrade not worth it
  }

  return {
    show: true,
    currentTier: config.displayName,
    currentTierKey: usage.tier,
    recommendedTier: getLabelTierConfig(recommendedTier).displayName,
    recommendedTierKey: recommendedTier,
    savings: savings,
    usage: usage,
    limits: limits,
    message: limits.exceeded
      ? `You're exceeding your ${config.displayName} tier limits. Upgrade to ${getLabelTierConfig(recommendedTier).displayName} for more capacity and lower commission.`
      : `Based on your label's growth, upgrading to ${getLabelTierConfig(recommendedTier).displayName} could save you £${savings.netSavings.toFixed(2)}/year.`
  };
}

/**
 * Check if label should show upgrade prompt
 * @param {string} userId - Label admin user ID
 * @returns {Promise<boolean>} - True if should show upgrade prompt
 */
export async function shouldShowUpgradePrompt(userId) {
  const prompt = await getUpgradePrompt(userId);
  return prompt !== null;
}
